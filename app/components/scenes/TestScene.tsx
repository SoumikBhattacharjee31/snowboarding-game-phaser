import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class TestScene extends Scene {
  private snowybg!: Phaser.GameObjects.TileSprite;
  private graphics!: Phaser.GameObjects.Graphics;
  private curve!: Phaser.Curves.Spline;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private curvePoints!: Phaser.Math.Vector2[];
  private curveIndex: number = 0;
  private isJumping: boolean = false;
  private obstacles!: Phaser.Physics.Arcade.Group;

  constructor() {
    super("TestScene");
  }

  create() {
    const { width, height } = this.scale;
    this.snowybg = this.add.tileSprite(0, 0, width, height, "snowybg").setScale(2).setOrigin(0, 0);

    this.graphics = this.add.graphics();
    this.curvePoints = [
      new Phaser.Math.Vector2(-300, 100),
      new Phaser.Math.Vector2(-100, 300),
      new Phaser.Math.Vector2(100, 300),
      new Phaser.Math.Vector2(300, 400),
      new Phaser.Math.Vector2(500, 200),
      new Phaser.Math.Vector2(700, 300),
      new Phaser.Math.Vector2(900, 200),
      new Phaser.Math.Vector2(1100,400),
      new Phaser.Math.Vector2(1300,400),
      new Phaser.Math.Vector2(1500,100),
    ];
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.curve.draw(this.graphics, 128);

    this.player = this.physics.add.sprite(100, 300, "snowboarder").setScale(0.05);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0); // Prevent gravity from affecting the player

    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-F", this.jump, this);
    }

    this.obstacles = this.physics.add.group();
    this.time.addEvent({
      delay: 2000,
      callback: this.addObstacle,
      callbackScope: this,
      loop: true
    });
    this.physics.add.collider(this.player, this.obstacles, this.handleCollision, undefined, this);

    EventBus.emit("current-scene-ready", this);
  }

  addObstacle() {
    const obstacleType = Phaser.Math.Between(0, 1) === 0 ? "bird" : "stone";
    const temp = this.getYForX(this.scale.width+50);
    const temp2 = temp==null?-100:temp;
    const x = this.scale.width + 50;
    const y = obstacleType === "bird" ? Phaser.Math.Between(50, temp2-50) : temp2 - 50;
    const obstacle = this.obstacles.create(x, y, obstacleType) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    obstacle.setVelocityX(-100);
    obstacle.setScale(0.04);
    obstacle.setOrigin(0.5, 0.5);
    obstacle.body.setAllowGravity(false);
  }

  handleCollision(player: any, obstacle: any) {
    this.scene.start("MainMenu");
  }

  update(time: number, delta: number): void {
    this.snowybg.tilePositionX += 0.1;
    this.moveCurve(-1);

    const temp = this.getYForX(this.player.x);
    if (temp!=null) {
      if(!this.isJumping)
        this.player.y = temp-25;
      else if(this.player.y>temp)
        this.isJumping=false;
    }

    const temp1 = this.getYForX(this.player.x-20);
    const temp2 = this.getYForX(this.player.x+20);
    if(temp1!=null && temp2!=null){
        const angle2 = Phaser.Math.RadToDeg(Math.atan2(temp2-temp1, 40));
        let angle = 0;
        if(angle2>=-15&&angle2<=15) angle=0;
        else if(angle2>=-45&&angle2<=-15) angle=-30;
        else if(angle2<-45) angle=-60;
        else if(angle2>=15&&angle2<=45) angle=30;
        else if(angle2>45) angle=60;
        this.player.setAngle(angle/2)
    }

    this.fillBelowCurve();
    // this.graphics.fillPoints(this.curve.getPoints())
  }

  jump() {
    if (!this.isJumping) {
      // this.player.y-=40;
      this.isJumping = true;
      this.player.setVelocityY(-70);
      // this.time.delayedCall(500, () => {
      //   this.player.setVelocityY(0);
      //   this.isJumping = false;
      // });
    }
  }

  fillBelowCurve() {
    const { width, height } = this.scale;
    const points = this.curve.getSpacedPoints(500); // Increase the number of points for better accuracy
  
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(0, height);
  
    points.forEach(point => {
      this.graphics.lineTo(point.x, point.y);
    });
  
    this.graphics.lineTo(width, height);
    this.graphics.closePath();
    this.graphics.fillPath();
  }
  

  alternatefill() {
  }

  changeScene() {
    // Switch to the MainMenu scene
    this.scene.start("MainMenu");
  }

  getYForX(x: number): number | null {
    const precision = 100; // Number of samples along the curve
    let closestPoint = null;
    let closestDistance = Infinity;

    for (let i = 0; i <= precision; i++) {
      const t = i / precision;
      const point = this.curve.getPoint(t);
      const distance = Math.abs(point.x - x);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    }

    return closestPoint ? closestPoint.y : null;
  }

  private moveCurve(deltaX: number) {
    // Move each point of the curve by deltaX
    this.curvePoints.forEach(point => {
      point.x += deltaX;
    });

    // Remove points that go off-screen and add new points to the end
    if (this.curvePoints[0].x < -300) {
      this.curvePoints.shift();
      const lastPoint = this.curvePoints[this.curvePoints.length - 1];
      const newX = lastPoint.x + 200; // distance between points
      const newY = Phaser.Math.Between(200, 400); // random y position
      this.curvePoints.push(new Phaser.Math.Vector2(newX, newY));
    }

    // Clear and redraw the curve
    this.graphics.clear();
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.curve.draw(this.graphics, 64);
  }
}
