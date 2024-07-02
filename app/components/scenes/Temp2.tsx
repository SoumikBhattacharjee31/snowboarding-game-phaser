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

  preload() {
    this.load.image("bird", "path/to/bird.png");
    this.load.image("stone", "path/to/stone.png");
    this.load.image("snowybg", "path/to/snowybg.png");
    this.load.image("snowboarder", "path/to/snowboarder.png");
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
      new Phaser.Math.Vector2(1100, 400),
      new Phaser.Math.Vector2(1300, 400),
      new Phaser.Math.Vector2(1500, 100),
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

  update(time: number, delta: number): void {
    this.snowybg.tilePositionX += 0.1;
    this.moveCurve(-0.5);

    const point = this.curve.getPoint(this.curveIndex / 100);
    if (point) {
      if (!this.isJumping) {
        this.player.y = point.y;
      }
      this.player.rotation = Phaser.Math.Angle.BetweenPoints(this.player, point);
    }

    this.curveIndex++;
    if (this.curveIndex >= 100) {
      this.curveIndex = 0;
    }

    this.fillBelowCurve();
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.player.setVelocityY(-300);
      this.time.delayedCall(500, () => {
        this.player.setVelocityY(0);
        this.isJumping = false;
      });
    }
  }

  moveCurve(deltaX: number) {
    this.curvePoints.forEach(point => {
      point.x += deltaX;
    });

    if (this.curvePoints[0].x < -300) {
      this.curvePoints.shift();
      const lastPoint = this.curvePoints[this.curvePoints.length - 1];
      const newX = lastPoint.x + 200;
      const newY = Phaser.Math.Between(200, 400);
      this.curvePoints.push(new Phaser.Math.Vector2(newX, newY));
    }

    this.graphics.clear();
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.curve.draw(this.graphics, 64);
  }

  fillBelowCurve() {
    const { width, height } = this.scale;
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(0, height);
    this.curvePoints.forEach(point => {
      this.graphics.lineTo(point.x, point.y);
    });
    this.graphics.lineTo(width, height);
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  addObstacle() {
    const obstacleType = Phaser.Math.Between(0, 1) === 0 ? "bird" : "stone";
    const x = this.scale.width + 50;
    const y = obstacleType === "bird" ? Phaser.Math.Between(50, 150) : this.scale.height - 50;
    const obstacle = this.obstacles.create(x, y, obstacleType) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    obstacle.setVelocityX(-200);
    obstacle.setScale(0.1);
    obstacle.setOrigin(0.5, 0.5);

    obstacle.body.setAllowGravity(false);
  }

  handleCollision(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, obstacle: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
    this.scene.start("GameOverScene");
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
