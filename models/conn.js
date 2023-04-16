const util = require("util");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config({path: './.env'});
const transactionHandler = require("../models/transactionHandler.js");

let node_host, node_user, node_password, node_database = [];

function switchConnection(config_num) {
    switch (config_num) {
        case -1:
            node_host = process.env.NODE_SELF_HOST;
            node_user = process.env.NODE_SELF_USER;
            node_password = process.env.NODE_SELF_PASS;
            node_database = process.env.MYSQL_DATABASE;
            break;
        case 1:
            node_host = process.env.NODE_1_HOST;
            node_user = process.env.MYSQL_USER;
            node_password = process.env.MYSQL_PASSWORD;
            node_database = process.env.MYSQL_DATABASE;
            break;
        case 2:
            node_host = process.env.NODE_2_HOST;
            node_user = process.env.MYSQL_USER;
            node_password = process.env.MYSQL_PASSWORD;
            node_database = process.env.MYSQL_DATABASE;
            break;
        case 3:
            node_host = process.env.NODE_3_HOST;
            node_user = process.env.MYSQL_USER;
            node_password = process.env.MYSQL_PASSWORD;
            node_database = process.env.MYSQL_DATABASE;
            break;
        default:
            node_host = process.env.NODE_SELF_HOST;
            node_user = process.env.NODE_SELF_USER;
            node_password = process.env.NODE_SELF_PASS;
            node_database = process.env.MYSQL_DATABASE;
            break;
    }
}

// Switch the connection based on the NODE_NUM_CONFIGURATION
// which is set in the .env file of each node server
switchConnection(process.env.NODE_NUM_CONFIGURATION);


const node_self = mysql.createPool({
    host: node_host,
    user: node_user,
    password: node_password,
    database: node_database,
    connectionLimit: 10,
});

const node_1 = mysql.createPool({
    host: process.env.NODE_1_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
});

const node_2 = mysql.createPool({
    host: process.env.NODE_2_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
});

const node_3 = mysql.createPool({
    host: process.env.NODE_3_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
});

node_self.on('connection', (connection) => {
    console.log('Connected to MySQL database: ' + node_user + '@' + node_host + '/' + node_database);
});

node_self.on('error', (err) => {
    console.log(`Error connecting to database of self: ${err}`);
});

node_1.on('connection', (connection) => {
    console.log('Connected to MySQL database: ' + process.env.MYSQL_USER + '@' + process.env.NODE_1_HOST + '/' + process.env.MYSQL_DATABASE);
});

node_1.on('error', (err) => {
    console.log(`Error connecting to database of Node 1: ${err}`);
});

node_2.on('connection', (connection) => {
    console.log('Connected to MySQL database: ' + process.env.MYSQL_USER + '@' + process.env.NODE_2_HOST + '/' + process.env.MYSQL_DATABASE);
});

node_2.on('error', (err) => {
    console.log(`Error connecting to database of Node 2: ${err}`);
});

node_3.on('connection', (connection) => {
    console.log('Connected to MySQL database: ' + process.env.MYSQL_USER + '@' + process.env.NODE_3_HOST + '/' + process.env.MYSQL_DATABASE);
});

node_3.on('error', (err) => {
    console.log(`Error connecting to database of Node 3: ${err}`);
});

// Wrap the pool's getConnection function to return a promise
// for consistency with async/await pattern
async function getConnection(pool) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }
            resolve(connection);
        });
    });
}

// This function is used to query the database with a transaction. It will handle
// transactions using a connection from the pool.
async function dbQuery(pool, query, content, callback) {
    let connection;
    try {
        // Get a database connection from the pool
        connection = await pool.getConnection();

        // Begin the transaction
        await connection.beginTransaction();

        // Perform the query within the transaction
        const result = await connection.query(query, content);

        // Commit the transaction
        await connection.commit();

        // Release the database connection back to the pool
        connection.release();

        return callback(null, result[0]);


    } catch (err) {
        console.log("ERROR IN DBQUERY: ")
        console.log(err);

        // If there is an error, rollback the transaction
        if (connection) await connection.rollback();

        // Call storeQuery with pool, query, and content
        // to store the query in the logs. Ignores read-only queries
        // let query_type = query.split(" ")[0];
        // if (process.env.NODE_NUM_CONFIGURATION != -1 && query_type != "SELECT")
        //     transactionHandler.storeQuery(pool, query, content);

        callback(err);

        // Throw the error for handling with try/catch or promises
        throw err;
    } finally {
        // Release the database connection back to the pool
        if (connection) {
            connection.release();
        }
    }
}




// To avoid fragments or crashes, we need to make sure
// we close the connection pool when the process is terminated
function gracefulShutdown(pool) {
    pool.end(function (err) {
        if (err) {
            console.error('Error while closing connection pool:', err);
        }
        console.log("Shutting down gracefully");
    });
}

function listen_connections() {
    let recentlyDisconnected = false;
    // Periodically check the connections
    setInterval( async () => {
        let connection = [];
        
        if (process.env.NODE_NUM_CONFIGURATION == 1) 
            connection = await node_1.getConnection();
        else if (process.env.NODE_NUM_CONFIGURATION == 2)
            connection = await node_2.getConnection();
        else if (process.env.NODE_NUM_CONFIGURATION == 3)
            connection = await node_3.getConnection();

        if (recentlyDisconnected && connection) {
            await transactionHandler.recoverTransactions(connection);
            recentlyDisconnected = false;
        }

        if (connection) {
            console.log('Connected to own node');
            connection.release();

            // If the node was recently disconnected, we need to
            // recover transactions that were not committed
            if (recentlyDisconnected) {
                await transactionHandler.recoverTransactions(connection);
            }

            recentlyDisconnected = false;
        } else {
            console.log('own node connection lost. Reconnecting...');
            recentlyDisconnected = true;
        }

    }, 10000); // Interval in milliseconds (e.g., 5000ms = 5 seconds)
}

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    gracefulShutdown(node_self);
    gracefulShutdown(node_1);
    gracefulShutdown(node_2);
    gracefulShutdown(node_3);
    process.exit();
});

module.exports = { listen_connections, node_self, node_1, node_2, node_3, dbQuery, getConnection };