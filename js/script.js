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

    self.map = makeMap();

    this.starList = ko.observableArray([]);

    //PUSHES ALL MODEL DATA OBJECTS INTO KO OBS ARRAY AS NEW "STARITEM"S
    modelStarInfo.forEach(function(markerItem) {
        self.starList.push(new StarItem(markerItem));
        console.log("items as starList generates:");
        //FOR LOGGING PURPOSES ONLY
        var arrayLength = self.starList().length;
        streetSearchItem = self.starList()[arrayLength - 1];

        console.log(streetSearchItem.street()); //perf check
        console.log(streetSearchItem.lat()); //perf check
        console.log(streetSearchItem.lng()); //perf check
    });
};

var makeMap = function() {
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 34.0500,
            lng: -118.2500
        },
        zoom: 13
    });
};

var StarItem = function(starInstance) {
    this.firstName = ko.observable(starInstance.firstName);
    this.lastName = ko.observable(starInstance.lastName);
    this.street = ko.observable(starInstance.street);
    this.favorite = ko.observable(false);
    this.lat = ko.observable(starInstance.lat);
    this.lng = ko.observable(starInstance.lng);
    //creates a marker attached to the each StarItem object
    this.marker = new Marker(self.map, starInstance.lastName, starInstance.lat, starInstance.lng, starInstance.street);
};

var Marker = function(map, lastName, lat, lon, street) {

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
    console.log(infoWindow.content); // perf check
    //this.infoWindow = infoWindow;

    this.popupevent = function() {
        console.log("The context inside the popupevent method appears to be selected StarItem array item:")
        console.log(this);
        infoWindow.open(map, this.marker.marker); //thus, marker selection requires this.marker.marker
    };
    //Google Map click event on marker reveals infoWindo
    this.marker.addListener('click', function() {
        console.log("This context inside the marker click event appears to be the marker itself:")
        console.log(this);
        infoWindow.open(map, this); // thus marker selection simply requires "this"
    });

    this.changePopupContent = function() {
        infoWindow.content = "Changed";
    };

    console.log("marker made"); //perf check
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



