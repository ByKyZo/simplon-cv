indexFile();

function indexFile() {
    /**
     * On recupere tout les nav items par la data attr : 'data-nav'
     */
    const navItems = $('[data-nav]');

    /**
     * On recupere tout les destinations par la data attr : 'data-nav-destination'
     */
    const navDestinations = $('[data-nav-destination]');

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

        $(navItems).each((index, navItem) => {
            const navItemAnchor = $(navItem).attr('href');
            if (navItemAnchor === currentAnchor) {
                $(navItem).addClass('active');
            } else {
                $(navItem).removeClass('active');
            }
        });
    };

    handleCurrentAnchorNavItem();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const entryIDAnchor = `#${$(entry.target).attr('id')}`;
                /**
                 * Change l'ancre dans l'url quand le user a la section dans son champ de vision
                 * Ne s'active pas si le user n'est pas entrain de scroll (bug avec les ancres sinon)
                 */
                if (entry.isIntersecting && onWheel) {
                    location.hash = entryIDAnchor;
                }
            });
        },
        {
            threshold: 0.6,
        }
    );

    $(navDestinations).each((_, navDestination) => {
        observer.observe(navDestination);
    });

    /**
     * Detecte quand l'ancre change
     */
    $(window).on('hashchange', (e) => {
        handleCurrentAnchorNavItem();
    });
}
