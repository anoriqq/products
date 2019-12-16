import { Router } from 'express';
import debug from 'debug';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { User } from './models/user';

const log = debug('app:auth');

const options = {
  consumerKey: process.env.TWITTER_CONSUMER_KEY || '',
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || '',
  callbackURL: `${process.env.FQDN}/auth/twitter/callback`,
};
passport.use(new TwitterStrategy(options, (accessToken, refreshToken, profile, done) => {
  const uq = {
    twitterId: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    accessToken,
    refreshToken,
  };
  User.findOneAndUpdate({twitterId: profile.id}, uq, {upsert: true}, (err, user)=>{
    if (err) return done(err);
    return done(null, user);
  });
}));
passport.serializeUser((user, cb) => {
  return cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  return cb(null, obj);
})

const authRouter = Router();

authRouter.get('/twitter', passport.authenticate('twitter'));
authRouter.get('/twitter/callback', passport.authenticate(
  'twitter',
  {
    successRedirect: '/',
    failureRedirect: '/',
  }
));

export { authRouter };
