const mysql = require("mysql2");
const retry = require("retry");
const dotenv = require("dotenv").config({path: './.env'});
const conn = require("../models/conn.js");

/**
 * This function is used to recover transactions that were not
 * successfully committed to the database. It starts inserting
 * transactions from the local logs into the database.
 * 
 * If the transaction is successfully committed, else, it is
 * left in the local logs.
 */
function recoverTransactions() {
    const [node_1_logs] = []
    const [node_2_logs] = []
    const [node_3_logs] = []

    // Get node 1 logs
    conn.dbQuery(conn.node_1, "SELECT * FROM mco2_logs", [], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < result.length; i++) {
                node_1_logs.push(result[i]);
            }
        }
    });

    // Get node 2 logs
    conn.dbQuery(conn.node_2, "SELECT * FROM mco2_logs", [], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < result.length; i++) {
                node_2_logs.push(result[i]);
            }
        }
    });

    // Get node 3 logs
    conn.dbQuery(conn.node_3, "SELECT * FROM mco2_logs", [], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < result.length; i++) {
                node_3_logs.push(result[i]);
            }
        }
    });

    // Inserts the logs into the database
    for (let i = 0; i < 3; i++) {
        let node = [];
        let node_logs = [];
        switch(i) {
            case 0:
                node = conn.node_1;
                node_logs = node_1_logs;
                break;
            case 1:
                node = conn.node_2;
                node_logs = node_2_logs;
                break;
            case 2:
                node = conn.node_3;
                node_logs = node_3_logs;
            default:
                console.log("Error: Unknown node");
                break;
        }

        for (let j = 0; j < node_logs.length; j++) {
            let log = node_logs[i];
            let query = "INSERT INTO movies (name, year, `rank`, genre) VALUES (?, ?, ?, ?)";
            let content = [log.name, log.year, log.rank, log.genre];
            conn.dbQuery(conn.node, query, content, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Recovered transaction: "+result);
                }
            });
        }
    }
}

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