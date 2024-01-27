const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
// const cors = require("cors");
// app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

mongoose
  .connect("mongodb+srv://manishsyal:manish@cluster0.44v0hmp.mongodb.net/")
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB :  ${err}`);
  });

app.get("/test", (req, res) => {
  res.send("Backend server is working!!");
  console.log("testing from server!!");
});

app.listen(3004, () => {
  console.log("Server is running on port 3004!!");
});

//endpoint to register in the app
