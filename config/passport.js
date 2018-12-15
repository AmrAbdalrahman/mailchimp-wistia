const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const secret = require('../config/secret');
const User = require('../models/user');


passport.use(new FacebookStrategy(secret.facebook, function (req, token, refreshToken, profile, done) {

    User.findOne({facebook: profile.id}, function (err, user) {

        if (err) {
            return done(err);
        }

        if (user) {
            req.flash('loginMessage', 'Successfully login with facebook');
            return done(null, user);
        }
        else {
            const newUser = new User();
            newUser.email = profile._json.email;
            newUser.facebook = profile.id;
            newUser.tokens.push({kind: 'facebook', token: token});
            newUser.profile.name = profile.displayName;
            newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';


            newUser.save(function (err) {
                if (err) throw err;
                req.flash('loginMessage', 'Successfully login with facebook');
                return done(null, newUser);
            });
        }
    });

}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});


passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});