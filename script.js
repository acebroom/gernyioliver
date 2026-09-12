/* ==========================================================================
   GÉRNYI OLIVÉR — FOTÓZÁS & VIDEÓZÁS
   script.js — moduláris, jól kommentelt viselkedés-réteg

   Tartalom:
   1) Konfiguráció / galéria adatok
   2) Fejléc: scroll-állapot
   3) Mobil hamburger menü (jobb oldali panel)
   4) Smooth scroll segéd + menü automatikus záródás
   5) Galéria: mappaváltó + nagy képnéző (MotionPathTransition-ihletésű
      ív-animációval) + bélyegkép-csík + billentyűzet / érintés vezérlés
   6) Scroll-reveal animációk (IntersectionObserver)
   7) Kapcsolatfelvételi űrlap (kliens-oldali validáció + visszajelzés)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     2) FEJLÉC — háttér / árnyék hozzáadása görgetéskor
  ------------------------------------------------------------------------ */

  const header = document.querySelector(".site-header");

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();

  /* ------------------------------------------------------------------------
     3) MOBIL HAMBURGER MENÜ
     A specifikáció szerint a menü megnyitásakor csak a képernyő jobb
     oldala legyen fekete panellel lefedve; a bal oldal látható marad,
     finoman elhomályosítva (ezt a .mobile-menu-overlay + backdrop-filter
     kombináció adja, ami az egész képernyőn dolgozik, de a panel csak a
     jobb ~78%-ot foglalja el).
  ------------------------------------------------------------------------ */

  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileMenuClose = document.querySelector(".mobile-menu-close");
  const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

  function openMobileMenu() {
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.classList.add("active");
    mobileMenuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("active");
    mobileMenuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      const isActive = hamburger.classList.contains("active");
      if (isActive) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", closeMobileMenu);
  }

  // Menüpontra kattintva: lágy görgetés a szekcióhoz, majd a menü záródik
  mobileMenuLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        event.preventDefault();
        closeMobileMenu();
        // Kis késleltetés, hogy a menü bezáródási animációja után
        // induljon a görgetés — simább élményt ad.
        window.setTimeout(function () {
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 320);
      }
    });
  });

  // ESC billentyűre is záródjon a menü
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMobileMenu();
    }
  });

  /* ------------------------------------------------------------------------
     4) DESKTOP NAV — sima görgetés natívan (CSS scroll-behavior), csak
     biztosítjuk hogy a horgony-linkek natívan működjenek, nincs extra JS
     szükséges rájuk a smooth scroll-hoz.
  ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------
     6) SCROLL-REVEAL — finom megjelenési animáció szekció-elemekre
  ------------------------------------------------------------------------ */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealElements.length) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: ha nincs IntersectionObserver támogatás, minden látszódjon
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------------------
     7) KAPCSOLATFELVÉTELI ŰRLAP
     Mivel statikus (GitHub Pages) hoszting a cél, nincs szerver-oldali
     feldolgozás ebben a fájlban. A form kliens-oldali validációt végez és
     visszajelzést ad; a tényleges elküldéshez egy form-service (pl.
     Formspree, EmailJS) action-attribútumát kell majd beállítani, vagy a
     mailto: linket használni. Ez a rész készen áll mindkettőre.
  ------------------------------------------------------------------------ */

  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = contactForm.querySelector("#name").value.trim();
      const email = contactForm.querySelector("#email").value.trim();
      const message = contactForm.querySelector("#message").value.trim();

      if (!name || !email || !message) {
        formNote.textContent = "Kérlek, tölts ki minden kötelező mezőt.";
        formNote.classList.remove("success");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        formNote.textContent = "Kérlek, adj meg egy érvényes email címet.";
        formNote.classList.remove("success");
        return;
      }

      // Itt lehetne API / form-service hívást indítani. Egyelőre egy
      // mailto: linkkel nyitjuk meg a levelezőt, előre kitöltött tartalommal.
      const service = contactForm.querySelector("#service").value;
      const subject = encodeURIComponent("Ajánlatkérés — " + (service || "Fotózás"));
      const body = encodeURIComponent(
        "Név: " + name + "\nEmail: " + email + "\nSzolgáltatás: " + service + "\n\nÜzenet:\n" + message
      );

      window.location.href =
        "mailto:gernyioliver0824@gmail.com?subject=" + subject + "&body=" + body;

      formNote.textContent = "Köszönjük! Megnyitottuk a levelezőt az üzeneteddel — küldd el, és hamarosan válaszolunk.";
      formNote.classList.add("success");
      contactForm.reset();
    });
  }
})();
