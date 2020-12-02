var express = require('express');
var session = require('express-session');
var timeout = require('connect-timeout'); //express v4
var oauth2 = require('simple-oauth2');
var path = require('path');
var app = express();

const PORT = 8091;                                     //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
var redirecturi = 'http://localhost:' + PORT + '/callback';

// __dirname is a global object that contains the name of the root directory 
app.use(express.static(__dirname));

// request will be terminated after this duration [ms]:
app.use(timeout(120000));

// initialize session
app.use(session({
    //secret to sign the session ID cookie
    secret: 'toto',                                  //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
    resave: true,
    saveUninitialized: true
}));

// Set the OAuth client configuration settings 
var credentials = {
    client: {
        id: 'sb-92334064-9c48-4a86-a298-d405ad031723!b342|client!b25',                         //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
        secret: 'OEEGhZ8OUsh9nPNphtHAGqWdktc='                   //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
    },
    auth: {
        authorizeHost: 'https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com',               //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
        authorizePath: 'oauth/authorize',          //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
        tokenHost: 'https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com',                       //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
        tokenPath: 'oauth/token',                  //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
    },
    options: {
        authorizationMethod: 'body'
    }
}

// Initialize the OAuth2 Library
oauth2 = oauth2.create(credentials);

// Authorization code flow:
// 1. get the authorization code and send it to path /callback:
app.use('/authorizationcode', function (req, res) {
    console.log("inside authorizationcode");

    var authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: redirecturi

    });

    console.log("authorizationUri: " + authorizationUri);
    res.redirect(authorizationUri);
});


app.use('/callback', function (req, res) {
    console.log("inside callback");

    // the authorization code is sent to the path /callback. 
    var code = req.query.code;
    console.log("Authorization Code: " + code);

    var tokenConfig = {
        code: code,
        redirect_uri: redirecturi
    };

    // 2. get the access token:
    oauth2.authorizationCode.getToken(tokenConfig)
        .then((result) => {

            const token = oauth2.accessToken.create(result);
            console.log("Access Token: " + token.token.access_token);

            req.session["tokens"] = token;
            res.redirect("logonresponse");
        })
        .catch((error) => {
            console.log('Access Token Error', error.message);
        });
});


app.get('/logonresponse', function (req, res) {
    res.sendFile(path.join(__dirname + '/LogResponse.html'));
});


app.use("/getToken", function (req, res) {
    res.send(JSON.stringify(req.session["tokens"].token));
});

app.listen(PORT);
app.timeout = 7800000;
console.log("Server running on port " + PORT);