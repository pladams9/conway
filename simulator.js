/* jsConway - Peter L. Adams
============================ */

var jsConway = {
	parentDiv   : document.getElementById("sim"),
};

/* SIMULATION
============= */

jsConway.simulation = function(parentDiv){
	// Vector
	function Vector(x, y) {
		this.x = x;
		this.y = y;
	}
	Vector.prototype.plus = function(vector) {
		return new Vector(this.x + vector.x, this.y + vector.y);
	};
	
	// Direction
	var directions = {
		"e"  : new Vector(1, 0),
		"ne" : new Vector(1, -1),
		"n"  : new Vector(0, -1),
		"nw" : new Vector(-1, -1),
		"w"  : new Vector(-1, 0),
		"sw" : new Vector(-1, 1),
		"s"  : new Vector(0, 1),
		"se" : new Vector(1, 1)
	};
	
	// Cell
	function Cell(vector, on) {
		this.pos = vector;
		if(on == undefined) this.on = false;
		else this.on = !!on;
	}
	
	Cell.prototype.step = function(numNeighbors) {
		if (this.on) {
			if(numNeighbors < 2) {
				this.on = false;
				return -1;
			}
			else if(numNeighbors > 3) {
				this.on = false;
				return -1;
			}
		}
		else {
			if (numNeighbors === 3) {
				this.on = true;
				return 1;
			}
		}
		return 0;
	};
	
	// World
	function World(width, height, onFunc) {
		this.outputDiv = document.createElement("DIV");
		this.outputDiv.setAttribute("class", "animate");
		parentDiv.appendChild(this.outputDiv);
	
		this.width = width;
		this.height = height;
		this.grid = [];
		
		for(var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				if (onFunc == undefined) this.grid.push(new Cell(new Vector(x, y)));
				else this.grid.push(new Cell(new Vector(x, y), onFunc()));
			}
		}
		this.step();
		this.print();
	}
	
	World.prototype.contains = function(vector) {
		return (vector.x >= 0) && (vector.x < this.width) && (vector.y >= 0) && (vector.y < this.height);
	};
	
	World.prototype.get = function(vector) {
		return this.grid[(vector.y * this.width) + vector.x];
	}
	
	World.prototype.print = function() {
		var out = "<pre>";
		
		for(var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				if(this.grid[(y * this.width) + x].on) out += "O";
				else out += " ";
			}
			out += "\n";
		}
		
		out += "</pre>";
		this.outputDiv.innerHTML = out;
	};
	
	World.prototype.sndAlive = new Audio('boop.mp3');
	World.prototype.sndDead = new Audio('thud.mp3');
	
	World.prototype.step = function() {
		var born = 0;
		this.grid.forEach(function(cell) {
			var numNeighbors = 0;
			for(dir in directions) {
				var space = cell.pos.plus(directions[dir]);
				if(this.contains(space)) {
					numNeighbors += this.get(space).on;
				}
			}
			born += cell.step(numNeighbors);
		}, this);
		if (born > 0) this.sndAlive.play();
		else if (born < 0) this.sndDead.play();
	};
	
	/* EXPORTS
	=========== */
	
	var exports = Object.create(null);
	
	exports.newWorld = function(width, height, onFunc) {
		var insideWorld = new World(width, height, onFunc);
		var outsideWorld = { width    : width,
							 height   : height,
							 loopFunc : function() {
								 insideWorld.step();
								 insideWorld.print();
								 }
		};
		return outsideWorld;
	};
	
	return exports;
	
}(jsConway.parentDiv);

/* ANIMATION MODULE
=================== */

jsConway.animation = function(parentDiv) {
	function AnimationObject(loopFunc, frameLength) {
		// Loop Settings
		this.on = 0;
		this.frameLength = frameLength,
		this.loopID = null,
		this.loopFunc = loopFunc;
		
		// The Button
		this.onOffButton = document.createElement("BUTTON");
		parentDiv.appendChild(this.onOffButton);
		this.onOffButton.textContent = "Start";
		
		this.onOff = function(){
			this.on = (this.on + 1) % 2;
			this.onOffButton.textContent = ["Start", "Stop"][this.on];
			if(this.on) this.loopID = setInterval(this.loopFunc, this.frameLength);
			else {
				clearInterval(this.loopID);
				this.loopID = null;
			}
		};
		
		this.onOffButton.onclick = this.onOff.bind(this);
	}
	
	var exports = Object.create(null);
	
	exports.addOnOffButton = function(func, frameLength) {
		return new AnimationObject(func, frameLength);
	};
	
	return exports;
} (jsConway.parentDiv);

/* OTHER FUNCTIONS
================== */
	
function randBool(chanceOfTrue) {
	return (Math.random() < chanceOfTrue);
}
	
jsConway.world1 = jsConway.simulation.newWorld(80, 80, function() { return randBool(0.1); });
jsConway.animation.addOnOffButton(jsConway.world1.loopFunc, 200);