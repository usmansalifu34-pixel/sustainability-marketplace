const bcrypt = require('bcryptjs')

const genPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}
const hashCode = async(code)=>{
    const salt = await bcrypt.genSalt(10)
    let hashedCode = await bcrypt.hash(code,salt)
    return code
}
const compareCode = async(code,hashedCode)=>{
    let res= await bcrypt.compare(code,hashedCode)
    return res
}
module.exports = {
    hashCode,
    genPassword
}