const mysql = require("mysql2");
const conn = require("../models/conn.js");

const controller = {
    home: (req, res) => {
        const data = {
            title: "Home",
            styles: ["index.css"],
            scripts: ["scripts.js"],
        }
        res.render("index", data);
    },

    movies: (req, res) => {
        conn.node_self.query("SELECT * FROM movies", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error opening page');
            } else {
                const data = {
                    title: "Movies",
                    styles: [],
                    scripts: ["loadMovies.js"],
                    movies: result,
                }
                res.render("movies", data);
            }
        });
    },

    moviesData: (req, res) => {
        conn.node_self.query("SELECT * FROM movies", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error retrieving data from database');
            } else {
                const data = result.map(row => {
                    return {
                        id: row.id,
                        name: row.name,
                        year: row.year,
                        rank: row.rank,
                        genre: row.genre
                    };
                });
                res.json({ data });
            }
        });
    },

    add: (req, res) => {
        res.render("add");
    },
    
    addMovie: (req, res) => {
        console.log(req.body);
        const { name, year, rank, genre } = req.body;
        const movie = { name, year, rank, genre };

        conn.node_self.query('INSERT INTO movies SET ?', movie, (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send('Error adding movie. Please contact administrator.');
            } else {
              console.log('Movie added to database');
              res.redirect('/movies');
            }
          });
        }
    };

module.exports = controller;