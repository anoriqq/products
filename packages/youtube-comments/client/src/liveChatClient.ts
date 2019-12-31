import ky from 'ky';
import debug from 'debug';

const log = debug('app:liveChatClient');

class LiveChatClient {
  private videoId: string;
  public messages: {
    text: string,
    authorName: string,
    timestampUsec: string,
    purchaseAmountText?: string,
    badgesInfo?: {
      owner?: any,
      verified?: any,
      moderator?: any,
      member?: any,
    },
  }[];

  constructor(videoId: string) {
    this.videoId = videoId;
    this.messages = [];
    this.init().catch(err=>log(err));
  }

  private async init() {
    const res = await ky.get(`/api/get-video-info?videoId=${this.videoId}`);
    const body = await res.json();
    if (!body) return console.error(new Error('動画情報の取得に失敗しました'));
    if (!body.isLive) return log('ライブ配信は終了しています');
    // TODO ここでwsつなげる
    return;
  }
}

export { LiveChatClient };
