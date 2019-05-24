//validation
const Joi = require("@hapi/joi");

const registerValidation = (body)=>{
    const schema = {
        name:Joi.string().min(4).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
        type: Joi.number().min(0).max(1),
    }
    return Joi.validate(body,schema);
}
const loginValidation = (body)=>{
    const schema = {
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
    }
    return Joi.validate(body,schema);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;