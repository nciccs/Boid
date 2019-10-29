var boids = [];
var NUM_BOIDS = 100;

class Boid
{
    constructor(x, y)
    {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        //this.velocty = createVector(0, -1); //test
        this.acceleration = createVector(0, 0);
        this.r = 8.0;

        this.separationDistance = 16;
        //this.alignmentDistance = 25;
        //this.cohesionDistance = 25;
        //this.separationDistance = 25;
        this.alignmentDistance = 50;
        this.cohesionDistance = 50;

        this.maxSpeed = 3;
        this.maxForce = 0.03;
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

        sep.mult(1.5);

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
            steer.limit(this.maxForce);
        }

        return steer;
    }

    alignment(boids)
    {
        let steer = createVector(0, 0);
        let count = 0;
        for(let i = 0; i < boids.length; i++)
        {
            //alert("here");
            //let d = p5.Vector.dist(this.position, boids[i].position);
            let d = p5.Vector.sub(this.position, boids[i].position).magSq();
            //if(0 < d && d < this.alignmentDistance)
            if(0 < d && d < this.alignmentDistance*this.alignmentDistance)
            {
                //alert("here");
                steer.add(boids[i].velocity);
                count++;
            }
        }

        if(count > 0)
        {
            steer.div(count);
            steer.normalize();
            steer.mult(this.maxSpeed);
            //steer = p5.Vector.sub(steer, this.velocity);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
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
            steer.limit(this.maxForce);
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
        noFill();
        //ellipse(0, 0, this.separationDistance*2, this.separationDistance*2);
        pop();
    }

    static calcPythagorasB(sideC, sideA)
    {
        return Math.sqrt(sideC*sideC - sideA*sideA);
    }
}

function createBoids(numBoids)
{
    boids = [];
    for(let i = 0; i < numBoids; i++)
    {
        //boids.push(new Boid(width/2, height/2));
        boids.push(new Boid(random(0, width), random(0, height)));
    }
}

function setup()
{
    // put setup code here
    createCanvas(640, 480);
    //createCanvas(480, 360);
    //createCanvas(300, 300);
    frameRate(60);

    slider = createSlider(NUM_BOIDS, 600, NUM_BOIDS);
    slider.position(110, 30);
    slider.attribute('onchange', 'updateSlider()');
    //slider.style('opacity', 0.6);
    createBoids(slider.value());
    /*for(let i = 0; i < NUM_BOIDS; i++)
    {
        boids.push(new Boid(width/2, height/2));
        //boids.push(new Boid(random(0, width), random(0, height)));
    }*/
}

function updateSlider()
{
    createBoids(slider.value());
}

function draw()
{
    background(135, 206, 235);

    for(let i = 0; i < boids.length; i++)
    {
        boids[i].run(boids);
    }

    let fps = frameRate();
    push();
    textSize(20);
    fill("RED");
    stroke("RED");
    let output = "FPS: " + fps.toFixed(2) + '\n' + "Boids: " + boids.length;
    text(output, 10, 25);
    pop();
}