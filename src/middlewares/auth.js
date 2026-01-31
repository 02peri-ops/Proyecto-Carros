const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({message: 'Acceso denegado'});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({message: 'Token inválido'});
    }
    
    const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
};
