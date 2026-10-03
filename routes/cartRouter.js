const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const getKey = require('../middleware/idempotencyCheck')
const {addToCart,getCart,deleteCart,deductFromCart,deleteFromCart} = require('../controllers/cartController')
const {createOrder} = require('../controllers/orderController')
const {body,param} = require('express-validator')

router.route('/').post(addValidators[3],checkValidity,addToCart).get(getCart).delete(deleteCart)
router.post('/checkout',addValidators[4],checkValidity,getKey,createOrder)
router.route('/:productId').patch([body('quantity').notEmpty().isNumeric().isInt(),param('productId').notEmpty()],checkValidity,deductFromCart).delete([param('productId').notEmpty()],checkValidity,deleteFromCart)
module.exports = router