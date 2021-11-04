class rectangle {
    constructor() {
        let options = {};

        //create the body
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        Matter.World.add(world, this.body); //add to the matter world

        this.x = x; //store the passed variables in the object
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
}
