function nextCard() {
    const xhr = new XMLHttpRequest();
    // var val = document.getElementById("slider").value;
    // console.log('val: ', val);
    xhr.open('POST', '/next_card', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log(xhr.responseText);
            console.log('why hello there');
            const responseData = JSON.parse(xhr.responseText);
            document.getElementById("front").innerHTML = responseData.front;
            document.getElementById("back").innerHTML = responseData.back;
            // document.getElementById("slider").innerHTML = responseData.niveau;
        } else {
            console.error('Request failed: ', xhr.statusText);
        }
    };
    xhr.send(JSON.stringify({ data: val }));
}