const customError = require('./createCustomError')
const {StatusCodes} = require('http-status-codes')

class badRequest extends customError{
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}
module.exports = badRequest