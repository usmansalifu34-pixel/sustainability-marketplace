const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const {param} = require('express-validator')

const {getAllOrders,getOrder} = require('../controllers/orderController')
const {orderRecieved,cancelOrder} = require('../controllers/orderController')

router.get('/',getAllOrders)
router.get('/:orderId',param('orderId').notEmpty(),checkValidity,getOrder)
router.patch('/:orderId/confirm',param('orderId').notEmpty(),checkValidity,orderRecieved)
router.patch('/:orderId/cancel',param('orderId').notEmpty(),checkValidity,cancelOrder)
module.exports = router