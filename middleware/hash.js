const bcrypt = require('bcryptjs')

const genPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}
const hashCode = async(code)=>{
    let hashedCode = await bcrypt.hash(code)
    return code
}
module.exports = {
    hashCode,
    genPassword
}