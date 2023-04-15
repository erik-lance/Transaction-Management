const mysql = require("mysql2");
const retry = require("retry");
const dotenv = require("dotenv").config({path: './.env'});
const conn = require("../models/conn.js");

let transactions = [];

function storeQuery(dbPool, query, content) {
    transactions.push({
        dbPool: dbPool,
        query: query,
        content: content
    });
}

module.exports = { storeQuery };