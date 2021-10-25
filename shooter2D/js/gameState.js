class gameState extends Phaser.Scene
{
    constructor()
    { //crea la escena
        super(
        {
            key:"gameState"
        });
    }
    preload()
    { //carga los assets en memoria
        this.cameras.main.setBackgroundColor("#000000");
        var rutaImg = 'assets/img/';
        this.load.image('background1',rutaImg+'background_back.png');
        this.load.image('background2',rutaImg+'background_frontal.png');

        this.load.spritesheet('nave',rutaImg+'naveAnim.png',
        {frameWidth:16,frameHeight:24});
        this.load.image('bullet', 	rutaImg+'spr_bullet_0.png');
        this.load.spritesheet('enemy',rutaImg+'enemy-medium.png',
        {frameWidth:32,frameHeight:16});
        this.load.spritesheet('explosion',rutaImg+'explosion.png',
        {frameWidth:16,frameHeight:16});

        var rutaSnd = 'assets/sounds/';
        this.load.audio('shoot',rutaSnd+'snd_shoot.mp3');
        this.load.audio('hitEnemy',rutaSnd+'snd_hit.wav');
        this.load.audio('enemyExplodes',rutaSnd+'explosion.wav');
      
    }
    create()
    { //carga los assets en pantalla desde memoria
       this.bg1 = this.add.tileSprite(0,0,config.width,config.height,'background1').setOrigin(0);
       this.bg2 = this.add.tileSprite(0,0,config.width,config.height,'background2').setOrigin(0); 

       //this.nave = this.add.sprite(config.width/2,config.height/2,'nave').setOrigin(.5).setScale(3);
       //this.nave = this.add.sprite(config.width/2,config.height*.95,'nave').setOrigin(.5).setScale(1);
       this.nave = this.physics.add.sprite(config.width/2,config.height*.95,'nave').setOrigin(.5).setScale(1);
       
       this.nave.body.collideWorldBounds = true;

        this.loadAnimations();
        this.loadBullets();
        this.loadEnemies();
        this.loadExplosions();
        this.loadSounds();

        this.cursores = this.input.keyboard.createCursorKeys();

        //this.enemy = this.physics.add.sprite(config.width/2,config.height/2,'enemy').setOrigin(.5).setScale(2);

        //Disparo automático
        
        /*
        this.shootingTimer = this.time.addEvent
        (
            {
                delay:250, //ms
                callback:this.createBullet,
                callbackScope:this,
                repeat: -1
            }
        );
        */

        //Diparo manual
        this.puedoDisparar = true;
        
        this.cursores.up.on
        (
            'down', 
            function()
            {
                if(this.puedoDisparar)
                {
                    this.createBullet();
                    this.puedoDisparar = false;
                    this.shootingTimer = this.time.addEvent
                    (
                        {
                            delay:1000, //ms
                            callback:function()
                            {
                                this.puedoDisparar = true;
                            },
                            callbackScope:this,
                            repeat: 0
                        }
                    );
                }
            }
            ,this
        );

        this.enemyTimer = this.time.addEvent
        (
            {
                delay:2000, //ms
                callback:this.createEnemy,
                callbackScope:this,
                repeat: -1
            }
        );

        

        this.physics.add.overlap
        (
            this.bullets,
            this.enemies,
            this.killEnemy,
            null,
            this
        );
    }

    loadSounds()
    {
        this.shoot = this.sound.add('shoot');
        this.hitEnemy = this.sound.add('hitEnemy');
        this.enemyExplodes = this.sound.add('enemyExplodes');
    }

    loadAnimations()
    {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('nave', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.nave.anims.play('idle');
        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('nave', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
		this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('nave', { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idleEnemy',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'explosionAnim',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: 0,
            showOnStart:true,
            hideOnComplete:true
        });
    }

    loadExplosions()
    {
        this.explosions = this.add.group();
    }

    loadBullets()
    {
        this.bullets = this.physics.add.group();
    }

    loadEnemies()
    {
        this.enemies = this.physics.add.group();
    }

    createExplosion(_bullet)
    {
        var _explosion = this.explosions.getFirst(false);  //Buscamos en el pool de explosiones si hay alguna reutilizable
        if(!_explosion)
        {//No hay
            console.log('Create explosion');
            _explosion = new explosionPrefab(this,_bullet.x,_bullet.y,'explosion');
            this.explosions.add(_explosion);
        }else
        {//Si hay
            console.log('Reset explosion');
            _explosion.active = true;
            _explosion.x=_bullet.x;
            _explosion.y=_bullet.y;
            _explosion.anims.play('explosionAnim');
        }        
    }

    createBullet()
    {
        var _bullet = this.bullets.getFirst(false);  //Buscamos en el pool de balas si hay alguna reutilizable
        if(!_bullet)
        {//No hay
            console.log('Create Bullet');
            _bullet = new bulletPrefab(this,this.nave.x,this.nave.y,'bullet');
            this.bullets.add(_bullet);
        }else
        {//Si hay
            console.log('Reset Bullet');
            _bullet.active = true;
            _bullet.body.reset(this.nave.x,this.nave.y);
        }
        //Sea una bala nueva o una reutilizable, le damos velocidad
        _bullet.body.setVelocityY(gamePrefs.speedBullet);
        this.shoot.play();
    }

    createEnemy()
    {
        var _enemy = this.enemies.getFirst(false);  //Buscamos en el pool de enemigos si hay alguna reutilizable
        var posX = Phaser.Math.Between(16,config.width-16);
        var posY = -16;
        if(!_enemy)
        {//No hay
            console.log('Create Enemy');            
            _enemy = new enemyPrefab(this,posX,posY,'enemy');
            this.enemies.add(_enemy);
        }else
        {//Si hay
            console.log('Reset Enemy');
            _enemy.active = true;
            _enemy.body.reset(posX,posY);
            _enemy.health = 2;
        }
        //Sea un enemigo nuevo o uno reutilizable, le damos velocidad
        _enemy.body.setVelocityY(gamePrefs.speedEnemy);
    }

    killEnemy(_bullet,_enemy)
    {
        //Una bala ha impactado en un enemigo
        console.log('kill');
        this.createExplosion(_bullet);
        _bullet.setActive(false);
        _bullet.x = config.width+_bullet.width;
        

        _enemy.health--;

        
        

        if(_enemy.health<=0)
        {
            //sonido de "adios enemigo"
            this.enemyExplodes.play();
            //Incrementar puntuación
            //Valorar drop de powerUp
            _enemy.setActive(false);
            _enemy.x = config.width+_enemy.width;
        }else
        {
            //sonido tocado pero no hundido
            this.hitEnemy.play();
        }
        
    }

    update()
    { //actualiza assets
        this.bg1.tilePositionY -=.25;
        this.bg2.tilePositionY -=1;

        if(this.cursores.left.isDown){            			
            this.nave.anims.play('left',true);
			this.nave.body.velocity.x -=gamePrefs.speedNave;
		} else if(this.cursores.right.isDown){            
			this.nave.anims.play('right',true);           
            this.nave.body.velocity.x += gamePrefs.speedNave;        
		} else{
			this.nave.anims.play('idle',true);
			//this.nave.body.velocity.x=0;
		}

    }
}