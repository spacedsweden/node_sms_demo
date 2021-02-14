const request = require('request');
const { config } = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

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
 * Sending Text Message to a number
 * @param {*} number - who to send to  sender
 * @param {*} text - what do you want to send
 * @returns
 */
function sendSMS(number, text) {
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
    body: JSON.stringify(messageData),
  };

  request(options, function (error, response, body) {
    log('Incoming SMS: '.bright.blue, JSON.parse(body));
    if (error) throw new Error(error);
  });
}

app.post('/incomingSMS', function (req, res) {
  log('Incoming SMS: '.bright.blue, req.body);
  if (req.body) {
    sendSMS(req.body.from, 'You send me:' + req.body.body);
  }
  res.status(200);
  res.end();
});

app.post('/deliveryReport', function (req, res) {
  log('Delivery report: ' + JSON.stringify(req.body, null, 4));
  res.status(200);
  res.end();
});

app.listen(config.port, () => {
  log(`Send an SMS to ${config.from}`);
});
