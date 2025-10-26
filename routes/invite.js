import express from 'express';
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';
import Invite from '../models/Invite.js';
import User from '../models/User.js';
import { isLoggedOut } from '../middleware/isLoggedOut.js';


const router = express.Router();


router.get('/:code', isLoggedOut, async (req, res)=>{
    try{
        const code = req.params.code;
        const invite = await Invite.findOne({code: code});
        if(!invite) return res.status(404).redirect('/404');
        if(invite.used) return res.status(400).send('Invite Already Used');
        res.render('auth/invitesignup', {invite})
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/signup', async (req, res)=>{
        const invitecode = req.body.invcode;
        if(!invitecode){
            return res.status(404).send('error1')
        }
        const invite = await Invite.findOne({code: invitecode})
        if(!invite){
            req.flash('error', 'Invite code not found.')
            return res.redirect(`/invite/${invitecode}`)
        }

        if(invite.used){
            req.flash('error', 'Invite already used.')
            return res.redirect(`/invite/${invitecode}`)
        }

        if(!req.body.password){
            req.flash('error', 'Please enter a password.')
            return res.redirect(`/invite/${invitecode}`)
        }

        if(!req.body.username){
            req.flash('error', 'Please enter a username.')
            return res.redirect(`/invite/${invitecode}`)
        }

        const dateNow = new Date();

        if(invite.expires < dateNow){
            req.flash('error', 'Invite expired, request new invite please.')
            return res.redirect(`/invite/${invitecode}`)
        }

        const hash = await bcrypt.hash(req.body.password, 10)
        const verificationToken = nanoid();

        const user = new User({
            email: invite.invitedUserEmail,
            admin: true,
            username: req.body.username,
            password: hash,
            signupIp: req.ip,
            verificationToken
        })

        const availableUsers = await User.find({});

        if(availableUsers.length === 0){
            user.superadmin = true
        }

        user.accessLogs.push(req.ip)

        await user.save();

        invite.used = true;
        await invite.save()

        res.redirect('/admin')
})

export default router;