// .................................................................
//
//  math library v0.0
//  xiangchen@acm.org, dec 2016
//
// .................................................................

//
//  extensions for numeric.js
//

// compute the Frobenius norm of a matrix
numeric.fnorm = function(matrix) {
    var sum = 0;
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            sum += Math.pow(matrix[i][j], 2);
        }
    }
    return Math.sqrt(sum);
}

// print a matrix
numeric.print = function(matrix) {
    var strMatrix = ""
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            strMatrix += parseFloat(matrix[i][j]).toFixed(4) + ' ';
        }
        strMatrix += '\n'
            // strMatrix += matrix[i] + '\n';
    }
    console.log(strMatrix);
}

// times a matrix (including vector) by a scalar
numeric.times = function(matrix, scalar) {
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            matrix[i][j] *= scalar;
        }
    }
    return matrix;
}

numeric.fromBlocks = function(blocks) {
    var dim = numeric.dim(blocks).slice(0, 2);
    var dimBlock = numeric.dim(blocks[0][0]).slice(0, 2);
    var x = XAC.initMDArray([dim[0] * dimBlock[0], dim[1] * dimBlock[1]], 0);
    for (var i = 0; i < dim[0]; i++) {
        for (var j = 0; j < dim[1]; j++) {
            var from = [i * dimBlock[0], j * dimBlock[1]];
            var to = [from[0] + dimBlock[0] - 1, from[1] + dimBlock[1] - 1];
            x = numeric.setBlock(x, from, to, blocks[i][j]);
        }
    }
    // numeric.print(x)
    return x;
}

//
//  other math-related useful functions
//

//
//  testing whether a triangle and a box intersect in 3D space,
//	based on saparating axis theorem
//	ref: http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/pubs/tribox.pdf
//
XAC.testTriBoxIntersection = function(va, vb, vc, nml, bbox) {

    var minmax;

    /* test the 3 box normals */
    var boxNormals = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
    var boxMin = [bbox.min.x, bbox.min.y, bbox.min.z];
    var boxMax = [bbox.max.x, bbox.max.y, bbox.max.z];

    for (var i = 0; i < 3; i++) {
        minmax = project([va, vb, vc], boxNormals[i]);
        if (minmax[1] < boxMin[i] || minmax[0] > boxMax[i]) {
            return false;
        }
    }


    /* test the 1 triangle normal */
    var boxVertices = new Array();
    var xs = [bbox.min.x, bbox.max.x];
    var ys = [bbox.min.y, bbox.max.y];
    var zs = [bbox.min.z, bbox.max.z];

    for (var ix = 0; ix < 2; ix++) {
        for (var iy = 0; iy < 2; iy++) {
            for (var iz = 0; iz < 2; iz++) {
                boxVertices.push(new THREE.Vector3(xs[ix], ys[iy], zs[iz]));
            }
        }
    }

    var triOffset = nml.dot(va);
    minmax = project(boxVertices, nml);
    if (minmax[1] < triOffset || minmax[0] > triOffset) {
        return false;
    }


    /* test the 9 edge cross products */
    var triEdges = [new THREE.Vector3().subVectors(va, vb),
        new THREE.Vector3().subVectors(vb, vc),
        new THREE.Vector3().subVectors(vc, va)
    ];

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var axis = new THREE.Vector3().crossVectors(triEdges[i], boxNormals[j]);
            var boxMinmax = project(boxVertices, axis);
            var triMinmax = project([va, vb, vc], axis);
            if (boxMinmax[1] < triMinmax[0] || boxMinmax[0] > triMinmax[1]) {
                return false;
            }
        }
    }

    return true;
}

//
//  get the max amongst all the input vars
//
XAC.max = function() {
    var maxVal = Number.MIN_VALUE;
    for (var i = 0; i < arguments.length; i++) {
        maxVal = Math.max(maxVal, arguments[i]);
    }
    return maxVal;
}

XAC.min = function() {
    var minVal = Number.MAX_VALUE;
    for (var i = 0; i < arguments.length; i++) {
        minVal = Math.min(minVal, arguments[i]);
    }
    return minVal;
}

//
//  whether p1 and p2 are on the same side of the segment ab
//
XAC.onSameSide = function(p1, p2, a, b) {
    var ab = b.clone().sub(a);
    var cp1 = ab.clone().cross(p1.clone().sub(a));
    var cp2 = ab.cross(p2.clone().sub(a));

    var isSameSide = false;
    // if at least one point is not on ab
    if(cp1.length() != 0 || cp2.length != 0)
         isSameSide = cp1.dot(cp2) > 0;
    // if both points are on ab
    else
        isSameSide = true;

    return isSameSide;
}

//
//  whether v is in a triangle defined by va, vb and vc
//
XAC.isInTriangle = function(v, va, vb, vc) {
    return XAC.onSameSide(v, va, vb, vc) &&
        XAC.onSameSide(v, vb, va, vc) &&
        XAC.onSameSide(v, vc, va, vb);
}

//
//  force an input val to be between vmin and vmax
//
XAC.clamp = function(val, vmin, vmax) {
	if(vmin > vmax) {
		var vtmp = vmin;
		vmin = vmax;
		vmax = vtmp;
	}
	val = Math.max(vmin, val);
	val = Math.min(val, vmax);
	return val;
}
