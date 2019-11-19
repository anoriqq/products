import express from 'express';
import debug from 'debug';
import helmet from 'helmet';
import morgan from 'morgan';
import {router} from './routes';
import {embedBundlePathToLocals, serverError, notFoundError} from './middleware';
import {createServer} from 'http';

// Logger
const log = debug('app:log');
const requestLogger = debug('request');

const app = express();

// App setup
app.set('name', 'delay-tweet');
app.set('port', process.env.PORT || 8000);
app.set('view engine', 'pug');
app.set('views', `${process.env.WORKDIR}/src/view`)

// Middleware setup
app.use(helmet());
app.use(morgan('dev', {stream: {write: msg => requestLogger(msg.trimEnd())}}));
app.use(express.static(`${process.env.WORKDIR}/dist`));
app.use(embedBundlePathToLocals);

// Router setup
app.use(router);

// Error handler setup
app.use(notFoundError);
app.use(serverError);

// Create and listen server
const server = createServer(app);
server.listen(8000, '0.0.0.0', () => {
  log(`${app.get('name')} server is listening on port ${app.get('port')}`);
});
