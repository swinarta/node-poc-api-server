var passport = require('passport')
    , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
    , util = require('util');

var FacebookClient = require("facebook-client").FacebookClient;

var fb = new FacebookClient(
    "fb_app_id", // configure like your fb app page states
    "fb_app_secret", // configure like your fb app page states
    {
        "timeout": 10000 // modify the global timeout for facebook calls (Default: 10000)
    }
);

function Strategy(options, verify) {
    this._accessTokenField = 'accessToken';
    this._fbIdField = 'fbId';

    passport.Strategy.call(this);

    this.name = 'facebook-basic-accesstoken';
    this.verify = verify;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.authenticate = function(req) {
    var self = this;

    var authorization = req.headers['authorization'];
    if (!authorization) { return this.fail(this._challenge()); }

    var parts = authorization.split(' ')
    if (parts.length < 2) { return this.fail(400); }

    var scheme = parts[0]
        , credentials = new Buffer(parts[1], 'base64').toString().split(':');

    if (!/Basic/i.test(scheme)) { return this.fail(this._challenge()); }

    var fbId = credentials[0];
    var accessToken = credentials[1];
    if (!fbId || !accessToken) {
        return this.fail(400);
    }

    fb.getSessionByAccessToken(accessToken)(function(session){

        session.graphCall("/me", {})(function(fbProfile){

            if(!fbProfile || fbId != fbProfile.id) return self.fail(400);

            var fbProfile = self._parseToProfile(fbProfile);

            self.verify(fbProfile, function(err, user) {

                if (err) return self.error(err);
                if (!user) return self.error(err);

                self.success(user);
            });

        });

    });

};

Strategy.prototype._parseToProfile = function(body){

    try {
        var json = body;

        var profile = { provider: 'facebook-basic-accesstoken' };
        profile._id = json.id;
        profile.username = json.username;
        profile.displayName = json.name;
        profile.name = { familyName: json.last_name,
            givenName: json.first_name,
            middleName: json.middle_name };
        profile.gender = json.gender;
        profile.profileUrl = json.link;
        profile.emails = [{ value: json.email }];
        profile.authId = json.id;
        profile.authType = 'facebook';

        return profile
    } catch(e) {
        console.log(e);
        return null;
    }

}

Strategy.prototype._challenge = function() {
    return 'Basic realm="' + this._realm + '"';
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
module.exports.Strategy = Strategy;