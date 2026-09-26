const express = require('express');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');

const app = express();
const httpPort = 3000;
const httpsPort = 3001;

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

app.use((req, res, next) => {
  if (req.protocol === 'http') {
    return res.redirect(301, `https://${req.hostname}:${httpsPort}${req.url}`);
  }
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  })
);

app.get('/', (req, res) => {
  res.send('<h1>Hallo</h1>');
});

https.createServer(options, app).listen(httpsPort, () => {
  console.log(`HTTPS läuft auf https://localhost:${httpsPort}`);
});

app.listen(httpPort, () => {
  console.log(`HTTP läuft auf http://localhost:${httpPort}`);
});