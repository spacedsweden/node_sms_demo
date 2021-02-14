# Send sms node demo

Sample node app to showcase the sending and recieving sms.

To use:

```shell
git clone https://github.com/spacedsweden/node_sms_demo
npm install

```

Before you can use this out of the box you need a few pieces of information from your [Dashboard](https://dashboard.sinch.com/sms/api)
Open the .enc.demo file and fill out the information from the dashboard, save the file as .env this ensures that if you share a github repo with a customer your credentials will not ship up to github if you push changes to that repo.

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

index.js - contains all sms code
local.js - covers the npm start code to automaticly set up ngrok and node mon.

## Chaning the default reply

Open `index.js'
