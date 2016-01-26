/**
 * Created by basti on 26.01.16.
 */
'use strict';

var should = require('should');
var contextio = require('./contextio');
var assert = require('assert');

var message_id;

describe('Context.io', function() {

  describe('GET email messages', function() {
    var messages;

    before(function (done) {
      contextio.getMessages(function (err, data) {
        if (err) return done(err);

        messages = data;
        done();

      }, "Archive")
    });

    it('should get messages', function () {
      assert.notEqual(messages, null);
      messages.should.be.instanceof(Array);
      assert.equal(messages.length > 0, true);
      messages[0].message_id.should.not.be.null;

      message_id = messages[0].message_id;
    });

    var messageIdInFolderArchive = "<20160126081611.552.46267@sandboxb34dd846552945b1a9ea8e6c7c92b36a.mailgun.org>";

    it('should find message id', function () {
      messages.should.be.instanceof(Array);
      messages[0].should.not.be.null;
      messages[0].message_id.should.not.be.null;

      message_id = messages[0].message_id;

      assert.equal(message_id, messageIdInFolderArchive);
    });
  });

  describe('GET email message body', function() {

    var message;

    before(function (done) {
      contextio.getMessageBody(message_id, function (err, data) {
        if (err) return done(err);

        message = data;
        done();

      }, "Archive")
    });

    it('should respond with JSON object', function() {
      message.should.be.instanceof(Object);

      message._links.should.be.instanceof(Object);
      message.bodies.should.be.instanceof(Array);

      console.log(message.bodies[0]);
    });
  });
});


