const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const node_1 = mysql.createConnection({
    host: process.env.NODE_1_HOST,
    port: process.env.NODE_1_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

/*
const node_2 = mysql.createConnection({
    host: process.env.NODE_2_HOST,
    port: process.env.NODE_2_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const node_3 = mysql.createConnection({
    host: process.env.NODE_3_HOST,
    port: process.env.NODE_3_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

*/


module.exports = { node_1 };