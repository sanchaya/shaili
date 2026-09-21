(function () {
  var hamburger = document.getElementById("hamburger-icon");
  var slideMenuBanner = document.getElementById("slide-menu-baner");
  var slideMenu = document.getElementById("slide-menu");
  var slideMenuClose = document.getElementById("slide-menu-close");

  function openMenu() {
    if (slideMenuBanner) slideMenuBanner.classList.add("open");
    if (slideMenu) slideMenu.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (slideMenuBanner) slideMenuBanner.classList.remove("open");
    if (slideMenu) slideMenu.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburger) hamburger.addEventListener("click", function (e) {
    e.stopPropagation();
    openMenu();
  });
  if (slideMenuClose) slideMenuClose.addEventListener("click", closeMenu);
  document.querySelectorAll("[data-close-menu]").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });

  var dropbtns = document.querySelectorAll(".menu-items .dropdown .dropbtn");
  dropbtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var drop = btn.closest(".dropdown");
      var wasOpen = drop.classList.contains("open");
      document.querySelectorAll(".menu-items .dropdown.open").forEach(function (d) {
        d.classList.remove("open");
      });
      if (!wasOpen) drop.classList.add("open");
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".menu-items .dropdown")) {
      document.querySelectorAll(".menu-items .dropdown.open").forEach(function (d) {
        d.classList.remove("open");
      });
    }
  });

  function revealOnScroll() {
    var elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach(function (el) { observer.observe(el); });
  }

  function countUp() {
    var values = document.querySelectorAll(".stat-value[data-count]");
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          observer.unobserve(el);
          var target = parseInt(el.getAttribute("data-count"), 10) || 0;
          var duration = 1400;
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    values.forEach(function (el) { observer.observe(el); });
  }

  function setupTypePagination() {
    var grid = document.querySelector(".type-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".type-card"));
    var perPage = 8;
    var totalPages = Math.max(1, Math.ceil(cards.length / perPage));
    var currentPage = 1;

    function showPage(page) {
      currentPage = Math.min(Math.max(1, page), totalPages);
      cards.forEach(function (card, index) {
        var inPage = index >= (currentPage - 1) * perPage && index < currentPage * perPage;
        card.style.display = inPage ? "" : "none";
      });
      updateControls();
    }

    function updateControls() {
      var prev = document.getElementById("type-prev");
      var next = document.getElementById("type-next");
      var info = document.getElementById("type-page-info");
      if (prev) prev.disabled = currentPage <= 1;
      if (next) next.disabled = currentPage >= totalPages;
      if (info) info.textContent = "Page " + currentPage + " of " + totalPages;
    }

    var prevBtn = document.getElementById("type-prev");
    var nextBtn = document.getElementById("type-next");
    if (prevBtn) prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showPage(currentPage - 1);
    });
    if (nextBtn) nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showPage(currentPage + 1);
    });

    if (totalPages > 1) {
      showPage(1);
      var controls = document.getElementById("type-pagination");
      if (controls) controls.style.display = "flex";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    revealOnScroll();
    countUp();
    setupTypePagination();
  });
})();