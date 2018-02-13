
/*
Use
------------------------------
<div class="wallpaper-pattern"
    pattern-function={function} // function with which to draw fundamental domain
    pattern-function-options={object} // options that will be passed to the pattern-function
    draw-options={} // options that will be passed to the wallpaperPattern constructor
    group-name={"p1" | "p11g" | ... one of the 17 wallpaper groups to draw}
    fundamental-domain-width={number}
    fundamental-domain-height={number}
    margin={Number} // margin of space to allow around fundamental domain
    show-symmetry-sets={boolean} // value to watch -- show the symmetry set lines when true
></div>
**/
function WallpaperPatternDirective($window) {
	return {

	restrict: "EA",
	scope: {}, // using isolated scope
	link: function(scope, element, attrs) {

		scope.groupName = attrs.groupName || "p1";
		scope.patternFunction = $window[attrs.patternFunction];
		scope.patternFunctionOptions = JSON.parse(attrs.patternFunctionOptions || "{}");

		// initialize the drawOptions
		scope.drawOptions = JSON.parse(attrs.drawOptions || "{}");

		// margin is the margin to leave above and below the drawn pattern
		// useful for patterns that have rotations that otherwise send their patterns outside
		// the canvas
		scope.margin = Number(attrs.margin || 1);
		
		scope.fundamentalDomainWidth = Number(attrs.fundamentalDomainWidth || "100");
		scope.fundamentalDomainHeight = Number(attrs.fundamentalDomainHeight || "80");

		// initialize the variables that will be set later
		scope.paper = null;
		scope.wallpaperPattern = null;
		// generatorGetters is a {X:[X], Y:[Y]} object of transformation functions (generators)
		// where [X] is an array of generators that transform the pattern along the X-axis
		// and [Y] is an array of generators that transform the pattern along the Y-axis
		scope.generatorGetters = { X: [], Y: [] };
		scope.patternSpaceHeight = null;


		scope.setupPaper = function() {
			let elt = element[0];
			elt.className += " wallpaper-pattern";
			scope.paper = new Raphael(elt, "100%", "100%");
		};

		scope.drawPattern = function() {
		    let origin = {
		    	X: 0,
		    	Y: scope.fundamentalDomainHeight + scope.margin,
		    };
		    // Generate the fundamental domain path once so that it can use random variables
		    // and yet still look the same when it's redrawn by the wallpaperPattern
		    let fundamentalDomainPath = scope.patternFunction(origin, scope.fundamentalDomainWidth, scope.fundamentalDomainHeight, scope.patternFunctionOptions);
		    scope.wallpaperPattern = new WallpaperPattern(scope.paper, fundamentalDomainPath, scope.generatorGetters, scope.drawOptions);
		};


		scope.p1Handler = function() {
		    scope.generatorGetters = {
		    	X: [transforms.getTranslationH],
		    	Y: [transforms.getTranslationV]
		    };
		    scope.patternSpaceHeight = scope.fundamentalDomainHeight + scope.margin;

		    scope.setupPaper();
		    scope.drawPattern();
		};

		scope.p2Handler = function() {
		    scope.generatorGetters = {
				X: [transforms.getOrder2RotationH, transforms.getTranslationH],
		    	Y: [transforms.getTranslationV]
		    };
		    scope.patternSpaceHeight = scope.fundamentalDomainHeight + scope.margin;

		    scope.setupPaper();
		    scope.drawPattern();
		};

		scope.pmHandler = function() {
		    scope.generatorGetters = {
				X: [transforms.getMirrorV, transforms.getMirrorV],
		    	Y: [transforms.getTranslationV]
		    };
		    scope.patternSpaceHeight = scope.fundamentalDomainHeight + scope.margin;

		    scope.setupPaper();
		    scope.drawPattern();
		};

		scope.pgHandler = function() {
			scope.generatorGetters = {
				X: [transforms.getGlideH],
				Y: [transforms.getTranslationV]
			};

			// create G mirror within fundamental domain
			// mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
			let mirrorHOffsetFraction = (1/2);
			let mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;
			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin)*(1 - mirrorHOffsetFraction);

			scope.drawOptions.mirrorOffset = mirrorHOffset;
			scope.setupPaper();
			scope.drawPattern();
		};

		scope.cmHandler = function() {
			scope.generatorGetters = {
				X: [transforms.getGlideH],
				Y: [transforms.getMirrorH]
			};

			// create G mirror within fundamental domain
			// mirrorOffsetFraction=0 will mean normal mirror at bottom of fundamental domain
			let mirrorHOffsetFraction = (1/2);
			let mirrorHOffset = mirrorHOffsetFraction*scope.fundamentalDomainHeight;
			scope.patternSpaceHeight = 2*(scope.fundamentalDomainHeight + scope.margin)*(1 - mirrorHOffsetFraction);

			scope.drawOptions.mirrorOffset = mirrorHOffset;
			scope.setupPaper();
			scope.drawPattern();
		};

		scope.pmmHandler = function() {
			scope.generatorGetters = {
				X: [transforms.getMirrorV, transforms.getMirrorV],
				Y: [transforms.getMirrorH, transforms.getMirrorH]
			};
			scope.patternSpaceHeight = scope.fundamentalDomainHeight + scope.margin;

			scope.setupPaper();
			scope.drawPattern();
		};

		const handlers = {
		    "p1": scope.p1Handler,
		    "pm": scope.pmHandler,
		    "pg": scope.pgHandler,
		    "cm": scope.cmHandler,
		    "p2": scope.p2Handler,
		    "pmm": scope.pmmHandler,

		};

		scope.init = function() {
			if (handlers[scope.groupName])
				handlers[scope.groupName]();
		};
		scope.init();

	}};
};