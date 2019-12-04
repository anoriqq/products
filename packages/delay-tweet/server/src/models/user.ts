import {mongoose} from './mongo';

const userSchema = new mongoose.Schema({
  twitterId: String,
  username: String,
  displayName: String,
  accessToken: String,
  refreshToken: String,
});
interface IUserDocument extends mongoose.Document {
  twitterId: String;
  username: String;
  displayName: String;
  accessToken: String;
  refreshToken: String;
}

const User = mongoose.model<IUserDocument>('User', userSchema);
export { User };
