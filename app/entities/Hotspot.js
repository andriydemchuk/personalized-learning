﻿define(['_'], function (_) {

    var ctor = function (id, title, isMultiple, background, spots) {
        this.id = id;
        this.title = title;
        this.isMultiple = isMultiple;

        this.background = background;
        this.spots = spots;
        this.score = 0;

        this.answer = function (marks) {
            if (!_.isArray(spots) || spots.length == 0) {
                this.score = 100;
                return;
            }

            if (!_.isArray(marks)) {
                this.score = 0;
                return;
            }

            var answerCorrect;
            if (isMultiple) {

                var spotsWithMarks = [];
                var marksOnSpots = [];

                _.each(marks, function (mark) {
                    _.each(spots, function (spot) {
                        if (isMarkInSpot(mark, spot)) {
                            spotsWithMarks.push(spot);
                            marksOnSpots.push(mark);
                        }
                    });
                });

                answerCorrect = _.uniq(spotsWithMarks).length === spots.length && _.uniq(marksOnSpots).length === marks.length;

            } else {
                answerCorrect = _.some(spots, function (spot) {
                    return _.some(marks, function (mark) {
                        return isMarkInSpot(mark, spot);
                    });
                });
            }

            this.score = answerCorrect ? 100 : 0;
        };
    };

    return ctor;


    function isMarkInSpot(mark, spot) {
        var x = mark.x, y = mark.y;

        var inside = false;
        for (var i = 0, j = spot.length - 1; i < spot.length; j = i++) {
            var xi = spot[i].x, yi = spot[i].y;
            var xj = spot[j].x, yj = spot[j].y;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

})