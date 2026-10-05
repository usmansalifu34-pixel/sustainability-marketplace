const express = require('express')
const router = express.Router()
const isAdmin = require('../middleware/isAdmin')
const {param} = require('express-validator')
const addValidators = require('../middleware/addValidators')
const checkValidity = require('../middleware/checkValidation')

const {listVendors,verifyVendor,getVendor} = require('../controllers/vendorController')
const {getProductsAdmin,verifyProduct,getProductAdmin} = require('../controllers/productsController')
const {shipOrders,ordersDelivered} = require('../controllers/orderController')


router.route('/vendors').get(isAdmin,listVendors)
router.patch('/vendors/verify/:vendorId',addValidators[6],checkValidity,isAdmin,verifyVendor)

router.get('/vendors/:vendorId',[param('vendorId').notEmpty()],checkValidity,isAdmin,getVendor)

router.route('/products').get(isAdmin,getProductsAdmin)
router.route('/products/:productId').patch(addValidators[7],checkValidity,isAdmin,verifyProduct)
            .get([param('productId').notEmpty()],checkValidity,isAdmin,getProductAdmin)

router.patch('/orders/ship/:orderId',[param('orderId').notEmpty()],checkValidity,shipProducts)
module.exports = router
