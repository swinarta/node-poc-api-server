# node-poc-api-server
===================

NodeJs Sample API Server with basic authentication, facebook authentication and session manager using restify, passportjs and mongoosejs

## Running the sample

node app.js

## REST API

To login using in-house basic authentication, submit a POST request to /login/basic with email as username and provide password if needed.
To login using facebook basic authentication, submit a POST request to /login/facebook with facebook_id as username and access_token as password.
Upon successful login request, the server will respond with 200 and Set-Cookie on the header with a valid session id.
Requests to /whoami and /protected must include a valid session id in the request header.
The server will respond with 400 on invalid login or when accessing protected resource without a valid session id.

## Mongoose Schema Plugins
lastModified.js: add createDate and lastModifiedDate automatically
version.js and update.js: provide optimistic lock check, at least for mongoose < 3.0 (optional)
password.js: encrypt password

# License (MIT License)

Copyright (c) 2012 swinarta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.