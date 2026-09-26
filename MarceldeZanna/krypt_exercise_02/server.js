const express = require('express');
const path = require('path');
const https = require('node:https');
const fs = require('node:fs')
// const helmet = require('helmet')

const app = express();
const port = 3000;
const httpsPort = 8000

//keys
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

//path for html
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', './index.html'));
});




//initalize https server
https.createServer(options, app).listen(httpsPort, () => {
  console.log('HTTPS-Server läuft auf https://localhost:8443');
});

//startet http server
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
