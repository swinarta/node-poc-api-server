var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

/* add createDate and lastModifiedDate */
var lastModifiedPlugin = require('../schema-plugins/lastModified');

/* version and update are used to provide optimistic lock check, at least for mongoose < 3.0 */
var versionPlugin = require('../schema-plugins/version');
var updatePlugin = require('../schema-plugins/update');

/* encrypt password*/
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