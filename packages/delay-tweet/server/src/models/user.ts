import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('app:mongo');

mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/delay-tweet?authSource=admin`, { useNewUrlParser: true, useUnifiedTopology:true });
const db = mongoose.connection;
db.on('error', console.error.bind(log, 'connection error'));
db.once('open', () => {
  log('we\'re connected!');
});

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
