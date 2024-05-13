const express = require ('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors());  // Accepts requests from anywhere
app.use(express.json()); // Parses incoming JSON payloads in the POST request body

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// // Check if pool creation was successful
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error("Error connecting to MySQL:", err);
//     process.exit(1); // Exit the application if unable to connect to MySQL
//   }
//   console.log("Connected to MySQL database");
//   connection.release(); // Release the connection
// });

// API endpoints

//! Starting of APIs for Students and Teachers Login / Signup pages //
//!-----------------------------------------------------------------//
// Student Login 
app.post("/students/login", (req, res) => {
  const { email, password } = req.body; // grabbing data from req.body

  pool.execute( // runs the SQL query
    "SELECT name, password  FROM student WHERE email = ?;",
    [email],
    (err, results) => {
      if (err) { // check for any errors generated while running the query
        console.log("Error occurred", err);
        return res.status(500).json({ unkown: "Unknown error" });
      }
      // If no results are found in the table
      else if (results.length === 0) {
        return res.status(404).json({ error: "No user account with that e-mail address." });
      }
      // If at least one row in the table
      else if (results.length >= 1) {
        const hashedPass = results[0].password;
        bcrypt.compare(password, hashedPass, (err, validPass) => { // check if passwords match
          if (validPass) { // if they match send 200 status and name 
            return res.status(200).json(results[0].name);
          }
          else { // passwords don't match
            return res.status(401).json({ error: "Incorrect password" });
          }
        })
       }
    }
  );
});

// Teachers Login
app.post("/teachers/login", (req, res) => {
  const { email, password } = req.body; // grabbing data from req.body

  pool.execute(
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

// Students Signup
app.post("/students/signup", (req, res) => {
  const { name, email, password } = req.body; // grabbing data from req.body
  const hashedPass = bcrypt.hashSync(password, 10); // Hashes the password using bcrypt

  const queryString =
    "INSERT INTO student (name, email, password) VALUES (?,?,?);";

  pool.execute(queryString, [name, email, hashedPass], (err) => {
    console.log(err);
    if (err) { 
      if (err.code === "ER_DUP_ENTRY") { // checks if the e-mail already exists in the database
        return res.status(409).json({ error: "Email already exists." });
      }
      return res.sendStatus(500);
    }
    else {
      return res.status(200).json({ message: "User created successfully" });
    }
  });
});

// Teachers Signup
app.post("/teachers/signup", (req, res) => {
  const { name, email, password } = req.body;
  const hashedPass = bcrypt.hashSync(password, 10); // Hashes the password using bcrypt

  const queryString =
    "INSERT INTO teacher (name, email, password) VALUES (?,?,?);";

  pool.execute(queryString, [name, email, hashedPass], (err) => {
    console.log(err);
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already exists." });
      }
      console.log("Error creating user", err);
      return res.sendStatus(500);
    }
    else {
      return res.status(200).json({ message: "User created successfully" });
    }
  });
});

//! Starting of APIs for Students and Teachers Login / Signup pages //
//!-----------------------------------------------------------------//

//! Starting of APIs for Student Dash board ********************************* //
//! --------------------------------------------------------------------------//
// API endpoints for project table

app.post('/api/project', (req, res) => {
  const { title, learning_objective, instructions, video } = req.body;
  pool.query('INSERT INTO project (title, learning_objective, instructions, video) VALUES (?, ?, ?, ?)', [title, learning_objective, instructions, video], (err, results) => {
    if (err) {
      console.error("Error adding project:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(201).send(`Project added with ID: ${results.insertId}`);
  });
});

// Read all projects
app.get('/api/project', (req, res) => {
  pool.query('SELECT * FROM project', (err, results) => {
    if (err) {
      console.error("Error fetching project:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

// Read a single project by ID
/* app.get('/api/project/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM project WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error("Error fetching project:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send('Project not found');
    }
  });
});
*/
//Api for learning objective page

app.get('/api/project/learningObjective', (req, res) => {
   console.log('/api/project/learningObjective called');
  pool.query('SELECT learning_objective FROM project WHERE project_id = 1', (err, results) => {
    if (err) {
      console.error('Error fetching learning objective:', err);
      return res.status(500).send('Internal Server Error');
    }
    if (results.length === 0) {
      return res.status(404).send('Learning objective not found');
    }
    const learningObjective = results[0].learning_objective;
    res.setHeader("Content-Type","text/html");
    res.send(learningObjective)
  });
});

// API for instruction page 

app.get('/api/project/instructions', (req, res) => {
  pool.query('SELECT instructions FROM project WHERE project_id = 1', (err, results) => {
    if (err) {
      console.error("Error fetching instructions:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(404).send('Instructions not found');
    }
    const Instructions = results[0].instructions;
    res.setHeader("Content-Type", "text/html")
    res.send(Instructions);   
  });
});

//  API for video tutorial page 

app.get('/api/project/video', (req, res) => {
   pool.query('SELECT video FROM project WHERE project_id = 1', (err, results) => {
    if (err) {
      console.error("Error fetching video:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(404).send('Video not found');
    }
    const Video = results[0].video;
    res.setHeader("Content-Type", "text/html")
    res.send(Video);   
  });
});
//! Ending of APIs for Student Dash board ************************************ //
//! --------------------------------------------------------------------------//

// Set API port and start listening
const PORT = 4000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
