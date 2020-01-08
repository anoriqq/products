import { EventEmitter } from 'events';
import got from 'got';
import { get } from 'lodash';

import { createWebSocketServer } from './websocket';
import { getCommentsCount } from './api/logic';
import { Video, Comment } from './models';

// Logger
import debug from 'debug';
const log = debug('app:worker');

export interface videoObj {
  videoId: string,
  timer: NodeJS.Timeout|null,
  timeoutMs: number,
  continuation?: string,
};

// APIで取得したコメントの型
export interface commentObj {
  liveChatTextMessageRenderer?: {
    id: string,
    authorBadges: any,
    timestampUsec: any,
    message: {
      runs: any[],
    },
    authorPhoto: {
      thumbnails: any[],
    },
  },
  liveChatPaidMessageRenderer?: any,
  liveChatPaidStickerRenderer?: any,
  liveChatMembershipItemRenderer?: any,
  liveChatPlaceholderItemRenderer?: any,
  liveChatViewerEngagementMessageRenderer?: any,
}

// mongodbに保存する型
export interface comment {
  commentId: string,
  videoId: string,
  timestampUsec: string,
  authorName: string,
  authorPhoto: {
    thumbnails: any[],
  },
  message: {
    runs: any[],
  },
  text: string,
  purchaseAmountText?: string,
};

class WorkerGettingComment extends EventEmitter {
  private UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36' };
  private videos: videoObj[];

  constructor() {
    super();
    this.videos = [];
  }

  public async updateVideos() {
    const q: { isLive: Boolean, videoId?: { $not: RegExp } } = {
      isLive: true,
    };
    const existsVideoIdsAry = this.videos.map(({ videoId }) => { return videoId });
    if (existsVideoIdsAry.length) {
      const existsVideoIdsRegex = new RegExp(`(${existsVideoIdsAry.join('|')})`);
      q.videoId = { $not: existsVideoIdsRegex };
    }
    const livingVideos: {
      videoId: string,
      continuation?: string,
    }[] = await Video.find(q, { videoId: 1, continuation: 1, _id: 0 });
    const initedVideosAry = livingVideos.map(v => {
      const initedVideo: videoObj = { videoId: v.videoId, timeoutMs: 0, timer: null };
      if (v.continuation) initedVideo.continuation = v.continuation;
      initedVideo.timer = this.createTimer(initedVideo);
      return initedVideo;
    });
    this.videos.push(...initedVideosAry);
    log({ videos: this.videos.map(v => { return v.videoId }) });
    return;
  }

  private createTimer(v: videoObj) {
    return setTimeout(() => this.getComment(v).catch(err => {
      this.clearTimer(v);
      log(err);
      return;
    }), v.timeoutMs);
  }

  private async clearTimer(v: videoObj) {
    if (v.timer) clearTimeout(v.timer);
    if (v.continuation) v.continuation = '';
    await Video.findOneAndUpdate({ videoId: v.videoId }, { $set: { isLive: false } });
    this.videos.splice(this.videos.findIndex(video => { return video.videoId === v.videoId }), 1);
    createWebSocketServer.endLive({videoId: v.videoId});
    const commentsCount = await getCommentsCount(v.videoId);
    log({ message: 'ライブ配信終了', videoId: v.videoId, commentsCount });
    log({ videos: this.videos.map(v => { return v.videoId }) });
    return;
  }

  private async getComment(v: videoObj) {
    if (!v.continuation) return this.clearTimer(v);
    if (v.timer) clearTimeout(v.timer);
    const url = `https://www.youtube.com/live_chat/get_live_chat?continuation=${v.continuation}&pbj=1`;
    const res = await got.get(url, { headers: this.UA });
    const body = JSON.parse(res.body);
    const { continuations, actions } = get(body, 'response.continuationContents.liveChatContinuation', {});
    if (!continuations) return this.clearTimer(v);

    const { timedContinuationData, invalidationContinuationData } = get(continuations, '[0]', {});
    const timedContinuation = timedContinuationData || invalidationContinuationData;
    if (get(timedContinuation, 'timeoutMs')) {
      v.continuation = timedContinuation.continuation;
      v.timeoutMs = timedContinuation.timeoutMs;
      this.createTimer(v);
    }

    if (!actions) {
      // log({ message: '新規コメントなし', videoId: v.videoId });
      return;
    }
    const commentsToSave: comment[] = actions.map((action: any)=>{
      const comment: commentObj = get(action, 'addChatItemAction.item');
      if (!comment) {
        // log({ message: 'コメント以外のアクション', videoId: v.videoId, action });
        return;
      }
      return this.sortingComment({comment, videoId: v.videoId});
    }).filter((x: any)=>x);
    // log({ message: 'コメント取得', videoId: v.videoId, newCommentsCount: commentsToSave.length });
    await Comment.insertMany(commentsToSave, { ordered: false }).catch(err => {
      const regex = /E11000 duplicate key error collection: youtube-comments.comments index: commentId_1 dup key: { commentId: ".*" }/;
      if (!regex.test(err.message)) throw err;
    });
    createWebSocketServer.sendComment({videoId: v.videoId, comments: commentsToSave});
    return;
  }

  private sortingComment({ comment: c, videoId }: {comment: commentObj, videoId: string}): comment|void {
    if (c.liveChatTextMessageRenderer) {
      // 通常コメント
      const messageObj = c.liveChatTextMessageRenderer;

      const timestampUsec = messageObj.timestampUsec;
      const text = get(messageObj, 'message.runs', [])
        .map(({ text, emoji }: { text: string, emoji: any }) => {
          if (emoji) return emoji.shortcuts.join(' ');
          return text;
        }).join('') || '';
      const authorName = get(messageObj, 'authorName.simpleText', '');
      // const badgesInfo = Object.assign({}, ...(messageObj.authorBadges ? messageObj.authorBadges : []).map((badgeInfo: any) => {
      //   const tooltip = get(badgeInfo, 'liveChatAuthorBadgeRenderer.tooltip', '');
      //   if (/モデレーター/.test(tooltip)) {
      //     return { moderator: badgeInfo.liveChatAuthorBadgeRenderer };
      //   } else if (/メンバー/.test(tooltip)) {
      //     return { member: badgeInfo.liveChatAuthorBadgeRenderer };
      //   } else if (/確認済み/.test(tooltip)) {
      //     return { verified: badgeInfo.liveChatAuthorBadgeRenderer };
      //   } else if (/所有者/.test(tooltip)) {
      //     return { owner: badgeInfo.liveChatAuthorBadgeRenderer };
      //   } else {
      //     return log({badgeInfo});
      //   }
      // }));
      // const timestamp = new Date(timestampUsec / 1000).toISOString();

      // const { owner, verified, moderator, member } = badgesInfo;
      // log(`${timestamp} ${owner?'所有者 ':''}${verified?'確認済み ':''}${moderator?'モデレーター ':''}${member?member.tooltip+' ':''}[${authorName}]  ${text}`);

      const comment: comment = {
        commentId: messageObj.id,
        videoId,
        timestampUsec,
        message: messageObj.message,
        text,
        authorName,
        authorPhoto: messageObj.authorPhoto,
      };
      return comment;
    } else if(c.liveChatPaidMessageRenderer) {
      // スーパーチャット
      const messageObj = c.liveChatPaidMessageRenderer;

      const authorName = get(messageObj, 'authorName.simpleText', '');
      const purchaseAmountText = get(messageObj, 'purchaseAmountText.simpleText', '');
      const timestampUsec = messageObj.timestampUsec;
      const text = get(messageObj, 'message.runs', [])
        .map(({ text, emoji }: { text: string, emoji: any }) => {
          if (emoji) return emoji.shortcuts.join(' ');
          return text;
        }).join('') || '';
      // const timestamp = new Date(timestampUsec / 1000).toISOString();

      // log(`${timestamp} ${purchaseAmountText} [${authorName}]  ${text}`);
      // this.messages.push({text, authorName, timestampUsec, purchaseAmountText});

      const comment: comment = {
        commentId: messageObj.id,
        videoId,
        timestampUsec,
        message: messageObj.message,
        text,
        purchaseAmountText,
        authorName,
        authorPhoto: messageObj.authorPhoto,
      };
      return comment;
    } else if(c.liveChatPaidStickerRenderer) {
      // ステッカー
      // const messageObj = comment.liveChatPaidStickerRenderer;

      // const stickerLabel = get(messageObj, 'sticker.accessibility.accessibilityData.label', '');
      // const authorName = get(messageObj, 'authorName.simpleText', '');
      // const timestampUsec = messageObj.timestampUsec;
      // const timestamp = new Date(timestampUsec / 1000).toISOString();

      // log(`${timestamp} [${authorName}] (ステッカー) ${stickerLabel}`);
      return;
    } else if(c.liveChatMembershipItemRenderer) {
      // 新規メンバー
      // const messageObj = comment.liveChatMembershipItemRenderer;

      // const authorName = get(messageObj, 'authorName.simpleText', '');
      // const headerSubtext = get(messageObj, 'message.runs', [])
      //   .map(({ text }: { text: string }) => { return text }).join('');
      // const timestampUsec = messageObj.timestampUsec;
      // const timestamp = new Date(timestampUsec / 1000).toISOString();

      // log(`${timestamp} 新規メンバー [${authorName}] - ${headerSubtext}`);
      return;
    } else if(c.liveChatPlaceholderItemRenderer) {
      // Placeholder
      // const messageObj = comment.liveChatPlaceholderItemRenderer;

      // const id = messageObj.id;
      // const timestampUsec = messageObj.timestampUsec;
      // const timestamp = new Date(timestampUsec / 1000).toISOString();

      // log(`${timestamp} [Placeholder] id: ${id}`);
      return;
    } else if(c.liveChatViewerEngagementMessageRenderer) {
      // Engagement
      // const messageObj = comment.liveChatViewerEngagementMessageRenderer;

      // const text = get(messageObj, 'message.runs', [])
      //   .map(({ text }: { text: string }) => { return text }).join('');
      // const timestampUsec = messageObj.timestampUsec;
      // const timestamp = new Date(timestampUsec / 1000).toISOString();

      // log(`${timestamp} [Engagement]  ${text}`);
      return;
    } else {
      // 不明なコメントオブジェクト
      log({ message: '不明なコメントオブジェクト', comment: c });
      return;
    }
  }
}

export const workerGettingComment = new WorkerGettingComment();
