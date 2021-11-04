"use strict"; //incorporating this 'expression' tells the browser to enable 'strict mode' - this mode helps ensure you write better code, for example, it prevents the use of undeclared variables.

//task 2.2 - implement the paint functions and debug any issue/s found; as suggested (in the brief) you will need to enable the developer tools – n.b., there are likely several layers of different problems; useful note: you can ignore any 'AudioContext' warning for the time being as we will discuss this later - however, in interested now please ask :)
//task 2.3 - expand the paint_assets function so that it draws a rectangle utilising the get_random function to position it dynamically at random positions within the defined canvas; start your research by searching “js random numbers”.  Once you developed and tested your ‘get_random’ function you will likely need to research (or recall) how to draw a rectangle with the p5 library; start your research by searching “p5 draw rectangle” - to complete this task you will likely need to combine your research and test your ideas
//task 2.4 - update the paint_background function so that the colour format uses 'integer' rgb values rather than 'hex'; start your research by searching "p5 set background color" *note ‘us’ spelling although it shouldn't make too much of a difference research-wise!

//task 3 (extended challenge) --------------
//task 3.1 - expand your 2.3 task so that your rectangle changes colour during each frame update; reflect on what you have done so far and consider and test ways this could be achieved and implemented as simply as possible
//task 3.2 - continue to expand your 2.3 (and now 3.1) task so that your rectangle cycles through all shades of the same colour (e.g., from the darkest to the lightest shade); reflect on what you have already completed and consider and test ways this could be achieved and implemented as simply as possible; for your recall and ease of reference, colour values start from 00 (darkest, i.e., no white added) to FF (lightest, i.e., full white added) in hex or 00 - 255 in decimal

var vp_width = 920,
    vp_height = 690; //defined global variables to hold the defined viewport (vp) details (e.g., size, etc.)
var engine, world, body; //defined global variables to hold the 'matter' engine components

var crates = []; //create an empty array that will be used to hold all the crates instances
var ground;
var leftwall;
var rightwall;

var specials = [];

var fuzzball;
var launcher;

function apply_velocity() {
    Matter.Body.setVelocity(fuzzball.body, {
        x: get_random(0, 20),
        y: get_random(0, 20) * -1,
    });
}

function apply_angularvelocity() {
    for (let i = 0; i < crates.length; i++) {
        Matter.Body.setAngularVelocity(
            crates[i].body,
            Math.PI / get_random(3, 20)
        );
    }
}

function apply_force() {
    //apply the same force to all crates
    for (let i = 0; i < crates.length; i++) {
        Matter.Body.applyForce(
            crates[i].body,
            {
                x: crates[i].body.position.x,
                y: crates[i].body.position.y,
            },
            {
                x: 0.05,
                y: get_random(50, 200) * -1,
            }
        );
    }
}

function get_random(min, max) {
    //return a 'fake' random number base on the specified range
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function preload() {
    //a 'p5' defined function runs automatically and used to handle asynchronous loading of external files in a blocking way; once complete
    //the 'setup' function is called (automatically)
}

function score(points) {
    let effectspeed = 60;
    let animatespeed = 500;

    $("#scoreboard").finish();
    document.getElementById("points").innerHTML = "+" + points;
    $("#scoreboard").removeAttr("style"); //remove any applied styles
    $("#scoreboard").fadeIn(effectspeed, function () {
        $("#scoreboard").animate(
            {
                top: "+=50px",
                opacity: 0,
            },
            animatespeed
        );
    });

    playerScore += points;
    document.getElementById("status").innerHTML = "Score: " + playerScore;
}

function setup() {
    //a 'p5' defined function runs automatically once the preload function is complete
    viewport = createCanvas(VP_WIDTH, VP_HEIGHT); //set the viewport (canvas) size
    viewport.parent("viewport_container"); //attach the created canvas to the target div

    //enable the matter engine
    engine = Matter.Engine.create(); //the 'engine' is a controller that manages updating the 'simulation' of the world
    world = engine.world; //the instance of the world (contains all bodies, constraints, etc) to be simulated by the engine
    body = Matter.Body; //the module that contains all 'matter' methods for creating and manipulating 'body' models a 'matter' body
    //is a 'rigid' body that can be simulated by the Matter.Engine; generally defined as rectangles, circles and other polygons)

    //enable the 'matter' mouse controller and attach it to the viewport object using P5s elt property
    let vp_mouse = Matter.Mouse.create(viewport.elt); //the 'elt' is essentially a pointer the the underlying HTML element
    vp_mouse.pixelRatio = pixelDensity(); //update the pixel ratio with the p5 density value; this supports retina screens, etc
    let options = {
        mouse: vp_mouse,
        collisionFilter: {
            mask: interactable, //specify the collision catagory (multiples can be OR'd using '|' )
        },
    };
    elastic_constraint = Matter.MouseConstraint.create(engine, options); //see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
    Matter.World.add(world, elastic_constraint); //add the elastic constraint object to the world

    //attach some useful events to the matter engine; https://brm.io/matter-js/docs/classes/Engine.html#events
    Matter.Events.on(engine, "collisionEnd", collisions);

    frameRate(60);
    world.gravity.y = 1.0;
}

function paint_background() {
    //a defined function to 'paint' the default background objects & colours for the world per frame
    background("#a0a1a2"); //use a 'hex' (denoted with '#') RGB colour (red: a0, green: a1, blue: a2 - appears as a grey colour) to set the background
}

function paint_assets() {
    //a defined function to 'paint' assets to the canvas
    for (let i = 0; i < crates.length; i++) {
        //loop through the crates array and show each
        crates[i].show();
    }

    for (let i = 0; i < MAX_SPECIALS; i++) {
        specials[i].show(); //show the specials
    }

    fuzzball.show(); //show the fuzzball
    launcher.show(); //show the launcher indicator
}

function draw() {
    //a 'p5' defined function that runs automatically and continously (up to your system's hardware/os limit) and based on any specified frame rate
    //this p5 defined function runs every refresh cycle
    //special.rotate();

    paint_background(); //paint the default background

    Matter.Engine.update(engine); //run the matter engine update
    paint_assets(); //paint the assets

    if (elastic_constraint.body !== null) {
        let pos = elastic_constraint.body.position; //create an shortcut alias to the position (makes a short statement)
        fill("#ff0000"); //set a fill colour
        ellipse(pos.x, pos.y, 20, 20); //indicate the body that has been selected

        let mouse = elastic_constraint.mouse.position;
        stroke("#00ff00");
        line(pos.x, pos.y, mouse.x, mouse.y);
    }

    //https://brm.io/matter-js/docs/classes/SAT.html#methods
    //if(Matter.SAT.collides(fuzzball.body, ground.body).collided == true) {
    //	console.log("fuzzball to ground");
    //}
}
