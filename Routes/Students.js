const express = require("express");
const bcrypt = require("bcrypt");

// import mysql2 connection pool as a promise connection
const db = require("../dbConnection").promise();

const router = express.Router();

// Handles the "/Students/login" API route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body; // grabbing data from req.body
        // check the login details against the database
        const [results] =
            await db.execute("SELECT name, password  FROM student WHERE email = ?;", [email]);
        // if there are no results...
        if (results.length === 0) {
            return res.status(404).json({ error: "No user account with that e-mail address." });
        }
        // if there are records.. 
        else if (results.length >= 1) {
            const hashedPass = results[0].password;
            bcrypt.compare(password, hashedPass, (err, validPass) => {
                // check if passwords match
                if (validPass) {
                    // if they match send 200 status and name
                    return res.status(200).json(results[0].name);
                } else {
                    // passwords don't match
                    return res.status(401).json({ error: "Incorrect password" });
                }
            });
        }
    }
    catch (err) { // checks for any errors occurred and passes status 500
        console.log("Error occurred", err);
        return res.status(500).json({ unknown: "Unknown error" });
    }
});

// handles the "/Students/signup" API route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body; // grabbing data from req.body
        const hashedPass = bcrypt.hashSync(password, 10); // Hashes the password using bcrypt

        const queryString =
            "INSERT INTO student (name, email, password) VALUES (?,?,?);";
        // Inserts the data in to the table
        const [results] = await db.execute(queryString, [name, email, hashedPass]);
        // if no errors occurred pass the status 200 with the success message
        return res.status(200).json({ message: "User created successfully" });
    }
    catch (err) {
        // if any errors caused check if it's a duplicate entry. Anything else pass a generic message with status 500
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                // checks if the e-mail already exists in the database
                return res.status(409).json({ error: "Email already exists." });
            }
            return res.sendStatus(500).json({ error: "Unknown error." });
        }
    }
});


module.exports = router;