const express = require('express')
const router = express.Router()

const {initPayment,verifyPayment,confirmPayment} = require('../controllers/paymentController')
router.route('/initialize/:orderId').post(initPayment)
router.patch('/verify/:reference', verifyPayment)
router.post('/webhook',confirmPayment)

module.exports = router