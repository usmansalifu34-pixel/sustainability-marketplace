const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const getKey = require('../middleware/idempotencyCheck')
const {addToCart,getCart} = require('../controllers/cartController')
const {checkOut} = require('../controllers/orderController')

router.route('/').post(addValidators[3],checkValidity,addToCart).get(getCart)
router.post('/checkout',addValidators[4],checkValidity,getKey,checkOut)
module.exports = router