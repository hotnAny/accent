//
//  sheet structure - mainly external reinforcement
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 15;
var BUTTONTHICKNESS = 5;

var SHEETTHCIKNESS = 1.75;
var SHEETLENGTH = 30;
var SHEETANGLE = 0;
var SHEETOFFSET = 5;

var EMBEDDING = true;
var EMBEDDINGRADIUS = 0.625; // paper clip radius 0.375
var NUMEMBEDDING = 5;

include("xaclib.jscad");

function main() {
    var sheetLength = Math.min(BUTTONLENGTH / Math.sin(
        SHEETANGLE * Math.PI / 180), SHEETLENGTH);
    var sheetOffset = [Math.min(SHEETOFFSET, Math.max(0, (BUTTONWIDTH - sheetLength *
        Math.sin(SHEETANGLE * Math.PI / 180)) / 2)), 0, BUTTONWIDTH / 2];
    var sheet0 = cube({
        size: [SHEETTHCIKNESS, sheetLength, BUTTONWIDTH],
        center: true
    }).rotateZ(SHEETANGLE).translate(sheetOffset);

    if (EMBEDDING) {
        var gRod0 = cylinder({
            r: EMBEDDINGRADIUS,
            h: SHEETLENGTH + BUTTONTHICKNESS * 2
        }).translate([0, 0, -(SHEETLENGTH + BUTTONTHICKNESS * 2) / 2]).rotateX(90).rotateZ(SHEETANGLE).translate(
            sheetOffset);
    }

    var offsetBtn = SHEETLENGTH * Math.cos(
        SHEETANGLE * Math.PI / 180) / 2;

    var btn0 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, offsetBtn, 0]);
    var btn1 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, -offsetBtn, 0]);

    var breakable = union(btn0, sheet0, btn1);

    if (EMBEDDING) {
        for (var i = 0; i < NUMEMBEDDING; i++) {
            breakable = breakable.subtract(gRod0.translate([0, 0, (i + 0.5 - NUMEMBEDDING / 2) * BUTTONWIDTH *
                0.9 / NUMEMBEDDING
            ]))
        }
    }

    return breakable;
}
