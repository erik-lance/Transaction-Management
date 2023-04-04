const mysql = require("mysql");
const conn = require("../models/conn.js");

const controller = {
    home: (req, res) => {
        const data = {
            title: "Home",
            styles: ["index.css"],
            scripts: ["scripts.js"],
        }
        res.render("index", data);
    },
};

module.exports = controller;