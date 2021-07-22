/**
 * On initialise la fenetre
 */
$('.dialog-1').dialog({
    autoOpen: false,
    classes: {
        'ui-dialog': 'modal',
        'ui-dialog-titlebar': 'modal__titlebar',
    },
    show: { effect: 'bounce', duration: 400 },
    hide: { effect: 'bounce', duration: 400 },
    buttons: [
        {
            class: 'modal__btn-ok',
            'data-hoverable': '',
            'data-clickable': '',
            text: 'Ok',
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
