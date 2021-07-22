const cursor = $('#cursor');

/**
 *
 * @param el: HTMLElement
 * @param dataAttr: String
 * @param dataValue: String
 * @returns {{parentEl: HTMLElement, parentHasDataAttr: boolean}}
 *  * Verifie si un des parents de l'élement a la data attribute passé en params
 */
const findDataAttrOnParents = (el, dataAttr) => {
    let parentHasDataAttr = false;
    let parentEl;
    let dataValue;
    $(el)
        .parents()
        .each((_, elParent) => {
            const dataAttrFinded = $(elParent).data(dataAttr);
            if (dataAttrFinded !== undefined) {
                parentEl = elParent;
                parentHasDataAttr = true;
                dataValue = dataAttrFinded;
            }
        });
    return { parentHasDataAttr, parentEl, dataValue };
};

/**
 * 'Enumeration' pour les differentes data attribute du liée au curseur
 */
const DataAttr = {
    hoverable: 'hoverable',
    clickable: 'clickable',
    loader: 'loader',
    loaderFunc: 'loaderFunction',
};

/**
 * 'Enumeration' de class pour les differents etats / actions du curseur
 */
const StateClass = {
    hover: '__cursor-hover',
    active: '__cursor-active',
    clickTracker: '__click-tracker',
    clickableBubble: '__clickable-bubble',
    progressBar: '__progress-bar',
};

const defaultCursorProps = {
    /**
     * Normal
     */
    height: 10,
    width: 10,
    activeHeight: 6,
    activeWidth: 6,

    /**
     * Hover
     */
    hoverHeight: 50,
    hoverWidth: 50,
    activeHoverHeight: 40,
    activeHoverWidth: 40,

    /**
     * Click Tracker
     */
    clickTrackerMultiplier: 2.5,
};

/**
 * Initialise le curseur
 */
$(cursor).css({
    height: defaultCursorProps.height,
    width: defaultCursorProps.width,
});

$(document)
    .on('mouseenter', () => {
        /**
         * Si le curseur du user entre dans la page il est affiché
         */
        $(cursor).css('display', 'inline-block');
        if (isMobileOrTablet()) {
            $(cursor).css('border-color', 'transparent');
        }
    })
    .on('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        handleCursorState(e);
        /**
         *  L'element (cursor personnalisé) suit la position du curseur
         */
        $(cursor).css({
            top: mouseY,
            left: mouseX,
        });
    })
    .on('mousedown', (e) => {
        handleClickableBubble(e);
        handleMouseDownSizeReduce();
    })
    .on('click', (e) => {
        handleLoader(e);
        handleClickTracker(e);
    })
    .on('mouseup', (e) => {
        handleResetCursorSize();
    })
    /**
     *  Le curseur est caché quand il sort de la page
     */
    .on('mouseleave', () => {
        $(cursor).css('display', 'none');
    });

/**
 ** Créer une barre de chargement au clic sur un element avec la data attr : 'data-loader'
 ** -> et execute le fonction passer dans la data attr : 'data-loader-function', a la fin du chargement
 */
const handleLoader = async (e) => {
    const target = e.target;
    const loaderTarget = findDataAttrOnParents(target, DataAttr.loader);
    const isLoaderEL = $(target).data(DataAttr.loader) === '' || loaderTarget.parentHasDataAttr;

    if (isLoaderEL) {
        /**
         * On recupere la fonction passer dans la data attr 'data-loader-function'
         * -> Eval : Qui va convertir la string en fonction javascript
         */
        const endLoadingFunc = eval(
            $(target).data(DataAttr.loaderFunc) ||
                findDataAttrOnParents(target, DataAttr.loaderFunc).dataValue
        );

        if (!endLoadingFunc) {
            throw new Error('End loading function undefined in data attr : "data-loader-function"');
        }

        let hasAlreadyProgressBar = false;

        /**
         * Verifie si le cursor ne contient pas deja une progressbar
         * -> si oui il arrete la fonction
         */
        $(cursor)
            .children()
            .each((index, el) => {
                console.log('index', index);
                console.log('el', $(el).attr('id'));
                if ($(el).hasClass(StateClass.progressBar)) {
                    hasAlreadyProgressBar = true;
                }
            });

        if (hasAlreadyProgressBar) return;

        const progressBar = document.createElement('div');

        $(progressBar).addClass(StateClass.progressBar);

        $(cursor).append(progressBar);

        /**
         * Permet d'effectuer une transition entre l'etat initial de l'element et la class 'enter'
         */
        setTimeout(() => {
            $(progressBar).addClass('__progress-bar--enter');
        }, 0);

        /**
         * Genere une durée aleatoire entre les iterations de la boucle
         */
        const progressbarTimeout = () => {
            const randomTimeout = getRandomNumber(5, 30);

            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, randomTimeout);
            });
        };

        /**
         * Itere jusqu'a 100 et incremente la valeur de la progressbar
         * En attendant le timeout generé par la fonction 'progressbarTimeout()' a chaque iteration
         */
        const handleProgressbar = async () => {
            const progressBarEl = $(`.${StateClass.progressBar}`);
            for (let i = 0; i <= 100; i++) {
                await progressbarTimeout();
                $(progressBarEl).progressbar({
                    value: i,
                    classes: {
                        'ui-progressbar': '__progress-bar',
                        'ui-progressbar-complete': '__progress-bar--complete',
                        'ui-progressbar-value': '__progress-bar--value',
                    },
                });
            }
            $(progressBarEl)
                .addClass('__progress-bar--exit')
                .on('transitionend', () => {
                    $(progressBar).remove();
                });
        };

        /**
         * On attends que la fonction finisse d'iterer sur la boucle
         */
        await handleProgressbar();

        /**
         * La fonction passer dans la data attr 'data-loader-function'
         * -> qui est executé a la fin du chargement
         */
        endLoadingFunc();
    }
};

/**
 **Si le user enfonce le click la class il mettra les dimensions relative a l'etat du curseur (hover / normal)
 */
const handleMouseDownSizeReduce = () => {
    $(cursor).addClass(StateClass.active).hasClass(StateClass.hover)
        ? $(cursor).css({
              height: defaultCursorProps.activeHoverHeight,
              width: defaultCursorProps.activeHoverWidth,
          })
        : $(cursor).css({
              height: defaultCursorProps.activeHeight,
              width: defaultCursorProps.activeWidth,
          });
};

/**
 ** Crée une bulle au clic qui grossi dans les elements avec la data attr : 'data-clickable'
 */
const handleClickableBubble = (e) => {
    const el = e.target;
    const { parentHasDataAttr, parentEl } = findDataAttrOnParents(el, DataAttr.clickable);
    const isClickableEl = $(el).data(DataAttr.clickable) === '' || parentHasDataAttr;

    /**
     * Si le user enfonce le click dans un element 'clickable' il ajoute une 'bulle' qui scale dans celui ci
     */
    if (isClickableEl) {
        const clickableEl = parentEl || el;
        const clickableBubble = document.createElement('div');
        const clickableElHeight = $(clickableEl).outerHeight();
        const clickableElWidth = $(clickableEl).outerWidth();
        /**
         *  Prends la position relative a l'element cliqué
         */
        const clickX = e.pageX - $(clickableEl).offset().left;
        const clickY = e.pageY - $(clickableEl).offset().top;
        /**
         *  Prends la dimension la plus grande de l'element (pour faire un cercle) et scale sur cette valeur
         */
        const scaleValue =
            clickableElHeight > clickableElWidth ? clickableElHeight : clickableElWidth;

        $(clickableBubble).addClass(StateClass.clickableBubble).css({
            top: clickY,
            left: clickX,
            height: 0,
            width: 0,
            opacity: '20%',
        });

        /**
         *  Supprime la 'clickableBubble' a la fin de la transition opacity
         */
        const destroyClickableBubble = () => {
            $(clickableBubble)
                .css({
                    opacity: 0,
                })
                .on('transitionend', (e) => {
                    if (e.originalEvent.propertyName === 'opacity') {
                        $(clickableBubble).remove();
                    }
                });
        };

        /**
         *  Detruit la 'clickableBubble' si le user relache le click ou quitter l'element
         */
        $(clickableEl)
            .append(clickableBubble)
            .on('mouseup', () => {
                destroyClickableBubble();
            })
            .on('mouseleave', () => {
                destroyClickableBubble();
            });

        /**
         * Applique l'animation de scale
         */
        setTimeout(() => {
            $(clickableBubble)
                .addClass(StateClass.clickableBubble)
                .css({
                    height: scaleValue * 2,
                    width: scaleValue * 2,
                });
        }, 0);
    }
};

/**
 ** Permet d'etablir l'etat du curseur : hover / normal
 */
const handleCursorState = (e) => {
    const el = e.target;
    const { parentHasDataAttr } = findDataAttrOnParents(el, DataAttr.hoverable);

    /**
     * Verifie si l'element survolé a la data attribute 'hoverable' (different de undefined) sinon il verifie egalement les parents
     */
    const isHoverable = $(el).data(DataAttr.hoverable) === '' || parentHasDataAttr;

    /**
     * Gere les dimensions du curseur selon son etat au survol
     */
    if (isHoverable) {
        $(cursor).addClass(StateClass.hover).hasClass(StateClass.active)
            ? $(cursor).css({
                  height: defaultCursorProps.activeHoverHeight,
                  width: defaultCursorProps.activeHoverWidth,
              })
            : $(cursor).css({
                  height: defaultCursorProps.hoverHeight,
                  width: defaultCursorProps.hoverWidth,
              });
    } else {
        $(cursor).removeClass(StateClass.hover).hasClass(StateClass.active)
            ? $(cursor).css({
                  height: defaultCursorProps.activeHeight,
                  width: defaultCursorProps.activeWidth,
              })
            : $(cursor).css({
                  height: defaultCursorProps.height,
                  width: defaultCursorProps.width,
              });
    }
};

/**
 ** Quand le user relache le click il mettra les dimensions par defaut en fonction de l'etat du curseur (hover / normal)
 */
const handleResetCursorSize = () => {
    $(cursor).removeClass(StateClass.active).hasClass(StateClass.hover)
        ? $(cursor).css({
              height: defaultCursorProps.hoverHeight,
              width: defaultCursorProps.hoverWidth,
          })
        : $(cursor).css({
              height: defaultCursorProps.height,
              width: defaultCursorProps.width,
          });
};

/**
 ** Permet de visualiser le click du user
 */
const handleClickTracker = (e) => {
    const target = e.target;
    const clickX = e.clientX;
    const clickY = e.clientY;
    const clickTracker = document.createElement('div');
    const clickableTarget = findDataAttrOnParents(target, DataAttr.clickable);
    const isClickable =
        $(target).data(DataAttr.clickable) === '' || clickableTarget.parentHasDataAttr;

    /**
     * Si l'element cliqué et clickable le clicktracker et desactivé
     */
    if (isClickable) return;

    /**
     * Ajuste les dimensions du click tracker en fonction de l'etat du curseur
     */
    $(clickTracker)
        .css({
            position: 'fixed',
            top: clickY,
            left: clickX,
            height: $(cursor).hasClass(StateClass.hover)
                ? defaultCursorProps.hoverHeight
                : defaultCursorProps.height,
            width: $(cursor).hasClass(StateClass.hover)
                ? defaultCursorProps.hoverWidth
                : defaultCursorProps.width,
            opacity: 0.2,
        })
        .addClass(StateClass.clickTracker)
        .on('transitionend', (e) => {
            $(e.target).remove();
        });

    $('body').append(clickTracker);

    setTimeout(() => {
        $(clickTracker).css({
            height:
                ($(cursor).hasClass(StateClass.hover)
                    ? defaultCursorProps.hoverHeight
                    : defaultCursorProps.height) * defaultCursorProps.clickTrackerMultiplier,
            width:
                ($(cursor).hasClass(StateClass.hover)
                    ? defaultCursorProps.hoverWidth
                    : defaultCursorProps.width) * defaultCursorProps.clickTrackerMultiplier,
            opacity: 0,
        });
    }, 0);
};
