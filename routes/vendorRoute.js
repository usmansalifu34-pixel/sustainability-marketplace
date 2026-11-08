const express = require('express')
const router = express.Router()

const {param} = require('express-validator')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const {updateProfile,checkProfile,getPaidOrders,processOrder,verifyStudentEmail} = require('../controllers/vendorController')

router.post('/verify',verifyStudentEmail)
router.route('/profile').post(addValidators[5],checkValidity,updateProfile).get(checkProfile)
router.route('/orders').get(getPaidOrders)
router.route('/orders/process/:orderId').patch([param('orderId').notEmpty()],checkValidity,processOrder)
module.exports = router

