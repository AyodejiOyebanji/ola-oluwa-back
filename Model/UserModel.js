const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    smato_id: {
        type: Number,
        unique: true,
        required: true
    },
    fname: {
        type: String,
        unique: true,
        required: true
    },
    lname: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },

    phone: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
  
    isAdmin: {
        type: Boolean,
        default: false
    },
    isCashier: {
        type: Boolean,
        default: false
    },
    isStaff: {
        type: Boolean,
        default: false
    },
    reset_password:{
        type: String,
        
    },
    bankname: {
        type: String,
        
    },
    acct_no: {
        type: Number,
        
    },
    acct_name: {
        type: String,
        
    },
    
}, {timestamps: true});

// Indexes for fast lookup on login and registration checks
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ smato_id: -1 });

const user = mongoose.model('User', userSchema)
module.exports = user;

