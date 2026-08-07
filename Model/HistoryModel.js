const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    
    productName:{
        type: String,
       
        required: true
    },

    productInitialQuantity: {
        type: Number,
        required: true
    },

    productAdded: {
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

// Index for product name search
productSchema.index({ productName: 1 });
productSchema.index({ createdAt: -1 });

const history = mongoose.model('History', productSchema)
module.exports = history;
