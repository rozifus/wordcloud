

var WordCloud = WordCloud || {};

WordCloud.Data = function (opts) {

    var opts = opts || {};
    this.app = opts.app || null;

    var t = this;
    var FILE_NAME = opts.fileName || "data.json"
    var SCALE_OUT = opts.app.config.SCALE_OUT;
    var fontSize = opts.app.config.FONT_SIZE;

    this.items = [];
    this.clickBoxes = [];

    // The square letter texture will have 16 * 16 = 256 letters, enough for all 8-bit characters.

    ////////////////////////////////

    //// MAKE THE SIMPLE CHARACTER MAP ////
    var lettersPerSide = 26;
    var charMap = document.createElement('canvas');
    charMap.width = fontSize * lettersPerSide + fontSize * 0.25;
    charMap.height = fontSize * 1.5;
    var ctx = charMap.getContext('2d');
    ctx.font = fontSize+'px Monospace';
    ctx.fillStyle = '#011101'; // Anti-aliasing only happens with in-canvas background
    ctx.fillRect(0,0,charMap.width,charMap.height);
    ctx.fillStyle = '#0ef20c';
    for (var i=0; i<lettersPerSide; i++) {
        var ch = String.fromCharCode(i+97);
        ctx.fillText(ch, i * fontSize + fontSize *0.25,fontSize);
    }
    var wordTex = new THREE.Texture(charMap);
    wordTex.needsUpdate = true;

    ///////////////////////////////

    var v3 = function(x,y,z) {
      //return new THREE.Vertex(new THREE.Vector3(x,y,z));
      return new THREE.Vector3(x,y,z);
    };
    var line = 0;
    var wordFaceNum = 0;

    var wordGeo = new THREE.Geometry();
    var side = fontSize * 0.5;

    // point stuff
    var pointGeo = new THREE.Geometry();
    var pointSprite = THREE.ImageUtils.loadTexture( "globe_bw.png" );
    var pointMat = new THREE.PointCloudMaterial({ size: 40,
                                                  map: pointSprite,
                                                  transparent: true,
                                                  depthTest: true,
                                                  //blending: THREE.AdditiveBlending
                                                });
    pointMat.color.setHSL( 0.863,0.9,0.9 );

    // box stuff
    var boxMat = new THREE.MeshBasicMaterial( );
    var planeMat = new THREE.MeshBasicMaterial( { color: 0xFF0000, side: THREE.DoubleSide } );

    var pointMode = true;

    this.addWord = function(item) {
        line = item.position[1] * SCALE_OUT;
        wordvec_z = item.position[2] * SCALE_OUT;
        var planeGeo = new THREE.PlaneGeometry((item.word.length/2) * fontSize, side);
        var planeMesh = new THREE.Mesh(planeGeo, planeMat);
        var planePosition = new THREE.Vector3(item.position[0],
                                              item.position[1],
                                              item.position[2]);
        planePosition.multiplyScalar( SCALE_OUT );
        planePosition.setX(planePosition.x + (item.word.length/4) * fontSize)
        planePosition.setY(planePosition.y - (side / 2))
        planeMesh.position.copy(planePosition);
        planeMesh.visible = false;
        planeMesh.meta = { word: item.word }
        this.clickBoxes.push(planeMesh);
        this.app.scene.add(planeMesh);
        for (j=0; j<item.word.length; j++) {
            var code = item.word.charCodeAt(j) - 97;
            var wordvec_x = item.position[0] * SCALE_OUT + j * side;
            var uv_x = code / 26.18 + 0.001;
            var uv_y = 0.175;
            var boundingbox = 1.0 / lettersPerSide;
            wordGeo.vertices.push( v3(wordvec_x, line, wordvec_z) );
            wordGeo.vertices.push( v3(wordvec_x + side, line, wordvec_z) );
            wordGeo.vertices.push( v3(wordvec_x, line - side, wordvec_z) );
            wordGeo.vertices.push( v3(wordvec_x + side, line - side, wordvec_z) );
            var face = new THREE.Face3(wordFaceNum*4+0, wordFaceNum*4+2, wordFaceNum*4+1);
            var face2 = new THREE.Face3(wordFaceNum*4+2, wordFaceNum*4+3, wordFaceNum*4+1);
            wordGeo.faces.push(face);
            wordGeo.faces.push(face2);
            wordGeo.faceVertexUvs[0].push([
              new THREE.Vector2( uv_x, uv_y + 0.75 ),
              new THREE.Vector2( uv_x, uv_y ),
              new THREE.Vector2( uv_x + boundingbox, uv_y + 0.75 )
            ]);
            wordGeo.faceVertexUvs[0].push([
              new THREE.Vector2( uv_x, uv_y ),
              new THREE.Vector2( uv_x + boundingbox, uv_y ),
              new THREE.Vector2( uv_x + boundingbox, uv_y + 0.75)
            ]);
            wordFaceNum++;
        }
    }

    this.addPoint = function(item) {
        var position = new THREE.Vector3(item.position[0],
                                         item.position[1],
                                         item.position[2]);
        position.multiplyScalar( SCALE_OUT );
        pointGeo.vertices.push( position.clone() )

        var boxGeo = new THREE.IcosahedronGeometry( 10, 0 );
        var boxMesh = new THREE.Mesh(boxGeo, boxMat);
        boxMesh.position.copy( position );
        boxMesh.visible = false;
        boxMesh.meta = { word: item.word }
        this.clickBoxes.push(boxMesh);
        this.app.scene.add(boxMesh);
    }

    this.processItems = function() {
        for (var i=0; i<this.items.length; i++) {
            var item = this.items[i];
            if (typeof(item.word) != undefined) {
                this.addWord(item);
                //this.addPoint(item);
            } else {
                this.addPoint(item);
            };
        };
    };

    this.finalize = function() {
        var debugMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        var wordMat = new THREE.MeshBasicMaterial({ map: wordTex });
        var wordMesh = new THREE.Mesh(wordGeo, wordMat);
        wordMesh.material.side = THREE.DoubleSide;
        t.app.scene.add( wordMesh );
        var pointCloud = new THREE.PointCloud(pointGeo, pointMat);
        t.app.scene.add( pointCloud );
        console.log("finalized data loading!")
    };

    $(function() {
        $.getJSON( FILE_NAME , function(data) {
            t.items = data;
            t.processItems()
            t.finalize()
        });
    });
};
