/* Declare new map */
var map;
/* Initialise the map */
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat : 11.016844,
            lng : 76.955832
        }
    });
     ko.applyBindings(new ViewPlaces());
}

/* Declare Marker array */
var markerarray = [];

/* Places Entry */
var Places = [
{
    title : 'Brihadeeshwara Temple',
    location : {
        lat : 10.782783,
        lng : 79.131846
    },
    address : 'Membalam Rd, Balaganapathy Nagar, Thanjavur, Tamil Nadu 613007',
}, 
{
    title : 'Mahabalipuram',
    location : {
        lat : 12.616505,
        lng : 80.1991278
    }, 
    address : 'Mahabalipuram, Tamil Nadu 603104',
},
{
    title : 'Marina Beach',
     location: {
        lat : 13.0500,
        lng : 80.2824
    }, 
    address : 'Triplicane, Chennai, Tamil Nadu 600005',
},
{
    title : 'Madurai Meenakshi Temple',
    location : {
        lat : 9.9195,
        lng : 78.1193
    },
    address : 'Madurai main, Madurai, TamilNadu 625001',
}, 
{
    title : 'Palani Murugan Temple',
    location : {
        lat : 10.4388,
        lng : 77.5202
    },
    address : 'Giri Veethi, Palani, TamilNadu 624601',
}];

/* view places definition */
var ViewPlaces = function(){
    /* For Avoiding OverRiding */
    var it = this;
    /*Bind search box input and search for it */
    it.placefilter = ko.observable('');
    it.placesarray = ko.observableArray(Places);
    /*Search*/
    it.search = ko.computed(function() {
        /* Converting to lowercase */
        var placefilter = it.placefilter().toLowerCase();
        it.placesarray().forEach(function(item) {
            /* In case input is empty then make all markers visible */
            if(item.marker) {
                item.marker.setVisible( true );
            }
        });
        /* Search */
        if (placefilter) {
                return ko.utils.arrayFilter(it.placesarray(), function(item) {
                    var placename = item.title.toLowerCase().indexOf(placefilter) !== -1;
                    if(item.marker) {
                        item.marker.setVisible(placename); 
                    }
                    return placename;
                });  
        } 
        /*Show all places when there is no search */
        else {
            return it.placesarray();
        }
    }, it);

    it.searchplaces = ko.observableArray();
    /*Push the found locations into an array */
    it.placesarray().forEach(function(placename){
        it.searchplaces.push(placename);
    });
    it.searchplacesclicked = function(placename){
        // place.marker.setIcon(makeMarkerIcon('00DD00'));
        google.maps.event.trigger(placename.marker, 'click');
    };

    /* set default color to the marker */
    var basicicon = buildMarkericon('0091ff');
    /*declare info window */
    var infowindow = new google.maps.InfoWindow();
    var locurl;
    function expandinfowindow(marker, infowindow) {
        /* Streetview initialisation */
        var streetview = new google.maps.StreetViewService();
        /*set the radius of a location upto which streetview image can be loaded */
        var radius = 50;
        /* wiki page */
        var wikipediapage = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        var wikipageerror = setTimeout(function () {
            /* Timeout wikipedia when it takes more than 8 seconds */
            alert("failed to load wikipedia page"); }, 10000);
        $.ajax({ url: wikipediapage, dataType: "jsonp" }).done(function(reply) {
            /* Timeout cleared when page loads successfully */
            clearTimeout(wikipageerror);
            /* wiki API response */
            locurl = reply[3][0];
            streetview.getPanoramaByLocation(marker.position, radius, getStreetView);
        });
        if (infowindow.marker != marker){
            infowindow.marker = marker;
            /* set marker title */
            infowindow.setContent('<p>' + marker.title + '</p>');
            infowindow.open(map, marker);
            /* make marker content to null when infowindow is closed */
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            function getStreetView(data, stat){
                if(stat == google.maps.StreetViewStatus.OK){
                    var nearstreetloc = data.location.latLng;
                    var titlename = google.maps.geometry.spherical.computeHeading(nearstreetloc, marker.position);
                    /* set content to title and wikiurl */
                    infowindow.setContent('<p>' +marker.title+ '</p><a href ="' +locurl+ '">' +locurl+ '</a><hr><div id="panorama"></div>');
                    var panoramaprop = {
                        position : nearstreetloc,
                        pov : { heading: titlename, pitch: 15 }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('panorama'), panoramaprop);
                } 
                /* when streetview is not available */
                else {
                        infowindow.setContent('<p>' +marker.title+ '</p>' + '<p>No street view found for this location</p>' );
                }
                /* open infowindow for the marker */
                infowindow.open(map, marker);
            }
        }
    }

    var bounds = new google.maps.LatLngBounds();
    /* loop over places array */
    for (var i = 0; i < Places.length; i++) {
        var marker = new google.maps.Marker({ 
            map : map, 
            position : Places[i].location, 
            title :  Places[i].title, 
            animation : google.maps.Animation.DROP
        });
        Places[i].marker = marker;
        markerarray.push(marker);
        marker.addListener('click', function() {
            var self = this;
            expandinfowindow(this, infowindow);
            self.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ self.setAnimation(null); }, 3000);
        });
        bounds.extend(markerarray[i].position);
    }
    map.fitBounds( bounds );

    /* set marker color */
    function buildMarkericon(Color) {
        var markericon = new google.maps.MarkerImage('https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + Color +
            '|50|_|%E2%80%A6',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
            return markericon;
    }
};

/* Message when map loading fails */
function googleError() {
    alert("Google map is not responding at the moment");
}
