var FORTE = FORTE || {};

FORTE._test = function() {
    // var A = XAC.initMDArray([24, 24], 0);
    // var B = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
    // numeric.print(numeric.setBlock(A, [4, 4], [7, 7], B))
}

FORTE._onStlLoaded = function(object) {
    FORTE.stressAnalysis = new XAC.StressAnalysis(object);
    // XAC.scene.remove(object);
}

FORTE._onVxgLoaded = function(voxelGrid) {
    FORTE._topyUI = new XAC.TopyUI('things/tpd.json');
    FORTE._topyUI.setVoxelGrid(voxelGrid);
    FORTE._topyUI.setLoad([
        [XAC.float2int(voxelGrid._nx / 2), 0, voxelGrid._nz - 1]
    ], [0, -1, 0]);

    var boundaryVoxels = [];
    for (var i = 0; i < voxelGrid._nx; i++) {
        for (var j = 0; j < voxelGrid._ny; j++) {
            boundaryVoxels.push([i, j, 0]);
        }
    }
    FORTE._topyUI.setBoundary(boundaryVoxels)
}

$(document).on('keydown', function(e) {
    log('key down')
    switch (e.keyCode) {
        case 83: // S
            if (e.ctrlKey) {
                FORTE._topyUI.saveTpd(time() + '.tpd');
            } else {
                FORTE.stressAnalysis._voxelGrid.save(time() + '.vxg');
            }
            break;
        case 49: // 1

            break;
    }
});

// this._scene.updateMatrixWorld();
// object.updateMatrixWorld();
// object.geometry.computeFaceNormals();
//
// // init octree
// var octree = new THREE.Octree({
// 	undeferred: false,
// 	depthMax: Infinity,
// 	scene: XAC.scene
// });
//
// octree.add(object, {
// 	useFaces: true
// });
// octree.update();

// helper functions
// var isInThisVoxel = function(p, i, j, k) {
// 	var xmin = this._vmin.x + i * this._dim;
// 	var ymin = this._vmin.y + j * this._dim;
// 	var zmin = this._vmin.z + k * this._dim;
//
// 	return xmin <= p.x && p.x <= xmin + this._dim &&
// 		ymin <= p.y && p.y <= ymin + this._dim &&
// 		zmin <= p.z && p.z <= zmin + this._dim;
// }



// a 3d array where '1' indicates a voxel
// get grid() {
// 	return this._grid;
// },
//
// // size of a voxel
// get dim() {
// 	return this._dim;
// },
//
// // a 1d array of all voxels meshes
// get voxels() {
// 	return this._voxels;
// },
//
// // a look up table for retrieving voxels
// get table() {
// 	return this._table;
// },
//
// // x dimension
// get nx() {
// 	return this._nx;
// },
//
// // y dimension
// get ny() {
// 	return this._ny;
// },
//
// // z dimension
// get nz() {
// 	return this._nz;
// },
//
// // unfiltered raw data of the grid
// get gridRaw() {
// 	return this._gridRaw;
// },
//
// // origin (where to start rendering the grid)
// get origin() {
// 	return this._origin;
// }

// face's bounding box
// var vminFace = new THREE.Vector3(
// 	XAC.min(va.x, vb.x, vc.x),
// 	XAC.min(va.y, vb.y, vc.y),
// 	XAC.min(va.z, vb.z, vc.z)
// );
// var vmaxFace = new THREE.Vector3(
// 	XAC.max(va.x, vb.x, vc.x),
// 	XAC.max(va.y, vb.y, vc.y),
// 	XAC.max(va.z, vb.z, vc.z)
// );

// if ((projCtrVoxel.y - this._dim / 2 > vmaxFace.y ||
// 		projCtrVoxel.y + this._dim / 2 < vminFace.y) &&
// 	(projCtrVoxel.z - this._dim / 2 > vmaxFace.z ||
// 		projCtrVoxel.z + this._dim / 2 < vminFace.z)) {
// 	break;
// }


// fix `lonely diagonals`, i.e.,
//  O_	=>	OO
//  _O		OO
// var numPasses = 2;
//
// while (numPasses-- > 0) {
// 	for (var i = 0; i < this._nz; i++) {
// 		for (var j = 0; j < this._ny; j++) {
// 			for (var k = 0; k < this._nx; k++) {
// 				this._fixLonelyDiag(i, j, k);
// 			}
// 		}
// 	}
//
// 	for (var i = 0; i < this._nz; i++) {
// 		for (var j = 0; j < this._ny; j++) {
// 			for (var k = 0; k < this._nx; k++) {
// 				this._grid[i][j][k] = this._grid[i][j][k] > 0.5 ? 1 : 0;
// 			}
// 		}
// 	}
// }
