require('dotenv').config();

const config = {
  from: process.env.FROM,
  service_plan_id: process.env.SERVICE_PLAN_ID,
  token: process.env.TOKEN,
  port: 3030,
  ngrokdomain: process.env.NGROK_DOMAIN, //if you have a paid account you can set  ngrok subdomain here
  externalUrl: '', //leaveblank, will be overwritten by ngrok start
};

module.exports = {
  config,
};
