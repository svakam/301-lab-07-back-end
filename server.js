'use strict';

// server build
const express = require('express');
require('dotenv').config();
const cors = require('cors');

// allows us to interact with APIs
const superagent = require('superagent');

const app = express();
const geoData = require('./data/geo.json');
const addressComponents = geoData.results[0].address_components[0];
app.use(cors());
const PORT = process.env.PORT || 3001;

// globals
const errorMessage = {
  status: 500,
  responseText: 'Sorry, something went wrong',
};

app.get('/location', (request, response) => {
  console.log('i am in location');
  try {
    console.log('i am in location try');
    // // testing only - remove after deployment
    // let city = 'Lynnwood';

    const city = request.query.data;

    if (city.toLowerCase() !== addressComponents.long_name.toLowerCase() || city !== addressComponents.short_name.toLowerCase()) {
      response.status(500).send(errorMessage);
    }

    else {
      let locationObject = searchLatLong(city);

      response.send(locationObject);
    }
  }
  catch (error) {
    console.error(error);

    response.status(500).send(errorMessage);
  }
});

let searchLatLong = city => {
  let resultsNav = geoData.results[0];

  const latLongObj = new Location(city, resultsNav);
  console.log('hi');
  return latLongObj;
};

function Location(city, resultsNav) {
  // eslint-disable-next-line camelcase
  this.search_query = city;
  // eslint-disable-next-line camelcase
  this.formatted_query = resultsNav.formatted_address;
  this.latitude = resultsNav.geometry.location.lat;
  this.longitude = resultsNav.geometry.location.lng;
}

app.get('/weather', (request, response) => {
  const city = request.query.data;
  if (city.toLowerCase() !== addressComponents.long_name.toLowerCase() || city !== addressComponents.short_name.toLowerCase()) {
    response.status(500).send(errorMessage);
  }
  else {
    let timeSummaryData = dailyWeather();
    response.send(timeSummaryData);
  }
});

function Forecast(day) {
  this.forecast = day.summary;
  this.time = day.time;
}

let dailyWeather = () => {
  const weatherData = require('./data/darksky.json');
  const dailyData = weatherData.daily.data;

  let timeSummary = dailyData.map(day => {
    return new Forecast(day);
  });
  return timeSummary;
};

app.get('*', (request, response) => {
  response.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
