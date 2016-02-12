/**
 * Created by basti on 26.01.16.
 */

var CONTEXTIO_APIKEY = process.env.CONTEXTIO_APIKEY;
var CONTEXTIO_SECRET = process.env.CONTEXTIO_SECRET;
var CONTEXTIO_MAINACCOUNTID = process.env.CONTEXTIO_MAINACCOUNTID;

if (!CONTEXTIO_APIKEY || !CONTEXTIO_SECRET || !CONTEXTIO_MAINACCOUNTID) {
  console.error("no context.io env settings!");
  process.exit(1);
}

//Context.io (simple) uses OAuth 1.0 2-legged. (no consumer key, secret)

var OAuth = require('oauth');
var oauth = new OAuth.OAuth(
  '',
  '',
  CONTEXTIO_APIKEY,
  CONTEXTIO_SECRET,
  //'1.0A',
  '1.0',
  null,
  'HMAC-SHA1'
);

var getMessages = function (callback, folder, label, limit) {
  if (!folder) {
    folder = "Inbox";
  }
  if (!label) {
    label = "0";
  }
  if (!limit) {
    limit = 10;
  }
  oauth.get(
    'https://api.context.io/lite/users/'+CONTEXTIO_MAINACCOUNTID+'/email_accounts/'+label+
    '/folders/'+folder+'/messages?limit='+limit,
    '', //no consumer key
    '', //no consumer secret
    function (e, data){
      try {
        var json = JSON.parse(data);
        callback(e, json);
      } catch(e) {
        callback(e, null);
      }
    });
};

var getMessageBody = function (messageId, callback, folder, label) {
  if (!messageId) {
    callback(new Error("no message id"), null);
  }
  if (!folder) {
    folder = "Inbox";
  }
  if (!label) {
    label = "0";
  }

  oauth.get(
    'https://api.context.io/lite/users/'+CONTEXTIO_MAINACCOUNTID+'/email_accounts/'+label+
    '/folders/'+folder+'/messages/' + messageId + "/body",
    '', //no consumer key
    '', //no consumer secret
    function (e, data){
      try {
        var json = JSON.parse(data);
        callback(e, json);
      } catch(e) {
        callback(e, null);
      }
    });
};

var deleteMessage = function (messageId, callback, folder, label) {
  if (!messageId) {
    callback(new Error("no message id"), null);
  }
  if (!folder) {
    folder = "Inbox";
  }
  if (!label) {
    label = "0";
  }

  oauth.put(
    'https://api.context.io/lite/users/'+CONTEXTIO_MAINACCOUNTID+'/email_accounts/'+label+
    '/folders/'+folder+'/messages/' + messageId + "?new_folder_id=Deleted",
    '', //no consumer key
    '', //no consumer secret
    '', //no body_payload
    'application/json', //content-type
    function (e, data){
      try {
        var json = JSON.parse(data);
        callback(e, json);
      } catch(e) {
        callback(e, null);
      }
    });
};

module.exports = {
  getMessages: getMessages,
  getMessageBody: getMessageBody,
  deleteMessage: deleteMessage
};
