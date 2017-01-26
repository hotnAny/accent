//
//  sheet structure - wood screw or wire
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 20;
var BUTTONTHICKNESS = 5;

var SHEETTHCIKNESS = 2; //5; //2.5;
var SHEETLENGTH = 30;
var SHEETANGLE = 0;
var SHEETOFFSET = 5;

var EMBEDDING = true;
var EMBEDDINGRADIUS = 0.75; // wood screw: 1.5; paper clip: 0.65; florist wire: 0.75
var NUMEMBEDDING = 5;

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

    var breakable = union(btn0, pillar, btn1);

    if (EMBEDDING) {
        gRod0 = XAC.scaleCentric(gRod0, 1.25);
        var rodOffset = -SHEETTHCIKNESS * 0.25;
        for (var i = 0; i < NUMEMBEDDING; i++) {
            breakable = breakable.subtract(gRod0.translate([rodOffset, 0, (i + 0.5 - NUMEMBEDDING / 2) *
                BUTTONWIDTH * 0.9 / NUMEMBEDDING
            ]))
        }
    }

    return breakable.lieFlat();
    // return union(base0, base1, sheet0);

    // var path = new CSG.Path2D([ [10,10], [-10,10], [-20,0], [-10,-10], [10,-10] ], /*closed=*/true);
    // return linear_extrude({
    //     height: 10
    // }, polygon({points:[ [0,0],[2,1],[1,2],[1,3],[3,4],[0,5] ]}));
    // return trapezoidPrism(30, 15, 10, 40);
}
