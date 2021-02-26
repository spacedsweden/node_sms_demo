const ngrok = require('ngrok');
const { config } = require('./config');
const nodemon = require('nodemon');
const clipboardy = require('clipboardy');
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
console.clear();
if (config.service_plan_id === undefined) {
  log.bright.red(
    'Not configured, you need to create a .env file with your credentials'
  );
  process.exit(0);
}
if (config.externalUrl === '') {
  var ngrokConfig = {
    port: config.port,
  };
  if (config.ngrokdomain != '') {
    ngrokConfig = {
      port: config.port,
      subdomain: config.ngrokdomain,
    };
  }
}
log;
ngrok.connect(ngrokConfig).then((url) => {
  log('Local inspector can be found at:' + 'http://localhost:4040');
  log(
    `Configure your callback to in the dashboard to: ` +
      `${url}/incomingSMS`.yellow
  );
  log(
    'Make sure to configure your callback url in the portal' +
      `\nhttps://dashboard.sinch.com/sms/api/rest/${config.service_plan_id}`
        .yellow.underline +
      '\nWe copied the url so you can just paste it in to callback url field at that page'
  );

  clipboardy.writeSync('${url}/incomingSMS');

  config.externalUrl = url;
  nodemon('-e "js json" index.js --ngrok ' + url);
});

nodemon
  .on('start', async () => {})
  .on('quit', async () => {
    log('killing app.js');
    config.externalUrl = '';
    await ngrok.kill();
  })
  .on('crash', function (e) {
    log('crash app.js'), e;
    config.externalUrl = '';
    ngrok.kill();
  })
  .on('restart', function (files) {
    log('App restarted due to: ', files);
  });
