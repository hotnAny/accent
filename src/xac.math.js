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
