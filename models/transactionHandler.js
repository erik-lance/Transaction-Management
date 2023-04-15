const mysql = require("mysql2");
const retry = require("retry");
const dotenv = require("dotenv").config({path: './.env'});
const conn = require("../models/conn.js");

function storeQuery(dbPool, query, content) {
    let t_type = query.split(" ")[0];   // Get the first word of the query
    let t_dest = [];    // Destination node(s) for the transaction

    // Determine the destination node(s) for the transaction   
    let hostname = dbPool.config.connectionConfig.host; 
    if (hostname == '10.0.0.4') { t_dest = 1 }
    else if (hostname == '10.0.0.5') { t_dest = 2 }
    else if (hostname == '10.0.0.6') { t_dest = 3 }
    else {
        t_dest = -1
        console.log("Error: Unknown hostname");
    }

    // Insert into local logs
    let localQuery = "INSERT INTO mco2_logs (name, year, `rank`, genre, t_type, t_dest) VALUES (?, ?, ?, ?, ?, ?)";
    let localContent = [content.name, content.year, content.rank, content.genre, t_type, t_dest];

    conn.node_self.query(localQuery, localContent, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Local log inserted: "+result);
        }
    });

}

module.exports = { storeQuery };