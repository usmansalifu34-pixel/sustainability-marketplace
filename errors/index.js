const authError = require('./authError')
const badRequest = require('./badRequestError')
const notFound = require('./notFound')
const customError = require('./createCustomError')
module.exports = {
    authError,
    badRequest,
    notFound,
    customError
}