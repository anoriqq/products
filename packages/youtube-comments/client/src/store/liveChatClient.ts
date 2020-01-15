// Logger
import debug from 'debug';
const log = debug('app:LiveChatClient')

// Packages
import ky from 'ky';
import io from 'socket.io-client';
import { uniqBy, sortBy, isEqual, dropWhile, sortedUniqBy, compact } from 'lodash';

class LiveChatClient implements App.LiveChatClient.Interface {
  state: App.LiveChatClient.State;
  constructor() {
    const fontSize = 64;
    const numberOfLanes = Math.floor(window.screen.height / fontSize) || 1;
    this.state = {
      videoId: undefined,
      socket: undefined,
      messages: [],
      displayedMessages: [],
      messageUpdateHandler: () => { },
      maxMessagesLength: 500,
      presetUsec: 10 * 1000 * 1000,
      flameoutUsec: 6 * 1000 * 1000,
      ticker: setInterval(this.tick(), 50),
      fontSize: 64,
      lanes: [...Array<App.LiveChatClient.Lane>(numberOfLanes)].map((lane: App.LiveChatClient.Lane, i: number) => ({
        lane: i,
        commentIds: [],
        sumOfWidth: 0,
      })),
      isEndQueue: [],
      clearLaneQueue: [],
    };
    this.connect(true);
  }

  private tick() {
    return () => {
      const _displayedMessages = [...this.state.displayedMessages];
      const presetTimeUsec = new Date().getTime() * 1000 - this.state.presetUsec;

      const sortedMessages = sortBy(<App.DisplayedMessage[]>[...this.state.displayedMessages, ...this.state.messages], ['timestampUsec']);
      const mergedMessages = uniqBy(sortedMessages, 'commentId');

      const initializedMessages = mergedMessages.filter(m => {
        if (!this.state.isEndQueue.includes(m.commentId)) return true;
        dropWhile(this.state.isEndQueue, id => { return id === m.commentId });
        return false;
      }).map(m => {
        const width = m.width === undefined ? 0 : m.width;
        const top = m.top === undefined ? 0 : m.top;
        return {
          ...m,
          width,
          top,
        };
      });

      const messages = initializedMessages.filter(m => (
        presetTimeUsec >= Number(m.timestampUsec || 0) // コメントの時間が実時間より大きくなったら
      ));

      if (isEqual(_displayedMessages, messages)) return;

      if (this.state.clearLaneQueue.length) {
        this.state.clearLaneQueue = compact(this.state.clearLaneQueue.map(q => {
          /** クリア対象のcommentIdが含まれるLane */
          const lane = this.state.lanes.filter(({ commentIds }) => commentIds.includes(q.commentId));
          if (!lane.length) return q;

          this.state.lanes = this.state.lanes.map(l => {
            if (!l.commentIds.includes(q.commentId)) return l;
            const sumOfWidth = (l.sumOfWidth - q.width) < 0 ? 0 : l.sumOfWidth - q.width;
            return {
              ...l,
              commentIds: sumOfWidth ? dropWhile(l.commentIds, id => id === q.commentId) : [],
              sumOfWidth,
            };
          });
          return;
        }));
      }

      this.state.displayedMessages = messages;
      this.state.messageUpdateHandler({ messages });
      return;
    }
  }

  /** 新しいvideoIdを指定してコメントの取得を開始する */
  public async listen({videoId, presetUsec, flameoutUsec}: App.LiveChatClient.ListenHandlerArgs) {
    log(`listen: ${videoId}`);
    if (this.state.videoId === videoId) return;
    this.state.videoId = videoId;
    const videoInfo = await this.getVideoInfo();
    if (!videoInfo) return console.error(new Error('Failed to getting video information.'));
    if (!videoInfo.isLive) return log('Already ended video streaming.');

    log('Start getting comments.');
    if (presetUsec) this.state.presetUsec = presetUsec;
    if (flameoutUsec) this.state.flameoutUsec = flameoutUsec;
    this.connect();
    this.getComment({videoId});
    return;
  }

  public setMessageUpdateHandler(handler: (args: App.LiveChatClient.MessageUpdateHandler) => void) {
    this.state.messageUpdateHandler = handler;
    return;
  }

  /** WebSocketを接続する */
  private connect(force: boolean = false) {
    if (!force || this.state.socket !== undefined) return;
    this.state.socket = io();
    this.state.socket.on('connect', () => log('Connection to comment server successfully.'));
    this.state.socket.on('disconnect', () => {
      log('Disconnected from comment server.');
      if (!this.state.videoId) return;
      log(`Attempt to reconnect to room of video id is ${this.state.videoId}.`);
      this.getComment({ videoId: this.state.videoId });
      return;
    });
    return;
  }

  /** videoIdを指定してコメントの取得を開始する */
  private getComment({videoId}: {videoId: string}) {
    if (this.state.socket === undefined) return new Error('No connection om WebSocket.');
    this.state.socket!.on('MESSAGE_UPDATE', (args: App.LiveChatClient.MessageUpdateHandler)=>this.pushMessage(args));
    this.state.socket!.emit('GET_COMMENT', { videoId });
    return;
  }

  /** Messagesを最新の状態に更新する */
  private pushMessage(args: App.LiveChatClient.MessageUpdateHandler) {
    let messages = sortedUniqBy(sortBy([...this.state.messages, ...args.messages], ['timestampUsec']), 'commentId');
    if (messages.length > this.state.maxMessagesLength) {
      messages.splice(0, messages.length - this.state.maxMessagesLength);
    }
    this.state.messages = messages;
    return;
  }

  /** video idっぽい文字列からvideo idを取り出す */
  public findVideoId(videoIdString: string) {
    const urlRegex: RegExp = /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?<id>[a-zA-Z0-9_-]{11})/;
    const videoId = videoIdString.match(urlRegex)?.groups?.id;
    if (videoId) return videoId;
    const videoIdRegex = /[a-zA-Z0-9_-]{11}/;
    if (videoIdRegex.test(videoIdString)) return videoIdString;
    return null;
  }

  /** 動画情報を取得する */
  public async getVideoInfo() {
    return await ky.get(`/api/get-video-info?videoId=${this.state.videoId}`).json<App.VideoInfo>();
  }

  public setWidth({commentId, width}: App.LiveChatClient.SetWidthArgs) {
    this.state.displayedMessages = this.state.displayedMessages.map(m => {
      if (m.commentId !== commentId) return m;
      const lane = this.pushToLane({ commentId, width });
      return {
        ...m,
        width,
        top: (lane * this.state.fontSize),
      };
    });
    return;
  }

  private pushToLane({ commentId, width }: { commentId: string, width: number }) {
    const laneToEnter = this.state.lanes.reduceRight((acc, cur) => {
      const minimumLane = acc.sumOfWidth < cur.sumOfWidth ? acc : cur;
      return minimumLane;
    });
    this.state.lanes = this.state.lanes.map(lane => {
      if (lane.lane !== laneToEnter.lane || lane.commentIds.includes(commentId)) return lane;
      return {
        ...lane,
        commentIds: [...lane.commentIds, commentId],
        sumOfWidth: lane.sumOfWidth + width,
      };
    });
    return laneToEnter.lane;
  }

  public clearLane({ commentId, width }: App.LiveChatClient.SetWidthArgs) {
    this.state.clearLaneQueue.push({commentId, width});
    return;
  }

  public setExited({ commentId, width }: App.LiveChatClient.SetWidthArgs) {
    this.state.isEndQueue.push(commentId);
    return;
  }
}

export const liveChatClient = new LiveChatClient();



// Declare types
export namespace App {
  export namespace LiveChatClient {
    export interface Interface {
      listen: (args: ListenHandlerArgs) => void;
      findVideoId: (videoIdString: string) => string | null;
      setMessageUpdateHandler: (args: (args: MessageUpdateHandler) => void) => void;
    }

    export interface State {
      videoId?: string;
      socket?: SocketIOClient.Socket;
      messages: Message[];
      displayedMessages: DisplayedMessage[];
      messageUpdateHandler: (args: MessageUpdateHandler) => void;
      maxMessagesLength: number;
      presetUsec: number;
      flameoutUsec: number;
      ticker: number;
      fontSize: number;
      lanes: Lane[];
      isEndQueue: string[];
      clearLaneQueue: {commentId: string, width: number}[];
    }

    export interface ListenHandlerArgs {
      videoId: string;
      presetUsec?: number;
      flameoutUsec?: number;
    }

    export interface MessageUpdateHandler {
      videoId?: string;
      socketId?: string;
      messages: DisplayedMessage[];
    }

    export interface SetWidthArgs {
      commentId: string;
      width: number;
    }

    export interface Lane {
      lane: number,
      commentIds: string[],
      sumOfWidth: number,
    }
  }

  export interface Message {
    videoId: string,
    commentId: string;
    text: string;
    authorName: string;
    timestampUsec: string;
    purchaseAmountText?: string;
    message: {
      runs: any[],
    },
    authorPhoto: {
      thumbnails: any[],
    },
    badgesInfo?: {
      owner?: any;
      verified?: any;
      moderator?: any;
      member?: any;
    },
  }

  export interface DisplayedMessage extends Message{
    width: number;
    top: number;
  }

  export interface VideoInfo {
    videoId: string;
    isLive: boolean;
    continuation?: string;
  }
}
