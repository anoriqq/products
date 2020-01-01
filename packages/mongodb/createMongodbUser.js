db.getSiblingDB('delay-tweet').createUser({
  user: 'delay-tweet',
  pwd: 'delay-tweet',
  roles: [{
    db: 'delay-tweet',
    role: 'readWrite',
  }],
});
// db.getSiblingDB('delay-tweet').createCollection('test');

db.getSiblingDB('youtube-comments').createUser({
  user: 'youtube-comments',
  pwd: 'youtube-comments',
  roles: [{
    db: 'youtube-comments',
    role: 'readWrite',
  }],
});
// db.getSiblingDB('youtube-comments').createCollection('test');
