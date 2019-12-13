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
    const city = request.query.data;

    searchLatLong(city, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

let searchLatLong = (city, response) => {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(request => {
      const locationOb = new Location(city, request.body.results[0]);
      response.send(locationOb);
    })
    .catch(error => {
      console.log(error);
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

app.get('/weather', (request, response) => {
  try {
    let city = request.query.data;
    dailyWeather(city, response);
  }
  catch (error) {
    console.log(errorMessage);
    response.status(500).send(errorMessage);
  }
});

let dailyWeather = (city, response) => {
  let latitude = city.latitude;
  let longitude = city.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`;

  return superagent.get(url)
    .then(request => {
      const dailyData = request.body.daily.data;
      let timeSummary = dailyData.map(day => new Forecast(day));
      response.send(timeSummary);
    })
    .catch(error => console.error(error));

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
