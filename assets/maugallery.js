(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };
  $.fn.mauGallery.listeners = function (options) {
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      //Get the "full-size" image if available,otherwise fallback to the thumbnail
      const fullSrc = element.data("full") || element.attr("src");

      //Get the alt text for accessibility (fallback if none provided)
      const altText = element.attr("alt") || "Gallery image";

      //Update the lightbox image with eht full-size source and alt text
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr({ src: fullSrc, alt: altText });
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      //Bulid the collection of images to navigate through(respect current tag filler)
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column img.gallery-item").each(function () {
          imagesCollection.push($(this));
        });
      } else {
        $(
          `.item-column img.gallery-item[data-gallery-tag="${activeTag}"]`
        ).each(function () {
          imagesCollection.push($(this));
        });
      }
      // Find previous index relative to the currently displayed lightbox image
      const currentSrc = $(".lightboxImage").attr("src");
      let index = 0;
      $(imagesCollection).each(function (i) {
        const fullSrc = $(this).data("full") || $(this).attr("src");
        if (fullSrc === currentSrc) index = i - 1;
      });

      const prev =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      const prevFull = prev.data("full") || prev.attr("src");
      const prevAlt = prev.attr("alt") || "Gallery image";
      $(".lightboxImage").attr({ src: prevFull, alt: prevAlt });
    },
    nextImage() {
      //Find which gallery item corresponds to the currently displayed lightbox image
      let activeImage = null;
      $("img.gallery-item").each(function () {
        const fullSrc = $(this).data("full") || $(this).attr("src");
        if (fullSrc === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });

      //Bulid the list of navigable images according to the active tag filter
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column img.gallery-item").each(function () {
          imagesCollection.push($(this));
        });
      } else {
        $(
          `.item-column img.gallery-item[data-gallery-tag="${activeTag}"]`
        ).each(function () {
          imagesCollection.push($(this));
        });
      }
      if (imagesCollection.length === 0) return;

      //Find the next index(wrap to first if we are at the end)
      let index = 0;
      $(imagesCollection).each(function (i) {
        const fullSrc = $(this).data("full") || $(this).attr("src");
        if (fullSrc === $(".lightboxImage").attr("src")) {
          index = i + 1;
        }
      });
      const next = imagesCollection[index] || imagesCollection[0];
      const nextFull = next.data("full") || next.attr("src"); //set lightbox to full image
      const nextAlt = next.attr("alt") || "Gallery image";
      $(".lightboxImage").attr({ src: nextFull, alt: nextAlt });
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<button class="mg-prev" aria-label="Previous image" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lsaquo;</button>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<button class="mg-next" aria-label="Next image" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&rsaquo;</button>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active.active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    },
  };
})(jQuery);
