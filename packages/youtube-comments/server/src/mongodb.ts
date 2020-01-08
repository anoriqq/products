import { connect, connection , set} from 'mongoose';
import debug from 'debug';

const log = debug('app:mongodb');

async function connectMongodb() {
  return (async () => {
    set('useNewUrlParser', true);
    set('useFindAndModify', false);
    set('useCreateIndex', true);
    set('useUnifiedTopology', true);

    const username = process.env.MONGO_YOUTUBE_COMMENTS_USERNAME;
    const pass = process.env.MONGO_YOUTUBE_COMMENTS_PASSWORD;
    const dbName = process.env.MONGO_YOUTUBE_COMMENTS_NAME;
    const auth = (username && pass) ? `${username}:${pass}@` : '';
    const url = process.env.NODE_ENV === 'development' ? `mongodb://${auth}mongodb:27017/${dbName}` : process.env.MONGO_URL;
    if (!url) return log('require mongodb url');

    const connectOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    connect(url, connectOpts).then(()=>log(`Successful connection to ${dbName} of Mongodb`)).catch(() => log('Connection to Mongodb failed'));
    connection.on('error', log);
  })().catch(log);
}

export { connectMongodb };
