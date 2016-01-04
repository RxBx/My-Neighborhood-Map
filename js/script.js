var modelMarkerInfo = [{
    street: "123 Main St"
}, {
    street: "1738 Hyperion Ave"
}, {
    street: "2600 beverly blvd"
}];


var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json"; //to access geocode API
// Google Geocode API key - different from Map key
var apiKeyGeocode = "AIzaSyBkBk3maFmugZtnSWKTkFMK2CXIe0c_20k";
//var street = "";

var modelLocale = {
city: "Longeles",
state: 'CA',
country: 'USA'
};

var lat; // latitude value
var lng; // longitude value
var myLatLng; // data object for lat & long
var map; // google map object
var infoWindow; // marker

var initMap = function() {
    //Address String for CITY query
    var addressStringCity = modelLocale.city + ",+" + modelLocale.state;
    // Data for City Geocode submission
    var geocodeDataCity = {
        address: addressStringCity,
        key: apiKeyGeocode
    };

    $.getJSON(geocodeURL, geocodeDataCity, function(data) {
        console.log("worked"); // perf check
        updateLatLng(data);
        makeMap(); // Make map based on CITY lat & lng
        makeAllMarkers(modelMarkerInfo);
    });
};

//Basic Google Map creation baed on lat & lng
var makeMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 13
    });
};

 var makeAllMarkers = function (markerArray) {
    console.log ("makeAllMarkers");
    for (var i = 0; i <markerArray.length; i++) {
        makeMarker (markerArray[i]);
    }
 }
//creates marker on map based on geocode lookup of address
var makeMarker = function(markeObject) {
    console.log("makeMarker");

    street = markeObject.street
    var addressArray = street.split(" ");//geting rid of white spaces
    var streetAddressQueriable = addressArray[0]; //begin piece of API URL
    for (var i = 1; i < addressArray.length; i++) {
        streetAddressQueriable += "+" + addressArray[i]; //reconsituting for API URL
    }
    var addressStringAddress = streetAddressQueriable + ",+" + modelLocale.city + ",+" + modelLocale.state;
    var geocodeDataAddress = {
        address: addressStringAddress,
        key: apiKeyGeocode
    };
    $.getJSON(geocodeURL, geocodeDataAddress, function(data) {
        console.log("makeMarker getJSON worked"); //perf check
        updateLatLng(data);
        setMarker(); //put the marker on the map using geocode lat lng
    });
    //alert("makeMarker complete");
};

//places the marker on map after successful geocode lookup of address
var setMarker = function() {
    console.log("here's setMarker latlng"); // perf check
    console.log(myLatLng); // perf check
    console.log("This is street in setMarker");
    console.log(street);
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: street // shows on cursor hover
    });
    // Google Map "infoWindow" creation
    infoWindow = new google.maps.InfoWindow({
        content: street + " pop up!" // will show when used in combo w click event listener
    });

    //Google Map click event on marker reveals infoWindo
    google.maps.event.addListener(marker, 'click', function() {
        //"open" info window on click
        infoWindow.open(map, marker);
    });
};

//Gen use function for parsing lat & long data from geocode look up
var updateLatLng = function(data) {
    lat = Number(data.results[0].geometry.location.lat);
    lng = Number(data.results[0].geometry.location.lng);
    console.log("updateLatLng " + lat); //perf check
    console.log(lng); //perf check
    //update the position data object
    myLatLng = {
        lat: lat,
        lng: lng
    };
};

initMap(); // creates the map

/*
$('#submit-btn').on('click',function(event) {
    //alert("Handler for button click called.");
    makeMarker();
    event.preventDefault();
});
*/
//makeMarker(); // sets the marker

//https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
/*
    var service = new google.maps.places.PlacesService(map);
  service.textSearch("los angeles", console.log(data));
*/
//console.log(map.geometry.location.lat());
//THIS CODE initMap Function IS NOT DEPLOYED CURRENTLY
/*function initMap() {



    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
    var callback = function(placeData) {


        var lat = placeData.geometry.city.lat(); // latitude from the place service
        var lon = placeData.geometry.city.lng(); // longitude from the place service
        console.log("lat: " + lat + "," + " long: " + lon);
    };
    var request = {
        query: city
    };

    // Actually searches the Google Maps API for location data and runs the callback
    // function with the search results after each search.
    service.textSearch(request, callback);


}*/
