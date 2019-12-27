import http from 'http';
import express from 'express';
import helmet from 'helmet';
import debug from 'debug';
import morgan from 'morgan';

import { router } from './router';
import * as worker from './worker';

// Logger
const log = debug('server');
const requestLogger = debug('request');

// App setup
const app = express();
app.set('name', 'niji-timestamp');
app.set('port', process.env.PORT || 8000);
app.set('view engine', 'pug');
app.set('views', `${process.env.PRODUCT_DIR}/server/view`);

// Middleware
app.use(helmet());
app.use(morgan('dev', {stream: {write: msg => requestLogger(msg.trimEnd())}}));
app.use(express.static(`${process.env.PRODUCT_DIR}/client/public`));
app.use(express.static(`${process.env.PRODUCT_DIR}/client/dist`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
app.use(router);

// Worker
worker.run();

// Listen
http.createServer(app).listen(app.get('port'), '0.0.0.0', () => {
  return log(`${app.get('name')} server is listening on ${app.get('port')}`);
});
