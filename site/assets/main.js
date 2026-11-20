"use strict";

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  var hero = document.querySelector(".device-hero");
  var studioMount = document.getElementById("studio-mount");

  if (hero && studioMount) {
    var studio = hero.cloneNode(true);
    studio.classList.remove("device-hero");
    studio.classList.add("device-studio");
    studio.setAttribute(
      "aria-label",
      "Original drawing of iPhone Duo from the back, in the selected finish. Night Sky and Star White change the metal and ceramic."
    );
    studioMount.appendChild(studio);
  }

  var finishButtons = Array.prototype.slice.call(document.querySelectorAll(".finish-btn"));
  var finishStatus = document.getElementById("finish-status");

  function applyFinish(name) {
    document.body.setAttribute("data-finish", name);
    finishButtons.forEach(function (btn) {
      var on = btn.getAttribute("data-finish") === name;
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    if (finishStatus) {
      finishStatus.textContent = name === "star" ? "Star White finish" : "Night Sky finish";
    }
    document.querySelectorAll(".device").forEach(function (device) {
      device.classList.remove("is-morphing");
      window.requestAnimationFrame(function () {
        device.classList.add("is-morphing");
      });
    });
    window.setTimeout(function () {
      document.querySelectorAll(".device").forEach(function (device) {
        device.classList.remove("is-morphing");
      });
    }, 850);
  }

  finishButtons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      applyFinish(btn.getAttribute("data-finish"));
    });
    btn.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }
      event.preventDefault();
      var next = event.key === "ArrowDown" || event.key === "ArrowRight" ? index + 1 : index - 1;
      if (next < 0) next = finishButtons.length - 1;
      if (next >= finishButtons.length) next = 0;
      finishButtons[next].focus();
      applyFinish(finishButtons[next].getAttribute("data-finish"));
    });
  });

  if (finePointer && !reduce) {
    bindMagnetic(document.querySelectorAll(".finish-btn, .mast-nav a, .rail a"));
    var studioDevice = document.querySelector(".device-studio");
    var studioStage = document.querySelector(".studio-stage");
    if (studioStage && studioDevice) {
      studioStage.addEventListener("pointermove", function (event) {
        var rect = studioStage.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        studioDevice.style.setProperty("--nudge-y", (px * -14).toFixed(2) + "deg");
        studioDevice.style.setProperty("--nudge-x", (py * 8).toFixed(2) + "deg");
      });
      studioStage.addEventListener("pointerleave", function () {
        studioDevice.style.setProperty("--nudge-y", "0deg");
        studioDevice.style.setProperty("--nudge-x", "0deg");
      });
    }
  }

  var railLinks = Array.prototype.slice.call(document.querySelectorAll(".rail a"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  if ("IntersectionObserver" in window && railLinks.length && sections.length) {
    var railObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          railLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + id) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      railObserver.observe(section);
    });
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href");
        if (!id || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: 0 });
      });
    });
  }

  var pose = { fold: -168, tiltX: 16, tiltY: -38, shift: 0.5, lift: 0.96 };
  function applyPose() {
    if (!hero) return;
    hero.style.setProperty("--fold", pose.fold.toFixed(2) + "deg");
    hero.style.setProperty("--tilt-x", pose.tiltX.toFixed(2) + "deg");
    hero.style.setProperty("--tilt-y", pose.tiltY.toFixed(2) + "deg");
    hero.style.setProperty("--shift", pose.shift.toFixed(4));
    hero.style.setProperty("--lift", pose.lift.toFixed(3));
  }

  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero-pin",
      start: "top top",
      end: function () {
        return window.innerWidth < 800 ? "+=80%" : "+=140%";
      },
      pin: true,
      scrub: 0.45,
      anticipatePin: 1,
      onToggle: function (self) {
        if (hero) hero.classList.toggle("is-hot", self.isActive);
      }
    }
  });

  heroTl.to(pose, {
    fold: -4,
    tiltX: 6,
    tiltY: -10,
    shift: 0,
    lift: 1,
    ease: "none",
    onUpdate: applyPose
  }, 0);

  heroTl.to(".wordmark", { y: -28, ease: "none" }, 0);
  heroTl.to(".scroll-note", { autoAlpha: 0, y: -6, ease: "none" }, 0.05);
  heroTl.fromTo("#opened-note", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, ease: "none" }, 0.62);

  var letters = Array.prototype.slice.call(document.querySelectorAll(".kinetic .char"));
  if (letters.length) {
    ScrollTrigger.create({
      trigger: "#silicon",
      start: "top 80%",
      end: "bottom 55%",
      scrub: 0.35,
      onUpdate: function (self) {
        var spread = Math.min(26, window.innerWidth * 0.018);
        letters.forEach(function (letter, index) {
          var mid = (letters.length - 1) / 2;
          var x = (index - mid) * spread * self.progress;
          letter.style.transform = "translate3d(" + x.toFixed(2) + "px, 0, 0)";
        });
      }
    });
  }

  var scene = document.getElementById("scene");
  var sun = scene ? scene.querySelector(".sun") : null;
  var ridge = scene ? scene.querySelector(".ridge") : null;
  var focalMm = document.getElementById("focal-mm");
  var focalName = document.getElementById("focal-name");
  var focalAp = document.getElementById("focal-ap");
  var iris = document.querySelector(".iris-blades");
  var lastStop = "";

  if (scene) {
    ScrollTrigger.create({
      trigger: "#lens",
      start: "top top",
      end: function () {
        return window.innerWidth < 800 ? "+=90%" : "+=130%";
      },
      pin: true,
      scrub: 0.4,
      anticipatePin: 1,
      onUpdate: function (self) {
        var p = self.progress;
        var scale = 1 + p * 1.65;
        scene.style.transform = "scale(" + scale.toFixed(3) + ")";
        if (sun) sun.style.transform = "translate3d(0, " + (-28 * p).toFixed(2) + "px, 0)";
        if (ridge) ridge.style.transform = "translate3d(0, " + (16 * p).toFixed(2) + "px, 0)";
        if (iris) iris.style.transform = "rotate(" + (p * 48).toFixed(2) + "deg)";
        var stop = "13";
        var name = "Fusion Ultra Wide";
        var ap = "f/2.2 · 120°";
        if (p >= 0.66) {
          stop = "52";
          name = "Optical-quality 2×";
          ap = "f/1.6 · from the Main";
        } else if (p >= 0.3) {
          stop = "26";
          name = "Fusion Main";
          ap = "f/1.6 · sensor-shift";
        }
        if (stop !== lastStop) {
          lastStop = stop;
          if (focalMm) focalMm.textContent = stop;
          if (focalName) focalName.textContent = name;
          if (focalAp) focalAp.textContent = ap;
        }
      }
    });
  }

  gsap.fromTo(
    ".cell-fill",
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#cell",
        start: "top 75%",
        end: "top 45%",
        scrub: true
      }
    }
  );

  function bindMagnetic(nodes) {
    Array.prototype.forEach.call(nodes, function (el) {
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var x = event.clientX - (rect.left + rect.width / 2);
        var y = event.clientY - (rect.top + rect.height / 2);
        el.style.transform = "translate3d(" + (x * 0.25).toFixed(2) + "px, " + (y * 0.3).toFixed(2) + "px, 0)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "translate3d(0, 0, 0)";
      });
    });
  }
})();
