const express = require('express')
const router = express.Router()
const  WalletController = require('../Controllers/Wallet.Controller')
router.post('/add-wallet', WalletController.AddWallet );
router.get('/get-wallets', WalletController.getWallets );
router.get('/get-wallet/:id', WalletController.getWallet );
router.post('/add-deduction', WalletController.addDeduuction );
router.post('/delete-wallet', WalletController.deleteWallet );



module.exports = router


