var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var moment = require('moment');

var lastModifiedPlugin = require('../schema-plugins/lastModified');

module.exports.definition = {
    _id              : String
    , userRef        : {type: Schema.ObjectId, ref: "User", required: true}
    , authId         : String //for fb login authId is fbId
    , authType       : String //for fb login authType is facebook
    , userType       : String
    , protocol       : String
    , provider       : String
    , lifetime       : Number
    , expiryDateTime : Date
};

var SessionSchema = new Schema(this.definition, {collection:'session'});

SessionSchema.plugin(lastModifiedPlugin);

SessionSchema.pre('save', function (next) {
    this.expiryDateTime = moment().add('s', this.lifetime).toDate();
    next();
})


mongoose.model('Session', SessionSchema);