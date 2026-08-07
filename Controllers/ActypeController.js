const Actype= require('../Model/ActtypeModel');
require('dotenv');
const addActType = async (req, res, next) => {
    
    try {
        const actype = await Actype.create(req.body);
      
        res.json({ message: "Account type added successfully", status: true });
      } catch (error) {
        if (error.name === 'ValidationError') {
          // Handle validation error
          return res.status(400).json({ message: error.message, status: false });
        } else if (error.name === 'MongoError' && error.code === 11000) {
          // Handle duplicate key error
          return res.status(409).json({ message: 'Account type already exists', status: false });
        } else {
          // Handle other errors
          return next(error);
        }
      }

}
const  getActTypes = async (req, res, next) => {
    try {
        const account = await Actype.find();
        res.json({account, status:true});
       
      } catch (error) {
        next(error);
      }
}


module.exports = {
    addActType,
    getActTypes,
  
  
}
