var XAC = XAC || {};

XAC._test = function() {


    // var A = XAC.initMDArray([24, 24], 0);
    // var B = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
    // numeric.print(numeric.setBlock(A, [4, 4], [7, 7], B))

}

XAC.onLoaded = function(object) {
    var stressAnalysis = new XAC.StressAnalysis(object);
    // XAC.scene.remove(object);
}

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
