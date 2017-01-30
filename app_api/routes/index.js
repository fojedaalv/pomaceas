var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

//var ctrlEvents = require('../controllers/events');
var ctrlAuth = require('../controllers/authentication');
var ctrlUsers = require('../controllers/users');

/*
router.get('/events', ctrlEvents.eventsList);
router.post('/events', auth, ctrlEvents.eventsCreate);
router.get('/events/:eventId', ctrlEvents.eventsReadOne);
router.put('/events/:eventId', auth, ctrlEvents.eventsUpdateOne);
router.delete('/events/:eventId', auth, ctrlEvents.eventsDeleteOne);
*/

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router.get('/users',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.list);
router.get('/users/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.readOne);
router.put('/users/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.updateOne);
router.delete('/users/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.deleteOne);

module.exports = router;
