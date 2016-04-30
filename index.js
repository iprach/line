'use strict';
var _ = require('underscore');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var compress = require('compression');
var fs = require('fs');
var users = require('./users.json');
var app = express();
app.use(compress());
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/api', function (req, res) {
  res.send('Hello World!');
});

app.post('/api/line/callback', function (req, res) {
  console.log(JSON.stringify(req.body,null,4));
  var results = req.body.result;
  _.each(results,function(result){
	var content = result.content;
	if(result.eventType === '138311609000106303' ){
	//recieve text	
	   if(content.contentType === 1){
		var text = content.text;
		var sender = content.from;
		console.log('get text:',text,'from:',result.from);
		sendTextMessage(text,sender);
      	   }
	   else if (content.contentType === 8){
		var meta = {
			'STKID': content.contentMetadata.STKID,
			'STKPKGID': content.contentMetadata.STKPKGID,
			'STKVER': content.contentMetadata.STKVER
		};
		var sender = content.from;
		sendSticker(meta,sender);
	   }
        } else if (result.eventType === '138311609100106403' ){
	// added as friend
	   if(content.opType === 4){
		users.push(content.params[0]);
		users = _.uniq(users);
		fs.writeFile('./users.json',JSON.stringify(users),(err) => {
			if(err) console.log('error',err);
			console.log('saved new user:',content.params[0],'successfully.');
		});
	   }
        }		
  });
  res.sendStatus(200);
});

function sendSticker(contentMeta, sender){
   var options = {
	uri: 'https://trialbot-api.line.me/v1/events',
	method: 'POST',
	headers: {
	   'Host': 'trialbot-api.line.me',
	   'Content-type': 'application/json; charset=UTF-8',
	   'X-Line-ChannelID': 1465793725,
	   'X-Line-ChannelSecret': '68eac58053d0746e43946854fd4659f0',
	   'X-Line-Trusted-User-With-ACL': 'u64d7d55731505e0a1e8664b6d8c53925' 
	},
	body: {
	 'to': _.difference(users,[sender]),
 	 'toChannel': 1383378250,
	 'eventType': "138311608800106203",
	 'content':{
	  "contentType":8,
    	   "toType":1, 
	   "contentMetadata":contentMeta 
	   }
	 },
	json: true
   };
   request(options,function(err,res,body){
	if(err) console.error('error',err);
	console.log(body);
   });
}

function sendTextMessage(text,sender){
   var options = {
	uri: 'https://trialbot-api.line.me/v1/events',
	method: 'POST',
	headers: {
	   'Host': 'trialbot-api.line.me',
	   'Content-type': 'application/json; charset=UTF-8',
	   'X-Line-ChannelID': 1465793725,
	   'X-Line-ChannelSecret': '68eac58053d0746e43946854fd4659f0',
	   'X-Line-Trusted-User-With-ACL': 'u64d7d55731505e0a1e8664b6d8c53925' 
	},
	body: {
	 'to': _.difference(users,[sender]),
 	 'toChannel': 1383378250,
	 'eventType': "138311608800106203",
	 'content':{
	  "contentType":1,
    	   "toType":1, 
	   "text": text
	   }
	 },
	json: true
   };
   request(options,function(err,res,body){
	if(err) console.error('error',err);
	console.log(body);
   });
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
