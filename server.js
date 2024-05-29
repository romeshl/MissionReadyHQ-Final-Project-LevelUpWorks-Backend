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

// Set API port and start listening
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
