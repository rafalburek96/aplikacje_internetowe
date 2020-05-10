const MIN_DATE = formatDate(new Date());
const MAX_DATE = '9999/12/31';

$('#datetimepicker-start').datetimepicker({
    timepicker:false,
    mask:true,
    format:'Y/m/d',
    formatDate:'Y/m/d',
    minDate: MIN_DATE,
    onSelectDate:function(ct,$i){
        $('#datetimepicker-end').datetimepicker({
            minDate: $i[0].value,
            maxDate: findDate($i[0].value, DIRECTION_ASCENDING)
        });
        updateTotalPrice();
      }
});

$('#datetimepicker-end').datetimepicker({
    timepicker:false,
    mask:true,
    format:'Y/m/d',
    formatDate:'Y/m/d',
    minDate: MIN_DATE,
    onSelectDate:function(ct,$i){
        $('#datetimepicker-start').datetimepicker({
            maxDate: $i[0].value,
            minDate: findDate($i[0].value, DIRECTION_DESCENDING)
        });
        updateTotalPrice();
      }
});


DATES_TO_DISABLE = [];
function DisableDates(start_date, end_date)
{
    DATES_TO_DISABLE = DATES_TO_DISABLE.concat(getEachDay(new Date(start_date), new Date(end_date)));
}

//source: https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function getEachDay(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(formatDate(new Date (currentDate)));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
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

function ApplyDisabledDates()
{
    $('#datetimepicker-start').datetimepicker({
        disabledDates: DATES_TO_DISABLE
    });
    $('#datetimepicker-end').datetimepicker({
        disabledDates: DATES_TO_DISABLE
    });
}

function findDate(currentDate, direction)
{
    date = getNearestDisabledDate(currentDate, direction);
    if(date !== undefined)
        return formatDate(date);
    else if(direction == DIRECTION_ASCENDING)
        return MAX_DATE;
    else
        return MIN_DATE;
        
}

const DAY = (1000*60*60*24);
const DIRECTION_ASCENDING = "ASC";
const DIRECTION_DESCENDING = "DESC";
function getNearestDisabledDate(currentDate, direction)
{
    var distance;
    var nearestDate;
    currentDate = new Date(currentDate.split('/').join('-'));
    if(direction == DIRECTION_ASCENDING)
    {
        DATES_TO_DISABLE.forEach(function(date){
            tmpDate = new Date(date.split('/').join('-'));
            daysDifference = (tmpDate - currentDate)/DAY;
            if(daysDifference > 0) {
                if(distance === undefined || daysDifference < distance) {
                    distance = daysDifference;
                    nearestDate = tmpDate;
                }
            }
        });
    } else if(direction == DIRECTION_DESCENDING) {
        DATES_TO_DISABLE.forEach(function(date){
            tmpDate = new Date(date.split('/').join('-'));
            daysDifference = (currentDate - tmpDate)/DAY;
            if(daysDifference > 0) {
                if(distance === undefined || daysDifference < distance) {
                    distance = daysDifference;
                    nearestDate = tmpDate;
                }
            }
        });
    } else {
        console.log("[getNearestDisabledDate] Failed to detect direction for: '" + direction + "'");
        return undefined;
    }
    return nearestDate;
}

function validateDates(start_date, end_date)
{
    if(!areValidDates(start_date.value, end_date.value))
        return false;
    return confirm('Czy napewno chcesz dokonać rezerwacji?');
}

function areValidDates(start_date, end_date, alert_error = true)
{
    var date_start = Date.parse(start_date);
    var date_end = Date.parse(end_date);
    if(isNaN(date_start)) {
        if(alert_error)
            AlertFailure("Data początkowa jest nieprawidłowa");
        return false;
    }
    if(isNaN(date_end)) {
        if(alert_error)
            AlertFailure("Data końcowa jest nieprawidłowa");
        return false;
    }
    return true;
}

function clearDatePickers()
{
    $('#datetimepicker-start').datetimepicker('reset');
    $('#datetimepicker-start').datetimepicker({
        minDate: MIN_DATE,
        maxDate: MAX_DATE
    });
    $('#datetimepicker-end').datetimepicker('reset');
    $('#datetimepicker-end').datetimepicker({
        minDate: MIN_DATE,
        maxDate: MAX_DATE
    });
    document.getElementById('total_price').innerHTML = 0;
}

function updateTotalPrice()
{
    if(!areValidDates($('#datetimepicker-start')[0].value, $('#datetimepicker-end')[0].value, false))
    {
        document.getElementById('total_price').innerHTML = 0;
        return;
    }
    var date_start = Date.parse($('#datetimepicker-start')[0].value);
    var date_end = Date.parse($('#datetimepicker-end')[0].value);
    document.getElementById('total_price').innerHTML = Math.round(((date_end - date_start)/DAY+1)) * $('#hall_price_per_day')[0].innerHTML;
}