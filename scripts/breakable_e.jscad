//
// sheet structure - embedding nuts
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 20;
var BUTTONTHICKNESS = 5;

var SHEETTHCIKNESS = 3;
var SHEETLENGTH = 30;
var SHEETANGLE = 0;
var SHEETOFFSET = 5;

var EMBEDDING = true;
// var EMBEDDINGRADIUS = 1.5; // wood screw: 1.5; paper clip: 0.65
var NUMEMBEDDING = 2;
var RADIUSOUTER = 2.75;
var RADIUSINNER = 1.25;
var THICKNESS = 1.5;

include("xaclib.jscad");

function main() {
    var sheetLength = Math.min(BUTTONLENGTH / Math.sin(
        SHEETANGLE * Math.PI / 180), SHEETLENGTH);
    var sheetXOffset = Math.min(SHEETOFFSET, Math.max(0, (BUTTONWIDTH - sheetLength *
        Math.sin(SHEETANGLE * Math.PI / 180)) / 2));
    var sheetOffset = [sheetXOffset, 0, BUTTONWIDTH / 2];
    var sheet0 = cube({
        size: [SHEETTHCIKNESS, sheetLength, BUTTONWIDTH],
        center: true
    });
    //.rotateZ(SHEETANGLE).translate(sheetOffset);

    var baseRatio = 3;
    var baseHeight = SHEETLENGTH / 3;
    var base0 = XAC.trapezoidPrism(SHEETTHCIKNESS * baseRatio, SHEETTHCIKNESS, baseHeight, BUTTONWIDTH).translate(
        [0, -(SHEETLENGTH - baseHeight) / 2, 0]);
    var base1 = XAC.trapezoidPrism(SHEETTHCIKNESS, SHEETTHCIKNESS * baseRatio, baseHeight, BUTTONWIDTH).translate(
        [0, (SHEETLENGTH - baseHeight) / 2, 0]);

    var pillar = union(base0, base1, sheet0).rotateZ(SHEETANGLE).translate(sheetOffset);

    BUTTONLENGTH = Math.max(BUTTONLENGTH, 2 * (sheetXOffset + SHEETTHCIKNESS * baseRatio / 2));

    if (EMBEDDING) {
        var torus0 = torus({
            ri: RADIUSINNER,
            ro: RADIUSOUTER
        });
    }

    var offsetBtn = SHEETLENGTH * Math.cos(
        SHEETANGLE * Math.PI / 180) / 2;

    var btn0 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, offsetBtn, 0]);
    var btn1 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, -offsetBtn, 0]);

    var breakable = union(btn0, pillar, btn1);

    if (EMBEDDING) {
        var unitHeight = BUTTONWIDTH / NUMEMBEDDING;
        for (var i = 0; i < NUMEMBEDDING; i++) {
            breakable = breakable.subtract(torus0.rotateY(90).translate([sheetXOffset - SHEETTHCIKNESS * 0.5,
                0, unitHeight * (i + 0.5)
            ]));
        }
    }

    return breakable.rotateX(90);
}
