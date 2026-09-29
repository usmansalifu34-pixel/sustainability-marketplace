const express = require('express')
const router = express.Router()

const {initPayment,verifyPayment,confirmPaymentWebhook} = require('../controllers/paymentController')
router.route('/initialize/:orderId').post(initPayment)
router.patch('/verify/:reference', verifyPayment)


module.exports = router