// sticky navbar
$(window).scroll(function () {
    if ($(window).scrollTop() > 48) {
        $('header').addClass('fixed');
    }
    else {
        $('header').removeClass('fixed');
    }
});

// onscrol add active class
$(window).scroll(function () {
    var scrollDistance = $(window).scrollTop();

    // Assign active class to nav links while scolling
    $('.scroll-section').each(function (i) {
        if ($(this).position().top <= scrollDistance + 140) {
            $('.navbar-nav li.active').removeClass('active');
            $('.navbar-nav li').eq(i).addClass('active');
        }
    });
}).scroll();

// smooth scroll
if (window.location.hash) scroll(0, 0);
setTimeout(function () { scroll(0, 0); }, 1);
$(function () {
    $('a[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                if ($(window).width() < 768) {
                    // console.log("else executed 2");
                    $('html, body').animate({
                        scrollTop: target.offset().top - 63
                    }, 1000);
                }
                else if ($(window).width() > 767 && $(window).width() < 1200) {

                    $('html, body').animate({
                        scrollTop: target.offset().top - 66
                    }, 1000);

                }
                else {
                    // console.log("else executed");

                    $('html, body').animate({
                        scrollTop: target.offset().top - 90
                    }, 1000);

                }
                return false;
            }
        }
    });
})

// counter
function counterAnimate() {
    $('.count').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 3000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });    
}

// wow
new WOW().init();

// parralex
// var scene = document.getElementById('scene');
// var parallaxInstance = new Parallax(scene);

// var scene = document.getElementById('scene2');
// var parallaxInstance = new Parallax(scene);

// var scene = document.getElementById('scene3');
// var parallaxInstance = new Parallax(scene);