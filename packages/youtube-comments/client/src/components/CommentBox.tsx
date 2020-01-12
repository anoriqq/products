// Logger
import debug from 'debug';
const log = debug('app:CommentBox');

// Packages
import React, { Component } from 'react';

// Modules
import { liveChatClient, App } from '@src/store/liveChatClient';
import { Comment } from '@src/components/Comment2';

export class CommentBox extends Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = {
      messages: [],
    };
    liveChatClient.setMessageUpdateHandler(({ messages }: App.LiveChatClient.MessageUpdateHandler) => {
      this.setState({messages});
      return;
    });
  }

  render() {
    return (
      <div id='comment-box'>
        {
          this.state.messages.map(m => (
            <Comment
              key={m.commentId}
              message={m}
              flameoutMsec={liveChatClient.state.flameoutUsec / 1000}
              screenWidth={window.screen.width}
            />
          ))
        }
      </div>
    );
  }
}

interface Props {}

interface State {
  messages: App.DisplayedMessage[];
}



// なせか 関数だと､Stateが更新されない
// export function CommentBox() {
//   const [m, setMessages] = useState<App.DisplayedMessage[]>([]);
//   const updateMessages = ({ messages }: App.LiveChatClient.MessageUpdateHandler) => {
//     setMessages(messages);
//     log(messages);
//     return;
//   };
//   liveChatClient.setMessageUpdateHandler(setMessages);
//   return (
//     <div className='comment-box'>{
//       m.length
//       messages.map(m => {
//         return (
//           <Comment
//             key={m.commentId}
//             message={m}
//           />
//         );
//       })
//     }</div>
//   );
// }
