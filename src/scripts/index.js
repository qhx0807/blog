/* global jQuery */
; (function ($) {
  $(document).ready(function () {
    function topHandle () {
      const winTop = $(window).scrollTop()
      if (winTop > 200) {
        $('#gotop').show()
      } else {
        $('#gotop').hide()
      }
    }

    topHandle()

    $(this).scroll(function () {
      topHandle()
    })
    $('#gotop').click(function (e) {
      e.preventDefault()
      $('html,body').animate({ scrollTop: '0px' }, 400)
    })
  })
})(jQuery)
