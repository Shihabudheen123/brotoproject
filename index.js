
const mongoose = require("mongoose");



const path = require("path");
mongoose.connect("mongodb://127.0.0.1:27017/Project"); // establish a connection to a MongoDB database

const express = require("express");
const app = express();

app.set("view engine", "ejs");
// Set the views directory
app.set('views', path.join(__dirname, 'views'));

//  routes for  handling user related requests
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for admin routes

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

// app.use("/public", express.static("public"));
app.use('/public', express.static(path.join(__dirname, 'public')));





app.use(express.urlencoded({ extended: true }));

app.listen(2000, function () {
  console.log("running");
});
