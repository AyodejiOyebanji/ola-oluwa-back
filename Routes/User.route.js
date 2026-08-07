const express = require('express')
const router = express.Router()
const UserController = require('../Controllers/User.Controller')
router.get('/dashboard', UserController.getDashboard);
router.get('/currentuser/:currentUser', UserController.getCurrentUser);
router.post('/updateProfile', UserController.updateProfile);
router.get('/getTotalExpenses', UserController.getTotalExpenses);
router.get('/getallStaffs', UserController.fetchAllStaffs);


module.exports = router