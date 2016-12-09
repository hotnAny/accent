// .................................................................
//
//  analyzing the stress of a given object
//
// .................................................................

var XAC = XAC || {};

XAC.StressAnalysis = function(object) {
    this.DOF = 3;
    this._object = object;

    this._force = undefined; // loads
    this._fixedDofs = undefined; // boundary conditions

    // voxelize
    if (this._object != undefined) {
        var voxelGrid = new FORTE.VoxelGrid(XAC.scene);
        time();
        voxelGrid.voxelize(this._object, 32);
        time('voxelization')

        this.setVoxelGrid(voxelGrid);
    }

    // precompute material stiffness matrix
    var E = 1.0; // Young's modulus
    var nu = 0.3; // Poisson ratio
    this._KE = this._computeElementStiffnessMatrix(E, nu);
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

    // deal with boundary condition and solve KU = F

    // compute strain

    // compute stress
};

XAC.StressAnalysis.prototype.setVoxelGrid = function(voxelGrid) {
    this._voxelGrid = voxelGrid;

    // global stiffness matrix
    time()
    var kSize = this.DOF * (this._voxelGrid._nx + 1) * (this._voxelGrid._ny + 1) * (this._voxelGrid._nz +
        1);
    var k = XAC.initMDArray([kSize, kSize], 0);
    this._k = numeric.ccsSparse(k);
    // log(numeric.prettyPrint(this._k))
    time('created global stiffness matrix')

    // var u = XAC.initMDArray([kSize, 1], 0);
    // this._u = numeric.ccsSparse(u);
}

XAC.StressAnalysis.prototype.setLoad = function(indices, value) {
    var kSize = this.DOF * (this._voxelGrid._nx + 1) * (this._voxelGrid._ny + 1) * (this._voxelGrid._nz +
        1);
    var f = XAC.initMDArray([kSize, 1], 0);

    for (var i = 0; i < indices.length; i++) {
        // TODO: check, why reverse order?
        for (var j = this.DOF - 1; j >= 0; j--) {
            var nodes = this._compactElm2Nodes(indices[i]);
            for (var k = 0; k < nodes.length; k++) {
                f[(nodes[k] - 1) * this.DOF + j] = value[j];
            }
        }
        // DEBUG
        var voxel = this._voxelGrid._makeVoxel(this._voxelGrid._dim,
            indices[i][0], indices[i][1], indices[i][2], MATERIALHIGHLIGHT, true);
        XAC.scene.add(voxel);
        addAnArrow(voxel.position, new THREE.Vector3().fromArray(value), 15);
    }

    this._f = numeric.ccsSparse(f);
    // log(f)
}

XAC.StressAnalysis.prototype.setBoundary = function(indices) {
    for (var i = 0; i < indices.length; i++) {
        for (var j = this.DOF - 1; j >= 0; j--) {
            var nodes = this._compactElm2Nodes(indices[i]);
            this._fxtrNodes[this._axes[j]] = this._fxtrNodes[this._axes[j]].concat(nodes);

            // DEBUG
            XAC.scene.add(this._voxelGrid._makeVoxel(this._voxelGrid._dim,
                indices[i][0], indices[i][1], indices[i][2], MATERIALNORMAL, true));
        }
    }

}

XAC.StressAnalysis.prototype._compactElm2Nodes = function(index) {
    var nelx = this._voxelGrid._nx;
    var nely = this._voxelGrid._ny;
    var nelz = this._voxelGrid._nz;

    if (isNaN(nelx) || isNaN(nely) || isNaN(nelz)) {
        console.error('check number of elements')
    }

    if (nely > 1) {
        return this._elm2nodes3d(nelx, nely, nelz, index[0] + 1, index[1] + 1, index[2] + 1);
    } else {
        return this._elm2nodes2d(nelx, nelz, index[0] + 1, index[2] + 1);
    }
}

XAC.StressAnalysis.prototype._elm2nodes3d = function(nelx, nely, nelz, mpx, mpy, mpz) {
    var innback = [0, 1, nely + 1, nely + 2];
    var enback = nely * (mpx - 1) + mpy;
    var nnback = innback.clone().addScalar(enback + mpx - 1);
    var nnfront = nnback.clone().addScalar((nelx + 1) * (nely + 1));
    var nn = nnfront.concat(nnback).addScalar((mpz - 1) * (nelx + 1) * (nely + 1));
    return nn;
}

XAC.StressAnalysis.prototype._elm2nodes2d = function(nelx, nely, mpx, mpy) {
    var inn = [0, 1, nely + 1, nely + 2];
    var en = nely * (mpx - 1) + mpy;
    var nn = inn.clone().addScalar(en + mpx - 1);
    return nn;
}

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

    time('computed element stiffness matrix')
        // numeric.print(KE)

    return KE;
}
