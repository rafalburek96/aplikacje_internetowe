const MIN_DATE = '1000/01/01';
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
            maxDate: $i[0].value,
        });
      }
});



function validateEditRentForm()
{
    return true;
}