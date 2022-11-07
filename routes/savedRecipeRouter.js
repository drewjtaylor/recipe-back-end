const express = require('express');
const savedRecipeRouter = express.Router();
const authenticate = require('../authenticate');
const Recipe = require('../models/Recipe');
const User = require('../models/User');



// This endpoint is for saved recipes for individual users. Users should be authenticated for most actions, and they should only be
// able to alter or view recipes on their own list.

savedRecipeRouter.route('/')
// get request list 
.get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
    .then(user => {
        res.statusCode=200;
        res.setHeader('Content-Type', 'text/json');
        res.json(user)
    })
})


.post(authenticate.verifyUser, (req, res, next) => {})
.put((req, res) => {})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {});

savedRecipeRouter.route('/:savedRecipeId')
.get(authenticate.verifyUser, (req, res, next) => {
    Recipe.findById(req.params.savedRecipeId)
    .then(recipe => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/json');
        res.json(recipe)
    })
    .catch(err => next(err))
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /savedRecipes/${req.params.eventId}.\nAdd an event by sending a POST request to /savedRecipes`)
})
// Put request checks for a user to be signed in. Then if the creator is the user, or if the user is an admin, it updates
.put(authenticate.verifyUser, (req, res, next) => {
    Event.findById(req.params.eventId)
    .then(event => {
        if (event.creator.equals(req.user._id) || req.user.admin) {
            if (req.body.description) {event.description = req.body.description};
            if (req.body.name) {event.name = req.body.name};
            if (req.body.eventDate) {event.eventDate = new Date(req.body.eventDate)};
            event.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/json')
            res.json(event)
        } else {
            const err = new Error('You must be an admin or the creator of the event to make changes');
            return next(err)
        };
    });
})

// Event creators, or any admin user may delete events.
.delete(authenticate.verifyUser, (req, res, next) => {
    Event.findById(req.params.eventId)
    .then(event => {
        if (event.creator.equals(req.user._id) || req.user.admin) {
            Event.findByIdAndDelete(req.params.eventId)
            .then(event => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/json')
                res.json(event)
            })
            .catch(err => next(err))
        } else {
            const err = new Error('You must be an admin or the creator of an event to delete it.');
            return next(err)
        }
    })
    .catch(err => next(err))
})

module.exports = savedRecipeRouter;