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

    edit: (req, res) => {
        conn.node_self.query("SELECT * FROM movies", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error opening page');
            } else {
                const data = {
                    title: "Edit",
                    styles: [],
                    scripts: ["editPage.js"],
                    movies: result,
                }
                res.render("edit", data);
            }
          });
        },

    editForm: (req, res) => {
        const movieId = req.params.id;
        conn.node_self.query("SELECT * FROM movies WHERE id = ?", [movieId], (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send('Error retrieving movie information. Please contact administrator.');
            }
            else {
                res.render('editForm', { movie: result[0] });
            }
          });
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
        },

    delete: (req, res) => {
        const movieID = req.params.id;
        conn.node_self.query("DELETE FROM movies WHERE id = ?", [movieID], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error adding movie. Please contact administrator.');
              } else {
                console.log(`Movie ID ${movieID} deleted from database`);
                res.json({success: true});
              }
        });
    },

    update: (req, res) => {
        const { name, year, rank, genre } = req.body;
        const movieId = req.params.id;
      
        const queryValues = [];
        let query = "UPDATE movies SET ";
      
        if (name !== undefined && name !== '') {
          query += " name = ?,";
          queryValues.push(name);
        } else {
          query += " name = NULL,";
        }
      
        if (year !== undefined && year !== '') {
          query += " year = ?,";
          queryValues.push(year);
        } else {
          query += " year = NULL,";
        }
      
        if (rank !== undefined && rank !== '') {
          query += " `rank` = ?,";
          queryValues.push(rank);
        } else {
          query += " `rank` = NULL,";
        }
      
        if (genre !== undefined && genre !== '') {
          query += " genre = ?,";
          queryValues.push(genre);
        } else {
          query += " genre = NULL,";
        }
      
        // Remove the last comma from the query string
        query = query.slice(0, -1);
      
        query += " WHERE id = ?";
        queryValues.push(movieId);
      
        conn.node_self.query(query, queryValues, (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error editing movie. Please contact administrator.");
          } else {
            console.log(`Movie ID ${movieId} edited in database`);
            res.redirect("/edit");
          }
        });
    }
};

    

module.exports = controller;