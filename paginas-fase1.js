(() => {
  "use strict";

  // ---------- Preferências de leitura (as mesmas do início e do cardápio) ----------
  const PREFS = [
    { chave: "essencia-font", classe: "large-text", icone: "A+", nome: "Texto maior", ajuda: "Aumentar o tamanho das letras" },
    { chave: "essencia-contrast", classe: "high-contrast", icone: "◐", nome: "Alto contraste", ajuda: "Aumentar a diferença entre as cores" },
    { chave: "essencia-focus", classe: "focus-mode", icone: "◎", nome: "Modo foco", ajuda: "Reduzir movimentos e elementos decorativos" }
  ];
  const ler = (chave) => { try { return window.localStorage.getItem(chave) === "true"; } catch { return false; } };
  const guardar = (chave, valor) => { try { window.localStorage.setItem(chave, String(valor)); } catch { /* vale só nesta visita */ } };
  PREFS.forEach((p) => document.body.classList.toggle(p.classe, ler(p.chave)));

  const acoes = document.querySelector(".site-header .header-actions");
  if (acoes && !document.getElementById("accessDialog")) {
    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "access-button";
    abrir.setAttribute("aria-haspopup", "dialog");
    abrir.innerHTML = '<span aria-hidden="true">◉</span> Acessibilidade';
    acoes.prepend(abrir);

    const dialogo = document.createElement("dialog");
    dialogo.className = "access-dialog";
    dialogo.id = "accessDialog";
    dialogo.setAttribute("aria-labelledby", "accessTitle");
    dialogo.innerHTML = `
      <div class="dialog-header">
        <div><p class="eyebrow">Preferências de leitura</p><h2 id="accessTitle">Como você quer acompanhar?</h2></div>
        <button class="icon-button" type="button" data-fechar aria-label="Fechar opções de acessibilidade">×</button>
      </div>
      <p class="dialog-intro">As preferências valem em todas as páginas do site e no cardápio.</p>
      <div class="access-options">
        <button type="button" data-ouvir><span class="option-icon" aria-hidden="true">▶</span><span><strong>Ouvir a página</strong><small>Ler em voz alta o conteúdo principal</small></span></button>
        ${PREFS.map((p, i) => `<button type="button" data-pref="${i}" aria-pressed="false"><span class="option-icon" aria-hidden="true">${p.icone}</span><span><strong>${p.nome}</strong><small>${p.ajuda}</small></span></button>`).join("")}
      </div>
      <button class="button stop-audio" type="button" data-parar>Parar áudio</button>`;
    document.body.appendChild(dialogo);

    const sincronizar = () => dialogo.querySelectorAll("[data-pref]").forEach((b) => {
      b.setAttribute("aria-pressed", String(document.body.classList.contains(PREFS[Number(b.dataset.pref)].classe)));
    });
    abrir.addEventListener("click", () => { sincronizar(); dialogo.showModal(); });
    dialogo.addEventListener("click", (event) => {
      if (event.target === dialogo || event.target.closest("[data-fechar]")) { dialogo.close(); return; }
      const botao = event.target.closest("[data-pref]");
      if (botao) {
        const p = PREFS[Number(botao.dataset.pref)];
        const ligado = !document.body.classList.contains(p.classe);
        document.body.classList.toggle(p.classe, ligado);
        guardar(p.chave, ligado);
        sincronizar();
        return;
      }
      if (event.target.closest("[data-ouvir]") && "speechSynthesis" in window) {
        const main = document.querySelector("main").cloneNode(true);
        main.querySelectorAll("button, nav, [aria-hidden='true'], script").forEach((el) => el.remove());
        const fala = new SpeechSynthesisUtterance(main.textContent.replace(/\s+/g, " ").trim().slice(0, 4500));
        fala.lang = "pt-BR";
        fala.rate = 0.92;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(fala);
        dialogo.close();
        return;
      }
      if (event.target.closest("[data-parar]") && "speechSynthesis" in window) window.speechSynthesis.cancel();
    });
  }

  // Caixa 3D (embalagem-3d.html)
  const scene = document.getElementById("boxScene");
  if (scene) {
    let angle = -30;
    const setAngle = (value) => {
      angle = value;
      scene.style.setProperty("--rz", `${angle}deg`);
    };

    document.querySelectorAll("[data-rotate]").forEach((button) => {
      button.addEventListener("click", () => setAngle(angle + Number(button.dataset.rotate)));
    });

    const lidButton = document.getElementById("toggleLid");
    lidButton.addEventListener("click", () => {
      const open = scene.classList.toggle("open");
      lidButton.setAttribute("aria-pressed", String(open));
      lidButton.textContent = open ? "Fechar a tampa" : "Abrir a tampa";
    });

    let startX = 0;
    let startAngle = 0;
    scene.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      startAngle = angle;
      scene.classList.add("dragging");
      scene.setPointerCapture(event.pointerId);
    });
    scene.addEventListener("pointermove", (event) => {
      if (!scene.classList.contains("dragging")) return;
      setAngle(startAngle + (event.clientX - startX) * 0.6);
    });
    const stopDrag = () => scene.classList.remove("dragging");
    scene.addEventListener("pointerup", stopDrag);
    scene.addEventListener("pointercancel", stopDrag);
  }

})();
