import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session';
import flash from 'express-flash';

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
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

const port = 4000;

// routes import 
import index from './routes/index.js'
import admin from './routes/admin.js'

// routes
app.use('/', index)
app.use('/admin', admin)

app.listen(port, ()=>{
    console.log(`App started on port: ${port}`)
})

