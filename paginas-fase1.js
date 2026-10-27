(() => {
  "use strict";

  try {
    if (window.localStorage.getItem("essencia-contrast") === "true") document.body.classList.add("high-contrast");
    if (window.localStorage.getItem("essencia-font") === "true") document.body.classList.add("large-text");
    if (window.localStorage.getItem("essencia-focus") === "true") document.body.classList.add("focus-mode");
  } catch {
    // Sem armazenamento, a página usa as preferências padrão.
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

  // Maquete do espaço (espaco-3d.html)
  const planScene = document.getElementById("planScene");
  if (planScene) {
    const descriptions = {
      1: "Maquete da cozinha da Fase 1, com as áreas numeradas de 1 a 8 em sentido único, do recebimento até a saída das entregas.",
      2: "Maquete da Fase 2: a cozinha continua igual e ganha, ao lado, um salão com mesa livre para cadeira de rodas, mais três mesas, banheiro acessível, cantinho de descompressão sensorial e rampa com piso tátil. A área 8 vira balcão de retirada."
    };

    document.querySelectorAll(".seg-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const phase = button.dataset.phase;
        planScene.dataset.phase = phase;
        planScene.setAttribute("aria-label", descriptions[phase]);
        document.querySelectorAll(".seg-btn").forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      });
    });

    const viewButton = document.getElementById("toggleView");
    viewButton.addEventListener("click", () => {
      const flat = planScene.classList.toggle("flat");
      viewButton.setAttribute("aria-pressed", String(!flat));
      viewButton.textContent = flat ? "Ver em 3D" : "Ver como planta";
    });
  }
})();
