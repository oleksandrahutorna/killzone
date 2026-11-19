"use strict";

const marqueeTrack = document.querySelector(".signal-track");
const marqueeGroup = marqueeTrack?.querySelector("[data-marquee-group]");

if (marqueeTrack && marqueeGroup) {
  const sequence = Array.from(marqueeGroup.children, (item) => item.cloneNode(true));

  const fillMarquee = () => {
    marqueeGroup.replaceChildren(...sequence.map((item) => item.cloneNode(true)));
    const sequenceWidth = marqueeGroup.getBoundingClientRect().width;
    if (!sequenceWidth) return;

    const coverageWidth = marqueeTrack.parentElement.clientWidth + sequenceWidth;
    while (marqueeGroup.scrollWidth < coverageWidth) {
      marqueeGroup.append(...sequence.map((item) => item.cloneNode(true)));
    }

    const duplicate = marqueeGroup.cloneNode(true);
    duplicate.removeAttribute("data-marquee-group");
    duplicate.setAttribute("aria-hidden", "true");
    marqueeTrack.replaceChildren(marqueeGroup, duplicate);
    marqueeTrack.style.setProperty("--marquee-duration", `${marqueeGroup.scrollWidth / 42}s`);
  };

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fillMarquee);
  });
  fillMarquee();
  document.fonts?.ready.then(fillMarquee);
}

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (menuToggle && primaryNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Відкрити меню");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Відкрити меню" : "Закрити меню");
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const slider = document.querySelector("[data-slider]");

if (slider) {
  const track = slider.querySelector("[data-slider-track]");
  const slides = Array.from(slider.querySelectorAll(".showcase-slide"));
  const currentLabel = document.querySelector("[data-current-slide]");
  const progress = document.querySelector("[data-slider-progress]");
  const previousButton = document.querySelector("[data-slider-prev]");
  const nextButton = document.querySelector("[data-slider-next]");
  let currentIndex = 0;

  const showSlide = (index) => {
    if (!track || slides.length === 0) return;
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
    });
    if (currentLabel) currentLabel.textContent = String(currentIndex + 1).padStart(2, "0");
    if (progress) progress.style.transform = `translateX(${currentIndex * 100}%)`;
  };

  previousButton?.addEventListener("click", () => showSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => showSlide(currentIndex + 1));

  let touchStartX = 0;
  slider.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? 0;
  }, { passive: true });
  slider.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  showSlide(0);
}

const shopSection = document.querySelector(".shop-section");

if (shopSection) {
  const shopTabs = Array.from(shopSection.querySelectorAll("[data-shop-tab]"));
  const shopPanels = Array.from(shopSection.querySelectorAll("[data-shop-panel]"));

  const selectShopTab = (selectedTab, moveFocus = false) => {
    const category = selectedTab.dataset.shopTab;
    shopTabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });
    shopPanels.forEach((panel) => {
      panel.hidden = panel.dataset.shopPanel !== category;
    });
    if (moveFocus) selectedTab.focus();
  };

  shopTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectShopTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % shopTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + shopTabs.length) % shopTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = shopTabs.length - 1;
      else return;
      event.preventDefault();
      selectShopTab(shopTabs[nextIndex], true);
    });
  });

  shopSection.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("[data-shop-buy]");
    if (!(button instanceof HTMLButtonElement)) return;

    const item = button.closest(".shop-item");
    const note = item?.querySelector("[data-shop-note]");
    const price = item?.querySelector(".shop-price")?.textContent?.trim();
    if (!note || !price) return;

    const isOwned = item.querySelector(".shop-owned") !== null;
    note.textContent = isOwned
      ? "Vanguard вже відкритий — обери його у меню гри."
      : `Ціна: ${price}. Придбання доступне за монети у внутрішньоігровому магазині.`;
    note.hidden = false;
    button.setAttribute("aria-expanded", "true");
  });
}

const promoSection = document.querySelector(".promocodes");

if (promoSection) {
  promoSection.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) return;

    const revealButton = event.target.closest("[data-promo-reveal]");
    if (revealButton instanceof HTMLButtonElement) {
      const card = revealButton.closest(".promo-card");
      const codeBox = card?.querySelector("[data-promo-box]");
      const codeElement = card?.querySelector("[data-promo-code]");
      if (!codeBox || !codeElement) return;

      codeElement.textContent = revealButton.dataset.code ?? "";
      codeBox.hidden = false;
      revealButton.setAttribute("aria-expanded", "true");
      revealButton.innerHTML = 'ПРОМОКОД ОТРИМАНО <span aria-hidden="true">✓</span>';
      return;
    }

    const copyButton = event.target.closest("[data-promo-copy]");
    if (!(copyButton instanceof HTMLButtonElement)) return;

    const card = copyButton.closest(".promo-card");
    const code = card?.querySelector("[data-promo-code]")?.textContent?.trim();
    const feedback = card?.querySelector("[data-promo-feedback]");
    if (!code || !feedback) return;

    try {
      if (!navigator.clipboard?.writeText) {
        feedback.textContent = `Код ${code} відкрито — скопіюй його вручну.`;
        return;
      }
      await navigator.clipboard.writeText(code);
      feedback.textContent = "Промокод скопійовано.";
    } catch (error) {
      feedback.textContent = `Не вдалося скопіювати. Код: ${code}`;
    }
  });
}

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
  document.documentElement.classList.add("js-enabled");
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
