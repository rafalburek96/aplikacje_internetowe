function checkStringLength(string, min, max, array_of_errors, field_name)
{
    if(string.length < min)
        array_of_errors.push("Podaj " + field_name);
    else if(string.length > max)
        array_of_errors.push(field_name + " przekracza maksymalną długość (" + max + ")");
}

function validateForm(email, password, repeated_password, first_name, last_name)
{
    var err = [];
    checkStringLength(email.value, 1, 29, err, "Email");
    checkStringLength(password.value, 1, 29, err, "Hasło");
    if(password.value != repeated_password.value)
        err.push("Hasła nie są identyczne");
    checkStringLength(first_name.value, 0, 29, err, "Imię");
    checkStringLength(last_name.value, 0, 29, err, "Nazwisko");
    
    console.log(err);
    if(err.length > 0)
    {
        Alert("Błąd," + err.join(","));
        return false;
    }
    return true;
}