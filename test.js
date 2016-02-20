

var elem = document.getElementById("test");

$/*.ajax({
        url: "https://api.myjson.com/bins",
        type: "POST",
        data: casestudy,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })*/.ajax({
        url: "https://api.myjson.com/bins/1m0xt",
        type: "GET",
        //data: "4y15l",
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).done(function(data, textStatus, jqXHR) {
    	var item = data;
    	elem.textContent= item[2].city;
    });