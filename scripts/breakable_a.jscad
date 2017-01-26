//
//  beam structure - external reinforcement
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 15;
var BUTTONTHICKNESS = 5;

var RODRADIUS = 2.25; //1.5;
var RODLENGTH = 30;
var RODANGLE = 0;
var RODOFFSET = 5;

// embedding material
var EMBEDDING = true;
var EMBEDDINGRADIUS = 1.5; //0.625;

include("xaclib.jscad");

function main() {
    var rod0 = cylinder({
        r: RODRADIUS,
        h: RODLENGTH
    }).translate([0, 0, -RODLENGTH / 2]).rotateX(90).rotateZ(RODANGLE).translate([RODOFFSET, 0,
        BUTTONWIDTH / 2
    ]);

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

    var breakable = union(btn0, rod0, btn1);
    return EMBEDDING ? breakable.subtract(gRod0) : breakable;
}
