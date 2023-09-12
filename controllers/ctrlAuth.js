import {ctrlWrapper} from "../decorators/index.js";
import {HttpError} from "../helpers/index.js";
import { Jwt } from "jsonwebtoken"; 
import bcrypt from "bcryptjs"
import User from "../models/User.js"

const {SECRET_KEY} = process.env
const signup = async(req, res) =>{
const {email, password} = req.body
const user = await User.findOne({email});

if(user) {
    throw HttpError(409, "Email already in use")
}

const hashPassword = await bcrypt.hash(password, 10)

const newUser = await User.create({...req.body, password:hashPassword});
res.status(201).json({
username: newUser.username,
email: newUser.email})}

const login =  async(req, res) =>{
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user) {
        throw HttpError(401, "Email or password invalid")
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if(!passwordCompare ) {
        throw HttpError(401, "Email or password invalid")
    }

    const payload ={
        id: user._id
    }
    const token = Jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"})
 
    res.json({token})
}

export default {
    signup: ctrlWrapper(signup),
    login:ctrlWrapper(login)
}