"use strict";

//MODEL DATA
var modelStarInfo = [{
    firstName: "Bob",
    lastName: "Johnson",
    street: "123 Main St",
    lat: 34.0519079,
    lng: -118.243893
}, {
    firstName: "Ron",
    lastName: "Jones",
    street: "1738 Hyperion Ave",
    lat: 34.0957642,
    lng: -118.2770932
}, {
    firstName: "Frank",
    lastName: "Baker",
    street: "2600 beverly blvd",
    lat: 34.0694876,
    lng: -118.2768228
}];

//LOCATION FOR MAPPING
var modelLocale = {
    city: "Los Angeles",
    state: 'CA',
    country: 'USA'
};

//GOOGLE Geocode API URL
var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json"; //to access geocode API

// Google Geocode API key - different from Map key (Currently NOT used)
var apiKeyGeocode = "AIzaSyBkBk3maFmugZtnSWKTkFMK2CXIe0c_20k";

//DEAD GLOBAL VARIABLES FROM EARLIER SPAGHETTI CODE
//var street = "";
//var lat; // latitude value
//var lng; // longitude value
//var myLatLng; // data object for lat & long
//var map; // google map object
//var infoWindow; // marker

//KNOCKOUT VIEWMODEL
var ViewModel = function() {
    var self = this; //used to lock context for incrementCounter method defined below

    this.Place = function(placeObject) {
        //var self = this;
        this.name = placeObject.name;
        this.address1 = placeObject.address1;
        this.city = placeObject.city;
        this.access = placeObject.access;
        this.architect = placeObject.architect;
        this.caseStudy = placeObject["Case Study"];
        this.year = placeObject.year;
        //creates a marker attached to the each StarItem object
        this.marker = new google.maps.Marker({
            position: null,
            map: null,
            title: placeObject.name
        });

        //TODO Add marker creation without LatLng - a version of makeMarker without LatLng
        this.exhibit = ko.observable(true);
        this.searchString = (function() {
            var searchString = placeObject.name + placeObject.address1 + placeObject.city + placeObject.architect + placeObject.year;
            if (placeObject.caseStudy === true) {
                searchString = searchString + "caseStudy";
            }
            searchString = searchString.toLowerCase();
            //console.log(searchString);
            return searchString;
        })();
    };

    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 34.0500,
            lng: -118.2500
        },
        zoom: 9
    });

    this.infowindow = new google.maps.InfoWindow({
        content: ""
            // will show when used in combo w click event listener
    });

    this.placeList = ko.observableArray([]);
    //.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
    this.decades = ko.observableArray([]);
    //.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
    this.architect = ko.observableArray([]);
    //.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
    //initially select only non-private addresses
    this.access = ko.observableArray([]);
    //.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
    //initial value; cleared at end of load to prompt marker placement
    this.search = ko.observable("");
    //.extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });

    this.evaluateExhibit = function() {
        //Goes through each place in placeList to see if it matches filters/search if present;
        //if so, it sets the "exhibit" to "true"
        self.placeList().forEach(function(placeObject) {
            //reset "exhibit" in each places to "false" at head of evaluation loop;
            //This will be evaluated filter-by-filter;
            placeObject.exhibit(false);

            //check for access filter
            //when access filter isn't empty, compare all filter letters against access array;
            //and IF a place "exhibit" hasn't already been set to "true", and IF it doesn't match the
            //new access filter letter, make sure it's false;
            //otherwise/else (if "match" or already "true", set "true")
            if (self.access().length > 0) {
                for (var i = 0, len = self.access().length; i < len; i++) {
                    if ((placeObject.access !== self.access()[i]) && (placeObject.exhibit() === false)) {
                        placeObject.exhibit(false);
                    } else {
                        placeObject.exhibit(true);
                    }
                }
            } else //if no access filter letter is present (empty array) then set all exhibit to "true"
            //and proceed to next filter set.
            {
                placeObject.exhibit(true);
            }
            //check for architect filter & Case Study on placeObjects already "true" from prior filters
            //Examines 2 attributes: "Case Study" or specific "architect"
            //"Case Study" is a boolean indicating whether home was built as part of special architectural initiative
            //"Architect" may be one of several high-profile architects
            if ((self.architect().length > 0) && placeObject.exhibit() === true) {
                placeObject.exhibit(false);
                //evaluate if Case Study is checked & matches.
                if (placeObject.caseStudy === true && self.architect().indexOf("Case Study") > -1) {
                    placeObject.exhibit(true);
                }
                //for placeObjects not matched to "Case Study", checks for match of checked architect &
                // placeObject's "architect"
                var archMatch = false;
                if (placeObject.exhibit() === false) {
                    self.architect().forEach(function(element) {
                        //console.log("builder loop");
                        if ((placeObject.architect.indexOf(element) > -1) && (archMatch !== true)) {
                            archMatch = true;
                            //console.log("archMatch true for: " + element);
                        }
                        if (archMatch === true) {
                            placeObject.exhibit(true);
                        }
                    });
                }
            }

            //check for decades filter

            if ((self.decades().length > 0) && (placeObject.exhibit() === true)) {
                var decadeMatch = false;
                placeObject.exhibit(false);
                //console.log("place year: " + placeObject.year);
                var placeDecade = Math.floor(placeObject.year / 10) * 10;
                //console.log("placeDecade: " + placeDecade);
                for (var i = 0, len = self.decades().length; i < len; i++) {
                    //console.log("Decade checkbox: " + self.decades()[i]);
                    var matcher = self.decades()[i];
                    if ((matcher == placeDecade) || (decadeMatch === true)) {
                        decadeMatch = true;
                        //console.log("match");
                    }
                }
                if (decadeMatch === true) {
                    placeObject.exhibit(true);
                }
            }

            if ((self.search() != false) && (placeObject.exhibit() === true)) {
                if (placeObject.searchString.indexOf(self.search().toLowerCase()) > -1) {
                    placeObject.exhibit(true);
                } else {
                    placeObject.exhibit(false);
                }
            } else if ((self.search() === "") && (placeObject.exhibit() === true)) {
                placeObject.exhibit(true);
            }

        });

        self.makeMarkers();
    };

    /*
        $.ajax({
            url: "https://api.myjson.com/bins/1m0xt",
            type: "GET",
            //data: "4y15l",
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done(function(data, textStatus, jqXHR) {
            self.sortPlaces(data);
        });
    */


    //PUSHES ALL MODEL DATA OBJECTS INTO KO OBS ARRAY AS NEW "STARITEM"S
    this.sortPlaces = function(data) {
        data.forEach(function(placeObject) {
            self.placeList().push(new self.Place(placeObject));
        });
        //geocodePlaces(self.placeList());
        //TODO Add geocodePlaces to make a geocode technique that uses IF to check status,
        //then place LatLng, THEN restart on next geocode until reaching final item.
        // Use versions of makeMarker, updateLatLng,
    };

    this.updateLatLng = function(data) {
        lat = Number(data.results[0].geometry.location.lat);
        lng = Number(data.results[0].geometry.location.lng);

        var LatLng = {
            lat: lat,
            lng: lng
        };
    };

    this.makeMarkers = function() {
        //self.placeList().forEach(function(placeObject, index) {
        //  self.makeMarker(placeObject, index);
        //};
        console.log("running makeMarkers");
        //sets looping values external/prior to "markerSpinner" for special purpose looping in "markerSpinner"
        var len = self.placeList().length;
        var counter = 0;
        //
        self.markerSpinner(counter, len);
    };
    //This function on first run, geocodes all markers;
    //on all runs, sets "exhibit===true" markers on map, removes "exhibit===false" markers
    //Geocode's special "staggered loop" structure prevents errors from Geocode API during mass geocoding
    //by sending a fresh Geocode request only after the previous Geocode request has been received "OK"
    this.markerSpinner = function(counter, len) {
        console.log("counter " + counter);

        if (counter < len) {

            if ((self.placeList()[counter].exhibit() === true) && (self.placeList()[counter].marker.getPosition() === null)) {
                var address1 = self.placeList()[counter].address1;
                console.log("geocoding counter " + counter);
                var city = self.placeList()[counter].city;
                var addressArray = address1.split(" "); //geting rid of white spaces
                var streetAddressQueriable = addressArray[0]; //begin piece of API URL
                for (var i = 1; i < addressArray.length; i++) {
                    streetAddressQueriable += "+" + addressArray[i]; //reconsituting for API URL
                }
                /*var addressStringAddressCensus = address1+','+city+',CA';

                $.getJSON("http://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
                    {"address":addressStringAddressCensus,
                    "benchmark":9,
                    "format":"jsonp"
                }, function(data)
                {
                    var LatLng = {lat: data["result"]["addressMatches"]["coordinates"]["x"],lng: data["result"]["addressMatches"]["coordinates"]["y"]};
                    self.placeList()[counter].marker.setPosition(LatLng);
                        var item = self.placeList()[counter];
                        item.marker.setMap(self.map);

                        item.marker.addListener('click', function() {

                            self.infoWindowOpener(item);
                        });
                });
                 if (self.placeList()[counter].exhibit() === true) {

                        //advance counter so next placeList item gets fed to markerSpinner
                        counter++;
                        //submits next request
                        self.markerSpinner(counter, len);

                    }*/

                var addressStringAddress = streetAddressQueriable + ",+" + city + ",+CA";
                var geocodeDataAddress = {
                    address: addressStringAddress,
                    key: apiKeyGeocode
                };


                $.getJSON(geocodeURL, geocodeDataAddress, function(data) {
                    if (data.status === "OK") {
                        var LatLng = data.results[0].geometry.location;
                        //var currentMarker = setMarker(); //put the marker on the map using geocode lat lng

                        self.placeList()[counter].marker.setPosition(LatLng);
                        var item = self.placeList()[counter];
                        item.marker.setMap(self.map);

                        item.marker.addListener('click', function() {

                            self.infoWindowOpener(item);
                        });
                    }
                    if (self.placeList()[counter].exhibit() === true) {

                        //advance counter so next placeList item gets fed to markerSpinner
                        counter++;
                        //submits next request
                        self.markerSpinner(counter, len);
                    } else if (data.status === "OVER_QUERY_LIMIT") {
                        //if Geocoder hits limit, re-submit SAME counter number, to re-run the Geocode request
                        self.markerSpinner(counter, len);
                    } else {
                        //Other Geocode errors prompts message
                        console.log("geocode error status: " + data.status);
                        //advance counter so next placeList item gets fed to markerSpinner
                        counter++;
                        //submits next request
                        self.markerSpinner(counter, len);
                    }

                });

            } else if (self.placeList()[counter].exhibit() === true) {
                self.placeList()[counter].marker.setMap(self.map);
                counter++;
                self.markerSpinner(counter, len);
            } else {
                self.placeList()[counter].marker.setMap(null);
                counter++;
                self.markerSpinner(counter, len);
            }




        }

    };

    this.infoWindowOpener = function(item) {
        self.infowindow.close();
        console.log("infoWindowOpener run");
        var accessLetter = item.access;
        var accessString = function(accessLetter) {
            if (accessLetter === "e") {
                return "Exterior View";
            } else if (accessLetter === "o") {
                return "Public Access";
            } else if (accessLetter === "t") {
                return "Access via Tours/Appointments";
            } else if (accessLetter === "p") {
                return "Private Residence - No Access";
            }
        };
        var windowContent = '<p>' + item.name + '</p>' + '<p>' + item.address1 + ', ' + item.city + '</p>' + '<p>Year Built: ' + item.year + '</p>' + '<p>Architect(s): ' + item.architect + '</p>' +
            '<p>' + accessString(accessLetter) + '</p>';
        self.infowindow.setContent(windowContent);

        self.infowindow.open(self.map, item.marker);

    };


    /*this.makeMarker = function(markerObject, index) {

        var address1 = markerObject.address1;
        var city = markerObject.city;
        var addressArray = address1.split(" "); //geting rid of white spaces
        var streetAddressQueriable = addressArray[0]; //begin piece of API URL
        for (var i = 1; i < addressArray.length; i++) {
            streetAddressQueriable += "+" + addressArray[i]; //reconsituting for API URL
        }
        var addressStringAddress = streetAddressQueriable + ",+" + city + ",+CA";
        var geocodeDataAddress = {
            address: addressStringAddress,
            key: apiKeyGeocode
        };
        $.getJSON(geocodeURL, geocodeDataAddress, function(data) {

            self.updateLatLng(data);
            var currentMarker = setMarker(); //put the marker on the map using geocode lat lng


        });
    };*/

    this.showAll = function() {
        console.log("clicked show all");
        self.decades([]);
        self.architect([]);
        self.access([]);
        self.search("");


    };

    this.clearMap = function() {
        console.log("clicked clearMap");
        self.decades([]);
        self.architect([]);
        self.access([]);
        self.search("");
        self.placeList().forEach(function(placeObject) {
            //reset "exhibit" in each places to "false" at head of evaluation loop;
            //This will be evaluated filter-by-filter;
            placeObject.exhibit(false);
        });
        self.makeMarkers();
    };

    //subscribe all filter & search to run evaluateExhibit
    self.decades.subscribe(self.evaluateExhibit);
    self.architect.subscribe(self.evaluateExhibit);
    self.access.subscribe(self.evaluateExhibit);
    self.search.subscribe(self.evaluateExhibit);

    //load "masterList" TODO api load
    self.sortPlaces(masterList);

    //change ko "access" to load all "non private" "o", "t", "e" at load.

    self.access(["o", "t", "e"]);
};

ko.applyBindings(new ViewModel());


/*var Marker = function(map, lastName, lat, lon, street) {

    this.lastName = ko.observable(lastName);
    this.lat = ko.observable(lat);
    this.lon = ko.observable(lon);
    this.street = ko.observable(street);

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        map: map,
        title: this.lastName()
            //animation: google.maps.Animation.DROP // doesn't work

    });

    var infoWindow = new google.maps.InfoWindow({
        content: this.street() + " pop up!" // will show when used in combo w click event listener
    });
    //console.log(infoWindow.content); // perf check
    //this.infoWindow = infoWindow;

    this.popupevent = function() {
        //console.log("The context inside the popupevent method appears to be selected StarItem array item:")
        //console.log(this);
        infoWindow.open(map, this.marker.marker); //thus, marker selection requires this.marker.marker
    };
    //Google Map click event on marker reveals infoWindo
    this.marker.addListener('click', function() {
        //console.log("This context inside the marker click event appears to be the marker itself:")
        //console.log(this);
        infoWindow.open(map, this); // thus marker selection simply requires "this"
    });

    this.changePopupContent = function() {
        //infoWindow.content = "Changed";
    };

    //console.log("marker made"); //perf check
    //this.isVisible = ko.observable(false);

    //this.isVisible.subscribe(function(currentState) {
    //if (currentState) {
    //marker.setMap(map);
    //} else {
    //marker.setMap(null);
    //}
    //});

    //this.isVisible(true);


};

ko.applyBindings(new ViewModel());

//DEAD CODE FROM FIRST SPAGHETTI INCARNATION

//Basic Google Map creation baed on lat & lng


//creates marker on map based on geocode lookup of address
/*var makeMarker = function(markerObject, index) {
    console.log("makeMarker"); // perf check
    console.log(markerObject); // perf check
    console.log(markerObject.street); // perf check
    street = markerObject.street;
    var addressArray = street.split(" "); //geting rid of white spaces
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
        var currentMarker = setMarker(); //put the marker on the map using geocode lat lng
        console.log("return on currentMarker:");
        console.log(currentMarker);
        //sidebar(markerObject, index, currentMarker) // creates sidebar list item, and places click event listener

    });
    //alert("makeMarker complete");
};
*/



//Gen use function for parsing lat & long data from geocode look up
/*var updateLatLng = function(data) {
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
*/
