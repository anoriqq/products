import { EventEmitter } from 'events';
import { google, youtube_v3} from 'googleapis';
import { isEmpty, head } from 'lodash';
import debug from 'debug';
import { liveInfo } from '@t/liveInfo';

const log = debug('app:worker:broadcastStatus');

class BroadcastStatus extends EventEmitter{
  private timer: NodeJS.Timeout | null;
  private isLive: Boolean;
  private youtube: youtube_v3.Youtube;
  constructor() {
    super();
    this.timer = null;
    this.isLive = false;
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_ACCESS_TOKEN,
    });
  }

  public async run() {
    // this.timer = setInterval(async () => {
    //   try {
    //     const res = await this.youtube.search.list({
    //       part: 'snippet',
    //       type: 'video',
    //       eventType: 'live',
    //       channelId: process.env.YOUTUBE_CHANNEL_ID,
    //     });
    //     log(res.data.items);

    //     const data: liveInfo = {
    //       isLive: !isEmpty(res.data.items),
    //     };
    //     if(data.isLive){
    //       data.videoId = head(res.data.items)?.id?.videoId;
    //     };
    //     if (data.isLive === this.isLive) return;
    //     this.isLive = data.isLive;
    //     this.emit('updateStatus', data);
    //     return;
    //   } catch (err) {
    //     log(err);
    //     if(err.message.includes('quota')) log('リクエストクォータ超過');
    //   }
    // }, 60 * 1000);
    return;
  }

  public stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    return;
  }
}

export { BroadcastStatus };
