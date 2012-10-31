var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var lastModifiedPlugin = require('../schema-plugins/lastModified');
var versionPlugin = require('../schema-plugins/version');
var updatePlugin = require('../schema-plugins/update');
var passwordPlugin = require('../schema-plugins/password');


module.exports.definition = {
    firstName		: String
    , lastName      : String
    , email         : String
    , userType      : String
    , authId        : String //for fb login authId is fbId
    , authType      : String //for fb login authType is facebook
};


var UserSchema = new Schema(this.definition, {collection:'user'});

UserSchema.plugin(lastModifiedPlugin);
UserSchema.plugin(versionPlugin);
UserSchema.plugin(updatePlugin);
UserSchema.plugin(passwordPlugin);

mongoose.model('User', UserSchema);