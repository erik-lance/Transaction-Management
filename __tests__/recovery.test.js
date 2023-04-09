const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config({path: './.env'});

describe('The central node is unavailable during the execution of a transaction and then eventually comes back online', () => {
    test.todo('Insert transaction to node 1');
    test.todo('Insert transaction to node 2');
    test.todo('Insert transaction to node 3');
});