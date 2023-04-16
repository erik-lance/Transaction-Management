const mysql = require("mysql2");
const conn = require("../models/conn.js");
const dotenv = require("dotenv").config({path: './.env'});

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
        const data = {
            title: "Movies",
            styles: [],
            scripts: ["loadMovies.js"],
        }
        res.render("movies", data);
    },

    moviesData: async (req, res) => {
        async function connectionReRoute() {
            try {
                let connection = await conn.node_1.getConnection();
                node = conn.node_1;
            } catch (err) {
                try {
                    let connection = await conn.node_2.getConnection();
                    node = conn.node_2;
                } catch (err) {
                    try {
                        let connection = await conn.node_3.getConnection();
                        node = conn.node_3;
                    } catch (err) {
                        console.log(err);
                        res.status(500).send('Error retrieving data from database');
                    }
                }
            }
        }

        console.log("Getting data...");
        let node;
        
        await connectionReRoute();

        conn.dbQuery(node, "SELECT * FROM movies", [], (err, result) => {
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
                if (node === conn.node_1) {
                    res.json({ data });
                } else {
                    conn.dbQuery(node === conn.node_2 ? conn.node_3 : conn.node_2, "SELECT * FROM movies", [], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send('Error retrieving data from slave');
                        } else {
                            const data2 = result.map(row => {
                                return {
                                    id: row.id,
                                    name: row.name,
                                    year: row.year,
                                    rank: row.rank,
                                    genre: row.genre
                                };
                            });
                            const combinedData = data.concat(data2);
                            const uniqueData = [...new Map(combinedData.map(item => [item.id, item])).values()];
                            uniqueData.sort((a, b) => a.id - b.id);
                            res.json({ data: uniqueData });
                        }
                    });
                }
            }
        });
    },    

    connections: async (req, res) => {
        console.log("RETRIEVING CONNECTIONS");
        // Gets connections of all 3 nodes and store into an array
        const connections = [];

        // Check connection status for node 1
        try {
            await conn.node_1.getConnection();
            connections.push(1); // Connected
        } catch (err) {
            connections.push(0); // Not connected
        }

        // Check connection status for node 2
        try {
            await conn.node_2.getConnection();
            connections.push(1); // Connected
        } catch (err) {
            connections.push(0); // Not connected
        }

        // Check connection status for node 3
        try {
            await conn.node_3.getConnection();
            connections.push(1); // Connected
        } catch (err) {
            connections.push(0); // Not connected
        }

        // Returns the array of connections
        res.json({ data: connections });
    },    
    

    add: (req, res) => {
        res.render("add");
    },

    edit: (req, res) => {
        const data = {
            title: "Edit",
            styles: [],
            scripts: ["editPage.js"],
        }
        res.render("edit", data);
    },

    editForm: (req, res) => {
        let node;
        if (process.env.NODE_NUM_CONFIGURATION == 2) {
            node = conn.node_2;
        } else if (process.env.NODE_NUM_CONFIGURATION == 3) {
            node = conn.node_3;
        } else {
            node = conn.node_1;
        }
        const movieId = req.params.id;
        conn.dbQuery(node, "SELECT * FROM movies WHERE id = ?", [movieId], (err, result) => {
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

        conn.dbQuery(conn.node_self, "INSERT INTO movies SET ?", movie, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Movie added to master');
            }
        });

        let node = year < 1980 ? conn.node_2 : conn.node_3;

        // Insert movie into slave
        // 
        conn.dbQuery(node, "INSERT INTO movies SET ?" , movie, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error adding movie. Please contact administrator.');
            } else {
                console.log('Movie added to slave');
                res.redirect('/movies');
            }
        });
    },

    delete: (req, res) => {
        const movieID = req.params.id;
        const year = req.params.year;
        conn.dbQuery(conn.node_self, "DELETE FROM movies WHERE id = ?", [movieID], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Movie ID ${movieID} deleted from master`);
            }
        });
        let node = year < 1980 ? conn.node_2 : conn.node_3;
        conn.dbQuery(node, "DELETE FROM movies WHERE id = ?", [movieID], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error deleting movie. Please contact administrator.');
            } else {
                console.log(`Movie ID ${movieID} deleted from slave`);
                res.json({success: true});
            }
        });
    },

    update: (req, res) => {
        const { name, year, rank, genre } = req.body;
        const movieId = req.params.id;
        const trueYear = req.params.year;
    
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
        
        conn.dbQuery(conn.node_self, query, queryValues, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Movie ID ${movieId} edited in master`);
            }
        });
    
        queryValues.length = 0;
        query = "";
        
        // For slave
        let node;
        if(trueYear < 1980){
            node = conn.node_2;
            query = "UPDATE movies SET ";
        }
        else{
            node = conn.node_3;
            query = "UPDATE movies SET ";
        }
    
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
    
        conn.dbQuery(node, query, queryValues, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error editing movie. Please contact administrator.");
            } else {
                console.log(`Movie ID ${movieId} edited in slave`);
                res.redirect('/edit');
            }
        });
    }
    
    
};



module.exports = controller;
