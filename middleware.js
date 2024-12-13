function Authentication(req, res, next) {
    const user = req.cookies.user; 
    if (user) {
        req.user = user;
        return next();
    }
    else{
        return res.redirect('/api/signin');
    }
}
module.exports={
    Authentication,
}