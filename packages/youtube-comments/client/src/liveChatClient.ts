import ky from 'ky';

import { socketClient } from './socketClient'

// Logger
import debug from 'debug';
const log = debug('app:liveChatClient');

export class LiveChatClient {
  private videoId: string;
  private onChangeHandler: () => void;

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

  constructor(videoId?: string) {
    this.videoId = '';
    this.messages = [];
    this.onChangeHandler = () => { };

    if (!videoId) return;

    const validatedVideoId = this.validateVideoId(videoId);
    if (!validatedVideoId) return;

    this.videoId = validatedVideoId;
    this.init().catch(err=>log(err));
  }

  private async init() {
    const res = await ky.get(`/api/get-video-info?videoId=${this.videoId}`);
    const body = await res.json();
    if (!body) return console.error(new Error('動画情報の取得に失敗しました'));
    if (!body.isLive) return log('ライブ配信は終了しています');
    log('コメントの取得を開始します');
    socketClient.setHandler((data: {videoId: string, comments: any}) => {
      this.messages.push(...data.comments);
      this.onChangeHandler();
      return;
    });
    socketClient.getComment(this.videoId);
    return;
  }

  public validateVideoId(videoIdString: string): string | null {
    const urlRegex: RegExp = /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?<id>[a-zA-Z0-9_-]{11})/;
    const videoId = videoIdString.match(urlRegex)?.groups?.id;
    if (videoId) return videoId;
    const videoIdRegex = /[a-zA-Z0-9_-]{11}/;
    if (videoIdRegex.test(videoIdString)) return videoIdString;
    return null;
  }

  public onChange(handler: ()=>void) {
    this.onChangeHandler = handler;
  }
}
