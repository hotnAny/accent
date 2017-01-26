//
// beam structure - embedding wood screw, wire, etc.
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 15;
var BUTTONTHICKNESS = 5;

var RODRADIUS = 3; //1; //2.5; //1.5;
var RODLENGTH = 30;
var RODANGLE = 0;
var RODOFFSET = 5;

// embedding material
var EMBEDDING = true;
var EMBEDDINGRADIUS = 2.5; //0.75; //1.5; //0.625;

include("xaclib.jscad");

function main() {
    var rod0 = cylinder({
        r: RODRADIUS,
        h: RODLENGTH
    });

    var ratioBottom = 3;
    var cone0 = cylinder({
        r1: Math.min(BUTTONWIDTH / 2, RODRADIUS * ratioBottom),
        r2: RODRADIUS,
        h: RODLENGTH / 3
    });

    var cone1 = cylinder({
        r1: RODRADIUS,
        r2: Math.min(BUTTONWIDTH / 2, RODRADIUS * ratioBottom),
        h: RODLENGTH / 3
    }).translate([0, 0, RODLENGTH * 2 / 3]);

    var pillar = union(rod0, cone0, cone1).translate([0, 0, -RODLENGTH / 2]).rotateX(90).rotateZ(RODANGLE).translate(
        [RODOFFSET, 0, BUTTONWIDTH / 2]);

    if (EMBEDDING) {
        var gRod0 = cylinder({
            r: EMBEDDINGRADIUS,
            h: RODLENGTH + BUTTONTHICKNESS * 2
        }).translate([0, 0, -(RODLENGTH + BUTTONTHICKNESS * 2) / 2]).rotateX(90).rotateZ(RODANGLE).translate(
            [RODOFFSET, 0,
                BUTTONWIDTH / 2
            ]);
    }

    BUTTONLENGTH = Math.max(BUTTONLENGTH, RODLENGTH * Math.sin(
        RODANGLE * Math.PI / 180)) + RODRADIUS * 2;

    var offsetBtn = RODLENGTH * Math.cos(
        RODANGLE * Math.PI / 180) / 2;

    var btn0 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, offsetBtn, 0]);
    var btn1 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, -offsetBtn, 0]);

    var breakable = union(btn0, pillar, btn1);
    breakable = EMBEDDING ? breakable.subtract(gRod0) : breakable;
    return breakable.rotateX(90);
}
