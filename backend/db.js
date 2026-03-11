const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "rental_app"
});

db.connect((err) => {
    if (err) {
        console.log("DB connection failed");
        console.log(err);
    } else {
        console.log("DB connected");
    }
});

module.exports = db;