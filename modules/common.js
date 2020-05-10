var express = require('express');
var router = express.Router();

const FLASH_INFO = "Informacja";
const FLASH_ERROR = "Błąd";
const FLASH_SUCCESS = "Sukces";

function authenticatedAdminOnlyAccess(req, res, next) {
  if(req.isAuthenticated()){
    if(req.user.admin_priv == 0) {
      req.flash("FLASH_MSG", [FLASH_ERROR, "Przepraszamy, nie masz dostępu do tego panelu"]);
      res.redirect("/");
    } else 
      next();
  } else{
    req.flash("FLASH_MSG", [FLASH_INFO, "Dostęp do tego panelu jest możliwy dopiero po zalogowaniu"]);
    res.redirect("/login");
  }
}

function authenticatedOnlyAccess(req,res,next){
  if(req.isAuthenticated()){
    next();
  } else{
    req.flash("FLASH_MSG", [FLASH_INFO, "Dostęp do tego panelu jest możliwy dopiero po zalogowaniu"]);
    res.redirect("/login");
  }
}

function notAutenticatedOnlyAccess(req,res,next){
  if(!req.isAuthenticated()){
    next();
  } else{
    req.flash("FLASH_MSG", [FLASH_INFO, "Jesteś już zalogowany"]);
    res.redirect("/");
  }
}

function postCheckStringLength(string, minLength, maxLength, fieldName, failed_res_callback, req, res) {
  if(string.length < minLength) {
    req.flash("FLASH_MSG", [FLASH_ERROR, "Pole " + fieldName + " jest za krótkie"]);
    failed_res_callback(req, res);
    return 1;
  } else if(string.length > maxLength) {
    req.flash("FLASH_MSG", [FLASH_ERROR, "Pole " +  fieldName + " jest za długie"]);
    failed_res_callback(req, res);
    return 1;
  }
  return 0;
}

function postCheckNumberRange(number, min, max, fieldName, failed_res_callback, req, res) {
  if(number < min) {
    req.flash("FLASH_MSG", [FLASH_ERROR, "Wartość pola " + fieldName + " jest za mała"]);
    failed_res_callback(req, res);
    return 1;
  } else if(number > max) {
    req.flash("FLASH_MSG", [FLASH_ERROR, "Wartość pola " +  fieldName + " jest za duża"]);
    failed_res_callback(req, res);
    return 1;
  }
  return 0;
}

function postCheckIfNull(string, fieldName, failed_res_callback, req, res)
{
  if(string == 'NULL')
  {
    req.flash("FLASH_MSG", [FLASH_ERROR, "Pole " + fieldName + " nie zostało wypełnione, a jest wymagane!"]);
    failed_res_callback(req, res);
    return 1;
  }
  return 0;
}

function extractStringFromReqBodySafeForSQL(req, toExtract)
{
  if(req.body)
    if(typeof(req.body[toExtract]) !== 'undefined')
      if(req.body[toExtract] != '')
        return "'" + req.body[toExtract].replace("'", "''") + "'";
        else
        return 'NULL';
  return undefined;
}

function extractNumberFromReqBodySafeForSQL(req, toExtract)
{
  if(req.body)
    if(typeof(req.body[toExtract]) !== 'undefined')
      if(req.body[toExtract] != '')
        return req.body[toExtract].replace("'", "''");
      else
        return 'NULL';
  return undefined;
}

function isNull(string)
{
  if(string == 'NULL')
    return true;
  return false;
}

function isNumber(number)
{
  if(Number.isNumber(number))
    return true;
  return false;
}

function isDate(stringDate)
{
  if(isNaN(Date.parse(stringDate)))
    return false;
  return true;
}

function formatMySQLDateYYYYMMDD(date_var)//%Y-%m-%d
{
  return "DATE_FORMAT(" + date_var + ",GET_FORMAT(DATE,'JIS')) as " + date_var;
}

//source: https://stackoverflow.com/questions/23593052/format-javascript-date-to-yyyy-mm-dd
function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('/');
}

const DAY = (1000*60*60*24);
function getTotalDays(start_date, end_date)
{
  start_date = Date.parse(start_date.split('/').join('-'));
  end_date = Date.parse(end_date.split('/').join('-'));
  if(isNaN(start_date) || isNaN(end_date))
  {
    return undefined;
  }
  return Math.round((end_date - start_date)/DAY) + 1;
}

function addLeadingZeroes(string)
{
  if(string === undefined)
    return string;
  if(string.length == 1)
    return "0" + string;
  else
    return string;
}

function tinyintToBoolean(query, column)
{
  if(query === undefined || !Array.isArray(query))
    return;
  query.forEach(function(q) {
    if(q[column] === 1)
      q[column] = 'TAK';
    else if(q[column] === 0)
      q[column] = 'NIE';
  });
}

function getNotConfirmedRents(allRents)
{
  notConfirmed = [];
  if(allRents === undefined || !Array.isArray(allRents))
    return undefined;
  
  allRents.forEach(function(rent) {
    if(rent['confirmed'] !== undefined && (rent['confirmed'] === "NIE" || rent['confirmed'] == 0))
    {
      notConfirmed.push(rent);
    }
  });
  return notConfirmed;
}

function addYearMonthDayToQueryResults(allResults)
{
  if(allResults === undefined || !Array.isArray(allResults))
    return undefined;
    allResults.forEach(function(result) {
      if(result !== undefined && result['ostatniarez'] !== undefined) {
        date = result['ostatniarez'];
        if(date.length == 4) {
          result.year = date;
        } else {
          var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
          if (month.length < 2) month = '0' + month;
          if (day.length < 2) day = '0' + day;
          result.year = year;
          result.month = month;
          result.day = day;
        }
      }
    });
}

function convertCheckboxToValueForSQL(req, toConvert)
{
  if(req !== undefined && req.body[toConvert] === 'on')
    return 1;
  return 0;
}


module.exports = {
  router: router, FLASH_INFO: FLASH_INFO, FLASH_ERROR: FLASH_ERROR, FLASH_SUCCESS: FLASH_SUCCESS, postCheckStringLength: postCheckStringLength,
  extractStringFromReqBodySafeForSQL: extractStringFromReqBodySafeForSQL, isNull: isNull, postCheckIfNull: postCheckIfNull, postCheckNumberRange: postCheckNumberRange,
  extractNumberFromReqBodySafeForSQL: extractNumberFromReqBodySafeForSQL, isNumber: isNumber, formatMySQLDateYYYYMMDD: formatMySQLDateYYYYMMDD, formatDate: formatDate,
  getTotalDays: getTotalDays, addLeadingZeroes: addLeadingZeroes, tinyintToBoolean: tinyintToBoolean, getNotConfirmedRents: getNotConfirmedRents,
  addYearMonthDayToQueryResults: addYearMonthDayToQueryResults, isDate: isDate, convertCheckboxToValueForSQL: convertCheckboxToValueForSQL,
  notAutenticatedOnlyAccess: notAutenticatedOnlyAccess, authenticatedOnlyAccess: authenticatedOnlyAccess, authenticatedAdminOnlyAccess: authenticatedAdminOnlyAccess 
};
