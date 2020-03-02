// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
const validator=require('validator');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local  : {

         email:{
               type:String,
               required:true,
               // unique:true,
               minlength:1,
               trim:true,
               validate:{
                 validator:validator.isEmail
               }
           },

         password:{
             type:String,
             required:true,
             minlength:4
            },
            name:{
                required:true,
                type:String,
                 minlength:1,
                 trim:true
         },
          phone: {
                     type: String,
                     validate: {
                       validator: function(v) {
                         return /\d{3}\d{3}\d{4}/.test(v);
                       },
                       message: '{VALUE} is not a valid phone number!'
                     },
                     required: [true, 'User phone number required']
          },
          dob:{
             type:String,required:true
          }

    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email:String

    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
