var uuid = require('node-uuid');
var mongoose = require('mongoose');
var moment = require('moment');
var Passport        = require('passport').Passport
    , BasicStrategy = require('../auth-plugins/basic').BasicStrategy;

var FBAccessTokenStrategy = require('../auth-plugins/facebook-basic-accesstoken').Strategy;

require('../schemas/userSchema');
require('../schemas/sessionSchema');

var UserSchema = mongoose.model('User');
var SessionSchema = mongoose.model('Session');

function AuthSession(options){

    var passport = new Passport();

    passport.use(new FBAccessTokenStrategy({
            clientID: 'fb_app_id',
            clientSecret: 'fb_app_secret'
        },
        function(user, done){

            var finder = UserSchema.findOne();

            //type and authId must be unique
            finder.where('userType', options.sessionType);
            finder.where('authId', user._id);
            finder.where('authType', 'facebook');

            finder.exec(function(err, doc){

                if(err){
                    console.log(err);
                }

                if(!doc){

                    //fbId not found, create one
                    var aUser = new UserSchema({'userType':options.sessionType, 'protocol':options.protocol, 'authId':user._id, 'authType':'facebook'});
                    aUser.save(function(err, doc){
                        if(!err){
                            return done(null, doc);
                        }else{
                            console.log(err);
                        }
                    });

                }else{
                    return done(null, doc);
                }
            });

        }));

    passport.use(new BasicStrategy(
        function(userid, password, done) {

            var finder = UserSchema.findOne();

            finder.where('email', userid);
            finder.where('userType', options.sessionType);

            finder.exec(function(err, doc){

                if(err){
                    return done(err, doc);
                }

                if(doc){

                    if(doc.password == password){
                        return done(null, doc);
                    }else{
                        console.log('err: invalid password: ' + userid);
                        return done(null, null);
                    }

                }else{
                    //username not found
                    console.log('err: username not found: ' + userid);
                    return done(null, doc);
                }
            });

        }
    ));

    passport.serializeUser(function(user, done) {
        console.log('serializeUser');

        if(!user.provider) user.provider = 'organic';

        var lifetime = 3600;

        if(options.sessionLifetime) lifetime = options.sessionLifetime;

        var aSession = new SessionSchema(
            {
                _id: uuid.v4(),
                provider: user.provider,
                userRef: user._id,
                authId: user.authId,
                authType: user.authType,
                protocol:options.protocol,
                userType: options.sessionType,
                lifetime: lifetime,
                restaurantRef: user.restaurantRef
            }
        );

        aSession.save(function(err, doc){
            if(err){
                console.log(err);
            }
        });
        done(null, aSession._id);

    });

    passport.deserializeUser(function(id, done) {

    });

    this.passport = passport;

}

AuthSession.prototype.initialize = function(){
    return this.passport.initialize();
}

AuthSession.prototype.session = function(str){

    return function auth(req, res, next) {

        console.log('headers received:');
        console.log(req.path);
        console.log(req.headers);

        /*

            define path for anonymous access, needs a better implementation than this

         */

        if(req.path.substring(0, 7) === '/login/'
            || req.path == '/logout'){
            return next();
        }

        var cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
        });

        if(cookies['sess_id']) {

            SessionSchema.findById(cookies['sess_id'], function (err, doc){
                if(!err && doc){

                    //check if session has timeout
                    if(moment().diff(moment(doc.expiryDateTime)) <= 0){
                        req.session = doc;
                        return next();
                    }else{
                        //session has timeout, remove session
                        doc.remove();
                    }
                }

                res.writeHead(400);
                res.end();

            });

        }else{
            res.writeHead(400);
            res.end();
        }

    };

}

AuthSession.prototype.logout = function(){

    return function logout(req, res, next) {

        var cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
        });

        if(cookies['sess_id']) {
            SessionSchema.findById(cookies['sess_id'], function (err, doc){

                if(!err && doc){
                    doc.remove();
                }
            });

            req.logOut();

        }

        next();

    };
}


//timer to clean up expired sessions, runs every 1 hour
 setInterval(function(){

    SessionSchema.find({expiryDateTime: { $lt: new Date()}}).remove();

}, 60 * 60 * 1000);

module.exports = AuthSession;