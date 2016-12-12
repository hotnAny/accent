/*------------------------------------------------------------------------------------*
 *
 * ui logic (event handlers, etc.), based on jquery
 *
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

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
					XAC.loadStl(e.target.result, FORTE._onStlLoaded);
				});
			} else if (files[i].name.endsWith('vxg')) {
				reader.onload = (function(e) {
					var voxelGrid = new FORTE.VoxelGrid(XAC.scene);
					voxelGrid.load(e.target.result, 2);
					voxelGrid.renderContour();

					var boundingSphereInfo = voxelGrid.getBoundingSphereInfo();
					var r = boundingSphereInfo.vRadius.length();
					XAC.camera.position.copy(XAC.posCam.clone().normalize().multiplyScalar(r * 2));
					XAC.mouseCtrls = new THREE.TrackballControls(XAC.camera, undefined, boundingSphereInfo.center);


					FORTE._onVxgLoaded(voxelGrid);
				});
			}
			reader.readAsBinaryString(files[i]);
		}

	});
}

initPanel();
