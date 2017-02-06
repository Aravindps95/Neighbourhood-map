var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 11.016844,
            lng: 76.955832
        },
        zoom: 20,


    });
     ko.applyBindings(new ViewModel());
}
var markers = [];
var Model = [{
    name: 'Brihadeeshwara Temple',
    location: {
        lat: 10.782783,
        lng: 79.131846
    },
    address: 'Membalam Rd, Balaganapathy Nagar, Thanjavur, Tamil Nadu 613007',
}, {
    name: 'Mahabalipuram',
    location: {
        lat: 12.6269,
        lng: 80.1927
    }, 
    address: 'Mahabalipuram, Tamil Nadu 603104',
}, {
    name: 'Marina Beach',
     location: {
        lat: 13.0500,
        lng: 80.2824
    }, 
    address: 'Triplicane, Chennai, Tamil Nadu 600005',
}, {
    name: 'Madurai Meenakshi Temple',
    location: {
        lat: 9.9195,
        lng: 78.1193
    },
    address: 'Madurai main, Madurai, TamilNadu 625001',
}, {
    name: 'Palani Murugan Temple',
    location: {
        lat: 10.4388,
        lng: 77.5202
    },
    address: 'Giri Veethi, Palani, TamilNadu 624601',
}];
var ViewModel = function() {
    var self = this;
    self.filtersearch = ko.observable('');
    self.locationitems = ko.observableArray(Model);
    self.search = ko.computed(function() {
        var filtersearch = self.filtersearch().toLowerCase();
        self.locationitems().forEach(function(item) {
            if (item.marker) {
                item.marker.setVisible(true);
            }
        });
        if (!filtersearch) {
            return self.locationitems();
        } else {
            return ko.utils.arrayFilter(self.locationitems(), function(item) {
                var place = item.name.toLowerCase().indexOf(filtersearch) !== -1;
                if (item.marker) {
                    item.marker.setVisible(place); 
                }
                return place;
            });
        }

    }, self);
 self.searchplaces = ko.observableArray();
 self.locationitems().forEach(function(place) {
        self.searchplaces.push(place);
});
 self.clickonsearchplaces = function(place) {
        place.marker.setIcon(makeMarkerIcon('00DD00'));
        google.maps.event.trigger(place.marker, 'click');
};
function googleError() {
    alert("Google map is not responding. pls Check your connection or come back later.");
}
var infowindow = new google.maps.InfoWindow();
var bounds = new google.maps.LatLngBounds();
var basicicon = makeMarkerIcon('0091ff');
var changedicon = makeMarkerIcon('CCCC24');
    for (i = 0; i < Model.length; i++) {
        var title = Model[i].name;
        var loc = Model[i].location;
        var marker = new google.maps.Marker({
            map: map,
            position: loc,
            title: title,
            animation: google.maps.Animation.BOUNCE,
            id: i
        });
        Model[i].marker = marker;
        markers.push(marker);
        marker.addListener('click', function() {
            populateinfowindow(this, infowindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(changedicon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(basicicon);
        });
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);


function populateinfowindow(marker, infowindow) {
    var articleUrl;
    var streetViewService = new google.maps.StreetViewService();
    var wikipediapage = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var wikipediaerror = setTimeout(function () {
        alert("failed to load wikipedia page");
    }, 8000);
    $.ajax({
        url: wikipediapage,
        dataType: "jsonp"}).done(function(response) {
        clearTimeout(wikipediaerror);
        articleUrl = response[3][0];
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    });
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        var radius = 50;
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><br><a href ="' + articleUrl + '">' + articleUrl + '</a><hr><div id="panorama"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 15
                    }
                };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('panorama'), panoramaOptions);
                } else {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>' );
                }
                infowindow.open(map, marker);
            }

        }
    }

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|50|_|%E2%80%A6',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }




};