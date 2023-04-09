const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config({path: './.env'});

describe("Inserting data into the database", () => {
    test("Insert valid row", async () => {
        // Establish database connection
        let test_conn = await connectToLocalDB();

        // Insert row
        await test_conn.query("INSERT INTO movies (name, year, `rank`, genre) VALUES (?,?,?,?)", ['Test Movie', 2020, 1, 'Action']);

        // Check if row was inserted
        const [rows] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");

        // Verify if row was inserted
        expect(rows.length).toBe(1);
        expect(rows[0].name).toBe("Test Movie");
        expect(rows[0].year).toBe(2020);
        expect(rows[0].rank).toBe(1);
        expect(rows[0].genre).toBe("Action");

        // Remove inserted row
        await test_conn.query("DELETE FROM movies WHERE name = 'Test Movie'");

        // Close database connection
        await test_conn.end();
    });

    test("Delete record", async () => {
        // Establish database connection
        let test_conn = await connectToLocalDB();

        // Insert row
        await test_conn.query("INSERT INTO movies (name, year, `rank`, genre) VALUES (?,?,?,?)", ['Test Movie', 2020, 1, 'Action']);

        // Remove inserted row
        await test_conn.query("DELETE FROM movies WHERE name = 'Test Movie'");

        // Check if row was removed
        const [rows] = await test_conn.query("SELECT * FROM movies WHERE name = 'Test Movie'");

        // Verify if row was removed
        expect(rows.length).toBe(0);

        // Close database connection
        await test_conn.end();
    });


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