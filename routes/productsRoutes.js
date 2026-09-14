const authMid = require('../middleware/authMid')
const express = require('express')
const router = express.Router()
const addValidator = require('../middleware/addValidators')
const checkValidators = require('../middleware/checkValidation')
const upload = require('../middleware/uploadImage')
const {createProduct,getProducts,deleteProduct} = require('../controllers/productsController')
router.route('/').get(getProducts).post(upload.single('image'),createProduct)
router.route('/:id')/*.get(getProduct).patch(updateProduct)*/.delete(addValidator,checkValidators,deleteProduct)

module.exports = router