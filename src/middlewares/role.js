module.exports = (roles) => {
    return (req, res, next) => {
        if(req.user && req.user.role === roles){
            next();
        } else {
            res.status(403).json({message: 'Acceso denegado'});
        }
    };
};


