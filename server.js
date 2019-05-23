var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');
var app = express();
var googleProfile = {};

// utrzymania sesji logowania, poprzez serializowanie ( kiedy sa wykonywane zadania uzytkownika )
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// konfiguracja zadania autoryzacji np. do google 
passport.use(new GoogleStrategy({
        // dane z pliku config 
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    },
    function (accessToken, refreshToken, profile, cb) {
        // w odpowiedzi otrzymamy profil uzytkownika przypisujac ja do pustej zmiennej {}
        googleProfile = {
            id: profile.id,
            displayName: profile.displayName
        };
        cb(null, profile);
    }
));

//silnik puga  inicjalizacja 
app.set('view engine', 'pug');
app.set('views', './views');
app.use(passport.initialize());
app.use(passport.session());

// stworzenie endpointow dla aplikacji : 

//app routes
app.get('/', function(req, res){
    res.render('index', { 
        user: req.user
    });
});

app.get('/logged', function(req, res){
    res.render('logged', { user: googleProfile });
});
//Passport routes
app.get('/auth/google',
passport.authenticate('google', {
scope : ['profile', 'email']
}));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/logged',
        failureRedirect: '/'
    }));

app.listen(3000);
app.use(function (req, res, next) {
    res.status(404).send('We can not find your request!')
});