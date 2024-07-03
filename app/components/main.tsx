import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { TestScene } from './scenes/TestScene';
import { GameOverScene } from './scenes/GameOverScene';
import { HighScoresScene } from './scenes/HighScoreScene';
import { MainMenuScene } from './scenes/MainMenuScene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenuScene,
        MainMenu,
        MainGame,
        GameOver,
        GameOverScene,
        TestScene,
        HighScoresScene,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {x:0,y:20}
        }
    }
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
