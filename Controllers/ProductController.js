const Product = require('../Model/ProductModel');
const ProductHistory = require('../Model/ProductHistory');
require('dotenv');
const PDFDocument = require('pdfkit');  
const fs = require('fs');

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const JWT_KEY = process.env.JWT_KEY


const addProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
  
    res.json({ message: "Product added successfully", status: true });
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Handle validation error
      return res.status(400).json({ message: error.message, status: false });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      // Handle duplicate key error
      return res.status(409).json({ message: 'Product already exists', status: false });
    } else {
      // Handle other errors
      return next(error);
    }
  }
};
 const fetchallProducts =async (req,res,next)=>{
     try {
         const products = await Product.find();
         res.json({products, status:true});
        
       } catch (error) {
         next(error);
       }

 }


 const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, search } = req.query;
    let query = {};

    if (search) {
      const searchTerms = search.split(' ');

      query = {
        $or: searchTerms.map((term) => {
          if (!isNaN(term)) {
            return {
              $or: [
                { productPrice: { $eq: Number(term) } },
                { productQuantity: { $gte: Number(term) } },
              ],
            };
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
            return { date: { $eq: term } };
          } else {
            return {
              $or: [
                { productName: { $regex: term, $options: 'i' } },
                { date: { $regex: term, $options: 'i' } },
              ],
            };
          }
        }),
      };
    }

    const products = await Product.find(query)
      .sort({ productName: 1 }) // Sort by productName in ascending order (A-Z)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / pageSize);
    const hasNextPage = page < totalPages;

    res.json({
      products,
      status: true,
      hasNextPage,
    });
  } catch (error) {
    next(error);
  }
};





 const getdeleteProduct = async(req,res,next)=>{
    try {
        const productId = req.body.deletedId;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully", status:true });
      } catch (error) {
        next(error);
      }
     
     }

   const geteditProduct= async (req,res,next)=>{
    try {
        const productId = req.params.editedId;
        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          req.body,
          { new: true }
        );
     
    
        if (!updatedProduct) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        res.json({ message: "Product updated successfully", updatedProduct, status:true });
      } catch (error) {
        next(error);
      }
   }

    const addMoreToProduct= async (req,res,next)=>{
      try {
        const { _id, productAdded, productInitialQuantity, productName } = req.body;
    
        // Update existing product quantity
        const updatedProduct = await Product.findByIdAndUpdate(
          _id,
          { $inc: { productQuantity: productAdded } }, // Increment productQuantity
          { new: true }
        );
    
        // Save the history in ProductHistory model
        await ProductHistory.create({
          productName:productName,
          productInitialQuantity:productInitialQuantity,
          productAdded: productAdded,
          totalRemaining:productAdded+productInitialQuantity,
          product_id:_id,
          closingStock:productAdded+productInitialQuantity,

        });
    
        res.json({ message: "Product quantity updated successfully", status: true, updatedProduct });
      } catch (error) {
        if (error.name === 'ValidationError') {
          // Handle validation error
          return res.status(400).json({ message: error.message, status: false });
        } else {
          return res.status(400).json({ message: "Internal Server Error", status: false });
        }
      }
    }
   
module.exports = {
    addProduct,
    getAllProducts,
    getdeleteProduct,
    geteditProduct,
    addMoreToProduct,
    fetchallProducts
    
  
}
