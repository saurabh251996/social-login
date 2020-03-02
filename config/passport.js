// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User       = require('../models/user');
var SocialUser       = require('../models/socialuser');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });



    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {

            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            User.findOne({'local.email': email}, function(err, existingUser) {

                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if there's already a user with that email
                if (existingUser)
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                //  If we're logged in, we're connecting a new local account.
                if(req.user) {
                    var user            = req.user;
                    user.local.email    = email;
                    user.local.password = user.generateHash(password);
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
                //  We're not logged in, so we're creating a brand new user.
                else {
                    // create the user
                    var newUser            = new User();

                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.name=req.body.name;
                    newUser.local.phone=req.body.phone;
                    newUser.local.dob=req.body.dob;

                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                }

            });
        });

    }));
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields: ['emails'],
        passReqToCallback : true,
        proxy:true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken,profile, done) {

        // asynchronous
        process.nextTick(function() {



            // check if the user is already logged in
            if (!req.socialuser) {

                 SocialUser.findOne({ 'facebook.id' : profile.id }, function(err, socialuser) {
                    if (err)
                        return done(err);

                    if (socialuser) {

                        return done(null, socialuser); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newSocialUser            = new SocialUser();

                        newSocialUser.facebook.id    = profile.id;
                        newSocialUser.facebook.token = token;
                        newSocialUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newSocialUser.facebook.email = profile.emails[0].value || null;

                        newSocialUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newSocialUser);
                        });
                    }
                });

            }
        });

    }));

    // =========================================================================
      // GOOGLE ==================================================================
      // =========================================================================
      passport.use(new GoogleStrategy({

          clientID        : configAuth.googleAuth.clientID,
          clientSecret    : configAuth.googleAuth.clientSecret,
          callbackURL     : configAuth.googleAuth.callbackURL,
          proxy:true

      },
      function(token, refreshToken, profile, done) {

          // make the code asynchronous
          // User.findOne won't fire until we have all our data back from Google
          process.nextTick(function() {

              // try to find the user based on their google id
              SocialUser.findOne({ 'google.id' : profile.id }, function(err, socialuser) {
                  if (err)
                      return done(err);

                  if (socialuser) {

                      // if a user is found, log them in
                      return done(null, socialuser);
                  } else {
                      // if the user isnt in our database, create a new user
                      var newSocialUser          = new SocialUser();

                      // set all of the relevant information
                      newSocialUser.google.id    = profile.id;
                      newSocialUser.google.token = token;
                      newSocialUser.google.name  = profile.displayName;
                      newSocialUser.google.email = profile.emails[0].value; // pull the first email

                      // save the user
                      newSocialUser.save(function(err) {
                          if (err)
                              throw err;
                          return done(null, newSocialUser);
                      });
                  }
              });
          });

      }));


}//module exports ending
