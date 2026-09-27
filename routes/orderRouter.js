const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const {param} = require('express-validator')

const {getAllOrders,getOrder} = require('../controllers/orderController')

router.get('/',getAllOrders)
router.get('/:orderId',param('orderId').notEmpty(),checkValidity,getOrder)
module.exports = router