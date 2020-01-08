// Logger
import debug from 'debug';
const log = debug('app:comments');

// Packages
import React, { Component } from 'react';

// Modules
import { Comment } from './Comment';
import { MessageExtend } from '../App';

export class Comments extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.setWidth = this.setWidth.bind(this);
    this.setExited = this.setExited.bind(this);

    const fontSize = 64;
    const numberOfLanes = Math.floor(window.screen.height / fontSize) || 1;
    this.state = {
      fontSize,
      lanes: [...Array<Lane>(numberOfLanes)].map((lane: Lane, i: number) => ({
        lane: i,
        lastAddedCommentId: undefined,
        lastAddedCommentTimestampUsec: Number.POSITIVE_INFINITY,
      })),
    };
  }

  private async setCommentToLane({ commentId, timestampUsec }: { commentId: string, timestampUsec: string }) {
    return new Promise<number>(resolve => {
      const minimumLane: Lane = this.state.lanes.reduce((acc, cur) => {
        if (Math.min(acc.lastAddedCommentTimestampUsec, cur.lastAddedCommentTimestampUsec) === Number.POSITIVE_INFINITY) {
          return acc.lane < cur.lane ? acc : cur;
        }
        if (Math.max(acc.lastAddedCommentTimestampUsec, cur.lastAddedCommentTimestampUsec) === Number.POSITIVE_INFINITY) {
          return acc.lastAddedCommentTimestampUsec > cur.lastAddedCommentTimestampUsec ? acc : cur;
        }
        return acc.lastAddedCommentTimestampUsec < cur.lastAddedCommentTimestampUsec ? acc : cur;
      });
      this.setState(state => ({
        lanes: state.lanes.map(lane => {
          if (lane.lane !== minimumLane.lane) return lane;
          return {
            ...lane,
            lastAddedCommentId: commentId,
            lastAddedCommentTimestampUsec: Number(timestampUsec),
          };
        }),
      }), () => resolve(minimumLane.lane));
    });
  }

  private deleteCommentFromLane(id: string) {
    if (!this.state.lanes.some(lane => { return lane.lastAddedCommentId === id })) return;
    this.setState(state => ({
      lanes: state.lanes.map(lane => {
        if (lane.lastAddedCommentId !== id) return lane;
        return {
          ...lane,
          lastAddedCommentId: undefined,
          lastAddedCommentTimestampUsec: Number.POSITIVE_INFINITY,
        };
      }),
    }));
    return;
  }

  private async setWidth({ commentId, width, timestampUsec }: {commentId: string, width: number, timestampUsec: string}) {
    const lane = await this.setCommentToLane({commentId, timestampUsec});
    this.props.setPosition({ commentId, width, top: (lane * this.state.fontSize)});
    return;
  }

  private setExited(id: string) {
    this.props.setExited(id);
    this.deleteCommentFromLane(id);
    return;
  }

  render() {
    const commentNodes = this.props.messages.map(message => {
      return <Comment
        key={message.commentId}

        commentId={message.commentId}
        text={message.text}
        fontSize={this.state.fontSize}
        timestampUsec={message.timestampUsec}

        screenWidth={window.screen.width}
        width={message.width}
        top={message.top}
        presetFlameoutUsec={this.props.presetFlameoutUsec}

        setWidth={Boolean(message.width) ? undefined : this.setWidth}
        setExited={this.setExited}
      />
    });
    return (
      <div className={'comments'}>
        {commentNodes}
      </div>
    );
  }
}

export interface Props {
  messages: MessageExtend[],
  presetFlameoutUsec: number,
  setPosition: ({ commentId, width, top }: {commentId: string, width: number, top: number}) => void,
  setExited: (id: string) => void,
}

export interface State {
  fontSize: number,
  lanes: Lane[],
}

export interface Lane {
  lane: number,
  lastAddedCommentId?: string,
  lastAddedCommentTimestampUsec: number,
}
