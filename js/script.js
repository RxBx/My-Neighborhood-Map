var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json"; //to access geocode API
// Google Geocode API key - different from Map key
var apiKeyGeocode = "AIzaSyBkBk3maFmugZtnSWKTkFMK2CXIe0c_20k";

var city = "los+angeles";
var state = 'CA';
var country = 'USA'

var lat; // latitude value
var lng; // longitude value
var myLatLng; // data object for lat & long
var map; // google map object
var infoWindow; // marker

var initMap = function() {
    //Address String for CITY query
    var addressStringCity = city + ",+" + state;
    // Data for City Geocode submission
    var geocodeDataCity = {
        address: addressStringCity,
        key: apiKeyGeocode
    };

    $.getJSON(geocodeURL, geocodeDataCity, function(data) {
        console.log("worked"); // perf check
        updateLatLng(data);
        makeMap(); // Make map based on CITY lat & lng
    });
};

//Basic Google Map creation baed on lat & lng
var makeMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 13
    });
};
//creates marker on map based on geocode lookup of address
var makeMarker = function() {
    var addressNumber = "2432";
    var street1 = "Claremont";
    var street2 = "Ave";
    var addressStringAddress = addressNumber + "+" + street1 + "+" + street2 + ",+" + city + ",+" + state;
    var geocodeDataAddress = {
        address: addressStringAddress,
        key: apiKeyGeocode
    };
    $.getJSON(geocodeURL, geocodeDataAddress, function(data) {
        console.log("worked"); //perf check
        updateLatLng(data);
        setMarker(); //put the marker on the map using geocode lat lng
    });
};

//places the marker on map after successful geocode lookup of address
var setMarker = function() {
    console.log("here's new marker latlng"); // perf check
    console.log(myLatLng); // perf check
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: "test" // shows on cursor hover
    });
    // Google Map "infoWindow" creation
    infoWindow = new google.maps.InfoWindow({
        content: " pop up!" // will show when used in combo w click event listener
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

makeMarker(); // sets the marker

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
