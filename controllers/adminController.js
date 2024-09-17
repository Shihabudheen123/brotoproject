const User = require("../models/userModels");
const category = require("../models/categoryModel");

const loadDash = async (req, res) => {
  try {
    const user = await User.find({ is_admin: false });

    if (!user || user.is_admin !== 1) {
      // return res.status(403).render('errorPage', { message: "Unauthorized" });
    }

    res.render("dashboard", {
      title: "Admin Dashboard",
      user,
    });
  } catch (error) {
    console.error("Error in loadDash:", error.message);
  }
};

const loadUserManagment = async (req, res) => {
  try {
    const users = await User.find({ is_admin: false });
    res.render("userManagement", { users });
  } catch (error) {
    console.error(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const action = req.params.action;

    // Fetch user data
    const userData = await User.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Determine block or unblock action
    if (action === "block") {
      userData.is_blocked = true;
    } else if (action === "unblock") {
      userData.is_blocked = false;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    // Save changes
    await userData.save();

    // Respond with success and updated block status
    res.json({ success: true, is_blocked: userData.is_blocked });
  } catch (error) {
    console.error("Error blocking/unblocking user:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logOut = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.error("Error in logOut:", error.message);
  }
};

module.exports = {
  loadDash,
  loadUserManagment,
  blockUser,
  logOut,
};
