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

async function recoverTransactions(connection, node_1, node_2, node_3) {
    const [node_1_logs] = await grabLogsOfPool(node_1);
    const [node_2_logs] = await grabLogsOfPool(node_2);
    const [node_3_logs] = await grabLogsOfPool(node_3);

    // Database Recovery
    console.log ("Recovering transactions...")
    // Logs
    console.log("Node 1 Logs: "+node_1_logs);
    console.log("Node 2 Logs: "+node_2_logs);
    console.log("Node 3 Logs: "+node_3_logs);

    // Inserts the logs into the database
    for (let i = 0; i < 3; i++) {
        let node_logs = [];
        switch(i) {
            case 0:
                node_logs = node_1_logs;
                break;
            case 1:
                node_logs = node_2_logs;
                break;
            case 2:
                node_logs = node_3_logs;
                break;
            default:
                console.log("Error: Unknown node");
                break;
        }

        for (let j = 0; j < node_logs.length; j++) {
            let log = node_logs[j];

            let logsSourceNode = [];
            if (i == 0) logsSourceNode = node_1;
            else if (i == 1) logsSourceNode = node_2;
            else if (i == 2) logsSourceNode = node_3;

            // Commit the transaction
            commitTransaction(log, logsSourceNode, node_1, node_2, node_3);
        }
    }
}

async function grabLogsOfPool(dbPool) {
    console.log("GRABBING LOGS")
    let logs = [];

    let connection = await dbPool.getConnection();

    const result = await dbPool.query("SELECT * FROM movies_logs");

    connection.release();

    for (let i = 0; i < result.length; i++) {
        logs.push(result[i]);
    }

    console.log("ACQUIRED LOGS")
    console.log(logs)
    return logs;
}

/**
 * This function is used to commit a transaction to the database.
 * @param {*} log The log to be committed
 * @param {*} currnode The node that is currently being used
 */
async function commitTransaction(log, currnode, node_1, node_2, node_3) {
    let query = "INSERT INTO movies (name, year, `rank`, genre) VALUES (?, ?, ?, ?)";
    let content = [log.name, log.year, log.rank, log.genre];

    // Set destination node
    let node = [];
    if (log.t_dest == 1) node = node_1;
    else if (log.t_dest == 2) node = node_2;
    else if (log.t_dest == 3) node = node_3;

    let connection = await node.getConnection();


    await connection.query(query, content, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Recovered transaction: "+result);

            // Delete the log from the local logs
            let deleteQuery = "DELETE FROM movies_logs WHERE id = ?";
            let deleteContent = [log.id];
            let deleteNode = currnode;

            deleteNode.query(deleteQuery, deleteContent, (err, result) => {
                if (err) {
                    console.log('Error during log deletion: ')
                    console.log(err);
                } else {
                    console.log("Local log deleted: "+result);
                }
            });
        }
    });
}

module.exports = { recoverTransactions };