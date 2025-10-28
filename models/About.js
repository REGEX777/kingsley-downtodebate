import mongoose from "mongoose";


const aboutSchema = new mongoose.Schema({
    about: String,
    original: String
})

const About = mongoose.model('About', aboutSchema)

export default About; 