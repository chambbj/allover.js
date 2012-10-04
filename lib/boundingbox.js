// Adapted from http://archive.cyark.org/3d/js/3dviewer-boundingbox-new.js
var Pointspace = Pointspace || {};
Pointspace.boundingbox = {};

(function(container, scene, camera, boundingbox) {

  var SEGMENTS = 20;
  var RINGS = 20;
  var BALL_RADIUS = 5;
  var uniforms = {
      amplitude: { type: "f", value: 1.0 },
      color:   { type: "c", value: new THREE.Color( 0xffffff ) },
      xClippingPlaneMax: { type: "f", value: 99999 },
      xClippingPlaneMin: { type: "f", value: -99999 },
      yClippingPlaneMax: { type: "f", value: 99999 },
      yClippingPlaneMin: { type: "f", value: -99999 },
      zClippingPlaneMax: { type: "f", value: 99999 },
      zClippingPlaneMin: { type: "f", value: -99999 },
      xCenter: { type: "f", value: 0 },
      yCenter: { type: "f", value: 0 },
      zCenter: { type: "f", value: 0 },
      rotation: { type: "f", value: 0 }
  };
  var uniformsmesh = {
      amplitude: { type: "f", value: 1.0 },
      color:   { type: "c", value: new THREE.Color( 0xffffff ) },
      xClippingPlaneMax: { type: "f", value: 99999 },
      xClippingPlaneMin: { type: "f", value: -99999 },
      yClippingPlaneMax: { type: "f", value: 99999 },
      yClippingPlaneMin: { type: "f", value: -99999 },
      zClippingPlaneMax: { type: "f", value: 99999 },
      zClippingPlaneMin: { type: "f", value: -99999 },
      xCenter: { type: "f", value: 0 },
      yCenter: { type: "f", value: 0 },
      zCenter: { type: "f", value: 0 },
      rotation: { type: "f", value: 0 }
  };

  function round(i){
    return Math.round(i*100)/100;
  }

  this.init = function(container, scene, camera, boundingbox){

    this.original_bounding_box = boundingbox;
    this.center = this.getOriginalCenter();
    this.width = this.getOriginalWidth();
    this.rotation = 0;
    this.scene = scene;
    this.camera = camera;

    this.boundbox_holder = new THREE.Object3D();
    this.scene.add(this.boundbox_holder);

    var boudingboxmaterial = new THREE.MeshBasicMaterial( {
      color: 0x00ff00,
      wireframe: true
    });
    this.mesh = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), boudingboxmaterial );
    this.boundbox_holder.add( boundingbox );

    var boundingboxSphereMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
    var boundingboxSphereMaterialRed = new THREE.MeshLambertMaterial({color: 0xff0000});

    this.balls = {
      up: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterial),
      down: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterial),
      left: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterial),
      right: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterial),
      front: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterial),
      back: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterial),
      rotate: new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, SEGMENTS, RINGS), boundingboxSphereMaterialRed)
    };
    this.rotation_circle = new THREE.Mesh(new THREE.TorusGeometry(100,/*ring size*/0.2,10,100,10), boundingboxSphereMaterialRed);
    this.rotation_circle.rotation.x = Math.PI/2;//put it up level with the ground

    for (var key in this.balls) {
      this.boundbox_holder.add(this.balls[key]);
      this.balls[key].name = key;
    }

    this.boundbox_holder.add(this.boundbox_holder.add(this.rotation_circle));
    this.initialized = true;

  };

  this.getOriginalCenter = function() {
    return this.getCenter(this.original_bounding_box);
  };

  this.getOriginalWidth = function() {
    return this.getWidth(this.original_bounding_box);
  };

  this.getCenter = function(bbox) {
    return {
      x: (bbox.min.x + bbox.max.x) / 2,
      y: (bbox.min.y + bbox.max.y) / 2,
      z: (bbox.min.z + bbox.max.z) / 2
    };
  };

  this.getWidth = function(bbox) {
    return {
      x: bbox.max.x - bbox.min.x,
      y: bbox.max.y - bbox.min.y,
      z: bbox.max.z - bbox.min.z
    };
  };

  this.render = function() {

    this.mesh.position.x = this.center.x;
    this.mesh.position.y = this.center.y;
    this.mesh.position.z = this.center.z;

    this.mesh.scale.x = this.width.x;
    this.mesh.scale.y = this.width.y;
    this.mesh.scale.z = this.width.z;

    //place the balls
    this.balls.up.position.x = this.center.x;
    this.balls.up.position.y = this.center.y-this.width.y/2 - BALL_RADIUS/2 ;
    this.balls.up.position.z = this.center.z;

    this.balls.down.position.x = this.center.x;
    this.balls.down.position.y = this.center.y+this.width.y/2 + BALL_RADIUS/2 ;
    this.balls.down.position.z = this.center.z;

    this.balls.right.position.x = this.center.x+this.width.x/2 + BALL_RADIUS/2 ;
    this.balls.right.position.y = this.center.y;
    this.balls.right.position.z = this.center.z;

    this.balls.left.position.x = this.center.x-this.width.x/2 - BALL_RADIUS/2 ;
    this.balls.left.position.y = this.center.y;
    this.balls.left.position.z = this.center.z;

    this.balls.front.position.x = this.center.x;
    this.balls.front.position.y = this.center.y;
    this.balls.front.position.z = this.center.z+this.width.z/2 + BALL_RADIUS/2 ;

    this.balls.back.position.x = this.center.x;
    this.balls.back.position.y = this.center.y;
    this.balls.back.position.z = this.center.z-this.width.z/2 - BALL_RADIUS/2 ;

    //adjust the location of the rotation circle
    this.rotation_circle.position.x = this.center.x;
    this.rotation_circle.position.y = this.center.y;
    this.rotation_circle.position.z = this.center.z;

    var diameter = Math.sqrt((this.width.x)*(this.width.x) + (this.width.z)*(this.width.z));
    this.rotation_circle.scale.x = diameter/200;
    this.rotation_circle.scale.y = diameter/200;

    //adjust the location of the rotation ball
    this.balls.rotate.position.x = this.center.x + diameter/2*0.70 + BALL_RADIUS/2;
    this.balls.rotate.position.y = this.center.y;
    this.balls.rotate.position.z = this.center.z + diameter/2*0.70 + BALL_RADIUS/2;

    //deal with rotation of the bounding box
    this.mesh.rotation.y = this.rotation;

    this.rotateItem(this.balls.rotate);
    this.rotateItem(this.balls.left);
    this.rotateItem(this.balls.right);
    this.rotateItem(this.balls.front);
    this.rotateItem(this.balls.back);

    this.scaleBall(this.balls.rotate);
    this.scaleBall(this.balls.back);
    this.scaleBall(this.balls.front);
    this.scaleBall(this.balls.up);
    this.scaleBall(this.balls.down);
    this.scaleBall(this.balls.left);
    this.scaleBall(this.balls.right);

  };

  //taken from http://www.gamedev.net/topic/511196-rotation-around-an-arbitrary-reference-point/page__p__4331198#entry4331198
  this.rotateItem = function(e) {
    var displacementx = e.position.x - this.center.x;
    var displacementz = e.position.z - this.center.z;

    e.position.x = displacementx*Math.cos(this.rotation) + displacementz*Math.sin(this.rotation) + this.center.x;
    e.position.z = displacementz*Math.cos(this.rotation) - displacementx*Math.sin(this.rotation) + this.center.z;
  };



  function adjustBoundingBox(){

    var slope, amount, flipsign;
    var newwidthx, newwidthy, newwidthz;
    var newcenterx, newcentery, newcenterz;
    var centerdisplacement;

    var mouseY = (event.clientY - 0) * 1;
    var mouseX = (event.clientX - 0) * 1;
    var mouseXOnMouseDown = (event.clientX - 0);
    var mouseYOnMouseDown = (event.clientY - 0);

    if(this.grabbedside==='front' || this.grabbedside==='back'){
      slope = (mouseYOnMouseDown-opposite_y) / (mouseXOnMouseDown-opposite_x);
      if(Math.abs(slope)<1) {
        amount=(mouseX-mouseXOnMouseDown) + (mouseY-mouseYOnMouseDown)*slope;
      } else {
        amount=(mouseX-mouseXOnMouseDown)/slope + (mouseY-mouseYOnMouseDown);
      }
      flipsign=1;
      if(mouseY+mouseX > opposite_y+opposite_x) { flipsign=-1; }

      newwidthz = this.width.z;
      newcenterz = this.center.z;
      newcenterx = this.center.x;

      newwidthz+=amount*this.movingsidescalingfactor*flipsign;
      centerdisplacement = (amount*this.movingsidescalingfactor*flipsign)/2;
      if(this.grabbedside==='back') { centerdisplacement*=-1; }//this makes the other side move
      newcenterz+=centerdisplacement * Math.cos(this.rotation);
      newcenterx+=centerdisplacement * Math.sin(this.rotation);

      if(newwidthz<=(this.original_bounding_box.max.z-this.original_bounding_box.min.z) && newwidthz>=0){
        this.width.z=newwidthz;
        this.center.z=newcenterz;
        this.center.x=newcenterx;
      }
    }


    if(this.grabbedside==='left' || this.grabbedside==='right'){
      slope = (mouseYOnMouseDown-opposite_y) / (mouseXOnMouseDown-opposite_x);
      if(Math.abs(slope)<1) {
        amount=(mouseX-mouseXOnMouseDown) + (mouseY-mouseYOnMouseDown)*slope;
      } else {
        amount=(mouseX-mouseXOnMouseDown)/slope + (mouseY-mouseYOnMouseDown);
      }
      flipsign=-1;
      if(mouseY+mouseX < opposite_y+opposite_x) { flipsign=1; }

      newwidthx = this.width.x;
      newcenterz = this.center.z;
      newcenterx = this.center.x;

      newwidthx+=amount*this.movingsidescalingfactor*flipsign;
      centerdisplacement = (amount*this.movingsidescalingfactor*flipsign)/2;
      if(this.grabbedside==='left') { centerdisplacement*=-1; }//this makes the other side move
      newcenterz+=centerdisplacement * Math.sin(this.rotation) * -1;
      newcenterx+=centerdisplacement * Math.cos(this.rotation);

      if(newwidthx<=(this.original_bounding_box.max.x-this.original_bounding_box.min.x) && newwidthx>=0){
        this.width.x=newwidthx;
        this.center.z=newcenterz;
        this.center.x=newcenterx;
      }

    }

    if(this.grabbedside==='up' || this.grabbedside==='down'){
      newwidthy = this.width.y;
      newcentery = this.center.y;
      amount = (mouseYOnMouseDown-mouseY)*this.movingsidescalingfactor*-1;
      if(this.grabbedside==='up') { amount*=-1; }
      newwidthy += amount;
      centerdisplacement = (amount)/2;
      if(this.grabbedside==='up') { centerdisplacement*=-1; } //this makes the other side move
      newcentery+=centerdisplacement;

      if (newwidthy <= (this.original_bounding_box.max.y - this.original_bounding_box.min.y) && newwidthy>=0){
        this.width.y=newwidthy;
        this.center.y=newcentery;
      }


    }
    if(this.grabbedside==='rotate'){
      var initangle=Math.atan2((mouseXOnMouseDown-opposite_x), (mouseYOnMouseDown-opposite_y));
      var curangle=Math.atan2((mouseX-opposite_x), (mouseY-opposite_y));
      var sign=1;
      // if(currentRotationY<0)sign=-1;
      this.rotation = initrotation + (curangle-initangle)*sign;
    }

    uniforms['xClippingPlaneMax'].value=this.center.x+this.width.x/2;
    uniforms['xClippingPlaneMin'].value=this.center.x-this.width.x/2;
    uniforms['yClippingPlaneMax'].value=this.center.y+this.width.y/2;
    uniforms['yClippingPlaneMin'].value=this.center.y-this.width.y/2;
    uniforms['zClippingPlaneMax'].value=this.center.z+this.width.z/2;
    uniforms['zClippingPlaneMin'].value=this.center.z-this.width.z/2;
    uniforms['xCenter'].value=this.center.x;
    uniforms['yCenter'].value=this.center.y;
    uniforms['zCenter'].value=this.center.z;
    uniforms['rotation'].value=this.rotation*-1;

    uniformsmesh['xClippingPlaneMax'].value=this.center.x+this.width.x/2;
    uniformsmesh['xClippingPlaneMin'].value=this.center.x-this.width.x/2;
    uniformsmesh['yClippingPlaneMax'].value=this.center.y+this.width.y/2;
    uniformsmesh['yClippingPlaneMin'].value=this.center.y-this.width.y/2;
    uniformsmesh['zClippingPlaneMax'].value=this.center.z+this.width.z/2;
    uniformsmesh['zClippingPlaneMin'].value=this.center.z-this.width.z/2;
    uniformsmesh['xCenter'].value=this.center.x;
    uniformsmesh['yCenter'].value=this.center.y;
    uniformsmesh['zCenter'].value=this.center.z;
    uniformsmesh['rotation'].value=this.rotation*-1;

  }

  this.scaleBall = function(elem) {
    elem.scale.z = elem.scale.y = elem.scale.x = this.distanceToCamera(elem) / 500;
  };

  this.distanceToCamera = function (elem) {
    var xdif = this.camera.position.x - elem.position.x;
    var ydif = this.camera.position.y - elem.position.y;
    var zdif = this.camera.position.z - elem.position.z;
    var r = Math.sqrt(xdif*xdif + ydif*ydif + zdif*zdif);
    return r;
  };

  function resetBoundingBox(){
    this.bounding_box = this.original_bounding_box;
    this.rotation=0;

    adjustBoundingBox();
  }

  var opposite_x=0;
  var opposite_y=0;
  var initrotation=this.rotation;
  function getOppositeBoundingBoxXY(id, mx, my){
    var opposite=null;
    if(id==='left') { opposite=this.balls.right; }
    if(id==='right') { opposite=this.balls.left; }
    if(id==='front') { opposite=this.balls.back; }
    if(id==='back') { opposite=this.balls.front; }
    if(id==='up') { opposite=this.balls.down; }
    if(id==='down') { opposite=this.balls.up; }
    if(id==='rotate'){
      initrotation=this.rotation;
      opposite = this.original_bounding_box;
    }
    if (opposite === null) { return; }


    var pos = opposite.position.clone();
    //var rot = boundbox_holder.rotation.clone();
    var projScreenMat = new THREE.Matrix4();
    projScreenMat.multiply( this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    projScreenMat.multiplyVector3(pos);
    var x = (pos.x+1)*$(this.container).width()/2 + $(this.container).offset().left;
    var y = (-pos.y+1)*$(this.container).height()/2 + $(this.container).offset().top;

    //now send the x and y way away from the mouse click, off the screen so the drag can never go past it
    if(id!=='rotate'){//i don't want to do this for the rotate one, which relies on the center of the box to do the rotation
      var difx=mx-x;x=x-difx*100;
      var dify=my-y;y=y-dify*100;
    }
    opposite_x=x;
    opposite_y=y;

  }










  THREE.TorusGeometry = function ( radius, tube, segmentsR, segmentsT, arc ) {

    THREE.Geometry.call( this );

    var scope = this;

    this.radius = radius || 100;
    this.tube = tube || 40;
    this.segmentsR = segmentsR || 8;
    this.segmentsT = segmentsT || 6;
    this.arc = arc || Math.PI * 2;

    var center = new THREE.Vector3(), uvs = [], normals = [];

    for ( var j = 0; j <= this.segmentsR; j ++ ) {

      for ( var i = 0; i <= this.segmentsT; i ++ ) {

        var u = i / this.segmentsT * this.arc;
        var v = j / this.segmentsR * Math.PI * 2;

        center.x = this.radius * Math.cos( u );
        center.y = this.radius * Math.sin( u );

        var vector = new THREE.Vector3();
        vector.x = ( this.radius + this.tube * Math.cos( v ) ) * Math.cos( u );
        vector.y = ( this.radius + this.tube * Math.cos( v ) ) * Math.sin( u );
        vector.z = this.tube * Math.sin( v );

        this.vertices.push( new THREE.Vertex( vector ) );

        uvs.push( new THREE.UV( i / this.segmentsT, 1 - j / this.segmentsR ) );
        normals.push( vector.clone().subSelf( center ).normalize() );

      }
    }


    for ( var k = 1; k <= this.segmentsR; k ++ ) {

      for ( var l = 1; l <= this.segmentsT; l ++ ) {

        var a = ( this.segmentsT + 1 ) * k + l - 1;
        var b = ( this.segmentsT + 1 ) * ( k - 1 ) + l - 1;
        var c = ( this.segmentsT + 1 ) * ( k - 1 ) + l;
        var d = ( this.segmentsT + 1 ) * k + l;

        var face = new THREE.Face4( a, b, c, d, [ normals[ a ], normals[ b ], normals[ c ], normals[ d ] ] );
        face.normal.addSelf( normals[ a ] );
        face.normal.addSelf( normals[ b ] );
        face.normal.addSelf( normals[ c ] );
        face.normal.addSelf( normals[ d ] );
        face.normal.normalize();

        this.faces.push( face );

        this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );
      }

    }

    this.computeCentroids();

  };

  THREE.TorusGeometry.prototype = new THREE.Geometry();
  THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry;
}.apply(Pointspace.boundingbox));
