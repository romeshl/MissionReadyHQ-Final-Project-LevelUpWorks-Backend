const express = require("express");
const bcrypt = require("bcrypt");

const dbConnection = require("../dbConnection");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body; // grabbing data from req.body

  dbConnection.execute(
    // runs the SQL query
    "SELECT name, password  FROM teacher WHERE email = ?;",
    [email],
    (err, results) => {
      if (err) {
        // check for any errors generated while running the query
        console.log("Error occurred", err);
        return res.status(500).json({ unkown: "Unknown error" });
      }
      // If no results are found in the table
      else if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "No user account with that e-mail address." });
      }
      // If at least one row in the table
      else if (results.length >= 1) {
        const hashedPass = results[0].password;
        bcrypt.compare(password, hashedPass, (err, validPass) => {
          // check if passwords match
          if (validPass) {
            return res.status(200).json(results[0].name);
          } else {
            // passwords don't match
            return res.status(401).json({ error: "Incorrect password" });
          }
        });
      }
    }
  );
});

router.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    const hashedPass = bcrypt.hashSync(password, 10); // Hashes the password using bcrypt

    const queryString =
        "INSERT INTO teacher (name, email, password) VALUES (?,?,?);";

    dbConnection.execute(queryString, [name, email, hashedPass], (err) => {
        console.log(err);
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ error: "Email already exists." });
            }
            console.log("Error creating user", err);
            return res.sendStatus(500);
        } else {
            return res.status(200).json({ message: "User created successfully" });
        }
    });
})

module.exports = router;

