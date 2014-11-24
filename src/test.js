var ChipmunkBaseLayer = cc.LayerGradient.extend( {
	//构造函数
	ctor : function() {
		//
		// VERY IMPORTANT
		//
		// Only subclasses of a native classes MUST call cc.associateWithNative
		// Failure to do so, it will crash.
		//
		this._super( cc.color(0,0,0,255), cc.color(98*0.5,99*0.5,117*0.5,255) );

		this._title =  "No title";
		this._subtitle = "No Subtitle";

		// Menu to toggle debug physics on / off
		var item = new cc.MenuItemFont("Physics On/Off", this.onToggleDebug, this);
		item.fontSize = 24;
		var menu = new cc.Menu( item );
		this.addChild( menu );
		menu.x = cc.winSize.width-100;
		menu.y = cc.winSize.height-90;
 
		// Create the initial space
		this.space = new cp.Space();

		this.setupDebugNode();
	}, 	
	//设置是否开启物理引擎debugger
	setupDebugNode : function()
	{ 
		// debug only
		this._debugNode = new cc.PhysicsDebugNode(this.space );
		this._debugNode.visible = false ;
		this.addChild( this._debugNode );
	},
	//点击事件
	onToggleDebug : function(sender) {
		var state = this._debugNode.visible;
		this._debugNode.visible = !state ;
	},

	onEnter : function() {
		cc.LayerGradient.prototype.onEnter.call(this);
		//cc.base(this, 'onEnter');
 
		cc.sys.dumpRoot();  
		cc.sys.garbageCollect(); 
	},

	onCleanup : function() {
		// Not compulsory, but recommended: cleanup the scene
		this.unscheduleUpdate();
	},

	onRestartCallback : function (sender) {
		this.onCleanup();
		var s = new ChipmunkTestScene();
		s.addChild(restartChipmunkTest());
		director.runScene(s);
	},

	onNextCallback : function (sender) {
		this.onCleanup();
		var s = new ChipmunkTestScene();
		s.addChild(nextChipmunkTest());
		director.runScene(s);
	},

	onBackCallback : function (sender) {
		this.onCleanup();
		var s = new ChipmunkTestScene();
		s.addChild(previousChipmunkTest());
		director.runScene(s);
	},

	numberOfPendingTests : function() {
		return ( (arrayOfChipmunkTest.length-1) - chipmunkTestSceneIdx );
	},

	getTestNumber : function() {
		return chipmunkTestSceneIdx;
	}
});


//------------------------------------------------------------------

//Chipmunk + Sprite

//------------------------------------------------------------------
var ChipmunkSprite = ChipmunkBaseLayer.extend( {

	ctor: function() {
		this._super();
		//cc.base(this);

		this.addSprite = function( pos ) {
			var sprite =  this.createPhysicsSprite( pos );
			this.addChild( sprite );
		};

		this._title = 'Chipmunk Sprite Test';
		this._subtitle = 'Chipmunk + cocos2d sprites tests. Tap screen.';

		this.initPhysics();
	},

	title : function(){
		return 'Chipmunk Sprite Test';
	},

	initPhysics : function() {
		var space = this.space ;
		var staticBody = space.staticBody;

		// Walls
		var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(cc.winSize.width,0), 0 ),               // bottom
		              new cp.SegmentShape( staticBody, cp.v(0,cc.winSize.height), cp.v(cc.winSize.width,cc.winSize.height), 0),    // top
		              new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,cc.winSize.height), 0),             // left
		              new cp.SegmentShape( staticBody, cp.v(cc.winSize.width,0), cp.v(cc.winSize.width,cc.winSize.height), 0)  // right
		];
		for( var i=0; i < walls.length; i++ ) {
			var shape = walls[i];
			shape.setElasticity(1);
			shape.setFriction(1);
			space.addStaticShape( shape );
		}

		// Gravity
		space.gravity = cp.v(0, -100);
	},

	createPhysicsSprite : function( pos ) {
		var body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
		body.setPos( pos );
		this.space.addBody( body );
		var shape = new cp.BoxShape( body, 48, 108);
		shape.setElasticity( 0.5 );
		shape.setFriction( 0.5 );
		this.space.addShape( shape );

		var sprite = new cc.PhysicsSprite(res.s_pathGrossini); 
		sprite.setBody( body );
		return sprite;
	},

	onEnter : function () {
		ChipmunkBaseLayer.prototype.onEnter.call(this);
		//cc.base(this, 'onEnter');

		this.scheduleUpdate();
		for(var i=0; i<10; i++) {
			var variancex = cc.randomMinus1To1() * 5;
			var variancey = cc.randomMinus1To1() * 5;
			this.addSprite( cp.v(cc.winSize.width/2 + variancex, cc.winSize.height/2 + variancey) );
		}

		if( 'touches' in cc.sys.capabilities ){
			cc.eventManager.addListener({
				event: cc.EventListener.TOUCH_ALL_AT_ONCE,
				onTouchesEnded: function(touches, event){
					var l = touches.length, target = event.getCurrentTarget();
					for( var i=0; i < l; i++) {
						target.addSprite( touches[i].getLocation() );
					}
				}
			}, this);
		} else if( 'mouse' in cc.sys.capabilities )
			cc.eventManager.addListener({
				event: cc.EventListener.MOUSE,
				onMouseDown: function(event){
					event.getCurrentTarget().addSprite(event.getLocation());
				}
			}, this);
	},

	update : function( delta ) {
		this.space.step( delta );
	}
});


//------------------------------------------------------------------

//Chipmunk Collision Test
//Using Object Oriented API.
//Base your samples on the "Object Oriented" API.

//------------------------------------------------------------------
var ChipmunkCollisionTest = ChipmunkBaseLayer.extend( {

	ctor : function () {
		this._super();
		// cc.base(this);

		this._title = 'Chipmunk Collision test';
		this._subtitle = 'Using Object Oriented API. ** Use this API **';
	},

	// init physics
	initPhysics : function() {
		var staticBody = this.space.staticBody; 
 
		// Walls
		var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(cc.winSize.width,0), 0 ),               // bottom
		              new cp.SegmentShape( staticBody, cp.v(0,cc.winSize.height), cp.v(cc.winSize.width,cc.winSize.height), 0),    // top
		              new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,cc.winSize.height), 0),             // left
		              new cp.SegmentShape( staticBody, cp.v(cc.winSize.width,0), cp.v(cc.winSize.width,cc.winSize.height), 0)  // right
		];
		for( var i=0; i < walls.length; i++ ) {
			var wall = walls[i];
			wall.setElasticity(1);
			wall.setFriction(1);
			this.space.addStaticShape( wall );
		}

		// Gravity:
			// testing properties
		this.space.gravity = cp.v(0,-100);
		this.space.iterations = 15;
	},

	createPhysicsSprite : function( pos, file, collision_type ) {
		var body = new cp.Body(1, cp.momentForBox(1, 48, 108) ); 
		body.setPos(pos);
		this.space.addBody(body);
		var shape = new cp.BoxShape( body, 48, 108);
		shape.setElasticity( 0.5 );
		shape.setFriction( 0.5 );
		shape.setCollisionType( collision_type );
		this.space.addShape( shape );

		var sprite = new cc.PhysicsSprite(file);
		sprite.setBody( body );
		return sprite;
	},

	onEnter : function () {
		ChipmunkBaseLayer.prototype.onEnter.call(this);
		// cc.base(this, 'onEnter');

		this.initPhysics();
		this.scheduleUpdate();

		var sprite1 = this.createPhysicsSprite( cc.p(cc.winSize.width/2, cc.winSize.height-20), res.s_pathGrossini, 1);
		var sprite2 = this.createPhysicsSprite( cc.p(cc.winSize.width/2, 50), res.s_pathSister1, 2);

		this.addChild( sprite1 );
		this.addChild( sprite2 );

		//碰撞生命周期
		this.space.addCollisionHandler( 1, 2,
				this.collisionBegin.bind(this),
				this.collisionPre.bind(this),
				this.collisionPost.bind(this),
				this.collisionSeparate.bind(this) 
		);
	},

	onExit : function() {
		this.space.removeCollisionHandler( 1, 2 );
		ChipmunkBaseLayer.prototype.onExit.call(this);
	},

	update : function( delta ) {
		this.space.step( delta );
	},

	collisionBegin : function ( arbiter, space ) {

		if( ! this.messageDisplayed ) {
			var label = new cc.LabelBMFont("Collision Detected", res.s_bitmapFontTest5_fnt);
			this.addChild( label );
			label.x = cc.winSize.width/2;
			label.y = cc.winSize.height/2 ;
			this.messageDisplayed = true;
		}
		cc.log('collision begin');
		var shapes = arbiter.getShapes();
		var collTypeA = shapes[0].collision_type;
		var collTypeB = shapes[1].collision_type;
		cc.log( 'Collision Type A:' + collTypeA ); 
		cc.log( 'Collision Type B:' + collTypeB ); 
		return true;
	},
 
	collisionPre : function ( arbiter, space ) {
		cc.log('collision pre');
		return true;
	},

	collisionPost : function ( arbiter, space ) {
		cc.log('collision post');
	},

	collisionSeparate : function ( arbiter, space ) {
		cc.log('collision separate');
	},

	title : function(){
		return 'Chipmunk Collision test';
	}
});




var testScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		var layer = new ChipmunkCollisionTest();
		this.addChild(layer);
	}
});