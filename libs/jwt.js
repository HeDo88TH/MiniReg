const ejwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const dbconf = require('./dbconf');
const crypto = require('crypto');

// Generate secret
dbconf.setIfNotExists("jwt_secret", crypto.randomBytes(32).toString('hex'));
const secret = dbconf.get("jwt_secret");

module.exports = {
    readJwt: ejwt({ secret: secret, algorithms: ["HS256"]}),

    jwtAuth: [ejwt({ secret: secret, algorithms: ["HS256"]}), function(req, res, next){
    	if (!req.user.username) res.status(401).json({error: "Unauthorized"});
 
    	else next();
    }],
    sign: function(data){
        return jwt.sign(data, secret, { expiresIn: '6h' });
    }
}
