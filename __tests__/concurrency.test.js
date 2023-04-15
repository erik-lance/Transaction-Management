const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config({path: './.env'});

// For each case, set the isolation level to read uncommitted, read committed, read repeatable and serializable.

describe('Concurrent Transactions in two or more nodes reading the same item', () => {

    let node_1;
    let node_2;
    let node_3;

    beforeAll(async () => {
        // Establish database connection
        // This will simulate the connections to the three nodes.
        test_conn = await connectToLocalDB();
        node_1 = await connectToLocalDB();
        node_2 = await connectToLocalDB();
        node_3 = await connectToLocalDB();
    });

    afterAll(async () => {
        // Close database connection
        await test_conn.end();
        await node_1.end();
        await node_2.end();
        await node_3.end();
    });

    test('Node 1 and node 2 are reading the same item (Isolation: READ UNCOMMITTED)', async () => {
        // Insert row
        await test_conn.query("INSERT INTO movies (name, year, `rank`, genre) VALUES (?,?,?,?)", ['Test Movie', 2020, 1, 'Action']);

        // Check if row was inserted
        const [rows] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows.length).toBe(1);

        // Set isolation level to read uncommitted
        await node_1.query("SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");
        await node_2.query("SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

        // Begin transaction in node 1
        await node_1.query("START TRANSACTION");
        const [rows1] = await node_1.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_1.query("COMMIT");

        // Begin transaction in node 2
        await node_2.query("START TRANSACTION");
        const [rows2] = await node_2.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_2.query("COMMIT");

        // Verify if row was inserted
        expect(rows1.length).toBe(1);
        expect(rows1[0].name).toBe("Test Movie");
        expect(rows1[0].year).toBe(2020);
        expect(rows1[0].rank).toBe(1);
        expect(rows1[0].genre).toBe("Action");

        // Verify if row was inserted
        expect(rows2.length).toBe(1);
        expect(rows2[0].name).toBe("Test Movie");
        expect(rows2[0].year).toBe(2020);
        expect(rows2[0].rank).toBe(1);
        expect(rows2[0].genre).toBe("Action");

        // Remove inserted row
        await test_conn.query("DELETE FROM movies WHERE name = 'Test Movie'");

        // Check if row was removed
        const [rows3] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows3.length).toBe(0);
    });

    test('Node 1 and node 2 are reading the same item (Isolation: READ COMMITTED)', async () => {
        // Insert row
        await test_conn.query("INSERT INTO movies (name, year, `rank`, genre) VALUES (?,?,?,?)", ['Test Movie', 2020, 1, 'Action']);

        // Check if row was inserted
        const [rows] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows.length).toBe(1);

        // Set isolation level to read uncommitted
        await node_1.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
        await node_2.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");

        // Begin transaction in node 1
        await node_1.query("START TRANSACTION");
        const [rows1] = await node_1.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_1.query("COMMIT");

        // Begin transaction in node 2
        await node_2.query("START TRANSACTION");
        const [rows2] = await node_2.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_2.query("COMMIT");

        // Verify if row was inserted
        expect(rows1.length).toBe(1);
        expect(rows1[0].name).toBe("Test Movie");
        expect(rows1[0].year).toBe(2020);
        expect(rows1[0].rank).toBe(1);
        expect(rows1[0].genre).toBe("Action");

        // Verify if row was inserted
        expect(rows2.length).toBe(1);
        expect(rows2[0].name).toBe("Test Movie");
        expect(rows2[0].year).toBe(2020);
        expect(rows2[0].rank).toBe(1);
        expect(rows2[0].genre).toBe("Action");

        // Remove inserted row
        await test_conn.query("DELETE FROM movies WHERE name = 'Test Movie'");

        // Check if row was removed
        const [rows3] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows3.length).toBe(0);
    });

    test('Node 1 and node 2 are reading the same item (Isolation: REPEATABLE READ)', async () => {
        // Insert row
        await test_conn.query("INSERT INTO movies (name, year, `rank`, genre) VALUES (?,?,?,?)", ['Test Movie', 2020, 1, 'Action']);

        // Check if row was inserted
        const [rows] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows.length).toBe(1);

        // Set isolation level to read uncommitted
        await node_1.query("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ");
        await node_2.query("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ");

        // Begin transaction in node 1
        await node_1.query("START TRANSACTION");
        const [rows1] = await node_1.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_1.query("COMMIT");

        // Begin transaction in node 2
        await node_2.query("START TRANSACTION");
        const [rows2] = await node_2.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_2.query("COMMIT");

        // Verify if row was inserted
        expect(rows1.length).toBe(1);
        expect(rows1[0].name).toBe("Test Movie");
        expect(rows1[0].year).toBe(2020);
        expect(rows1[0].rank).toBe(1);
        expect(rows1[0].genre).toBe("Action");

        // Verify if row was inserted
        expect(rows2.length).toBe(1);
        expect(rows2[0].name).toBe("Test Movie");
        expect(rows2[0].year).toBe(2020);
        expect(rows2[0].rank).toBe(1);
        expect(rows2[0].genre).toBe("Action");

        // Remove inserted row
        await test_conn.query("DELETE FROM movies WHERE name = 'Test Movie'");

        // Check if row was removed
        const [rows3] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows3.length).toBe(0);
    });

    test('Node 1 and node 2 are reading the same item (Isolation: SERIALIZABLE)', async () => {
        // Insert row
        await test_conn.query("INSERT INTO movies (name, year, `rank`, genre) VALUES (?,?,?,?)", ['Test Movie', 2020, 1, 'Action']);

        // Check if row was inserted
        const [rows] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows.length).toBe(1);

        // Set isolation level to read uncommitted
        await node_1.query("SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE");
        await node_2.query("SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE");

        // Begin transaction in node 1
        await node_1.query("START TRANSACTION");
        const [rows1] = await node_1.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_1.query("COMMIT");

        // Begin transaction in node 2
        await node_2.query("START TRANSACTION");
        const [rows2] = await node_2.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        await node_2.query("COMMIT");

        // Verify if row was inserted
        expect(rows1.length).toBe(1);
        expect(rows1[0].name).toBe("Test Movie");
        expect(rows1[0].year).toBe(2020);
        expect(rows1[0].rank).toBe(1);
        expect(rows1[0].genre).toBe("Action");

        // Verify if row was inserted
        expect(rows2.length).toBe(1);
        expect(rows2[0].name).toBe("Test Movie");
        expect(rows2[0].year).toBe(2020);
        expect(rows2[0].rank).toBe(1);
        expect(rows2[0].genre).toBe("Action");

        // Remove inserted row
        await test_conn.query("DELETE FROM movies WHERE name = 'Test Movie'");

        // Check if row was removed
        const [rows3] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");
        expect(rows3.length).toBe(0);
    });
});


describe('At least one transaction in the three nodes is writing (update / delete) and the other concurrent transactions are reading the same data item.', () => {

    let node_1;
    let node_2;
    let node_3;

    beforeAll(async () => {
        // Establish database connection
        // This will simulate the connections to the three nodes.
        test_conn = await connectToLocalDB();
        node_1 = await connectToLocalDB();
        node_2 = await connectToLocalDB();
        node_3 = await connectToLocalDB();
    });

    afterAll(async () => {
        // Close database connection
        await test_conn.end();
        await node_1.end();
        await node_2.end();
        await node_3.end();
    });

    test.todo('Node 1 is updating and node 2 is reading the same item (Isolation: READ UNCOMMITTED)');
    test.todo('Node 1 is updating and node 2 is reading the same item (Isolation: READ COMMITTED)');
    test.todo('Node 1 is updating and node 2 is reading the same item (Isolation: REPEATABLE READ)');

    test.todo('Node 1 is deleting and node 2 is reading the same item (Isolation: READ UNCOMMITTED)');
    test.todo('Node 1 is deleting and node 2 is reading the same item (Isolation: READ COMMITTED)');
    test.todo('Node 1 is deleting and node 2 is reading the same item (Isolation: REPEATABLE READ)');

});

describe('Concurrent transactions in two or more nodes are writing (update / delete) the same data item.', () => {

    let node_1;
    let node_2;
    let node_3;

    beforeAll(async () => {
        // Establish database connection
        // This will simulate the connections to the three nodes.
        test_conn = await connectToLocalDB();
        node_1 = await connectToLocalDB();
        node_2 = await connectToLocalDB();
        node_3 = await connectToLocalDB();
    });

    afterAll(async () => {
        // Close database connection
        await test_conn.end();
        await node_1.end();
        await node_2.end();
        await node_3.end();
    });

    test.todo('Node 1 is updating and node 2 is updating the same item (Isolation: READ UNCOMMITTED)');
    test.todo('Node 1 is updating and node 2 is updating the same item (Isolation: READ COMMITTED)');
    test.todo('Node 1 is updating and node 2 is updating the same item (Isolation: REPEATABLE READ)');
    test.todo('Node 1 is updating and node 2 is updating the same item (Isolation: SERIALIZABLE)');

    test.todo('Node 1 is deleting and node 2 is deleting the same item (Isolation: READ UNCOMMITTED)');
    test.todo('Node 1 is deleting and node 2 is deleting the same item (Isolation: READ COMMITTED)');
    test.todo('Node 1 is deleting and node 2 is deleting the same item (Isolation: REPEATABLE READ)');
    test.todo('Node 1 is deleting and node 2 is deleting the same item (Isolation: SERIALIZABLE)');
});

// Functions
async function connectToLocalDB() {
    // Establish database connection
    const connection = await mysql.createConnection({
        host: process.env.NODE_SELF_HOST,
        user: process.env.NODE_SELF_USER,
        password: process.env.NODE_SELF_PASS,
        database: process.env.MYSQL_TEST_DB
    });

    return connection;
}