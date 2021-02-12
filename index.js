const request = require('request');
const { config } = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//get ngrok domain if any
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
config.externalUrl = 'http://localhost:3000';
if (argv.ngrok != '') {
  config.externalUrl = argv.ngrok;
  console.log('Will use ' + config.externalUrl + ' as callback');
} else {
  console.log('use npm start to get ngrok domain');
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
    delivery_report: 'per_recipient',
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
    if (error) throw new Error(error);
    console.log('Message sent: ' + body);
  });
}

app.post('/incomingSMS', function (req, res) {
  console.log('Incoming SMS: ' + req.body);
  if (req.body) {
    sendSMS(req.body.from, 'You send me: ' + req.body.body);
  }
  res.status(200);
  res.end();
});

app.post('/deliveryReport', function (req, res) {
  console.log('Delivery report: ' + JSON.stringify(req.body));

  res.status(200);
  res.end();
});

app.listen(config.port, () => {
  console.log(`Listening at http://localhost:${config.port}`);
});
