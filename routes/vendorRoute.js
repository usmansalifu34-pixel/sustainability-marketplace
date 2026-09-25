const express = require('express')
const router = express.Router()

const {param} = require('express-validator')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')

const {updateProfile,checkProfile} = require('../controllers/vendorController')


router.route('/profile').post(addValidators[5],checkValidity,updateProfile).get(checkProfile)

module.exports = router

