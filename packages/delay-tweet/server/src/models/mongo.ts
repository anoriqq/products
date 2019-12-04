import mongoose from 'mongoose';
import debug from 'debug';

const log = debug('app:mongo');

// const username = process.env.MONGO_INITDB_ROOT_USERNAME;
// const pass = process.env.MONGO_INITDB_ROOT_PASSWORD;
// const url = `mongodb://${username}:${pass}@mongodb:27017/delay-tweet`;
const url = `mongodb://mongodb:27017/delay-tweet`;
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
