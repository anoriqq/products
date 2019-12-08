import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('app:mongo');

const username = process.env.MONGO_DELAY_TWEET_USERNAME;
const pass = process.env.MONGO_DELAY_TWEET_PASSWORD;
const dbName = 'delayTweet';
const auth = (username && pass) ? `${username}:${pass}@` : '';
log('NODE_ENV: ', process.env.NODE_ENV);
const url = process.env.NODE_ENV === 'development' ? `mongodb://${auth}mongodb:27017/${dbName}` : 'mongodb+srv://admin:4N6A1d4TlK2gnPm9toOk@delay-tweet-kmxjm.gcp.mongodb.net/test?retryWrites=true&w=majority';
log('url: ', url);
log('mongodb url: ', url);
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(url, mongoOptions).catch(err=>log('connection error'));

const db = mongoose.connection;
db.on('error', console.error.bind(console));
db.once('open', () => {
  log(`connected to ${url}`);
});

export {mongoose};
