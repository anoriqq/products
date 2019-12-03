import debug from 'debug';
import Twitter from 'twitter';

const log = debug('app:logic');

const tweet = async (user: any, status: string) => {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
    access_token_key: user.accessToken,
    access_token_secret: user.refreshToken,
  });
  const response = await client.post('statuses/update', {status});
  return response;
}

export {tweet};
