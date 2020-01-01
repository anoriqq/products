import React, { Component } from 'react';
import { LiveChatClient } from './liveChatClient';
import { Comments } from './Comments';

// Logger
import debug from 'debug';
const log = debug('app:component');

export class App extends Component<{}, {messages: any[]}> {
  private videoIdString: string;

  constructor(props: {}) {
    super(props);
    this.videoIdString = '';
    this.state = { messages: [] };

    this.setVideo = this.setVideo.bind(this);
  }

  private setVideo(e: React.MouseEvent) {
    e.preventDefault();
    const liveChatClient =  new LiveChatClient(this.videoIdString);
    liveChatClient.onChange(() => {
      this.setState(state => ({
        messages: liveChatClient.messages,
      }))
    });
    return;
  }

  public render() {
    return (
      <div>
        <div>hello wold</div>
        <p>
          <input type="text" placeholder='動画のIDまたはURL' onChange={e=>{this.videoIdString = e.target.value}}/>
          <button onClick={this.setVideo}>get comments</button>
        </p>
        <Comments messages={this.state.messages}/>
      </div>
    )
  }
}
