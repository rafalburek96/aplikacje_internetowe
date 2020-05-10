function openTabLink(evt, name)
{
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++)
    {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++)
    {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

function checkStringLength(string, min, max, array_of_errors, field_name)
{
    if(string.length < min)
        array_of_errors.push("Podaj " + field_name);
    else if(string.length > max)
        array_of_errors.push(field_name + " przekracza maksymalną długość (" + max + ")");
}

function validateAddHallForm(rodzaj, numersali, liczbamiejsc, year, month, day, price)
{
    var err = [];
    checkStringLength(rodzaj.value, 1, 30, err, "Rodzaj sali");
    checkStringLength(numersali.value, 1, 30, err, "Numer sali");
    checkStringLength(liczbamiejsc.value, 1, 30, err, "Liczba miejsc");
    checkStringLength(year.value, 1, 30, err, "Ocena użytkowników");
    checkStringLength(price.value, 1, 30, err, "Cena za dzień");
    if(err.length > 0)
    {
        Alert("Błąd," + err.join(","));
        return false;
    }
    return true;
}
