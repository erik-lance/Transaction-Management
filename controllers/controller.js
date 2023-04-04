const mysql = require("mysql");
const conn = require("../models/conn.js");

const controller = {
    home: (req, res) => {
        const data = {
            title: "Home",
            styles: ["index.css"],
            scripts: ["index.js"],
        }
        
        console.log(data)

        res.render("index", data);
    },
};

module.exports = controller;