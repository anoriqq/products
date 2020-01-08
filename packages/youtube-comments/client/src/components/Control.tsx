import React, { Component } from 'react';

export interface Props {
  setVideo: (e: React.MouseEvent)=>void,
  videoIdString: (e: React.ChangeEvent<HTMLInputElement>)=>void,
}

export class Control extends Component<Props> {
  render() {
    return (
      <div className={'control'}>
        <input type="text" placeholder='動画のIDまたはURL' onChange={this.props.videoIdString}/>
        <button onClick={this.props.setVideo}>コメントを取得</button>
      </div>
    );
  }
}
