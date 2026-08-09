(function () {
  "use strict";

  // ---------- Button layout: semicircle over the rocket ----------
  // The 9 buttons arc from the left, over the top, to the right of the
  // rocket's nose — like a halo — at equal angular steps (buttons are
  // square via CSS so equal angle also reads as equal visual spacing).
  function layoutButtons() {
    var stage = document.getElementById("stage");
    var rocketWrap = document.getElementById("rocketWrap");
    var titleEl = document.querySelector(".title");
    var crestEl = document.querySelector(".crest");
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".explore-btn"));
    var n = buttons.length;

    var stageRect = stage.getBoundingClientRect();
    var rocketRect = rocketWrap.getBoundingClientRect();
    var titleRect = titleEl.getBoundingClientRect();

    var width = stageRect.width;
    var arcCenterX = rocketRect.left - stageRect.left + rocketRect.width / 2;
    // Anchor the arc partway down the rocket's body (not just above its
    // nose) so the semicircle's ends flank the rocket's sides instead of
    // hovering entirely above it — this gives much more vertical room to
    // work with, since the gap between the title and this point is larger
    // than the gap between the title and the nose tip alone.
    var arcCenterY = (rocketRect.top - stageRect.top) + rocketRect.height * 0.3;

    // Measure buttons via computed width/height, NOT getBoundingClientRect.
    // Buttons are visually scaled with `transform: scale(var(--btn-scale))`
    // under a CSS transition; if a previous layout already shrank them,
    // getBoundingClientRect() here would catch them mid-transition (while
    // still animating back toward scale 1) and read a bogus, too-small
    // size. The CSS width/height are unaffected by transform, so they
    // always reflect the button's true natural (unscaled) size.
    var maxBtnW = 0, maxBtnH = 0;
    buttons.forEach(function (b) {
      var cs = getComputedStyle(b);
      maxBtnW = Math.max(maxBtnW, parseFloat(cs.width));
      maxBtnH = Math.max(maxBtnH, parseFloat(cs.height));
    });
    var hw0 = maxBtnW / 2, hh0 = maxBtnH / 2;

    var topBoundary = (titleRect.bottom - stageRect.top) + 34;
    var leftBoundary = 18;
    var rightBoundary = width - 18;

    var step = 180 / (n - 1);
    var stepRad = (step * Math.PI) / 180;
    var sinHalfStep = Math.sin(stepRad / 2);

    // Find the largest scale (<=1) at which the (possibly shrunk) buttons
    // both clear the title/edges AND don't overlap each other.
    var scale = 1;
    var radius = 30;
    for (var iter = 0; iter < 25; iter++) {
      var hw = hw0 * scale, hh = hh0 * scale;
      var vRadius = arcCenterY - topBoundary - hh - 14;
      var hRadius = Math.min(arcCenterX - leftBoundary, rightBoundary - arcCenterX) - hw - 14;
      var boundRadius = Math.max(Math.min(vRadius, hRadius), 30);

      var circumRadius = Math.sqrt(hw * hw + hh * hh);
      var minRadius = (2 * circumRadius + 44) / (2 * sinHalfStep);

      radius = boundRadius;
      if (minRadius <= boundRadius) break;
      scale = Math.max(scale * (boundRadius / minRadius) * 0.98, 0.3);
    }

    radius = Math.min(radius, 520);

    buttons.forEach(function (btn, i) {
      var angleDeg = 180 + i * step;
      var rad = (angleDeg * Math.PI) / 180;
      var x = arcCenterX + radius * Math.cos(rad);
      var y = arcCenterY + radius * Math.sin(rad);

      btn.style.left = x + "px";
      btn.style.top = y + "px";
      btn.style.setProperty("--btn-scale", scale);
    });

    // Center the crest headline inside the arc's hollow, sized to not
    // touch the ring of medallions around it.
    if (crestEl) {
      crestEl.style.left = arcCenterX + "px";
      crestEl.style.top = (arcCenterY - radius * 0.32) + "px";
      crestEl.style.maxWidth = Math.max(radius * 1.3, 220) + "px";
    }
  }

  // ---------- Smoke puffs ----------
  var puffInterval = null;

  function spawnPuff() {
    var trail = document.getElementById("smokeTrail");
    var puff = document.createElement("span");
    puff.className = "puff";
    var size = Math.random() * 30 + 30;
    puff.style.width = size + "px";
    puff.style.height = size + "px";
    puff.style.left = "50%";
    puff.style.marginLeft = (Math.random() * 30 - 15) + "px";
    puff.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
    trail.appendChild(puff);
    setTimeout(function () {
      if (puff.parentNode) puff.parentNode.removeChild(puff);
    }, 1700);
  }

  // ---------- Launch sequence ----------
  var launched = false;

  function handleLaunch(url, label) {
    if (launched) return;
    launched = true;

    var stage = document.getElementById("stage");
    var rocketWrap = document.getElementById("rocketWrap");
    var status = document.getElementById("status");
    var buttons = document.querySelectorAll(".explore-btn");

    buttons.forEach(function (b) {
      b.disabled = true;
      b.style.pointerEvents = "none";
    });

    status.textContent = "Launching to " + label + "…";
    status.classList.add("visible");

    rocketWrap.classList.add("shaking");

    setTimeout(function () {
      rocketWrap.classList.remove("shaking");
      stage.classList.add("hide-ui");
      rocketWrap.classList.add("launching");
      puffInterval = setInterval(spawnPuff, 110);
    }, 500);

    setTimeout(function () {
      if (puffInterval) clearInterval(puffInterval);
    }, 3800);

    setTimeout(function () {
      window.location.href = url;
    }, 4000);
  }

  function init() {
    layoutButtons();

    // Stylesheets/fonts can still be applying at DOMContentLoaded time, so
    // the very first measurement may not reflect final sizes/metrics.
    // Re-run once everything (styles, fonts, images) has fully loaded.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!launched) layoutButtons();
      });
    }
    window.addEventListener("load", function () {
      if (!launched) layoutButtons();
    });

    document.querySelectorAll(".explore-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.classList.add("chosen");
        handleLaunch(btn.dataset.url, btn.textContent);
      });
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!launched) layoutButtons();
      }, 150);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
