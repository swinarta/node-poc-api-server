module.exports = exports = function lastModifiedPlugin (schema, options) {
    schema.add({ lastModifiedDateTime: Date });
    schema.add({ createdDateTime: Date });

    schema.pre('save', function (next) {

        var d = new Date;

        if(this.isNew){
            this.createdDateTime = d;
        }
        this.lastModifiedDateTime = d;

        next();
    })

}