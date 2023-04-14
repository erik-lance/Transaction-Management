const express = require('express'); // Import express

const controller = require('../controllers/controller.js');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', './views');

// GET
app.get('/', controller.home);                  // Gets home page
app.get('/movies', controller.movies);          // Gets movies page
app.get('/moviesData', controller.moviesData);  // Gets data on movies for DataTables
app.get('/add', controller.add);                // Gets add database page
app.get('/edit', controller.edit);              // Gets edit database page

// POST
app.post('/addMovie', controller.addMovie);
app.post('/edit/update/:id', controller.update);
app.post('/delete/:id', controller.delete);



module.exports = app;