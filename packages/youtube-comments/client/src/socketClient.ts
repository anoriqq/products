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
  }

  public getComment(videoId: string) {
    this.socket.emit('GET_COMMENT', {videoId});
  }

  public setHandler(handler: (data: {videoId: string, comments: any}) => void) {
    this.socket.off('COMMENT_UPDATE');
    this.socket.on('COMMENT_UPDATE', handler);
  }
}

export const socketClient = new SocketClient();
