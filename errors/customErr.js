const {StatusCodes} = require('http-status-codes')
class customError extends Error{
    constructor(message,statusCode){
        super(message)
        this.StatusCode = statusCode
    }
}
module.exports = customError