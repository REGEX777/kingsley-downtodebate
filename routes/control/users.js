import express from 'express';
import {
    customAlphabet
} from 'nanoid';
import Invite from '../../models/Invite.js';
import User from '../../models/User.js'

import {
    Resend
} from 'resend';
const resend = new Resend(process.env.RESEND_KEY)

const router = express.Router();
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);


async function adminInvite(){
    try {
        const accounts = await User.find({}).limit(1);
        if(accounts.length === 0){
          const invite = await Invite.findOne({invitedUserEmail: process.env.ADMIN_EMAIL});
          if(invite){
              const {
                  data,
                  error
              } = await resend.emails.send({
                  from: 'verify@bluefly.social',
                  to: [invite.invitedUserEmail],
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
                                          You were invited to be an admin for DownToDebate.
                                        </h2>
                                        <div
                                          style="font-size:16px;font-weight:normal;text-align:left;padding:16px 24px 16px 24px"
                                        >
                                          Click on the invite link below to create your account.
                                        </div>
                                        <div style="padding:16px 24px 16px 24px">
                                          <hr
                                            style="width:100%;border:none;border-top:1px solid #EEEEEE;margin:0"
                                          />
                                        </div>
                                        <div style="padding:16px 24px 16px 24px">
                                          <a
                                            href="${process.env.URL}/invite/${invite.code}"
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
          }

          if(!invite){
            const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
            const newInvite = new Invite({
              code: nanoid(),
              used: false,
              invitedUserEmail: process.env.ADMIN_EMAIL,
              expires: expiry
            })

            await newInvite.save();

              const {
                  data,
                  error
              } = await resend.emails.send({
                  from: 'verify@bluefly.social',
                  to: [newInvite.invitedUserEmail],
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
                                          You were invited to be an admin for DownToDebate.
                                        </h2>
                                        <div
                                          style="font-size:16px;font-weight:normal;text-align:left;padding:16px 24px 16px 24px"
                                        >
                                          Click on the invite link below to create your account.
                                        </div>
                                        <div style="padding:16px 24px 16px 24px">
                                          <hr
                                            style="width:100%;border:none;border-top:1px solid #EEEEEE;margin:0"
                                          />
                                        </div>
                                        <div style="padding:16px 24px 16px 24px">
                                          <a
                                            href="${process.env.URL}/invite/${newInvite.code}"
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

          }
        }
    } catch (error) {
        console.log(error)
    }
}

adminInvite()

router.get('/', async (req, res) => {
    try {
        if (!req.user.superadmin) {
            req.flash('error', 'Not enough permission')
            return res.redirect('/admin')
        }
        const invites = await Invite.find();
        const users = await User.find();

        res.render('admin/users', {
            invites,
            users
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/promote-superadmin', async (req, res)=>{
  try {
    if(!req.user.superadmin){
      req.flash('error', 'Not enough permission')
      return res.redirect('/admin')
    }

    const promotionUser = await User.findOne({_id: req.body.id})
    promotionUser.superadmin = true

    await promotionUser.save()
    req.flash('success', 'Successfully Promoted User')
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/demote-superadmin', async (req, res)=>{
  try {
    if(!req.user.superadmin){
      req.flash('error', 'Not enough permission')
      return res.redirect('/admin')
    }
    console.log(req.body)
    const demotionuser = await User.findOne({_id: req.body.id})
    if(!demotionuser.superadmin){
      req.flash('error', 'User is not super admin.')
      return res.redirect('/admin/users')
    }

    demotionuser.superadmin = false

    await demotionuser.save()
    req.flash('success', 'Successfully Demoted User')
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/delete', async (req, res) => {
    try {
        const id = req.body.id;
        if (!id) {
            req.flash('error', 'ID not found')
            return res.redirect('/admin/users')
        }

        if (!req.user.superadmin) {
            req.flash('error', 'Not enough permission')
            return res.redirect('/admin')
        }

        const deletedUser = await User.findOneAndDelete({
            _id: id
        })

        if (!deletedUser) {
            req.flash('error', 'Not Found')
            return res.redirect('/admin/users')
        }

        req.flash('success', 'User Deleted Successfully')
        return res.redirect('/admin/users')
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/invite', async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            req.flash('error', 'Please enter an email for invite.')
            return res.redirect('/admin/users')
        }
        
        if (!req.user.superadmin) {
            req.flash('error', 'Not enough permission')
            return res.redirect('/admin')
        }

        const invite = await Invite.findOne({
            invitedUserEmail: email
        }).lean();
        if (invite) {
            req.flash('error', 'Invite for this email already exists.')
            return res.redirect('/admin/users')
        }

        const user = await User.findOne({
            email: email
        }).lean()

        if (user) {
            req.flash('error', 'User already exists.')
            return res.redirect('/admin/users')
        }

        const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

        const newInvite = new Invite({
            code: nanoid(),
            used: false,
            invitedUserEmail: email,
            expires: expiry
        })

        await newInvite.save()

        const {
            data,
            error
        } = await resend.emails.send({
            from: 'verify@bluefly.social',
            to: [newInvite.invitedUserEmail],
            subject: 'Verify your bluefly account',
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
                You were invited to be an admin for DownToDebate.
              </h2>
              <div
                style="font-size:16px;font-weight:normal;text-align:left;padding:16px 24px 16px 24px"
              >
                Click on the invite link below to create your account.
              </div>
              <div style="padding:16px 24px 16px 24px">
                <hr
                  style="width:100%;border:none;border-top:1px solid #EEEEEE;margin:0"
                />
              </div>
              <div style="padding:16px 24px 16px 24px">
                <a
                  href="${process.env.URL}/invite/${newInvite.code}"
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


        req.flash('success', `Invite Sent To ${newInvite.invitedUserEmail}!`)
        res.redirect('/admin/users')

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/invite/delete', async (req, res) => {
    try {
        if(!req.user.superadmin){
          req.flash('error', 'Not Enough Permission')
          return res.redirect('/admin')
        }
        const deletedInvite = await Invite.findByIdAndDelete(req.body.id)
        if (!deletedInvite) {
            req.flash('error', 'Invite Not Found')
            return res.redirect('/admin/users')
        }

        req.flash('success', 'Invite Deleted Successfully!')
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

export default router;