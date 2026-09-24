const express = require('express')
const router = express.Router()
const isAdmin = require('../middleware/isAdmin')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')

const {updateProfile,listVendors} = require('../controllers/vendorController')
router.route('/verify').post(addValidators[5],checkValidity,updateProfile)

module.exports = router