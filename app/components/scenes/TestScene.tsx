import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class TestScene extends Scene
{
    private snowybg!: Phaser.GameObjects.TileSprite;
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    TestSceneText !: Phaser.GameObjects.Text;

    constructor ()
    {
        super('TestScene');
    }

    create ()
    {
        const {width,height} = this.scale;
        this.snowybg = this.add.tileSprite(0,0,width,height,'snowybg').setScale(2);

        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.TestSceneText = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        EventBus.emit('current-scene-ready', this);
    }

    update(time:number, delta:number):void {
        this.snowybg.tilePositionX += 0.1;
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
