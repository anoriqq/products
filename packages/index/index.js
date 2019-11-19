const path = require('path');
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => { res.status(200).send({ ok: true }); });
require('http').createServer(app).listen(8000, '0.0.0.0', () => {
  return console.log('Listening on http://0.0.0.0:8000');
});
