const ngrok = require('ngrok');
const { config } = require('./config');
const nodemon = require('nodemon');
console.clear();
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

ngrok.connect(ngrokConfig).then((url) => {
  console.log(`Server now available at ${url}`);
  config.externalUrl = url;
  nodemon('-e "js json" index.js --ngrok ' + url);
});

nodemon
  .on('start', async () => {
    console.log('index.js just started');
  })
  .on('quit', async () => {
    console.log('killing app.js');
    config.externalUrl = '';
    await ngrok.kill();
  })
  .on('crash', function () {
    console.log('crash app.js');
    config.externalUrl = '';
    ngrok.kill();
  })
  .on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });
