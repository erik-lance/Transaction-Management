const express = require('express'); // Import express
const path = require('path');

const controller = require('../controllers/controller.js');

const app = express();

app.set('views', path.join(__dirname, '../views'));

// GET
app.get('/', controller.home);

// POST
// app.post('/addMovie', controller.addMovie);


module.exports = app;