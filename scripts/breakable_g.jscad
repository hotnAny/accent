//
//  sheet structure - modular
//

var BUTTONLENGTH = 20;
var BUTTONWIDTH = 20;
var BUTTONTHICKNESS = 5;

var SHEETTHCIKNESS = 2; //2.5;
var SHEETLENGTH = 30;
var SHEETANGLE = 0;
var SHEETOFFSET = 5;

var MODULAR = false;
var TOLERANCESCALE = 0.1;

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

    var baseRatio = 5;
    var baseHeight = SHEETLENGTH / 3;
    var base0 = XAC.trapezoidPrism(SHEETTHCIKNESS * baseRatio, SHEETTHCIKNESS, baseHeight, BUTTONWIDTH).translate(
        [0, -(SHEETLENGTH - baseHeight) / 2, 0]);
    var base1 = XAC.trapezoidPrism(SHEETTHCIKNESS, SHEETTHCIKNESS * baseRatio, baseHeight, BUTTONWIDTH).translate(
        [0, (SHEETLENGTH - baseHeight) / 2, 0]);


    BUTTONLENGTH = Math.max(BUTTONLENGTH, 2 * (sheetXOffset + SHEETTHCIKNESS * baseRatio / 2));

    if (MODULAR) {

        var wedgeWidth0 = 0.5 * SHEETTHCIKNESS;
        var wedgeWidth1 = 1.25 * SHEETTHCIKNESS;
        var wedgeHeight = 3 * SHEETTHCIKNESS;
        var wedgeLength = BUTTONWIDTH * 1.1;
        var wedge0 = XAC.trapezoidPrism(wedgeWidth1, wedgeWidth0, wedgeHeight, wedgeLength).translate([0, -
            (SHEETLENGTH - baseHeight) / 2 + (baseHeight - wedgeHeight) / 2, 0
        ]);

        var wedge1 = XAC.trapezoidPrism(wedgeWidth0, wedgeWidth1, wedgeHeight, wedgeLength).translate([0, (
            SHEETLENGTH - baseHeight) / 2 - (baseHeight - wedgeHeight) / 2, 0]);

        sheet0 = union(sheet0.subtract(union(base0, base1)), base0.intersect(wedge0), base1.intersect(
            wedge1));

        base0 = base0.subtract(XAC.scaleCentric(wedge0, 1 + TOLERANCESCALE));
        base1 = base1.subtract(wedge1.scale(1 + TOLERANCESCALE));
    }

    var pillar = union(base0, base1, sheet0).rotateZ(SHEETANGLE).translate(sheetOffset);

    var offsetBtn = SHEETLENGTH * Math.cos(
        SHEETANGLE * Math.PI / 180) / 2;

    var btn1 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, offsetBtn, 0]);
    var btn0 = cube({
        size: [BUTTONLENGTH, BUTTONTHICKNESS, BUTTONWIDTH]
    }).translate([-BUTTONLENGTH / 2, -BUTTONTHICKNESS / 2, 0]).translate([0, -offsetBtn, 0]);

    var breakable = union(btn0, pillar, btn1);
    var breakableBase = union(btn0, base0.translate(sheetOffset)).rotateX(90).lieFlat();
    return MODULAR ? XAC.showAll([sheet0.lieFlat(), breakableBase, breakableBase], 5) : breakable.rotateX(90).lieFlat();
}
