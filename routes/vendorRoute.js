const express = require('express')
const router = express.Router()

const {param} = require('express-validator')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')
const {updateProfile,checkProfile,getPaidOrders,processOrder,verifyStudentEmail,requestVerificationCode} = require('../controllers/vendorController')

router.post('/email/verify',verifyStudentEmail)
router.post('/email/code',requestVerificationCode)
router.route('/profile').post(addValidators[5],checkValidity,updateProfile).get(checkProfile)
router.route('/orders').get(getPaidOrders)
router.route('/orders/process/:orderId').patch([param('orderId').notEmpty()],checkValidity,processOrder)
module.exports = router

