const express = require('express'); // Import express

const controller = require('../controllers/controller.js');

const app = express();

app.set('views', './views');

// GET
app.get('/', controller.home);                  // Gets home page
app.get('/movies', controller.movies);          // Gets movies page
app.get('/moviesData', controller.moviesData);  // Gets data on movies for DataTables

// POST
// app.post('/addMovie', controller.addMovie);


module.exports = app;