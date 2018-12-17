const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const secret = require('../config/secret');
const User = require('../models/user');
const async = require('async');
const request = require('request');


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
            //first time login

            async.waterfall([
                function (callback) {
                    const newUser = new User();
                    newUser.email = profile._json.email;
                    newUser.facebook = profile.id;
                    newUser.tokens.push({kind: 'facebook', token: token});
                    newUser.profile.name = profile.displayName;
                    newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';


                    newUser.save(function (err) {
                        if (err) throw err;
                        req.flash('loginMessage', 'Successfully login with facebook');
                        callback(err, newUser);
                    });
                },
                function (newUser, callback) {
                    //Mailchimp request
                    request({
                        url: 'https://us7.api.mailchimp.com/3.0/lists/f64dc83690/members',
                        method: 'POST',
                        header: {
                            'Authorization': 'randomUser 05317f75de5b7527276d6cb24c374d06-us7',
                            'Content-Type': 'application/json'
                        },
                        json: {
                            'email_address': newUser.email,
                            'status': 'subscribed'
                        }
                    }, function (err, response, body) {
                        //Do Something here
                        if (err) {
                            return done(err, newUser);
                        } else {
                            console.log("Success");
                            return done(null, newUser);
                        }
                    });
                }
            ]);
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