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

var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json"; //to access geocode API
// Google Geocode API key - different from Map key
var apiKeyGeocode = "AIzaSyBkBk3maFmugZtnSWKTkFMK2CXIe0c_20k";
//var street = "";

var modelLocale = {
    city: "Los Angeles",
    state: 'CA',
    country: 'USA'
};

var lat; // latitude value
var lng; // longitude value
var myLatLng; // data object for lat & long
var map; // google map object
var infoWindow; // marker



var Marker = function(map, name, lat, lon, text) {
    //var marker;

    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.lon = ko.observable(lon);
    this.text = ko.observable(text);

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        map: map,
        title: this.name()
            //animation: google.maps.Animation.DROP

    });

    var infoWindow = new google.maps.InfoWindow({
        content: this.text() + " pop up!" // will show when used in combo w click event listener
    });
    console.log(infoWindow.content);
    this.infoWindow = infoWindow;
    this.popupevent = function () {
        console.log(this);
        infoWindow.open(map, this.marker.marker);
    };
    //Google Map click event on marker reveals infoWindo
    this.marker.addListener('click', function() {
        console.log(this);
        infoWindow.open(map, this);
    });

    console.log("marker made");
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

var StarItem = function(starInstance) {
    this.firstName = ko.observable(starInstance.firstName);
    this.lastName = ko.observable(starInstance.lastName);
    this.street = ko.observable(starInstance.street);
    this.favorite = ko.observable(false);
    this.lat = ko.observable(starInstance.lat);
    this.lng = ko.observable(starInstance.lng);
    this.marker = new Marker(self.map, starInstance.lastName, starInstance.lat, starInstance.lng, starInstance.street);
};

var ViewModel = function() {
    var self = this; //used to lock context for incrementCounter method defined below

    self.map = makeMap();
    /*
        this.markerLatLongLookup = function(markerObject) {
            console.log("markerLatLongLookup"); // perf check
            console.log(markerObject); // perf check
            console.log(markerObject.street()); // perf check
            street = markerObject.street();
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
                //console.log(data.results[0].geometry.location.lat);
                lat = Number(data.results[0].geometry.location.lat);
                lng = Number(data.results[0].geometry.location.lng);
                var productLatLng = {
                    lat: lat,
                    lng: lng
                };
                console.log("productLatLng from inside markerLatLongLookup");
                console.log(markerObject.street());
                console.log(productLatLng.lat);
                console.log(productLatLng.lng);
                return productLatLng;
                //updateLatLng(data);
                //var currentMarker = setMarker(); //put the marker on the map using geocode lat lng
                //console.log("return on currentMarker:");
                //console.log(currentMarker);
                //sidebar(markerObject, index, currentMarker) // creates sidebar list item, and places click event listener

            });
            //alert("makeMarker complete");
        };
    */
    this.starList = ko.observableArray([]);

    modelStarInfo.forEach(function(markerItem) {
        self.starList.push(new StarItem(markerItem));
        console.log("items as starList generates:");
        var arrayLength = self.starList().length;
        streetSearchItem = self.starList()[arrayLength - 1];

        console.log(streetSearchItem.street()); //perf check
        console.log(streetSearchItem.lat()); //perf check
        console.log(streetSearchItem.lng()); //perf check
        //console.log(streetSearchItem.marker.infoWindow.content); //perf check
        /*
        var arrayLength = self.starList().length;
        streetSearchItem = self.starList()[arrayLength - 1];

        console.log(streetSearchItem.street()); //perf check
        console.log(streetSearchItem.lat()); //perf check
        console.log(streetSearchItem.lng()); //perf check

        var tempLatLng = self.markerLatLongLookup(streetSearchItem);
        self.starList()[arrayLength - 1].latLng = tempLatLng;
        console.log("This is generated latLng:");
        console.log(self.starList()[arrayLength - 1].latLng);
        */
    });




    this.openInfo = function() {
        //"open" info window on click
        console.log("click on list worked " + newID); // perf check
        infoWindow.open(map, markerItem); // pop up info for corresponding marker
    };

    this.makeAllMarkers = function(starArray) {
        console.log("makeAllMarkers");
        console.log("first object street name: ");
        var arrayXXX = starArray;
        console.log(arrayXXX.street);
        for (var i = 0; i < arrayXXX.length; i++) {
            makeMarker(arrayXXX[i], i);
        }
    };
    this.log = function(data) {
            console.log(data.street());
        }
        //this.makeAllMarkers(self.starList());
};

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
        console.log("map order to be placed");
        makeMap(); // Make map based on CITY lat & lng
        console.log("map made");

    });
};

//Basic Google Map creation baed on lat & lng
var makeMap = function() {
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 34.0500,
            lng: -118.2500
        },
        zoom: 13
    });
};


var makeAllMarkers = function(markerArray) {
        console.log("makeAllMarkers");
        for (var i = 0; i < markerArray.length; i++) {
            makeMarker(markerArray[i], i);

        }
    }
    //creates marker on map based on geocode lookup of address
var makeMarker = function(markerObject, index) {
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

var sidebar = function(markerObject, index, markerItem) {
    //New List Item
    var elem = document.createElement("li");
    var newID = "index" + index; // creates unique ID based on list item index
    elem.setAttribute("id", newID);
    var content = document.createTextNode(markerObject.street);
    elem.appendChild(content);
    var sidebar = document.getElementById("sidebar");
    sidebar.appendChild(elem);
    // Add click listener for new list item
    var listElem = document.getElementById(newID); //hook for event listener

    listElem.addEventListener('click', function() {
        //"open" info window on click
        console.log("click on list worked " + newID); // perf check
        infoWindow.open(map, markerItem); // pop up info for corresponding marker
    });
}

//places the marker on map after successful geocode lookup of address
var setMarker = function() {
    console.log("here's setMarker latlng"); // perf check
    console.log(myLatLng); // perf check
    console.log("This is street in setMarker"); // perf check
    console.log(street); // perf check
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
    return marker;
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

//initMap();

ko.applyBindings(new ViewModel());
