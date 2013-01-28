(function($){
  $.fn.extend({
    showOfSlides : function(options) {

      /*
        slides get a class of: .slide
        current slide gets a class of: .slide-current
        previous slide gets a class of: .slide-previous
        slide navigation gets a class of: .slide-nav
        next slide link gets a class of: .slide-next
        previous slide link gets a class of: .slide-prev
        next/previous slide links both get a class of: .slide-change
        first slide gets a class of: .slide-active
        slide pagination's containing <ul> gets a class of: .slide-pagination
      */

      var defaults = {
          tag: 'slide', // Class used on elements, also used as a prefix for all the other classes used
          timer: 5000, // Time between slides changing
          transition: 500, // Transition time, should be at least the same length of time as any CSS transitions. Should also be no more than half the timer variable if you are using CSS transitions
          pagination: 0, // Pagination along the bottom. 1 => Yes. 0 => No.
          arrows: 0, // Previous/Next Links. 1 => Yes. 0 => No.
          slides: 'li' // Default selector of slides
      };

      options =  $.extend(defaults, options);

      return this.each(function() {
          var current = $(this).find('*').first(),
                parent = $(this),
                o = options,
                count = 0,
                pagination = '',
                next = 1,
                counting = 1, // Used to prevent multiple timers being started. That… wasn't doing good things.
                selected,
                showing,
                interval,
                holding; // Used as a generic container for selectors in functions as I need them

          current.on('hover', '*', function() {
            if (o.timer !== 0) {
              interval = clearInterval(interval);
              counting = 0;
            }
          });
          current.on('mouseout', '*', function() {
            if (!counting && o.timer !== 0) {
              interval = setInterval(slide, o.timer);
              counting = 1;
            }
          });

          parent.on('click', '.' + /*o.navSlide*/ o.tag + '-change', function() {
            if ($(this).hasClass(o.tag + '-next')) {
              // Show Next Slide

              current.find(o.slides + '.' + o.tag + '-current').addClass(o.tag + '-previous').removeClass(o.tag + '-current');
              next++;
              holding = current.find(o.slides + '[data-num="' + next + '"]');
              // If we're alread on the last slide we need to animate in the first one
              if (holding.length === 0) {
                next = 1;
                current.find(o.slides + '[data-num="1"]').addClass(o.tag + '-current');
              } else {
                holding.addClass(o.tag + '-current');
              }
            } else {
              // Show Previous Slide
              next--;
              current.find(o.slides + '.' + o.tag + '-current').removeClass(o.tag + '-current');
              // If we're on the first slide we need to slide in the list slide in the slideshow
              if (next === 0) {
                holding = current.find('> ' + o.slides).last();
                holding.addClass(o.tag + '-automatic').addClass(o.tag + '-previous');
                holding.animate({}, 1 );
                holding.removeClass(o.tag + '-automatic').addClass(o.tag + '-current').removeClass(o.tag + '-previous');
                next = holding.attr('data-num');
              } else {
                holding = current.find(o.slides + '[data-num="' + next + '"]');
                holding.addClass(o.tag + '-automatic').addClass(o.tag + '-previous');
                holding.animate({}, 1 );
                holding.removeClass(o.tag + '-automatic').addClass(o.tag + '-current').removeClass(o.tag + '-previous');
                //.addClass(o.tag + '-current').removeClass(o.tag + '-previous');
              }
            }
            if (o.pagination) { updatePagination(); }
            if (o.timer !== 0) {
              interval = clearInterval(interval);
              interval = setInterval(slide, o.timer);
            }
            window.setTimeout(cleanup, o.transition);
            return false;
          });

          // Pagination
          parent.on('click', '.' + o.tag + '-nav', function () {
            // Let's make sure we're not selecting the currently shown slide's nav link.
            if (!$(this).hasClass(o.tag + '-active') ) {
              selected = $(this).attr('data-toshow');
              next = selected;
              current.find('.' + o.tag + '-current').addClass(o.tag + '-previous').removeClass(o.tag + '-current');
              current.find('[data-num="' + selected + '"]').addClass(o.tag + '-current');
              if (o.pagination) { updatePagination(); }
              window.setTimeout(cleanup, o.transition);
            }
            return false;
          });

          // Initial setup of lists
          // Also covers pagination setup in case it is used.
          current.find('> ' + o.slides).each(function() {
            count++;
            if (count === 1) {
              if (o.pagination) {
                pagination += '<li><a class="' + o.tag + '-nav' + ' ' + o.tag + '-active' + '" href="#slide-' + count + '" data-toshow="' + count + '">' + count + '</a></li>';
              }
              $(this).attr('data-num', count).addClass(o.tag + '-current').addClass(o.tag);
            } else {
              if (o.pagination) {
                pagination += '<li><a class="' + o.tag + '-nav' + '" href="#slide-' + count + '" data-toshow="' + count + '">' + count + '</a></li>';
              }
              $(this).attr('data-num', count).addClass(o.tag);
            }
          });

          // Removes classes from previous slides once they're out of view.
          // This allows people to use CSS animations instead of jQuery ones
          // Also means that I didn't need to clone elements, which was getting insane in earlier iterations of this code
          function cleanup () {
            current.find('.' + o.tag + '-previous').removeClass(o.tag + '-previous');
          }

          // Update Pagination
          function updatePagination () {
            parent.find('a').removeClass(o.tag + '-active');
            parent.find('a[data-toshow="' + next + '"]').addClass(o.tag + '-active');
          }

          // Switches classes on various list items in order to allow CSS to animate things
          function slide () {
            showing = next;
            next++;
            current.find(o.slides + '[data-num="' + showing + '"]').addClass(o.tag + '-previous').removeClass(o.tag + '-current');
            holding = current.find(o.slides + '[data-num="' + next + '"]');
            // If we're alread on the last slide we need to animate in the first one
            if (holding.length === 0) {
              next = 1;
              current.find(o.slides + '[data-num="1"]').addClass(o.tag + '-current');
            } else {
              holding.addClass(o.tag + '-current');
            }
            if (o.pagination) { updatePagination(); }
            window.setTimeout(cleanup, o.transition);
          }

          // Adding current slide class to the first list item
          $(o.wrapper + ' .' + o.tag + ':first').addClass(o.tag + '-current');
          // Set up the loop to have slides repeating.
          if (o.timer !== 0) {
            interval = setInterval(slide, o.timer);
          }

          // Showing Pagination if it's enabled
          if (o.pagination) {
            current.after('<ul class="' + o.tag + '-pagination">' + pagination + '</ul>');
          }

          // If we have previous and next buttons enabled, display them
          if (o.arrows) {
            parent.append('<a href="#previous" class="' + o.tag + '-prev' + ' ' + o.tag + '-change' + '">Previous</a><a href="#next" class="' + o.tag + '-next' + ' ' + o.tag + '-change' + '">Next</a>');
          }
      });
    }
  });
})(jQuery);