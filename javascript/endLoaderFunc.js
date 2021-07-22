/**
 * On initialise la fenetre
 */
$('.dialog-1').dialog({
    autoOpen: false,
    modal: true,
    classes: {
        'ui-dialog': 'modal',
        'ui-dialog-titlebar': 'modal__titlebar',
        'ui-dialog-buttonset': 'modal__btn-wrapper',
    },
    show: { effect: 'bounce', duration: 400 },
    hide: { effect: 'bounce', duration: 400 },
    open: () => {
        $('.ui-widget-overlay').addClass('modal__overlay');
        $('html').css({
            overflow: 'hidden',
        });
    },
    close: () => {
        $('html').css({
            overflow: '',
        });
    },
    buttons: [
        {
            class: 'modal__btn-ok',
            'data-hoverable': '',
            'data-clickable': '',
            text: "D'accord",
            click: function () {
                $(this).dialog('close');
            },
        },
    ],
});

/**
 * On ouvre la fenetre
 */
const openSkillDialog = () => {
    $('.dialog-1').dialog('open');
};
