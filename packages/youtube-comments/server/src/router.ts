import { Router } from 'express';
import { api } from './api/router';

const router = Router();

router.use('/api', api);

router.get('/', (req, res, next) => {
  return res.render('index', {title: 'Hello World!'});
});

export { router };
