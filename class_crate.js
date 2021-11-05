"use strict";


class c_crate {
	constructor(x, y, width, height, label) {
		let options = {
			restitution: 0.99,
			friction: 0.030,
			density: 0.99,
			frictionAir: 0.032,
			label: label,
			collisionFilter: { //used with mouse constraints to allow/not allow iteration
				category: notinteractable,
			}
		}
		//create the body
		this.body = Matter.Bodies.rectangle(x, y, width, height, options);
		Matter.World.add(world, this.body); //add to the matter world
		
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	body() {
		return this.body; //return the created body
	}

	//dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
	remove() {
		Matter.World.remove(world, this.body);
	}

	show() {
		let pos = this.body.position; //create an shortcut alias 
		let angle = this.body.angle;

		push(); //p5 translation 
			stroke("#000000");
			fill('#ffffff');
			rectMode(CENTER); //switch centre to be centre rather than left, top
			translate(pos.x, pos.y);
			rotate(angle);
			rect(0, 0, this.width, this.height);
		pop();
	}
}