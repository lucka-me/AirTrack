function generateNewTrack(total) {
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
    return newTrack;
}

/**
 * Compress track with CORC Algorithm
 * @see http://www.dqxxkx.cn/CN/Y2014/V16/I2/173
 */
function compressTrack(track) {
    var newList = [];
    var spherical = google.maps.geometry.spherical;
    var processCORC = function(point) {
        // Add to list first
        newList.push(point);
        // Keep the first
        var len = newList.length;
        if (len < 2) return;
        // Remove the lastest if too close
        var last1 = newList[len - 1];
        var last2 = newList[len - 2];
        if (spherical.computeDistanceBetween(last1, last2) < simplifyMinDist) {
            newList.pop();
            return;
        }
        // The third should be executed by CORC when the fourth comes
        if (len < 4) return;

        // CORC Begin
        // 如果为非冗余点，返回倒数第三个点和倒数第二个点（被判定点）的距离
        // 第一步：判断累积变向点或变向拐点
        var last3 = newList[len - 3];
        var last4 = newList[len - 4];
        var angleA = Math.abs(spherical.computeHeading(last4, last3) - spherical.computeHeading(last3, last2));
        var angleB = Math.abs(spherical.computeHeading(last4, last3) - spherical.computeHeading(last2, last1));
        // 倒数第三个点和倒数第二个点的距离，同时也用在海伦公式中
        var distanceB = spherical.computeDistanceBetween(last3, last2);
        if ((angleA > 90 && angleA < 270) || (angleB > 90 && angleB < 270)) return;

        // 第二步：累积偏移距离判断
        // 海伦公式计算点到直线的距离
        var distanceA = spherical.computeDistanceBetween(last4, last3);
        var distanceC = spherical.computeDistanceBetween(last2, last4);
        var s = (distanceA + distanceB + distanceC) / 2.0;
        var area = Math.sqrt(s * (s - distanceA) * (s - distanceB) * (s - distanceC));
        var d = area * 2.0 / distanceA;
        if (d >= simplifyParamT) return;
        // 倒数第二个为冗余点
        newList.splice(len - 2, 1);
    }
    for (var i = 0; i < track.length; i++) {
        processCORC(track[i]);
    }
    return newList;
}
