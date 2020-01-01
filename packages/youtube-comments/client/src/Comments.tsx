import React, { Component } from 'react';

export class Comments extends Component<{messages: any[]}> {
  render() {
    return (
      <div>
        {this.props.messages.map(message => {
          return (
            <div key={message.commentId}>{message.text}</div>
          );
        })}
      </div>
    );
  }
}
