import express from 'express';


const router = express.Router();


router.get('/', (req, res)=>{
    req.logOut(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/login')
    })
})

export default router;