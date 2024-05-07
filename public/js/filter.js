function openCard(cardSet) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/postData', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log(xhr.responseText);
            document.write(xhr.responseText);
        } else {
            console.error('Request failed: ', xhr.statusText);
        }
    };

    xhr.send(JSON.stringify({ data: cardSet }));
}