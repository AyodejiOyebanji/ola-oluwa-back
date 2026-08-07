const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActtypeSchema = new Schema({
    
    act_id:{
        type: Number,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,

        required: true
    },

    
  
    
   
    
}, {timestamps: true}); 
const actype = mongoose.model('actype_tb', ActtypeSchema )
module.exports =actype;
