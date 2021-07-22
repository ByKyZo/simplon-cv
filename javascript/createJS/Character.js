class Character {
    /**
     * Character State
     */
    FLOOR = 500;
    Action = {
        current: null,
        alreadyDo: false,
        doNext: null,
        props: {},
    };
    direction = {
        current: null,
        left: 1,
        right: 2,
    };
    /**
     * Constructor
     */
    stage;
    loaderImageID;
    characterSpriteSheet;
    character;
    interactiveObjects;
    spriteSheetsConfig = {
        frames: {
            width: 192,
            height: 256,
        },
        animations: {
            idle: [0],
            walk: {
                frames: [37, 38, 39, 40, 41, 42, 43],
                speed: 0.2,
            },
            run: {
                frames: [24, 25, 26],
                speed: 0.3,
            },
            climb: {
                frames: [5, 6],
                speed: 0.2,
            },
            fall: {
                frames: [44],
                speed: 0.2,
            },
            preJump: {
                frames: [3],
                speed: 0.2,
            },
            jump: {
                frames: [8],
                speed: 0.1,
            },
            dash: {
                frames: [10],
                speed: 0.1,
            },
        },
    };

    constructor(loaderImageID, stage, interactiveObjects) {
        this.loaderImageID = loaderImageID;
        this.stage = stage;
        this.interactiveObjects = interactiveObjects;
    }

    async start() {
        this.beforeStart();

        while (true) {
            /**
             * Si le chiffre generé est egal a 1 le personnage effectura l'action sur le prochain objet interactif
             */
            this.Action.doNext = getRandomNumber(2);

            /**
             * Si le personnage a deja effectué une action interactive , il ne fera pas la prochaine
             */
            if (this.Action.alreadyDo) {
                console.log('already do action');
                this.Action.doNext = 2;
                this.Action.current = 'moove';
            }

            switch (this.Action.current) {
                case 'moove':
                    await this.moove();
                    break;
                case 'climb':
                    await this.climb();
                    break;
                case 'fall':
                    await this.fall();
                    break;
                case 'jump':
                    await this.jump();
                    break;
                case 'dash':
                    await this.dash();
                    break;
                default:
                    await this.moove();
            }
        }
    }

    /**
     * * Function permettant de faire marcher / courir le personnage
     */
    async moove() {
        /**
         * Genere un nombre aleatoire d'action 'moove' a effectuée
         */
        const actionRepeatNumber = getRandomNumber(60, 20);
        /**
         * Genere une direction aleatoire (gauche / droite)
         */
        const direction = getRandomNumber(2);
        /**
         * Si le chiffre generé est egal a 1 le personnage fait une actions
         */
        const randomAction = getRandomNumber(7);
        /**
         * Si le chiffre generé est egal a 1 le personnage fait court
         */
        const isRunning = getRandomNumber(2);
        /**
         * La valeur a ajouter dans l'axe pour faire avancer le personnage
         */
        let addAxisValue;

        /**
         * Applique la direction , la valeur a ajouter dans l'axe , le sens du personnage
         * -> Selon les valeurs generées par les constantes
         */
        if (direction === this.direction.left) {
            this.direction.current = this.direction.left;
            if (isRunning === 1) {
                addAxisValue = -20;
                this.character.gotoAndPlay('run');
            } else {
                addAxisValue = -10;
                this.character.gotoAndPlay('walk');
            }
            this.character.scaleX = -1;
        } else if (direction === this.direction.right) {
            this.direction.current = this.direction.right;
            if (isRunning === 1) {
                addAxisValue = 20;
                this.character.gotoAndPlay('run');
            } else {
                addAxisValue = 10;
                this.character.gotoAndPlay('walk');
            }
            this.character.scaleX = 1;
        }

        for (let i = 0; i < actionRepeatNumber; i++) {
            await this.actionInterval();

            const mooveCalcul = this.character.x + addAxisValue;

            /**
             * Detecte si il y'a un objet interactif a chaque pas (tour de boucle)
             * Si le personnage effectue l'action il arrete la fonction
             */
            if (this.handleInteractiveObjects()) {
                return;
            }

            /**
             * Verifie si le personnage a une collision avec les bords du canvas
             * Si oui il arrete la fonction
             */
            if (this.hasCanvasBorderCollision(mooveCalcul)) {
                return;
            }

            /**
             * Sinon il continue sa route et reset la direction actuelle
             */

            this.character.x += addAxisValue;
        }

        /**
         * Pourra faire la prochaine action
         */
        this.Action.alreadyDo = false;

        /**
         * Effectue une action aleatoire selon le chiffre genéré
         */
        if (randomAction === 1) {
            this.character.gotoAndPlay('idle');
            await this.actionInterval(1000);
        } else if (randomAction === 2) {
            this.startAction('jump');
        } else if (randomAction === 3 || randomAction === 4 || randomAction === 5) {
            this.startAction('dash');
        }
    }

    /**
     ** Boucle sur la tableaux des objet interactif passer au constructeur
     ** -> Si le personnage entre en collision avec un de ces objets il commence l'action defini
     */
    handleInteractiveObjects() {
        for (let i = 0; i < this.interactiveObjects.length; i++) {
            if (this.Action.doNext === 1) {
                const interactObject = this.interactiveObjects[i];

                if (this.hasCollision(interactObject.element)) {
                    if (interactObject.type === 'ladder') {
                        this.startAction('climb', {
                            elClimbed: interactObject.element,
                        });
                    }

                    return true;
                }
            }
        }
        return false;
    }

    /**
     ** Permet au personnage de grimper l'element passer en props
     ** -> Et s'arrete quand le bas du personnage arrive en haut de l'element
     ** -> Ensuite il descend l'echelle
     */
    async climb() {
        this.character.gotoAndPlay('climb');
        const elClimbed = this.Action.props.elClimbed;
        const elClimbedDim = this.getElDimension(elClimbed);
        let characterDim = this.getElDimension(this.character);

        /**
         * Monte l'element
         */
        while (characterDim.endY >= elClimbedDim.startY) {
            await this.actionInterval(100);

            this.character.y += -10;
            characterDim = this.getElDimension(this.character);
        }

        /**
         * Descend l'element
         */
        while (characterDim.startY <= this.FLOOR) {
            await this.actionInterval(100);

            this.character.y += 10;
            characterDim = this.getElDimension(this.character);
        }

        this.resetAction();
    }

    /**
     ** Fait tomber le personnage jusqu'a la limite defini pour le sol
     */
    async fall() {
        this.character.gotoAndPlay('fall');

        while (this.character.y <= this.FLOOR) {
            await this.actionInterval(20);
            this.character.y += 10;
        }

        this.resetAction();
    }

    /**
     ** Permet au personnage de faire un saut
     ** a la fin de l'action il commence l'action 'fall'
     */
    async jump() {
        this.character.gotoAndPlay('preJump');
        await this.actionInterval(1000);
        this.character.gotoAndPlay('jump');

        for (let i = 0; i < 40; i++) {
            await this.actionInterval(10);
            this.character.y -= 10;
        }

        this.startAction('fall');
    }

    /**
     ** Permet au personnage de faire un dash / glisser
     */
    async dash() {
        this.character.gotoAndPlay('dash');

        const addXValue = this.direction.current === this.direction.left ? -10 : 10;

        for (let i = 0; i < 20; i++) {
            await this.actionInterval(40);
            const mooveCalcul = this.character.x + addXValue;
            if (this.hasCanvasBorderCollision(mooveCalcul)) break;
            this.character.x += addXValue;
        }

        this.resetAction();
    }

    /**
     ** Renvoie la position X / Y de depart et de fin de l'element passer en parametre
     */
    getElDimension(el) {
        const { width, height } = el.getBounds();

        const dimensions = {
            startX: el.x,
            endX: el.x + width,
            startY: el.y,
            endY: el.y + height,
        };

        return { ...dimensions };
    }

    /**
     ** Verifie si le personnage a une collision avec l'element passer en parametre
     */
    hasCollision(target) {
        const { startX, endX, startY, endY } = this.getElDimension(target);

        return (
            (this.character.x >= startX && this.character.x <= endX) ||
            (this.character.y <= startY && this.character.y >= endY)
        );
    }

    /**
     ** Verifie si le personnage a une collision avec un bord du canvas
     ** -> Et Change sa direction si oui
     */
    hasCanvasBorderCollision(mooveCalcul) {
        if (mooveCalcul >= this.stage.canvas.width) {
            /**
             * Verifie si le personnage atteint le bord a droit du stage.canvas
             * Si oui il change sa direction
             */
            this.direction.current = this.direction.left;
            return true;
        } else if (mooveCalcul <= 0) {
            /**
             * Verifie si le personnage atteint le bord a gauche du stage.canvas
             * Si oui il change sa direction
             */
            this.direction.current = this.direction.right;
            return true;
        }
        return false;
    }

    /**
     ** Permet de commencer une action plus proprement
     */
    startAction(actionName, props) {
        this.Action.current = actionName;
        this.Action.props = props || {};
    }

    /**
     ** Permet de reset une action plus proprement
     */
    resetAction() {
        this.Action.current = 'moove';
        this.Action.alreadyDo = true;
        this.Action.props = {};
    }

    /**
     ** Initialise les personnages
     */
    beforeStart() {
        const characterSpriteSheet = new createjs.SpriteSheet({
            ...this.spriteSheetsConfig,
            images: [loader.getResult(this.loaderImageID)],
        });

        const character = new createjs.Sprite(characterSpriteSheet);

        this.character = character;

        const PADDING = 50;

        /**
         * Genere une chiffre aleatoire allant de : 0 + PADDING à la largeur du stage.canvas + PADDING
         * Pour faire apparaitre le personnage aleatoirement sur X
         */
        const characterStartXValue = getRandomNumber(this.stage.canvas.width - PADDING, PADDING);

        this.character.setTransform(characterStartXValue, this.FLOOR);
        this.character.regX = 96;

        this.stage.addChild(character);
    }

    /**
     ** Crée l'interval entre les actions
     */
    actionInterval(timeoutDuration) {
        const timeout = timeoutDuration || 100;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    }
}
