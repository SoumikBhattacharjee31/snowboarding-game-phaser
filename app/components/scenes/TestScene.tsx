import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class TestScene extends Scene {
  private snowybg!: Phaser.GameObjects.TileSprite;
  private graphics!: Phaser.GameObjects.Graphics;
  private curve!: Phaser.Curves.Spline;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private curvePoints!: Phaser.Math.Vector2[];
  private curveProgress: number = 0;
//   camera!: Phaser.Cameras.Scene2D.Camera;
//   background!: Phaser.GameObjects.Image;
//   TestSceneText!: Phaser.GameObjects.Text;

  constructor() {
    super("TestScene");
  }

  preload() {
    // Load your assets here
    // this.load.image("snowybg", "path/to/snowybg.png");
    // this.load.image("snowboarder", "path/to/snowboarder.png");
    // this.load.image("background", "path/to/background.png");
  }

  create() {
    // Create and scale the snowy background
    const { width, height } = this.scale;
    this.snowybg = this.add.tileSprite(0, 0, width, height, "snowybg").setScale(2).setOrigin(0, 0);

    // Add graphics to draw the curve
    this.graphics = this.add.graphics();
    this.curvePoints = [
      new Phaser.Math.Vector2(-300, 600),
      new Phaser.Math.Vector2(-100, 300),
      new Phaser.Math.Vector2(100, 300),
      new Phaser.Math.Vector2(300, 400),
      new Phaser.Math.Vector2(500, 200),
      new Phaser.Math.Vector2(700, 300),
      new Phaser.Math.Vector2(900, 500),
      new Phaser.Math.Vector2(1100,400),
      new Phaser.Math.Vector2(1300,400),
      new Phaser.Math.Vector2(1500,100),
    ];
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.curve.draw(this.graphics, 64);

    // Create the player sprite
    this.player = this.physics.add.sprite(100, 300, "snowboarder").setScale(0.05);
    this.player.setCollideWorldBounds(true);

    // Set up the camera
    // this.camera = this.cameras.main;
    // this.camera.setBackgroundColor(0xff0000);

    // Add a semi-transparent background image
    // this.background = this.add.image(512, 384, "background");
    // this.background.setAlpha(0.5);

    // Add "Game Over" text
    // this.TestSceneText = this.add.text(512, 384, "Game Over", {
    //   fontFamily: "Arial Black",
    //   fontSize: 64,
    //   color: "#ffffff",
    //   stroke: "#000000",
    //   strokeThickness: 8,
    //   align: "center",
    // }).setOrigin(0.5).setDepth(100);

    // Emit an event to notify that the current scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  update(time: number, delta: number): void {
    // Move the background to create a parallax effect
    this.snowybg.tilePositionX += 0.1;

    // Move the curve to the left
    this.moveCurve(-1); // Adjust the speed as needed

    // Update the player position along the curve
    this.curveProgress += delta * 0.00008; // Adjust speed as needed
    if (this.curveProgress > 1) {
      this.curveProgress -= 1;
    }
    const point = this.curve.getPoint(this.curveProgress);
    // this.player.x = point.x;
    // this.player.y = point.y;
    let temp = this.getYForX(this.player.x);
    this.player.y = temp==null?this.player.y:temp;

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
