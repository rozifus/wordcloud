

var WordCloud = WordCloud || {};

WordCloud.Data = function (opts) {

    var opts = opts || {};
    var FILE_NAME = opts.fileName || "data.json"

    this.app = opts.app || null;

    this.items = [];
    this.clickBoxes = [];

    var t = this;

    function processData(raw_data) {
        output = []
        for (dI = 0; dI < data.length; dI++) {
            var item = [

            ]
        }
        return output;
    };

    fontSize = 14;
    // The square letter texture will have 16 * 16 = 256 letters, enough for all 8-bit characters.
    var lettersPerSide = 16;

    ////////////////////////////////

    //// MAKE THE SIMPLE CHARACTER MAP ////
    var fontSize2 = 14;
    var lettersPerSide2 = 26;
    var c2 = document.createElement('canvas');
    c2.width = fontSize2 * lettersPerSide2 + fontSize2 * 0.25;
    c2.height = fontSize2 * 1.5;
    var ctx2 = c2.getContext('2d');
    ctx2.font = fontSize+'px Monospace';
    ctx2.fillStyle = '#011101'; // Anti-aliasing only happens with in-canvas background
    ctx2.fillRect(0,0,c2.width,c2.height);
    ctx2.fillStyle = '#0ef20c';
    for (var i=0; i<lettersPerSide2; i++) {
        var ch = String.fromCharCode(i+97);
        //ctx2.fillText(ch, i*fontSize2, fontSize2-fontSize2* yOffset);
        ctx2.fillText(ch, i * fontSize2 + fontSize2 *0.25,fontSize2);
    }
    //document.body.appendChild(c2);
    var tex2 = new THREE.Texture(c2);
    tex2.needsUpdate = true;

    ///////////////////////////////
    var geo = new THREE.Geometry();

    var v3 = function(x,y,z) {
      //return new THREE.Vertex(new THREE.Vector3(x,y,z));
      return new THREE.Vector3(x,y,z);
    };
    var line = 0;
    var i = 0;
    var x=0;
    SCALE_OUT = 200;

    var geo2 = new THREE.Geometry();
    var side = fontSize2 * 0.5;

    // point stuff
    var pointGeo = new THREE.Geometry();
    var pointSprite = THREE.ImageUtils.loadTexture( "globe.png" );

    $(function() {
        //var data = [{'word': 'foo',
                     //'position': [2,3,5]},
                    //{'word': 'b',
                     //'position': [7,11,13]},
                    //{'word': 'c',
                     //'position': [17,19,23]}];
        //var data = [{"position": [-0.919241112627, 0.0765924861696, -0.0263436285316], "word": "tourcoing"}]
        $.getJSON( FILE_NAME , function(data) {
            t.items = data;
            wordvectors = data;
            var item;
            var word_counter = 1;
            var boxMat = new THREE.MeshBasicMaterial({color: 0x0ef20c});
            for (var dI=0; dI<data.length; dI++) {
        //$.each( data, function( index, wordvector ) {
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
                    var boundingbox = 1.0 / lettersPerSide2;
            //geo2.vertices.push(v3(-fontSize2 * 0.5,fontSize2 * 0.5,0));
            //geo2.vertices.push(v3(fontSize2 * 0.5,fontSize2 * 0.5,0));
            //geo2.vertices.push(v3(-fontSize2 * 0.5,-fontSize2 * 0.5,0));
            //geo2.vertices.push(v3(fontSize2 * 0.5,-fontSize2 * 0.5,0));
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
        thirdMaterial = new THREE.MeshBasicMaterial({ map: tex2 });
        bar = new THREE.Mesh(geo2, thirdMaterial);
        bar.material.side = THREE.DoubleSide;
        t.app.scene.add( bar );
        });
    });


    };

