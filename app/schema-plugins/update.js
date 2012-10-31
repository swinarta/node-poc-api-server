var __ = require('underscore');

module.exports = exports = function updatePlugin (schema, options) {

    schema.methods.update = function(params){

        if(!params.version){
            //error: version not found
            console.log('version not found');

        }else{
            if(!this.version){
                //error: schema's version not found
                console.log("schema's version not found");

            }else if(this.version != params.version){
                console.log('this.version:'+this.version);
                console.log('params.version:'+params.version);
                //error: optimistic lock
                console.log('optimistic lock');
            }
        }

        if(params._id){
            delete params._id;
        }

        __.each(params, function(value, key){
            this[key] = value;
        }, this);

    };

}

