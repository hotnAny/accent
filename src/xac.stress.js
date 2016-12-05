// .................................................................
//
//  analyzing the stress of a given object
//
// .................................................................

var XAC = XAC || {};

XAC.StressAnalysis = function(object) {
    this._object = object;

    this._force = undefined; // loads
    this._fixedDofs = undefined; // boundary conditions

    // voxelize

    // precompute material stiffness matrix
    var E = 1.0;    // Young's modulus
    var nu = 0.3;   // Poisson ratio
    this._KE = this._computeElementStiffnessMatrix(E, nu);

    // this._k
};

XAC.StressAnalysis.prototype = {
    constructor: XAC.StressAnalysis
};

XAC.StressAnalysis.prototype.analyze = function() {
    // check whether loading and boundary condition are specified
    if (this._force == undefined || this._fixedDofs == undefined) {
        return;
    }

    // update stiffness matrix for all elements

    // solve KU = F

    // compute strain

    // compute stress
};

//
//  precompute material's element stiffness matrix
//  adapted from Liu & Tovar's code (https://top3dapp.com/download/top3d-m/)
//
XAC.StressAnalysis.prototype._computeElementStiffnessMatrix = function(E, nu) {
    time();

    var A = [
        [32, 6, -8, 6, -6, 4, 3, -6, -10, 3, -3, -3, -4, -8],
        [-48, 0, 0, -24, 24, 0, 0, 0, 12, -12, 0, 12, 12, 12]
    ];
    var At = numeric.transpose(A);
    var k = numeric.times(numeric.dot(At, [
        [1.0],
        [nu]
    ]), 1.0 / 72);
    // numeric.print(k)

    var K1 = [
        [k[0][0], k[1][0], k[1][0], k[2][0], k[4][0], k[4][0]],
        [k[1][0], k[0][0], k[1][0], k[3][0], k[5][0], k[6][0]],
        [k[1][0], k[1][0], k[0][0], k[3][0], k[6][0], k[5][0]],
        [k[2][0], k[3][0], k[3][0], k[0][0], k[7][0], k[7][0]],
        [k[4][0], k[5][0], k[6][0], k[7][0], k[0][0], k[1][0]],
        [k[4][0], k[6][0], k[5][0], k[7][0], k[1][0], k[0][0]]
    ];
    var K1t = numeric.transpose(K1);

    var K2 = [
        [k[8][0], k[7][0], k[11][0], k[5][0], k[3][0], k[6][0]],
        [k[7][0], k[8][0], k[11][0], k[4][0], k[2][0], k[4][0]],
        [k[9][0], k[9][0], k[12][0], k[6][0], k[3][0], k[5][0]],
        [k[5][0], k[4][0], k[10][0], k[8][0], k[1][0], k[9][0]],
        [k[3][0], k[2][0], k[4][0], k[1][0], k[8][0], k[11][0]],
        [k[10][0], k[3][0], k[5][0], k[11][0], k[9][0], k[12][0]]
    ];
    var K2t = numeric.transpose(K2);

    var K3 = [
        [k[5][0], k[6][0], k[3][0], k[8][0], k[11][0], k[7][0]],
        [k[6][0], k[5][0], k[3][0], k[9][0], k[12][0], k[9][0]],
        [k[4][0], k[4][0], k[2][0], k[7][0], k[11][0], k[8][0]],
        [k[8][0], k[9][0], k[1][0], k[5][0], k[10][0], k[4][0]],
        [k[11][0], k[12][0], k[9][0], k[10][0], k[5][0], k[3][0]],
        [k[1][0], k[11][0], k[8][0], k[3][0], k[4][0], k[2][0]]
    ];
    var K3t = numeric.transpose(K3);

    var K4 = [
        [k[13][0], k[10][0], k[10][0], k[12][0], k[9][0], k[9][0]],
        [k[10][0], k[13][0], k[10][0], k[11][0], k[8][0], k[7][0]],
        [k[10][0], k[10][0], k[13][0], k[11][0], k[7][0], k[8][0]],
        [k[12][0], k[11][0], k[11][0], k[13][0], k[6][0], k[6][0]],
        [k[9][0], k[8][0], k[7][0], k[6][0], k[13][0], k[10][0]],
        [k[9][0], k[7][0], k[8][0], k[6][0], k[10][0], k[13][0]]
    ];
    var K4t = numeric.transpose(K4);

    var K5 = [
        [k[0][0], k[1][0], k[7][0], k[2][0], k[4][0], k[3][0]],
        [k[1][0], k[0][0], k[7][0], k[3][0], k[5][0], k[10][0]],
        [k[7][0], k[7][0], k[0][0], k[4][0], k[10][0], k[5][0]],
        [k[2][0], k[3][0], k[4][0], k[0][0], k[7][0], k[1][0]],
        [k[4][0], k[5][0], k[10][0], k[7][0], k[0][0], k[7][0]],
        [k[3][0], k[10][0], k[5][0], k[1][0], k[7][0], k[0][0]]
    ];
    var K5t = numeric.transpose(K5);

    var K6 = [
        [k[13][0], k[10][0], k[6][0], k[12][0], k[9][0], k[11][0]],
        [k[10][0], k[13][0], k[6][0], k[11][0], k[8][0], k[1][0]],
        [k[6][0], k[6][0], k[13][0], k[9][0], k[1][0], k[8][0]],
        [k[12][0], k[11][0], k[9][0], k[13][0], k[6][0], k[10][0]],
        [k[9][0], k[8][0], k[1][0], k[6][0], k[13][0], k[6][0]],
        [k[11][0], k[1][0], k[8][0], k[10][0], k[6][0], k[13][0]]
    ];
    var K6t = numeric.transpose(K6);

    var KE = numeric.times(numeric.fromBlocks([
        [K1, K2, K3, K4],
        [K2t, K5, K6, K3t],
        [K3t, K6, K5t, K2t],
        [K4, K3, K2, K1t]
    ]), E / ((nu + 1) * (1 - 2 * nu)));

    time('compute element stiffness matrix')
    // numeric.print(KE)

    return KE;
}
