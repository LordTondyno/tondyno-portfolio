
(() => {

    // HERO SLIDESHOW

  const heroSlideshow = document.querySelector(".hero-slideshow");

  const heroPhotos = Array.isArray(window.HERO_PHOTOS)
    ? window.HERO_PHOTOS
    : [];

  if (
    heroSlideshow &&
    heroPhotos.length > 1 &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    heroSlideshow.replaceChildren();

    const slides = heroPhotos.map((src, index) => {
      const img = document.createElement("img");

      img.className = index === 0
        ? "hero-slide active"
        : "hero-slide";

      img.src = src;
      img.alt = "";
      img.loading = "eager";
      img.decoding = "async";

      if (index === 0) {
        img.fetchPriority = "high";
      }

      heroSlideshow.appendChild(img);

      return img;
    });

    let activeIndex = 0;

    window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;

      slides[activeIndex].classList.remove("active");
      slides[nextIndex].classList.add("active");

      activeIndex = nextIndex;
    }, 5000);
  }
  
  // DESKTOP SMOOTH SCROLL
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isDesktop = window.matchMedia(
    "(min-width: 601px)"
  ).matches;

  if (false && !prefersReducedMotion && isDesktop && window.Lenis) {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }
  
  // LOAD AND RANDOMIZE PHOTOS
const photos = Array.isArray(window.PORTFOLIO_PHOTOS)
  ? [...window.PORTFOLIO_PHOTOS]
  : [];

// Fisher-Yates shuffle
for (let i = photos.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [photos[i], photos[j]] = [photos[j], photos[i]];
}

  const gallery = document.getElementById("gallery");
  const count = document.getElementById("photo-count");
  const empty = document.getElementById("empty-state");
  const dialog = document.getElementById("lightbox");
  const preview = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const year = document.getElementById("year");
  const clock = document.getElementById("prague-time");

  if (!gallery) return;

 let activeIndex = 0;
  let photoLoadToken = 0;
let touchStartX = 0;
let touchStartY = 0;
let isClosing = false;

  const failedPhotos = new Set();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // YEAR
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // PRAGUE CLOCK
  function updateClock() {
    if (!clock) return;

    clock.textContent = "PRAGUE · " +
      new Intl.DateTimeFormat("cs-CZ", {
        timeZone: "Europe/Prague",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());
  }

  updateClock();

  if (clock) {
    setInterval(updateClock, 1000);
  }

  // PHOTO LABEL
  function label(photo) {
    return [
      photo.title || "Untitled",
      photo.year || ""
    ].filter(Boolean).join(" · ");
  }

  function availablePhotos() {
    return photos
      .map((photo, index) => ({ photo, index }))
      .filter(item => !failedPhotos.has(item.index));
  }

  function updateCount() {
    if (count) {
      count.textContent = String(
        availablePhotos().length
      ).padStart(2, "0");
    }

    if (empty) {
      empty.hidden = availablePhotos().length > 0;
    }
  }

  // POSITION LIGHTBOX ARROWS ON MOBILE

function positionLightboxArrows() {
  const prev = document.querySelector(".lightbox-prev");
  const next = document.querySelector(".lightbox-next");

  if (!preview || !dialog || !prev || !next) return;

  if (!window.matchMedia("(max-width: 600px)").matches) {
    prev.style.top = "";
    next.style.top = "";
    return;
  }

  const imageRect = preview.getBoundingClientRect();
  const dialogRect = dialog.getBoundingClientRect();

  if (!imageRect.height) return;

  const center =
    imageRect.top + imageRect.height / 2 - dialogRect.top;

  prev.style.top = `${center}px`;
  next.style.top = `${center}px`;
}

preview.addEventListener("load", positionLightboxArrows);
window.addEventListener("resize", positionLightboxArrows);

  // LIGHTBOX
function showPhoto(index, direction = 0) {
  const available = availablePhotos();

  if (!available.length || !preview) return;

  const selected = available.find(
    item => item.index === index
  ) || available[0];

  activeIndex = selected.index;

  const photo = selected.photo;
  const token = ++photoLoadToken;

  if (caption) {
    const position = available.findIndex(
      item => item.index === activeIndex
    ) + 1;

    caption.textContent =
      `${label(photo)} — ${String(position).padStart(2, "0")} / ${String(available.length).padStart(2, "0")}`;
  }

  if (direction === 0 || reducedMotion) {
    preview.classList.remove("photo-next", "photo-prev");
    preview.src = photo.src;
    preview.alt = label(photo);
    return;
  }

  const preloader = new Image();

  preloader.onload = () => {
    if (token !== photoLoadToken) return;

    preview.classList.remove("photo-next", "photo-prev");

    preview.src = photo.src;
    preview.alt = label(photo);

    void preview.offsetWidth;

    preview.classList.add(
      direction > 0 ? "photo-next" : "photo-prev"
    );
  };

  preloader.onerror = () => {
    if (token !== photoLoadToken) return;

    preview.classList.remove("photo-next", "photo-prev");
    preview.src = photo.src;
    preview.alt = label(photo);
  };

  preloader.src = photo.src;
}

function navigate(direction) {
  if (isClosing) return;

  const available = availablePhotos();

  if (available.length < 2) return;

  const current = available.findIndex(
    item => item.index === activeIndex
  );

  const next = (
    current + direction + available.length
  ) % available.length;

  showPhoto(available[next].index, direction);
}

function openPhoto(index) {
  if (isClosing) return;

  showPhoto(index);

  if (dialog && !dialog.open) {
    dialog.classList.remove("is-closing");
    dialog.showModal();
  }
}

// ANIMATED LIGHTBOX CLOSE
function closeLightbox() {
  if (!dialog || !dialog.open || isClosing) return;

  isClosing = true;
  dialog.classList.add("is-closing");

  const finishClosing = () => {
    if (!dialog.open) return;
    dialog.close();
  };

  dialog.addEventListener("animationend", function onAnimationEnd(event) {
    if (event.target !== dialog) return;

    dialog.removeEventListener("animationend", onAnimationEnd);

    if (dialog.classList.contains("is-closing")) {
      finishClosing();
    }
  });

  setTimeout(finishClosing, 500);
}

  // IMAGE REVEAL
  function prepareReveal(img, card) {
    let isInView = false;
    let isRevealed = false;
    let isDecoding = false;

    async function revealWhenReady() {
      if (
        !isInView ||
        isRevealed ||
        isDecoding ||
        !img.complete ||
        img.naturalWidth === 0
      ) {
        return;
      }

      isDecoding = true;

      try {
        if (img.decode) {
          await img.decode();
        }
      } catch (error) {
        // Image may already be decoded or browser may not support decode.
      }

      isDecoding = false;

      if (!isInView || isRevealed) return;

      isRevealed = true;
      card.classList.add("is-visible");
    }

    img.addEventListener("load", revealWhenReady);

    return {
      enterView() {
        isInView = true;
        revealWhenReady();
      }
    };
  }

  // BUILD GALLERY
  const revealTargets = [];

  photos.forEach((photo, index) => {
    const button = document.createElement("button");

    button.className = "photo-card";
    button.type = "button";

    button.setAttribute(
      "aria-label",
      "Open photograph: " + label(photo)
    );

    const img = document.createElement("img");

    img.src = photo.src;
    img.alt = label(photo);
    img.decoding = "async";

    // Prioritize the first photograph.
    if (index === 0) {
      img.loading = "eager";
      img.fetchPriority = "high";
    } else if (index === 1) {
      img.loading = "eager";
    } else {
      img.loading = "lazy";
    }

    const meta = document.createElement("span");
    meta.className = "photo-caption";

    const title = document.createElement("span");
    title.textContent = photo.title || "Untitled";

    const photoYear = document.createElement("span");
    photoYear.textContent = photo.year || "";

    meta.append(title, photoYear);
    button.append(img, meta);

    const reveal = prepareReveal(img, button);

    button.addEventListener("click", () => {
      openPhoto(index);
    });

    img.addEventListener("error", () => {
      failedPhotos.add(index);
      button.remove();
      updateCount();
    });

    gallery.append(button);

    revealTargets.push({
      card: button,
      reveal
    });
  });

  updateCount();

  // SCROLL-BASED REVEAL
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(({ card }) => {
      card.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const target = revealTargets.find(
          item => item.card === entry.target
        );

        if (target) {
          target.reveal.enterView();
        }

        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px 80px 0px"
    });

    revealTargets.forEach(({ card }) => {
      observer.observe(card);
    });
  }

// LIGHTBOX CONTROLS
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");

if (closeButton && dialog) {
  closeButton.addEventListener("click", () => {
    closeLightbox();
  });
}

if (prevButton) {
  prevButton.addEventListener("click", () => navigate(-1));
}

if (nextButton) {
  nextButton.addEventListener("click", () => navigate(1));
}

if (dialog) {
  // Click outside the photograph
  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      closeLightbox();
    }
  });

  // Escape key
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeLightbox();
  });

  dialog.addEventListener("close", () => {
    dialog.classList.remove("is-closing");
    isClosing = false;

    if (preview) {
      preview.removeAttribute("src");
    }
  });
}

  // KEYBOARD NAVIGATION
  document.addEventListener("keydown", event => {
    if (!dialog || !dialog.open) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    }
  });

  // MOBILE SWIPE
  if (dialog && preview) {
    dialog.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });

    dialog.addEventListener("touchend", event => {
      const endX = event.changedTouches[0].screenX;
      const endY = event.changedTouches[0].screenY;

      const diffX = endX - touchStartX;
      const diffY = endY - touchStartY;

      if (
        Math.abs(diffX) > 55 &&
        Math.abs(diffX) > Math.abs(diffY)
      ) {
        navigate(diffX < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

})();
