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

        this.seperationWeight = 1;
        this.alignmentWeight = 1;
        this.cohesionWeight = 1;
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

        sep.mult(this.seperationWeight);
        ali.mult(this.alignmentWeight);
        coh.mult(this.cohesionWeight);

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

        boid.separationDistance = sliders["separationDistance"].value();       
        boid.alignmentDistance = sliders["alignmentDistance"].value();
        boid.cohesionDistance = sliders["cohesionDistance"].value();

        boid.maxSpeed = sliders["maxSpeed"].value();

        boid.separationForce = sliders["separationForce"].value();
        boid.alignmentForce = sliders["alignmentForce"].value();
        boid.cohesionForce = sliders["cohesionForce"].value();
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

    let numBoids = 200;
    let maxBoids = 1000;

    sliders["numBoids"] = newSlider(width, 30, numBoids, maxBoids, numBoids, 1, "updateBoidsSlider()");

    sliders["separationDistance"] = newSlider(width, 60, 0, width, 20, 1, "updateSlider()");
    sliders["alignmentDistance"] = newSlider(width, 90, 0, width, 50, 1, "updateSlider()");
    sliders["cohesionDistance"] = newSlider(width, 120, 0, width, 50, 1, "updateSlider()");

    sliders["maxSpeed"] = newSlider(width, 150, 0, 5, 2, 1, "updateSlider()");

    sliders["separationForce"] = newSlider(width, 180, 0, 5, 0.03, 0.001, "updateSlider()");
    sliders["alignmentForce"] = newSlider(width, 210, 0, 5, 0.03, 0.0001, "updateSlider()");
    sliders["cohesionForce"] = newSlider(width, 240, 0, 5, 0.03, 0.0001, "updateSlider()");

    sliders["seperationWeight"] = newSlider(width, 270, 0, 5, 1, 0.1, "updateSlider()");
    sliders["alignmentWeight"] = newSlider(width, 300, 0, 5, 1, 0.1, "updateSlider()");
    sliders["cohesionWeight"] = newSlider(width, 330, 0, 5, 1, 0.1, "updateSlider()");

    createBoids();

    let siderWidth = sliders["numBoids"].width;
    let labelXAt = width + siderWidth + 10;

    labels["FPS"] = newLabel(width, 0);

    labels["numBoids"] = newLabel(labelXAt, 30);

    labels["separationDistance"] = newLabel(labelXAt, 60);
    labels["alignmentDistance"] = newLabel(labelXAt, 90);
    labels["cohesionDistance"] = newLabel(labelXAt, 120);

    labels["maxSpeed"] = newLabel(labelXAt, 150);

    labels["separationForce"] = newLabel(labelXAt, 180);
    labels["alignmentForce"] = newLabel(labelXAt, 210);
    labels["cohesionForce"] = newLabel(labelXAt, 240);

    labels["seperationWeight"] = newLabel(labelXAt, 270);
    labels["alignmentWeight"] = newLabel(labelXAt, 300);
    labels["cohesionWeight"] = newLabel(labelXAt, 330);
}

function updateBoidsSlider()
{
    createBoids();
}

function updateSlider()
{
    for(let i = 0; i < boids.length; i++)
    {
        boids[i].separationDistance = sliders["separationDistance"].value();       
        boids[i].alignmentDistance = sliders["alignmentDistance"].value();
        boids[i].cohesionDistance = sliders["cohesionDistance"].value();

        boids[i].maxSpeed = sliders["maxSpeed"].value();

        boids[i].separationForce = sliders["separationForce"].value();
        boids[i].alignmentForce = sliders["alignmentForce"].value();
        boids[i].cohesionForce = sliders["cohesionForce"].value();

        boids[i].seperationWeight = sliders["seperationWeight"].value();
        boids[i].alignmentWeight = sliders["alignmentWeight"].value();
        boids[i].cohesionWeight = sliders["cohesionWeight"].value();
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

    labels["separationDistance"].html("separationDistance: " + sliders["separationDistance"].value());
    labels["alignmentDistance"].html("alignmentDistance: " + sliders["alignmentDistance"].value());
    labels["cohesionDistance"].html("cohesionDistance: " + sliders["cohesionDistance"].value());

    labels["maxSpeed"].html("maxSpeedSlider: " + sliders["maxSpeed"].value());

    labels["separationForce"].html("separationForce: " + sliders["separationForce"].value().toFixed(2));
    labels["alignmentForce"].html("alignmentForce: " + sliders["alignmentForce"].value().toFixed(2));
    labels["cohesionForce"].html("cohesionForce: " + sliders["cohesionForce"].value().toFixed(2));

    labels["seperationWeight"].html("seperationWeight: " + sliders["seperationWeight"].value().toFixed(2));
    labels["alignmentWeight"].html("alignmentWeight: " + sliders["alignmentWeight"].value().toFixed(2));
    labels["cohesionWeight"].html("cohesionWeight: " + sliders["cohesionWeight"].value().toFixed(2));
}