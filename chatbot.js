/* ============================================================
   ZENTIX — AI consultant v2 (2026-10-23)
   Seashore-inspired: pill launcher, pain-first greeting,
   keyword engine (instant, no external API), in-chat lead
   form, honest tone. Never invents prices, timelines for
   specific projects, clients, or reviews.
   ============================================================ */
(function () {
  "use strict";

  var launcher = document.getElementById("zcLauncher");
  var panel = document.getElementById("zcPanel");
  var body = document.getElementById("zcBody");
  var quick = document.getElementById("zcQuick");
  var inputRow = document.getElementById("zcInputRow");
  var input = document.getElementById("zcInput");
  var sendBtn = document.getElementById("zcSend");
  var closeBtn = document.getElementById("zcClose");
  var ctaBtn = document.getElementById("zcCta");
  var ping = document.getElementById("zcPing");
  if (!launcher || !panel || !body) return;

  var started = false, msgCount = 0;
  var MAX_MSG = 30;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasContact = !!document.getElementById("contact");

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function addMsg(html, who) {
    var d = document.createElement("div");
    d.className = "zc-msg " + who;
    d.innerHTML = html;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }
  function setTyping(on) {
    var t = body.querySelector(".zc-typing");
    if (on && !t) {
      t = document.createElement("div");
      t.className = "zc-msg bot zc-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(t);
      body.scrollTop = body.scrollHeight;
    } else if (!on && t) t.remove();
  }
  function setQuick(options) {
    quick.innerHTML = "";
    (options || []).forEach(function (o) {
      var b = document.createElement("button");
      b.className = "zc-chip";
      b.type = "button";
      b.textContent = o.label;
      b.addEventListener("click", o.run);
      quick.appendChild(b);
    });
  }
  function botSay(html, chips, delay) {
    setTyping(true);
    setTimeout(function () {
      setTyping(false);
      addMsg(html, "bot");
      if (chips !== undefined) setQuick(chips);
    }, reduced ? 60 : (delay || 700));
  }
  function go(url) {
    var here = location.pathname.split("/").pop() || "index.html";
    if (here === url) { closePanel(); window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); }
    else location.href = url;
  }

  /* ---------------- knowledge base ---------------- */
  /* chips: "quote" = lead form, "work" = portfolio, "blog" = blog page */
  var KB = [
    {
      words: ["price", "cost", "quote", "how much", "budget", "charge", "expensive", "cheap", "rate", "package", "packages", "pricing"],
      html: "<strong>Honest answer:</strong> we keep it simple — <strong>websites from $600, online stores from $1,200, mobile apps from $3,500, AI automation from $900</strong>. Those are starting points; your <strong>fixed quote</strong> comes after free scoping, with 50% to start and 50% on delivery. No hourly meter, no mid-project changes.",
      chips: ["quote", "work"]
    },
    {
      words: ["store", "shopify", "ecommerce", "e-commerce", "shop", "sell online", "selling", "woocommerce", "product", "checkout", "cart", "inventory"],
      html: "Online-store pain is usually one of three: a slow theme that kills trust, checkout friction, or no traffic. We build <strong>Shopify and WooCommerce stores</strong> that load fast and check out clean, plus the SEO and product-page basics that bring buyers in.",
      chips: ["quote", "work"]
    },
    {
      words: ["ai", "automat", "chatbot", "bot", "manual", "repetitive", "excel", "spreadsheet", "data entry", "follow up", "inbox", "whatsapp", "agent"],
      html: "This is our favourite kind of pain. <strong>AI agents and automation</strong> eat repetitive work for breakfast: answering common questions, following up leads, drafting invoices, syncing sheets. Small setup, compounding hours back every single week.",
      chips: ["quote", "blog"]
    },
    {
      words: ["app", "mobile", "android", "ios", "iphone", "play store", "app store"],
      html: "Mobile apps pay off when customers come back <strong>repeatedly</strong> — bookings, orders, loyalty. We build <strong>React Native apps</strong> (one codebase, both stores). If it is a one-time idea, a web app is cheaper — I will tell you straight which one fits.",
      chips: ["quote", "work"]
    },
    {
      words: ["website", "site", "landing", "redesign", "web", "online presence", "traffic", "visitor", "seo", "rank", "google", "slow"],
      html: "Most business websites fail for 5 fixable reasons: slow load, no clear offer above the fold, weak calls-to-action, zero trust signals, and no lead capture. We rebuild sites around <strong>one job: turning visitors into inquiries</strong>.",
      chips: ["quote", "blog"]
    },
    {
      words: ["who are you", "your team", "about you", "company", "zentix", "where are you", "location", "country", "based", "office", "address", "remote", "team size"],
      html: "We are <strong>Zentix, a remote software company with clients worldwide</strong>. No office, no borders: we exist wherever you need us and deliver everything digitally. Small senior team, zero bloat, plus one tireless AI teammate on research and delivery support.",
      chips: ["work", "quote"]
    },
    {
      words: ["how long", "timeline", "deadline", "duration", "fast", "when will", "delivery time"],
      html: "Typical ranges: websites <strong>2–4 weeks</strong>, online stores <strong>3–5 weeks</strong>, apps <strong>6–10 weeks</strong>. Your exact date goes in the written quote before we start.",
      chips: ["quote"]
    },
    {
      words: ["portfolio", "work", "example", "previous", "client", "review", "testimonial", "proof"],
      html: "<strong>18 real projects</strong> on the portfolio page: clients in the US, UK, Singapore and Frankfurt, plus our own products. Every screenshot is the real thing. Nothing rented, nothing faked.",
      chips: ["work", "quote"]
    },
    {
      words: ["blog", "article", "learn", "guide", "read"],
      html: "Our blog is practical, no fluff: what AI chatbots really cost, Shopify vs custom builds, why websites do not bring customers. Worth a skim before you buy anything from anyone.",
      chips: ["blog", "quote"]
    },
    {
      words: ["human", "person", "real person", "call", "phone", "talk", "contact", "email", "founder", "speak"],
      html: "Fastest way to a human: the <strong>inquiry form</strong>. It goes straight to both founders and they reply personally, usually within a day. Tap below and I will get your details ready.",
      chips: ["quote"]
    },
    {
      words: ["service", "offer", "what do you do", "build", "develop", "what can you"],
      html: "We build <strong>websites, web apps, mobile apps, online stores, and AI agents/automation</strong>. One team, fixed quotes, delivered digitally — wherever you are.",
      chips: ["quote", "work"]
    }
  ];

  var CHIP = {
    quote: { label: "Get a fixed quote", run: openLeadForm },
    work: { label: "See our work", run: function () { go("portfolio.html"); } },
    blog: { label: "Read the blog", run: function () { go("blog.html"); } }
  };

  function findAnswer(text) {
    var t = " " + String(text).toLowerCase() + " ";
    var best = null, bestScore = 0;
    KB.forEach(function (k) {
      var s = 0;
      k.words.forEach(function (w) {
        if (t.indexOf(w) !== -1) s += w.length > 4 ? 2 : 1;
      });
      if (s > bestScore) { bestScore = s; best = k; }
    });
    return best;
  }

  function chipsFor(names) {
    return names.map(function (n) { return CHIP[n]; }).filter(Boolean);
  }

  function userSay(text) {
    text = String(text || "").trim();
    if (!text) return;
    if (msgCount >= MAX_MSG) {
      botSay("We have covered a lot! Tap <strong>Get a fixed quote</strong> and our team will take it from there personally.", [CHIP.quote]);
      return;
    }
    msgCount++;
    addMsg(esc(text), "user");
    input.value = "";
    var hit = findAnswer(text);
    if (hit) {
      botSay(hit.html, chipsFor(hit.chips.concat(["quote"]).filter(function (v, i, a) { return a.indexOf(v) === i; })));
    } else {
      botSay("Good question — that one deserves a human answer. Drop it in the inquiry form and a founder will reply personally, usually within a day.", [CHIP.quote]);
    }
  }

  /* i18n lookup for dynamically-built UI (lead form). Falls back to English. */
  var EN_LEAD = {
    z_lead_title: "Quick quote request", z_lead_name: "Your name", z_lead_email: "Email",
    z_lead_msg_ph: "What is the pain? One or two lines is enough.", z_lead_send: "Send \u2014 get my fixed quote",
    z_lead_err_name: "Please add your name.", z_lead_err_email: "That email does not look right.",
    z_lead_err_type: "Pick what you need above.", z_lead_err_msg: "One line about the pain helps us quote accurately.",
    z_lead_done: "Done \u2014 your details are filled in the <strong>form below</strong>. Hit <strong>Send</strong> and a founder replies personally, usually within a day.",
    z_lead_goto: "Taking you to our <strong>contact form</strong> with your details ready\u2026"
  };
  function t(key) {
    try {
      var d = window.ZENTIX_I18N;
      if (d && d[key] !== undefined) return d[key];
    } catch (e) {}
    return EN_LEAD[key] || key;
  }

  /* ---------------- in-chat lead form ---------------- */
  /* value = English (matches contact-form options + founder-readable); label = translated */
  var LEAD_TYPES = [
    { value: "Website", key: "z_lt_website" },
    { value: "Online store", key: "z_lt_store" },
    { value: "Mobile app", key: "z_lt_app" },
    { value: "AI automation", key: "z_lt_ai" },
    { value: "Something else", key: "z_lt_other" }
  ];
  var leadType = "";

  function openLeadForm() {
    setQuick([]);
    var wrap = document.createElement("div");
    wrap.className = "zc-msg bot";
    wrap.innerHTML =
      '<div class="zc-lead">' +
      "<strong>" + esc(t("z_lead_title")) + "</strong>" +
      '<input id="zcLName" type="text" placeholder="' + esc(t("z_lead_name")) + '" maxlength="80" autocomplete="name">' +
      '<input id="zcLEmail" type="email" placeholder="' + esc(t("z_lead_email")) + '" maxlength="120" autocomplete="email">' +
      '<div class="zc-lead-pills">' +
      LEAD_TYPES.map(function (x) { return '<button type="button" data-t="' + esc(x.value) + '">' + esc(t(x.key)) + "</button>"; }).join("") +
      "</div>" +
      '<textarea id="zcLMsg" placeholder="' + esc(t("z_lead_msg_ph")) + '" maxlength="600"></textarea>' +
      '<div class="zc-lead-err" id="zcLErr"></div>' +
      '<button class="zc-lead-send" id="zcLSend" type="button">' + esc(t("z_lead_send")) + "</button>" +
      "</div>";
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
    leadType = "";
    wrap.querySelectorAll(".zc-lead-pills button").forEach(function (b) {
      b.addEventListener("click", function () {
        wrap.querySelectorAll(".zc-lead-pills button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        leadType = b.getAttribute("data-t");
      });
    });
    wrap.querySelector("#zcLSend").addEventListener("click", function () { submitLead(wrap); });
  }

  function submitLead(wrap) {
    var name = wrap.querySelector("#zcLName").value.trim();
    var email = wrap.querySelector("#zcLEmail").value.trim();
    var msg = wrap.querySelector("#zcLMsg").value.trim();
    var err = wrap.querySelector("#zcLErr");
    if (!name) { err.textContent = t("z_lead_err_name"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = t("z_lead_err_email"); return; }
    if (!leadType) { err.textContent = t("z_lead_err_type"); return; }
    if (!msg) { err.textContent = t("z_lead_err_msg"); return; }
    err.textContent = "";

    var payload = { name: name, email: email, type: leadType, msg: msg };

    if (hasContact) {
      var fN = document.getElementById("fName"), fE = document.getElementById("fEmail"),
          fT = document.getElementById("fType"), fM = document.getElementById("fMsg");
      if (fN) fN.value = name;
      if (fE) fE.value = email;
      if (fT) {
        var want = leadType.toLowerCase();
        for (var i = 0; i < fT.options.length; i++) {
          if (fT.options[i].text.toLowerCase().indexOf(want.split(" ")[0]) !== -1) { fT.selectedIndex = i; break; }
        }
      }
      if (fM) fM.value = "[Via website AI consultant]\nProject type: " + leadType + "\n\n" + msg;
      botSay(t("z_lead_done"), [], 900);
      setTimeout(function () {
        closePanel();
        var c = document.getElementById("contact");
        if (c) c.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        if (fN) setTimeout(function () { fN.focus({ preventScroll: true }); }, 700);
      }, 1400);
    } else {
      try { sessionStorage.setItem("zentix-lead", JSON.stringify(payload)); } catch (e) {}
      botSay(t("z_lead_goto"), [], 600);
      setTimeout(function () { location.href = "index.html#contact"; }, 1100);
    }
  }

  /* cross-page lead pickup (index.html) */
  function pickupLead() {
    var raw = null;
    try { raw = sessionStorage.getItem("zentix-lead"); sessionStorage.removeItem("zentix-lead"); } catch (e) {}
    if (!raw || !hasContact) return;
    try {
      var p = JSON.parse(raw);
      var fN = document.getElementById("fName"), fE = document.getElementById("fEmail"),
          fT = document.getElementById("fType"), fM = document.getElementById("fMsg");
      if (fN && p.name) fN.value = p.name;
      if (fE && p.email) fE.value = p.email;
      if (fT && p.type) {
        var want = String(p.type).toLowerCase();
        for (var i = 0; i < fT.options.length; i++) {
          if (fT.options[i].text.toLowerCase().indexOf(want.split(" ")[0]) !== -1) { fT.selectedIndex = i; break; }
        }
      }
      if (fM && p.msg) fM.value = "[Via website AI consultant]\nProject type: " + p.type + "\n\n" + p.msg;
      setTimeout(function () {
        var c = document.getElementById("contact");
        if (c) c.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }, 600);
    } catch (e) {}
  }

  /* ---------------- open / close ---------------- */
  function greet() {
    inputRow.hidden = false;
    botSay(
      "Hi! I am Zentix's AI consultant — the pain-first kind. Tell me what is hurting: a <strong>website that does not sell</strong>, <strong>manual work</strong> eating your week, an <strong>idea</strong> you want built. What is going on?",
      [
        { label: "My website doesn't sell", run: function () { userSay("My website doesn't bring customers"); } },
        { label: "I need an online store", run: function () { userSay("I need an online store"); } },
        { label: "Automate my busywork", run: function () { userSay("Can AI automate my manual work?"); } },
        { label: "I have an app idea", run: function () { userSay("I want to build a mobile app"); } }
      ],
      500
    );
  }

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (ping) ping.classList.remove("show");
    try { sessionStorage.setItem("zc-seen", "1"); } catch (e) {}
    if (!started) { started = true; greet(); }
  }
  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", function () { panel.hidden ? openPanel() : closePanel(); });
  closeBtn.addEventListener("click", closePanel);
  if (ctaBtn) ctaBtn.addEventListener("click", function () { if (panel.hidden) openPanel(); setTimeout(openLeadForm, started ? 0 : 900); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) closePanel(); });
  sendBtn.addEventListener("click", function () { userSay(input.value); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") userSay(input.value); });

  /* ---------------- proactive nudge (once per session) ---------------- */
  function nudge() {
    var seen = null;
    try { seen = sessionStorage.getItem("zc-seen"); } catch (e) {}
    if (seen || started) return;
    if (ping) ping.classList.add("show");
    setTimeout(function () {
      try { if (sessionStorage.getItem("zc-seen")) return; } catch (e) {}
      if (!started && panel.hidden) openPanel();
    }, 8000);
  }
  if (!reduced) setTimeout(nudge, 8000);

  pickupLead();
})();
