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
        commentIds: [],
        lastAddedCommentTimestampUsec: Number.POSITIVE_INFINITY,
        sumOfWidth: 0,
      })),
      enterQueue: [],
      exitQueue: [],
    };
  }

  /** レーンを返す関数 */
  private async waitToBeAddedToLane({ commentId, width, timestampUsec }: { commentId: string, width: number, timestampUsec: string }) {
    await this.asyncSetState((state: Readonly<State>) => ({
      enterQueue: [...state.enterQueue, commentId],
    }));
    const lane = await this.setCommentToLane({ commentId, width, timestampUsec });
    await this.asyncSetState((state: Readonly<State>) => ({
      enterQueue: [...state.enterQueue].filter(id=>id!==commentId),
    }));
    if(this.state.enterQueue.length)log(this.state.enterQueue);
    return lane;
  }

  private async setCommentToLane({ commentId, width, timestampUsec }: { commentId: string, width: number, timestampUsec: string }) {
    const minimumLane: Lane = this.state.lanes.reduce((acc, cur) => {
      if (Math.min(acc.lastAddedCommentTimestampUsec, cur.lastAddedCommentTimestampUsec) === Number.POSITIVE_INFINITY) {
        return acc.lane < cur.lane ? acc : cur;
      }
      if (Math.max(acc.lastAddedCommentTimestampUsec, cur.lastAddedCommentTimestampUsec) === Number.POSITIVE_INFINITY) {
        return acc.lastAddedCommentTimestampUsec > cur.lastAddedCommentTimestampUsec ? acc : cur;
      }
      return acc.lastAddedCommentTimestampUsec < cur.lastAddedCommentTimestampUsec ? acc : cur;
    });
    const lanes = this.state.lanes.map(lane => {
      if (lane.lane !== minimumLane.lane) return lane;
      return {
        ...lane,
        commentIds: [...lane.commentIds, commentId],
        lastAddedCommentTimestampUsec: Number(timestampUsec),
        sumOfWidth: lane.sumOfWidth + width,
      };
    });
    await this.asyncSetState({ lanes });
    return minimumLane.lane;
  }

  private async deleteCommentFromLane({ commentId, width }: { commentId: string, width: number }) {
    await this.asyncSetState((state: Readonly<State>) => ({
      exitQueue: [...state.exitQueue, commentId],
    }));
    await this.asyncSetState((state: Readonly<State>) => ({
      lanes: state.lanes.map(lane => {
        if (lane.commentIds.includes(commentId)) {
          return {
            ...lane,
            commentIds: lane.commentIds.splice(lane.commentIds.findIndex(id=>id===commentId), 1),
            lastAddedCommentTimestampUsec: Number.POSITIVE_INFINITY,
            sumOfWidth: lane.sumOfWidth - width,
          };
        }
        return lane;
      }),
    }));
    await this.asyncSetState((state: Readonly<State>) => ({
      exitQueue: [...state.exitQueue].filter(id=>id!==commentId),
    }));
    return;
  }

  private async setWidth({ commentId, width, timestampUsec }: {commentId: string, width: number, timestampUsec: string}) {
    const lane = await this.waitToBeAddedToLane({commentId, width, timestampUsec});
    this.props.setPosition({ commentId, width, top: (lane * this.state.fontSize)});
    return;
  }

  private async setExited({ commentId, width }: {commentId: string, width: number}) {
    this.props.setExited(commentId);
    await this.deleteCommentFromLane({ commentId, width });
    return;
  }

  private async asyncSetState(newState: any) {
    return new Promise<void>(resolve => this.setState(newState, resolve));
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
  enterQueue: string[],
  exitQueue: string[],
}

export interface Lane {
  lane: number,
  commentIds: string[],
  lastAddedCommentTimestampUsec: number,
  sumOfWidth: number,
}
