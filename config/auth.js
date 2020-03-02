// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '213577429694415', //  App ID
        'clientSecret'  : '768c179873720108a9550456b8ba71f4', //  App Secret
        'callbackURL'   : '/auth/facebook/callback'
        // 'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        // 'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    },

    'googleAuth' : {
        'clientID'      : '282698431179-m7kckfgf6q9l87v07d07mnk0vfl6eu3k.apps.googleusercontent',
        'clientSecret'  :'9NM4TgtUHJylPF8T4w8lmzgg',
        'callbackURL'   : '/auth/google/callback'
    }

};
