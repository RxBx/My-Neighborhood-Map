"use strict";

/* App is fully contained inside the ViewModel */
var ViewModel = function() {
    var self = this;
    /*Prototype uses JSON placeObject properties to create robust objects for map and list functions*/
    this.Place = function(placeObject) {
        this.name = placeObject.name;
        this.address1 = placeObject.address1;
        this.city = placeObject.city;
        this.access = placeObject.access;
        this.architect = placeObject.architect;
        this.caseStudy = placeObject["Case Study"];
        this.year = placeObject.year;
        //empty marker to place & remove when selected
        this.marker = new google.maps.Marker({
            position: null,
            map: null,
            title: placeObject.name
        });
        //"exhibit" KO Observable determines if item appears in list
        this.exhibit = ko.observable(true);
        //create a searchable string w most data parameters, for use in search function
        this.searchString = (function() {
            var searchString = placeObject.name + placeObject.address1 + placeObject.city + placeObject.architect + placeObject.year;
            if (placeObject.caseStudy === true) {
                searchString = searchString + "caseStudy";
            }
            searchString = searchString.toLowerCase();
            return searchString;
        })();
    };
    //create map via Google API
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 34.0500,
            lng: -118.2500
        },
        zoom: 8,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
    });
    //map bounds based on markers; is updated / renewed during KO list changes
    this.markerBounds = new google.maps.LatLngBounds();
    //empty info window; alters when list items are selected
    this.infowindow = new google.maps.InfoWindow({
        content: ""
    });
    //will receive placeObjects and allow for KO auto-update of view/html
    this.placeList = ko.observableArray([]);
    //triggers "scrollable" message in HTML in header for "Place List" when it exceeds height of div
    this.listScroll = ko.observable(false);
    //Compares height of Place List to height of list div, and if larger, triggers "scroll" message in HTML
    this.listScrollEval = function() {
        var listHeight = $('#overlay-list_listContents ul').outerHeight(true);
        var listDivHeight = $('#overlay-list_listContents').height();
        if (listHeight > listDivHeight) {
            self.listScroll(true);
        } else {
            self.listScroll(false);
        }
    };
    //triggers on screen message if search/filters yield no results
    this.noResults = ko.observable(false);
    //"no results" eval is trigger "true" when KO hides all list items
    this.noResultsEval = function() {
        var totalListLength = $('#mainView__overlay-list_listContents_ul li').length;
        var hiddenListLength = $('#mainView__overlay-list_listContents_ul li:hidden').length;

        if (hiddenListLength === totalListLength) {
            self.noResults(true);
        } else { self.noResults(false); }
    };

    //Receives selections from html "decades" checkboxes
    this.decades = ko.observableArray([]);
    //KO observables to help trigger CSS styling on selected checkboxes
    this.decades1920 = ko.observable(false);
    this.decades1930 = ko.observable(false);
    this.decades1940 = ko.observable(false);
    this.decades1950 = ko.observable(false);
    this.decades1960 = ko.observable(false);
    this.decades1970 = ko.observable(false);
    this.decades1980 = ko.observable(false);
    this.decades1990 = ko.observable(false);
    this.decades2000 = ko.observable(false);
    //Receives selections from html "architects" checkboxes
    this.architect = ko.observableArray([]);
    //KO observables to trigger CSS styling on selected checkboxes
    this.wright = ko.observable(false);
    this.schindler = ko.observable(false);
    this.neutra = ko.observable(false);
    this.lautner = ko.observable(false);
    this.gehry = ko.observable(false);
    //KO Observable to trigger CSS styling on the checkbox, and for use in filter eval
    this.caseStudy = ko.observable(false);
    //Receives selections from html "access" checkboxes
    this.access = ko.observableArray([]);
    //KO Observables to trigger CSS styling on selected checkboxes
    this.public = ko.observable(false);
    this.tours = ko.observable(false);
    this.exterior = ko.observable(false);
    this.private = ko.observable(false);
    //KO observable - initial value is empty for search
    this.search = ko.observable("");
    /*Main engine to evaluate visibility of list items based on chosen filters and search*/
    this.evaluateExhibit = function() {
        //stop bouncing marker
        self.placeList().forEach(function(placeObject) {
            if (placeObject.marker.getAnimation() !==null) {
                    placeObject.marker.setAnimation(null);
                }
        });
        /* TO DO - automate "selection" box open/close on timer from last user engage
        if (window.closeSelections) {
            window.clearTimeout(window.closeSelections);
        }
        //sets a new 4 sec timer to auto close "search/filters" if user doesn't engage
        window.closeSelections = setTimeout(function() {
            $('#selections').animate({
                top: '100%'
            }, 250);
            $('#searchFilterRevealHide').css({
                'background-color':'#ff0'
            });
            $('#searchFilterRevealHideText').text('Search/Filters');
        }, 4000);*/

        //Loop thru all objects in placeList KO array and eval for "exhibit"
        self.placeList().forEach(function(placeObject) {
            //reset "exhibit" in each places to "false" at head of evaluation loop;
            //This will be evaluated filter-by-filter;
            placeObject.exhibit(false);

            //check for "access" filter
            //when filter isn't empty, placeObject access letter against access array;
            //Match sets "exhibit" to "true"
            if (self.access().length > 0) {
                for (var i = 0, len = self.access().length; i < len; i++) {
                    if ((placeObject.access !== self.access()[i]) && (placeObject.exhibit() === false)) {
                        placeObject.exhibit(false);
                    } else {
                        placeObject.exhibit(true);
                    }
                }
            } else //if no "access" array is empty, then set any placeObject
            //to exhibit: "true" and proceed to next filter set.
            {
                placeObject.exhibit(true);
            }
            //Function evals whether placeObject is "case study" but ignore "architect"
            self.evalCsIgnoreAr = function(placeObject) {
                if (placeObject.caseStudy === true) {
                    placeObject.exhibit(true);
                } else {
                    placeObject.exhibit(false);
                }
            };
            //Function evals whether placeObject has an architect from the arch Array, ignore "case study"
            self.evalArIgnoreCs = function(placeObject) {
                placeObject.exhibit(false);
                //match detector value
                var archMatch = false;
                self.architect().forEach(function(element) {
                    //seek first match between placeObject's architect, & KO Obs Array of select architects
                    if ((placeObject.architect.indexOf(element) > -1) && (archMatch !== true)) {
                        archMatch = true;
                    }
                });
                if (archMatch === true) {
                    placeObject.exhibit(true);
                }
            };
            //Case Study / Architect filter
            //evaluate if Case Study is checked on placeObject already "true" from prior filter
            //"Case Study" is a boolean indicating whether home was built as part of special architectural initiative
            if (placeObject.exhibit() === true) {
                //When "caseStudy" is selected, but architects are NOT selected
                if (self.caseStudy() === true && self.architect().length === 0) { //1
                    self.evalCsIgnoreAr(placeObject);

                    //or if CS is not selected, evaluate "architect" value
                } else if (self.caseStudy() === false && self.architect().length > 0) { //3
                    self.evalArIgnoreCs(placeObject);
                    // if both CS and architect are selected, a loop that allows a match on either to "exhibit:true"
                } else if (self.caseStudy() === true && self.architect().length > 0) { //2
                    //check for CS match
                    self.evalCsIgnoreAr(placeObject);
                    //if not, then check Arch match
                    if (placeObject.exhibit() === false) {
                        self.evalArIgnoreCs(placeObject);
                    }
                }
            }

            //Decades filter
            if (placeObject.exhibit() === true) {
                if (self.decades().length > 0) {
                    placeObject.exhibit(false);
                    //holds value if decade match is detected; starts "false"
                    var decadeMatch = false;
                    //extracts placeObject's decade
                    var placeDecade = Math.floor(placeObject.year / 10) * 10;
                    //comparison loop
                    for (var i = 0, len = self.decades().length; i < len; i++) {
                        //sets value to decade to be checked
                        var matcher = self.decades()[i];
                        //sets a "decadeMatch" to true if it finds match OR if prior loop found match
                        if ((matcher == placeDecade) || (decadeMatch === true)) {
                            decadeMatch = true;
                        }
                    }
                    //if comparison loop has detected a decadeMatch, then sets placeObject.exhibit to "true"
                    if (decadeMatch === true) {
                        placeObject.exhibit(true);
                    }
                }
            }
            //Search filter - if there is a value in the search box, it searches placeObject's
            //search string for a match
            if ((self.search() !== false) && (placeObject.exhibit() === true)) {
                if (placeObject.searchString.indexOf(self.search().toLowerCase()) > -1) {
                    placeObject.exhibit(true);
                } else {
                    placeObject.exhibit(false);
                }
            } else if ((self.search() === "") && (placeObject.exhibit() === true)) {
                placeObject.exhibit(true);
            }

        });
        //check to see if list overflows div; if so set to "true"
        self.listScrollEval();
        //check to see if list is empty; if so set "true"
        self.noResultsEval();
        //close any infowindow
        self.infowindow.close();
        //refresh bounds
        self.markerBounds = new google.maps.LatLngBounds();
        //run marker setter
        self.setMarkers();
        //make sure map isn't zoom in too tight
        if (self.map.getZoom() > 11) {
            self.map.setZoom(11);
        }
    };

    //PUSHES ALL MODEL DATA OBJECTS INTO KO OBS ARRAY AS NEW "placeObject"'s
    this.sortPlaces = function(data) {
        data.forEach(function(placeObject) {
            self.placeList().push(new self.Place(placeObject));
        });
    };
    //updates all markers, usu called after "exhibit" is evaluated
    this.setMarkers = function() {
        self.placeList().forEach(self.markerSpinner);
    };
    //geocode function uses getJSON to retrieve LatLng from Google Maps Geocode API
    this.geocode = function(item) {
        var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json";
        // Google Geocode API key - different from Map key
        var apiKeyGeocode = "AIzaSyBkBk3maFmugZtnSWKTkFMK2CXIe0c_20k";

        var address1 = item.address1;
        var city = item.city;
        var addressArray = address1.split(" "); //geting rid of white spaces
        var streetAddressQueriable = addressArray[0]; //begin piece of API URL
        for (var i = 1, len = addressArray.length; i < len; i++) {
            streetAddressQueriable += "+" + addressArray[i]; //reconsituting address for API URL
        }

        var addressStringAddress = streetAddressQueriable + ",+" + city + ",+CA";
        var geocodeDataAddress = {
            address: addressStringAddress,
            key: apiKeyGeocode
        };
        //Error messaging if no response from Google Geocode
        var geocodeFailTimeout = setTimeout(function() {
            $('#error').text("Error: Google Map Geocoder is failing to connect")
                .removeClass('noerror').addClass('error');
        }, 3000);

        $.getJSON(geocodeURL, geocodeDataAddress, function(data) {
            var LatLng;
            if (data.status === "OK") {
                clearTimeout(geocodeFailTimeout);
                LatLng = data.results[0].geometry.location;

                item.marker.setPosition(LatLng);

                item.marker.addListener('click', function() {
                    self.infoWindowOpener(item);
                });
            } else if (data.status === "OVER_QUERY_LIMIT") {
                clearTimeout(geocodeFailTimeout);
                //if Geocoder hits limit, re-submit SAME counter number, to re-run the Geocode request
                self.geocode(item);
            } else {
                clearTimeout(geocodeFailTimeout);
                //Other Geocode errors prompts on screen message
                var requestGeocodeTimeout = setTimeout(function() {
                    $('#error').removeClass('error').addClass('noerror');
                }, 8000);
                $('#error').text("Error: Google Map Geocoder failed on at least one address lookup. Message: " + data.status)
                    .removeClass('noerror').addClass('error');
            }
            //update map window view
            if ((item.exhibit() === true) && (item.marker.getPosition() !== null)) {
                item.marker.setMap(self.map);
                self.markerBounds.extend(item.marker.getPosition());
                self.map.fitBounds(self.markerBounds);

                if (self.map.getZoom() > 11) {
                    self.map.setZoom(11);
                }
            }
        });
    };
    //Onn first run, geocodes any "exhibit: true" markers;
    //on all runs, sets "exhibit===true" markers on map, removes "exhibit===false" markers
    this.markerSpinner = function(item) {

        if ((item.exhibit() === true) && (item.marker.getPosition() === null)) {
            //TODO: Unmask geocode below, so the markers begin appearing after Google releases
            self.geocode(item);

        } else if (item.exhibit() === true) {
            self.markerBounds.extend(item.marker.getPosition());
            item.marker.setMap(self.map);
            self.map.fitBounds(self.markerBounds);
            self.map.panToBounds(self.markerBounds);

        } else {
            item.marker.setMap(null);
        }
    };
    //Function to construct the info window, incl. AJAX req to Wikipedia for info link, with error handling
    this.infoWindowOpener = function(item) {
        //stops bouncing markers
        self.placeList().forEach(function(placeObject) {
            if (placeObject.marker.getAnimation() !==null) {
                    placeObject.marker.setAnimation(null);
                }
        });
        //close any open infowindow
        self.infowindow.close();
        //bounces the selected marker
        item.marker.setAnimation(google.maps.Animation.BOUNCE);
        //turn "letter" value for "access" into human readable message
        var accessLetter = item.access;

        var accessStringEval = function(accessLetter) {
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

        var accessString = accessStringEval(accessLetter);
        //prepare Wikipedia request
        var searchItemEval = function(item) {
            if (item.caseStudy === true && item.architect !== "Richard Neutra") {
                return "Case Study Houses";
            } else {
                return item.architect;
            }
        };

        var searchItem = searchItemEval(item);

        var wikiUrl = 'http://en.wikipedia.org/w/api.php';
        //Error message from timeout if Wikip does not respond
        var requestWikiTimeout = setTimeout(function() {
            var windowContent = '<p>' + item.name + '</p>' + '<p>' + item.address1 + ', ' + item.city + '</p>' + '<p>Year Built: ' + item.year + '</p>' + '<p>Architect(s): ' + item.architect + '</p>' +
                '<p>' + accessString + '</p>' + '(Wikipedia is not responding)';
            self.infowindow.setContent(windowContent);
            self.infowindow.open(self.map, item.marker);
        }, 3000);
        //Wikip AJAX request
        $.ajax({
            url: wikiUrl,
            data: {
                action: "opensearch",
                search: searchItem,
                namespace: 0
            },
            dataType: "jsonp"
        }).done(function(response) {
            clearTimeout(requestWikiTimeout);
            var wikiItems = response;
            var wikiLine = '<p><a href="' + wikiItems[3][0] + '" target="_blank">' + 'Wikipedia link' + '</a></p>';

            var windowContent = '<p>' + item.name + '</p>' + '<p>' + item.address1 + ', ' + item.city + '</p>' + '<p>Year Built: ' + item.year + '</p>' + '<p>Architect(s): ' + item.architect + '</p>' +
                '<p>' + accessString + '</p>' + wikiLine;

            self.infowindow.setContent(windowContent);
            self.infowindow.open(self.map, item.marker);

        }).fail(function(response) {
            //failure reply from Wikip generates a "link free" version of infowindow
            clearTimeout(requestWikiTimeout);
            var windowContent = '<p>' + item.name + '</p>' + '<p>' + item.address1 + ', ' + item.city + '</p>' + '<p>Year Built: ' + item.year + '</p>' + '<p>Architect(s): ' + item.architect + '</p>' +
                '<p>' + accessString + '</p>';
            self.infowindow.setContent(windowContent);
            self.infowindow.open(self.map, item.marker);
        });
    };
    //function to show all items in PlaceList and on map
    this.showAll = function() {
        self.decades([]);
        self.architect([]);
        self.caseStudy(false);
        self.access([]);
        self.search("");
    };
    //function to clear all items from PlaceList and from map
    this.clearMap = function() {
        /* TO DO - automate "selection" box open/close on timer from last user engage
        if (window.closeSelections) {
            window.clearTimeout(window.closeSelections);
        }*/

        //empties filters
        self.showAll();
        //sets all items to exhibit:false
        self.placeList().forEach(function(placeObject) {
            //reset "exhibit" in each places to "false" at head of evaluation loop;
            //This will be evaluated filter-by-filter;
            placeObject.exhibit(false);
        });
        //make sure "scroll" message is off since list is clear
        self.listScroll(false);
        self.noResults(true);
        self.setMarkers();
    };
    //detects if View is in mobile landscape mode
    this.isMobileLandscape = function() {
        if (window.innerWidth < 651 && window.innerHeight < window.innerWidth) {
            return true;
        } else {
            return false;
        }
    };
    //A toggle system that shows/hides the search/filter box on smaller screens. Larger screens do not use this
    this.toggleSelections = function() {
        if (self.isMobileLandscape() === false && $('#selections').position().top === window.innerHeight / 2) {
            /* TO DO - automate "selection" box open/close on timer from last user engage
            if (window.closeSelections) {
                window.clearTimeout(window.closeSelections);
            }*/

            $('#selections').animate({
                top: '100%'
            }, 250);
            $('#searchFilterRevealHide').css({
                'background-color': '#e6e87e'
            });
            $('#searchFilterRevealHideText').text('Search/Filters');
        } else if (self.isMobileLandscape() === false) {
            $('#selections').animate({
                top: '50%'
            }, 250);
            $('#searchFilterRevealHide').css({
                'background-color': '#8cdcda'
            });

            $('#searchFilterRevealHideText').text('See List');
            /* TO DO - automate "selection" box open/close on timer from last user engage
            window.closeSelections = setTimeout(function() {
                $('#selections').animate({
                    top: '100%'
                }, 250);
                $('#searchFilterRevealHide').css({
                'background-color':'#ff0'
            });
                $('#searchFilterRevealHideText').text('Search/Filters');
            }, 5000);*/
        } else if (self.isMobileLandscape() === true && $('#selections').position().top < 0.11 * window.innerHeight) {
            $('#searchFilterRevealHideText').text('Search/Filters');
            $('#selections').animate({
                top: '92.5%'
            }, 250);
            $('#searchFilterRevealHide').css({
                'background-color': '#e6e87e'
            });
        } else if (self.isMobileLandscape() === true && $('#selections').position().top > 0.11 * window.innerHeight) {
            /* TO DO - automate "selection" box open/close on timer from last user engage
            if (window.closeSelections) {
                window.clearTimeout(window.closeSelections);
            }*/
            $('#searchFilterRevealHideText').text('See List');
            $('#selections').animate({
                top: '10%'
            }, 250);
            $('#searchFilterRevealHide').css({
                'background-color': '#8cdcda'
            });
        }
    };

    //Function to update selected Decade KO observables for KO CSS style change
    this.updateStyleDecade = function() {
        self.decades1920(false);
        self.decades1930(false);
        self.decades1940(false);
        self.decades1950(false);
        self.decades1960(false);
        self.decades1970(false);
        self.decades1980(false);
        self.decades1990(false);
        self.decades2000(false);
        for (var i = 0, len = self.decades().length; i < len; i++) {
            //sets value to decade to be checked
            var matcher = self.decades()[i];

            //updates booleans on ko decades observables to trigger css button styling
            if (matcher == 1920) { self.decades1920(true); } else if (matcher == 1930) { self.decades1930(true); } else if (matcher == 1940) { self.decades1940(true); } else if (matcher == 1950) { self.decades1950(true); } else if (matcher == 1960) { self.decades1960(true); } else if (matcher == 1970) { self.decades1970(true); } else if (matcher == 1980) { self.decades1980(true); } else if (matcher == 1990) { self.decades1990(true); } else if (matcher == 2000) { self.decades2000(true); }
        }
    };
    //subscribe update to changes in KO Obs Array Decades
    self.decades.subscribe(self.updateStyleDecade);

    //Update selected Architect KO observables as KO styling trigger
    this.updateStyleArchitect = function() {
        self.wright(false);
        self.schindler(false);
        self.neutra(false);
        self.lautner(false);
        self.gehry(false);
        for (var i = 0, len = self.architect().length; i < len; i++) {
            //sets value to decade to be checked
            var matcher = self.architect()[i];
            //loop to eval which architects are present, & set values in KO obs that trigger CSS for selected archs
            if (matcher === "Frank Lloyd Wright") { self.wright(true); } else if (matcher === "Schindler") { self.schindler(true); } else if (matcher === "Neutra") { self.neutra(true); } else if (matcher === "Lautner") { self.lautner(true); } else if (matcher === "Gehry") { self.gehry(true); }
        }
    };
    //subscribe udpate to changes in KO Obs Array Architect
    self.architect.subscribe(self.updateStyleArchitect);

    //Update selected Access KO observables as KOstyling trigger
    this.updateStyleAccess = function() {
        self.public(false);
        self.tours(false);
        self.exterior(false);
        self.private(false);

        for (var i = 0, len = self.access().length; i < len; i++) {
            var matcher = self.access()[i];
            //for css button styling, set individual KO obs booleans to true if selected
            if (matcher === "o") { self.public(true); } else if (matcher === "t") { self.tours(true); } else if (matcher === "e") { self.exterior(true); } else if (matcher === "p") { self.private(true); }
        }
    };
    //subscribe update to changes in KO Obs Array Access
    self.access.subscribe(self.updateStyleAccess);

    //subscribe evaluateExhibit to changes in any/all filter/search KO Obs / Arrays
    self.decades.subscribe(self.evaluateExhibit);
    self.caseStudy.subscribe(self.evaluateExhibit);
    self.architect.subscribe(self.evaluateExhibit);
    self.access.subscribe(self.evaluateExhibit);
    self.search.subscribe(self.evaluateExhibit);
    //Event listener  on "orientationchange" event to cue CSS changes if mobile screen orientation changes
    window.addEventListener("orientationchange", function() {
        if (self.isMobileLandscape() === true) {
            $('#searchFilterRevealHideText').text('Search/Filters');
            $('#selections').css({
                top: '100%'
            });
            $('#searchFilterRevealHide').css({
                'background-color': '#e6e87e'
            });
        } else if (window.innerWidth < 651) {
            $('#searchFilterRevealHideText').text('See List');
            $('#selections').css({
                top: '50%'
            });
            $('#searchFilterRevealHide').css({
                'background-color': '#8cdcda'
            });
        }
        self.map.fitBounds(self.markerBounds);
        if (self.map.getZoom() > 11) {
            self.map.setZoom(11);
        }
    });
    //Event listener  on "resize" event to cue CSS changes if mobile screen orientation changes
    window.addEventListener("resize", function() {
        if (self.isMobileLandscape() === true) {
            $('#searchFilterRevealHideText').text('Search/Filters');
            $('#selections').css({
                top: '100%'
            });
            $('#searchFilterRevealHide').css({
                'background-color': '#e6e87e'
            });
        } else if (window.innerWidth < 651) {
            $('#searchFilterRevealHideText').text('See List');
            $('#selections').css({
                top: '50%'
            });
            $('#searchFilterRevealHide').css({
                'background-color': '#8cdcda'
            });
        }
        self.map.fitBounds(self.markerBounds);
        if (self.map.getZoom() > 11) {
            self.map.setZoom(11);
        }
    });

    //load "masterList" JSON database
    self.sortPlaces(masterList);

    //change KO "access" to display all "non private" placeOjbects () "o", "t", "e" ) at first run.
    self.access(["o", "t", "e"]);

    setTimeout(function() {
            self.listScrollEval();
        }, 100);
    /* TO DO - automate "selection" box open/close on timer from last user engage
        if (self.isMobileLandscape()===true) {
            if (window.closeSelections) {
                window.clearTimeout(window.closeSelections);
            }
            $('#selections').css({
                top: '92.5%'
            });
            $('#searchFilterRevealHide').css({
                'background-color': '#ff0'
            });
        }*/
};
//First run function for App called by successful Google Map API script
var startApp = function() {
    ko.applyBindings(new ViewModel());
};
//Error function run by "onerror" if Google Map API script fails to load
var errorCall = function() {
    var elem = document.createElement('p');
    //if errorCall is invoked before parser creates document.body, then create it
    if (!document.body) {
        var dom = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
        var body = dom.createElement("body");

        dom.documentElement.appendChild(body);
        // setTimeout used to create slight seperation between body creation and append "p"
        setTimeout(function() {
            document.body.appendChild(elem);
            $('p').attr('id', 'error');
            $('#error').text("Error: Google Map API failed to load").removeClass('noerror').addClass('error');
        }, 0);
    } else {
        //if body already exists, simply attach error message
        $('#error').text("Error: Google Map API failed to load").removeClass('noerror').addClass('error');
    }
};
