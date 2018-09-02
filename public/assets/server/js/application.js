var app = function () {
  var e = function () {
    t(), o(), a(), l(), n(), i()
  },
    t = function () {
      $("#toggle-left").tooltip()
    },
    n = function () {
      $(".actions > .fa-chevron-down").click(function () {
        $(this).parent().parent().next().slideToggle("fast"), $(this).toggleClass("fa-chevron-down fa-chevron-up")
      })
    },
    o = function () {
      $("#toggle-left").bind("click", function (e) {
        $(".sidebarRight").hasClass(".sidebar-toggle-right") || ($(".sidebarRight").removeClass("sidebar-toggle-right"), $(".main-content-wrapper").removeClass("main-content-toggle-right")), $(".sidebar").toggleClass("sidebar-toggle"), $(".main-content-wrapper").toggleClass("main-content-toggle-left"), e.stopPropagation()
      })
    },
    a = function () {
      $("#toggle-right").bind("click", function (e) {
        $(".sidebar").hasClass(".sidebar-toggle") || ($(".sidebar").addClass("sidebar-toggle"), $(".main-content-wrapper").addClass("main-content-toggle-left")), $(".sidebarRight").toggleClass("sidebar-toggle-right animated bounceInRight"), $(".main-content-wrapper").toggleClass("main-content-toggle-right"), $(window).width() < 660 && ($(".sidebar").removeClass("sidebar-toggle"), $(".main-content-wrapper").removeClass("main-content-toggle-left main-content-toggle-right")), e.stopPropagation()
      })
    },
    i = function () {
      $(".actions > .fa-times").click(function () {
        $(this).parent().parent().parent().fadeOut()
      })
    },
    l = function () {
      $("#leftside-navigation .sub-menu > a").click(function (e) {
        $("#leftside-navigation ul ul").slideUp(), $(this).next().is(":visible") || $(this).next().slideDown(), e.stopPropagation()
      })
    },
    s = function () {
      $(".timer").countTo()
    };
  return {
    init: e,
    timer: s
  }
}();
$(document).ready(function () {
  app.init()
});
