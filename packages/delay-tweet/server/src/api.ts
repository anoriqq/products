import { Router } from 'express';
import { wrap } from './utils';
import { tweet } from './logic';

const apiRouter = Router();

apiRouter.post('/tweet', wrap(async (req, res) => {
  const { user } = req;
  if (!user) return res.json({ok: false, error: 'require user'});
  const { text } = req.body;
  await tweet(user, text).catch(err => {
    return { ok: false, err };
  });
  return res.json({ok: true, text});
}));

export { apiRouter };
