const express = require('express')
const router = express.Router()
const isAdmin = require('../middleware/isAdmin')
const {param} = require('express-validator')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')

const {listVendors,verifyVendor,getVendor} = require('../controllers/vendorController')
const {getProductsAdmin,verifyProduct,getProductAdmin} = require('../controllers/productsController')
router.route('/vendors').get(isAdmin,listVendors)
router.route('/vendors/:vendorId').patch(addValidators[6],checkValidity,isAdmin,verifyVendor)
            .get([param('vendorId').notEmpty()],checkValidity,isAdmin,getVendor)

router.route('/products').get(isAdmin,getProductsAdmin)
router.route('/products/:productId').patch(addValidators[7],checkValidity,isAdmin,verifyProduct)
            .get([param('productId').notEmpty()],checkValidity,isAdmin,getProductAdmin)

module.exports = router
