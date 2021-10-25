var gamePrefs=
{
    speedNave:2,
    speedBullet:-100,
    speedEnemy:20
}

var config=
{
    type: Phaser.AUTO,
    width:128,
    height:256,
    scene:[gameState], //array con los niveles
    render:{
        pixelArt:true
    },
    physics:{
        default:'arcade',
        arcade:{
            //gravity:{y:0},
            debug:true
        }
    }
}
var juego = new Phaser.Game(config);

