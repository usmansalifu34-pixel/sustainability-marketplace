const customError = require('./createCustomError')
const {StatusCodes} = require('http-status-codes')

class authError extends customError{
    constructor(message){
        super(message)
        this.statusCode  = StatusCodes.UNAUTHORIZED
    }
}
module.exports = authError