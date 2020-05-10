var express = require('express');
var router = express.Router();
var commonModule = require('../modules/common');

const FLASH_INFO = commonModule.FLASH_INFO;
const FLASH_ERROR = commonModule.FLASH_ERROR;
const FLASH_SUCCESS = commonModule.FLASH_SUCCESS;
var postCheckStringLength = commonModule.postCheckStringLength;
var postCheckNumberRange = commonModule.postCheckNumberRange;
var postCheckIfNull = commonModule.postCheckIfNull;
var extractStringDataFromBody = commonModule.extractStringFromReqBodySafeForSQL;
var extractNumberDataFromBody = commonModule.extractNumberFromReqBodySafeForSQL;
var isNull = commonModule.isNull;
var formatMySQLDateYYYYMMDD = commonModule.formatMySQLDateYYYYMMDD;
var addLeadingZeroes = commonModule.addLeadingZeroes;

const MCTITLE = 'Zarządzanie salami';
const APRENDER = 'admin_panel';

function renderAdminPanel(req, res)
{
    dbconn.query("select id, rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale", 
        function(err, halls) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Wystąpił błąd podczas ładowania wszystkich sal, strona może być niekompletna. Sprawdź konsolę serwera"]);
        }
        dbconn.query("select rezID, salaID, userID, " + formatMySQLDateYYYYMMDD('start_date') + "," + formatMySQLDateYYYYMMDD('end_date') + 
            ", confirmed, Users.email, Sale.rodzaj, Sale.numersali, Sale.cena " + 
            "from Rezerwacja inner join Users on Users.id = Rezerwacja.userID inner join Sale on Sale.id = Rezerwacja.salaID " +
            "order by Rezerwacja.start_date, Users.id", 
            function(err, rent_history) {
            if(err) {
                console.log(err);
                req.flash("FLASH_MSG", [FLASH_ERROR, "Wystąpił błąd podczas ładowania historii rezerwacji, strona może być niekompletna. Sprawdź konsolę serwera"]);
            }
            res.render(APRENDER, { title: MCTITLE, user: req.user, flash_msg: req.flash("FLASH_MSG"), halls: halls, rent_history: rent_history, rents_to_confirm: commonModule.getNotConfirmedRents(rent_history) });
        });
    });
}

function renderBookedHall(req, res)
{
    dbconn.query('select Sale.cena, rezID, Sale.rodzaj, Sale.numersali, ' +
        formatMySQLDateYYYYMMDD('start_date') + ',' + formatMySQLDateYYYYMMDD('end_date') + ", confirmed " + 
        ' from Rezerwacja ' +
        ' inner join Sale on Sale.id = Rezerwacja.salaID' +
        ' where userID = ' + req.user.id +
        ' order by salaID, start_date', 
        function(err, rents) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się zarezerwować sali, sprawdź dane i spróbuj ponownie"]);
        }
        commonModule.tinyintToBoolean(rents, 'confirmed');
        res.render('bookedHall', { title: 'Zarezerwowana sala', user: req.user, flash_msg: req.flash("FLASH_MSG"), rents: rents});
    });
}

router.get('/bookedHall', commonModule.authenticatedOnlyAccess, function(req, res, next) {
    renderBookedHall(req, res);
});

router.get('/admin_panel', commonModule.authenticatedAdminOnlyAccess, function(req, res, next) {
    renderAdminPanel(req, res);
});  

router.post('/add/sala', commonModule.authenticatedAdminOnlyAccess, function(req, res, next) {
    var rodzaj = extractStringDataFromBody(req, 'rodzaj');
    var numersali = extractStringDataFromBody(req, 'numersali');
    var liczbamiejsc = extractNumberDataFromBody(req, 'liczbamiejsc');
    var year = extractNumberDataFromBody(req, 'year');
    var month = extractNumberDataFromBody(req, 'month');
    var day = extractNumberDataFromBody(req, 'day');
    var cena =  extractNumberDataFromBody(req, 'cena');

    if(postCheckIfNull(rodzaj, 'rodzaj', renderAdminPanel, req, res) || postCheckIfNull(numersali, 'numer sali', renderAdminPanel, req, res) ||
        postCheckIfNull(liczbamiejsc, 'liczba miejsc', renderAdminPanel, req, res) || postCheckIfNull(year, 'rok', renderAdminPanel, req, res) || 
        postCheckIfNull(cena, 'cena', renderAdminPanel, req, res))
    {
        return;
    }
    if(postCheckStringLength(rodzaj, 1, 30, 'rodzaj', renderAdminPanel, req, res) || postCheckStringLength(numersali, 1, 30, 'numer sali', renderAdminPanel, req, res) ||
        postCheckNumberRange(liczbamiejsc, 0, 10e9, 'liczba miejsc', renderAdminPanel, req, res) || postCheckNumberRange(year, 1000, 9999, 'rok', renderAdminPanel, req, res ||
        postCheckNumberRange(cena, 0, 10e9, 'cena', renderAdminPanel, req, res) ))
    {
        return;
    }
    dateString = "";
    month = addLeadingZeroes(month);
    day = addLeadingZeroes(day);
    if(isNull(month) || isNull(day)) {
        dateString = "'" + year + "'";
    } else {
        dateString = "'" + year + '-' + month + '-' + day + "'";
    }
    
    
    dbconn.query('insert into Sale (rodzaj, numersali, liczbamiejsc, ostatniarez, cena) values (' + rodzaj + "," + numersali + "," + liczbamiejsc + "," + dateString + "," + cena + ")", 
        function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd po stronie serwera. Sprawdź logi"]);
            return renderAdminPanel(req, res);
        }
        req.flash("FLASH_MSG", [FLASH_SUCCESS, "Sala została dodana"]);
        return renderAdminPanel(req, res);
    });
});

router.get('/remove/sala/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res, next)
{
    var id = req.params.id.replace("'", "''");
    dbconn.query('delete from Sale where id=' + id, function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się usunąć sali (id: " + id + "), więcej informacji w konsoli serwera"]);
            return renderAdminPanel(req, res);
        }
        req.flash("FLASH_MSG", [FLASH_SUCCESS, "Sala (id: " + id + ") została usunięta pomyślnie"]);
        return renderAdminPanel(req, res);
    });
});

router.get('/sala/:id', commonModule.authenticatedOnlyAccess, function(req, res, next)
{
    var id = req.params.id.replace("'", "''");
    dbconn.query('select id, rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale where id=' + id, function(err, hall_details) {
        if(err || !hall_details.length) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji o tej sali"]);
            return res.redirect('/');
        }
        dbconn.query('select ' + formatMySQLDateYYYYMMDD('start_date') + ',' + formatMySQLDateYYYYMMDD('end_date') + ', confirmed from Rezerwacja' +
            ' where salaID=' + id + " and end_date >= '" + commonModule.formatDate(new Date()) + "'" +
            ' order by start_date', function(err, rows) {
            if(err) {
                console.log(err);
                req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji o rezerwacjach sali, spróbuj ponownie później"]);
                return res.redirect('/');
            }
            commonModule.tinyintToBoolean(rows, 'confirmed');
            return res.render('rent_hall_details', { title: 'Zarezerwuj sale', user: req.user, flash_msg: req.flash("FLASH_MSG"), sala: hall_details[0], rents: rows });
        });
    });
});

router.get('/sala/:id/start/:start_date/end/:end_date', commonModule.authenticatedOnlyAccess, function(req, res, next)
{
    var id = req.params.id.replace("'", "''");
    var start_date = req.params.start_date;
    var end_date = req.params.end_date;
    dbconn.query('select id, rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale where id=' + id, function(err, hall_details) {
        if(err || !hall_details.length) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji o tej sali"]);
            return res.redirect('/');
        }
        dbconn.query('select ' + formatMySQLDateYYYYMMDD('start_date') + ',' + formatMySQLDateYYYYMMDD('end_date') + ', confirmed from Rezerwacja' +
            ' where salaID=' + id + " and end_date >= '" + commonModule.formatDate(new Date()) + "'" +
            ' order by start_date', function(err, rows) {
            if(err) {
                console.log(err);
                req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji o rezerwacjach sal, spróbuj ponownie później"]);
                return res.redirect('/');
            }
            commonModule.tinyintToBoolean(rows, 'confirmed');
            return res.render('rent_hall_details', { title: 'Zareezrwuj sale', user: req.user, flash_msg: req.flash("FLASH_MSG"), sala: hall_details[0], 
                                                    rents: rows, start_date: jQueryFriendlyDate(start_date), end_date: jQueryFriendlyDate(end_date) });
        });
    });
});

router.post('/rent/sala/:id', commonModule.authenticatedOnlyAccess, function(req, res, next) {
    var start_date = commonModule.extractStringFromReqBodySafeForSQL(req, 'start_date');
    var end_date = commonModule.extractStringFromReqBodySafeForSQL(req, 'end_date');
    var user_id = req.user.id;
    var sala_id = req.params.id.replace("'", "''");
    dbconn.query('select cena from Sale where id=' + sala_id, function(err, hall_details) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, błąd serwera, nie udało się zarezerwować sali"]);
            return res.redirect('/');
        }
        if(!hall_details.length) {
            console.log("hall_details.length is " + hall_details.length  + ", failed to retrieve sala data for id " + sala_id);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, błąd serwera, nie udało się zarezerwować sali"]);
            return res.redirect('/');
        }
        var total_days = commonModule.getTotalDays(start_date, end_date);
        if(total_days === undefined)
        {
            console.log("Failed to calculate all days from range " + start_date + " to " + end_date);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, błąd serwera, nie udało się zarezerwować sali"]);
            return res.redirect('/');
        }
        var total_price = total_days*(hall_details[0].cena);
        if(isNaN(total_price)) {
            console.log("ERROR: NaN => Failed to calculate multiply days (" + total_days + ") with cena (" + hall_details[0].cena + ") for sala with id = " + sala_id + " with result length of " + hall_details.length);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, błąd serwera, nie udało się zarezerwować sali"]);
            return res.redirect('/');
        }
        dbconn.query('insert into Rezerwacja (salaID, userID, start_date, end_date, total_price, confirmed) values (' + sala_id + ',' + user_id +',' + start_date + "," + end_date + "," + total_price + ", false)", 
            function(err, rows) {
            if(err) {
                console.log(err);
                req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się zarezerwować sali, sprawdź dane i spróbuj ponownie"]);
                return res.redirect('/');
            }
            req.flash("FLASH_MSG", [FLASH_SUCCESS, "Pomyślnie złożono prośbę o zarezerwowanie sali"]);
            renderBookedHall(req, res);
        }); 
    });
});

router.get('/admin/rent/confirm/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res) {
    var id = req.params.id.replace("'", "''");
    dbconn.query('update Rezerwacja set confirmed = 1 where rezID = ' + id, function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się potwierdzić rezerwacji, więcej informacji w logach serwera"]);
            return res.redirect('/admin_panel');
        }
        req.flash("FLASH_MSG", [FLASH_SUCCESS, "Potwierdzono rezerwacje " + id]);
        return res.redirect('/admin_panel');
    });
});

router.get('/edit/sala/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res) {
    var id = req.params.id.replace("'", "''");
    dbconn.query('select id, rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale where id=' + id, 
        function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji o sali, więcej informacji w logach serwera"]);
            return res.redirect('/admin_panel');
        }
        if(!rows.length) {
            console.log("No rows returned for query 'select rodzaj, numersali, liczbamiejsc, ostatniarez, cena from Sale where id=" + id + "'");
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, sala o id '" + id + "' nie istnieje w bazie danych"]);
            return res.redirect('/admin_panel');
        }
        commonModule.addYearMonthDayToQueryResults(rows);
        res.render('hall_edit', { title: 'Edycja sali', user: req.user, flash_msg: req.flash("FLASH_MSG"), hall_details: rows[0] });
    });
});

router.post('/edit/sala/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res) {
    var id = req.params.id.replace("'", "''");
    var rodzaj = extractStringDataFromBody(req, 'rodzaj');
    var numersali = extractStringDataFromBody(req, 'numersali');
    var liczbamiejsc = extractNumberDataFromBody(req, 'liczbamiejsc');
    var year = extractNumberDataFromBody(req, 'year');
    var month = extractNumberDataFromBody(req, 'month');
    var day = extractNumberDataFromBody(req, 'day');
    var cena =  extractNumberDataFromBody(req, 'cena');

    function callback(req, res) { res.redirect('/edit/sala/' + id); }
    if(postCheckIfNull(rodzaj, 'rodzaj', callback, req, res) || postCheckIfNull(numersali, 'numer sali', callback, req, res) ||
        postCheckIfNull(liczbamiejsc, 'liczba miejsc', callback, req, res) || postCheckIfNull(year, 'rok', callback, req, res) || 
        postCheckIfNull(cena, 'cena', callback, req, res))
    {
        return;
    }
    if(postCheckStringLength(rodzaj, 1, 30, 'rodzaj', callback, req, res) || postCheckStringLength(numersali, 1, 30, 'numer sali', callback, req, res) ||
        postCheckNumberRange(liczbamiejsc, 0, 10e9, 'liczba miejsc', callback, req, res) || postCheckNumberRange(year, 1000, 9999, 'rok', callback, req, res ||
        postCheckNumberRange(cena, 0, 10e9, 'cena', callback, req, res) ))
    {
        return;
    }
    dateString = "";
    month = addLeadingZeroes(month);
    day = addLeadingZeroes(day);
    if(isNull(month) || isNull(day)) {
        dateString = "'" + year + "'";
    } else {
        dateString = "'" + year + '-' + month + '-' + day + "'";
    }

    dbconn.query("update halls set rodzaj=" + rodzaj + ", numersali=" + numersali + ", liczbamiejsc=" + liczbamiejsc + 
        ", ostatniarez=" + dateString +  ", cena=" + cena + " where id=" + id,
        function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd po stronie serwera. Sprawdź logi"]);
            return renderAdminPanel(req, res);
        }
        req.flash("FLASH_MSG", [FLASH_SUCCESS, "Sala została zmieniona"]);
        return renderAdminPanel(req, res);
    });
});

router.get('/admin/rent/edit/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res) {
    var rent_id = req.params.id.replace("'", "''");
    dbconn.query("select rezID, salaID, userID, " + formatMySQLDateYYYYMMDD('start_date') + "," + formatMySQLDateYYYYMMDD('end_date') + 
        ", total_price, confirmed from Rezerwacja where rezID = " + rent_id, function(err, rents) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji dla rezerwacji o id " + rent_id ]);
            return renderAdminPanel(req, res);
        }
        if(!rents.length) {
            req.flash("FLASH_MSG", [FLASH_ERROR, "Rezerwacja o id " + rent_id + " nie istnieje" ]);
            return renderAdminPanel(req, res);
        }
        rents[0].start_date = jQueryFriendlyDate(rents[0].start_date);
        rents[0].end_date = jQueryFriendlyDate(rents[0].end_date);
        return res.render('admin_rent_edit', { title: 'Edycja rezerwacji', user: req.user, flash_msg: req.flash("FLASH_MSG"), rent: rents[0] });
    });
});

router.post('/admin/rent/edit/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res) {
    var rent_id = req.params.id.replace("'", "''");
    var sala_id = commonModule.extractNumberFromReqBodySafeForSQL(req, 'salaID');
    var user_id = commonModule.extractNumberFromReqBodySafeForSQL(req, 'userID');
    var start_date = commonModule.extractStringFromReqBodySafeForSQL(req, 'start_date');
    var end_date = commonModule.extractStringFromReqBodySafeForSQL(req, 'end_date');
    var total_price = commonModule.extractNumberFromReqBodySafeForSQL(req, 'total_price');
    var confirmed = commonModule.convertCheckboxToValueForSQL(req, 'confirmed');
    
    dbconn.query('update Rezerwacja set salaID=' + sala_id + ", userID=" + user_id + ", start_date=" + start_date + ", end_date=" + end_date + 
        ", total_price=" + total_price + ", confirmed=" + confirmed + " where rezID=" + rent_id, function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd przy zatwierdzaniu zmianych w bazie, więcej informacji w logach serwera" ]);
            return renderAdminPanel(req, res);
        }
        req.flash("FLASH_MSG", [FLASH_SUCCESS, "Rezerwacja została zmieniona pomyślnie"]);
        return renderAdminPanel(req, res);
    });
});

router.get('/admin/rent/remove/:id', commonModule.authenticatedAdminOnlyAccess, function(req, res) {
    var rent_id = req.params.id.replace("'", "''");
    
    dbconn.query('delete from rents where rezID=' + rent_id, function(err, rows) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd przy usuwaniu rezerwacji w bazie, więcej informacji w logach serwera" ]);
            return renderAdminPanel(req, res);
        }
        req.flash("FLASH_MSG", [FLASH_SUCCESS, "Rezerwacja została usunięta pomyślnie"]);
        return renderAdminPanel(req, res);
    });
});

router.get('/rent/edit/:id', commonModule.authenticatedOnlyAccess, function(req, res, next) {
    var rent_id = req.params.id.replace("'", "''");
    dbconn.query("select rezID, salaID, userID, " + formatMySQLDateYYYYMMDD('start_date') + "," + formatMySQLDateYYYYMMDD('end_date') + 
        ", total_price, confirmed from Rezerwacja where rezID = " + rent_id, function(err, rents) {
        if(err) {
            console.log(err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie udało się pobrać informacji dla rezerwacji o id " + rent_id ]);
            return renderAdminPanel(req, res);
        }
        if(!rents.length) {
            req.flash("FLASH_MSG", [FLASH_ERROR, "Rezerwacja o id " + rent_id + " nie istnieje" ]);
            return renderAdminPanel(req, res);
        }
        if(rents[0].userID != req.user.id) {
            console.log("User " + req.user.id + " is trying to change rent with id " + rent_id + " that belongs to user with id " + users[0].userID);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Niedozwolona operacja, próbujesz zmienić rezerwację, która nie należy do Ciebie" ]);
            return renderBookedHall(req, res);
        }
        rents[0].start_date = jQueryFriendlyDate(rents[0].start_date);
        rents[0].end_date = jQueryFriendlyDate(rents[0].end_date);
        return res.render('rent_edit', { title: 'Edycja rezerwacji', user: req.user, flash_msg: req.flash("FLASH_MSG"), rent: rents[0] });
    });
});

router.post('/rent/edit/:id', commonModule.authenticatedOnlyAccess, function(req, res) {
    var rent_id = req.params.id.replace("'", "''");
    var start_date = commonModule.extractStringFromReqBodySafeForSQL(req, 'start_date');
    var end_date = commonModule.extractStringFromReqBodySafeForSQL(req, 'end_date');
    
    //check if editing rent is actually user's rent
    dbconn.query('select userID from Rezerwacja where rezID=' + rent_id, function(err, users) {
        if(err || !users.length) {
            console.log("rent/edit/" + rent_id + " | err+!users.length: | " + err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd przy zatwierdzaniu zmian" ]);
            return renderBookedHall(req, res);
        }
        if(users[0].userID != req.user.id) {
            console.log("User " + req.user.id + " is trying to change rent with id " + rent_id + " that belongs to user with id " + users[0].userID);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Niedozwolona operacja, próbujesz zmienić rezerwację, która nie należy do Ciebie" ]);
            return renderBookedHall(req, res);
        }
        dbconn.query('update Rezerwacja set start_date=' + start_date + ", end_date=" + end_date + 
            ", confirmed=0 where rezID=" + rent_id, function(err, rows) {
            if(err) {
                console.log(err);
                req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd przy zatwierdzaniu zmian" ]);
                return renderBookedHall(req, res);
            }
            req.flash("FLASH_MSG", [FLASH_SUCCESS, "Złożono prośbę o zmianę dat rezerwacji"]);
            return renderBookedHall(req, res);
        });
    });
});

router.get('/rent/cancel/:id', commonModule.authenticatedOnlyAccess, function(req, res) {
    var rent_id = req.params.id.replace("'", "''");
    
    dbconn.query('select userID from Rezerwacja where rezID=' + rent_id, function(err, users) {
        if(err || !users.length) {
            console.log("rent/edit/" + rent_id + " | err+!users.length: | " + err);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd przy zatwierdzaniu zmian" ]);
            return renderBookedHall(req, res);
        }
        if(users[0].userID != req.user.id) {
            console.log("User " + req.user.id + " is trying to change rent with id " + rent_id + " that belongs to user with id " + users[0].userID);
            req.flash("FLASH_MSG", [FLASH_ERROR, "Niedozwolona operacja, próbujesz zmienić rezerwację, która nie należy do Ciebie" ]);
            return renderBookedHall(req, res);
        }
        dbconn.query('delete from rents where rezID=' + rent_id, function(err, rows) {
            if(err) {
                console.log(err);
                req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, wystąpił błąd przy anulowaniu rezerwacji" ]);
                return renderAdminPanel(req, res);
            }
            req.flash("FLASH_MSG", [FLASH_SUCCESS, "Rezerwacja została anulowana"]);
            return renderAdminPanel(req, res);
        });
    });
});

function jQueryFriendlyDate(date)
{
    return date.split('-').join('/');
}

module.exports = router;