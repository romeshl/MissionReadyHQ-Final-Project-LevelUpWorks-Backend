const express = require ('express');
const cors = require("cors");

// Imports student routes
const studentRoutes = require("./Routes/Students");
// Imports teacher routes
const teacherRoutes = require("./Routes/Teachers");

const app = express();

// Middleware
app.use(cors());  // Accepts requests from anywhere
app.use(express.json()); // Parses incoming JSON payloads in the POST request body

// re-direct Students API routes to studentRoutes
app.use("/Students", studentRoutes);
// re-direct Students API routes to studentRoutes
app.use("/Teachers", teacherRoutes);


app.get("/", (req, res) => {
  res.status(200)
    .send(`<div style="border:2px solid silver; margin: 20px auto; padding: 30px; border-radius: 10px; text-align: center; background-color: gainsboro;">
    <h1 style="font-family:tahoma; color: dimgray;">MissionReadyHQ-Final-Project-LevelUpWorks</h1>
    <p style="font-family: tahoma">This is the backend of the LevelUp Works project.</p>
    <p style="font-family: tahoma">Please use the following links to find the related resources.</p>
    <a href="https://romeshl.github.io/MissionReadyHQ-Final-Project-LevelUpWorks-Frontend/" target="_blank" ><p style="font-family: tahoma">Frontend Home Page</p></a>
    <a href="https://github.com/romeshl/MissionReadyHQ-Final-Project-LevelUpWorks-Frontend" target="_blank" ><p style="font-family: tahoma">Frontend Github repository</p></a>
    <a href="https://github.com/romeshl/MissionReadyHQ-Final-Project-LevelUpWorks-Backend" target="_blank" ><p style="font-family: tahoma">Backend Github repository</p></a>
    </div>`);
});


// Set API port and start listening
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
