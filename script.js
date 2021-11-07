"use strict";

const VP_WIDTH = 1280,
    VP_HEIGHT = 720; //declare variables to hold the viewport size
const MAX_CRATES = 18; //declare a variable to hold the max number of crates
const MAX_SPECIALS = 2; //declare a variable to hold the max number of special objects in the game scene

const CRATE_WIDTH = get_random(20, 50), //Randomly assigns a crate width
    CRATE_HEIGHT = get_random(20, 50); // Randomly assigned a crate height
const FUZZBALL_X = 150,
    FUZZBALL_Y = 590; //declare a starting point for the fuzzball
const FIZZBALL_D = 40; //declare a diameter for the fuzzball

//declare global variables to hold the framework objects
var viewport, world, engine, body, elastic_constraint;
var playerScore = 0;

// define our categories (as bit fields, there are up to 32 available) - we will use them to allow/non allow mouse interaction
// https://brm.io/matter-js/docs/classes/MouseConstraint.html#properties
var notinteractable = 0x0001,
    interactable = 0x0002;

//GAME ENVIRONMENT

var crates = []; //create an empty array that will be used to hold all the crates instances
var ground;
var leftwall;
var rightwall;
var roof; //Declares variables to hold their respective objects

var specials = []; //Creates an empty array to hold all of the special item instances

var fuzzball; //Declare a variable to hold the fuzzball object
var launcher; //Declare a` variable to hold the launcher

//VARIABLES TO HOLD GAME IMAGES

var gameBackground;
var birdImage;

//SOUNDS

var stretchingSound;
var releaseSound;
var backgroundMusic;
var hittingGround;

// P5 DEFINED FUNCTIONS

//Loaded on the start of the game launch

function preload() {
    //IMAGES
    gameBackground = loadImage("assets/sunset_wp.jpeg");
    birdImage = loadImage("assets/happy_bird.png");

    //SOUNDS
    soundFormats("mp3");
    stretchingSound = loadSound("assets/sounds/stretching-sound-effect.mp3");
    releaseSound = loadSound("assets/sounds/whoosh.mp3");
    backgroundMusic = loadSound("assets/sounds/backgroundMusic.mp3");
    hittingGround = loadSound("assets/sounds/hittingGround.mp3");
}

//this p5 defined function runs automatically once the preload function is done

function setup() {
    viewport = createCanvas(VP_WIDTH, VP_HEIGHT); //set the viewport (canvas) size
    viewport.parent("viewport_container"); //attach the created canvas to the target div

    pixelDensity();

    //enable the matter engine
    engine = Matter.Engine.create();
    world = engine.world;
    body = Matter.Body;

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

    level2();

    //attach some useful events to the matter engine; https://brm.io/matter-js/docs/classes/Engine.html#events
    Matter.Events.on(engine, "collisionEnd", collisions);

    frameRate(60);
    world.gravity.y = 1.0;
}

//this p5 defined function runs every refresh cycle

function draw() {
    //special.rotate();

    paint_background(); //paint the default background

    Matter.Engine.update(engine); //run the matter engine update
    paint_assets(); //paint the assets

    if (elastic_constraint.body !== null) {
        let pos = elastic_constraint.body.position; //create an shortcut alias to the position (makes a short statement)
        if (!stretchingSound.isPlaying()) {
            stretchingSound.setVolume(1.5);
            stretchingSound.jump(0.5);
            stretchingSound.play();
        }
        noFill();
        ellipse(pos.x, pos.y, 20, 20); //indicate the body that has been selected

        let mouse = elastic_constraint.mouse.position;
        stroke("rgb(230, 149, 0)");
        line(pos.x, pos.y, mouse.x, mouse.y);
    }

    //https://brm.io/matter-js/docs/classes/SAT.html#methods
    //if(Matter.SAT.collides(fuzzball.body, ground.body).collided == true) {
    //	console.log("fuzzball to ground");
    //}
}

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

//return a 'fake' random number base on the specified range

function get_random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
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

function createFuzzball() {
    fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FUZZBALL_D, "fuzzball"); //create a fuzzball object
}

function createLauncher() {
    launcher = new c_launcher(FUZZBALL_X, FUZZBALL_Y - 100, fuzzball.body);
}

function createLayout() {
    //Declaring objects for the game
    ground = new c_ground(VP_WIDTH / 2, VP_HEIGHT + 20, VP_WIDTH, 40, "ground"); //creates a ground object using the ground class

    leftwall = new c_ground(0, VP_HEIGHT / 2, 100, VP_HEIGHT, "leftwall"); //creates a left wall object using the ground class

    rightwall = new c_ground(
        VP_WIDTH,
        VP_HEIGHT / 2,
        100,
        VP_HEIGHT,
        "rightwall"
    ); //creates a right wall object using the ground class

    roof = new c_ground(VP_WIDTH / 2, -50, VP_WIDTH, 100, "roof"); //creates a roof object using the ground class

    createLauncher();
    createFuzzball();
}

function level1(replay = false) {
    if (replay == true) {
        //if this is a 'reply' we need to remove all the objects before recrating them
        ground.remove();
        leftwall.remove();
        rightwall.remove();
        roof.remove();
        fuzzball.remove();
        launcher.remove();

        //createLayout();

        for (let i = 0; i < MAX_SPECIALS; i++) {
            specials[i].remove();
        }

        for (let i = 0; i < MAX_CRATES; i++) {
            crates[i].remove();
        }
    }

    //Declaring objects for the game
    ground = new c_ground(VP_WIDTH / 2, VP_HEIGHT + 20, VP_WIDTH, 40, "ground"); //create a ground object using the ground class
    leftwall = new c_ground(0, VP_HEIGHT / 2, 1, VP_HEIGHT, "leftwall"); //create a left wall object using the ground class
    rightwall = new c_ground(
        VP_WIDTH,
        VP_HEIGHT / 2,
        1,
        VP_HEIGHT,
        "rightwall"
    ); //create a right wall object using the ground class
    roof = new c_ground(VP_WIDTH / 2, -50, VP_WIDTH, 100, "roof"); //create a roof object using the ground class
    fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FIZZBALL_D, "fuzzball"); //create a fuzzball object
    //create a launcher object using the fuzzball body
    launcher = new c_launcher(FUZZBALL_X, FUZZBALL_Y - 100, fuzzball.body);

    for (let i = 0; i < MAX_SPECIALS; i++) {
        specials[i] = new c_special(
            get_random(300, 640),
            get_random(VP_HEIGHT - 600, VP_HEIGHT - 120),
            70,
            20,
            "special"
        );
    }

    //loop through each of the crates indexes
    for (let i = 0; i < MAX_CRATES; i++) {
        //loop for each instance of a crates
        let top = -CRATE_HEIGHT * MAX_CRATES - 100;
        let offset = i * CRATE_HEIGHT * 3;
        crates[i] = new c_crate(
            700,
            top + offset,
            CRATE_WIDTH,
            CRATE_HEIGHT,
            "crate"
        );
    }
}

function level2(replay = false) {
    if (replay == true) {
        //if this is a 'reply' we need to remove all the objects before recrating them
        ground.remove();
        leftwall.remove();
        rightwall.remove();
        roof.remove();
        fuzzball.remove();
        launcher.remove();

        //createLayout();

        for (let i = 0; i < MAX_SPECIALS; i++) {
            specials[i].remove();
        }

        for (let i = 0; i < MAX_CRATES; i++) {
            crates[i].remove();
        }
    }

    //Declaring objects for the game
    ground = new c_ground(VP_WIDTH / 2, VP_HEIGHT + 20, VP_WIDTH, 40, "ground"); //create a ground object using the ground class
    leftwall = new c_ground(0, VP_HEIGHT / 2, 1, VP_HEIGHT, "leftwall"); //create a left wall object using the ground class
    rightwall = new c_ground(
        VP_WIDTH,
        VP_HEIGHT / 2,
        1,
        VP_HEIGHT,
        "rightwall"
    ); //create a right wall object using the ground class
    roof = new c_ground(VP_WIDTH / 2, -50, VP_WIDTH, 100, "roof"); //create a roof object using the ground class
    fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FIZZBALL_D, "fuzzball"); //create a fuzzball object
    //create a launcher object using the fuzzball body
    launcher = new c_launcher(FUZZBALL_X, FUZZBALL_Y - 100, fuzzball.body);

    for (let i = 0; i < MAX_SPECIALS; i++) {
        specials[i] = new c_special(
            get_random(300, 640),
            get_random(VP_HEIGHT - 600, VP_HEIGHT - 120),
            70,
            20,
            "special"
        );
    }

    //loop through each of the crates indexes
    for (let i = 0; i < MAX_CRATES; i++) {
        //loop for each instance of a crates
        let top = -CRATE_HEIGHT * MAX_CRATES - 100;
        let offset = i * CRATE_HEIGHT * 3;
        crates[i] = new c_crate(
            700,
            top + offset,
            CRATE_WIDTH,
            CRATE_HEIGHT,
            "crate"
        );
    }
}

function collisions(event) {
    //runs as part of the matter engine after the engine update, provides access to a list of all pairs that have ended collision in the current frame (if any)

    event.pairs.forEach((collide) => {
        //event.pairs[0].bodyA.label
        console.log(collide.bodyA.label + " - " + collide.bodyB.label);

        if (
            (collide.bodyA.label == "fuzzball" &&
                collide.bodyB.label == "crate") ||
            (collide.bodyA.label == "crate" &&
                collide.bodyB.label == "fuzzball")
        ) {
            console.log("interesting collision");
            score(100);
        } else if (
            (collide.bodyA.label == "fuzzball" &&
                collide.bodyB.label == "ground") ||
            (collide.bodyA.label == "ground" &&
                collide.bodyB.label == "fuzzball")
        ) {
            hittingGround.setVolume(0.5);
            hittingGround.play();
        } else if (
            (collide.bodyA.label == "fuzzball" &&
                collide.bodyB.label == "leftwall") ||
            (collide.bodyA.label == "leftwall" &&
                collide.bodyB.label == "fuzzball")
        ) {
            hittingGround.setVolume(0.5);
            hittingGround.play();
        } else if (
            (collide.bodyA.label == "fuzzball" &&
                collide.bodyB.label == "rightwall") ||
            (collide.bodyA.label == "rightwall" &&
                collide.bodyB.label == "fuzzball")
        ) {
            hittingGround.setVolume(0.5);
            hittingGround.play();
        } else if (
            (collide.bodyA.label == "fuzzball" &&
                collide.bodyB.label == "roof") ||
            (collide.bodyA.label == "roof" && collide.bodyB.label == "fuzzball")
        ) {
            hittingGround.setVolume(0.5);
            hittingGround.play();
        }

        /*
        else {
            if (!hittingGround.playing) {
                hittingGround.jump(0.7, 0.1);
                hittingGround.play();
            }
        } */
    });
}

function paint_background() {
    //access the game object for the world, use this as a background image for the game
    background(gameBackground);

    ground.show(); //execute the show function for the boundary objects
    leftwall.show();
    rightwall.show();
    roof.show();

    if (!backgroundMusic.isPlaying()) {
        backgroundMusic.setVolume(0.3);
        backgroundMusic.play();
    }
}

function paint_assets() {
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

function keyPressed() {
    if (keyCode === ENTER) {
        console.log("enter key press");
        fuzzball.remove();
        fuzzball = new c_fuzzball(
            FUZZBALL_X,
            FUZZBALL_Y,
            FIZZBALL_D,
            "fuzzball"
        );
        launcher.attach(fuzzball.body);
    }

    if (keyCode === 32) {
        console.log("space key press");
        launcher.release(); //execute the release method
    }
}

function mouseReleased() {
    setTimeout(() => {
        launcher.release();
        stretchingSound.stop();
        releaseSound.setVolume(0.4);
        releaseSound.jump(0.08).play();
    }, 60);
}
