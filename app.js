import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session';
import flash from 'express-flash';
import passport from 'passport';
import passportConfig from './config/passport.js'

import { isLoggedIn } from './middleware/isLoggedIn.js';
import { isAdmin } from './middleware/isAdmin.js';

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database Connected");
    })
    .catch(err => console.log(err));

const app = express()
app.set('view engine', 'ejs')
app.set('trust proxy', true);
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());



app.use(async (req, res, next) => {
  res.locals.url = process.env.URL
  res.locals.success = req.flash('success');
  res.locals.currentPath = req.path;
  res.locals.error = req.flash('error');
  res.locals.siteConfig = (await Icon.findOne({}).lean()) || { blogIcon: '✱' };
    if (req.isAuthenticated()) { 
      res.locals.user = req.user; 
    } else {
      res.locals.user = null; 
    }
  next();
});

const port = 4000;

// routes import 
import index from './routes/index.js'
import admin from './routes/admin.js'
import ivnite from './routes/invite.js'
import login from './routes/login.js'
import logout from './routes/logout.js'
import passwordreset from './routes/password-reset.js'
import { isLoggedOut } from './middleware/isLoggedOut.js';
import Icon from './models/Icon.js';

// routes
app.use('/', index)
app.use('/admin', isLoggedIn, isAdmin, admin)
app.use('/invite', ivnite)
app.use('/login', isLoggedOut, login)
app.use('/logout', logout)
app.use('/password-reset', passwordreset)



app.use((req, res, next) => {
  console.warn(`404 - Not Found - ${req.method} ${req.originalUrl} - Referer: ${req.get('referer') || '-'}`);
  
    const meta = {
        pageTitle: "404 - Down To Debate",
        metaDescription: "The requested resource was not found!",
        canonicalUrl: `${process.env.URL}/404`,
        ogTitle: "Requested Resource Not Found"
    }
  res.status(404).render('404', { url: req.originalUrl, meta });
});



app.listen(port, ()=>{
    console.log(`App started on port: ${port}`)
})

