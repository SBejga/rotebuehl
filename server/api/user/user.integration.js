/**
 * Created by basti on 25.01.16.
 */
var server = require('../../app.js');
var request = require('supertest');
var log4js = require('log4js');
var assert = require('assert');
var crypto = require('crypto');

var User = require('./user.model');

//Logging
console.log('\x1B[35mATTENTION: from here - replaced console by log4js logger. And Normally console logger will not use console.log!\x1B[39m\n');

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
  var activationToken;

  describe('POST /users with allowed email domain', function () {
    var response;

    before(function(done) {
      request(server)
        .post('/api/users/')
        //postmaster@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org
        .send({ name: randomName, email: randomId+".dhbw@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org", password: "sandboxb34dd846552945b1a9ea8e6c7c92b36a"})
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            console.log(res);
            return done(err);
          }
          response = res;

          done();
        });
    });

    it("should allow email domain == dhbw@sandbox*.mailgun.org", function () {
      assert.notEqual(response.body.token, null);
    });

    it("should exists user", function (done) {
      User.findOne({name: randomName}, function (err, doc) {
        if (err) {
          done(err);
        }
        assert.notEqual(doc, null);
        assert.equal(doc.email, randomId+".dhbw@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org");
        assert.equal(doc.activated, false);
        assert.notEqual(doc.activationToken, null);

        activationToken = doc.activationToken;

        done();
      });
    });

    //it("should received mail", function(done) {
    //  request("https://api.mailgun.net/v3/")
    //    .get(process.env.MAILGUN_DOMAIN+"/events?limit=20&event=stored")
    //    .auth("api", process.env.MAILGUN_APIKEY)
    //    .end(function (err, res) {
    //      if (err) {
    //        done(err)
    //      }
    //
    //      assert.notEqual(res.body, null);
    //      assert.notEqual(res.body.items, null);
    //      assert.notEqual(res.body.items[0], null);
    //
    //
    //      console.log("epoch seconds", time);
    //      console.log("last stored mail", res.body.items[0]);
    //
    //      done();
    //    })
    //
    //})
  });

  console.log("==========================");
  console.log(randomId);
  console.log("==========================");

  describe("Activation", function () {
    var response;

    before(function(done) {
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
        assert.equal(doc.email, randomId+".dhbw@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org");
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
