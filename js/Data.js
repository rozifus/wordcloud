

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
    var tex = new THREE.Texture(charMap);
    tex.needsUpdate = true;

    ///////////////////////////////
    var geo = new THREE.Geometry();

    var v3 = function(x,y,z) {
      //return new THREE.Vertex(new THREE.Vector3(x,y,z));
      return new THREE.Vector3(x,y,z);
    };
    var line = 0;
    var i = 0;
    var x=0;

    var geo2 = new THREE.Geometry();
    var side = fontSize * 0.5;

    // point stuff
    var pointGeo = new THREE.Geometry();
    var pointSprite = THREE.ImageUtils.loadTexture( "globe.png" );

    var boxMat = new THREE.MeshBasicMaterial({color: 0x0ef20c});

    var pointMode = true;

    $(function() {
        $.getJSON( FILE_NAME , function(data) {
            t.items = data;
            var item;
            for (var dI=0; dI<data.length; dI++) {
                var item = data[dI];
                line = item.position[1] * SCALE_OUT;
                wordvec_z = item.position[2] * SCALE_OUT;
                var boxGeo = new THREE.CubeGeometry(item.word.length/2 * fontSize, side, 0.1);
                var boxMesh = new THREE.Mesh(boxGeo, boxMat);
                var boxPosition = new THREE.Vector3(item.position[0],
                                                    item.position[1],
                                                    item.position[2]);
                boxPosition.multiplyScalar( SCALE_OUT );
                boxPosition.setX(boxPosition.x + (boxGeo.width / 2))
                boxPosition.setY(boxPosition.y - (side / 2))
                boxMesh.position = boxPosition;
                boxMesh.visible = false;
                boxMesh.meta = { word: item.word }
                t.clickBoxes.push(boxMesh);
                t.app.scene.add(boxMesh);
                for (j=0; j<item.word.length; j++) {
                    var code = item.word.charCodeAt(j) - 97;
                    var wordvec_x = item.position[0] * SCALE_OUT + j * side;
                    //console.log(wordvec_x);
                    // out-of-bound error handle goes here
                    var uv_x = code / 26.18 + 0.001;
                    var uv_y = 0.175;
                    var boundingbox = 1.0 / lettersPerSide;
            //geo2.vertices.push(v3(-fontSize * 0.5,fontSize * 0.5,0));
            //geo2.vertices.push(v3(fontSize * 0.5,fontSize * 0.5,0));
            //geo2.vertices.push(v3(-fontSize * 0.5,-fontSize * 0.5,0));
            //geo2.vertices.push(v3(fontSize * 0.5,-fontSize * 0.5,0));
                    /////////////////////////////////////////////////////
                    //geo2.vertices.push(
                      //v3( (wordvec_x, line, wordvec_z) ),
                      //v3( (wordvec_x + side, line, wordvec_z) ),
                      //v3( (wordvec_x, line - side, wordvec_z) ),
                      //v3( (wordvec_x + side, line - side, wordvec_z) )
                    //);
                    // ^^^ The above is mysteriously broken ^^^ //
                    geo2.vertices.push( v3(wordvec_x, line, wordvec_z) );
                    geo2.vertices.push( v3(wordvec_x + side, line, wordvec_z) );
                    geo2.vertices.push( v3(wordvec_x, line - side, wordvec_z) );
                    geo2.vertices.push( v3(wordvec_x + side, line - side, wordvec_z) );
                    //console.log("side len: " + side + "  j: " + j);
                    //console.log("x: " + wordvec_x + " y:" + line + " z:" + wordvec_z);
                    var face = new THREE.Face3(i*4+0, i*4+2, i*4+1);
                    var face2 = new THREE.Face3(i*4+2, i*4+3, i*4+1);
                    geo2.faces.push(face);
                    geo2.faces.push(face2);
                    geo2.faceVertexUvs[0].push([
                      new THREE.Vector2( uv_x, uv_y + 0.75 ),
                      new THREE.Vector2( uv_x, uv_y ),
                      new THREE.Vector2( uv_x + boundingbox, uv_y + 0.75 )
                    ]);
                    geo2.faceVertexUvs[0].push([
                      new THREE.Vector2( uv_x, uv_y ),
                      new THREE.Vector2( uv_x + boundingbox, uv_y ),
                      new THREE.Vector2( uv_x + boundingbox, uv_y + 0.75)
                    ]);
                    i++;
                }
            }
        //
        simpleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        thirdMaterial = new THREE.MeshBasicMaterial({ map: tex });
        bar = new THREE.Mesh(geo2, thirdMaterial);
        bar.material.side = THREE.DoubleSide;
        t.app.scene.add( bar );
        });
    });


    };

