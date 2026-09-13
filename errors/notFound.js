const customError = require('./createCustomError')
const {StatusCodes} = require('http-status-codes')

class notFound extends customError{
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}
module.exports = notFound