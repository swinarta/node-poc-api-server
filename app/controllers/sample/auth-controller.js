var moment = require('moment');
var mongoose = require('mongoose');

var UserSchema = mongoose.model('User');

function createCookie(sessionId){

    var exp;

    if(sessionId){
        exp = moment().add('days', 1).toDate();
    }else{
        exp = moment(0).toDate();
        sessionId='deleted';
    }

    return 'sess_id='+sessionId+";path=/;expires=" + exp.toGMTString() + ";HttpOnly;";
}

module.exports = function(app){

    var passport = app.auth.passport;

    app.post("/login/basic", passport.authenticate('basic'), function(req, res){

        //if login successful, response with user
        var sessionId = req._passport.session.user;
        res.setHeader("Set-Cookie", createCookie(sessionId));
        res.send(req.user);
    });

    app.post("/login/facebook", passport.authenticate('facebook-basic-accesstoken'), function(req, res){

        /*
        basic auth username: fbId, password: accessToken
         */

        var sessionId = req._passport.session.user;
        res.setHeader("Set-Cookie", createCookie(sessionId));
        res.send(req.user);
    });

    app.get("/logout", app.auth.logout(), function(req, res){

        res.setHeader("Set-Cookie", createCookie());
        res.send();

    });

    app.get("/whoami", function(req, res){

        var userRef = req.session.userRef;

        UserSchema.findById(userRef, function (err, doc){
            if(!err && doc){
                res.send(doc);
            }
        });

    });

}

