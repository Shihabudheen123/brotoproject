const express = require("express");

const session = require("express-session");
const path = require("path");

const admin_route = express();
const config = require("../config/config");

const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require('../controllers/productController')

// Set view engine and views directory
admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");
// Middleware for admin authentication
const adminAuthMiddleware = require("../middleware/adminAuth");


// Middleware setup
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

const upload = require("../multer/multer");

// Session setup


admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);


// Define routes
admin_route.get(
  "/",
  adminAuthMiddleware.adminLoggedIn,
  adminController.loadDash
);

admin_route.get(
  "/logout",
  adminAuthMiddleware.adminLoggedIn,
  adminController.logOut
);

// User routes
admin_route.get(
  "/users",
  adminAuthMiddleware.adminLoggedIn,
  adminController.loadUserManagment
);

admin_route.post(
  "/users/:action/:userId",
  adminAuthMiddleware.adminLoggedIn,
  adminController.blockUser
);

//=======================category in admin side===============================================//
// Category routes

admin_route.get("/categories",adminAuthMiddleware.adminLoggedIn,categoryController.loadCategoryManagement)

admin_route.get("/categories/add-new-category",adminAuthMiddleware.adminLoggedIn,categoryController.loadAddNewCategory)


admin_route.post("/categories/add-new-category", adminAuthMiddleware.adminLoggedIn,categoryController.addNewCategory)
admin_route.get("/categories/edit-category", adminAuthMiddleware.adminLoggedIn,categoryController.editCategory)
admin_route.delete("/categories/delete-category", adminAuthMiddleware.adminLoggedIn,categoryController.deleteCategory)
admin_route.post("/categories/add-updated-category",adminAuthMiddleware.adminLoggedIn,categoryController.updateCategory)


//=======================product Mangement=============================//

admin_route.get("/products/product-management",adminAuthMiddleware.adminLoggedIn,productController.ShowProduct)
admin_route.get('/products/add-new-product',adminAuthMiddleware.adminLoggedIn,productController.addNewProduct)  
admin_route.post("/products/create-new-product",adminAuthMiddleware.adminLoggedIn,upload.array("images",10),productController.createNewProduct)
admin_route.get("/products/edit-product",adminAuthMiddleware.adminLoggedIn,productController.editProduct)
admin_route.delete("/products/delete-product",adminAuthMiddleware.adminLoggedIn,productController.deleteProduct)
admin_route.post("/products/create-edit-product",adminAuthMiddleware.adminLoggedIn,upload.array("newImages",10),productController.UpdateCreateEditProduct)

module.exports = admin_route;
