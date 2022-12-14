const express = require('express');
require('dotenv').config();
const recipeRouter = express.Router();
const authenticate = require('../authenticate');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const axios = require('axios');
const cors = require('./cors');

const baseUrl = 'https://api.spoonacular.com/recipes';
const key = process.env.SPOONACULAR_API_KEY;

recipeRouter.route('/searchByIngredient')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    axios.get(`${baseUrl}/findByIngredients?apiKey=${key}&ingredients=${req.query.ingredients}&number=${req.query.number}`)
    .then(response => {
        console.log(JSON.stringify(response.data, null, 2));
        res.statusCode=200;
        res.setHeader('Content-Type', 'text/json');
        res.json(response.data)
    })
})

recipeRouter.route('/random')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    axios.get(`${baseUrl}/random?apiKey=${key}`)
    .then(response => {
        console.log(JSON.stringify(response.data, null, 2));
        res.statusCode=200;
        res.setHeader('Content-Type', 'text/json');
        res.json(response.data)
    })
})


recipeRouter.route('/')
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


recipeRouter.route('/:savedRecipeId')
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

module.exports = recipeRouter;