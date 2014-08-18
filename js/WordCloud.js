

var wc = wc || {};

WordCloud.WordCloud = function (opts) {

    var opts = opts || {};

    this.document = opts.document || document;
    this.container = opts.container ? document.getElementById(opts.container) : document.body;

    this.width = opts.width || window.innerWidth;
    this.height = opts.height || window.innerHeight;

    this.running = false;

    this.data = new WordCloud.Data({app: this, fileName: "sunday.json"});
    this.keyboard = new THREEx.KeyboardState();
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.delta = {value: 0.0};
    this.renderer = null;
    if ( Detector.webgl )
        this.renderer = new THREE.WebGLRenderer( {antialias:true} );
    else
        this.renderer = new THREE.CanvasRenderer();
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild( this.renderer.domElement );

    var VIEW_ANGLE = 45, ASPECT = this.width / this.height, NEAR = 0.1, FAR = 20000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.controls = new WordCloud.Controls({ app: this });
    this.scene.add(this.camera);
    this.camera.position.set(0,150,400);
    this.camera.lookAt(this.scene.position);

    THREEx.WindowResize(this.renderer, this.camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.bottom = '0px';
    this.stats.domElement.style.zIndex = 100;
    this.container.appendChild( this.stats.domElement );

};

WordCloud.WordCloud.prototype.frame = function() {
    this.renderer.render(this.scene, this.camera);
    this.delta.value = this.clock.getDelta();
    this.controls.update();
    this.stats.update();
}

WordCloud.WordCloud.prototype.start = function() {

    var t = this;

    t.running = true;

    function raf() {
        if (t.running) {
            requestAnimationFrame(raf);
            t.frame();
        }
    }

    raf();
}

WordCloud.WordCloud.prototype.stop = function () {

    this.running = false;
}
