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

async function makeCallout(number, text) {
  var postData = {
    method: 'ttsCallout',
    ttsCallout: {
      cli: '+14158544063',
      destination: { type: 'number', endpoint: number },
      domain: 'pstn',
      custom: 'customData',
      locale: 'en-US',
      text: text,
    },
  };

  var options = {
    method: 'POST',
    url: 'https://calling.api.sinch.com/calling/v1/callouts',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    auth: {
      username: 'application\\' + config.voiceKey,
      password: config.voiceSecret,
    },
    data: postData,
  };
  var response = await axios.request(options);
  log('Callout made Sent: '.bright.blue, response.data);
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
    var messageText = await getDadJoke();
    await sendSMS(req.body.from, messageText);
    //  await makeCallout(req.body.from, messageText);
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

app.post('/incomingCall', function (req, res) {
  if (req.body.event == 'ice') {
    //+1 415-854-4063
    var data = {
      action: {
        name: 'RunMenu',
        enableVoice: true,
        locale: 'en-US',
        barge: true,
        mainMenu: 'main',
        menus: [
          {
            id: 'main',
            mainPrompt:
              '#tts[Welcome to the conference menu. enter say or press 1 or 0.',
            repeatPrompt: 'Come on, one or zero',
            options: [
              {
                dtmf: '1',
                action: 'return(sub2)',
              },
              {
                dtmf: '0',
                action: 'menu(sub)',
              },
            ],
          },
          {
            id: 'sub2',
            mainPrompt:
              '#tts[Welcome to the sub menu 2. Enter your 4-digit PIN.]',
            repeatPrompt: '#tts[Enter your 4-digit PIN.]',
            repeats: 3,
            maxDigits: 4,
          },
          {
            id: 'sub',
            mainPrompt:
              '#tts[Welcome to the sub menu. Enter your 4-digit PIN.]',
            repeatPrompt: '#tts[Enter your 4-digit PIN.]',
            repeats: 3,
            maxDigits: 4,
          },
        ],
      },
    };
    log('incoming call report: '.bright.blue, req.body);
    res.json(data);
    res.status(200);
    res.end();
  } else if (req.body.event == 'pie') {
    log('PIE event: '.bright.blue, req.body);
    var response = {};
    if (req.body.menuResult.value == '1234') {
      response = {
        action: {
          name: 'ConnectConf',
          conferenceId: 'myConference',
          moh: 'ring',
        },
      };
    } else {
      console.log(req.body.menuResult);
      response = {
        instructions: [
          {
            name: 'Say',
            text: 'Wrong code, bye',
            locale: 'en-US',
          },
        ],
        action: {
          name: 'hangup',
        },
      };
    }
    res.json(response);
    res.status(200);
    res.end();
  } else {
    log('other event: '.bright.blue, req.body);
    res.status(200);
    res.end();
  }
});

app.listen(config.port, () => {
  log(`Send an SMS to ${config.from}`.yellow);
});
