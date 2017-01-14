// ........................................................................................................
//
//  forte: functional specification on an input mesh
//
//  xiangchen@acm.org, jan 2016
//
// ........................................................................................................

var FORTE = FORTE || {};

FORTE.Spec = function(canvas, scene, object) {
    this._canvas = canvas;
    this._scene = scene;
    this._object = object;

    // input event handlers
    this._canvas.addEventListener('mousedown', this._mousedown.bind(this), false);
    this._canvas.addEventListener('mousemove', this._mousemove.bind(this), false);
    this._canvas.addEventListener('mouseup', this._mouseup.bind(this), false);
};


FORTE.Spec.prototype = {
    constructor: FORTE.Spec
};

FORTE.Spec.prototype._mousedown = function(e) {
};

FORTE.Spec.prototype._mousemove = function(e) {
};

FORTE.Spec.prototype._mouseup = function(e) {
};
