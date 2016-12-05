/*------------------------------------------------------------------------------------*
 *
 * useful recurring routines
 *
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

var XAC = XAC || {};

function log(msg) {
	console.log(msg);
}

function time(desc) {
	var t = new Date().getTime();
	if (XAC.t != undefined && desc != undefined) {
		console.info(desc + ': ' + (t - XAC.t) + ' ms');
	}
	XAC.t = t;
}

//
//	load models from stl binary/ascii data
//
XAC.loadStl = function(data) {
	var stlLoader = new THREE.STLLoader();
	var geometry = stlLoader.parse(data);
	var object = new THREE.Mesh(geometry, MATERIALNORMAL);
	XAC.scene.add(object);

	var dims = getBoundingBoxDimensions(object);
	var ctr = getBoundingBoxCenter(object);

	// reposition the ground & grid
	XAC.ground.position.y -= dims[1] * 0.55;

	XAC.scene.remove(XAC.grid);
	XAC.grid = XAC.drawGrid(dims[1] * 0.55);
	XAC.scene.add(XAC.grid);

	// relocate the camera
	var r = Math.max(25, getBoundingSphereRadius(object));
	XAC.camera.position.copy(XAC.posCam.clone().normalize().multiplyScalar(r * 2));

	// re-lookAt for the camera
	XAC.mouseCtrls.target = new THREE.Vector3(0, 0, 0);

	// store the object
	objects.push(object);

}

//
//	create a multi-dimensional array specified by <dims> with <val>
//
XAC.initMDArray = function(dims, val) {
	if (dims.length == 1) {
		return new Array(dims[0]).fill(val);
	}

	var array = [];
	for (var i = 0; i < dims[0]; i++) {
		array.push(XAC.initMDArray(dims.slice(1), val));
	}
	return array;
}
