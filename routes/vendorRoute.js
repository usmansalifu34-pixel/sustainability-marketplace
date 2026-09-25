const express = require('express')
const router = express.Router()
const isAdmin = require('../middleware/isAdmin')
const {param} = require('express-validator')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')

const {updateProfile,
        listVendors,
        verifyVendor,
        getVendor,
        checkProfile} = require('../controllers/vendorController')


router.route('/profile').post(addValidators[5],checkValidity,updateProfile).get(checkProfile)
router.route('/').get(isAdmin,listVendors)
router.route('/:vendorId').patch(addValidators[6],checkValidity,isAdmin,verifyVendor)
            .get([param('vendorId').notEmpty()],checkValidity,isAdmin,getVendor)

module.exports = router