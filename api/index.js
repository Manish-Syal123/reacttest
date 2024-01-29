const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
// const cors = require("cors");
// app.use(cors);

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

const mongodbURL = process.env.MongoDB_URL;
mongoose
  .connect(mongodbURL)
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

const usermodel = require("../api/models/usermodel");
const ordermodel = require("../api/models/ordermodel");

// function to send verification email to the user

const sendVerificationEmail = async (email, verificationToken) => {
  //create a nodemailer transport
  const transporter = nodemailer.createTransport({
    //configure the email service
    service: "gmail",
    auth: {
      user: "codechunk94@gmail.com",
      pass: process.env.My_Google_Aut_Code,
    },
  });

  //compose the email message
  const mailOptions = {
    from: "amazon.com",
    to: email,
    subject: "Email verification for Ecomtest",
    text: `please click the following link to verify your email : http://localhost:3004/verify/${verificationToken}`,
  };

  //send the email to user for verification
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending verification email", error);
  }
};
//endpoint to register in the app
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      name === "" ||
      email === "" ||
      password === ""
    ) {
      return res.status(400).json({ message: "Please fill all the details" });
    }
    // checking if the email is already registered
    const existingUser = await usermodel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // create a new user
    const newUser = new usermodel({ name, email, password: hashedPassword });

    //generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    //save the user to the database
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });

    //sending verification email to user
    sendVerificationEmail(newUser.email, newUser.verificationToken);
  } catch (err) {
    console.log("error registring user", err);
    res.status(500).json({ message: "Registration Failed" });
  }
});

//endpoint to verify the email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    //find the user with the given verification token
    const user = await usermodel.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid  verification token" });
    }

    //mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email verification failed" });
  }
});

const generateSecretkey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretkey();

//endpoint to login the user
app.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return res.status(400).json({ message: "Please fill all the details" });
  }
  //check if the user exist in the database
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validpassword = bcrypt.compareSync(password, user.password);
    //check if the password is correct
    if (!validpassword) {
      return res.status(401).json({ message: "Inavlid password" });
    }

    //generate a token
    const token = jwt.sign({ userID: user._id }, secretKey);

    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed" });
  }
});
