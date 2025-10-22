import express from 'express';
import passport from 'passport';

const router = express.Router();

// Middleware Import
import { validateEmail } from '../middleware/emailValidator.js';

router.get('/', (req, res)=>{
    res.render('auth/login')
})

router.post('/', validateEmail, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    req.flash('success', 'Logged in Succesfully.')
    res.redirect('/admin')
});


export default router;