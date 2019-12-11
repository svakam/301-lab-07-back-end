'use strict';

// server build
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// globals
const geoData = require('./data/geo.json');
const addressComponents = geoData.results[0].address_components[0];
const errorMessage = {
  status: 500,
  responseText: 'Sorry, something went wrong',
};

app.get('/location', (request, response) => {
  try {
    let city = request.query.data;

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
  try {
    let city = request.query.data;

    if (city.toLowerCase() !== addressComponents.long_name.toLowerCase() || city !== addressComponents.short_name.toLowerCase()) {
      response.status(500).send(errorMessage);
    }
    else {
      let dailyForecastForCity = dailyWeather();
      response.send(dailyForecastForCity);
    }
  }
  catch (error) {
    console.error(error);

    response.status(500).send(errorMessage);
  }
});

let dailyWeather = () => {
  const weatherData = require('./data/darksky.json');

  const dailyData = weatherData.daily.data;

  let summary;
  let time;
  // let dailyArray = [];
  dailyData.map(day => {
    const pairData = Object.entries(day);
    pairData.forEach((pair) => {
      pair.forEach((element) => {
        if (element === 'time') {
          time = pair[1];
        }
        if (element === 'summary') {
          summary = pair[1];
        }
      });
    });

    let eachDay = new Forecast(summary, time);
    return eachDay;
  });
  return dailyData;
};

function Forecast(summary, time) {
  this.forecast = summary;
  this.time = time;
}

app.get('*', (request, response) => {
  response.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

