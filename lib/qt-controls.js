THREE.QTControls = function ( object, domElement ) {

  this.object = object;

  this.domElement = ( domElement !== undefined ) ? domElement : document;
  if ( domElement ) {
    this.domElement.setAttribute( 'tabindex', -1 );
  }

  // API

  this.movementSpeed = 100;
  this.rollSpeed = 1;

  this.dragToLook = true;
  this.autoForward = false;

  // disable default target object behavior

  this.object.useQuaternion = true;

  // internals

  this.tmpQuaternion = new THREE.Quaternion();

  this.mouseStatus = 0;
  this.mouseX = this.mouseY = 0;
  this.resetForwardBackAfterUpdate = false;

  this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
  this.moveVector = new THREE.Vector3( 0, 0, 0 );
  this.rotationVector = new THREE.Vector3( 0, 0, 0 );

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

    this.updateMovementVector();
    this.updateRotationVector();

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

    this.updateMovementVector();
    this.updateRotationVector();

  };

  this.mousedown = function( event ) {

    if ( this.domElement !== document ) {

      this.domElement.focus();

    }

    event.preventDefault();
    event.stopPropagation();

    if ( this.dragToLook ) {

      this.mouseStatus = event.button + 1;
      this.mouseX = event.pageX;
      this.mouseY = event.pageY;

    } else {

      switch ( event.button ) {

        case 0: this.object.moveForward = true; break;
        case 2: this.object.moveBackward = true; break;

      }

    }

  };

  this.mousemove = function( event ) {

    var container, halfWidth, halfHeight;
    container = this.getContainerDimensions();
    halfWidth  = container.size[ 0 ] / 2;
    halfHeight = container.size[ 1 ] / 2;


    if ( !this.dragToLook || this.mouseStatus === 1 ) {

      this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
      this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

      this.updateRotationVector();

    } else if ( this.mouseStatus === 3 ) {

      this.moveState.right  = (this.mouseX - event.pageX) * this.movementSpeed / halfWidth;
      this.moveState.down = (this.mouseY - event.pageY) * this.movementSpeed / halfHeight;
      this.mouseX = event.pageX;
      this.mouseY = event.pageY;

      this.updateMovementVector();

    }

  };

  this.mouseup = function( event ) {

    event.preventDefault();
    event.stopPropagation();

    if ( this.dragToLook ) {

      switch ( this.mouseStatus ) {
        case 1: this.moveState.yawLeft = this.moveState.pitchDown = 0; break;
        case 3: this.moveState.right = this.moveState.down = 0; break;
      }

      this.mouseStatus = 0;


    } else {

      switch ( event.button ) {

        case 0: this.moveForward = false; break;
        case 2: this.moveBackward = false; break;

      }

    }

    this.updateRotationVector();
    this.updateMovementVector();

  };

  this.mousewheel = function ( event, delta ) {

    event.preventDefault();
    event.stopPropagation();

    if (delta > 0) {
      this.moveState.forward = 1;
    } else if (delta < 0) {
      this.moveState.back = 1;
    }
    this.resetForwardBackAfterUpdate = true;
    this.updateMovementVector();

  };

  this.update = function( delta ) {

    var moveMult = delta * this.movementSpeed;
    var rotMult = delta * this.rollSpeed;

    this.object.translateX( this.moveVector.x * moveMult );
    this.object.translateY( this.moveVector.y * moveMult );
    this.object.translateZ( this.moveVector.z * moveMult );

    this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
    this.object.quaternion.multiplySelf( this.tmpQuaternion );

    this.object.matrix.setPosition( this.object.position );
    this.object.matrix.setRotationFromQuaternion( this.object.quaternion );
    this.object.matrixWorldNeedsUpdate = true;

    if (this.resetForwardBackAfterUpdate) {
      this.moveState.forward = this.moveState.back = 0;
      this.updateMovementVector();
      this.resetForwardBackAfterUpdate = false;
    }

  };

  this.updateMovementVector = function() {

    var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;

    this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
    this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
    this.moveVector.z = ( -forward + this.moveState.back );

    //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

  };

  this.updateRotationVector = function() {

    this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
    this.rotationVector.y = ( -this.moveState.yawRight  + this.moveState.yawLeft );
    this.rotationVector.z = ( -this.moveState.rollRight + this.moveState.rollLeft );

    //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

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

  this.updateMovementVector();
  this.updateRotationVector();

};
