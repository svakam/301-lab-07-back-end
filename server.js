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

// error
const errorMessage = {
  status: 500,
  responseText: 'Sorry, something went wrong',
};

// routes
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

app.get('/events', (request, response) => {
  try {
    let locationObject = request.query.data;
    eventFinder(locationObject, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send(errorMessage);
  }
});

// retrieve from APIs
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
    let date = new Date(day.time * 1000);
    this.time = date.toDateString(); // converts numbers to day
  }
};

let eventFinder = (locationObject, response) => {
  let url = `http://api.eventful.com/json/events/search?location=${locationObject.search_query}&app_key=${process.env.EVENTFUL_API_KEY}`;

  superagent.get(url)
    .then(results => {
      let eventsArr = JSON.parse(results.text).events.event;
      const finalEventsArr = eventsArr.map(event => new Event(event));

      response.send(finalEventsArr);
    });

  function Event(eventData) {
    this.link = eventData.url;
    this.name = eventData.title;
    // eslint-disable-next-line camelcase
    this.event_date = eventData.start_time;
    this.summary = eventData.description;
  }
};

// 404
app.get('*', (request, response) => {
  response.status(404).send('Page not found');
});

// console test port up
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
