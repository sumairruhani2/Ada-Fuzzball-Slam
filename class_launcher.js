"use strict";


class c_launcher {
	constructor(x, y, body) {
		//see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
		let options = {
			pointA: {
				x: x,
				y: y
			},
			bodyB: body,
			stiffness: 0.10,
			length: 20
		}
		//create the contraint 
		this.launch = Matter.Constraint.create(options);
		Matter.World.add(world, this.launch); //add to the matter world
	}

	release() {
		//release the constrained body by setting it to null
		this.launch.bodyB = null;
	}

	//dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
	remove() {
		Matter.World.remove(world, this.launch);
	}

	attach(body) {
		//attach the specified object as a constrained body
		this.launch.bodyB = body;
	}	

	show() {
		//check to see if there is an active body
		if(this.launch.bodyB) {
			let posA = this.launch.pointA; //create an shortcut alias 
			let posB = this.launch.bodyB.position;
			stroke("#00ff00"); //set a colour
			line(posA.x, posA.y, posB.x, posB.y); //draw a line between the two points
		}
	}
}