const express = require ('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require("cors");
const axios = require("axios");
require('dotenv').config();
console.log(process.env.MYSQL_USER);

// Load environment variables from .env file
dotenv.config();

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

// Check if pool creation was successful
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1); // Exit the application if unable to connect to MySQL
  }
  console.log("Connected to MySQL database");
  connection.release(); // Release the connection
});

const app = express();

// Middleware
app.use(cors());  // Accepts requests from anywhere
app.use(express.json()); // Parses incoming JSON payloads in the POST request body

// API endpoint


app.get('/', (req, res) => {
  pool.query('SELECT VERSION() AS VERSION;', (err, result) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.send('Hello World ' + result[0].VERSION);
  })
});

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

const PORT = 4000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
