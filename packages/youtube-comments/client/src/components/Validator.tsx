// Logger
import debug from 'debug';
const log = debug('app:Validator');

// Packages
import React, { useState } from 'react';

// Modules
import { liveChatClient } from '@src/store/liveChatClient';
import { CommentBox } from '@src/components/CommentBox';

export function Validator() {
  const [search] = useState(new URLSearchParams(window.location.search));
  const videoId = liveChatClient.findVideoId(search.get('v')||'');
  if (!videoId) return <div>動画IDを指定してください</div>;
  liveChatClient.listen({ videoId });
  return <CommentBox/>;
}
