const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

let node_host, node_user, node_password, node_database = [];

switch (process.env.NODE_NUM_CONFIGURATION) {
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

const node_self = mysql.createConnection({
    host: node_host,
    user: node_user,
    password: node_password,
    database: node_database,

});

node_self.on('error', (err) => {
    console.log(`Error connecting to database: ${err}`);
});

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

module.exports = { node_self };