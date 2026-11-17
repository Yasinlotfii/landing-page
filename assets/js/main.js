/* LOTFI — Portfolio interactions */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const nav = $("#site-nav");
  const navToggle = $("#nav-toggle");
  const mobileMenu = $("#mobile-menu");
  const progressBar = $("#scroll-progress-bar");
  const toTop = $("#to-top");
  const year = $("#year");
  const heroSpot = $("#hero-spot");
  const cursorGlow = $("#cursor-glow");

  // Current year
  if (year) year.textContent = new Intl.NumberFormat("fa-IR").format(new Date().getFullYear());

  // Mobile navigation
  const closeMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "باز کردن منو");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.classList.toggle("is-open", isOpen);
      mobileMenu.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "بستن منو" : "باز کردن منو");
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });
    $$(".mobile-link, .mobile-menu-foot a", mobileMenu).forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Scroll-based effects
  let ticking = false;
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0}%`;
    if (nav) nav.classList.toggle("is-scrolled", scrollTop > 24);
    if (toTop) toTop.classList.toggle("is-visible", scrollTop > 500);

    const process = $("#process-track");
    const processFill = $("#process-fill");
    if (process && processFill) {
      const rect = process.getBoundingClientRect();
      const visible = Math.min(1, Math.max(0, (window.innerHeight * 0.82 - rect.top) / (rect.height + window.innerHeight * 0.55)));
      processFill.style.height = `${visible * 100}%`;
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
  updateScrollUI();

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Reveal elements on entry
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Active navigation link
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        $$(".nav-link").forEach(link => {
          const active = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-active", active);
        });
      });
    }, { rootMargin: "-32% 0px -58% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Subtle cursor and hero spotlight effects (desktop pointers only)
  const finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    let cursorFrame = 0;
    document.addEventListener("mousemove", event => {
      if (cursorFrame) return;
      cursorFrame = window.requestAnimationFrame(() => {
        if (cursorGlow) {
          cursorGlow.classList.add("is-on");
          cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        }
        if (heroSpot) {
          const hero = $(".hero");
          if (hero) {
            const rect = hero.getBoundingClientRect();
            heroSpot.style.left = `${event.clientX - rect.left}px`;
            heroSpot.style.top = `${event.clientY - rect.top}px`;
            heroSpot.classList.toggle("is-on", event.clientY >= rect.top && event.clientY <= rect.bottom);
          }
        }
        cursorFrame = 0;
      });
    }, { passive: true });
    document.addEventListener("mouseleave", () => {
      if (cursorGlow) cursorGlow.classList.remove("is-on");
      if (heroSpot) heroSpot.classList.remove("is-on");
    });
  }

  // Spotlight card pointer position
  if (finePointer) {
    $$(".spotlight").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  // Portfolio filters
  const filterButtons = $$(".filter[data-filter]");
  const projects = $$(".project[data-category]");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projects.forEach(project => {
        const show = filter === "all" || project.dataset.category === filter;
        project.classList.toggle("is-hidden", !show);
        if (show) {
          project.classList.remove("is-entering");
          void project.offsetWidth;
          project.classList.add("is-entering");
        }
      });
    });
  });

  // Project detail dialog
  const modal = $("#project-modal");
  const modalTitle = $("#modal-title");
  const modalCat = $("#modal-cat");
  const modalDetails = $("#modal-details");
  const modalTags = $("#modal-tags");
  const modalClose = $("#modal-close");

  const closeModal = () => {
    if (modal && modal.open) modal.close();
  };

  $$("[data-project]").forEach(card => {
    card.addEventListener("click", () => {
      if (!modal) return;
      if (modalTitle) modalTitle.textContent = card.dataset.title || "جزئیات پروژه";
      if (modalCat) modalCat.textContent = card.dataset.cat || "";
      if (modalDetails) modalDetails.textContent = card.dataset.details || "";
      if (modalTags) {
        modalTags.replaceChildren();
        (card.dataset.tags || "").split(",").map(tag => tag.trim()).filter(Boolean).forEach(tag => {
          const span = document.createElement("span");
          span.textContent = tag;
          modalTags.appendChild(span);
        });
      }
      if (typeof modal.showModal === "function") modal.showModal();
      else modal.setAttribute("open", "");
    });
  });
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal();
    });
    modal.addEventListener("close", () => {
      const opener = document.activeElement;
      if (opener && typeof opener.focus === "function") opener.focus();
    });
  }
  const modalCta = $("#modal-cta");
  if (modalCta) modalCta.addEventListener("click", closeModal);

  // Contact form: client-side validation + mail application fallback.
  // Replace this address with your real email before publishing.
  const CONTACT_EMAIL = "hi@lotfi.dev";
  const form = $("#contact-form");
  const formStatus = $("#form-status");
  const submitButton = $("#form-submit");

  const setError = (name, message) => {
    const input = form ? $(`#${name}`, form) : null;
    const error = form ? $(`[data-error-for="${name}"]`, form) : null;
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  };

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const values = {
        name: $("#name", form)?.value.trim() || "",
        email: $("#email", form)?.value.trim() || "",
        subject: $("#subject", form)?.value.trim() || "",
        message: $("#message", form)?.value.trim() || "",
        website: $("#website", form)?.value.trim() || ""
      };

      // Honeypot field: silently ignore automated submissions.
      if (values.website) return;

      let valid = true;
      const checks = {
        name: values.name ? "" : "لطفاً نام خود را وارد کنید.",
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "یک ایمیل معتبر وارد کنید.",
        subject: values.subject ? "" : "موضوع پروژه را وارد کنید.",
        message: values.message.length >= 10 ? "" : "توضیحات باید حداقل ۱۰ کاراکتر باشد."
      };
      Object.entries(checks).forEach(([key, error]) => {
        setError(key, error);
        if (error) valid = false;
      });

      if (!valid) {
        if (formStatus) {
          formStatus.textContent = "لطفاً موارد مشخص‌شده را اصلاح کنید.";
          formStatus.classList.add("is-error");
        }
        const firstInvalid = $("[aria-invalid='true']", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const body = `نام: ${values.name}\nایمیل: ${values.email}\n\n${values.message}`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
      if (formStatus) {
        formStatus.classList.remove("is-error");
        formStatus.textContent = "در حال باز کردن برنامه ایمیل شما… اگر باز نشد، آدرس ایمیل داخل فایل main.js را بررسی کنید.";
      }
      if (submitButton) submitButton.disabled = true;
      window.location.href = mailto;
      window.setTimeout(() => {
        if (submitButton) submitButton.disabled = false;
      }, 1800);
    });

    ["name", "email", "subject", "message"].forEach(name => {
      const field = $(`#${name}`, form);
      if (field) field.addEventListener("input", () => setError(name, ""));
    });
  }
})();