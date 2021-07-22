let loader, stage;
const canvas = document.querySelector('#createJS');

const init = () => {
    resizeCanvas(canvas);

    /*
     * On recupere le canvas pour crée l'objet Stage
     */
    stage = new createjs.Stage('createJS');

    loader = new createjs.LoadQueue(false);

    /*
     * Quand les images on fini de charger on lance le script
     */
    loader.addEventListener('complete', handleComplete);

    /*
     * Les images a charger
     */
    loader.loadManifest(
        [
            { src: 'character_robot_sheetHD.png', id: 'robot' },
            { src: 'character_malePerson_sheetHD.png', id: 'malePerson' },
            { src: 'character_maleAdventurer_sheetHD.png', id: 'maleAdventurer' },
            { src: 'character_femalePerson_sheetHD.png', id: 'femalePerson' },
            { src: 'character_femaleAdventurer_sheetHD.png', id: 'femaleAdventurer' },
            { src: 'backgroundColorFall.png', id: 'bg-1' },
            { src: 'backgroundColorForest.png', id: 'bg-2' },
            { src: 'bigLadder.png', id: 'bigLadder' },
            { src: 'bigLadderEnd.png', id: 'bigLadderEnd' },
        ],

        true,
        './assets/'
    );
};

const handleComplete = () => {
    const background = new createjs.Bitmap(loader.getResult('bg-1'));
    const background2 = new createjs.Bitmap(loader.getResult('bg-2'));

    const handleCreateLadder = (size, loaderImageID) => {
        const ladder = new createjs.Container();
        for (let i = 0; i <= size; i++) {
            const ladderPart = new createjs.Bitmap(loader.getResult(loaderImageID));
            const LADDER_HEIGHT = ladderPart.getBounds().height;
            ladderPart.y = LADDER_HEIGHT * i;
            if (i === 0) {
                // A la premiere itertation de la boucle on met l'image du haut de l'echelle
                const ladderPartEnd = new createjs.Bitmap(loader.getResult('bigLadderEnd'));
                ladderPartEnd.y = LADDER_HEIGHT * i;
                ladder.addChild(ladderPartEnd);
            } else {
                // Sinon on met l'image du corp de l'echelle
                ladder.addChild(ladderPart);
            }
        }
        return ladder;
    };

    /**
     * Initialise les echelles
     */
    const bigLadder = handleCreateLadder(6, 'bigLadder');
    const bigLadder2 = handleCreateLadder(9, 'bigLadder');
    const bigLadder3 = handleCreateLadder(3, 'bigLadder');
    bigLadder.setTransform(canvas.width * 0.2, 250);
    bigLadder2.setTransform(canvas.width * 0.5, 50);
    bigLadder3.setTransform(canvas.width * 0.8, 450);

    background2.x = 1024;

    stage.addChild(background, background2, bigLadder, bigLadder2, bigLadder3);

    /**
     * Initialise et commence les actions (défini dans la class) des personnages
     */
    const charactersLoaderImageID = [
        'robot',
        'malePerson',
        'maleAdventurer',
        'femalePerson',
        'femaleAdventurer',
    ];
    charactersLoaderImageID.forEach((characterLoaderImageID) => {
        const character = new Character(characterLoaderImageID, stage, [
            { type: 'ladder', element: bigLadder },
            { type: 'ladder', element: bigLadder2 },
            { type: 'ladder', element: bigLadder3 },
        ]);
        character.start();
    });

    createjs.Ticker.on('tick', (e) => {
        stage.update(e);
    });
};

/*
 * Resize le canvas quand les dimensions de la fenetre change
 */
const resizeCanvas = (canvas) => {
    window.addEventListener('resize', resizeCanvasFn, false);

    function resizeCanvasFn() {
        const header = document.querySelector('#header');

        const headerHeigth = header.clientHeight;
        const headerWidth = header.clientWidth;

        canvas.height = headerHeigth;
        canvas.width = headerWidth;
    }

    resizeCanvasFn();
};
