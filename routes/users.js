var express = require('express');
var router = express.Router();
var commonModule = require('../modules/common');
var passport = require('passport');
var LocalStrategy = require('passport-local');

const FLASH_INFO = commonModule.FLASH_INFO;
const FLASH_ERROR = commonModule.FLASH_ERROR;
const FLASH_SUCCESS = commonModule.FLASH_SUCCESS;
var postCheckStringLength = commonModule.postCheckStringLength;
var extractStringDataFromReqBody = commonModule.extractStringFromReqBodySafeForSQL;

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
},
  function(req, username, password, done) {
    email = extractStringDataFromReqBody(req, 'email');
    dbconn.query("select id, email, password, firstname, lastname, adminpriv from users where email=" + email,  
                  function(err, rows) {
      if(err) {
        console.log(err);
        req.flash("FLASH_MSG", ["Błąd", "Przepraszamy, wystąpił błąd po stronie serwera"]);
        return done(null, false);
      } else if(rows.length == 1) {
        if(rows[0].password == password)
          return done(null, { id: rows[0].id, email: rows[0].email, first_name: rows[0].firstname, last_name: rows[0].lastname, admin_priv: rows[0].adminpriv });
        else {
          req.flash("FLASH_MSG", [FLASH_ERROR, "Niepoprawne hasło"]);
          return done(null, false);
        }
      } else if(rows.length == 0) {
        req.flash("FLASH_MSG", [FLASH_ERROR, "Nie ma użytkownika o takim adresie e-mail"]);
        return done(null, false);
      } else {
        console.log("UNKNOWN ERROR");
        console.log(err);
        console.log(rows);
        req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd po stronie serwera"]);
        return done(null, false);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


router.get('/register', commonModule.notAutenticatedOnlyAccess, function(req, res, next) {
  res.render('register', { title: 'Zarejestruj', user: req.user, flash_msg: req.flash("FLASH_MSG")});
});

router.post('/register', function(req, res, next) {
  var email = extractStringDataFromReqBody(req, 'email');
  var password = extractStringDataFromReqBody(req, 'password');
  var first_name = extractStringDataFromReqBody(req, 'first_name');
  var last_name = extractStringDataFromReqBody(req, 'last_name');

  if(postCheckStringLength(email, 1, 30, 'email', 'register', 'Zarejestruj', req, res) || postCheckStringLength(password, 1, 30, 'hasło', 'register', 'Zarejestruj', req, res)) {
    return;
  }

  dbconn.query("insert into users (email, password, firstname, lastname, adminpriv) " + 
                "values (" + email + ", " + password + ", " + first_name + ", " + last_name + ", 0)", 
                  function(err, rows) {
    if(err) { 
      if(err.code == 'ER_DUP_ENTRY')
      req.flash("FLASH_MSG", [FLASH_ERROR, "Ten adres e-mail jest już zajęty"]);
      else
      {
        console.log(err);
        req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd po stronie serwera"]);
      }
      res.render('register', { title: 'Zarejestruj', user: req.user, flash_msg: req.flash("FLASH_MSG") });
    }
    else {
      req.flash("FLASH_MSG", [FLASH_SUCCESS, "Konto użytkownika zostało założone"]);
      res.render('login', { title: 'Zaloguj', user: req.user, flash_msg: req.flash("FLASH_MSG") });
    }
  });
});

router.get('/login', commonModule.notAutenticatedOnlyAccess, function(req, res, next) {
  res.render('login', { title: 'Zaloguj', user: req.user, flash_msg: req.flash("FLASH_MSG")  });
});

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash : true}),
  function(req, res, next) {
    req.flash("FLASH_MSG", [FLASH_SUCCESS, "Zalogowano pomyślnie"]);
    res.redirect('/');
  }
);

router.get('/logout', function(req, res)
{
  if(!req.isAuthenticated())
  {
    req.flash("FLASH_MSG", [FLASH_INFO, 'Nie można wylogować osoby, która nie jest zalogowana']);
    res.redirect('/login');
  }
  else
  {
    req.logout();
    req.flash('FLASH_MSG', [FLASH_SUCCESS, 'Wylogowano pomyślnie']);
    res.redirect('/');
  }
});

router.get('/account', commonModule.authenticatedOnlyAccess, function(req, res, next) {
  res.render('account', { title: 'Moje konto', user: req.user, flash_msg: req.flash("FLASH_MSG")});
});


module.exports = router;
