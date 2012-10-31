var fs = require('fs');
var restify = require('restify');
var mongoose = require('mongoose');

var authPlugin = require(__dirname + '/app/route-plugins/auth');

mongoose.connect("MONGODB_URL");

function formatResponse(data){
    if(!(data instanceof Array)){
        data = [data];
    }

    return {data:data, startRow:0, endRow: data.length, totalRow: data.length, totalPages:1};
}

function formatError(err){
    return {message:err.message};
}

// copied from response.js
// this is needed to create custom json format
function setContentLength(res, length) {
    if (res.getHeader('Content-Length') === undefined &&
        res.contentLength === undefined) {
        res.setHeader('Content-Length', length);
    }
}

function formatJSON(req, res, body) {
    if (!body) {
        setContentLength(res, 0);
        return null;
    }

    if (body instanceof Error) {
        // snoop for RestError or HttpError, but don't rely on instanceof
        if ((body.restCode || body.httpCode) && body.body) {
            //modification starts here
            //body = body.body;
            body = formatError(body.body);
            //modification end here
        } else {
            //modification starts here
            body = formatError(body);
            /*
             body = {
             message: body.message
             };
             */
            //modification end here
        }

    }

    if (Buffer.isBuffer(body))
        body = body.toString('base64');

    //modification starts here
    if(!(body instanceof  Error) && !Buffer.isBuffer(body)){
        body = formatResponse(body);
    }
    //modification end here

    var data = JSON.stringify(body);

    setContentLength(res, Buffer.byteLength(data));
    return data;
}

function createServer(port, protocol, sessionType, sessionLifetimeInMinutes){
    var server = restify.createServer({
        name: protocol,
        formatters: {
            'application/json': formatJSON,
            'text/plain': formatJSON,
            'application/octet-stream': formatJSON
        }
    });

    //add passport bootstrap
    var auth = new authPlugin({'protocol':protocol, 'sessionType': sessionType, 'sessionLifetime':sessionLifetimeInMinutes});

    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    server.use(auth.initialize());
    server.use(auth.session());

    server.auth = auth;

    //bootstrapping controllers
    var controllers_path = __dirname + '/app/controllers/' + protocol;
    var controller_files = fs.readdirSync(controllers_path);
    controller_files.forEach(function(file){
        if(file[0] != '.'){
            require(controllers_path+'/'+file)(server);
        }
    });

    console.log(protocol + ' Server is running: ' + port);
    server.listen(port);
}

createServer(8080, 'sample','user', 12 * 3600);