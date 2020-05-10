var express = require('express');
var router = express.Router();
var commonModule = require('../modules/common');

const FLASH_INFO = commonModule.FLASH_INFO;
const FLASH_ERROR = commonModule.FLASH_ERROR;
const FLASH_SUCCESS = commonModule.FLASH_SUCCESS;
var isDate = commonModule.isDate;


router.get('/', function(req, res, next) {
  if(!req.isAuthenticated())
    return res.render('index', { title: 'Strona główna rezerwacji sal konferencyjnych', user: req.user, flash_msg: req.flash("FLASH_MSG")});

  dbconn.query("select id, rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale", function(err, rows) {
    if(err)
    {
        console.log(err);
        req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać listy sal"]);
    }
    res.render('index', { title: 'Strona główna rezerwacji sal konferencyjnych', user: req.user, flash_msg: req.flash("FLASH_MSG"), halls: rows});
  });
});

router.get('/dev', function(req, res) {
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()) console.log(JSON.stringify(req.user, 0, 4));
  res.redirect('/');
});

router.post('/index/filter', commonModule.authenticatedOnlyAccess, function(req, res) {
  var start_date = req.body.start_date.replace("'", "''");
  var end_date = req.body.end_date.replace("'", "''");
  if((!isDate(start_date)) || (!isDate(end_date))) {
    req.flash('FLASH_MSG', [FLASH_INFO, 'Nie podano wszystkich filtrów']);
    return res.redirect('/');
  }
  // order by Sale.numer
  dbconn.query("select Sale.id, Sale.rodzaj, Sale.numersali, Sale.liczbamiejsc, Sale.ostatniarez, Sale.cena, " + 
    "Rezerwacja.start_date, Rezerwacja.end_date from Rezerwacja inner join Sale on Sale.id = Rezerwacja.salaID order by Sale.id, Rezerwacja.start_date", function(err, rents) {
      if(err)
      {
          console.log(err);
          req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać listy sal"]);
          return res.redirect('/');
      }  
      dbconn.query("select id, rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale", function(err, halls) {
        if(err)
        {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać listy sal"]);
            return res.redirect('/');
        }
        res.render('index', { title: 'Strona główna rezerwacji sal konferencyjnych', user: req.user, flash_msg: req.flash("FLASH_MSG"), 
                              halls: filterHall(halls, rents, start_date, end_date), totalDays: calculateDays(start_date, end_date),
                              start_date: URLFriendlyDate(start_date), end_date: URLFriendlyDate(end_date) });
      });
  });
});

function filterHall(halls, fromRents, start_date, end_date)
{
  if(isNaN(Date.parse(end_date)) || isNaN(Date.parse(start_date)))
    return halls;
  start_date = new Date(start_date);
  end_date = new Date(end_date);
  var filteredHalls = [];
  if(fromRents === undefined || halls === undefined)
    return halls;
  halls.forEach(function(sala) { filteredHalls.push(sala);});
  fromRents.forEach(function(rent) {
    if(filteredHalls.filter(sala => { return sala.id === rent.id }).length > 0) {
      rent_start_date = new Date(rent.start_date);
      rent_end_date = new Date(rent.end_date);
      if(dateRangeOverlaps(start_date, end_date, rent_start_date, rent_end_date)) {
        filteredHalls = filteredHalls.filter(sala => { return sala.id != rent.id });
      }
    }
  });
  return filteredHalls;
}

//source: https://stackoverflow.com/questions/22784883/check-if-more-than-two-date-ranges-overlap
function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
  if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
  if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
  if (b_start <  a_start && a_end   <  b_end) return true; // a in b
  return false;
}

const DAY = (1000*60*60*24);
function calculateDays(start_date, end_date)
{
  start_date = Date.parse(start_date);
  end_date = Date.parse(end_date);
  return Math.round(((end_date - start_date)/DAY+1));
}

function URLFriendlyDate(date)
{
  return date.split('/').join('-');
}

module.exports = router;
