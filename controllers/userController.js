const User = require("../models/userModels");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const config = require("../config/config");
const nodemailer = require("nodemailer");
const Category = require("../models/categoryModel");
const upload = require("../multer/multer");

//<--------------------------------------------registraiton------------------------------------------------------>

const loadRegister = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;

    res.render("registration", {
      loggedIn,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    // Check if a user with the provided email already exists in the database
    const findUser = await User.findOne({ email: req.body.email });
    if (!findUser) {
      // If the user doesn't exist, extract user data from request body
      const { name, email, password, mobile } = req.body;
      //calling the fuction
      await emailVerification(email);
      // Store user data in session temporarily for verification
      req.session.tempData = { name, email, password, mobile };
      // Redirect to OTP verification page
      res.redirect("/Otp");
    } else {
      // If user already exists, render the registration page with an error message
      res.render("registration", {
        message: "Email already exists",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Route to load OTP verification page
const verifyPageLoad = async (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

// Empty object to store OTPs
const otpCache = {};

// Variable to hold the current OTP value
let otpVal;

// Route to verify email

const emailVerification = async (email, res) => {
  try {
    otpVal = (Math.floor(Math.random() * 900000) + 100000).toString();
    console.log(otpVal);
    otpCache[email] = otpVal;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailpassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Email Verification Code",
      text: otpVal,
    };

    let info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

const resendOtp = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.session.tempData;
    await emailVerification(email, res);
  } catch (error) {
    console.log(error.message);
  }
};

const confirmOtp = async (req, res) => {
  try {
    console.log("enterr ");
    console.log(otpVal, req.body.formOtp);
    if (otpVal == req.body.formOtp) {
      const { name, email, password, mobile } = req.session.tempData;

      const spassword = await bcrypt.hash(password, 10);

      // Create a new user
      const user = new User({
        name,
        email,
        mobile,
        password: spassword,
        is_blocked: 0,
        is_admin: 0,
      });

      // Save user data
      const userData = await user.save();

      // Set session variables and redirect to home

      req.session.user_id = user._id;
      req.session.auth = true;
      // Redirect to the home page after successful registration
      res.redirect("/home");
    } else {
      res.render("Otp", { message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load Home page after registration

const loadHome = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const products = await Product.find();

    res.render("userHome", {
      loggedIn,
      products,
    });
  } catch (error) {
    console.log(error.message, "Error loading the home page");
  }
};

const loginLoad = (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    res.render("login", {
      message: "",
      loggedIn,
    });
  } catch (error) {
    console.log(error.message, "Error loading the  user login page");
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const loggedIn = req.session.user_id ? true : false;

    const userData = await User.findOne({ email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_blocked) {
          res.render("login", {
            loggedIn,

            message:
              "Your account is blocked. Please contact the administrator",
          });
        } else {
          if (userData.is_admin) {
            req.session.adminAuth = true;
            res.redirect("/admin");
          } else {
            req.session.user_id = userData._id;
            req.session.auth = true;

            res.redirect("/home");
          }
        }
      } else {
        res.render("login", {
          message: "Password is incorrect",
          loggedIn,
        });
      }
    } else {
      res.render("login", {
        message: "Email is not found",
        loggedIn,
      });
    }
  } catch (error) {
    console.log(error.message, "Error verifying user login");
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error.message, "Error verifying user login");
  }
};

const forgetPassEmaiVerify = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("forgetPassEmaiVerify", { loggedIn, category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

// verify email for change password

const verifyEmail = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const email = req.body.email;
    console.log(email);

    const userData = await User.findOne({ email: email });

    if (!userData) {
      res.render("forgetPassEmaiVerify", {
        loggedIn,
        category: categoryData,
        message: "Email not found",
      });
    } else {
      req.session.userEmail = email;
      await emailVerification(email);
      res.redirect("/ForgetPassVerifyOtp");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Invalid server error");
  }
};

// forget password otp verification pae load

const forgetPassVerifyOtp = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    res.render("forgetPassOtpPage", { loggedIn, category: categoryData });
  } catch (error) {
    res.status(500).send("invalid server error");
  }
};

// check otp to change password

const verifyOtp = async (req, res) => {
  try {
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const otpCode = req.body.otpCode;
    console.log("otp code");
    console.log(otpVal);

    if (otpVal == otpCode) {
      res.render("changePassword", { loggedIn, category: categoryData });
    } else {
      res.render("forgetPassOtpPage", {
        loggedIn,
        category: categoryData,
        message: "otp is incorrect",
      });
    }
  } catch (error) {
    res.status(500).send("invalid server error");
  }
};

// change password

const changePassword = async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    console.log(newPassword);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedNewPassword);
    console.log(req.session.userEmail);
    const email = req.session.userEmail;
    console.log(email);
    const userData = await User.findOne({ email: email });
    console.log(userData);
    userData.password = hashedNewPassword;
    const updatedPass = await userData.save();

    if (updatedPass) {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send(" invalid server error ");
  }
};

// Function for load shop
const shop = async (req, res) => {
  try {
    const products = await Product.find({});

    res.render("shop", {
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadUserProfile = async (req,res)=>{
  try {
    const  user_id  = req.session.user_id;
    const loggedIn = req.session.isAuht ? true : false;
    const userData = await User.findOne({ _id :{ $in : addressUserId }})


    res.render('userProfile',{
      loggedIn,
      user:userData,


    })
    
  } catch (error) {
    console.log(error.message)
    
  }
}



module.exports = {
  loadRegister,
  insertUser,
  emailVerification,
  verifyPageLoad,
  confirmOtp,
  resendOtp,
  loadHome,
  loginLoad,
  verifyLogin,
  logout,
  forgetPassEmaiVerify,
  verifyEmail,
  forgetPassVerifyOtp,
  verifyOtp,
  changePassword,
  shop,
  loadUserProfile
 
};
