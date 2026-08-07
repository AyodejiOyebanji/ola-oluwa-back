const express = require('express')
const router = express.Router()
const AccountTypeController = require('../Controllers/ActypeController')
router.post('/add_act_type', AccountTypeController.addActType);
router.get('/getaccounts', AccountTypeController.getActTypes);





module.exports = router