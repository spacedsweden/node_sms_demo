# Send sms node demo

Sample node app to showcase the sending and recieving sms.

## Prerequisites

- Sinch account with a phonenumber and some credits https://sinch.com/signup
- Node.js installed

Installation:

```shell
git clone https://github.com/spacedsweden/node_sms_demo
npm install

```

Before you can use this out of the box you need a to gather your account details from the [Dashboard](https://dashboard.sinch.com/sms/api)
Open the .env.demo file and fill out the information from the dashboard, save the file as `.env` this ensures that if you share a github repo with a customer your credentials will not ship up to github if you push changes to that repo.

```shell
FROM=[repace with phonenumber/senderid for you sms service]
SERVICE_PLAN_ID=[serviceplan id for rest  https://dashboard.sinch.com/sms/api/rest]
TOKEN=[serviceplan id for rest  https://dashboard.sinch.com/sms/api/rest]
PORT=3000
NGROK_DOMAIN=
```

Now you are ready to test it out

```shell
npn start
```

Take note of the callback url,

Open NGROK inspector <http://localhost:4040/inspect/http> and send an SMS to the number you specified in From.

## Key parts of the code

- `index.js` - contains all sms code
- `local.js` - covers the npm start code to automaticly set up ngrok and node mon.

## Change default reply

The static reply that echos back what you sent it is pretty boring, lets reply with a joke instead.

Open `index.js' and find below in the in incomingSMS and add getDadJoke

original

```javascript
app.post('/incomingSMS', async function (req, res) {
  log('Incoming SMS: '.bright.blue, req.body);
  if (req.body) {
    sendSMS(req.body.from, 'You send me:' + req.body.body);
  }
  res.status(200);
  res.end();
});
```

After changes

```javascript
app.post('/incomingSMS', async function (req, res) {
  try {
    log('Incoming SMS: '.bright.blue, req.body);
    var messageText = await getDadJoke();
    sendSMS(req.body.from, messageText);
    res.status(200);
    res.end();
  } catch (error) {
    log(error);
  }
});
```

Next up you need to create your getDadJoke function and for this excercise you will use the awesome <https://icanhazdadjoke.com/> api.

```javascript
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
```

Now send an sms to your phonenumber listed in the console and have a laugh
