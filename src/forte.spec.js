// ........................................................................................................
//
//  forte: functional specification on an input mesh
//
//  xiangchen@acm.org, jan 2017
//
// ........................................................................................................

var FORTE = FORTE || {};

FORTE.Spec = function(canvas, scene, camera) {
    this._canvas = canvas;
    this._scene = scene;
    this._camera = camera;

    // input event handlers
    this._canvas.addEventListener('mousedown', this._mousedown.bind(this), false);
    this._canvas.addEventListener('mousemove', this._mousemove.bind(this), false);
    this._canvas.addEventListener('mouseup', this._mouseup.bind(this), false);
};


FORTE.Spec.prototype = {
    constructor: FORTE.Spec
};

FORTE.Spec.prototype._mousedown = function(e) {
    if(e.which != XAC.LEFTMOUSE) {
        return;
    }

    var hitInfo = XAC.getHitInfo(e, [this._object], this._camera);
    if (hitInfo.length > 0) {
        // addABall(this._scene, hitInfo[0].point, 0xffff00, 2, 1);
        this._voxelGrid.map(this._object, [hitInfo[0].face]);
    }
};

FORTE.Spec.prototype._mousemove = function(e) {};

FORTE.Spec.prototype._mouseup = function(e) {};
