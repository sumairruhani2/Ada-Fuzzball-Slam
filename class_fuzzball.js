"use strict";


class c_fuzzball {
	constructor(x, y, diameter, label) {
		let options = {
			restitution: 0.90,
			friction: 0.005,
			density: 0.95,
			frictionAir: 0.005,
			label: label,
			collisionFilter: { //used with mouse constraints to allow/not allow iteration
				category: interactable,
			}
		}
		this.body = Matter.Bodies.circle(x, y, diameter/2, options); //matter.js used radius rather than diameter
		Matter.World.add(world, this.body);
		
		this.x = x;
		this.y = y;
		this.diameter = diameter;
	}

	body() {
		return this.body;
	}

	//dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
	remove() {
		Matter.World.remove(world, this.body);
	}

	show() {
		let pos = this.body.position;
		let angle = this.body.angle;

		push(); //p5 translation 
			translate(pos.x, pos.y);
			rotate(angle);
			fill('#00aa00');
			ellipseMode(CENTER); //switch centre to be centre rather than left, top
			circle(0, 0, this.diameter);
		pop();
	}
}