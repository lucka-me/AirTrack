/**
 * Created by lucka on 4/2/2019.
 * @author lucka-me
 */

var map;
var trackList = [];
var polylineList = [];

var enableHideZoom = true;
var polylinesHidden = false;

var divStatusTrackCount = document.getElementById("trackCount");
var divStatusPointCount = document.getElementById("pointCount");

function initMap() {
    var defaultCenter = {lat: 34.2651799, lng: 108.9435278};
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: defaultCenter,
        streetViewControl: false,
        fullscreenControl: false
    });
    map.addListener("zoom_changed", onZoom);
    map.addListener("idle", onIdle);
}

/* Track Panel */
function generateNewTrack() {
    var total = parseInt(document.getElementById("inputPointNum").value);
    // Check value
    if (total < 2) {
        alert("Needs 2 points at least.");
        return;
    }
    var bounds = map.getBounds();
    var northEast = bounds.getNorthEast();
    var southWest = bounds.getSouthWest();
    var start = new google.maps.LatLng(
        southWest.lat() + Math.random() * (northEast.lat() - southWest.lat()),
        southWest.lng() + Math.random() * (northEast.lng() - southWest.lng())
    );
    // Random an end within 1000~3000km
    var end = google.maps.geometry.spherical.computeOffset(
        start,
        1000000.0 + Math.random() * 2000000.0,
        Math.random() * 360.0
    );
    var newTrack = [];
    newTrack.push(start);
    while (newTrack.length < total - 1) {
        var last = newTrack[newTrack.length - 1];
        var randCenter = new google.maps.LatLng(
            last.lat() + (end.lat() - last.lat()) / (total - newTrack.length),
            last.lng() + (end.lng() - last.lng()) / (total - newTrack.length)
        );
        // Generate the new point inside the square
        var randDist = google.maps.geometry.spherical.computeDistanceBetween(last, end) / (total - newTrack.length + 1);
        var randNE = google.maps.geometry.spherical.computeOffset(randCenter, randDist, 45);
        var randSW = google.maps.geometry.spherical.computeOffset(randCenter, randDist, 225);
        var newPoint = new google.maps.LatLng(
            randSW.lat() + Math.random() * (randNE.lat() - randSW.lat()),
            randSW.lng() + Math.random() * (randNE.lng() - randSW.lng())
        );
        newTrack.push(newPoint);
    }
    newTrack.push(end);
    var newPolyline = new google.maps.Polyline({
        path: newTrack,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    newPolyline.setMap(map);
    trackList.push(newTrack);
    polylineList.push(newPolyline);
    updateStatusCount();
}

function clearTracks() {
    trackList = [];
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setMap(null);
    }
    polylineList = [];
}

/* Optimize Panel */
function onCheckHideZoomChange() {
    enableHideZoom = document.getElementById("checkHideZoom").checked;
}

/* Status Panel */
function updateStatusCount() {
    divStatusTrackCount.innerHTML = trackList.length;
    var count = 0;
    for (var i = 0; i < trackList.length; i++) {
        count += trackList[i].length;
    }
    divStatusPointCount.innerHTML = count;
}

/* Event Handler */
function onZoom(event) {
    if (!enableHideZoom || polylinesHidden) return;
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setVisible(false);
    }
    polylinesHidden = true;
}

function onIdle(event) {
    if (!polylinesHidden) return;
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setVisible(true);
    }
    polylinesHidden = false;
}
