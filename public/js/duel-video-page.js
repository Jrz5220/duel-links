const videoPosterPath = "../images/video-posters/" + $(".video-wrapper").first().attr("id") + ".JPG";
const cardsUsedRow = document.getElementById("cards-used-row");
let cardRowExpanded = false;

const videoPlayer = videojs("video-player", {
  controls: true,
  aspectRatio: "16:9",
  poster: videoPosterPath,
  playbackRates: [0.5, 1, 1.5, 2],
  plugins: {
    hotkeys: {
      enableModifiersForNumbers: false,
      seekStep: 10,
      enableVolumeScroll: false
    }
  }
});

$(".yugioh-card").each(function() {
  $(this).click(function() {
    const childSelector = "#expand-" + $(this).attr("id");
    if($(childSelector).is(":visible")) {
      $(childSelector).css({display: "none"});
      $("#cards-used-container").css({pointerEvents: "auto"});
    } else {
      $(childSelector).slideDown("slow");
      $("html, body").animate({scrollTop: $("#cards-used-in-duel").offset().top}, "slow");
      $("#cards-used-row").css({pointerEvents: "none"});
      $("#blur-cards").css({display: "block"});
    }
    // increase card row height
    const rowHeight = cardsUsedRow.offsetHeight;
    if(rowHeight <= 334) {
      $("#cards-used-row").addClass("cards-row-margin");
      cardRowExpanded = true;
    }
  });
});

$(".close-expanded-card-btn").each(function() {
  $(this).click(function() {
    $(this).parent().slideUp("slow");
    $("#cards-used-row").css({pointerEvents: "auto"});
    $("#blur-cards").css({display: "none"});
    // shrink card row height
    if(cardRowExpanded) {
      $("#cards-used-row").removeClass("cards-row-margin");
      cardRowExpanded = false;
    }
  });
});

$(".summon-req").each(function() {
  if($(this).text() === "") {
    $(this).hide();
  }
});
