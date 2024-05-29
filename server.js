const express = require ('express');
const cors = require("cors");

const studentRoutes = require("./Routes/Students");
const teacherRoutes = require("./Routes/Teachers");

const app = express();

// Middleware
app.use(cors());  // Accepts requests from anywhere
app.use(express.json()); // Parses incoming JSON payloads in the POST request body

app.use("/Students", studentRoutes);
app.use("/Teachers", teacherRoutes);

// Set API port and start listening
const PORT = 4000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
