/**
 * Created by basti on 26.01.16.
 */
var OAuth = require('oauth');
var oauth = new OAuth.OAuth(
  '',
  '',
  '', //api key
  '', //api secret
  //'1.0A',
  '1.0',
  null,
  'HMAC-SHA1'
);

oauth.get(
  'https://api.context.io/lite/users',
  '', //test user token
  '', //test user secret
  function (e, data, res){
    if (e) console.error(e);
    console.log("===== users =====");
    console.log(require('util').inspect(data));
  });

var id = "56a6aef6597ed642168b4567";
var label = 0;
var folder = "Inbox";

oauth.get(
  'https://api.context.io/lite/users/'+id+'/email_accounts/'+label+'/folders/'+folder+'/messages',
  '', //test user token
  '', //test user secret
  function (e, data, res){
    if (e) console.error(e);
    console.log("===== messages Inbox =====");
    console.log(require('util').inspect(data));
  });

var messageId = "<SNT147-W943F85E37C072C8733E903A4D80@phx.gbl>";

//PUT https://api.context.io/lite/users/id/email_accounts/label/folders/folder/messages/message_id
oauth.put(
  'https://api.context.io/lite/users/'+id+'/email_accounts/'+label+'/folders/'+folder+'/messages/' + messageId +
  "?new_folder_id=Deleted",
  '', //test user token
  '', //test user secret,
  '',
  'application/json',
  function (e, data, res){
    if (e) console.error(e);
    console.log("===== Move =====");
    console.log(require('util').inspect(data));
  });
