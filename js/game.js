let game;
let isDead = false;
let level
let orientation = 'P';
let c_score = 0
let top_score = 0
let isMusic = true

let gameOptions = {

    // bird gravity, will make bird fall if you don't flap
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
    pipeHole: [150, 250],

    // coin position
    // coinLocation : []

    // local storage object name
    localStorageName: 'bestFlappyScore'
}

// let deferredPrompt;
// const addBtn = document.querySelector('.add-button');
// addBtn.style.display = 'none';

// window.addEventListener('beforeinstallprompt', (e) => {
//     // Prevent Chrome 67 and earlier from automatically showing the prompt
//     e.preventDefault();
//     // Stash the event so it can be triggered later.
//     deferredPrompt = e;
//     // Update UI to notify the user they can add to home screen
//     addBtn.style.display = 'block';
//
//     addBtn.addEventListener('click', (e) => {
//         // hide our user interface that shows our A2HS button
//         addBtn.style.display = 'none';
//         // Show the prompt
//         deferredPrompt.prompt();
//         // Wait for the user to respond to the prompt
//         deferredPrompt.userChoice.then((choiceResult) => {
//             if (choiceResult.outcome === 'accepted') {
//                 console.log('User accepted the A2HS prompt');
//             } else {
//                 console.log('User dismissed the A2HS prompt');
//             }
//             deferredPrompt = null;
//         });
//     });
// });

function startmusic(id, isloop) {
    console.log('start mmusic', id, document.getElementById(id))
    if (isMusic) {
        let x = document.getElementById(id);
        x.play();
        x.loop = isloop;
    }
}


function stopmusic(id) {
    let x = document.getElementById(id);
    x.pause();
    x.currentTime = 0
}

window.onblur = function () {
    console.log('on load',)
    stopmusic('start-music')
    stopmusic('background')
    stopmusic('bird-dead')
    stopmusic('game-over')
}

// function toggleMusic() {
//     console.log('play on start music')
//     if (isMusic) {
//         stopmusic('start-music')
//         stopmusic('background')
//         stopmusic('bird-dead')
//         stopmusic('game-over')
//     } else {
//         startmusic('start-music', true)
//     }
//     isMusic = !isMusic
// }

function startGame(selectedLevel) {
    let gameConfig
    level = selectedLevel
    console.log('start game', level)
    stopmusic('start-music')

    startmusic('background', true)
    // document.querySelector('#start-music').muted = true

    // document.querySelector('#playMusic').style.display = 'none'
    if (level === 'b') {
        gameOptions.pipeHole = [200, 350]
        gameOptions.birdSpeed = 135
    }
    if (level === 'a') {
        gameOptions.pipeHole = [150, 350]
        gameOptions.birdSpeed = 180
    }
    if (level === 'e') {
        gameOptions.pipeHole = [200, 300]
        gameOptions.birdSpeed = 250
    }
    document.getElementById('start').style.display = 'none'
    document.getElementById('thegame').style.display = 'block'

    console.log('start game down')
    gameConfig = {
        type: Phaser.FIT,
        backgroundColor: '#9dd8f6',
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
        scene: [playGame, pauseGame]
    }

    game = new Phaser.Game(gameConfig);

    // gameConfigSet()
}

function share() {
    try {
        window.Niyo.showShareIntent(JSON.stringify({text: 'Hey, I am playing Drunken B at NiYO app. My score is ' + c_score + '. I challenge you to beat it.'}))
        clevertapEventRegistration(JSON.stringify('GAME_SCORE_SHARE'))
    } catch (e) {
        console.log('error', e)
    }
}

function clevertapEventRegistration(eventPropertyString) {
    try {
        // window.Niyo.logAnalyticsEvent('GAME_SCORE', JSON.stringify({'CURRENT_SCORE': c_score, 'HIGH_SCORE': top_score}))
        window.Niyo.logAnalyticsEvent('GAME_SCORE', eventPropertyString)
    } catch (e) {
        console.log('error', e)
    }
}

function changeLevel() {
    document.getElementById('start').style.display = 'block'
    document.getElementById('thegame').style.display = 'none'
    let modal = document.getElementById("myModal");

    modal.style.display = "none";

    window.location.reload()
}


window.addEventListener("orientationchange", e => {
    orientation = screen.orientation.angle === 0 ? 'P' : 'L'
    console.log("the orientation of the device is now " + screen.orientation.angle, window.innerWidth, window.innerHeight);

    window.location.reload()
});


window.addEventListener('touchcancel', evt => {
    evt.preventDefault();
    console.log("touchcancel.");
})


class pauseGame extends Phaser.Scene {
    constructor() {
        super('PauseGame');
    }

    preload() {

    }

    create() {
        this.openModal()
        try {
            clevertapEventRegistration(JSON.stringify({'CURRENT_SCORE': c_score, 'HIGH_SCORE': top_score}))
        } catch (e) {
            console.log('error msg', e)
        }
    }


    openModal() {
        let modal = document.getElementById("myModal");
        let score = document.getElementById("score");
        let topScore = document.getElementById("max_score");
        modal.style.display = "block";
        score.innerText = c_score
        topScore.innerText = top_score

        document.getElementById('restart').addEventListener('click', e => {
            // window.location.reload()
            modal.style.display = "none";
            this.scene.launch('PlayGame')

            stopmusic('game-over')
            startmusic('background', true)
            clevertapEventRegistration(JSON.stringify('RESTARTED'))
        })
    }
}


class playGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    preload() {
        //
        // this.load.image('back_b', './back_b2.png');
        this.load.image('back_b', './images/back_b3.png');
        this.load.image('transparent_cloud', './images/transparent-cloud.png');
        this.load.image('sea', './images/sea.png');
        this.load.image('topPipe', './topPipe-blue.png');
        this.load.image('bottomPipe', './bottomPipe-blue.png');
        this.load.image('cloud', './images/cloud.png');
        this.load.image('mountain', './images/mountain.png');
        this.load.image('tree', './images/tree.png');
        this.load.image('blast', './images/blast.png');
        this.load.image('coin', './images/coin.png');

        this.load.spritesheet('birdsfly', './images/frames.png', {frameWidth: 100, frameHeight: 45});
        this.load.spritesheet('birdsfly_b', './images/birdsfly.png', {frameWidth: 105.25, frameHeight: 70});
        this.load.spritesheet('birdsfly_a', './images/bird_a.png', {frameWidth: 70, frameHeight: 57.4});

    }


    create() {
        //sound files created


        //images creation - tile format
        if (level === 'b') {

            if (window.innerHeight > 1200) {
                console.log('767.....', window.innerWidth)
                this.back = this.add.tileSprite(0, 600, window.innerWidth, window.innerHeight, 'back_b').setOrigin(0, 0)
            } else if (window.innerWidth > 767) {
                console.log('767.....', window.innerWidth)
                this.back = this.add.tileSprite(0, 300, window.innerWidth, window.innerHeight, 'back_b').setOrigin(0, 0)
            } else if (window.innerWidth < 322) {
                console.log('322.....', window.innerWidth)
                this.back = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'back_b').setOrigin(0, 0)
            } else {
                console.log('more.....', window.innerWidth)
                this.back = this.add.tileSprite(0, 100, window.innerWidth, window.innerHeight, 'back_b').setOrigin(0, 0);
            }
            // this.back = this.add.tileSprite(0, 200, window.innerWidth, window.innerHeight, 'back_b').setOrigin(0, 0).setScale(2)
            // this.bird.tileScale.x =
            // this.back.tileScale.y = '1300px'
            this.bird = this.physics.add.sprite(180, game.config.height / 2, 'birdsfly_b', 0)
            this.anims.create({
                key: 'fly',
                repeat: -1,
                frameRate: 8,
                frames: this.anims.generateFrameNames('birdsfly_b', {start: 1, end: 4})
            })
        } else {
            this.back = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'cloud').setOrigin(0, 0);
            this.mountain = this.add.tileSprite(0, 150, window.innerWidth, 300, 'mountain').setOrigin(0, 0);
            this.mountain2 = this.add.tileSprite(0, 200, window.innerWidth, 500, 'mountain').setOrigin(0, 0);
            this.tree = this.add.tileSprite(0, 400, window.innerWidth, 600, 'tree').setOrigin(0, 0);
            this.sea = this.add.tileSprite(0, 600, window.innerWidth, window.innerHeight, 'sea').setOrigin(0, 0);

            if (level === 'a') {
                this.bird = this.physics.add.sprite(180, game.config.height / 2, 'birdsfly_a', 0)
                this.anims.create({
                    key: 'fly',
                    repeat: -1,
                    frameRate: 8,
                    frames: this.anims.generateFrameNames('birdsfly_a', {start: 0, end: 1})
                })
            } else {
                //images creaation - sprite format
                this.bird = this.physics.add.sprite(180, game.config.height / 2, 'birdsfly', 0)
                this.anims.create({
                    key: 'fly',
                    repeat: -1,
                    frameRate: 8,
                    frames: this.anims.generateFrameNames('birdsfly', {start: 0, end: 1})
                })
            }

        }
        this.bird.play('fly')

        // Smooth images
        this.back.smoothed = true

        if (level != 'b') {
            this.mountain.smoothed = true;
            this.mountain2.smoothed = true;
            this.tree.smoothed = true;
        }

        //pipe creation
        this.pipeGroup = this.physics.add.group();
        this.pipePool = [];
        for (let i = 0; i < 6; i++) {
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

        //score capture
        this.score = 0;
        this.topScore = (level === 'b') ? localStorage.getItem('b') :
            ((level === 'a') ? localStorage.getItem('a') :
                localStorage.getItem('e'))
        if (this.topScore > 0)
            top_score = this.topScore
        else
            this.topScore = 0
        this.scoreText = this.add.text(10, 10, '', {
            fontSize: "20px",
            fill: '#000'
        });

        this.updateScore(this.score);
    }

    //score update
    updateScore(inc) {
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
        c_score = this.score
        top_score = c_score > top_score ? c_score : top_score
    }

    //pipe position set
    placePipes(addScore) {
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
        if (addScore) {
            this.updateScore(1);
        }
    }

    //bird flap
    flap() {
        console.log('flapp')
        this.bird.body.velocity.y = -gameOptions.birdFlapPower;
    }

    // get rightmost pipe
    getRightmostPipe() {
        let rightmostPipe = 0;
        this.pipeGroup.getChildren().forEach(function (pipe) {
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }

    // update filters
    update() {
        // console.log('bird pos....', this.bird.y)
        //image movement on update
        this.back.tilePositionX += 1.5;
        // if (level === 'b')
        // this.transparent_cloud.tilePositionX += 0.5;
        if (level !== 'b') {
            this.mountain.tilePositionX += 0.50;
            this.mountain2.tilePositionX += 0.80;
            this.tree.tilePositionX += 1.10;
            this.sea.tilePositionX += 1.4;
        }
        //collision or fly set
        this.physics.world.collide(this.bird, this.pipeGroup, function () {
            this.die()
        }, null, this);
        if (this.bird.y > game.config.height || this.bird.y < 0) {
            this.die()
        }

        //push new pipes
        this.pipeGroup.getChildren().forEach(function (pipe) {
            if (pipe.getBounds().right < 0) {
                this.pipePool.push(pipe);
                if (this.pipePool.length == 2) {
                    this.placePipes(true);
                }
            }
        }, this)

        window.onblur = function () {
            // this.scene.pause('PlayGame');

            stopmusic('background')
            stopmusic('bird-dead')
            stopmusic('game-over')
        }

    }

    //bird died
    die() {
        (level === 'b') ? localStorage.setItem(gameOptions.localStorageName[0], Math.max(this.score, this.topScore)) :
            ((level === 'a') ? localStorage.setItem(gameOptions.localStorageName[1], Math.max(this.score, this.topScore)) :
                    localStorage.setItem(gameOptions.localStorageName[1], Math.max(this.score, this.topScore))
            )

        this.bird = this.add.image(this.bird.x, this.bird.y, 'blast')

        this.scene.pause('PlayGame');
        setTimeout(e => {
            startmusic('game-over', false)
            this.scene.launch('PauseGame')
        }, 1000)

        stopmusic('background')
        startmusic('bird-dead', false)

        isDead = true
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
        // document.querySelector('.alert').removeAttribute('hidden');
    }
}
