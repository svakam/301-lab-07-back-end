'use strict';

// server build
const express = require('express');
require('dotenv').config();
const cors = require('cors');

// allows us to interact with APIs
const superagent = require('superagent');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// globals
const errorMessage = {
  status: 500,
  responseText: 'Sorry, something went wrong',
};

app.get('/location', (request, response) => {
  try {
    let city = request.query.data;
    searchLatLong(city, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

app.get('/weather', (request, response) => {
  try {
    let city = request.query.data;
    dailyWeather(city, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

let searchLatLong = (city, response) => {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url)
    .then(request => {
      let locationOb = new Location(city, request.body.results[0]);
      response.send(locationOb);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });

  function Location(city, address) {
    // eslint-disable-next-line camelcase
    this.search_query = city;
    // eslint-disable-next-line camelcase
    this.formatted_query = address.formatted_address;
    this.latitude = address.geometry.location.lat;
    this.longitude = address.geometry.location.lng;
  }
};

let dailyWeather = (city, response) => {
  let latitude = city.latitude;
  let longitude = city.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`;

  superagent.get(url)
    .then(request => {
      let dailyData = request.body.daily.data;
      let timeSummary = dailyData.map(day => new Forecast(day));
      response.send(timeSummary);
    })
    .catch(error => {
      console.error(error);
      response.status(500).send(errorMessage);
    });

  function Forecast(day) {
    this.forecast = day.summary;
    this.time = day.time;
  }
};

app.get('*', (request, response) => {
  response.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
