/* ============================================================
   ZENTIX — contact form inbox configuration
   ------------------------------------------------------------
   PRIMARY_INBOX : the main inbox. FormSubmit sends every
                   inquiry here. IMPORTANT: FormSubmit needs a
                   ONE-TIME activation — the first submission
                   triggers a confirmation email to this address
                   that must be clicked before mail flows.
   CC_INBOX      : carbon-copy inbox. Every inquiry is CC'd here
                   via FormSubmit's hidden _cc field.
   ============================================================ */
const PRIMARY_INBOX = "mycodingseries@gmail.com";      // TODO (founders): click the FormSubmit activation email once
const CC_INBOX = "shahwaiz.mehdi@outlook.com";          // CC on every inquiry

(function () {
  "use strict";

  /* ---------- sticky header ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            e.target.style.transitionDelay = Math.min(idx * 60, 300) + "ms";
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll(".counter");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- hero canvas: drifting node network ---------- */
  const canvas = document.getElementById("heroCanvas");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d");
    let w, h, nodes = [];
    const COUNT = 55;
    const LINK = 130;
    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = r.width;
      h = canvas.height = r.height;
    }
    function seed() {
      nodes = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }
    function frame() {
      if (document.hidden) { requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(94,234,212,${(1 - d / LINK) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(129,140,248,0.5)";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize(); seed(); frame();
    window.addEventListener("resize", () => { resize(); seed(); });
  }

  /* ---------- work slider ---------- */
  const track = document.getElementById("sliderTrack");
  const slides = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById("sliderDots");
  const prevBtn = document.getElementById("sliderPrev");
  const nextBtn = document.getElementById("sliderNext");
  const slider = document.getElementById("workSlider");
  let index = 0, timer = null;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll(".slider-dot").forEach((d, di) => {
      d.classList.toggle("active", di === index);
      d.setAttribute("aria-selected", di === index ? "true" : "false");
    });
  }
  function restartAuto() {
    clearInterval(timer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => goTo(index + 1), 7000);
  }
  if (slides.length) {
    slides.forEach((s, i) => {
      const d = document.createElement("button");
      d.className = "slider-dot" + (i === 0 ? " active" : "");
      d.setAttribute("role", "tab");
      d.setAttribute("aria-selected", i === 0 ? "true" : "false");
      d.setAttribute("aria-label", `Go to project ${i + 1}`);
      d.addEventListener("click", () => { goTo(i); restartAuto(); });
      dotsWrap.appendChild(d);
    });
    prevBtn.addEventListener("click", () => { goTo(index - 1); restartAuto(); });
    nextBtn.addEventListener("click", () => { goTo(index + 1); restartAuto(); });
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restartAuto);
    document.addEventListener("keydown", (e) => {
      const r = slider.getBoundingClientRect();
      const inView = r.top < window.innerHeight && r.bottom > 0;
      if (!inView) return;
      if (e.key === "ArrowLeft") { goTo(index - 1); restartAuto(); }
      if (e.key === "ArrowRight") { goTo(index + 1); restartAuto(); }
    });
    let touchX = null;
    slider.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { goTo(index + (dx < 0 ? 1 : -1)); restartAuto(); }
      touchX = null;
    }, { passive: true });
    restartAuto();
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const panel = item.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ---------- contact form via FormSubmit (primary + CC) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("formSubmitBtn");

  function showStatus(ok, html) {
    status.hidden = false;
    status.className = "form-status " + (ok ? "success" : "error");
    status.innerHTML = html;
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    const data = {
      name: document.getElementById("fName").value.trim(),
      email: document.getElementById("fEmail").value.trim(),
      projectType: document.getElementById("fType").value,
      budget: document.getElementById("fBudget").value,
      message: document.getElementById("fMsg").value.trim(),
      _subject: "New Zentix project inquiry",
      _template: "table",          // well-formatted table email
      _cc: CC_INBOX,               // copy to the second founder
      _captcha: "false",
    };

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${PRIMARY_INBOX}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.success !== "false") {
        showStatus(true, "<strong>Thank you, inquiry received.</strong><br>We reply to every serious inquiry personally, usually within one business day.");
        form.reset();
      } else {
        throw new Error(out.message || "send failed");
      }
    } catch (err) {
      showStatus(false,
        "<strong>Something went wrong sending the form.</strong><br>" +
        `Please email us directly instead: <a href="mailto:${PRIMARY_INBOX}?cc=${CC_INBOX}&subject=${encodeURIComponent("Zentix project inquiry")}">send via your email app</a>.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send inquiry";
    }
  });
})();
