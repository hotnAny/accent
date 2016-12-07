// ........................................................................................................
//
//  topy ui library v0.0
//  xiangchen@acm.org, dec 2016
//
// ........................................................................................................

var XAC = XAC || {};

var JSONPATH = 'things/tpd.json'

XAC.loadJSON(JSONPATH, function(response) {
    XAC.TopyUI.tpdTemplate = JSON.parse(response);
});

XAC.TopyUI = function(jsonPath) {
    this._tpd = jQuery.extend(true, {}, XAC.TopyUI.tpdTemplate)
    this._axes = ['X', 'Y', 'Z'];
    this._fxtrNodes = new Array();
    this._loadNodes = new Array();
    this._loadValues = new Array();

    for (var i = this._axes.length - 1; i >= 0; i--) {
        this._fxtrNodes[this._axes[i]] = [];
        this._loadNodes[this._axes[i]] = [];
        this._loadValues[this._axes[i]] = [];
    }
}

XAC.TopyUI.prototype = {
    constructor: XAC.TopyUI
};

XAC.TopyUI.prototype.setVoxelGrid = function(voxelGrid) {
    this._voxelGrid = voxelGrid;
    this._tpd['NUM_ELEM_X'] = this._voxelGrid._nx;
    this._tpd['NUM_ELEM_Y'] = this._voxelGrid._ny;
    this._tpd['NUM_ELEM_Z'] = this._voxelGrid._nz;
};

XAC.TopyUI.prototype.setLoad = function(indices, value) {
    for (var i = 0; i < indices.length; i++) {

        for (var j = this._axes.length - 1; j >= 0; j--) {
            // if (value[j] == 0)
            //     continue;
            var nodes = this._compactElm2Nodes(indices[i]);
            this._loadNodes[this._axes[j]] = this._loadNodes[this._axes[j]].concat(nodes);
            this._loadValues[this._axes[j]].push(value[j] + '@' + nodes.length);
        }
        // DEBUG
        var voxel = this._voxelGrid._makeVoxel(this._voxelGrid._dim,
            indices[i][0], indices[i][1], indices[i][2], MATERIALHIGHLIGHT, true);
        XAC.scene.add(voxel);
        addAnArrow(voxel.position, new THREE.Vector3().fromArray(value), 15);
    }
};

XAC.TopyUI.prototype.setBoundary = function(indices) {
    for (var i = 0; i < indices.length; i++) {
        for (var j = this._axes.length - 1; j >= 0; j--) {
            var nodes = this._compactElm2Nodes(indices[i]);
            this._fxtrNodes[this._axes[j]] = this._fxtrNodes[this._axes[j]].concat(nodes);

            // DEBUG
            XAC.scene.add(this._voxelGrid._makeVoxel(this._voxelGrid._dim,
                indices[i][0], indices[i][1], indices[i][2], MATERIALNORMAL, true));
        }
    }
};

XAC.TopyUI.prototype.saveTpd = function(name) {
    this._updateTpd();
    log(this._tpd)
    var strTpd = "[ToPy Problem Definition File v2007]\n";

    for (var param in this._tpd) {
        strTpd += param + ":" + this._tpd[param] + "\n";
    }
    // var strTpd = JSON.stringify(this._tpd);
    var blob = new Blob([strTpd], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, name);
};

//
// a more compact way to call elm2nodes
//
XAC.TopyUI.prototype._updateTpd = function() {
    for (var i = this._axes.length - 1; i >= 0; i--) {
        this._tpd['FXTR_NODE_' + this._axes[i]] = this._fxtrNodes[this._axes[i]].stitch(';');
        this._tpd['LOAD_NODE_' + this._axes[i]] = this._loadNodes[this._axes[i]].stitch(';');
        this._tpd['LOAD_VALU_' + this._axes[i]] = this._loadValues[this._axes[i]].stitch(';');
    }

    // this._tpd['ACTV_ELEM'] = stitch(fixedNodes, ';');
    // this._tpd['PASV_ELEM'] = stitch(removedNodes, ';');
};

XAC.TopyUI.prototype._compactElm2Nodes = function(index) {
    var nelx = parseInt(this._tpd['NUM_ELEM_X']);
    var nely = parseInt(this._tpd['NUM_ELEM_Y']);
    var nelz = parseInt(this._tpd['NUM_ELEM_Z']);

    if (isNaN(nelx) || isNaN(nely) || isNaN(nelz)) {
        console.error('check number of elements')
    }

    if (nely > 1) {
        return this._elm2nodes3d(nelx, nely, nelz, index[0] + 1, index[1] + 1, index[2] + 1);
    } else {
        return this._elm2nodes2d(nelx, nelz, index[0] + 1, index[2] + 1);
    }
}

//
//	update a tpd object maintaining information for a global tpd config file
//
// XAC.TopyUI.prototype._updateTpd = function(tpd, ui, value) {
//     for (var i = UIOFPARAMS.length - 1; i >= 0; i--) {
//         if (UIOFPARAMS[i].localeCompare(ui) == 0) {
//             tpd[PARAMSFORUI[i]] = value;
//             break;
//         }
//     }
// }

XAC.TopyUI.prototype._elm2nodes3d = function(nelx, nely, nelz, mpx, mpy, mpz) {
    var innback = [0, 1, nely + 1, nely + 2];
    var enback = nely * (mpx - 1) + mpy;
    var nnback = innback.clone().addScalar(enback + mpx - 1);
    var nnfront = nnback.clone().addScalar((nelx + 1) * (nely + 1));
    var nn = nnfront.concat(nnback).addScalar((mpz - 1) * (nelx + 1) * (nely + 1));
    // log('Node numbers for ' + nelx + 'x' + nely + 'x' + nelz + ' 3D element at position x = ' + mpx + ',' + ' y = ' + mpy + ' and z = ' + mpz + ' :\n' + nn);
    // log('Element number = ' + (enback + nelx * nely * (mpz - 1)));
    // log('Highest node number in domain = ' + ((nelx + 1) * (nely + 1) * (nelz + 1)));
    return nn;
}

XAC.TopyUI.prototype._elm2nodes2d = function(nelx, nely, mpx, mpy) {
    var inn = [0, 1, nely + 1, nely + 2];
    var en = nely * (mpx - 1) + mpy;
    var nn = inn.clone().addScalar(en + mpx - 1);
    return nn;
}
