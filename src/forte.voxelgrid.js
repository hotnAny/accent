// ........................................................................................................
//
//	voxel grid v0.1
//	xiangchen@acm.org, dec 2016
//
// ........................................................................................................

var FORTE = FORTE || {};

//
//	scene to render voxel grid on, using origin
//
FORTE.VoxelGrid = function(scene, origin) {
	this._scene = scene;
	this._origin = origin == undefined ? new THREE.Vector3() : origin;

	this._voxels = [];
	this._table = [];

	this._dump = [];

	this._material = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		transparent: true,
		// wireframe: true,
		opacity: 0.25
	});
}

FORTE.VoxelGrid.prototype = {
	constructor: FORTE.VoxelGrid
};

//
// voxelize an object (internally, not just the surface)
//
FORTE.VoxelGrid.prototype.voxelize = function(object, n) {
	var TOSHOWVOXELS = false;
	var NUMDIR = 3;
	var numVoxels = 0;

	// compute voxel grid properties
	var geometry = gettg(object);
	geometry.computeBoundingBox();

	var vmin = geometry.boundingBox.min;
	var vmax = geometry.boundingBox.max;

	this._vmin = new THREE.Vector3(
		Math.min(vmin.x, vmax.x), Math.min(vmin.y, vmax.y), Math.min(vmin.z, vmax.z));
	this._vmax = new THREE.Vector3(
		Math.max(vmin.x, vmax.x), Math.max(vmin.y, vmax.y), Math.max(vmin.z, vmax.z));

	var maxDim = XAC.max(
		this._vmax.x - this._vmin.x, this._vmax.y - this._vmin.y, this._vmax.z - this._vmin.z);

	this._dim = maxDim / n;
	this._nx = XAC.float2int((this._vmax.x - this._vmin.x) / this._dim);
	this._ny = XAC.float2int((this._vmax.y - this._vmin.y) / this._dim);
	this._nz = XAC.float2int((this._vmax.z - this._vmin.z) / this._dim);

	log(this._dim, this._nx, this._ny, this._nz);

	this._grid = XAC.initMDArray([this._nx, this._ny, this._nz], 0);

	for (var i = 0; i < this._nz; i++) {
		for (var j = 0; j < this._ny; j++) {
			for (var k = 0; k < this._nx; k++) {
				var ctrVoxel = new THREE.Vector3(
					(k + 0.5) * this._dim, (j + 0.5) * this._dim, (i + 0.5) * this._dim).add(this._vmin);
				// addABall(XAC.scene, ctrVoxel, 0xff0000, 0.1, 1, 8);

				var counter = XAC.initMDArray([3, 2], 0);
				for (var h = 0; h < geometry.faces.length; h++) {
					var face = geometry.faces[h];
					var va = geometry.vertices[face.a];
					var vb = geometry.vertices[face.b];
					var vc = geometry.vertices[face.c];

					var ctrFace = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

					for (var l = 0; l < NUMDIR; l++) {
						var projCtrVoxel = ctrVoxel.clone();
						var projVa = va.clone();
						var projVb = vb.clone();
						var projVc = vc.clone();

						switch (l) {

							case 0: // ray casting along x axis
								projCtrVoxel.x = 0;
								projVa.x = 0;
								projVb.x = 0;
								projVc.x = 0;

								if (XAC.isInTriangle(projCtrVoxel, projVa, projVb, projVc)) {
									counter[l][ctrVoxel.x < ctrFace.x ? 0 : 1] += 1;
								}
								break;

							case 1: // ray casting along y axis
								projCtrVoxel.y = 0;
								projVa.y = 0;
								projVb.y = 0;
								projVc.y = 0;
								if (XAC.isInTriangle(projCtrVoxel, projVa, projVb, projVc)) {
									counter[l][ctrVoxel.y < ctrFace.y ? 0 : 1] += 1;
								}
								break;

							case 2: // ray casting along z axis
								projCtrVoxel.z = 0;
								projVa.z = 0;
								projVb.z = 0;
								projVc.z = 0;
								if (XAC.isInTriangle(projCtrVoxel, projVa, projVb, projVc)) {
									counter[l][ctrVoxel.z < ctrFace.z ? 0 : 1] += 1;
								}
								break;
						}
					} // end casting directions
				} // end faces

				// check along the three orthogonal axes
				this._grid[i][j][k] = 0;
				var isVoxel = false;
				for (var l = 0; l < NUMDIR; l++) {
					if (counter[l][0] % 2 == 1 && counter[l][1] % 2 == 1) {
						if (TOSHOWVOXELS)
							addABall(XAC.scene, ctrVoxel, 0xff0000, this._dim / 2, 0.5, 8);
						this._grid[i][j][k] = 1;
						numVoxels++;
						isVoxel = true;
						break;
					}
				}
			} // end nz
		} // end ny
	} // end nx

	// debugging
	if (TOSHOWVOXELS)
		this._scene.remove(object)
	log(this._nx, ' x ', this._ny, ' x ', this._nz, ' = ', numVoxels, 'voxels')

	this._gridRaw = this._grid;
}

//
//	load a .vxg file to create a voxel grid with voxel size of dim
//
FORTE.VoxelGrid.prototype.load = function(vxgRaw) {
	this._grid = [];
	this._gridRaw = [];
	// this._dim = dim;

	// read the dimension of each voxel (1st line)
	var idxLine1 = vxgRaw.indexOf('\n');
	this._dim = parseFloat(vxgRaw.slice(0, idxLine1));
	vxgRaw = vxgRaw.slice(idxLine1 + 1);

	this._grid = JSON.parse(vxgRaw)

	this._nz = this._grid.length;
	this._ny = this._grid[0].length;
	this._nx = this._grid[0][0].length;

	return this._grid;
}

//
//	save a voxel grid to text file
//	- 1st line is the size/dimension of each voxel
//	- one line corresponds to one line of voxels
//	- each 2D layer is separated by '\n\n'
//
FORTE.VoxelGrid.prototype.save = function(name) {
	var strGrid = this._dim + '\n';

	for (var i = 0; i < this._nz; i++) {
		for (var j = 0; j < this._ny; j++) {
			for (var k = 0; k < this._nx; k++) {
				strGrid += this._grid[i][j][k] == 1 ? '1' : '0';
				if (k < this._nx - 1)
					strGrid += ','
			}
			strGrid += '\n';
		}
		if (i < this._nz - 1)
			strGrid += '\n'
	}

	var blob = new Blob([strGrid], {
		type: "text/plain;charset=utf-8"
	});
	saveAs(blob, name);
}

FORTE.VoxelGrid.prototype.getBoundingSphereInfo = function() {
	var vRadius = new THREE.Vector3(this._nx, this._ny, this._nz).multiplyScalar(this._dim * 0.5);
	var center = this._origin.clone().add(vRadius);
	return {
		center: center,
		vRadius: vRadius
	};
}

//
//	render voxels
//	(only render voxels on the surface if set hideInside to be true)
//
FORTE.VoxelGrid.prototype.render = function(hideInside) {
	if (this._merged == undefined) {
		for (var i = 0; i < this._nz; i++) {
			this._table[i] = this._table[i] == undefined ? [] : this._table[i];
			for (var j = 0; j < this._ny; j++) {
				this._table[i][j] = this._table[i][j] == undefined ? [] : this._table[i][j];
				for (var k = 0; k < this._nx; k++) {
					// this._grid[i][j][k] = this._grid[i][j][k] > 0.5 ? 1 : 0;
					if (this._grid[i][j][k] == 1 && this._table[i][j][k] == undefined) {
						if (hideInside != true || this._onSurface(i, j, k)) {
							var voxel = this._makeVoxel(this._dim, k, j, i, this._material, true);
							voxel.index = [k, j, i];
							this._scene.add(voxel);
							this._voxels.push(voxel);
							this._table[i][j][k] = voxel;
						}
					} else if (this._grid[i][j][k] != 1 && this._table[i][j][k] != undefined) {
						var voxel = this._table[i][j][k];
						this._scene.remove(voxel);
						XAC.removeFromArray(this._voxels, voxel);
						this._table[i][j][k] = undefined;
					}
				} // x
			} // y
		} // z
		log(this._voxels.length + " voxels added.");
	} else {
		this._scene.remove(this._merged);
	}

	// this._merged = this._mergeVoxels();
	// this._scene.add(this._merged);
}

//
//	render the contour of the voxel grid
//	NOTE: this is a redundant method as _onSurface
//
FORTE.VoxelGrid.prototype.renderContour = function(toMerge) {
	this._gridSurface = [];
	var eps = 0.5

	for (var i = 0; i < this._nz; i++) {
		this._table[i] = this._table[i] == undefined ? [] : this._table[i];
		for (var j = 0; j < this._ny; j++) {
			this._table[i][j] = this._table[i][j] == undefined ? [] : this._table[i][j];
			for (var k = 0; k < this._nx; k++) {
				if (this._grid[i][j][k] == 1 && this._table[i][j][k] == undefined && this._isContour(i, j, k)) {
					var voxel = this._makeVoxel(this._dim, k, j, i, this._material, true);
					voxel.index = [k, j, i];
					if (toMerge == true)
						this._scene.add(voxel);
					this._voxels.push(voxel);
					// a subset of this_grid that is the surface
					this._gridSurface.push({
						voxel: voxel,
						index: [k, j, i],
						min: new THREE.Vector3(k - eps, j - eps, i - eps).multiplyScalar(this._dim),
						max: new THREE.Vector3(k + 1 + eps, j + 1 + eps, i + 1 + eps).multiplyScalar(this._dim)
					});
					this._table[i][j][k] = voxel;
				} else { // if (this._grid[i][j][k] != 1 && this._table[i][j][k] != undefined) {
					var voxel = this._table[i][j][k];
					this._scene.remove(voxel);
					this._voxels.remove(voxel);
					this._table[i][j][k] = undefined;
				}
			} // x
		} // y
	} // z

	// merging all the voxels to speed up display
	if (toMerge) {
		this._merged = this._mergeVoxels();
		// this._scene.add(this._merged);
	}
}

FORTE.VoxelGrid.prototype._mergeVoxels = function() {
	var mergedGeometry = new THREE.Geometry();

	for (var i = 0; i < this._voxels.length; i++) {
		var tg = XAC.getTransformedGeometry(this._voxels[i]);
		var n = mergedGeometry.vertices.length;
		mergedGeometry.vertices = mergedGeometry.vertices.concat(tg.vertices);
		var faces = tg.faces.clone();
		for (var j = 0; j < faces.length; j++) {
			faces[j].a += n;
			faces[j].b += n;
			faces[j].c += n;
		}
		mergedGeometry.faces = mergedGeometry.faces.concat(faces);
		this._scene.remove(this._voxels[i]);
	}

	var mergedVoxelGrid = new THREE.Mesh(mergedGeometry, this._material);
	return mergedVoxelGrid;
}

//
//	hide the voxel grid
//
FORTE.VoxelGrid.prototype.hide = function() {
	for (var i = this._voxels.length - 1; i >= 0; i--) {
		this._scene.remove(this._voxels[i]);
	}
}

//
//	show the voxel grid
//
FORTE.VoxelGrid.prototype.show = function() {
	for (var i = this._voxels.length - 1; i >= 0; i--) {
		this._scene.add(this._voxels[i]);
	}
}

//
//	detecting if a given voxel (i, j, k) is on the surface
//
FORTE.VoxelGrid.prototype._onSurface = function(i, j, k) {
	return i * j * k == 0 || (nz - 1 - i) * (ny - 1 - j) * (nx - 1 - k) == 0 ||
		this._grid[i - 1][j][k] != 1 || this._grid[i + 1][j][k] != 1 ||
		this._grid[i][j - 1][k] != 1 || this._grid[i][j + 1][k] != 1 ||
		this._grid[i][j][k - 1] != 1 || this._grid[i][j][k + 1] != 1;
}

//
//	make a voxel
//	(if noMargin is set, keep them right next to each other)
//
FORTE.VoxelGrid.prototype._makeVoxel = function(dim, i, j, k, mat, noMargin) {
	var geometry = new THREE.BoxGeometry(dim, dim, dim);
	var voxel = new THREE.Mesh(geometry, mat.clone());

	// leave some margin between voxels
	if (noMargin) {} else {
		dim += 1
	}

	voxel.position.set(i * dim, j * dim, k * dim);

	if (this._origin != undefined) {
		voxel.position.copy(this._origin.clone().add(voxel.position))
	}

	this._dump.push(voxel);

	return voxel;
}

//
//	use spherical rather than square voxels
//
FORTE.VoxelGrid.prototype._addSphericalVoxels = function(v, radius) {
	var vxg = this._grid;

	var zmin = XAC.float2int((v.z - radius) / this._dim),
		zmax = XAC.float2int((v.z + radius) / this._dim),
		ymin = XAC.float2int((v.y - radius) / this._dim),
		ymax = XAC.float2int((v.y + radius) / this._dim),
		xmin = XAC.float2int((v.x - radius) / this._dim),
		xmax = XAC.float2int((v.x + radius) / this._dim);
	for (var z = zmin; z < zmax; z++) {
		vxg[z] = vxg[z] == undefined ? [] : vxg[z];
		for (var y = ymin; y < ymax; y++) {
			vxg[z][y] = vxg[z][y] == undefined ? [] : vxg[z][y];
			for (var x = xmin; x < xmax; x++) {
				var v0 = new THREE.Vector3(x, y, z).multiplyScalar(this._dim);
				if (v0.distanceTo(v) <= radius) {
					vxg[z][y][x] = 1;
				}
			}
		}
	}
};

//
//	clear all the voxels
//
FORTE.VoxelGrid.prototype.clear = function() {
	for (var i = 0; i < this._dump.length; i++) {
		this._scene.remove(this._dump[i]);
	}
	this._dump = [];
}

//
//	save the voxel grid as an stl
//
FORTE.VoxelGrid.prototype.saveAs = function(fname) {
	if (this._merged == undefined) {
		this.render();
	}

	var stlStr = stlFromGeometry(this._merged.geometry);
	var blob = new Blob([stlStr], {
		type: 'text/plain'
	});

	saveAs(blob, fname);
}

FORTE.VoxelGrid.prototype._isContour = function(z, y, x) {
	if (x == 0 || x == this._nx - 1 || y == 0 || y == this._ny - 1 || z == 0 || z == this._nz - 1) {
		if (this._grid[z][y][x] == 1) {
			return true;
		}
	}
	var neighbors = [
		[-1, 0, 0],
		[1, 0, 0],
		[0, -1, 0],
		[0, 1, 0],
		[0, 0, -1],
		[0, 0, 1]
	];

	for (var i = 0; i < neighbors.length; i++) {
		var dx = neighbors[i][0];
		var dy = neighbors[i][1];
		var dz = neighbors[i][2];
		xx = XAC.clamp(x + dx, 0, this._nx - 1);
		yy = XAC.clamp(y + dy, 0, this._ny - 1);
		zz = XAC.clamp(z + dz, 0, this._nz - 1);

		if (this._grid[zz][yy][xx] != 1) {
			return true;
		}
	}

	return false;
}

//
//	map an object's mesh to voxels
//
FORTE.VoxelGrid.prototype.map = function(object, faces) {
	var gridSurface = this._gridSurface.clone();

	object.geometry.computeBoundingBox();
	var vmin = object.geometry.boundingBox.min;


	for (var i = 0; i < faces; i++) {
		var face = object.geometry.faces[i];
		face.voxels = face.voxels || [];

		if(face.normal == undefined) {
			object.geometry.computeFaceNormals();
		}

		var va = object.geometry.vertices[face.a];
		var vb = object.geometry.vertices[face.b];
		var vc = object.geometry.vertices[face.c];

		va = va.clone().sub(vmin);
		vb = vb.clone().sub(vmin);
		vc = vc.clone().sub(vmin);

		// NOTE: DEBUG
		// face.center = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
		// console.log(face.normal)

		for (var j = 0; j < gridSurface.length; j++) {
			// if (gridSurface[j] == undefined) {
			// 	continue;
			// }

			if (XAC.testTriBoxIntersection(va, vb, vc, face.normal, gridSurface[j])) {
				// this._scene.add(gridSurface[j].voxel);
				face.voxels.push(gridSurface[j].index);
				// gridSurface[j] = undefined;
			}
		}
	}

	// NOTE: DEBUG
	// var cnt = 0;
	// for (var i = 0; i < object.geometry.faces.length; i++) {
	// 	var face = object.geometry.faces[i];
	// 	if (face.voxels.length == 0) {
	// 		cnt += 1;
	// 		// addABall(this._scene, face.center, 0xff0000, 2, 1)
	// 		addAnArrow(face.center, face.normal, 5, 0xf0ff0f)
	// 			// log(face.normal)
	// 	}
	// }
	// log(cnt, '/', object.geometry.faces.length)
	// this._scene.remove(object);
	// this._scene.add(this._merged);
}

//
//	fix lonely diagonal elements (see where this method is called)
//
// FORTE.VoxelGrid.prototype._fixLonelyDiag = function(z, y, x) {
// 	var diagNeighbors = [
// 		[-1, 1, 0],
// 		[1, 1, 0]
// 	];
//
// 	for (var i = 0; i < diagNeighbors.length; i++) {
// 		var dx = diagNeighbors[i][0];
// 		var dy = diagNeighbors[i][1];
// 		var dz = diagNeighbors[i][2];
// 		xx = XAC.clamp(x + dx, 0, this._nx - 1);
// 		yy = XAC.clamp(y + dy, 0, this._ny - 1);
// 		zz = XAC.clamp(z + dz, 0, this._nz - 1);
//
// 		if (this._grid[zz][yy][xx] == 1) {
// 			var neighbors = [
// 				[dx, 0, 0],
// 				[0, dy, 0]
// 			]
//
// 			for (var j = 0; j < neighbors.length; j++) {
// 				xx = XAC.clamp(x + neighbors[j][0], 0, this._nx - 1);
// 				yy = XAC.clamp(y + neighbors[j][1], 0, this._ny - 1);
// 				zz = XAC.clamp(z + neighbors[j][2], 0, this._nz - 1);
// 				this._grid[zz][yy][xx] = 0.99;
// 			}
// 		}
// 	}
// }
