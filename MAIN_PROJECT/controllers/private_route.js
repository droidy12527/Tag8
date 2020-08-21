const jwt = require('jsonwebtoken')

module.exports = (req, res, next)=>{
    const token  = req.header('auth-token')
    if(!token) return res.json({
        status:"please visit /token to get your token for requests"
    })
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (error) {
        res.status(400).json({
            status:"Invalid Token"
        })
    }
}

