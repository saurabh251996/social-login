
var mongoose = require('mongoose');


// define the schema for our user model
var socialSchema = mongoose.Schema({

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



// create the model for users and expose it to our app
module.exports = mongoose.model('SocialUser', socialSchema);
