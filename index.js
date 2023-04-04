const express = require("express"); // Import express
const exphbs = require("express-handlebars"); // Import express-handlebars
const mysql = require("mysql"); // Import mysql
const dotenv = require("dotenv"); // Import dotenv

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
})

const app = express(); // Create express app
const port = 3000; // Define port

// Serve static files
app.use(express.static("public"));

// Set view engine
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// Set views
//app.set("views", __dirname + "/views");

// Import routes
const routes = require("./routes/routes.js");

// Routes
app.use("/", routes);

// Start server
app.listen(process.env.PORT || 3000, () =>
  console.log(`Example app listening on port ${port}!`)
);

module.exports = app;
