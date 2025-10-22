export function isAdmin(req, res, next){
    const user = req.user
    if(!user.admin){
        res.status(401).send("Not Allowed!")
    }else{
        next()
    }
}