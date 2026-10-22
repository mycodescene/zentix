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

  /* ---------- theme toggle ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (t) => {
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("zentix-theme", t); } catch (e) {}
    const dark = t !== "light";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(!dark));
      themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#070B14" : "#f5f8fc");
  };
  let initialTheme = "dark";
  try { initialTheme = localStorage.getItem("zentix-theme") || "dark"; } catch (e) {}
  applyTheme(initialTheme);
  if (themeToggle) themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
  });
})();
/* ============================================================
   ZENTIX — business consultant widget (Phase 1: guided, rule-based)
   Pain-first flow: business -> biggest pain -> team size -> notes
   -> tailored service recommendation -> pre-filled inquiry.
   Phase 2: set AI_BACKEND_URL to a Cloudflare Worker URL and the
   widget will call it instead (see zentix-ai-worker.js).
   ============================================================ */
const AI_BACKEND_URL = null; // Phase 2, e.g. "https://zentix-ai.<you>.workers.dev/chat"

(function () {
  "use strict";
  const launcher = document.getElementById("zcLauncher");
  const panel = document.getElementById("zcPanel");
  const body = document.getElementById("zcBody");
  const quick = document.getElementById("zcQuick");
  const inputRow = document.getElementById("zcInputRow");
  const input = document.getElementById("zcInput");
  const sendBtn = document.getElementById("zcSend");
  const closeBtn = document.getElementById("zcClose");
  if (!launcher || !panel) return;

  const answers = { business: "", pain: "", team: "", notes: "" };
  let step = 0;
  let started = false;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function addMsg(html, who) {
    const d = document.createElement("div");
    d.className = "zc-msg " + who;
    d.innerHTML = html;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  function setQuick(options) {
    quick.innerHTML = "";
    options.forEach((o) => {
      const b = document.createElement("button");
      b.className = "zc-chip";
      b.type = "button";
      b.textContent = o;
      b.addEventListener("click", () => onAnswer(o));
      quick.appendChild(b);
    });
  }

  function setFreeText(on) {
    inputRow.hidden = !on;
    if (on) setTimeout(() => input.focus(), 60);
  }

  const KEYWORDS = [
    { svc: "AI Agents & Automation", why: "An AI assistant can absorb the repetitive work — replying to customers, follow-ups, data entry — so your team focuses on growth.", words: ["customer", "support", "reply", "replies", "chat", "whatsapp", "instagram", "dm ", "inbox", "message", "manual", "data entry", "excel", "spreadsheet", "sheet", "copy", "paste", "repetit", "automat", "tedious", "follow up", "follow-up", "reminder", "invoice", "report", "lead"] },
    { svc: "Website", why: "A fast, high-converting website turns visitors into inquiries on autopilot.", words: ["website", "site", "online presence", "redesign", "slow", "outdated", "no website", "landing", "visitors", "traffic"] },
    { svc: "Shopify / WooCommerce Store", why: "A proper online store with smooth checkout lifts sales without adding staff.", words: ["store", "shop", "sell", "product", "order", "stock", "inventory", "ecommerce", "e-commerce", "cart", "checkout", "retail"] },
    { svc: "Mobile App", why: "Your own app keeps customers coming back instead of hunting for you.", words: ["mobile app", "android", "ios", "iphone", " app"] },
    { svc: "Web App", why: "A custom dashboard or portal removes the spreadsheet chaos and scales with you.", words: ["dashboard", "portal", "platform", "software", "system", "booking", "manag", "crm", "internal", "saas"] },
  ];

  const BIZ_BOOST = [
    { svc: "Shopify / WooCommerce Store", words: ["e-commerce", "ecommerce", "retail", "shop", "store"] },
    { svc: "Website", words: ["service", "services", "local business", "agency", "restaurant", "clinic"] },
    { svc: "Web App", words: ["startup", "saas"] },
  ];

  function scoreServices() {
    const text = (answers.business + " " + answers.pain + " " + answers.notes).toLowerCase();
    const scores = KEYWORDS.map((k) => {
      let s = 0;
      k.words.forEach((w) => { if (text.includes(w)) s += 1; });
      return { svc: k.svc, why: k.why, score: s };
    });
    const biz = answers.business.toLowerCase();
    BIZ_BOOST.forEach((b) => {
      if (b.words.some((w) => biz.includes(w))) {
        const hit = scores.find((s) => s.svc === b.svc);
        if (hit) hit.score += 2;
      }
    });
    scores.sort((a, b) => b.score - a.score);
    const picked = scores.filter((s) => s.score > 0).slice(0, 2);
    if (picked.length === 0) {
      return [
        { svc: "Website", why: KEYWORDS[1].why },
        { svc: "AI Agents & Automation", why: KEYWORDS[0].why },
      ];
    }
    return picked;
  }

  function greet() {
    addMsg(
      "Hi! I&rsquo;m the Zentix consultant. In 4 quick questions I&rsquo;ll map out which services would give your business the biggest lift.<br><br><strong>First &mdash; what does your business do?</strong>",
      "bot"
    );
    setQuick(["E-commerce / retail", "Services", "Local business", "Startup / SaaS"]);
    setFreeText(true);
  }

  function onAnswer(text) {
    text = String(text).trim();
    if (!text) return;
    addMsg(esc(text), "user");
    input.value = "";
    if (step === 0) {
      answers.business = text;
      step = 1;
      addMsg("<strong>What&rsquo;s eating most of your time or money right now?</strong>", "bot");
      setQuick(["Replying to customers", "Manual / repetitive work", "No good website", "Getting new customers", "Managing orders"]);
      setFreeText(true);
    } else if (step === 1) {
      answers.pain = text;
      step = 2;
      addMsg("<strong>How big is your team?</strong>", "bot");
      setQuick(["Just me", "2\u201310", "11\u201350", "50+"]);
      setFreeText(false);
    } else if (step === 2) {
      answers.team = text;
      step = 3;
      addMsg("<strong>Anything else I should know?</strong> (optional)", "bot");
      setQuick(["Skip"]);
      setFreeText(true);
    } else if (step === 3) {
      answers.notes = text.toLowerCase() === "skip" ? "" : text;
      step = 4;
      recommend();
    }
  }

  function recommend() {
    const picked = scoreServices();
    const items = picked.map((p) => "<li><strong>" + esc(p.svc) + "</strong> &mdash; " + esc(p.why) + "</li>").join("");
    addMsg(
      "Based on what you told me, here&rsquo;s your highest-ROI starting point:<ul>" + items + "</ul>Want me to send this to our team as an inquiry? We reply personally to every serious message.",
      "bot"
    );
    setQuick(["Yes, send it as an inquiry", "Start over"]);
    setFreeText(false);
    // the chips already carry onAnswer via setQuick (harmless no-op at step 4);
    // these extra handlers do the real work:
    const chips = quick.querySelectorAll(".zc-chip");
    chips[0].addEventListener("click", sendAsInquiry, { once: true });
    chips[1].addEventListener("click", reset, { once: true });
  }

  function sendAsInquiry() {
    const picked = scoreServices();
    const msg = document.getElementById("fMsg");
    const type = document.getElementById("fType");
    if (msg) {
      msg.value =
        "[Via website consultant]\n" +
        "Business: " + answers.business + "\n" +
        "Biggest pain: " + answers.pain + "\n" +
        "Team size: " + answers.team +
        (answers.notes ? "\nNotes: " + answers.notes : "") + "\n" +
        "Recommended: " + picked.map((p) => p.svc).join(", ");
    }
    if (type) {
      const want = picked[0].svc;
      for (const o of type.options) {
        if (o.text.replace(/\s+/g, " ").trim() === want) { type.value = o.value || o.text; type.selectedIndex = o.index; break; }
      }
    }
    closePanel();
    const contact = document.getElementById("contact");
    if (contact) contact.scrollIntoView({ behavior: "smooth" });
    const name = document.getElementById("fName");
    if (name) setTimeout(() => name.focus({ preventScroll: true }), 700);
  }

  function reset() {
    answers.business = answers.pain = answers.team = answers.notes = "";
    step = 0;
    body.innerHTML = "";
    greet();
  }

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    const ping = launcher.querySelector(".zc-ping");
    if (ping) ping.style.display = "none";
    if (!started) { started = true; greet(); }
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", () => (panel.hidden ? openPanel() : closePanel()));
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) closePanel(); });
  sendBtn.addEventListener("click", () => onAnswer(input.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") onAnswer(input.value); });
})();
