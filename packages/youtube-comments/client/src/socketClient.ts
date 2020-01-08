import io from 'socket.io-client';

// Logger
import debug from 'debug';
const log = debug('app:socketClient')

class SocketClient {
  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io();
    this.socket.on('connect', () => log('connect'));
    this.socket.on('disconnect', () => log('disconnect'));
    this.socket.on('END_LIVE', ({videoId}: {videoId: string}) => log(`${videoId}のライブ配信が終了しました`));
  }

  public startGettingComment(videoId: string) {
    this.socket.emit('GET_COMMENT', {videoId});
  }

  public setCommentUpdateHandler(handler: (data: {videoId: string, comments: any}) => void) {
    this.socket.off('COMMENT_UPDATE');
    this.socket.on('COMMENT_UPDATE', handler);
  }

  public setEndLiveHandler(handler: (data: {videoId: string}) => void) {
    this.socket.off('END_LIVE');
    this.socket.on('END_LIVE', handler);
  }

  public setReconnectVideoId(videoId: string) {
    this.socket.off('disconnect');
    this.socket.on('disconnect', () => {
      this.startGettingComment(videoId);
    });
  }
}

export const socketClient = new SocketClient();
