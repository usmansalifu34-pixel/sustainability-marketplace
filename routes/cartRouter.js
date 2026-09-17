const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const {addToCart,getCart,checkOut} = require('../controllers/cartController')

router.route('/').post(addValidators[3],checkValidity,addToCart).get(getCart)
router.post('/order',addValidators[4],checkValidity,checkOut)
module.exports = router