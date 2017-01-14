var FORTE = FORTE || {};

FORTE._test = function() {
    log('running test')
    showOrigin(new THREE.Vector3(0, 0, 0));
}

// FORTE._onStlLoaded = function(object) {
    // FORTE.stressAnalysis = new XAC.StressAnalysis(object);
    // XAC.scene.remove(object);

    // testStressAnalysis();
    // XAC.scene.remove(object);
    // FORTE.stressAnalysis._voxelGrid.render();
// }

FORTE._onVxgLoaded = function(voxelGrid) {
    // FORTE._topyUI = new XAC.TopyUI('things/tpd.json');
    // FORTE._topyUI.setVoxelGrid(voxelGrid);
    // FORTE._topyUI.setLoad([
    //     [voxelGrid._nx - 1, 0, XAC.float2int(voxelGrid._nz / 2)]
    // ], [0, -1, 0]);

    // var boundaryVoxels = [];
    // for (var i = 0; i < voxelGrid._nz; i++) {
    //     for (var j = 0; j < voxelGrid._ny; j++) {
    //         boundaryVoxels.push([0, j, i]);
    //     }
    // }
    // FORTE._topyUI.setBoundary(boundaryVoxels)

    FORTE.stressAnalysis = new XAC.StressAnalysis();

    FORTE.stressAnalysis.setVoxelGrid(voxelGrid);

    testStressAnalysis();
}

function testStressAnalysis() {
    // load
    // var margin = 0;
    // FORTE.stressAnalysis.setLoad([
    //     [
    //         FORTE.stressAnalysis._voxelGrid._nx - 1 - margin, margin,
    //         XAC.float2int(FORTE.stressAnalysis._voxelGrid._nz / 2)
    //     ]
    // ], [0, -1, 0]);
    // FORTE._topyUI.setLoad([
    //     [voxelGrid._nx - 1, 0, XAC.float2int(voxelGrid._nz / 2)]
    // ], [0, -1, 0]);

    // boundary
    // var boundaryVoxels = [];
    // for (var i = 0; i < FORTE.stressAnalysis._voxelGrid._nz; i++) {
    //     for (var j = 0; j < FORTE.stressAnalysis._voxelGrid._ny; j++) {
    //         boundaryVoxels.push([0, j, i]);
    //     }
    // }
    // FORTE.stressAnalysis.setBoundary(boundaryVoxels);
    // // FORTE._topyUI.setBoundary(boundaryVoxels)
    //
    // FORTE.stressAnalysis.analyze();
};

function showOrigin(origin) {
    addABall(XAC.scene, origin, 0x000000, 5, 1, 32);
    addAnArrow(origin, new THREE.Vector3(1, 0, 0), 32, 0xff0000);
    addAnArrow(origin, new THREE.Vector3(0, 1, 0), 32, 0x00ff00);
    addAnArrow(origin, new THREE.Vector3(0, 0, 1), 32, 0x0000ff);
}

$(document).on('keydown', function(e) {
    log('key down')
    switch (e.keyCode) {
        case 83: // S
            if (e.ctrlKey) {
                FORTE._topyUI.saveTpd(time() + '.tpd');
            } else if (e.shiftKey) {
                FORTE.stressAnalysis._saveDisp(time() + '.disp');
            } else {
                FORTE.stressAnalysis._voxelGrid.save(time() + '.vxg');
            }
            break;
        case 49: // 1

            break;
    }
});


// var nz = listStress.length;
// var ny = listStress[0].length;
// var nx = listStress[0][0].length;

// for(var i=0; i<nx; i++) {
// 	var str = ''
// 	for(var j=0; j<nz; j++) {
// 		str += listStress[j][0][i].toFixed(3) + '  ';
// 	}
// 	log(str)
// }

// visualizer.visualizeStressInVivo(FORTE.listDisp0, FORTE.stressAnalysis._voxelGrid, FORTE.stressAnalysis._voxelGrid._voxels);
