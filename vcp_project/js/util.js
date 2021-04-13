function lineLine(p1, p2, p3, p4) {
    // http://www.jeffreythompson.org/collision-detection/line-rect.php
    let uA = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
             ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    let uB = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
             ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

    return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

function lineRect(p1, p2, rect) {
    // http://www.jeffreythompson.org/collision-detection/line-rect.php
    let rectp1 = {x: rect.x1, y: rect.y1};
    let rectp2 = {x: rect.x2, y: rect.y1};
    let rectp3 = {x: rect.x1, y: rect.y2};
    let rectp4 = {x: rect.x2, y: rect.y2};

    return lineLine(p1, p2, rectp1, rectp2) ||
           lineLine(p1, p2, rectp1, rectp3) ||
           lineLine(p1, p2, rectp2, rectp4) ||
           lineLine(p1, p2, rectp3, rectp4);
}

function randomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - 1 + min)) + min;
}

function pointOnLineSeg(p, l1, l2) {
  //https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

  var A = p.x - l1.x;
  var B = p.y - l1.y;
  var C = l2.x - l1.x;
  var D = l2.y - l1.y;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = l1.x;
    yy = l1.y;
  }
  else if (param > 1) {
    xx = l2.x;
    yy = l2.y;
  }
  else {
    xx = l1.x + param * C;
    yy = l1.y + param * D;
  }

  return {x: xx, y: yy};
}

function distToLineSeg(p, l1, l2) {
  //https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

  var A = p.x - l1.x;
  var B = p.y - l1.y;
  var C = l2.x - l1.x;
  var D = l2.y - l1.y;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = l1.x;
    yy = l1.y;
  }
  else if (param > 1) {
    xx = l2.x;
    yy = l2.y;
  }
  else {
    xx = l1.x + param * C;
    yy = l1.y + param * D;
  }

  var dx = p.x - xx;
  var dy = p.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}