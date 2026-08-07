const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
   
    productName:{
        type: String,
        unique: true,
        required: true
    },

    productPrice: {
        type: Number,
        
        required: true
    },

    productQuantity: {
        type: Number,
       
        required: true
    },

    
    date: {
        type: String,
        required: true
    },
    uploadedBy:{
        type: Number,
        required:true,  
    },
   
    
}, {timestamps: true});

// Index for search by name (used in getAllProducts) and createdAt for sorting
productSchema.index({ productName: 1 });
productSchema.index({ createdAt: -1 });

const product = mongoose.model('Product', productSchema)
module.exports = product;
