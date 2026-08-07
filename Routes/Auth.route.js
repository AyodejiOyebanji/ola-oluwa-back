const express = require('express')
const router = express.Router()

const AuthController = require('../Controllers/AuthController') 

router.post('/auth/register', AuthController.register)
router.post('/auth/verifyemail', AuthController.confirmPin)
router.post('/auth/login', AuthController.login)
router.post('/auth/refresh', AuthController.refreshToken)


module.exports = router