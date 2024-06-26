const express = require("express");
const database = require("./Connection/connection");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./Routes/allRoutes");
const blogRoutes = require("./Routes/allRoutes");
const app = express();
const port = process.env.PORT || 8080;

database();

app.use(express.json());
app.use(cors({
  origin: [
   "https://cloudinaryblog.vercel.app/",
   "https://cloudinaryblog.vercel.app",
    "http://localhost:3000/",
    "http://localhost:3000"
  ]
}));
app.use("/submit", userRoutes);
app.use("/blog", blogRoutes);
app.use("/refresh", userRoutes);
app.use("/", (req, res) => {
  res.send("demo api");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
