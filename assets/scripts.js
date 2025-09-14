$(document).ready(function() {
    $('.gallery').css('display', 'block');
    $('.gallery').mauGallery({
        columns: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3
        },
        lightBox: true,
        lightboxId: 'myAwesomeLightbox',
        showTags: true,
        tagsPosition: 'top'
    });
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carousel-control-prev .visually-hidden, .carousel-control-next .visually-hidden')
    .forEach(el => el.remove());
});