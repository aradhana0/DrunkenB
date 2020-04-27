var game;
var isNewGame = true;



var gameOptions = {

    // bird gravity, will make bird fall if you don't flap
    birdInitialGravity: 200,
    birdGravity: 800,

    // horizontal bird speed
    birdSpeed: 125,

    // flap thrust
    birdFlapPower: 300,

    // minimum pipe height, in pixels. Affects hole position
    minPipeHeight: 50,

    // distance range from next pipe, in pixels
    pipeDistance: [220, 300],

    // hole range between pipes, in pixels
    pipeHole: [200, 400],

    // local storage object name
    localStorageName: 'bestFlappyScore'
}

function startGame() {
    console.log('start game')
    document.getElementById('start').style.display = 'none'
    document.getElementById('thegame').style.display = 'block'
    // var x = document.getElementById("myAudio");
    // x.play();
    // x.loop = true;
    console.log('start game down')
    let gameConfig = {
        type: Phaser.FIT,
        backgroundColor:'#9dd8f6',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'thegame',
            width: window.innerWidth,
            height: window.innerHeight
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    // gameConfigSet()
}
// function endGame() {
//     document.getElementById('start').style.display = 'block'
//     document.getElementById('thegame').style.display = 'none'
//     window.location.reload()
// }
//
//
// window.addEventListener("orientationchange", function() {
//     console.log("the orientation of the device is now " + screen.orientation.angle);
//     window.location.reload()
// });


window.addEventListener('touchcancel',function (evt) {
    evt.preventDefault();
    console.log("touchcancel.");
})


class playGame extends Phaser.Scene{
    constructor(){
        super('PlayGame');
        // this.scene.start('PlayGame');
    }
    preload(){
        // this.load.audio('dead', './assets/sound/explosion.mp3')
        this.load.image('bird', 'bird.png');
        this.load.image('topPipe', './topPipe-blue.png');
        this.load.image('bottomPipe', './bottomPipe-blue.png');
        this.load.image('nightSky', './images/cloud.png');
        this.load.image('mountain', './images/mountain.png');
        this.load.image('tree', './images/tree.png');
        this.load.spritesheet('birdsfly', './images/birdsprite.png', {frameWidth:143.5, frameHeight:93});
    }


    create(){
        //sound files created
        // let background = this.sound.add('background')
        // background.play()


        //images creation - tile format
        this.back = this.add.tileSprite(0,0,window.innerWidth,window.innerHeight, 'nightSky' ).setOrigin(0, 0);
        // this.cloud = this.add.tileSprite(0,150,window.innerWidth,window.innerHeight, 'nightSky' ).setOrigin(0, 0);
        this.mountain = this.add.tileSprite(0,150,window.innerWidth,window.innerHeight, 'mountain' ).setOrigin(0, 0);
        this.mountain2 = this.add.tileSprite(0,400,window.innerWidth,window.innerHeight, 'mountain' ).setOrigin(0, 0);
        this.tree = this.add.tileSprite(0,350,window.innerWidth,window.innerHeight, 'tree' ).setOrigin(0, 0);


        //images creaation - sprite format
        this.bird = this.physics.add.sprite(180, game.config.height / 2, 'birdsfly',0)
        this.anims.create({
            key: 'fly',
            repeat: -1,
            frameRate: 8,
            frames: this.anims.generateFrameNames('birdsfly', {start:0, end:1})
        })
        this.bird.play('fly')

        // Smooth images
        this.back.smoothed = true
        this.mountain.smoothed = true;
        this.mountain2.smoothed = true;

        //pipe creation
        this.pipeGroup = this.physics.add.group();
        this.pipePool = [];
        for(let i = 0; i < 6; i++){
            this.pipePool.push(this.pipeGroup.create(100, 0, 'topPipe'));
            this.pipePool.push(this.pipeGroup.create(100, 0, 'bottomPipe'));
            this.placePipes(false);
        }

        // Pipe velocity set
        this.pipeGroup.setVelocityX(-gameOptions.birdSpeed);

        //bird gravity set
        this.bird.body.gravity.y = gameOptions.birdGravity;

        //interaction effect initialized
        this.input.on('pointerdown', this.flap, this);
        // this.input.on('touchscreen', this.flap, this);

        //score capture
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);
    }

    //score update
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;

    }

    //pipe position set
    placePipes(addScore){
        let rightmost = this.getRightmostPipe();
        let pipeHoleHeight = Phaser.Math.Between(gameOptions.pipeHole[0], gameOptions.pipeHole[1]);
        let pipeHolePosition = Phaser.Math.Between(gameOptions.minPipeHeight + pipeHoleHeight / 2, game.config.height - gameOptions.minPipeHeight - pipeHoleHeight / 2);
        this.pipePool[0].x = rightmost + this.pipePool[0].getBounds().width + Phaser.Math.Between(gameOptions.pipeDistance[0], gameOptions.pipeDistance[1]);
        this.pipePool[0].y = pipeHolePosition - pipeHoleHeight / 2;
        this.pipePool[0].setOrigin(0, 1);
        this.pipePool[1].x = this.pipePool[0].x;
        this.pipePool[1].y = pipeHolePosition + pipeHoleHeight / 2;
        this.pipePool[1].setOrigin(0, 0);
        this.pipePool = [];
        if(addScore){
            this.updateScore(1);
        }
    }

    //bird flap
    flap(){
        console.log('flapp')
        this.bird.body.velocity.y = -gameOptions.birdFlapPower;
    }

    // get rightmost pipe
    getRightmostPipe(){
        let rightmostPipe = 0;
        this.pipeGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }

    // update filters
    update(){
        //image movement on update
        this.back.tilePositionX += 0.5;
        // this.cloud.tilePositionX += 0.1;
        this.mountain.tilePositionX += 0.80;
        this.mountain2.tilePositionX += 1.0;
        this.tree.tilePositionX += 1.10;

        //collision or fly set
        this.physics.world.collide(this.bird, this.pipeGroup, function(){
            // document.getElementById("myAudio").pause()
            this.die()
        }, null, this);
        if(this.bird.y > game.config.height || this.bird.y < 0){
            // document.getElementById("myAudio").pause()
            this.die()
        }

        //push new pipes
        this.pipeGroup.getChildren().forEach(function(pipe){
            if(pipe.getBounds().right < 0){
                this.pipePool.push(pipe);
                if(this.pipePool.length == 2){
                    this.placePipes(true);
                }
            }
        }, this)
    }

    //bird died
    die(){
        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
        this.scene.pause('PlayGame');
        // this.scoreText = this.add.text(window.innerWidth/2-300, window.innerHeight-200, 'GAME OVER', { fontSize:"50px",  fill: '#000' });
        // // endGame()
        // this.scoreText.setFontSize("600")
        // let background = this.sound.play('died')
        // background.play()
        // this.bird = this.physics.add.sprite(180, game.config.height / 2, 'birddie',0)
        window.location.reload()
    }
}

//service worker event listener
window.addEventListener("click", e => {
    new playGame();
    registerSW();
});

//service worker register
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            alert('ServiceWorker registration failed. Sorry about that.');
        }
    } else {
        document.querySelector('.alert').removeAttribute('hidden');
    }
}
