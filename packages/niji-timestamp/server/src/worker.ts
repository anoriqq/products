import debug from 'debug';

import { liveInfo } from '@t/liveInfo';

import { BroadcastStatus } from './broadcastStatus';
import { GetLiveMessage } from './getLiveMessage';

const log = debug('app:worker');

const run = () => {
  const getLiveMessage = new GetLiveMessage();
  const broadcastStatus = new BroadcastStatus();

  broadcastStatus.on('updateStatus', (data: liveInfo) => {
    getLiveMessage.updateBroadcastStatus(data.isLive);
    log(`update status to ${data.isLive}. ${data.isLive ? 'videoId: ' + data.videoId : ''}`);

    if (data.isLive && data.videoId) {
      // コメント取得待機開始
      return getLiveMessage.run({videoId: data.videoId});
    } else {
      // コメント取得停止
      return getLiveMessage.stop();
    }
  });

  // ライブ状態監視開始
  broadcastStatus.run();

  return;
};

export { run };
