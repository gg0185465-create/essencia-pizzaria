(() => {
  "use strict";

  const brl = (n, dec = 2) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const ALERGENOS = { leite: "leite", gluten: "glúten", ovo: "ovo", peixe: "peixe", crustaceo: "crustáceo", soja: "soja" };

  // ---------- Preços e ficha técnica (lidos do cardápio) ----------
  const menu = window.MENU_ESSENCIA;
  const select = document.getElementById("fichaSelect");
  const out = document.getElementById("fichaOut");
  if (menu && Array.isArray(menu.pizzas) && menu.pizzas.length) {
    const pizzas = menu.pizzas.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const precos = pizzas.map((p) => p.preco);
    const media = precos.reduce((a, b) => a + b, 0) / precos.length;
    document.getElementById("precoFaixa").textContent = `${brl(Math.min(...precos))} a ${brl(Math.max(...precos))}`;
    document.getElementById("precoInfo").textContent = `${pizzas.length} sabores · preço médio ${brl(media)}`;

    pizzas.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nome} — ${brl(p.preco)}`;
      select.appendChild(opt);
    });

    const render = () => {
      const p = pizzas.find((x) => x.id === select.value) || pizzas[0];
      const linhas = (p.ingredientes || []).map(([nome, qtd]) => `<tr><th scope="row">${nome}</th><td>${qtd}</td></tr>`).join("");
      const alerg = (p.alergenos || []).map((a) => ALERGENOS[a] || a).join(", ") || "nenhum informado";
      out.innerHTML = `
        <div class="ficha-head"><strong>${p.nome}</strong><span>${brl(p.preco)}</span></div>
        <div class="table-wrap"><table class="compact"><thead><tr><th scope="col">Ingrediente</th><th scope="col">Quantidade</th></tr></thead><tbody>${linhas}</tbody></table></div>
        <p class="alerg"><strong>Contém:</strong> ${alerg}. Pode haver contato cruzado na cozinha.</p>`;
    };
    select.addEventListener("change", render);
    render();
  } else if (select) {
    select.disabled = true;
    out.textContent = "Não foi possível carregar o cardápio.";
  }

  // ---------- Fluxo de caixa: base x conservador ----------
  // Premissas do plano de negócios da Fase 1.
  const PRECO = 73.64, VARIAVEL = 19.51 + 8.47, INVEST = 23000;
  const fixos = (m) => (m <= 3 ? 4170 : 7170); // pró-labore reduzido nos 3 primeiros meses
  const vendasBase = (m) => (m <= 3 ? 120 : m <= 6 ? 200 : 280);
  const MESES = 24;

  const serie = (fator) => {
    let saldo = -INVEST;
    const pts = [{ m: 0, saldo, pizzas: 0, resultado: 0 }];
    for (let m = 1; m <= MESES; m++) {
      const pizzas = Math.round(vendasBase(m) * fator);
      const resultado = pizzas * (PRECO - VARIAVEL) - fixos(m);
      saldo += resultado;
      pts.push({ m, saldo, pizzas, resultado });
    }
    return pts;
  };
  const base = serie(1);
  const cons = serie(0.7);
  const retorno = (s) => (s.find((p) => p.m > 0 && p.saldo >= 0) || {}).m;

  const rb = retorno(base), rc = retorno(cons);
  if (rb) document.getElementById("payBase").textContent = `retorno no mês ${rb}`;
  if (rc) document.getElementById("payCons").textContent = `retorno no mês ${rc}`;
  const deficit = cons.slice(1, 7).reduce((a, p) => a + Math.min(0, p.resultado), 0);
  const note = document.getElementById("deficitNote");
  if (note) note.innerHTML = `<strong>O caixa não acaba:</strong> no cenário conservador, os seis primeiros meses somam um prejuízo de cerca de ${brl(Math.abs(Math.round(deficit)), 0)}, menor que o colchão de R$ 5.400.`;

  const host = document.getElementById("cashChart");
  if (!host) return;
  const W = 720, H = 300, L = 64, R = 16, T = 16, B = 34;
  const all = base.concat(cons).map((p) => p.saldo);
  const STEP = 20000;
  const yMin = Math.floor(Math.min(...all) / STEP) * STEP;
  const yMax = Math.ceil(Math.max(...all) / STEP) * STEP;
  const x = (m) => L + (m / MESES) * (W - L - R);
  const y = (v) => T + ((yMax - v) / (yMax - yMin)) * (H - T - B);
  const path = (s) => s.map((p, i) => `${i ? "L" : "M"}${x(p.m).toFixed(1)},${y(p.saldo).toFixed(1)}`).join("");

  let grid = "";
  for (let v = yMin; v <= yMax; v += STEP) {
    grid += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"></line><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${(v / 1000).toLocaleString("pt-BR")} mil</text>`;
  }
  let xt = "";
  for (let m = 0; m <= MESES; m += 3) xt += `<text x="${x(m)}" y="${H - 10}" text-anchor="middle">${m}</text>`;

  const payDot = (m, s, cls) => {
    if (!m) return "";
    const p = s[m];
    return `<circle class="pay" cx="${x(m)}" cy="${y(p.saldo)}" r="6" fill="var(${cls})"></circle>`;
  };

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Saldo acumulado em 24 meses. Começa em menos 23 mil reais. No cenário base, fica positivo no mês ${rb}. No conservador, fica positivo no mês ${rc}.">
      <g class="grid">${grid}</g>
      <line class="zero" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"></line>
      <g>${xt}</g>
      <path class="l1" d="${path(base)}"></path>
      <path class="l2" d="${path(cons)}"></path>
      ${payDot(rb, base, "--c3")}${payDot(rc, cons, "--c4")}
      <line class="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"></line>
      <rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"></rect>
    </svg>
    <div class="chart-tip" hidden></div>`;

  const svg = host.querySelector("svg");
  const tip = host.querySelector(".chart-tip");
  const cross = host.querySelector(".cross");
  const show = (clientX) => {
    const box = svg.getBoundingClientRect();
    const sx = ((clientX - box.left) / box.width) * W;
    const m = Math.max(0, Math.min(MESES, Math.round(((sx - L) / (W - L - R)) * MESES)));
    cross.setAttribute("x1", x(m));
    cross.setAttribute("x2", x(m));
    cross.setAttribute("visibility", "visible");
    const b = base[m], c = cons[m];
    tip.innerHTML = m === 0
      ? `<strong>Abertura</strong><br>Investimento: ${brl(-INVEST, 0)}`
      : `<strong>Mês ${m}</strong><br>Base: ${b.pizzas} pizzas · saldo ${brl(Math.round(b.saldo), 0)}<br>Conservador: ${c.pizzas} pizzas · saldo ${brl(Math.round(c.saldo), 0)}`;
    tip.style.left = `${(x(m) / W) * 100}%`;
    tip.style.top = `${((T + 8) / H) * 100}%`;
    tip.classList.toggle("flip", m > MESES * 0.6);
    tip.hidden = false;
  };
  const hide = () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); };
  const hit = host.querySelector(".hit");
  hit.addEventListener("pointermove", (e) => show(e.clientX));
  hit.addEventListener("pointerdown", (e) => show(e.clientX));
  hit.addEventListener("pointerleave", hide);
})();
