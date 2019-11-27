import {Router} from 'express';
import debug from 'debug';

const router = Router();
const log = debug('app:router');

router.get('/', (req, res, next) => {
  return res.render('index');
});

router.get('/api', (req, res, next) => {
  return res.end();
});

export {router};
