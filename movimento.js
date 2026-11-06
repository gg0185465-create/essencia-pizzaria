/* Movimento do site: entradas suaves ao rolar, números que contam,
   barras que crescem, gráfico que se desenha e menu que acompanha a leitura.
   Desliga sozinho no "Modo foco" e para quem pede menos movimento no sistema. */
(() => {
  "use strict";

  const calmo = () =>
    document.body.classList.contains("focus-mode") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("mv");

  // ---------- 1. Entradas ao rolar, em cascata ----------
  const ALVOS = [
    ".section-heading", ".block-head", ".sub-hero .container > *",
    ".card", ".feature-card", ".timeline li", ".phase", ".checklist li",
    ".problem-card", ".story-copy", ".identity-visual", ".learning-note",
    ".price-breakdown", ".sales-chart", ".key-numbers > div", ".viability-grid article",
    ".experience-flow", ".flow li", ".legend-grid > div", ".cta-inner > *"
  ].join(",");

  const itens = [...document.querySelectorAll(ALVOS)].filter((el) => !el.closest(".site-header, .access-dialog"));
  itens.forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((c) => c.matches(ALVOS));
    el.style.setProperty("--d", `${Math.min(irmaos.indexOf(el), 6) * 70}ms`);
    el.classList.add("rv");
  });

  const revelar = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revelar.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  // O que já aparece na tela ao abrir entra logo, sem esperar o observador.
  itens.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("is-in");
    else revelar.observe(el);
  });

  // ---------- 2. Barras dos gráficos ----------
  const barras = document.querySelectorAll(".hbars, .stackbar, .gantt");
  const crescer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      crescer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  barras.forEach((el) => crescer.observe(el));

  // ---------- 3. Números que contam ----------
  const NUM = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/;
  const contar = (el) => {
    const texto = el.textContent;
    const m = texto.match(NUM);
    if (!m) return;
    const bruto = m[0];
    const casas = bruto.includes(",") ? bruto.split(",")[1].length : 0;
    const alvo = Number(bruto.replace(/\./g, "").replace(",", "."));
    if (!alvo || calmo()) return;
    const antes = texto.slice(0, m.index), depois = texto.slice(m.index + bruto.length);
    const fmt = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
    const dur = 1100, t0 = performance.now();
    el.setAttribute("aria-label", texto.trim());
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = antes + fmt(alvo * e) + depois;
      if (p < 1) requestAnimationFrame(passo);
      else { el.textContent = texto; el.removeAttribute("aria-label"); }
    };
    requestAnimationFrame(passo);
  };
  const numeros = document.querySelectorAll(".stat strong, .score strong, .key-numbers dd");
  const contador = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      contar(entry.target);
      contador.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  numeros.forEach((el) => contador.observe(el));

  // ---------- 4. Fluxo de produção: os passos acendem em sequência ----------
  const fluxo = document.querySelector(".flow");
  if (fluxo) {
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      [...fluxo.children].forEach((li, i) => {
        setTimeout(() => li.classList.add("lit"), calmo() ? 0 : 400 + i * 260);
      });
    }, { threshold: 0.4 }).observe(fluxo);
  }

  // ---------- 5. Gráfico de linha se desenha ----------
  const linha = document.getElementById("cashChart");
  if (linha) {
    const desenhar = () => {
      const svg = linha.querySelector("svg");
      if (!svg) return;
      const traco = svg.querySelectorAll(".l1, .l2");
      const pontos = svg.querySelectorAll(".pay");
      if (calmo() || !svg.animate) return;
      traco.forEach((p) => p.animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: 1600, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "both" }
      ));
      pontos.forEach((c, i) => c.animate(
        [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }],
        { duration: 320, delay: 1100 + i * 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" }
      ));
    };
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      desenhar();
    }, { threshold: 0.35 }).observe(linha);
  }

  // ---------- 6. Menu dos apontamentos acompanha a leitura ----------
  const spy = document.querySelector(".plano-spy");
  if (spy) {
    const links = [...spy.querySelectorAll("a")];
    const secoes = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const barra = spy.querySelector(".spy-progress i");
    const lista = spy.querySelector("ol");
    let ultimo = -1;
    const marcar = () => {
      const meio = window.innerHeight * 0.35;
      let atual = 0;
      secoes.forEach((s, i) => { if (s.getBoundingClientRect().top < meio) atual = i; });
      if (atual !== ultimo) {
        ultimo = atual;
        links.forEach((a, i) => {
          if (i === atual) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
        const ativo = links[atual];
        // Quem rola é a lista (<ol>), não a barra inteira.
        if (ativo && lista && lista.scrollWidth > lista.clientWidth) {
          lista.scrollTo({ left: ativo.offsetLeft - 16, behavior: calmo() ? "auto" : "smooth" });
        }
      }
      const ini = secoes[0].getBoundingClientRect().top + window.scrollY - meio;
      const fim = secoes[secoes.length - 1].getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      const p = Math.max(0, Math.min(1, (window.scrollY - ini) / Math.max(1, fim - ini)));
      if (barra) barra.style.transform = `scaleX(${p})`;
      spy.classList.toggle("show", window.scrollY > ini - 40);
    };
    let pendente = false;
    window.addEventListener("scroll", () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => { pendente = false; marcar(); });
    }, { passive: true });
    window.addEventListener("resize", marcar);
    marcar();
  }
})();
