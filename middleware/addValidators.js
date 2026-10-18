const {param,body,header} = require('express-validator')

module.exports = [
            [param('productId').notEmpty().isMongoId()],
            [body('name').notEmpty(),body('price').notEmpty().isNumeric(),body('description').notEmpty().isLength({max:160}),body('quantity').notEmpty()],
            [body('name').notEmpty().optional(),body('price').notEmpty().optional().isNumeric(),body('description').notEmpty().optional().isLength({max:160}),body('quantity').notEmpty().optional()],
            [body('id').notEmpty().isMongoId(),body('quantity').notEmpty().bail().isNumeric().isInt()],
            [header('idempotencyKey').isUUID().notEmpty()],
            [body('businessName').notEmpty(),body('businessDescription').notEmpty().isLength({max:250})],
            [param('vendorId').notEmpty().isMongoId(),body('status').notEmpty()],
            [param('vendorId').notEmpty().isMongoId(),body('status').notEmpty()]] 