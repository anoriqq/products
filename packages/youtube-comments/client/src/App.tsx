// Logger
import debug from 'debug';
const log = debug('app:App');

// Packages
import React, { useState } from 'react';

// Modules
import { liveChatClient } from '@src/store/liveChatClient';
import { CommentBox } from '@src/components/CommentBox';

export function App() {
  const [search] = useState(new URLSearchParams(window.location.search));
  const videoId = liveChatClient.findVideoId(search.get('v')||'');
  const fontFamily = search.get('font') || '';
  if (!videoId) return <div>動画IDを指定してください</div>;
  liveChatClient.listen({ videoId, fontFamily });
  return <CommentBox/>;
}
