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
            minDate: $i[0].value
        });
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
            maxDate: $i[0].value
        });
      }
});

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('/');
}