(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const dialog = $("#accessDialog");
  const toast = $("#toast");
  const preferenceKeys = {
    font: "essencia-font",
    contrast: "essencia-contrast",
    focus: "essencia-focus"
  };

  const speechText = {
    intro: "Essência Pizzaria. Uma pizzaria onde todos podem participar da escolha. O Essência nasceu para unir famílias à mesa com mais previsibilidade, autonomia e acolhimento. Todo mundo cabe nessa pizza. Feito com cuidado, servido com propósito.",
    origem: "A Essência nasceu de uma ausência. Percebemos que sair para comer ainda pode ser uma experiência difícil para pessoas com deficiência, autismo, TDAH, seletividade alimentar, disfagia e outras necessidades sensoriais. A nossa ideia nasceu da vontade de mudar essa experiência desde o primeiro contato com o cardápio.",
    jornada: "A ideia cresceu quando começamos a escutar. Primeiro, fizemos pesquisa e escuta. Depois construímos a proposta e criamos o primeiro protótipo do cardápio. O feedback mostrou o que precisava ser explicado melhor. Agora reunimos a história, o propósito e a demonstração completa da experiência.",
    cta: "Acesse nossa demonstração de cardápio aqui. Conheça os sete sabores, altere ingredientes e complementos, escolha o ponto da pizza, escreva observações e teste os recursos de acessibilidade."
  };

  let toastTimer;

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
  }

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // A preferência continua válida durante a visita mesmo sem armazenamento.
    }
  }

  function applyPreference(button, className, key, enabled) {
    document.body.classList.toggle(className, enabled);
    button.setAttribute("aria-pressed", String(enabled));
    storageSet(key, enabled);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      showToast("Seu navegador não oferece leitura em áudio.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").trim());
    utterance.lang = "pt-BR";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => showToast("Leitura em áudio iniciada.");
    utterance.onend = () => showToast("Leitura concluída.");
    utterance.onerror = () => showToast("Não foi possível concluir a leitura.");
    window.speechSynthesis.speak(utterance);
  }

  function readMainContent() {
    const main = $("main");
    const clone = main.cloneNode(true);
    $$("button, nav, [aria-hidden='true']", clone).forEach((element) => element.remove());
    speak(clone.textContent);
  }

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
    $("#readingProgress").style.width = `${percentage}%`;
  }

  $("#openAccessibility").addEventListener("click", () => dialog.showModal());
  $("#closeAccessibility").addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) dialog.close();
  });

  $$(".speech-trigger").forEach((button) => {
    button.addEventListener("click", () => speak(speechText[button.dataset.speech] || ""));
  });

  $("#readPage").addEventListener("click", () => {
    dialog.close();
    readMainContent();
  });

  $("#stopAudio").addEventListener("click", () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    showToast("Leitura interrompida.");
  });

  const fontButton = $("#toggleFont");
  const contrastButton = $("#toggleContrast");
  const focusButton = $("#toggleFocus");

  applyPreference(fontButton, "large-text", preferenceKeys.font, storageGet(preferenceKeys.font));
  applyPreference(contrastButton, "high-contrast", preferenceKeys.contrast, storageGet(preferenceKeys.contrast));
  applyPreference(focusButton, "focus-mode", preferenceKeys.focus, storageGet(preferenceKeys.focus));

  fontButton.addEventListener("click", () => {
    const enabled = !document.body.classList.contains("large-text");
    applyPreference(fontButton, "large-text", preferenceKeys.font, enabled);
    showToast(enabled ? "Texto maior ativado." : "Tamanho padrão restaurado.");
  });

  contrastButton.addEventListener("click", () => {
    const enabled = !document.body.classList.contains("high-contrast");
    applyPreference(contrastButton, "high-contrast", preferenceKeys.contrast, enabled);
    showToast(enabled ? "Alto contraste ativado." : "Contraste padrão restaurado.");
  });

  focusButton.addEventListener("click", () => {
    const enabled = !document.body.classList.contains("focus-mode");
    applyPreference(focusButton, "focus-mode", preferenceKeys.focus, enabled);
    showToast(enabled ? "Modo foco ativado." : "Modo foco desativado.");
  });

  $("#openLibras").addEventListener("click", () => {
    dialog.close();
    const librasButton = $("[vw-access-button]");
    if (librasButton) {
      librasButton.click();
      showToast("Tradutor de Libras aberto no canto da tela.");
    } else {
      showToast("O tradutor de Libras ainda está carregando.");
    }
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  window.addEventListener("load", () => {
    try {
      if (window.VLibras && window.VLibras.Widget) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    } catch {
      showToast("O tradutor de Libras não pôde ser carregado.");
    }
  });
})();
