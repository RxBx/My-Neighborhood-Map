//Geocode look up
    var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json";
    var addressNumber = "2432";
    var street1 = "Claremont";
    var street2 = "Ave"
    var city = "los+angeles";
    var state = 'CA';
    var country = 'USA'
        //Address Strings for CITY & ADDRESS ("Complete") queries
    var addressStringCity = city + ",+" + state;
    var addressStringAddress = addressNumber + "+" + street1 + "+" + street2 + ",+" + city + ",+" + state;
    // Google Geocode API key - different from Map key
    var apiKeyGeocode = "AIzaSyBkBk3maFmugZtnSWKTkFMK2CXIe0c_20k";
    // Data for City Geocode submission
    var geocodeDataCity = {
        address: addressStringCity,
        key: apiKeyGeocode
    };
    //Data for Address Geocode submission
    var geocodeDataAddress = {
        address: addressStringAddress,
        key: apiKeyGeocode
    };
    //URL for CITY lat & long geocode lookup
    //var geocodeURLCity = geocodeURL + "?address=" + addressStringCity + "&" + apiKeyGeocode;
    //URL for ADDRESS lat & long geocode lookup
    //var geocodeURLComplete = geocodeURL + "?address=" + addressStringComplete + "&key=" + apiKeyGeocode;
    var lat;
    var lng;
    var map;
    var infoWindow;
    //Request Lat & Lng for CITY from Google Geocode
    $.getJSON(geocodeURL, geocodeDataCity, function(data) {
        console.log("worked"); // perf check
        lat = Number(data.results[0].geometry.location.lat);
        lng = Number(data.results[0].geometry.location.lng);
        console.log(lat); // perf check
        console.log(lng); // perf check
        makeMap(); // Make map based on CITY lat & lng
    });
    //Request Lat & Lng for ADDRESS ("Complete") from Google Geocode
    $.getJSON(geocodeURL, geocodeDataAddress, function(data) {
        console.log("worked"); //perf check
        lat = Number(data.results[0].geometry.location.lat);
        lng = Number(data.results[0].geometry.location.lng);
        console.log(lat); //perf check
        console.log(lng); //perf check
        makeMarker(); //Make marker for the address lat & lng
    });
    //Basic Google Map creation baed on lat & lng
    var makeMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: lat,
                lng: lng
            },
            zoom: 13
        });
    };
    //Basic Google Map creation based on lat & lng
    var makeMarker = function() {
        var marker = new google.maps.Marker({
            map: map,
            position: {
                lat: lat,
                lng: lng
            },
            title: "test label" // shows on cursor hover
        });
        // Google Map "infoWindow" creation
        infoWindow = new google.maps.InfoWindow({
            content: "pop up!" // will show when used in combo w click event listener
        });

        //Google Map click event on marker reveals infoWindo
        google.maps.event.addListener(marker, 'click', function() {
            //"open" info window on click
            infoWindow.open(map, marker);
        });
    };
    //https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
    /*
        var service = new google.maps.places.PlacesService(map);
      service.textSearch("los angeles", console.log(data));
    */
    //console.log(map.geometry.location.lat());
    //THIS CODE initMap Function IS NOT DEPLOYED CURRENTLY
    function initMap() {



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


    }