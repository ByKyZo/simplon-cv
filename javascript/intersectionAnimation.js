IntersectionAnimation();

function IntersectionAnimation() {
    const intersectionDataAttr = 'intersection';

    const IntersectionStateClass = {
        hiddenTop: 'hidden-top',
        hiddenLeft: 'hidden-left',
        hiddenBottom: 'hidden-bottom',
        hiddenRight: 'hidden-right',
        visible: 'visible',
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const entryEl = entry.target;

                const entryElDirection = $(entryEl).data(intersectionDataAttr);

                let currentHiddenClass;

                if (entryElDirection === 'top') {
                    currentHiddenClass = IntersectionStateClass.hiddenTop;
                } else if (entryElDirection === 'left') {
                    currentHiddenClass = IntersectionStateClass.hiddenLeft;
                } else if (entryElDirection === 'bottom') {
                    currentHiddenClass = IntersectionStateClass.hiddenBottom;
                } else if (entryElDirection === 'right') {
                    currentHiddenClass = IntersectionStateClass.hiddenRight;
                } else {
                    /**
                     * Sinon ajoute une class personnalisée a l'element caché
                     */
                    currentHiddenClass = entryElDirection;
                }
                // console.log(entry);
                if (entry.isIntersecting) {
                    /**
                     * Afficher l'element
                     */
                    $(entryEl).removeClass(currentHiddenClass);
                    $(entryEl).addClass(IntersectionStateClass.visible);
                } else {
                    /**
                     * Cache l'element
                     */
                    $(entryEl).addClass(currentHiddenClass);
                    $(entryEl).removeClass(IntersectionStateClass.visible);
                }
            });
        },
        {
            rootMargin: '-25px 0px 0px 0px',
        }
    );

    /**
     * Recupere tout les elements avec la data attribute 'intersection' et les observes
     */
    const elementObservable = $(`[data-${intersectionDataAttr}]`).toArray();

    elementObservable.forEach((el) => {
        observer.observe(el);
    });
}
