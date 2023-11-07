const videoPosterPath = "../images/video-posters/" + $(".video-wrapper").first().attr("id") + ".jpg";
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
  if($(this).hasClass("clickable")) {
    // add click function to expand larger version of card when clicked
    $(this).click(function() {
      const idOfClickedCard = "#expand-" + $(this).attr("id");
      $(idOfClickedCard).slideDown("slow");
      $("html, body").animate({scrollTop: $("#cards-used-in-duel").offset().top}, "slow");
      $("#cards-used-row").css({pointerEvents: "none"});
      // prevent all other yugioh cards from being clicked by removing "clickable" class
      $(".yugioh-card").removeClass("clickable");
      const rowHeight = document.getElementById("cards-used-row").offsetHeight;
      if(rowHeight <= 334) {
        $("#cards-used-row").addClass("cards-row-margin");
      }
    });
  }
});

$(".close-expanded-card-btn").click(function() {
  $(this).parent().slideUp("slow");
  $("#cards-used-row").css({pointerEvents: "auto"});
  $(".yugioh-card").addClass("clickable");
  if($("#cards-used-row").hasClass("cards-row-margin")) {
    $("#cards-used-row").removeClass("cards-row-margin");
  }
});

$(".summon-req").each(function() {
  if($(this).text() === "") {
    $(this).hide();
  }
});

const favBtn = $("#favBtn");
const videoData = {
  videoTitle: $("#videoTitle").text(),
  duelName: $(".video-wrapper").first().attr("id"),
  addToFavorites: false
}
if(favBtn.hasClass("isFavorite")) {
  favBtn.attr({
    "title": "Remove from favorites",
    "aria-label": "Remove video from favorites"
  });
  favBtn.children(".accessibleName").text("Remove video from favorites");
}
favBtn.on("click", function(e) {
  if($(".nav-item").length === 3) {
    // user is signed in
    favBtn.toggleClass("isFavorite");
    if(favBtn.hasClass("isFavorite")) {
      videoData.addToFavorites = true;
    }
    fetch("/updateFavorites", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(videoData)}).then(res => {
      return res.json();
    }).then(json => {
      // update favorites button
      if(json.addedVideo) {
        favBtn.attr({
          "title": "Remove from favorites",
          "aria-label": "Remove video from favorites"
        });
        favBtn.children(".accessibleName").text("Remove video from favorites");
      } else if(json.removedVideo) {
        favBtn.attr({
          "title": "Add to favorites",
          "aria-label": "Add to favorites"
        });
        favBtn.children(".accessibleName").text("Add video to favorites");
      } else if(json.error !== null) {
        throw json.error;
      }
      return;
    }).catch(error => {
      favBtn.attr("aria-label", error.message);
      favBtn.children(".accessibleName").text(error.message);
      $(".accessibleName").removeClass("forScreenReader");
    });
  } else {
    // alert user to sign in
    if($(".navbar-toggler-icon").length) {
      $(".navbar-toggler").removeClass("collapsed");
      $(".navbar-toggler").attr("aria-expanded", "true");
      $("#navbarSupportedContent").addClass("show");
    }
    $(".login-btn").first().removeClass("collapsed");
    $(".login-btn").first().attr("aria-expanded", "true");
    $("#loginFormListItem").addClass("show");
    $("#loginWarning").empty();
    $("#loginWarning").append("<p>Please sign in</p>");
    $("html, body").animate({scrollTop: 0}, "slow");
  }
});
