import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('app:mongo');

const username = process.env.MONGO_DELAY_TWEET_USERNAME;
const pass = process.env.MONGO_DELAY_TWEET_PASSWORD;
const dbName = 'delayTweet';
const auth = (username && pass) ? `${username}:${pass}@` : '';
const url = `mongodb://${auth}mongodb:27017/${dbName}`;
log('mongodb url: ', url);
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(url, mongoOptions).catch(err=>log('connection error'));

const db = mongoose.connection;
db.on('error', console.error.bind(console));
db.once('open', () => {
  log('connected!');
});

export {mongoose};
