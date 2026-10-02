const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const getKey = require('../middleware/idempotencyCheck')
const {addToCart,getCart,deleteCart} = require('../controllers/cartController')
const {createOrder} = require('../controllers/orderController')

router.route('/').post(addValidators[3],checkValidity,addToCart).get(getCart)
router.post('/checkout',addValidators[4],checkValidity,getKey,createOrder)
router.route('/:cartId').delete(deleteCart)
module.exports = router