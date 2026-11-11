
(() => {
  const photos = Array.isArray(window.PORTFOLIO_PHOTOS)
    ? window.PORTFOLIO_PHOTOS
    : [];

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
  let touchStartX = 0;
  let touchStartY = 0;

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

  // LIGHTBOX
  function showPhoto(index) {
    const available = availablePhotos();

    if (!available.length || !preview) return;

    const selected = available.find(
      item => item.index === index
    ) || available[0];

    activeIndex = selected.index;

    const photo = selected.photo;

    preview.src = photo.src;
    preview.alt = label(photo);

    if (caption) {
      const position = available.findIndex(
        item => item.index === activeIndex
      ) + 1;

      caption.textContent =
        `${label(photo)} — ${String(position).padStart(2, "0")} / ${String(available.length).padStart(2, "0")}`;
    }
  }

  function navigate(direction) {
    const available = availablePhotos();

    if (available.length < 2) return;

    const current = available.findIndex(
      item => item.index === activeIndex
    );

    const next = (
      current + direction + available.length
    ) % available.length;

    showPhoto(available[next].index);
  }

  function openPhoto(index) {
    showPhoto(index);

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
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
      dialog.close();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => navigate(-1));
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => navigate(1));
  }

  if (dialog) {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
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
