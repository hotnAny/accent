//
//  beam structure - modular
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 15;
var BUTTONTHICKNESS = 5;

var RODRADIUS = 2.5; //1.5;
var RODLENGTH = 30;
var RODANGLE = 0;
var RODOFFSET = 5;

var MODULAR = true;
var MODULARORIENTATION = 90;
var TOLERANCESCALE = 0.1;

include("xaclib.jscad");

function main() {
    var rod0 = cylinder({
        r: RODRADIUS,
        h: RODLENGTH
    });

    var ratioBottom = 3;
    var cone0 = cylinder({
        r1: RODRADIUS * ratioBottom,
        r2: RODRADIUS,
        h: RODLENGTH / 3
    });

    var cone1 = cylinder({
        r1: RODRADIUS,
        r2: RODRADIUS * ratioBottom,
        h: RODLENGTH / 3
    }).translate([0, 0, RODLENGTH * 2 / 3]);


    if (MODULAR) {
        var wedgeWidth0 = RODRADIUS;
        var wedgeWidth1 = RODRADIUS * 2;
        var wedgeHeight = 2 * RODRADIUS;
        var wedgeLength = 8 * RODRADIUS;
        var wedge0 = XAC.trapezoidPrism(wedgeWidth0, wedgeWidth1, wedgeHeight, wedgeLength).rotateX(-
            90).rotateZ(MODULARORIENTATION).translate([0, 0, RODLENGTH / 3 - wedgeHeight / 2]);
        var wedge1 = XAC.trapezoidPrism(wedgeWidth0, wedgeWidth1, wedgeHeight, wedgeLength).rotateX(
            90).rotateZ(MODULARORIENTATION).translate([0, 0, RODLENGTH * 2 / 3 + wedgeHeight / 2]);

        rod0 = rod0.subtract(cone0).subtract(cone1);
        rod0 = union(rod0, intersection(wedge0, cone0), intersection(wedge1, cone1)).center().rotateY(90);
        cone0 = cone0.subtract(wedge0.scale(1 + TOLERANCESCALE)).translate([0, 0, -RODLENGTH / 2]).rotateX(
            90).rotateZ(RODANGLE).translate([RODOFFSET, 0, BUTTONWIDTH / 2]);
    } else {
        var pillar = union(rod0, cone0, cone1).translate([0, 0, -RODLENGTH / 2]).rotateX(90).rotateZ(
            RODANGLE).translate([RODOFFSET, 0, BUTTONWIDTH / 2]);
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

    var breakableBase = union(btn0, cone0).rotateX(-90).center().lieFlat();
    return MODULAR ? XAC.showAll([breakableBase, breakableBase, rod0.lieFlat()]) :
        union(btn0, pillar, btn1).rotateX(-90).center().lieFlat();
}
