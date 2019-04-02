/**
 * Created by lucka on 4/2/2019.
 * @author lucka-me
 */

var map;
var trackList = [];
var polylineList = [];

function initMap() {
    var defaultCenter = {lat: 34.2651799, lng: 108.9435278};
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: defaultCenter,
        streetViewControl: false,
        fullscreenControl: false
    });
}

function generateNewTrack() {

}

function clearTracks() {
    trackList = [];
    for (polyline in polylineList) {
        polyline.setMap(null);
    }
    polylineList = [];
}
