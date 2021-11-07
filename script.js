"use strict";

//declare variables to hold viewport size
var vp_width = 920;
var vp_height = 690; 

//specials
var max_specials = get_random(4, 8); 
var specials = []; //create empty array to hold specials instances

//boundaries
var ground;
var leftwall;
var rightwall;
var ceiling;

//crates
const crate_width = 30, crate_height = 35;
var max_crates = get_random(5, 20);
var crates = []; //create empty array to hold crates instances

//fuzzballs
var fuzzball;
const fuzzball_x = 150, fuzzball_y = 590; //declare starting point for fuzzball
const fuzzball_d = 30; //declare diameter for fuzzball

//declare global variables to hold framework objects
var viewport, world, engine, body, elastic_constraint;

const interactable=0x0002, notinteractable=0x0001;
var launcher;
var playerScore = 0;

//declare variable to hold lives left
var livesLeft = 2;
document.getElementById('lives').innerHTML = "Lives Left: " + livesLeft; //show number of lives on screen


function get_random(min, max) { //return 'fake' random number based on inputted range
	min = Math.ceil(min);
	max = Math.floor(max); 
	return Math.floor(Math.random() * (max - min) + min); //max exclusive, min inclusive
}

function preload() {
	//p5 function for loading external files
}

function setup() {
	//p5 function runs after preload function
	
	viewport = createCanvas(vp_width, vp_height); //set viewport (canvas) size
	viewport.parent("viewport_container"); //attach created canvas to target div

	//enable matter engine
	engine = Matter.Engine.create();
	world = engine.world;
	body = Matter.Body;

	let vp_mouse = Matter.Mouse.create(viewport.elt); //enable and attach 'matter' mouse to viewport object
	vp_mouse.pixelRatio = pixelDensity(); //updates pixel ratio to p5 density value - for supporting retina screens
	let options = {
		mouse: vp_mouse,
		collisionFilter: {
			mask: interactable //specify collision catagory 
		} 
	}
	elastic_constraint = Matter.MouseConstraint.create(engine, options); //create mouse constraints
	Matter.World.add(world, elastic_constraint); //add elastic constraint object to world
	Matter.Events.on(engine, 'collisionEnd', collisions); //attach events to matter engine

	level1();

	frameRate(60);
	world.gravity.y = 1.0;
}

function draw() {
	//p5 function loops forever after setup and preload finished

	Matter.Engine.update(engine); //run matter engine update
	paint_background(); //paint default background
	paint_assets(); //paint assets

	if (elastic_constraint.body !== null) {
		let pos = elastic_constraint.body.position; //create position alias	
		fill("#ff0000"); //set fill colour
		ellipse(pos.x, pos.y, 20, 20); //indicate body selected

		let mouse = elastic_constraint.mouse.position;
		stroke("#00ff00");
		line(pos.x, pos.y, mouse.x, mouse.y);
	}
}

function paint_background() {
	//add background to viewport
	background('#4c738b'); 

	//execute show function for boundary objects
	ground.show(); 
	leftwall.show();
	rightwall.show();
}

function paint_assets() {
	for(let i = 0; i < crates.length; i++) { //loop through crates array and show each
		crates[i].show()	
	}

	for(let i = 0; i < max_specials; i++) {
		specials[i].show(); //show specials
	}
	
	fuzzball.show(); //show fuzzball
	launcher.show(); //show launcher indicator 

	if (livesLeft==-1) {
		endGame();
	}
	else if (livesLeft < -1) {
		newGame();
	}
}

function collisions(event) {
	event.pairs.forEach((collide) => { //event.pairs[0].bodyA.label
		console.log(collide.bodyA.label + " - " + collide.bodyB.label);

		if( 
			(collide.bodyA.label == "fuzzball" && collide.bodyB.label == "crate") ||
			(collide.bodyA.label == "crate" && collide.bodyB.label == "fuzzball")
		) {
			score(100);
		}
	});
}

function score(points) {
	let effectspeed = 60;
	let animatespeed = 500;

	//JQUERY USED HERE
	$("#scoreboard").finish();
	document.getElementById('points').innerHTML = "+" + points;
	$('#scoreboard').removeAttr('style'); //remove any applied styles
	$("#scoreboard").fadeIn(effectspeed, function() {
		$("#scoreboard").animate({
			top: '+=50px',
			opacity: 0
		}, animatespeed);
	});

	playerScore += points;
	document.getElementById('status').innerHTML = "Score: " + playerScore;
}

function keyPressed() {
	if (keyCode === ENTER) {
		if (livesLeft >= 0) {
			console.log("enter key press");
			fuzzball.remove();
			fuzzball = new c_fuzzball(fuzzball_x, fuzzball_y, fuzzball_d, "fuzzball");
			launcher.attach(fuzzball.body);
			decreaseLives();
			fuzzball.setInteractable();
		}
		else {
			decreaseLives();
		}
	}

	if (keyCode === 27) {
		console.log("escape key pressed");
		endGame();
		newGame();
	}

	if (keyCode === 32) {
		console.log("space key press");
		launcher.release(); //execute release method
	}
}

function mouseReleased() {
	setTimeout(() => {
		launcher.release();
		fuzzball.setNotInteractable();
	}, 60);
}

function decreaseLives() {
	livesLeft -= 1;
	document.getElementById('lives').innerHTML = "Lives Left: " + livesLeft; //show number of lives on screen
}

function endGame() {
	removeObjects();
	document.getElementById('lives').innerHTML = "";
	document.getElementById('status').innerHTML = "";
	
	fill(0);
    rect(vp_width/2,vp_height/2,vp_width,vp_height)
    fill(255, 255, 255)
    stroke(0);
    strokeWeight(0.3)

    textSize(65) && textAlign(CENTER)
    text('Your Score: ' + playerScore, (vp_width / 2), vp_height / 3);
	textFont('Courier New');

    textSize(20) && textStyle(NORMAL)
    text('Press enter to return to main menu', (vp_width / 2), vp_height / 2);
	textFont('Courier New');
}

function newGame() {
	livesLeft = 2;
	document.getElementById('lives').innerHTML = "Lives Left: " + livesLeft; //show number of lives on screen
	document.getElementById('status').innerHTML = "Happy Birds";
	playerScore = 0;
	level1();

}

function removeObjects(replay=true) {
	if(replay == true) { //if this is a 'reply' we need to remove all the objects before recrating them
		ground.remove();
		leftwall.remove();
		rightwall.remove();
		fuzzball.remove();
		launcher.remove();

		for(let i = 0; i < max_specials; i++) {
			specials[i].remove();
			crates[i].remove();
		}
	}
}

function createObjects() {
	ground = new c_ground(vp_width/2, vp_height+20, vp_width, 40, "ground"); //create ground object
	ceiling = new c_ground(vp_width/2, 0, vp_width, 40, "ceiling"); //create ceiling object
	leftwall = new c_ground(0, vp_height/2, 20, vp_height, "leftwall"); //create left wall object 
	rightwall = new c_ground(vp_width, vp_height/2, 20, vp_height, "rightwall"); //create right wall object
	fuzzball = new c_fuzzball(fuzzball_x, fuzzball_y, fuzzball_d, "fuzzball"); //create fuzzball object
}

function level1() {
	removeObjects(false);
	createObjects();

	for(let i = 0; i < max_specials; i++) {
		var random1 = get_random(300, 640);
		var random2 = get_random(vp_height-600, vp_height-120);

		specials[i] = new c_special(random1, random2, 70, 20, "special");
		crates[i] = new c_crate(random1, random2 - 100, crate_width, crate_height, "crate");
	}

	//create a launcher object using the fuzzball body
	launcher = new c_launcher(fuzzball_x, fuzzball_y-100, fuzzball.body);
}
