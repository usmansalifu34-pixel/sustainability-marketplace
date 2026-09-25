const {authError} = require('../errors')

const isAdmin = async (req,res,next)=>{
    const {role} = req.user
    if(role!=="admin") throw new authError("Only admins can access this route")
        next()
}

module.exports = isAdmin