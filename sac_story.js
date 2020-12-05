const axios = require('axios')
const cors = require("cors");
const qs = require('qs')
const hana = require("@sap/hana-client");
const { PerformanceObserver, performance } = require('perf_hooks');
const util = require('util');
const StringBuilder = require("string-builder");
var oauth2 = require('simple-oauth2');

// https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/app.html#;view_id=story;storyId=A6AC2AF20FEDCCC66ED0A161324E7419;forceOpenView=true;mode=embed
// https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/app.html#;view_id=story;storyId=A6AC2AF20FEDCCC66ED0A161324E7419;mode=embed;

// https://github.wdf.sap.corp/DBaaS/connectivity-operator/blob/master/cf-provider-account/dependency-provider-cfapp/app.js
//
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const xsenv = require('@sap/xsenv'); 
const passport = require('passport');


// Set the OAuth client configuration settings 
// https://launchpad.support.sap.com/#/notes/0002874955
// https://stackoverflow.com/questions/54384896/handling-redirects-with-axios-in-browser
// https://stackoverflow.com/questions/40988238/sending-the-bearer-token-with-axios

// redirect url (location is https://stackoverflow.com/questions/54384896/handling-redirects-with-axios-in-browser)
const credentials = {
    client: { // c-902a2cf.kyma.shoot.live.k8s-hana.ondemand.com
        id: 'sb-316c8ef0-2b39-4159-8413-80e005148921!b342|client!b25',
        secret: 'WzL9CsnQGJPOWgvNu7WUnURLzqQ='
    },
    /*
    client: { // sacee
        id: 'sb-085fecfa-1fba-4c7d-bf13-ad1c201323b6!b342|client!b25',
        secret: 'mhxgpCtHqvmn7+Va8LwpDdj2Z1k='
    },*/
    /*
    client: { // toto
        id: 'sb-92334064-9c48-4a86-a298-d405ad031723!b342|client!b25',
        secret: 'OEEGhZ8OUsh9nPNphtHAGqWdktc='
    },*/
    auth: {
        authorizeHost: 'https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com', 
        authorizePath: 'oauth/authorize',
        tokenHost: 'https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com', 
        tokenPath: 'oauth/token',
    },
    options: {
        authorizationMethod: 'body'
    }
}

// Initialize the OAuth2 Library
oauth2 = oauth2.create(credentials);


// https://openbase.io/js/@sap/xsenv/documentation#service-query
//const services = xsenv.getServices({uaa:{tag:'xsuaa'}, connectivity:{tag:'connectivity'}})
//const services = xsenv.getServices({name: 'xsuaa-kyma'})
//passport.use(new JWTStrategy(services.name));


// https://flaviocopes.com/page/list-subscribed/?ref=node-book
//
// https://github.wdf.sap.corp/cloud-gems/onprem-hana
// https://blogs.sap.com/2017/08/30/how-to-access-an-on-premise-hana-through-sap-cloud-connector-via-jdbc-from-sap-cloud-platform-neo-java-app/

// https://stackoverflow.com/questions/44072750/how-to-send-basic-auth-with-axios
// cubes: sap/bc/ina/service/v2/GetResponse?Request={%22Metadata%22:{%22Expand%22:[%22Cubes%22]}}
// https://medium.com/bb-tutorials-and-thoughts/how-to-develop-and-build-vue-js-app-with-nodejs-bd86feec1a20
// https://www.digitalocean.com/community/tutorials/js-axios-vanilla-js
// https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

// Run and Deploy a CAP Business Application on the Kyma Runtime
// https://blogs.sap.com/2020/10/02/run-and-deploy-a-cap-business-application-on-the-kyma-runtime/
// https://sap-samples.github.io/cloud-cap-risk-management/Kyma/

async function sac_get_access_token(path) {  
  // https://stackoverflow.com/questions/51140733/axios-equivalent-of-this-curl-command
  // curl --user 'sb-3bb95f9c-2714-4f79-872e-bcafa8e30349!b342|client!b25':'5tlJc0bXerZ+yIIVEjTUiP7t1Zk=' --header "Content-Type: application/json" --request POST https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com/oauth/token?grant_type=client_credentials  
  let mydata = '{"password":"5tlJc0bXerZ+yIIVEjTUiP7t1Zk=","userName":"sb-3bb95f9c-2714-4f79-872e-bcafa8e30349!b342|client!b25"}';  
  let config = {
    method: 'post',
    url: 'https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
    //withCredentials: true,
      auth: { username: 'sb-3bb95f9c-2714-4f79-872e-bcafa8e30349!b342|client!b25', password: '5tlJc0bXerZ+yIIVEjTUiP7t1Zk='},
      headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
    //data : mydata
  };  
  let logonToken;

  //axios.defaults.headers.post['Content-Type'] = 'application/json';
  //await axios.post(config.url, config.data, config.headers)
  await axios(config)
  .then((response) => {
    logonToken = response.data.access_token;
    console.log("data: '%s'", JSON.stringify(response.data));
    console.log("logonToken: '%s'", logonToken);
    console.log("logonToken with parse: '%s'", JSON.parse(logonToken));
    console.log("logonToken with stringify: '%s'", JSON.stringify(logonToken));
    console.log(response.status);
  })
  .catch((error) => {
    console.log(error);
    return JSON.stringify(error);
  });

  //return logonToken;

  let configGet = {
    method: 'get',
    url: 'https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/api/v1' + path,
    //withCredentials: true,
    headers: { 
      "Authorization": 'Bearer ' + logonToken,
      //"Accept": "application/json",
      //"Content-Type": "application/json",
      'x-sap-sac-custom-auth': 'true',
      "x-csrf-token" : 'fetch'
    }
  };  
  
  let documents;
  await axios(configGet)
  .then((response) => {
      documents = JSON.stringify(response.data, null, 4 /*identation */);
      console.log(documents);
      console.log(response.status);
  })
  .catch((error) => {
      console.log(error);
  });


  return documents;

}


// https://github.tools.sap/partnereng/ATEAM/blob/master/SAC_EMBEDDED/isveng-cf.md#authentication

async function sac_get_tenant_config(path) {  
  // https://stackoverflow.com/questions/51140733/axios-equivalent-of-this-curl-command
  // curl --user 'sb-9c4a965b-341e-4677-b015-b99969cc2ebc!b195|sac-embedded-edition-sb!b25':'+Xmf6+mwvNIQ2bcjbu/kYkzsHAM=' --header "Content-Type: application/json" --request POST https://isveng-cf.authentication.jp10.hana.ondemand.com/oauth/token?grant_type=client_credentials
  
  let config = {
    method: 'post',
    url: 'https://isveng-cf.authentication.jp10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
    
    //withCredentials: true,
      auth: {
          username: 'sb-9c4a965b-341e-4677-b015-b99969cc2ebc!b195|sac-embedded-edition-sb!b25',
          password: '+Xmf6+mwvNIQ2bcjbu/kYkzsHAM='
      },
      headers: { 
      //"Accept": "application/json",
      "Content-Type": "application/json"
    }
  };  
  let logonToken;

  //axios.defaults.headers.post['Content-Type'] = 'application/json';
  //await axios.post(config.url, config.data, config.headers)
  await axios(config)
  .then((response) => {
    logonToken = response.data.access_token;
    console.log("data: '%s'", JSON.stringify(response.data));
    console.log("logonToken: '%s'", logonToken);
    console.log("logonToken with parse: '%s'", JSON.parse(logonToken));
    console.log("logonToken with stringify: '%s'", JSON.stringify(logonToken));
    console.log(response.status);
  })
  .catch((error) => {
    console.log(error);
    return JSON.stringify(error);
  });

  // This token grants access to the SAP Analytics Cloud tenant management API of the subaccount on the landscape where the service instance is created.
  //return logonToken;

  let configGet = {
    method: 'get',
    url: 'https://sac-embedded-edition-tm-sac-sacjp10.cfapps.jp10.hana.ondemand.com/api/v1/tenant/647eea61-5e1e-4c8c-8d1e-0c08030826f4' + path,
    //withCredentials: true,
    headers: { 
      "Authorization": 'Bearer ' + logonToken,
      //"Accept": "application/json",
      "Content-Type": "application/json",
      //'x-sap-sac-custom-auth': 'true',
      "x-csrf-token" : 'fetch'
    }
  };  
  
  let documents;
  await axios(configGet)
  .then((response) => {
      documents = JSON.stringify(response.data, null, 4 /*identation */);
      console.log(documents);
      console.log(response.status);
  })
  .catch((error) => {
      console.log(error);
  });


  return documents; 

}


async function sac_story2(path){   
    let result; 
    let url = "https://<TENANT>/sap/fpa/ui/tenants/<TENANT_ID>/bo/story/<STORY_ID>";      //<<<<<<<<<<<<<<<<<<<<< NEEDS TO BE ADJUSTED!
    let data = {};
    
    // https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com/oauth/token
    // https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/tenants/893f6/app.html#;view_id=story;storyId=A6AC2AF20FEDCCC66ED0A161324E7419
  
    await axios.get("https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/app.html#;view_id=story;storyId=A6AC2AF20FEDCCC66ED0A161324E7419;mode=embed", {
    //await axios.get("https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/app.html#;view_id=story;storyId=A6AC2AF20FEDCCC66ED0A161324E7419" + path, {  
      //responseType : "document",
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }).then(function(response) {
      console.log('Authenticated');
      //console.log(response.data);
      result = response.data; // JSON.stringify(response.data, null, 4);
      //console.log(result);
      //console.log(response.data);
      console.log(response.status);
      console.log(response.statusText);
      console.log(response.headers);
      console.log(response.config);
       
    }).catch(function(error) {
      console.log(error);
      return error;
    });
    
    //result = await axios.get("http://myhana:8090/");
    return result;
}


// storyId=A6AC2AF20FEDCCC66ED0A161324E7419
//const story_url = "https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/tenants/893f6/bo/story/A6AC2AF20FEDCCC66ED0A161324E7419?mode=embed&pageBar=disable";


// storyId=7E0050581E24D39CE10000000A784278
const story_url = "https://oncdygdf2ke3quyccvxcwst.jp10.sac.ondemand.com/sap/fpa/ui/tenants/893f6/bo/story/7E0050581E24D39CE10000000A784278?mode=embed&pageBar=disable";


async function sac_story(logonToken) {  
  // https://stackoverflow.com/questions/51140733/axios-equivalent-of-this-curl-command
  // curl --user 'sb-3bb95f9c-2714-4f79-872e-bcafa8e30349!b342|client!b25':'5tlJc0bXerZ+yIIVEjTUiP7t1Zk=' --header "Content-Type: application/json" --request POST https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com/oauth/token?grant_type=client_credentials  
  
  /*
  let config = {
    method: 'post',
    url: 'https://oncdygdf2ke3quyccvxcwst.authentication.jp10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
    //withCredentials: true,
      auth: { username: 'sb-92334064-9c48-4a86-a298-d405ad031723!b342|client!b25', password: 'OEEGhZ8OUsh9nPNphtHAGqWdktc='},
      headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };  
  let logonToken;

  await axios(config)
  .then((response) => {
    logonToken = response.data.access_token;
    console.log("data: '%s'", JSON.stringify(response.data));
    console.log("logonToken: '%s'", logonToken);
    //console.log("logonToken with parse: '%s'", JSON.parse(logonToken));
    //console.log("logonToken with stringify: '%s'", JSON.stringify(logonToken));
    console.log(response.status);
  })
  .catch((error) => {
    console.log(error);
    return JSON.stringify(error);
  });

  //return logonToken;
  */

  let configGet = {
    method: 'get',
    url: story_url,
    //withCredentials: true,
    responseType: 'test/html',
    headers: { 
       "Authorization": 'Bearer ' + logonToken,
      //"Accept": "application/json",
      "Content-Type": "application/json"
      //"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      //"Accept-Language": "en-US,en;q=0.9",
      //"Accept-Encoding": "gzip, deflate, br"
      //"x-csrf-token" : 'fetch'
    }
  };  
  
  let documents = {};
  await axios(configGet)
  .then((response) => {
      documents = response.data; //JSON.stringify(response.data);//response.data;
      console.log("sac_story data: " + JSON.stringify(response.data));
      console.log("sac_story config: " + JSON.stringify(response.config));
      console.log("sac_story response headers: " + JSON.stringify(response.headers));

      console.log("sac_story status: " + response.status);
  })
  .catch((error) => {
      console.log(error);
  });

  return documents;
}



function tohtml(document) {
  // https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Styling_tables


  let dynamicHtml = `<iframe src="${document}"></iframe>`;

  //         font-family: 'Rock Salt', cursive;
  //         font-family:"Courier New", Courier, monospace;
  //  ${dynamicHtml}
  const html = `
  <!DOCTYPE html>
  <title>SACee Embedding from Kyma</title>
  <html>
      <style>
      h1 { color: #73757d; }
      iframe {
        width: 100%;
        height: 900px;
      }
      html {
        font-family: Verdana, sans-serif
      }
    </style>
    <body>
      <h1>${"sacee"}</h1>
      ${dynamicHtml}       
    </body>
  </html>`;  
  
  return html;
}


function tohtml2(document) {
  // https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Styling_tables


  //let dynamicHtml = `<iframe src="${document}"></iframe>`;
  let dynamicHtml = `
     <script>
        $("button").click(function () {
                    var url = "${document}"; 
                    $("iframe").attr("src", url);
                });
    </script> `;
  
  //         font-family: 'Rock Salt', cursive;
  //         font-family:"Courier New", Courier, monospace;
  //  ${dynamicHtml}
  const html = `
  <!DOCTYPE html>
  <title>SACee Embedding from Kyma</title>
  <html>
      <style>
      h1 { color: #73757d; }
      iframe {
        width: 100%;
        height: 900px;
      }
      html {
        font-family: Verdana, sans-serif
      }
    </style>
    <body>
      <h1>${"sacee"}</h1>
        <button type="button">Display Story from Kyma</button>
        <iframe id="attachframe"></iframe>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        ${dynamicHtml}
    </body>
  </html>`;  
  
  return html;
}



function tohtml3(document, accessToken) {
  // https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Styling_tables


  //let dynamicHtml = `<iframe src="${document}"></iframe>`;
  let dynamicHtml = `
  <button type="button">Display Story from Kyma</button>
  <iframe id="attachframe"></iframe>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script>
    $("button").click(function () {
                    var url = "${document}"; 
                    var token = '${accessToken}';
                    var postheaders = {
                        'Authorization': 'Bearer ' + token,
                    };

                    // 2. step: get the SAC story
                    $.ajax({
                        type: 'GET',
                        url: url,
                        contentType: 'application/json',
                        headers: postheaders,
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data, status, settings) {
                            console.log(settings.getResponseHeader("X-CSRF-Token"));
                            console.log(JSON.stringify(data));

                            $("iframe").attr("src", url);
                        },

                        error: function (xhr, ajaxOptions, thrownError) {
                            alert(xhr.status);
                            alert(thrownError);
                        }
                    });
     });               
    </script> `;
  
  //         font-family: 'Rock Salt', cursive;
  //         font-family:"Courier New", Courier, monospace;
  //  ${dynamicHtml}
  const html = `
  <!DOCTYPE html>
  <title>SACee Embedding from Kyma</title>
  <html>
      <style>
      h1 { color: #73757d; }
      iframe {
        width: 100%;
        height: 900px;
      }
      html {
        font-family: Verdana, sans-serif
      }
    </style>
    <body>
      <h1>${"sacee"}</h1>
        ${dynamicHtml}
    </body>
  </html>`;  
  
  return html;
}



const redirecturi = 'https://sac-story.c-902a2cf.kyma.shoot.live.k8s-hana.ondemand.com/callback';
//const redirecturi = 'http://localhost:8091/callback';

const logonresponse = 'https://sac-story.c-902a2cf.kyma.shoot.live.k8s-hana.ondemand.com/logonresponse';

async function authorizationcode(event) {
    console.log("inside authorizationcode");

    let authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: redirecturi

    });

    console.log("authorizationUri: " + authorizationUri);
    return event.extensions.response.redirect(authorizationUri);
}


function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}


async function callback(event) {
  console.log("inside callback");

  // the authorization code is sent to the path /callback. 
  let code = event.extensions.request.query.code; // http://localhost:8091/callback?code=A6kdxy9hR8
  console.log("Authorization Code: " + code);

  let tokenConfig = {
      code: code,
      redirect_uri: redirecturi
  };

  let token;
  // 2. get the access token:
  await oauth2.authorizationCode.getToken(tokenConfig)
      .then((result) => {
          token = oauth2.accessToken.create(result);
          console.log("Access Token: " + token.token.access_token);
      })
      .catch((error) => {
          console.log('Access Token Error', error.message);
      });

    //return event.extensions.response.redirect('/logonresponse');
    //await sleep(2000);
/*
    let document;
    sac_story(token.token.access_token)
        .then((result) => {
          console.log('mydocument2: ' + JSON.stringify(result));
          document = result;
      })
      .catch((error) => {
          console.log('sac_story Error2', error.message);
      });
 
  await sleep(2000);*/
    // https://stackoverflow.com/questions/38884522/why-is-my-asynchronous-function-returning-promise-pending-instead-of-a-val/53571207
     // Promise { <pending> }
    
    // https://stackoverflow.com/questions/52669596/promise-all-with-axios

    html = tohtml3(story_url, token.token.access_token);
    
    //console.log("sac_story html: " + html);
      
    return event.extensions.response.send(html);
}

module.exports = { 
  main: function (event, context) {
    
    /*
    passport.initialize(); 
    passport.authenticate('JWT', { session: false });
    */
    cors();  
    //return sac_get_access_token("/stories");
    //return sac_get_tenant_config(event.extensions.request.path);
    
    // https://stackoverflow.com/questions/54384896/handling-redirects-with-axios-in-browser
    console.log("event.extensions.request.path: " + event.extensions.request.path);
    
    switch (event.extensions.request.path) {
      case '/authorizationcode': {
        return authorizationcode(event);
      }
      
      case '/logonresponse' : {
        console.log("inside logonresponse");
        return;
      }
      
      case '/callback': {
        return callback(event);
      }

/*
      default: {
        let html = tohtml(story_url);
        console.log("sac_story default html");
          
        return event.extensions.response.send(html);
      }
 */     
    }
    
    /*
    return sac_story(";mode=embed;pagebar=disable");
    return sac_get_access_token("/stories");
    return sac_get_tenant_config(event.extensions.request.path);
    
    return sac_get_access_token("/scim/Users");
    
    // check for GET params and use if available
    if (event.extensions.request.path != '/') {
      //dynamicHtml = `<p>Hey ${event.queryStringParameters.name}!</p>`;
      console.log('event.extensions.request.path: ');
      console.log(event.extensions.request.path);
      console.log(event.extensions.request.url);
      
      return sac_story(event.extensions.request.path);
    }
    return sac_story("mode=embed"); 
    */
  }
}
