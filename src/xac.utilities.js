// ........................................................................................................
//
//	useful recurring routines v0.0
//
//	xiangchen@acm.org, dec 2016
//
// ........................................................................................................

var XAC = XAC || {};

//
// useful constants
//
XAC.LEFTMOUSE = 1;
XAC.RIGHTMOUSE = 3;
XAC.WHEEL = 4;

//
// simple log
//
function log() {
	for (var i = 0; i < arguments.length; i++) {
		console.log(arguments[i]);
	}
}

//
// longer log
//
function llog() {
	var strLog = "";
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] === 'object') {
			if (Array.isArray(arguments[i])) {
				if (arguments[i].length > 0 && arguments[i][0].length > 0) {
					for (var j = 0; j < arguments[i].length; j++) {
						log(arguments[i][j]);
					}
				} else {
					strLog += arguments[i] + '\n';
				}
			} else {
				for (key in arguments[i]) {
					log(typeof arguments[i][key])
					strLog += key + ': ' + arguments[i][key] + '\n';
				}
			}
		} else {
			strLog += arguments[i] + ' '
		}
	}
	console.log(strLog)
}

//
//
//
function time(desc) {
	var t = new Date().getTime();
	if (XAC.t != undefined && desc != undefined) {
		console.info(desc + ': ' + (t - XAC.t) + ' ms');
	}
	XAC.t = t;
	return t;
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

//	........................................................................................................
//
//	visual debugging routines
//
//	........................................................................................................

// add a ball (for visual debugging)
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

function addAnArrow(v1, dir, len, clr) {
	var flipped = len < 0;

	var rArrow = 0.025 * len;
	var lArrow = len == undefined ? 100 : Math.abs(len);

	var mat = clr == undefined ? MATERIALFOCUS : new THREE.MeshBasicMaterial({
		color: clr,
		transparent: true,
		opacity: 1.0
	});

	var bodyArrow = new XAC.Cylinder(rArrow, lArrow, mat).m;

	var rArrowHead = rArrow * 5;
	var headArrow = new XAC.Cylinder({
		r1: 0,
		r2: rArrowHead
	}, rArrowHead * 2, mat).m;
	headArrow.position.add(new THREE.Vector3(0, 1, 0).multiplyScalar(lArrow * 0.5 + rArrowHead));

	var arrow = new THREE.Object3D();
	arrow.add(bodyArrow);
	arrow.add(headArrow);

	rotateObjTo(arrow, dir.clone().normalize().multiplyScalar(flipped == true ? -1 : 1));
	arrow.position.copy(v1.clone().add(
		dir.clone().normalize().multiplyScalar(lArrow * 0.5 + (flipped == true ?
			rArrowHead * 2 : 0))));

	XAC.scene.add(arrow);
	return arrow;
}

//	........................................................................................................
//
//  extensions for javascript array class
//
//	........................................................................................................

Array.prototype.clone = function() {
	var arr = [];
	for (var i = 0; i < this.length; i++) {
		arr.push(this[i]);
	}
	return arr;
}

Array.prototype.add = function(arr, sign) {
	if (arr == undefined) return;
	sign = sign || 1;
	var len = Math.min(this.length, arr.length);
	for (var i = 0; i < len; i++) {
		this[i] += sign * arr[i];
	}
	return this;
}

Array.prototype.addScalar = function(s) {
	for (var i = 0; i < this.length; i++) {
		this[i] += s;
	}
	return this;
}

Array.prototype.sub = function(arr) {
	return this.add(arr, -1);
}

Array.prototype.times = function(s) {
	for (var i = 0; i < this.length; i++) {
		this[i] *= s;
	}
	return this;
}

Array.prototype.copy = function(arr) {
	this.splice(0, this.length);
	for (var i = 0; i < arr.length; i++) {
		this.push(arr[i]);
	}
}

Array.prototype.remove = function(elm, compFunc) {
	var toRemove = [];
	for (var i = this.length - 1; i >= 0; i--) {
		var equal = undefined;
		if (compFunc != undefined) {
			equal = compFunc(elm, this[i]);
		} else {
			equal = elm == this[i];
		}

		if (equal) {
			toRemove.push(i);
		}
	}

	for (var i = toRemove.length - 1; i >= 0; i--) {
		this.splice(toRemove[i], 1);
	}
}

Array.prototype.removeAt = function(idx) {
	return this.splice(idx, 1);
}

Array.prototype.stitch = function(sep) {
	var str = '';
	for (var i = this.length - 1; i >= 0; i--) {
		str = this[i] + (i < this.length - 1 ? sep : '') + str;
	}
	return str;
}

Array.prototype.dimension = function() {
	var dim = [];
	var arr = this;
	while (arr.length != undefined) {
		dim.push(arr.length);
		arr = arr[0];
	}
	return dim;
}

Array.prototype.equals = function(arr) {
	if (this.length != arr.length) {
		return false;
	}

	for (var i = this.length - 1; i >= 0; i--) {
		if (this[i] != arr[i]) {
			return false;
		}
	}
	return true;
}

Array.prototype.max = function() {
	var maxVal = Number.MIN_VALUE;
	for (var i = this.length - 1; i >= 0; i--) {
		maxVal = Math.max(maxVal, this[i]);
	}
	return maxVal;
}

// similar to numpy's take https://docs.scipy.org/doc/numpy/reference/generated/numpy.take.html
// arrIndex is of this form:
//	[[x1, ..., xn], [y1, ..., yn], ... ], where, e.g.,
// 	[[x1, ..., xn] means along the 1st dim of this array, only consider x1-th, ... xn-th hyper-rows
Array.prototype.take = function(arrIndex) {
	var taken = [];
	for (var i = 0; i < arrIndex[0].length; i++) {
		var idx = arrIndex[0][i];
		if (arrIndex[1] != undefined) {
			taken.push(this[idx].take(arrIndex.slice(1)))
		} else {
			taken.push(this[idx]);
		}
	}
	return taken;
}

Array.prototype.average = function() {
	var sum = 0;
	for (var i = this.length - 1; i >= 0; i--) {
		if (isNaN(this[i])) {
			console.error('[Array.average]: containing not numbers: ' + this[i])
			return;
		}
		sum += this[i];
	}

	return sum / this.length;
}

Array.prototype.std = function() {
	var avg = this.average();

	var sqsum = 0;
	for (var i = this.length - 1; i >= 0; i--) {
		if (isNaN(this[i])) {
			console.error('[Array.std]: input arrays contain not numbers: ' + this[i])
			return;
		}
		sqsum += Math.pow(this[i] - avg, 2);
	}

	return Math.sqrt(sqsum / (this.length - 1));
}

//	........................................................................................................
//
//  i/o related
//
//	........................................................................................................

// based on: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
XAC.loadJSON = function(path, callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function() {
		if (xobj.readyState == 4 && xobj.status == "200") {
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}

//	load models from stl binary/ascii data
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
