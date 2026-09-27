const express = require('express')
const router = express.Router()

const {initPayment} = require('../controllers/paymentController')
router.route('/initialize/:orderId').post(initPayment)

module.exports = router