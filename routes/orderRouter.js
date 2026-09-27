const express = require('express')
const router = express.Router()
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const getKey = require('../middleware/idempotencyCheck')

const {checkOut} = require('../controllers/orderController')

router.post('/order',addValidators[4],checkValidity,getKey,checkOut)
module.exports = router