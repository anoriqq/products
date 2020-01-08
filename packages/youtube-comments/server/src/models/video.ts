import { createSchema, Type, typedModel } from 'ts-mongoose';

const videoSchema = createSchema({
  videoId: Type.string({required: true, unique: true}),
  isLive: Type.boolean(),
  continuation: Type.string(),
});

export const Video = typedModel('Video', videoSchema);
