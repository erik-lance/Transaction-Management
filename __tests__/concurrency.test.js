const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config({path: './.env'});

describe('Concurrent Transactions in two or more nodes reading the same item', () => {
    test.todo('Node 1 and node 2 are reading the same item');
    test.todo('Node 2 and node 3 are reading the same item');
    test.todo('Node 1 and node 3 are reading the same item');
});