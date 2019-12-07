#!/bin/bash
set -e

mongo <<EOF
use delayTweet
db.createUser({
  user:  '$MONGO_DELAY_TWEET_USERNAME',
  pwd: '$MONGO_DELAY_TWEET_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'delayTweet'
  }]
})
EOF
