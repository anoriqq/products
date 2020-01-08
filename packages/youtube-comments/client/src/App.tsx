// Logger
import debug from 'debug';
const log = debug('app:App');

// Packages
import React, { Component } from 'react';
import { uniqBy } from 'lodash';

// Modules
import { LiveChatClient, Message } from './liveChatClient';
import { Comments } from './components/Comments';
import { Control } from './components/Control';

export class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.videoIdString = this.videoIdString.bind(this);
    this.setVideo = this.setVideo.bind(this);
    this.tick = this.tick.bind(this);
    this.filterMessages = this.filterMessages.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setExited = this.setExited.bind(this);

    this.state = {
      videoIdString: '',
      messages: [],
      presetUsec: -20 * 1000 * 1000, // この時間だけ実コメント時刻から遅れて画面に入る
      presetFlameoutUsec: 5 * 1000 * 1000, // この時間だけ画面に表示される
      currentTimeUsec: 0,
      presetTimeUsec: 0,
      timer: setInterval(this.tick, 100),
    };
  }

  private tick() {
    this.setState({
      currentTimeUsec: new Date().getTime() * 1000,
      presetTimeUsec: this.state.currentTimeUsec + this.state.presetUsec,
    });
    return;
  }

  private videoIdString(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ videoIdString: e.target.value });
    return;
  }

  private setVideo(e: React.MouseEvent) {
    e.preventDefault();
    const liveChatClient =  new LiveChatClient(this.state.videoIdString);
    liveChatClient.onChange((messages) => {
      this.setState(state=>({
        messages: uniqBy(Array<Message>().concat(state.messages, messages), 'commentId'),
      }));
      if (this.state.messages.length < 1000) return;
      this.setState(state=>({
        messages: state.messages.splice(0, state.messages.length - 1000),
      }));
      return;
    });
    return;
  }

  private setPosition({ commentId, width, top }: { commentId: string, width: number, top: number }) {
    this.setState(state=>({
      messages: state.messages.map(message => {
        if (message.commentId !== commentId) return message;
        return {
          ...message,
          width,
          top,
        }
      }),
    }));
  }

  private setExited(id: string) {
    this.setState(state=>({
      messages: Array.from<MessageExtend, MessageExtend>(state.messages, msg => {
        if (msg.commentId !== id) return msg;
        return Object.assign<{}, MessageExtend, {isEnd: boolean}>({}, msg, {isEnd: true});
      }),
    }));
  }

  private filterMessages() {
    return uniqBy(this.state.messages.filter(message =>
      (!message.isEnd) &&
      (this.state.presetTimeUsec >= Number(message.timestampUsec)) &&
      (this.state.presetTimeUsec <= Number(message.timestampUsec) + (this.state.presetFlameoutUsec * 2))
    ), 'commentId').map(message => {
      message.isDisplay = false;
      message.isEnd = false;
      return message;
    });
  }

  public render() {
    return (
      <>
        <Comments
          messages={this.filterMessages()}
          presetFlameoutUsec={this.state.presetFlameoutUsec}
          setPosition={this.setPosition}
          setExited={this.setExited}
        />
        <Control
          setVideo={this.setVideo}
          videoIdString={this.videoIdString}
        />
      </>
    )
  }
}

export interface State {
  videoIdString: string,
  messages: MessageExtend[],
  presetUsec: number,
  presetFlameoutUsec: number,
  currentTimeUsec: number,
  presetTimeUsec: number,
  timer: number,
}

export interface MessageExtend extends Message {
  isDisplay?: boolean,
  isEnd?: boolean,
  width?: number,
  top?: number,
}