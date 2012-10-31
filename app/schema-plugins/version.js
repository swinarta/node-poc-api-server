module.exports = exports = function versionPlugin (schema, options) {
    schema.add({ version: Number });

    schema.pre('save', function (next) {

        if(this.isNew){
            this.version = 0;
        }else{
            this.version.$inc();
        }

        next();
    })

}