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
app.use((req, res, next) => {
  res.locals.url = process.env.URL
  res.locals.success = req.flash('success');
  res.locals.currentPath = req.path;
  res.locals.error = req.flash('error');
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

// routes
app.use('/', index)
app.use('/admin', isLoggedIn, isAdmin, admin)
app.use('/invite', ivnite)
app.use('/login', login)

app.listen(port, ()=>{
    console.log(`App started on port: ${port}`)
})

