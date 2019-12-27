import { google, youtube_v3 } from 'googleapis';
import debug from 'debug';

const log = debug('app:worker:getLiveMessage');

class GetLiveMessage{
  private timer: NodeJS.Timeout|null;
  private isLive: Boolean;
  private youtube: youtube_v3.Youtube;
  public videoId: string|null;
  private pageToken: string|null;
  constructor() {
    this.timer = null;
    this.isLive = false;
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_ACCESS_TOKEN,
    });
    this.videoId = null;
    this.pageToken = null;
  }

  /**
   * 配信コメント取得処理
   *
   * @param {{videoId: string}} { videoId } ライブ配信中のvideoId
   * @return {void}
   * @memberof GetLiveMessage
   */
  public run({ videoId }:{videoId: string}): void {
    this.videoId = videoId;
    this.timer = setInterval(() => {
      if (!this.isLive || !this.videoId) return this.stop();

      this.videoId
      log(Date());
      const params: {part: string, id: string, pageToken?: string} = {
        part: 'liveStreamingDetails',
        id: this.videoId,
      };
      if (this.pageToken) params.pageToken = this.pageToken;
      const res = this.youtube.videos.list(params);
      log(res);

      return;
    }, 1000);
    return;
  }

  /**
   * 配信のコメント取得処理を停止
   *
   * @return {void}
   * @memberof GetLiveMessage
   */
  public stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.videoId = null;
    return;
  }

  /**
   * 配信中かどうかのフラグを変更
   *
   * @param {Boolean} status 配信中なら true
   * @return {void}
   * @memberof GetLiveMessage
   */
  public updateBroadcastStatus(status: Boolean): void {
    this.isLive = status;
    return;
  }
}

export { GetLiveMessage };
