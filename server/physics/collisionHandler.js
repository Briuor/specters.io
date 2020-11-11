class CollisionHandler {

    static rectReactCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y
    }

    static rectCircleCollision(circle, rect) {
        let circleDistance = {};
        circleDistance.x = Math.abs(circle.x - rect.x);
        circleDistance.y = Math.abs(circle.y - rect.y);

        if (circleDistance.x > (rect.w / 2 + circle.r)) { return false; }
        if (circleDistance.y > (rect.h / 2 + circle.r)) { return false; }

        if (circleDistance.x <= (rect.w / 2)) { return true; }
        if (circleDistance.y <= (rect.h / 2)) { return true; }

        let cornerDistance_sq = (circleDistance.x - rect.w / 2) ^ 2 +
            (circleDistance.y - rect.h / 2) ^ 2;

        return (cornerDistance_sq <= (circle.r ^ 2));
    }

    static doPolygonsIntersect(a, b) {
        var polygons = [a, b];
        var minA, maxA, projected, i, i1, j, minB, maxB;

        for (i = 0; i < polygons.length; i++) {

            // for each polygon, look at each edge of the polygon, and determine if it separates
            // the two shapes
            var polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {

                // grab 2 vertices to create an edge
                var i2 = (i1 + 1) % polygon.length;
                var p1 = polygon[i1];
                var p2 = polygon[i2];

                // find the line perpendicular to this edge
                var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

                minA = maxA = undefined;
                // for each vertex in the first shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                for (j = 0; j < a.length; j++) {
                    projected = normal.x * a[j].x + normal.y * a[j].y;
                    if ((typeof minA == 'undefined') || projected < minA) {
                        minA = projected;
                    }
                    if ((typeof maxA == 'undefined') || projected > maxA) {
                        maxA = projected;
                    }
                }

                // for each vertex in the second shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                minB = maxB = undefined;
                for (j = 0; j < b.length; j++) {
                    projected = normal.x * b[j].x + normal.y * b[j].y;
                    if ((typeof minB == 'undefined') || projected < minB) {
                        minB = projected;
                    }
                    if ((typeof maxB == 'undefined') || projected > maxB) {
                        maxB = projected;
                    }
                }

                // if there is no overlap between the projects, the edge we are looking at separates the two
                // polygons, and we know there is no overlap
                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }
}

module.exports = CollisionHandler;