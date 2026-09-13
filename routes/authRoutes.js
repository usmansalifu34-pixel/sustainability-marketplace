const express = require('express')
const router = express.Router()
const validate = require('../middleware/checkValidation')
const {body} = require('express-validator')
const {register,login} = require('../controllers/authController')

router.post('/register',[body('name').notEmpty(),body('email').notEmpty(),body('password').notEmpty().isLength({min:6}),body('role').optional().notEmpty().isIn(['customer', 'vendor'])],validate,register)
router.post('/login',[body('email').notEmpty(),body('password').notEmpty()],validate,login)
module.exports = router