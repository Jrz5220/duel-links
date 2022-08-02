const viewAllDecksBtn = document.getElementById("view-all-decks-btn");
const additionalDecks = document.getElementById("hideAdditionalDecks");

viewAllDecksBtn.addEventListener("click", function() {
  additionalDecks.classList.toggle("active");
});

const medias = Array.prototype.slice.apply(document.querySelectorAll('audio,video'));
medias.forEach(function(media) {
  media.addEventListener('play', function(event) {
    medias.forEach(function(media) {
      if(event.target != media) media.pause();
    });
  });
});

const video1 = videojs("video-1", {
  controls: true,
  aspectRatio: "16:9",
  poster: "../images/video-posters/vampire-v-relinquished.JPG",
  playbackRates: [0.5, 1, 1.5, 2],
  plugins: {
    hotkeys: {
      enableModifiersForNumbers: false,
      seekStep: 10,
      enableVolumeScroll: false
    }
  }
});
const video2 = videojs("video-2", {
  controls: true,
  aspectRatio: "16:9",
  poster: "../images/video-posters/vendreads-v-lightsworn.JPG",
  playbackRates: [0.5, 1, 1.5, 2],
  plugins: {
    hotkeys: {
      enableModifiersForNumbers: false,
      seekStep: 10,
      enableVolumeScroll: false
    }
  }
});
const video3 = videojs("video-3", {
  controls: true,
  aspectRatio: "16:9",
  poster: "../images/video-posters/dino-v-sartorius-desperado.JPG",
  playbackRates: [0.5, 1, 1.5, 2],
  plugins: {
    hotkeys: {
      enableModifiersForNumbers: false,
      seekStep: 10,
      enableVolumeScroll: false
    }
  }
});
