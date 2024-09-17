const express = require("express");
const user_route = express();
const bodyparser = require("body-parser");
const path = require("path");
const session = require("express-session");

const config = require("../config/config");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")
user_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

const auth = require("../middleware/auth");

user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({ extended: true }));

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

// Registration routes
user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);

// OTP verification routes
user_route.get("/Otp", auth.isLogout, userController.verifyPageLoad);
user_route.post("/Otp", auth.isLogout, userController.confirmOtp);
user_route.get("/resendOtp", userController.resendOtp);

// Home route
user_route.get("/", userController.loadHome);
user_route.get("/home", auth.isLogin, userController.loadHome);

// Login routes
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", auth.isLogout, userController.verifyLogin);
// user_route.get("/", auth.isLogout, userController.loginLoad);
user_route.get("/login", userController.loginLoad);
// user_route.post("/login", userController.verifyLogin);

user_route.get("/logout", auth.isLogin, userController.logout);

// Shop routes 
user_route.get('/shop',auth.isLogin,userController.shop)



// user_route.get("/products-shop",auth.isLogin,productController.loadShop)

// forget password

user_route.get(
  "/forgetPassEmaiVerify",
  
  userController.forgetPassEmaiVerify
);
user_route.post("/forgetPassEmaiVerify", userController.verifyEmail);

user_route.get("/ForgetPassVerifyOtp", userController.forgetPassVerifyOtp);
user_route.post("/ForgetPassVerifyOtp", userController.verifyOtp);
user_route.post("/changePassword", userController.changePassword);

// user profile routes

user_route.get("/user-profile",auth.isLogin,userController.loadUserProfile)




module.exports = user_route;
