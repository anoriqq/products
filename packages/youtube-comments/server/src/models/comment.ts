import { createSchema, Type, typedModel } from 'ts-mongoose';

const commentSchema = createSchema({
  commentId: Type.string({required: true, unique: true}),
  videoId: Type.string({required: true}),
  timestampUsec: Type.string({required: true}),
  message: Type.object().of({
    runs: Type.array().of(Type.mixed()),
  }),
  text: Type.string(),
  authorName: Type.string(),
  authorPhoto: Type.object().of({
    thumbnails: Type.array().of(Type.mixed()),
  }),
  purchaseAmountText: Type.string(),
});

export const Comment = typedModel('Comment', commentSchema);
