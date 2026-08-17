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

    // Center the crest inside the arc's hollow, sized so that even its
    // corners stay clear of the ring of medallions around it. The crest is
    // roughly square (logo + headline + rule + subtitle), so a plain
    // vertical height cap isn't enough — a button positioned diagonally
    // (like Constellations, up and to the right) can still be closer to
    // the crest's corner than to its edge, AND the headline text re-wraps
    // to more/fewer lines as the box narrows, which changes its own
    // height. Rather than estimate that, shrink-to-fit against the crest's
    // real *measured* rendered size each iteration.
    if (crestEl) {
      // Pulled down closer to arcCenterY (was 0.32) to buy more vertical
      // room now that the crest holds a logo + headline + rule + subtitle
      // instead of one short line — it's fine for the box to sit further
      // over the rocket's nose since it already renders above it (z-index).
      var verticalOffset = radius * 0.14;
      var crestCenterY = arcCenterY - verticalOffset;
      crestEl.style.left = arcCenterX + "px";
      crestEl.style.top = crestCenterY + "px";

      var safeRadius = radius - 40; // leave room for button radius + gap

      var candidateWidth = Math.min(radius * 1.1, 380);
      for (var ci = 0; ci < 20; ci++) {
        crestEl.style.maxWidth = candidateWidth + "px";
        var rect = crestEl.getBoundingClientRect();
        var halfW = rect.width / 2;
        var halfH = rect.height / 2;
        var cornerDist = Math.sqrt(halfW * halfW + Math.pow(verticalOffset + halfH, 2));
        if (cornerDist <= safeRadius || candidateWidth <= 200) break;
        candidateWidth *= 0.93;
      }
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

  // Start warming up the destination the instant the button is clicked,
  // rather than waiting for the liftoff animation to finish — by the time
  // we actually navigate, the connection (and ideally the page itself) is
  // already warm, so the destination feels like it loads instantly.
  function warmUpDestination(url) {
    var origin = new URL(url).origin;

    var preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = origin;
    document.head.appendChild(preconnect);

    var dnsPrefetch = document.createElement("link");
    dnsPrefetch.rel = "dns-prefetch";
    dnsPrefetch.href = origin;
    document.head.appendChild(dnsPrefetch);

    var prefetch = document.createElement("link");
    prefetch.rel = "prefetch";
    prefetch.href = url;
    document.head.appendChild(prefetch);
  }

  var launchTimers = [];

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

    warmUpDestination(url);

    status.textContent = "Launching to " + label + "…";
    status.classList.add("visible");
    stage.classList.add("hide-ui");

    rocketWrap.classList.add("shaking");

    launchTimers.push(setTimeout(function () {
      rocketWrap.classList.remove("shaking");
      rocketWrap.classList.add("launching");
      puffInterval = setInterval(spawnPuff, 110);
    }, 300));

    launchTimers.push(setTimeout(function () {
      if (puffInterval) clearInterval(puffInterval);
    }, 1900));

    launchTimers.push(setTimeout(function () {
      window.location.href = url;
    }, 2100));
  }

  // Browsers restore a page from the back/forward cache exactly as it was
  // frozen — mid-launch, with the title/crest/buttons hidden and "Launching
  // to X…" on screen — instead of the fresh initial state. Detect that via
  // the pageshow event's `persisted` flag and reset everything back to the
  // pre-launch state.
  function resetLaunchState() {
    launched = false;

    launchTimers.forEach(clearTimeout);
    launchTimers = [];
    if (puffInterval) {
      clearInterval(puffInterval);
      puffInterval = null;
    }

    var stage = document.getElementById("stage");
    var rocketWrap = document.getElementById("rocketWrap");
    var status = document.getElementById("status");
    var smokeTrail = document.getElementById("smokeTrail");

    stage.classList.remove("hide-ui");
    rocketWrap.classList.remove("shaking", "launching");
    status.classList.remove("visible");
    status.textContent = "";
    if (smokeTrail) smokeTrail.innerHTML = "";

    document.querySelectorAll(".explore-btn").forEach(function (b) {
      b.disabled = false;
      b.style.pointerEvents = "";
      b.classList.remove("chosen");
    });

    layoutButtons();
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

    window.addEventListener("pageshow", function (e) {
      if (e.persisted) resetLaunchState();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
