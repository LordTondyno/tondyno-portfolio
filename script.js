(() => {
  const photos = Array.isArray(window.PORTFOLIO_PHOTOS) ? window.PORTFOLIO_PHOTOS : [];
  const gallery = document.getElementById("gallery");
  const count = document.getElementById("photo-count");
  const empty = document.getElementById("empty-state");
  const dialog = document.getElementById("lightbox");
  const preview = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  let activeIndex = 0;

  document.getElementById("year").textContent = new Date().getFullYear();
  count.textContent = String(photos.length).padStart(2, "0");

  function label(photo) {
    return [photo.title || "Untitled", photo.year || ""].filter(Boolean).join(" · ");
  }
  function showPhoto(index) {
    if (!photos.length) return;
    activeIndex = (index + photos.length) % photos.length;
    const photo = photos[activeIndex];
    preview.src = photo.src;
    preview.alt = label(photo);
    caption.textContent = label(photo);
  }

  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "photo-card";
    button.type = "button";
    button.setAttribute("aria-label", "Open photograph: " + label(photo));
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = label(photo);
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => { button.remove(); count.textContent = String(gallery.children.length).padStart(2, "0"); });
    const meta = document.createElement("span");
    meta.className = "photo-caption";
    const title = document.createElement("span");
    title.textContent = photo.title || "Untitled";
    const year = document.createElement("span");
    year.textContent = photo.year || "";
    meta.append(title, year);
    button.append(img, meta);
    button.addEventListener("click", () => { showPhoto(index); dialog.showModal(); });
    gallery.append(button);
  });
  empty.hidden = photos.length > 0;

  document.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  document.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(activeIndex - 1));
  document.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(activeIndex + 1));
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  document.addEventListener("keydown", event => {
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") showPhoto(activeIndex - 1);
    if (event.key === "ArrowRight") showPhoto(activeIndex + 1);
  });
})();


/* SCROLL REVEAL */

const gallery = document.querySelector("#gallery");

if (gallery) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  const observePhotos = () => {
    gallery.querySelectorAll(":scope > *:not(.is-visible)")
      .forEach((photo) => observer.observe(photo));
  };

  observePhotos();

  new MutationObserver(observePhotos).observe(gallery, {
    childList: true
  });
}


/* ==================================
   TONY DANG — SCROLL REVEAL
================================== */

const gallery = document.querySelector("#gallery");

if (gallery && "IntersectionObserver" in window) {

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px 40px 0px"
  });

  const observePhotos = () => {
    gallery.querySelectorAll(":scope > *:not(.is-visible)")
      .forEach((photo) => observer.observe(photo));
  };

  observePhotos();

  new MutationObserver(observePhotos).observe(gallery, {
    childList: true
  });

} else if (gallery) {
  gallery.querySelectorAll(":scope > *")
    .forEach((photo) => photo.classList.add("is-visible"));
}


/* LIGHTBOX */

.lightbox {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  padding: 65px 80px 35px;
  margin: 0;
  border: none;
  background: #080808;
  color: #f2f2f0;
  text-align: center;
}

.lightbox::backdrop {
  background: rgba(0, 0, 0, 0.97);
}

#lightbox-image {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 150px);
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 0 auto;
}

.lightbox button {
  position: absolute;
  color: #f2f2f0;
  background: transparent;
  border: none;
  cursor: pointer;
  font: inherit;
}

.lightbox-close {
  top: 25px;
  right: 35px;
}

.lightbox-prev {
  top: 50%;
  left: 30px;
}

.lightbox-next {
  top: 50%;
  right: 30px;
}

#lightbox-caption {
  color: #999;
  font-size: 12px;
  margin-top: 20px;
}

@media (max-width: 700px) {
  .lightbox {
    padding: 60px 15px 25px;
  }

  .lightbox-prev {
    left: 10px;
  }

  .lightbox-next {
    right: 10px;
  }
}
