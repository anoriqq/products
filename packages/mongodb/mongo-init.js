db.auth('admin-user', 'admin-password');

delayTweet = db.getSiblingDB('delayTweet');
// db.delayTweet.insert({"name": "init"});
delayTweet.createUser({
  user: 'delay-tweet',
  pwd: 'delay-tweet',
  roles: [
    {
      role: 'readWrite',
      db: 'delayTweet',
    },
  ],
});
