function Alert(flash_msg)
{
    var msg_array = flash_msg.split(',');
    var msg = msg_array.slice(1, msg_array.length).join(', ');
    switch(msg_array[0])
    {
    case "Sukces": 
        AlertSuccess(msg);
        break;
    case "Błąd":
        AlertFailure(msg);
        break;
    case "Informacja":
        AlertInfo(msg);
        break;
    default:
        break;
    }
}

function AlertSuccess(message)
{
    createNotification('Sukces', message);
}

function AlertFailure(message)
{
    createNotification('Błąd', message);
}

function AlertInfo(message)
{
    createNotification("Informacja", message);
}

function createNotification(type, message)
{
    var topElement = document.getElementById('top-menu');
    var div = document.createElement('div');
    var span = document.createElement('span');
    span.className = 'close-button';
    span.innerHTML = 'X';
    span.onclick = function() { div.parentNode.removeChild(div); };
    if(type == 'Sukces')
        div.className = 'alert-success';
    else if(type == 'Błąd')
        div.className = 'alert-failed';
    else if(type == 'Informacja')
        div.className = 'alert-info';
    header = document.createElement('h3');
    header.className = 'message-head';
    strongElement = document.createElement('strong');
    strongElement.style = 'font-size:x-large';
    strongElement.innerHTML = type;
    pElement = document.createElement('p');
    pElement.className = 'message';
    pElement.style = 'text-overflow: ellipsis; white-space: nowrap; overflow: hidden';
    pElement.innerHTML = message;
    header.appendChild(strongElement);//strong
    header.appendChild(pElement);//p
    header.appendChild(span);
    div.appendChild(header);
    topElement.after(div);
}