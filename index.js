const request = require('request');
const { config } = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');

//helper things to make loggin nice
const log = require('ololog').configure({
  time: true,
  locate: false,
  concat: { separator: '' },
  stringify: {
    pretty: true,
    fancy: true,
    maxArrayLength: 20,
    rightAlignKeys: false,
  },
});
require('ansicolor').nice;
//get ngrok domain if any
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
config.externalUrl = 'http://localhost:3000';
if (argv.ngrok != '') {
  config.externalUrl = argv.ngrok;
} else {
  log.bright.red.underline('use npm start to get ngrok domain');
}
app.use(bodyParser.json());

/**
 * Fetching a random Dadjoke
 *
 * @returns {string} the joke
 */
async function getDadJoke() {
  var options = {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'User-Agent': 'Demo app ' + config.externalUrl,
    },
  };
  var response = await axios.get('https://icanhazdadjoke.com/', options);
  log(response.data);
  return response.data.joke;
}

/**
 * Sending Text Message to a number
 * @param {*} number - who to send to  sender
 * @param {*} text - what do you want to send
 * @returns
 */
async function sendSMS(number, text) {
  var messageData = {
    from: config.from,
    to: [number],
    body: text,
    callback_url: config.externalUrl + '/deliveryReport',
    delivery_report: 'full',
  };

  var options = {
    method: 'POST',
    url:
      'https://us.sms.api.sinch.com/xms/v1/' +
      config.service_plan_id +
      '/batches',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer ' + config.token,
    },
    data: messageData,
  };

  var response = await axios.request(options);
  log('SMS Sent: '.bright.blue, response.data);
}

app.post('/incomingSMS', async function (req, res) {
  try {
    log('Incoming SMS: '.bright.blue, req.body);
    //var messageText = await getDadJoke();
    await sendSMS(req.body.from, 'You sent me: ' + req.body.body);
    res.status(200);
    res.end();
  } catch (error) {
    log(error);
  }
});

app.post('/deliveryReport', function (req, res) {
  log('Delivery report: '.bright.blue, req.body);
  res.status(200);
  res.end();
});

app.listen(config.port, () => {
  log(`Send an SMS to ${config.from}`.yellow);
});
