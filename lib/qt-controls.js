THREE.QTControls = function ( camera, domElement ) {

  // XXX Smarter
  var INITIAL_RADIUS = 2000;

  this.camera = camera;

  this.domElement = ( domElement !== undefined ) ? domElement : document;
  if ( domElement ) {
    this.domElement.setAttribute( 'tabindex', -1 );
  }

  // API
  this.movementSpeed = 100;
  this.rollSpeed = 1;
  this.rotation = {xz: 0, y: 0};
  this.destinationRotation = $.extend({}, this.rotation);
  this.center = {x: 0, y: 0, z: 0};
  this.destinationCenter = $.extend({}, this.center);
  this.radius = INITIAL_RADIUS;
  this.destinationRadius = INITIAL_RADIUS;

  this.handleEvent = function ( event ) {
    if ( typeof this[ event.type ] === 'function' ) {
      this[ event.type ]( event );
    }
  };

  this.keydown = function( event ) {
    if ( event.altKey ) {
      return;
    }
    //event.preventDefault();
    switch ( event.keyCode ) {

      case 16: /* shift */ this.movementSpeedMultiplier = 0.1; break;

      case 35: /*end*/ this.moveState.back = 1; break;
      case 36: /*home*/ this.moveState.forward = 1; break;

      case 38: /*up*/ this.moveState.pitchUp = 1; break;
      case 40: /*down*/ this.moveState.pitchDown = 1; break;

      case 37: /*left*/ this.moveState.yawLeft = 1; break;
      case 39: /*right*/ this.moveState.yawRight = 1; break;

      case 81: /*Q*/ this.moveState.rollLeft = 1; break;
      case 69: /*E*/ this.moveState.rollRight = 1; break;

    }

  };

  this.keyup = function( event ) {
    switch( event.keyCode ) {

      case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

      case 35: /*end*/ this.moveState.back = 0; break;
      case 36: /*home*/ this.moveState.forward = 0; break;

      case 82: /*R*/ this.moveState.up = 0; break;
      case 70: /*F*/ this.moveState.down = 0; break;

      case 38: /*up*/ this.moveState.pitchUp = 0; break;
      case 40: /*down*/ this.moveState.pitchDown = 0; break;

      case 37: /*left*/ this.moveState.yawLeft = 0; break;
      case 39: /*right*/ this.moveState.yawRight = 0; break;

      case 81: /*Q*/ this.moveState.rollLeft = 0; break;
      case 69: /*E*/ this.moveState.rollRight = 0; break;

    }

  };

  this.mousedown = function( event ) {
    if ( this.domElement !== document ) {
      this.domElement.focus();
    }
    event.preventDefault();
    event.stopPropagation();
    this.mouseStatus = event.which;
    this.mouseOnMouseDown = {x: event.pageX, y: event.pageY};
    this.rotationOnMouseDown = $.extend({}, this.destinationRotation);
  };

  this.mousemove = function( event ) {
    if ( this.mouseStatus === 1 ) {
      this.destinationRotation.xz = this.rotationOnMouseDown.xz + (event.pageX - this.mouseOnMouseDown.x) * -0.02;
      this.destinationRotation.y = this.rotationOnMouseDown.y + (event.pageY - this.mouseOnMouseDown.y) * 0.02;
    } else if ( this.mouseStatus === 3 ) {
      // XXX noop
    }
  };

  this.mouseup = function( event ) {
    event.preventDefault();
    event.stopPropagation();

    this.mouseStatus = 0;

  };

  this.mousewheel = function ( event, delta ) {

    event.preventDefault();
    event.stopPropagation();

  };

  this.update = function( delta ) {

    this.rotation.xz = this.rotation.xz * 0.92 + this.destinationRotation.xz * 0.02;
    this.rotation.y = this.rotation.y * 0.92 + this.destinationRotation.y * 0.02;

    var radius = Math.cos(this.rotation.y) * this.destinationRadius;
    var newx = Math.sin(this.rotation.xz) * radius;
    var newy = Math.sin(this.rotation.y) * this.destinationRadius;
    var newz = Math.cos(this.rotation.xz) * radius;

    this.camera.position.x = newx * 0.2 + this.center.x;
    this.camera.position.y = newy * 0.2 + this.center.y;
    this.camera.position.z = newz * 0.2 + this.center.z;

    var v = new THREE.Vector3(this.center.x, this.center.y, this.center.z);
    this.camera.lookAt(v);

  };

  this.getContainerDimensions = function() {

    if ( this.domElement !== document ) {

      return {
        size  : [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
        offset  : [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
      };

    } else {

      return {
        size  : [ window.innerWidth, window.innerHeight ],
        offset  : [ 0, 0 ]
      };

    }

  };

  this.setInitialCenter = function(x, y, z) {
    this.initialCenter = {x: x, y: y, z: z};
    this.center = $.extend(this.initialCenter);
    this.destinationCenter = $.extend(this.initialCenter);
    this.camera.position = new THREE.Vector3(x, y, z);
  };

  function bind( scope, fn ) {

    return function () {

      fn.apply( scope, arguments );

    };

  }

  this.domElement.addEventListener( 'mousemove', bind( this, this.mousemove ), false );
  this.domElement.addEventListener( 'mousedown', bind( this, this.mousedown ), false );
  this.domElement.addEventListener( 'mouseup',   bind( this, this.mouseup ), false );

  this.domElement.addEventListener( 'keydown', bind( this, this.keydown ), false );
  this.domElement.addEventListener( 'keyup',   bind( this, this.keyup ), false );
  $(this.domElement).on( 'mousewheel', bind( this, this.mousewheel ));

};
