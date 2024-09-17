const Product = require('../models/productModel')
const Category =require("../models/categoryModel")
const fs = require("fs")




const ShowProduct = async(req,res)=>{
    try {
        const sortCategory = req.query.id;
        const page = req.query.page || 0;
        const productPerPage = 10;
        const category = await Category.find({})
        const totalNumberOfProducts = sortCategory
        ? await Product.find({ category: sortCategory }).countDocuments() 
        : await Product.find({}).countDocuments();
        const totalNumberOfPages = Math.ceil(
            totalNumberOfProducts / productPerPage
        )
        const productData = sortCategory
            ? await Product.find({ category : sortCategory })
            .skip(page*productPerPage)
            .limit(productPerPage)
            : await Product.find({})
            .skip(page*productPerPage)
            .limit(productPerPage);

        res.render("productManagement",{
            title:"Product-Mangement",
            product:productData,
            totalNumberOfPages,
            page,
            category
        })
        
    } catch (error) {
        console.log(error.message);
    }
}

//====================adding New products===================================//

const addNewProduct = async(req,res)=>{
    try {
        const categoryData = await Category.find({})
        if(addNewProduct){
            res.render("add-product",{
                title:"Add Product",
                category:categoryData
            })
        }
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const createNewProduct = async(req,res)=>{
    try {

        const {
            productName,
            description,
            marketPrice,
            salePrice,
            myCategory,
            quantity,
        } = req.body

        let imageFiles = [];
        if (req.files && req.files.length > 0) {
            imageFiles = req.files.map((file)=>( { filename : file.filename } ) )
        }

        const categoryData = await Category.findOne({ _id : myCategory })

        const product = new Product({
            productName:productName,
            description:description,
            regularPrice:marketPrice,
            salePrice:salePrice,
            category:categoryData._id,
            quantity:quantity,
            image:imageFiles,
        })

        const productData = await product.save()

        if (productData) {
            return res.redirect("/admin/products/add-new-product")
        } else {
         return res.render("add-product",{message:"Failed to Update...!"})   
        }
    } catch (error) {
        console.log(error.message)
        
    }

}

//============================delete product=========================================//

const deleteProduct = async (req, res) => {
    try {
      const { id } = req.query;
      const productData = await Product.deleteOne({ _id: id });
  
      if (productData.deletedCount > 0) {
        res.status(200).json({ success: true, message: "Product deleted successfully." });
      } else {
        res.status(404).json({ success: false, message: "Product not found." });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  };


  const editProduct = async(req,res)=>{
    try {
        const { id } = req.query

        const productData = await Product.findByIdAndUpdate({ _id : id })
        const categoryData = await Category.find({})
        if (productData) {
            res.render("edit-product",{
                title:"Edit Product",
                product:productData,
                category:categoryData
                })
            }
        } catch (error) {
        console.log(error.message);
        }
}

const UpdateCreateEditProduct = async(req,res)=>{
    try {
        const _id = req.query.productId
        const {
            productName,
            description,
            marketPrice,
            salePrice,
            myCategory,
            quantity
        } = req.body

        const imageFiles = req.files;

        let imageArray = [];
        if (imageFiles) {
            imageArray = imageFiles.map((file) => ({ filename : file.filename }))
        }
        //--------------------find existng product---------------------------//
        const existingProduct = await Product.findById({ _id })
        //--------------------apply in the existing image-----------------------------//
        const updatedImage = [...existingProduct.image,...imageArray];
        //---------------update with new product------------------------------------//
        const productData = await Product.findByIdAndUpdate(_id,
        {
            productName:productName,
            description:description,
            regularPrice:marketPrice,
            salePrice:salePrice,
            category:myCategory,
            quantity:quantity,
            image:updatedImage
        },
        { new : true }
        );
        
        if (productData) {
            res.redirect("/admin/products/product-management#products")
        }
    } catch (error) {
        console.log(error.message);
    }
}


//==================show Shop page======================================================//
const loadShop = async(req,res)=>{
    try {
        const user_id = req.session._id;
        const sortCategory = req.query.id;
        const page = req.query.page || 0;
        const productPerPage = 6

        const search = req.query.search;
        const priceRange = req.query.priceRange;
        const categorySearch = req.query.categorySearch
        let productData;

        if (search) {   
            if (categorySearch === "all") {
                productData = await Product.find({
                productName: { $regex: new RegExp(" .* " + search + " .* ", " i ")},
                })
                .skip( page * productPerPage )
                .limit( productPerPage )
            } else {
                productData = await Product.find({
                category:categorySearch,
                productName: { $regex: new RegExp(" .* " + search + " .* ", " i ")}
            })
                .skip( page * productPerPage )
                .limit( productPerPage )
            }
    
         }else{
            if (priceRange) {
                const [minPrice , maxPrice] = priceRange.split("-");
                productData = sortCategory 
                ? await Product.find({ 
                category : sortCategory ,
                salePrice:{ $gte : minPrice , $lte : maxPrice }
                })
                .skip( page * productPerPage )
                .limit( productPerPage )
                :await Product.find({
                salePrice:{ $gte : minPrice , $lte : maxPrice }
                })
                .skip( page * productPerPage )
                .limit( productPerPage )

            }else {
                productData = sortCategory
                    ?await Product.find({ category : sortCategory })
                    .skip( page * productPerPage )
                    .limit( productPerPage )
                    :await Product.find({})
                    .skip( page * productPerPage )
                    .limit( productPerPage )
            }
         }

        const totalNumberOfProducts = sortCategory
        ?await Product.find({ category : sortCategory })
        :await Product.find({})
        const totalNumberOfPages = Math.ceil(
            totalNumberOfProducts / productPerPage
        )
        const categoryData = await Category.find({});

        const loggedIn = req.session.isAuth ? true : false;

        if (productData && categoryData) {
            res.render('shop',{
                loggedIn,
                currentPage:"Shop",
                title:"Shop",
                category:categoryData,
                products:productData,
                page:page,
                totalNumberOfPages,
                totalNumberOfProducts : productData.length,
                selectedPriceRange : priceRange
            });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    ShowProduct,
    addNewProduct,
    createNewProduct,
    deleteProduct,
    editProduct,
    UpdateCreateEditProduct,
    loadShop
}