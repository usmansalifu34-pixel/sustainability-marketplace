const authMid = require('../middleware/authMid')
const express = require('express')
const router = express.Router()
const addValidator = require('../middleware/addValidators')
const checkValidators = require('../middleware/checkValidation')
const upload = require('../middleware/uploadImage')
const {createProduct,getProducts,deleteProduct,getProduct,updateProduct} = require('../controllers/productsController')
router.route('/').get(getProducts).post(upload.single('image'),addValidator[1],checkValidators,createProduct)
router.route('/:id').get(addValidator[0],checkValidators,getProduct).patch(upload.single('image'),addValidator[0],addValidator[2],checkValidators,updateProduct).delete(addValidator[0],checkValidators,deleteProduct)

module.exports = router