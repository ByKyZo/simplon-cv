indexFile();

function indexFile() {
    /**
     * Enleve la d'animation des lettres du titre a la fin de l'animation
     */
    $('.header__title__letter-animation').on('animationend', (e) => {
        $(e.target).removeClass('header__title__letter-animation');
    });

    const navToHeader = $('#toHeader');
    const navToSection1 = $('#toSection1');
    const navToSection2 = $('#toSection2');
    const navToSection3 = $('#toSection3');

    const Anchors = {
        header: '#header',
        section1: '#section-1',
        section2: '#section-2',
        section3: '#section-3',
    };

    let onWheel = false;

    /**
     * Detecte si le user scroll
     */
    $(document).on('wheel', () => {
        onWheel = true;
    });

    /**
     * Detecte si le user 'scroll' sur mobile
     */
    $(document).on('touchmove', function () {
        onWheel = true;
    });

    /**
     * Quand le user arrete de scroll
     */
    setInterval(() => {
        if (onWheel) {
            onWheel = false;
        }
    }, 1000);
    /**
     * Change le style du nav item selon la navigation (ancre)
     */
    const handleCurrentAnchorNavItem = () => {
        const currentAnchor = location.hash;
        const navItems = $('.nav__item');

        $(navItems).each((index, navItem) => {
            $(navItem).removeClass('active');
        });

        switch (currentAnchor) {
            case Anchors.header:
                $(navToHeader).addClass('active');
                break;
            case Anchors.section1:
                $(navToSection1).addClass('active');
                break;
            case Anchors.section2:
                $(navToSection2).addClass('active');
                break;
            case Anchors.section3:
                $(navToSection3).addClass('active');
                break;
            default:
                $(navToHeader).addClass('active');
        }
    };

    handleCurrentAnchorNavItem();

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                const entryAnchor = `#${$(entry.target).attr('id')}`;
                /**
                 * Change l'ancre dans l'url quand le user a la section dans son champ de vision
                 * Ne s'active pas si le user n'est pas entrain de scroll (bug avec les ancres sinon)
                 */
                if (entry.isIntersecting && onWheel) {
                    location.hash = entryAnchor;
                }
            });
        },
        {
            threshold: 0.6,
        }
    );

    observer.observe($(Anchors.header)[0]);
    observer.observe($(Anchors.section1)[0]);
    observer.observe($(Anchors.section2)[0]);
    observer.observe($(Anchors.section3)[0]);

    /**
     * Detecte quand l'ancre change
     */
    $(window).on('hashchange', (e) => {
        handleCurrentAnchorNavItem();
    });
}
