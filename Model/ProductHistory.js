const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductHistorySchema = new Schema({
    
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
   totalRemaining: {
        type: Number,
        required: true
    },

    product_id: {
        type: String,
        required: true
    },
    closingStock: {
        type: Number,
        default: 0,
      },

    
   
   
    
}, {timestamps: true});

// Indexes for product history search and sort
ProductHistorySchema.index({ createdAt: -1 });
ProductHistorySchema.index({ productName: 1 });
ProductHistorySchema.index({ product_id: 1 });

const ProductHistory = mongoose.model('product_history_tb', ProductHistorySchema)
module.exports = ProductHistory;
