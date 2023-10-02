
import Joi from "joi";
import { emailRegexp } from "../models/User.js";

export const userSignupSchema = Joi.object({
    username: Joi.string().required(),
    email:Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required()
})

 export const loginSignupSchema = Joi.object({
    email:Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required()})


 export const userRefreshTokenSchema = Joi.object({
    refreshToken:Joi.string().required(),
 })   

 export const userEmailSchema = Joi.object({
   email:Joi.string().pattern(emailRegexp).required(),
 })
    export default { userSignupSchema, loginSignupSchema,userRefreshTokenSchema, userEmailSchema };
