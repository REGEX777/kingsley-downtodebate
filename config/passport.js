import 'dotenv/config'
import { Strategy as LocalStrategy } from 'passport-local'


import User from '../models/User.js'

import bcrypt from 'bcrypt';


export default function async(passport){
    passport.use(
        new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
            },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({
                        email
                    });
                    if (!user) return done(null, false, {
                        message: 'Email Not Registered'
                    });

                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) return done(null, false, {
                        message: 'Incorrect Password'
                    });

                    return done(null, user);
                } catch (err) {
                    return done(err)
                }
            }
        )
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null)
        }
    });
}