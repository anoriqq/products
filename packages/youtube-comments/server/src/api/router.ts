import { Router, Request, Response, json } from 'express';
import debug from 'debug';
import { wrap } from '../utils';
import { getVideoInfo } from './logic';

const log = debug('app:api:router');
const api = Router();

api.get('/get-video-info', wrap(async (req, res) => {
  const { videoId } = req.query;
  const videoInfo = await getVideoInfo(videoId);
  log({videoId: videoInfo.videoId});
  return res.json(videoInfo);
}));

export { api };
