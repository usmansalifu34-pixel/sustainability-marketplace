const {param} = require('express-validator')

module.exports = [param('id').notEmpty()]