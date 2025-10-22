export function isLoggedOut(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }

    req.flash('error', 'Please log out first.')
    res.redirect('/')
}