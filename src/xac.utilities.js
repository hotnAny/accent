/*------------------------------------------------------------------------------------*
 *
 * useful recurring routines v0.0
 *
 * xiangchen@acm.org, dec 2016
 *
 *------------------------------------------------------------------------------------*/

var XAC = XAC || {};

function log() {
	var strLog = "";
	for (var i = 0; i < arguments.length; i++) {
		strLog += arguments[i] + ' '
	}
	console.log(strLog)
	// console.log(arguments);
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
XAC.loadStl = function(data, onLoaded) {
	var stlLoader = new THREE.STLLoader();
	var geometry = stlLoader.parse(data);

	if (geometry instanceof THREE.BufferGeometry) {
		geometry = new THREE.Geometry().fromBufferGeometry(geometry);
	}

	var object = new THREE.Mesh(geometry, MATERIALNORMAL);
	XAC.scene.add(object);

	var dims = getBoundingBoxDimensions(object);
	var ctr = getBoundingBoxCenter(object);

	// reposition the ground & grid
	XAC.ground.position.y -= dims[1] * 0.55;

	XAC.scene.remove(XAC.grid);
	XAC.grid = XAC.drawGrid(dims[1] * 0.55);
	XAC.scene.add(XAC.grid);

	object.geometry.center();

	// relocate the camera
	var r = Math.max(25, getBoundingSphereRadius(object));
	XAC.camera.position.copy(XAC.posCam.clone().normalize().multiplyScalar(r * 2));

	// re-lookAt for the camera
	XAC.mouseCtrls.target = new THREE.Vector3(0, 0, 0);

	// store the object
	XAC.objects.push(object);

	if (onLoaded != undefined) {
		onLoaded(object);
	}
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

//
//	float to int conversion
//
XAC.float2int = function(value) {
	return value | 0;
}

//
//	add a ball (for visual debugging)
//
function addABall(scene, pt, clr, radius, opacity, fn) {
	scene = scene == undefined ? XAC.scene : scene;
	clr = clr == undefined ? 0xff0000 : clr;
	radius = radius == undefined ? 1 : radius;
	opacity = opacity == undefined ? 1 : opacity;
	fn = fn == undefined ? 32 : fn;

	var geometry = new THREE.SphereGeometry(radius, fn, fn);
	var material = new THREE.MeshBasicMaterial({
		color: clr,
		transparent: true,
		opacity: opacity
	});
	var ball = new THREE.Mesh(geometry, material);
	ball.position.set(pt.x, pt.y, pt.z);

	scene.add(ball);

	return ball;
}
