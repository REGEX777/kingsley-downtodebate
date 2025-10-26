import 'dotenv/config'
import express from 'express';
import {
    validateEmail
} from '../middleware/emailValidator.js';
import User from '../models/User.js';
import { nanoid } from 'nanoid';
import {
    Resend
} from 'resend';
import bcrypt from 'bcrypt'


const resend = new Resend(process.env.RESEND_KEY)

const router = express.Router();


router.get('/', (req, res) => {
    res.render('auth/password-reset')
})

router.post('/', validateEmail, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            req.flash('error', 'User Not Found')
            return res.redirect('/password-reset')
        }
        const oneHourAgo = Date.now() - 3600000;

        if (user.lastResetRequest && user.lastResetRequest > oneHourAgo) {
            req.flash('error', 'Please wait before trying again.')
            return res.redirect('/password-reset')
        }


        const token = nanoid()
        user.resetToken = token;
        user.tokenExpiration = Date.now() + 3600000;
        user.lastResetRequest = Date.now()

        await user.save()

        const passwordResetLink = `${process.env.URL}/password-reset/new-password?token=${token}`


        const {
            data,
            error
        } = await resend.emails.send({
            from: 'verify@bluefly.social',
            to: [user.email],
            subject: 'DownToDebate Invite',
            html: `
                          <!doctype html>
                          <html>
                            <body>
                              <div
                                style='background-color:#FFFFFF;color:#03124A;font-family:Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
                              >
                                <table
                                  align="center"
                                  width="100%"
                                  style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
                                  role="presentation"
                                  cellspacing="0"
                                  cellpadding="0"
                                  border="0"
                                >
                                  <tbody>
                                    <tr style="width:100%">
                                      <td>
                                        <h2
                                          style="font-weight:bold;text-align:left;margin:0;font-size:24px;padding:16px 24px 0px 24px"
                                        >
                                          Password Reset Link.
                                        </h2>
                                        <div
                                          style="font-size:16px;font-weight:normal;text-align:left;padding:16px 24px 16px 24px"
                                        >
                                          Click on the link below to reset your password.
                                        </div>
                                        <div style="padding:16px 24px 16px 24px">
                                          <hr
                                            style="width:100%;border:none;border-top:1px solid #EEEEEE;margin:0"
                                          />
                                        </div>
                                        <div style="padding:16px 24px 16px 24px">
                                          <a
                                            href="${passwordResetLink}"
                                            style="color:#FFFFFF;font-size:16px;font-weight:bold;background-color:#171717;border-radius:4px;display:inline-block;padding:12px 20px;text-decoration:none"
                                            target="_blank"
                                            ><span
                                              ><!--[if mso
                                                ]><i
                                                  style="letter-spacing: 20px;mso-font-width:-100%;mso-text-raise:30"
                                                  hidden
                                                  >&nbsp;</i
                                                ><!
                                              [endif]--></span
                                            ><span>Click Here</span
                                            ><span
                                              ><!--[if mso
                                                ]><i
                                                  style="letter-spacing: 20px;mso-font-width:-100%"
                                                  hidden
                                                  >&nbsp;</i
                                                ><!
                                              [endif]--></span
                                            ></a
                                          >
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </body>
                          </html>
                        `
        });


        if (error) {
            console.error('Resend email error:', error);
        } else {
            console.log('Email sent successfully:', data);
        }

        req.flash('success', 'Password reset link sent to your email!')
        res.redirect('/password-reset')

    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/new-password', async (req, res)=>{
    const token = req.query.token
    const user = await User.findOne({resetToken: token}).lean();
    res.render('auth/reset-password', {token: token, user})
})


router.post('/new-password', async (req, res)=>{
    const user = await User.findOne({resetToken:req.body.resetToken, tokenExpiration: { $gt: Date.now() }});
    if(!user) return res.status(400).send("Invalid or Expire token.");

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = undefined;
    user.tokenExpiration = undefined;

    await user.save()

    req.login(user, err => {
        if (err) {
            console.log(err);
            return res.status(500).send("Login failed.");
        } else {
            req.flash('success', 'Password reset successful, you are now logged in.');
            return res.redirect('/admin');
        }
    });
})

export default router;