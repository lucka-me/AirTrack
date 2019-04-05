/**
 * Created by lucka on 4/2/2019.
 * @author lucka-me
 */

var map;
var trackList = [];
var polylineList = [];

var enableHideZoom = true;
var enableHidePan = true;
var polylinesHidden = false;
var enableDelayDisplay = true;
var delayDisplayInterval = 600;
var delayDisplayTimerId = null;

var simplifyMinDist = 2000;
var simplifyParamT = 4000;

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
    map.addListener("dragstart", onDragStart);
    map.addListener("idle", onIdle);
}

/* Track Panel */
function onGenerateTrack() {
    var pointNum = parseInt(document.getElementById("inputPointNum").value);
    var trackNum = parseInt(document.getElementById("inputTrackNum").value);
    // Check value
    if (pointNum < 2) {
        alert("2 points at least.");
        return;
    }
    if (trackNum < 1) {
        alert("1 track at least.");
        return;
    }
    for (var i = 0; i < trackNum; i++) {
        var newTrack = generateNewTrack(pointNum);
        addPolyline(newTrack);
        trackList.push(newTrack);
    }
    updateStatusCount();
}

function addPolyline(track) {
    var newPolyline = new google.maps.Polyline({
        path: track,
        clickable: false,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    newPolyline.setMap(map);
    polylineList.push(newPolyline);
}

function clearTracks() {
    trackList = [];
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setMap(null);
    }
    polylineList = [];
}

/* Optimize: Hide Panel */
function onCheckHideZoomChange() {
    enableHideZoom = document.getElementById("checkHideZoom").checked;
}

function onCheckHidePanChange() {
    enableHidePan = document.getElementById("checkHidePan").checked;
}

function onCheckDelayDisplayChange() {
    enableDelayDisplay = document.getElementById("checkDelayDisplay").checked;
    if (!enableDelayDisplay) showPolylines();
}

function onInputDelayDisplayIntervalChange() {
    delayDisplayInterval = parseInt(document.getElementById("inputDelayDisplayInterval").value)
}

/* Optimize: Simplify Panel  */
function onSimplify() {
    simplifyMinDist = parseInt(document.getElementById("inputSimplifyMinDist").value) * 1000;
    simplifyParamT = parseInt(document.getElementById("inputSimplifyParamT").value) * 1000;
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setMap(null);
    }
    polylineList = [];
    for (var i = 0; i < trackList.length; i++) {
        trackList[i] = compressTrack(trackList[i]);
        addPolyline(trackList[i]);
    }
    updateStatusCount();
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
    if (!enableHideZoom) return;
    hidePolylines();
}

function onDragStart(event) {
    if (!enableHidePan) return;
    hidePolylines();
}

function onIdle(event) {
    if (!polylinesHidden) return;
    if (enableDelayDisplay) {
        delayDisplayTimerId = setTimeout(showPolylines, delayDisplayInterval);
    } else {
        showPolylines();
    }
}

function hidePolylines() {
    if (delayDisplayTimerId != null) {
        clearTimeout(delayDisplayTimerId);
        delayDisplayTimerId = null;
    }
    if (polylinesHidden) return;
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setMap(null);
    }
    polylinesHidden = true;
}

function showPolylines() {
    delayDisplayTimerId = null;
    for (var i = 0; i < polylineList.length; i++) {
        polylineList[i].setMap(map);
    }
    polylinesHidden = false;
}
