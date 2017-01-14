// ........................................................................................................
//
//	ui logic (event handlers, etc.), based on jquery
//
//	by xiang 'anthony' chen, xiangchen@acm.org
//
// ........................................................................................................

var XAC = XAC || {};

// $(document.body).append(panel);

var initPanel = function() {
	$(document).on('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		e.dataTransfer.dropEffect = 'copy';
	});

	$(document).on('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		var files = e.dataTransfer.files;

		for (var i = files.length - 1; i >= 0; i--) {
			var reader = new FileReader();
			if (files[i].name.endsWith('stl')) {
				reader.onload = (function(e) {
					XAC.loadStl(e.target.result, function(object){
						FORTE.spec = FORTE.spec || new FORTE.Spec(XAC.renderer.domElement, XAC.scene, XAC.camera);
						FORTE.spec._object = object;
						// if(FORTE.voxelGrid != undefined) {
						// 	FORTE.voxelGrid.map(FORTE.spec._object);
						// }
					});
				});
			}
			// visualizing voxel grid
			else if (files[i].name.endsWith('vxg')) {
				reader.onload = (function(e) {
					FORTE.spec = FORTE.spec || new FORTE.Spec(XAC.renderer.domElement, XAC.scene, XAC.camera);
					FORTE.spec._voxelGrid = new FORTE.VoxelGrid(XAC.scene);
					FORTE.spec._voxelGrid.load(e.target.result);
					time();
					FORTE.spec._voxelGrid.renderContour(true);
					time('rendered voxels ...');
					// if(FORTE.spec != undefined) {
					// 	FORTE.voxelGrid.map(FORTE.spec._object);
					// }

					// optimize camera position
					// var boundingSphereInfo = voxelGrid.getBoundingSphereInfo();
					// var r = boundingSphereInfo.vRadius.length();
					// XAC.camera.position.copy(XAC.posCam.clone().normalize().multiplyScalar(r * 2));
					// XAC.mouseCtrls = new THREE.TrackballControls(XAC.camera, undefined, boundingSphereInfo.center);

				});
			}
			// visualize displacements from stress analysis
			else if (files[i].name.endsWith('disp')) {
				reader.onload = (function(e) {
					FORTE.listDisp0 = e.target.result;

					var visualizer = new FORTE.Visualizer(XAC.scene);
					visualizer.visualizeDisplacement(FORTE.listDisp0, FORTE.stressAnalysis._voxelGrid);
				});
			}
			// visualize stress from stress analysis
			else if (files[i].name.endsWith('strs')) {
				reader.onload = (function(e) {
					var listStress = JSON.parse(e.target.result);
					var visualizer = new FORTE.Visualizer(XAC.scene);
					visualizer.visualizeStress(listStress,
						FORTE.stressAnalysis._voxelGrid,
						FORTE.stressAnalysis._voxelGrid._voxels);

				});
			}

			reader.readAsBinaryString(files[i]);
		}

	});
}

initPanel();
