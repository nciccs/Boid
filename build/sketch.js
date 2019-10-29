class Boid
{
    constructor(x, y)
    {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector(0, 0);
        this.r = 8.0;

        this.separationDistance = 20;
        this.alignmentDistance = 50;
        this.cohesionDistance = 50;

        this.maxSpeed = 2;

        this.separationForce = 0.03;
        this.alignmentForce = 0.03;
        this.cohesionForce = 0.03;
    }

    run(boids)
    {
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
    }

    flock(boids)
    {
        let sep = this.separation(boids);
        let ali = this.alignment(boids);
        let coh = this.cohesion(boids);

        //sep.mult(1.5);

        this.acceleration.add(sep);
        this.acceleration.add(ali);
        this.acceleration.add(coh);
    }

    separation(boids)
    {
        let steer = createVector(0, 0);
        let count = 0;
        for(let i = 0; i < boids.length; i++)
        {
            //let d = p5.Vector.dist(this.position, boids[i].position);
            let d = p5.Vector.sub(this.position, boids[i].position).magSq();
            //if(0 < d && d < this.separationDistance)
            if(0 < d && d < this.separationDistance*this.separationDistance)
            {
                let diff = p5.Vector.sub(this.position, boids[i].position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }

        if(count > 0)
        {
            steer.div(count);
        }

        if(steer.magSq() > 0)
        {
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.separationForce);
        }

        return steer;
    }

    alignment(boids)
    {
        let steer = createVector(0, 0);
        let count = 0;
        for(let i = 0; i < boids.length; i++)
        {
            //let d = p5.Vector.dist(this.position, boids[i].position);
            let d = p5.Vector.sub(this.position, boids[i].position).magSq();
            //if(0 < d && d < this.alignmentDistance)
            if(0 < d && d < this.alignmentDistance*this.alignmentDistance)
            {
                steer.add(boids[i].velocity);
                count++;
            }
        }

        if(count > 0)
        {
            steer.div(count);
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.alignmentForce);
        }

        return steer;
    }

    cohesion(boids)
    {
        let steer = createVector(0, 0);
        let count = 0;
        for(let i = 0; i < boids.length; i++)
        {
            //let d = p5.Vector.dist(this.position, boids[i].position);
            let d = p5.Vector.sub(this.position, boids[i].position).magSq();
            //if(0 < d && d < this.separationDistance)
            if(0 < d && d < this.cohesionDistance*this.cohesionDistance)
            {
                steer.add(boids[i].position);
                count++;
            }
        }

        if(count > 0)
        {
            steer.div(count);

            steer.sub(this.position);
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.cohesionForce);
        }

        return steer;
    }

    update()
    {
        this.velocity.add(this.acceleration);
        //limit speed supposed to go here
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    borders()
    {
        if(this.position.x < 0)
            this.position.x = width-1;
        if(this.position.y < 0)
            this.position.y = height-1;
        if(this.position.x >= width)
            this.position.x = 0;
        if(this.position.y >= height)
            this.position.y = 0;
    }

    render()
    {
        push();   
        translate(this.position.x, this.position.y);
        angleMode(DEGREES);
        rotate(this.velocity.heading()+90);
        let y = Boid.calcPythagorasB(this.r, this.r/2);
        triangle(0, -this.r, -this.r/2, y, this.r/2, y);
        pop();
    }

    static calcPythagorasB(sideC, sideA)
    {
        return Math.sqrt(sideC*sideC - sideA*sideA);
    }
}

var boids = [];

var sliders = {};
var labels = {};

function newSlider(x, y, min, max, current, step, onchange="updateSlider()")
{
    let slider = createSlider(min, max, current, step);
    slider.position(x, y);
    slider.attribute("onchange", onchange);
    return slider;
}

function createBoids()
{
    boids = [];
    for(let i = 0; i < sliders["numBoids"].value(); i++)
    {
        let boid = new Boid(random(0, width), random(0, height));
        boids.push(boid);

        boid.separationDistance = sliders["separationDistanceSlider"].value();       
        boid.alignmentDistance = sliders["alignmentDistanceSlider"].value();
        boid.cohesionDistance = sliders["cohesionDistanceSlider"].value();

        boid.maxSpeed = sliders["maxSpeedSlider"].value();

        boid.separationForce = sliders["separationForceSlider"].value();
        boid.alignmentForce = sliders["alignmentForceSlider"].value();
        boid.cohesionForce = sliders["cohesionForceSlider"].value();
    }
}

function newLabel(x, y)
{
    let label = createElement("label", "");
    label.position(x, y);
    label.style("font-size", "23.5px");
    return label;
}

function setup()
{
    // put setup code here
    createCanvas(640, 480);
    //createCanvas(1024, 768);
    frameRate(60);

    let numBoids = 100;
    let maxBoids = 1000;

    sliders["numBoids"] = newSlider(width, 30, numBoids, maxBoids, numBoids, 1, "updateBoidsSlider()");

    sliders["separationDistanceSlider"] = newSlider(width, 60, 0, width, 20, 1, "updateSlider()");
    sliders["alignmentDistanceSlider"] = newSlider(width, 90, 0, width, 50, 1, "updateSlider()");
    sliders["cohesionDistanceSlider"] = newSlider(width, 120, 0, width, 50, 1, "updateSlider()");

    sliders["maxSpeedSlider"] = newSlider(width, 150, 0, 5, 2, 1, "updateSlider()");

    sliders["separationForceSlider"] = newSlider(width, 180, 0, 5, 0.03, 0.001, "updateSlider()");
    sliders["alignmentForceSlider"] = newSlider(width, 210, 0, 5, 0.03, 0.001, "updateSlider()");
    sliders["cohesionForceSlider"] = newSlider(width, 240, 0, 5, 0.03, 0.001, "updateSlider()");

    createBoids();

    let siderWidth = sliders["numBoids"].width;
    let labelXAt = width + siderWidth + 10;

    labels["FPS"] = newLabel(width, 0);

    labels["numBoids"] = newLabel(labelXAt, 30);

    labels["separationDistanceSlider"] = newLabel(labelXAt, 60);
    labels["alignmentDistanceSlider"] = newLabel(labelXAt, 90);
    labels["cohesionDistanceSlider"] = newLabel(labelXAt, 120);

    labels["maxSpeedSlider"] = newLabel(labelXAt, 150);

    labels["separationForceSlider"] = newLabel(labelXAt, 180);
    labels["alignmentForceSlider"] = newLabel(labelXAt, 210);
    labels["cohesionForceSlider"] = newLabel(labelXAt, 240);
}

function updateBoidsSlider()
{
    createBoids();
}

function updateSlider()
{
    for(let i = 0; i < boids.length; i++)
    {
        boids[i].separationDistance = sliders["separationDistanceSlider"].value();       
        boids[i].alignmentDistance = sliders["alignmentDistanceSlider"].value();
        boids[i].cohesionDistance = sliders["cohesionDistanceSlider"].value();

        boids[i].maxSpeed = sliders["maxSpeedSlider"].value();

        boids[i].separationForce = sliders["separationForceSlider"].value();
        boids[i].alignmentForce = sliders["alignmentForceSlider"].value();
        boids[i].cohesionForce = sliders["cohesionForceSlider"].value();
    }
}

function draw()
{
    background(135, 206, 235);

    for(let i = 0; i < boids.length; i++)
    {
        boids[i].run(boids);
    }

    labels["FPS"].html("FPS: " + frameRate().toFixed(0));

    labels["numBoids"].html("numBoids: " + sliders["numBoids"].value());

    labels["separationDistanceSlider"].html("separationDistanceSlider: " + sliders["separationDistanceSlider"].value());
    labels["alignmentDistanceSlider"].html("alignmentDistanceSlider: " + sliders["alignmentDistanceSlider"].value());
    labels["cohesionDistanceSlider"].html("cohesionDistanceSlider: " + sliders["cohesionDistanceSlider"].value());

    labels["maxSpeedSlider"].html("maxSpeedSlider: " + sliders["maxSpeedSlider"].value());

    labels["separationForceSlider"].html("separationForceSlider: " + sliders["separationForceSlider"].value().toFixed(2));
    labels["alignmentForceSlider"].html("alignmentForceSlider: " + sliders["alignmentForceSlider"].value().toFixed(2));
    labels["cohesionForceSlider"].html("cohesionForceSlider: " + sliders["cohesionForceSlider"].value().toFixed(2));
}