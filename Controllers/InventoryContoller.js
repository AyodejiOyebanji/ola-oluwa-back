const Inventory = require('../Model/InventoryModel');
require('dotenv');


const addInventory = async(req,res,next)=>{
    try {
        const inventory = await Inventory.create(req.body);
      
        res.json({ message: "Inventory added successfully", status: true });
      } catch (error) {
        if (error.name === 'ValidationError') {
          // Handle validation error
          return res.status(400).json({ message: error.message, status: false });
        } 
        // else if (error.name === 'MongoError' && error.code === 11000) {
        //   // Handle duplicate key error
        //   return res.status(409).json({ message: 'Inventory already exists', status: false });
        // }
         else {
          // Handle other errors
          return next(error);
        }
      }
}
// const getAllInventory =async (req,res,next)=>{
//     try {
//         const inventory = await Inventory.find();
//         res.json({inventory, status:true});
       
//       } catch (error) {
//         next(error);
//       }

// }

const getAllInventory = async (req, res, next) => {
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
                { quantity: { $eq: Number(term) } },
                { total: { $eq: Number(term) } },
              ],
            };
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
            return { date: { $eq: term } };
          } else {
            return {
              $or: [
                { item: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
              ],
            };
          }
        }),
      };
    }

    const inventory = await Inventory.find(query)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (most recent first)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const totalInventory = await Inventory.countDocuments(query);
    const totalPages = Math.ceil(totalInventory / pageSize);
    const hasNextPage = page < totalPages;

    res.json({
      inventory,
      status: true,
      hasNextPage,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInventory=async (req,res,next)=>{
  
    
    try {
        const InventoryId = req.body.deletedId;
        const deletedInventory = await Inventory.findByIdAndDelete(InventoryId);
        if (!deletedInventory) {
          return res.status(404).json({ message: "Inventory not found" });
        }
        res.json({ message: "Inventory deleted successfully", status:true });
      } catch (error) {
        next(error);
      }


}

module.exports = {
    addInventory,
    getAllInventory,
    deleteInventory
}