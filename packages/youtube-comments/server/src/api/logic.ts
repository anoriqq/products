import got from 'got';
import debug from 'debug';

import { Video } from '../models/video';
import { workerGettingComment } from '../worker';

const log = debug('app:api:logic');

async function getVideoInfo(videoId: string) {
  const doc = await Video.findOne({videoId});
  if (doc && doc.isLive === false) return { videoId, isLive: false };

  const { continuation } = await getContinuations(videoId);
  if (!continuation) {
    const uq = { videoId, isLive: false };
    await Video.findOneAndUpdate({ videoId }, uq, { upsert: true });
    return uq;
  } else {
    const uq = { videoId, isLive: true, continuation};
    await Video.findOneAndUpdate({ videoId }, uq, { upsert: true });
    workerGettingComment.updateVideos();
    return uq;
  }
}

async function getContinuations(videoId: string): Promise<{videoId: string, continuation?: string}> {
  const UA = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'};
  const url = `https://www.youtube.com/live_chat?v=${videoId}`;
  const { body } = await got.get(url, {headers: UA});
  const regex = /(?<="continuation":")([\d\w-_%]+)(?=")/g;
  const continuations = body.match(regex);
  if (!continuations) return { videoId };

  const continuation = continuations[1];
  return { videoId, continuation };
}

export { getVideoInfo };
