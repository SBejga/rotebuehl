/**
 * Created by basti on 25.01.16.
 */
var server = require('../../app.js');
var request = require('supertest');
var log4js = require('log4js');
var assert = require('assert');
var crypto = require('crypto');

var User = require('./user.model');
var contextio = require('../../components/contextio/contextio');

//Logging
//console.log('\x1B[35mATTENTION: from here - replaced console by log4js logger. And Normally console logger will not use console.log!\x1B[39m\n');

var logger = log4js.getLogger("int tests");

describe('Auth API:', function() {

  describe('POST /users with wrong email domain', function () {
    var response;

    before(function(done) {
      request(server)
        .post('/api/users/')
        //postmaster@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org
        .send({ name: "Wrong Emaildomain", email: "acc@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org", password: "sandboxb34dd846552945b1a9ea8e6c7c92b36a"})
        .set('Accept', 'application/json')
        .expect(403)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          response = res;

          done();
        });
    });

    it("should restrict email domain != dhbw-stuttgart", function () {
      assert.equal(response.body.err == "restricted", true);
    })
  });

  //time of created user;
  var randomId = crypto.randomBytes(16).toString('hex').toLowerCase();
  var randomName = randomId;
  var email = randomId+".dhbw@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org";
  var activationToken, activationUrl;

  console.log("==========================");
  console.log("Name: ", randomName);
  console.log("Email: ", email);
  console.log("==========================");

  describe('POST /users with allowed email domain', function () {
    var response;

    //default timeout for testsuite/mocha is 2000ms
    this.timeout(6*60*1000); //6min

    before(function(done) {
      request(server)
        .post('/api/users/')
        //postmaster@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org
        .send({ name: randomName, email: email, password: "sandboxb34dd846552945b1a9ea8e6c7c92b36a"})
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            console.log(res);
            return done(err);
          }
          response = res;

          console.log("email sent: " + email);

          done();
        });
    });

    it("should allow email domain == dhbw@sandbox*.mailgun.org", function () {
      assert.notEqual(response.body.token, null);
    });

    var REGEX_ACTIVATELINK = /\/api\/users\/activate\/([A-Za-z0-9]+)/g;

    it("should received mail", function(done) {

      var checkForMail = function () {

        contextio.getMessages(function (err, messages) {
          if (err) {
            console.error(err);
            assert.ifError(err);
          }

          var mailmessage = null;
          for (var i in messages) {
            var msg = messages[i];
            if (msg.addresses && msg.addresses.to &&
              msg.addresses.to[0] && msg.addresses.to[0].email) {

              //console.log("found email: " + msg.addresses.to[0].email);

              if (msg.addresses.to[0].email === email) {
                console.log("Yes, Found email in mailbox", msg.message_id);
                mailmessage = msg;

                assert.equal(msg.subject, "Your Registration");
              }
            }
          }

          //notfound, try again up to 10 times
          if (mailmessage === null) {
            if (checkMailCounter < 10) {
              checkMailCounter++;
              console.log('checkForMail attempt #'+checkMailCounter);
              setTimeout(checkForMail, checkMailWaittime);
            } else {
              assert.equal(mailmessage, true, "mail should found in mailbox");
            }
          } else {
            //mailfound
            contextio.getMessageBody(msg.message_id, function (err, message) {
              if (err) {
                console.error(err);
                assert.ifError(err);
              }

              assert.notEqual(message.bodies, null);
              assert.notEqual(message.bodies[0], null);
              assert.notEqual(message.bodies[0].content, null);

              var body = message.bodies[0].content;
              var matches = REGEX_ACTIVATELINK.exec(body);

              activationUrl = matches[0];
              activationToken = matches[1];

              contextio.deleteMessage(msg.message_id, function (err, res) {
                assert.ifError(err);
                assert.notEqual(res, null, "message deletion response");
                assert.equal(res.success, true, "success of message deletion");

                console.log("message deleted: ", msg.message_id);

                //done testcase
                done();
              });
            });
          }
        });
      };

      var checkMailCounter = 1;
      var checkMailWaittime = 30*1000;
      setTimeout(checkForMail, checkMailWaittime);
    })
  });

  describe("Activation", function () {
    var response;

    before(function(done) {

      assert.notEqual(activationToken, null);

      request(server)
        .get('/api/users/activate/'+activationToken)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          response = res;
          done();
        });
    });

    it("should activate user", function (done) {
      assert.notEqual(response.body, null);
      assert.notEqual(response.body.profile, null);
      assert.equal(response.body.result, true);
      assert.equal(response.body.profile.activated, true);

      User.findOne({name: randomName}, function (err, doc) {
        if (err) {
          done(err);
        }
        assert.notEqual(doc, null);
        assert.equal(doc.email, email);
        assert.equal(doc.activated, true);
        assert.equal(doc.activationToken, '');

        done();
      });
    });
  });

  describe("Wrong Activation", function () {
    var response;

    before(function(done) {
      request(server)
        .get('/api/users/activate/'+activationToken+'xxxxxxx')
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          response = res;
          done();
        });
    });

    it("should fail activate user", function () {
      assert.equal(response.body.result, undefined);
      assert.equal(response.body.profile, undefined);
    });
  })

});
