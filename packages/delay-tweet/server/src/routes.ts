import { Router } from 'express';
import { apiRouter } from './api';
import { authRouter } from './auth';

const router = Router();

router.get('/', (req, res, next) => {
  return res.render('index', {
    title: 'Delay Tweet',
  });
});

router.use('/auth', authRouter);
router.use('/api', apiRouter);

export {router};
