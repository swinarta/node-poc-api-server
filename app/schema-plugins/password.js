module.exports = exports = function versionPlugin (schema, options) {
    schema.add({ password: String });

    schema.pre('save', function (next) {

        if(this.isNew || this.hasPasswordChange){
            // encrypt the password
        }
        next();
    })

}