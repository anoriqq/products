const http = require('http');
const express = require('express');
const app = express();
app.get('/', (req, res, next) => {
  return res.status(200).send({ok: true});
});
const server = http.createServer(app);
server.listen(8000, '0.0.0.0', () => {
  return console.log('Listening on http://0.0.0.0:8000');
});
