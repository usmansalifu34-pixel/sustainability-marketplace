const {param,body,header} = require('express-validator')

module.exports = [
            [param('id').notEmpty()],
            [body('name').notEmpty(),body('price').notEmpty().isNumeric(),body('description').notEmpty().isLength({max:160}),body('quantity').notEmpty()],
            [body('name').notEmpty().optional(),body('price').notEmpty().optional().isNumeric(),body('description').notEmpty().optional().isLength({max:160}),body('quantity').notEmpty().optional()],
            [body('id').notEmpty(),body('quantity').notEmpty().bail().isNumeric()],
            [header('idempotencyKey').isUUID().notEmpty()],
            [body('businessName').notEmpty(),body('businessDescription').notEmpty().isLength({max:250})],
            [param('vendorId').notEmpty(),body('status').notEmpty()]]