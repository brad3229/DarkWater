// ── NAV ──
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
});

function closeMenu() {
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
}

// ── CONTACT FORM ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = "Sending…";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "✓ Message Sent!";
    btn.style.background = "#2e7d32";
  }, 1200);
}

// ── NAV SHADOW ON SCROLL ──
window.addEventListener("scroll", () => {
  document.getElementById("navbar").style.boxShadow =
    window.scrollY > 60 ? "0 2px 20px rgba(0,0,0,0.1)" : "";
});

// ── SPLASH DISMISS ──
(function () {
  const splash = document.getElementById("splash");
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => splash.remove(), 600);
  }, 1400);
})();

// ── SCROLL REVEALS ──
// Classes are added via JS so no-JS users always see content
(function () {
  const revealTargets = [
    ...document.querySelectorAll(
      "#shop .section-label, #shop .section-title, #shop .section-desc," +
        "#services .section-label, #services .section-title, #services .section-desc," +
        "#contact .section-label, #contact .section-title, #contact .section-desc",
    ),
    ...document.querySelectorAll(".category-card"),
    ...document.querySelectorAll(".service-card"),
    document.querySelector(".ffl-banner"),
    document.querySelector(".store-info"),
    document.querySelector(".contact-form"),
  ].filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  // Stagger delays for card grids
  document
    .querySelectorAll(".categories-grid .category-card")
    .forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.13}s`;
    });
  document.querySelectorAll(".services-grid .service-card").forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
})();
