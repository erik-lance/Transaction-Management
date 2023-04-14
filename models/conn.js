const mysql = require("mysql2");
const retry = require("retry");
const dotenv = require("dotenv").config({path: './.env'});

let node_host, node_user, node_password, node_database = [];

const retry_operation = retry.operation({
    retries: 10,            // 10 times
    factor: 3,              // 3 * 1 = 3, 3 * 3 = 9, 3 * 9 = 27, etc.
    minTimeout: 1 * 1000,   // 1 second
    maxTimeout: 60 * 1000,  // 1 minute
    randomize: true,        // Randomize the timeouts by multiplying
})

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


const node_self = mysql.createConnection({
    host: node_host,
    user: node_user,
    password: node_password,
    database: node_database,
});

const node_1 = mysql.createConnection({
    host: process.env.NODE_1_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const node_2 = mysql.createConnection({
    host: process.env.NODE_2_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const node_3 = mysql.createConnection({
    host: process.env.NODE_3_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

node_self.on('connect', () => {
    console.log('Connected to MySQL database: ' + node_user + '@' + node_host + '/' + node_database);
});

node_self.on('error', (err) => {
    console.log(`Error connecting to database of self: ${err}`);
});

node_1.on('connect', () => {
    console.log('Connected to MySQL database: ' + process.env.MYSQL_USER + '@' + process.env.NODE_1_HOST + '/' + process.env.MYSQL_DATABASE);
});

node_1.on('error', (err) => {
    console.log(`Error connecting to database of Node 1: ${err}`);
});

node_2.on('connect', () => {
    console.log('Connected to MySQL database: ' + process.env.MYSQL_USER + '@' + process.env.NODE_2_HOST + '/' + process.env.MYSQL_DATABASE);
});

node_2.on('error', (err) => {
    console.log(`Error connecting to database of Node 2: ${err}`);
});

node_3.on('connect', () => {
    console.log('Connected to MySQL database: ' + process.env.MYSQL_USER + '@' + process.env.NODE_3_HOST + '/' + process.env.MYSQL_DATABASE);
});

node_3.on('error', (err) => {
    console.log(`Error connecting to database of Node 3: ${err}`);
});

/**
 * This function is used to query the database. It will handle
 * transactions to a crashed node while it is recovering.
 */
function dbQuery(db, query) {
    retry_operation.attempt(() => 
    {
        db.beginTransaction(function (err) 
        {
            if (err) throw err;
            
            // Actual Transaction
            db.query(query, function (err, result) {
            });

            db.commit(function (err) {
                if (err) {
                    // If there is an error, rollback the transaction
                    // and try again
                    db.rollback(() => { retry_operation.retry(err) });
                } else {
                    console.log("Transaction committed");
                }
            });

        });
    })
}

// To avoid fragments or crashes, we need to make sure
// we close the connection when the process is terminated
function gracefulShutdown() {
    node_self.end(function () {
        console.log("Shutting down gracefully");
        process.exit();
    });
}

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    gracefulShutdown();
});

module.exports = { node_self, node_1, node_2, node_3, dbQuery };