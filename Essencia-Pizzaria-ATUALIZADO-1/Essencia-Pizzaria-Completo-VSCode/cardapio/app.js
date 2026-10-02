/* ===========================================================================
   ESSENCIA PIZZARIA — CARDAPIO INTERATIVO
   Os dados do cardapio ficam em  menu-dados.js  (editavel pelo admin.html).
   =========================================================================== */

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ALERGENOS = {
  leite: 'Leite',
  gluten: 'Glúten',
  ovo: 'Ovo',
  peixe: 'Peixe',
  crustaceo: 'Crustáceo',
  soja: 'Soja',
  amendoim: 'Amendoim',
  castanhas: 'Castanhas'
};

/* --------------------------------------------------------------------------
   Carregamento do cardapio
   1. Se o painel (admin.html) salvou uma versao neste aparelho, usa ela.
   2. Senao, usa o menu-dados.js publicado no GitHub.
   -------------------------------------------------------------------------- */
function loadMenu() {
  const padrao = window.MENU_ESSENCIA;
  try {
    const local = JSON.parse(localStorage.getItem('essencia-menu') || 'null');
    if (local && Array.isArray(local.pizzas) && local.pizzas.length) return local;
  } catch (error) {
    console.warn('Cardápio salvo no aparelho está inválido. Usando o publicado.', error);
  }
  return padrao;
}

let menu = loadMenu();

const state = {
  cart: readSavedCart(),
  currentPizza: null,
  editingIndex: null,
  builderEditingIndex: null,
  orderText: ''
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Escapa texto vindo dos dados para nao quebrar o HTML. */
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('essencia-cart') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('essencia-cart', JSON.stringify(state.cart));
  } catch (error) {
    console.warn('Não foi possível salvar o pedido neste aparelho.', error);
  }
  renderCartCount();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/** Item marcado como "acabou" no painel. */
function acabou(item) {
  return !!(item && item.esgotado === true);
}

function alergenoChips(lista = []) {
  if (!lista.length) return '';
  return `<p class="allergen-chips" aria-label="Contém: ${esc(lista.map(key => ALERGENOS[key] || key).join(', '))}">
    <span class="allergen-label" aria-hidden="true">Contém</span>
    ${lista.map(key => `<span class="allergen-chip" aria-hidden="true">${esc(ALERGENOS[key] || key)}</span>`).join('')}
  </p>`;
}

/* ==========================================================================
   CARDAPIO
   ========================================================================== */

function renderMenu() {
  const criar = `
    <article class="pizza-card build-card" id="build-card">
      <div class="build-card-icon" aria-hidden="true">+</div>
      <span class="pizza-tag build-tag">Do seu jeito</span>
      <h3>Crie sua pizza</h3>
      <p>Comece com a massa e o molho da casa e escolha cada ingrediente: queijos, carnes, legumes e finalizações. Você vê o preço subir a cada escolha.</p>
      <p class="build-price">A partir de <strong>${currency.format(menu.montagem.precoBase)}</strong></p>
      <div class="card-actions">
        <button class="button primary" type="button" id="open-builder">Montar minha pizza</button>
        <button class="button listen-card" type="button" data-listen-builder aria-label="Ouvir como funciona o Crie sua pizza">▶</button>
      </div>
    </article>`;

  const cards = menu.pizzas.map((pizza, index) => {
    const fora = acabou(pizza);
    return `
    <article class="pizza-card${fora ? ' sold-out' : ''}" style="--card-accent:${esc(pizza.cor || '#1d7247')}" data-number="${String(index + 1).padStart(2, '0')}">
      <div class="pizza-meta">
        <span class="pizza-tag">${fora ? 'Acabou hoje' : esc(pizza.tag || 'Sabor')}</span>
        <strong class="pizza-price">${currency.format(pizza.preco)}</strong>
      </div>
      <h3>${esc(pizza.nome)}</h3>
      <p>${esc(pizza.descricao || '')}</p>
      <div class="ingredient-preview" aria-label="Ingredientes principais">
        ${pizza.ingredientes.slice(0, 5).map(([nome]) => `<span>${esc(nome)}</span>`).join('')}
        ${pizza.ingredientes.length > 5 ? `<span>+ ${pizza.ingredientes.length - 5}</span>` : ''}
      </div>
      ${fora ? '<p class="sold-out-flag"><span aria-hidden="true">✕</span> Hoje não temos esta pizza</p>' : alergenoChips(pizza.alergenos)}
      <div class="card-actions">
        <button class="button primary customize-card" type="button" data-pizza="${esc(pizza.id)}" ${fora ? 'disabled' : ''}>
          ${fora ? 'Indisponível hoje' : 'Ver e personalizar'}
        </button>
        <button class="button listen-card" type="button" data-listen-pizza="${esc(pizza.id)}" aria-label="Ouvir detalhes da pizza ${esc(pizza.nome)}">▶</button>
      </div>
    </article>`;
  }).join('');

  $('#menu-grid').innerHTML = criar + cards;

  const fora = menu.pizzas.filter(acabou).length;
  const disponiveis = menu.pizzas.length - fora;
  $('#menu-count').textContent = fora
    ? `${disponiveis} sabores hoje · ${fora} esgotado${fora > 1 ? 's' : ''}`
    : `${menu.pizzas.length} sabores + montagem livre`;
  const heroLink = $('#hero-menu-link');
  if (heroLink) heroLink.textContent = fora ? `Ver os ${disponiveis} sabores de hoje` : `Ver os ${menu.pizzas.length} sabores`;
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog && !dialog.open) dialog.showModal();
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog?.open) dialog.close();
}

/* ==========================================================================
   PERSONALIZAR UMA PIZZA DO CARDAPIO
   ========================================================================== */

function openCustomizer(pizzaId, existingItem = null, index = null) {
  const pizza = menu.pizzas.find(item => item.id === pizzaId);
  if (!pizza) {
    showToast('Esse sabor não está mais no cardápio.');
    return;
  }
  if (acabou(pizza)) {
    showToast(`Hoje não temos ${pizza.nome}. Escolha outro sabor ou monte a sua.`);
    return;
  }
  state.currentPizza = pizza;
  state.editingIndex = index;

  $('#customizer-kicker').textContent = existingItem ? 'Edite e confira novamente' : 'Personalize no seu ritmo';
  $('#customizer-title').textContent = pizza.nome;

  const kept = existingItem?.kept || pizza.ingredientes.map(([nome]) => nome);
  $('#ingredient-list').innerHTML = pizza.ingredientes.map(([nome, quantidade]) => `
    <label class="ingredient-choice">
      <input type="checkbox" name="ingredient" value="${esc(nome)}" ${kept.includes(nome) ? 'checked' : ''} />
      <span><strong>${esc(nome)}</strong><small>${esc(quantidade)}</small></span>
    </label>
  `).join('');

  const selectedExtras = existingItem?.extras?.map(item => item.name) || [];
  $('#extras-list').innerHTML = menu.adicionais.map((extra) => {
    const fora = acabou(extra);
    return `
    <label class="extra-choice${fora ? ' is-out' : ''}">
      <input type="checkbox" name="extra" value="${esc(extra.nome)}" data-price="${extra.preco}"
        ${fora ? 'disabled' : ''} ${(!fora && selectedExtras.includes(extra.nome)) ? 'checked' : ''} />
      <span><strong>${esc(extra.nome)}</strong><small>${fora ? 'Acabou hoje' : `+ ${currency.format(extra.preco)}`}</small></span>
    </label>`;
  }).join('');

  renderOptionGroups('#option-groups-customizer', existingItem);

  $('#order-notes').value = existingItem?.notes || '';
  $('#notes-count').textContent = `${$('#order-notes').value.length}/240`;
  $('#add-customized').textContent = existingItem ? 'Salvar alterações' : 'Adicionar ao pedido';
  renderFullRecipe(pizza);
  updateCustomizerSummary();
  openDialog('customizer-dialog');
}

/** Massa, ponto e borda — usados no personalizador e no montador. */
function renderOptionGroups(selector, existingItem, prefix = '') {
  const container = $(selector);
  if (!container) return;
  const n = (name) => `${prefix}${name}`;
  container.innerHTML = `
    <fieldset>
      <legend>Espessura da massa</legend>
      ${menu.massas.map(op => `
        <label><input type="radio" name="${n('dough')}" value="${esc(op.nome)}" ${(existingItem?.dough || 'Tradicional') === op.nome ? 'checked' : ''} />
        <span>${esc(op.nome)}<small>${esc(op.detalhe)}</small></span></label>`).join('')}
    </fieldset>
    <fieldset>
      <legend>Ponto de assamento</legend>
      ${menu.pontos.map(op => `
        <label><input type="radio" name="${n('bake')}" value="${esc(op.nome)}" ${(existingItem?.bake || 'No ponto') === op.nome ? 'checked' : ''} />
        <span>${esc(op.nome)}<small>${esc(op.detalhe)}</small></span></label>`).join('')}
    </fieldset>
    <fieldset>
      <legend>Borda</legend>
      ${menu.bordas.map(op => {
        const fora = acabou(op);
        const marcada = !fora && (existingItem?.crust || 'Tradicional') === op.nome;
        return `
        <label class="${fora ? 'is-out' : ''}"><input type="radio" name="${n('crust')}" value="${esc(op.nome)}" data-price="${op.preco}" ${fora ? 'disabled' : ''} ${marcada ? 'checked' : ''} />
        <span>${esc(op.nome)}<small>${fora ? 'Acabou hoje' : (op.preco ? `+ ${currency.format(op.preco)}` : esc(op.detalhe))}</small></span></label>`;
      }).join('')}
    </fieldset>`;

  // Se a borda que estava marcada acabou, volta para a primeira disponível.
  if (!$(`input[name="${n('crust')}"]:checked`, container)) {
    const primeira = $(`input[name="${n('crust')}"]:not(:disabled)`, container);
    if (primeira) primeira.checked = true;
  }
}

function getCustomization() {
  const pizza = state.currentPizza;
  if (!pizza) return null;
  const kept = $$('input[name="ingredient"]:checked').map(input => input.value);
  const removed = pizza.ingredientes.map(([nome]) => nome).filter(nome => !kept.includes(nome));
  const selectedExtras = $$('input[name="extra"]:checked')
    .map(input => ({ name: input.value, price: Number(input.dataset.price) }));
  const crustInput = $('input[name="crust"]:checked');
  const crustPrice = Number(crustInput?.dataset.price || 0);
  const price = pizza.preco + crustPrice + selectedExtras.reduce((sum, item) => sum + item.price, 0);

  const alergenos = new Set((pizza.alergenos || []).filter(key => {
    // Se o ingrediente-fonte foi retirado, nao some com o alerta: contato cruzado continua valendo.
    return true;
  }));
  selectedExtras.forEach(extra => {
    const dado = menu.adicionais.find(item => item.nome === extra.name);
    (dado?.alergenos || []).forEach(key => alergenos.add(key));
  });
  const bordaDado = menu.bordas.find(item => item.nome === crustInput?.value);
  (bordaDado?.alergenos || []).forEach(key => alergenos.add(key));

  return {
    pizzaId: pizza.id,
    name: pizza.nome,
    basePrice: pizza.preco,
    kept,
    removed,
    extras: selectedExtras,
    dough: $('input[name="dough"]:checked')?.value || 'Tradicional',
    bake: $('input[name="bake"]:checked')?.value || 'No ponto',
    crust: crustInput?.value || 'Tradicional',
    crustPrice,
    notes: $('#order-notes').value.trim(),
    alergenos: [...alergenos],
    price,
    quantity: state.editingIndex !== null ? (state.cart[state.editingIndex]?.quantity || 1) : 1
  };
}

function updateCustomizerSummary() {
  const item = getCustomization();
  if (!item) return;
  $('#removed-summary').textContent = item.removed.length
    ? `Retirados: ${item.removed.join(', ')}.`
    : 'Nenhum ingrediente retirado.';
  $('#live-summary').innerHTML = `
    <div class="summary-line"><span>Sabor</span><strong>${esc(item.name)}</strong></div>
    <div class="summary-line"><span>Massa</span><strong>${esc(item.dough)}</strong></div>
    <div class="summary-line"><span>Assamento</span><strong>${esc(item.bake)}</strong></div>
    <div class="summary-line"><span>Borda</span><strong>${esc(item.crust)}</strong></div>
    <p><strong>Ingredientes mantidos</strong></p>
    <ul class="summary-list">${item.kept.map(nome => `<li>${esc(nome)}</li>`).join('')}</ul>
    ${item.removed.length ? `<p><strong>Sem:</strong> ${esc(item.removed.join(', '))}</p>` : ''}
    ${item.extras.length ? `<p><strong>Adicionais:</strong> ${esc(item.extras.map(extra => extra.name).join(', '))}</p>` : ''}
    ${item.notes ? `<p><strong>Observação:</strong> ${esc(item.notes)}</p>` : ''}
    ${alergenoChips(item.alergenos)}
  `;
  $('#custom-total').textContent = currency.format(item.price);
}

function renderFullRecipe(pizza) {
  $('#full-recipe-content').innerHTML = `
    <div class="recipe-detail-grid">
      <div><h4>Massa</h4><ul>${menu.receitaBase.massa.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
      <div><h4>Cobertura ${esc(pizza.nome)}</h4><ul>${pizza.ingredientes.map(([nome, qtd]) => `<li>${esc(nome)} — ${esc(qtd)}</li>`).join('')}</ul></div>
      <ol class="recipe-steps">${menu.receitaBase.passos.map(passo => `<li>${esc(passo)}</li>`).join('')}</ol>
    </div>
  `;
}

function addCurrentToCart() {
  const item = getCustomization();
  if (!item) return;
  if (!item.kept.length) {
    showToast('Mantenha pelo menos um ingrediente ou monte sua própria pizza.');
    return;
  }
  if (state.editingIndex !== null) {
    state.cart[state.editingIndex] = item;
    showToast('Alterações salvas no pedido.');
  } else {
    state.cart.push(item);
    showToast(`${item.name} adicionada ao pedido.`);
  }
  saveCart();
  closeDialog('customizer-dialog');
}

/* ==========================================================================
   CRIE SUA PIZZA — MONTADOR
   ========================================================================== */

function openBuilder(existingItem = null, index = null) {
  state.builderEditingIndex = index;
  const escolhas = existingItem?.escolhas || {};

  $('#builder-base-price').textContent = currency.format(menu.montagem.precoBase);
  $('#builder-base-note').textContent = menu.montagem.descricaoBase;

  $('#builder-groups').innerHTML = menu.montagem.grupos.map((grupo, grupoIndex) => {
    const salvos = escolhas[grupo.id] || {};

    if (grupo.tipo === 'unico') {
      const atual = Object.keys(salvos)[0] || grupo.itens[0].nome;
      return `
        <section class="choice-section" aria-labelledby="grupo-${esc(grupo.id)}">
          <div class="choice-heading">
            <div>
              <p class="step-label">${grupoIndex + 1} de ${menu.montagem.grupos.length}</p>
              <h3 id="grupo-${esc(grupo.id)}">${esc(grupo.titulo)}</h3>
              <p>${esc(grupo.descricao)}</p>
            </div>
          </div>
          <fieldset class="builder-radio-group">
            <legend class="sr-only">${esc(grupo.titulo)}</legend>
            ${grupo.itens.map(item => {
              const fora = acabou(item);
              return `
              <label class="${fora ? 'is-out' : ''}"><input type="radio" name="grupo-${esc(grupo.id)}" value="${esc(item.nome)}" data-group="${esc(grupo.id)}" data-price="${item.preco}" ${fora ? 'disabled' : ''} ${(!fora && atual === item.nome) ? 'checked' : ''} />
              <span>${esc(item.nome)}<small>${fora ? 'Acabou hoje' : (item.preco ? `+ ${currency.format(item.preco)}` : 'Incluído')}</small></span></label>`;
            }).join('')}
          </fieldset>
        </section>`;
    }

    return `
      <section class="choice-section" aria-labelledby="grupo-${esc(grupo.id)}">
        <div class="choice-heading">
          <div>
            <p class="step-label">${grupoIndex + 1} de ${menu.montagem.grupos.length}</p>
            <h3 id="grupo-${esc(grupo.id)}">${esc(grupo.titulo)}</h3>
            <p>${esc(grupo.descricao)} Até ${grupo.maximo} de cada.</p>
          </div>
        </div>
        <div class="builder-items">
          ${grupo.itens.map(item => {
            const fora = acabou(item);
            const qtd = fora ? 0 : Number(salvos[item.nome] || 0);
            return `
            <div class="builder-item${qtd ? ' chosen' : ''}${fora ? ' is-out' : ''}" data-group="${esc(grupo.id)}" data-item="${esc(item.nome)}" data-price="${item.preco}" data-max="${grupo.maximo}" ${fora ? 'data-out="1"' : ''}>
              <div class="builder-item-info">
                <strong>${esc(item.nome)}</strong>
                <small>${fora
                  ? 'Acabou hoje'
                  : `${item.preco ? `+ ${currency.format(item.preco)} cada` : 'Sem custo'}${(item.alergenos || []).length ? ` · contém ${esc(item.alergenos.map(k => ALERGENOS[k] || k).join(', '))}` : ''}`}</small>
              </div>
              ${fora
                ? '<span class="out-badge" aria-label="Indisponível hoje">Acabou</span>'
                : `<div class="stepper">
                <button type="button" class="stepper-btn" data-step="-1" aria-label="Tirar uma porção de ${esc(item.nome)}" ${qtd ? '' : 'disabled'}>−</button>
                <strong class="stepper-value" aria-live="polite" aria-label="${esc(item.nome)}: ${qtd} porções">${qtd}</strong>
                <button type="button" class="stepper-btn" data-step="1" aria-label="Acrescentar uma porção de ${esc(item.nome)}" ${qtd >= grupo.maximo ? 'disabled' : ''}>+</button>
              </div>`}
            </div>`;
          }).join('')}
        </div>
      </section>`;
  }).join('');

  renderOptionGroups('#option-groups-builder', existingItem, 'b-');

  $('#builder-notes').value = existingItem?.notes || '';
  $('#builder-notes-count').textContent = `${$('#builder-notes').value.length}/240`;
  $('#add-builder').textContent = existingItem ? 'Salvar alterações' : 'Adicionar ao pedido';
  updateBuilderSummary();
  openDialog('builder-dialog');
}

function getBuilderSelection() {
  const escolhas = {};
  const linhas = [];
  const alergenos = new Set(['gluten']); // a massa sempre leva trigo
  let total = menu.montagem.precoBase;

  menu.montagem.grupos.forEach(grupo => {
    escolhas[grupo.id] = {};

    if (grupo.tipo === 'unico') {
      const escolhido = $(`input[name="grupo-${CSS.escape(grupo.id)}"]:checked`);
      if (!escolhido) return;
      const dado = grupo.itens.find(item => item.nome === escolhido.value);
      escolhas[grupo.id][escolhido.value] = 1;
      total += Number(escolhido.dataset.price || 0);
      linhas.push({ grupo: grupo.titulo, nome: escolhido.value, quantidade: 1, preco: Number(escolhido.dataset.price || 0) });
      (dado?.alergenos || []).forEach(key => alergenos.add(key));
      return;
    }

    $$(`.builder-item[data-group="${CSS.escape(grupo.id)}"]`).forEach(node => {
      const valor = $('.stepper-value', node);
      if (!valor) return; // item esgotado não tem contador
      const qtd = Number(valor.textContent);
      if (!qtd) return;
      const nome = node.dataset.item;
      const preco = Number(node.dataset.price);
      const dado = grupo.itens.find(item => item.nome === nome);
      escolhas[grupo.id][nome] = qtd;
      total += preco * qtd;
      linhas.push({ grupo: grupo.titulo, nome, quantidade: qtd, preco: preco * qtd });
      (dado?.alergenos || []).forEach(key => alergenos.add(key));
    });
  });

  const crustInput = $('input[name="b-crust"]:checked');
  const crustPrice = Number(crustInput?.dataset.price || 0);
  total += crustPrice;
  const bordaDado = menu.bordas.find(item => item.nome === crustInput?.value);
  (bordaDado?.alergenos || []).forEach(key => alergenos.add(key));

  return {
    pizzaId: '__montada__',
    custom: true,
    name: 'Pizza montada por você',
    basePrice: menu.montagem.precoBase,
    escolhas,
    linhas,
    kept: linhas.map(linha => (linha.quantidade > 1 ? `${linha.nome} (${linha.quantidade}x)` : linha.nome)),
    removed: [],
    extras: [],
    dough: $('input[name="b-dough"]:checked')?.value || 'Tradicional',
    bake: $('input[name="b-bake"]:checked')?.value || 'No ponto',
    crust: crustInput?.value || 'Tradicional',
    crustPrice,
    notes: $('#builder-notes').value.trim(),
    alergenos: [...alergenos],
    price: total,
    quantity: state.builderEditingIndex !== null ? (state.cart[state.builderEditingIndex]?.quantity || 1) : 1
  };
}

function updateBuilderSummary() {
  const item = getBuilderSelection();
  const porGrupo = {};
  item.linhas.forEach(linha => {
    porGrupo[linha.grupo] = porGrupo[linha.grupo] || [];
    porGrupo[linha.grupo].push(linha);
  });

  const blocos = Object.entries(porGrupo).map(([grupo, linhas]) => `
    <p class="summary-group"><strong>${esc(grupo)}</strong></p>
    <ul class="summary-list">
      ${linhas.map(linha => `<li>${esc(linha.nome)}${linha.quantidade > 1 ? ` <em>${linha.quantidade}x</em>` : ''}
        <span>${linha.preco ? `+ ${currency.format(linha.preco)}` : 'incluído'}</span></li>`).join('')}
    </ul>`).join('');

  $('#builder-summary').innerHTML = `
    <div class="summary-line"><span>Massa</span><strong>${esc(item.dough)}</strong></div>
    <div class="summary-line"><span>Assamento</span><strong>${esc(item.bake)}</strong></div>
    <div class="summary-line"><span>Borda</span><strong>${esc(item.crust)}${item.crustPrice ? ` (+ ${currency.format(item.crustPrice)})` : ''}</strong></div>
    <div class="summary-line"><span>Massa e molho</span><strong>${currency.format(item.basePrice)}</strong></div>
    ${blocos || '<p class="summary-empty">Nenhum ingrediente escolhido ainda. Use os botões + para montar.</p>'}
    ${item.notes ? `<p><strong>Observação:</strong> ${esc(item.notes)}</p>` : ''}
    ${alergenoChips(item.alergenos)}
  `;
  $('#builder-total').textContent = currency.format(item.price);

  const conta = item.linhas.filter(linha => linha.preco > 0 || linha.quantidade > 0).length;
  $('#builder-count').textContent = conta === 1 ? '1 escolha' : `${conta} escolhas`;
}

function addBuilderToCart() {
  const item = getBuilderSelection();
  const temIngrediente = menu.montagem.grupos
    .filter(grupo => grupo.tipo !== 'unico')
    .some(grupo => Object.keys(item.escolhas[grupo.id] || {}).length);

  if (!temIngrediente) {
    showToast('Escolha pelo menos um ingrediente para montar sua pizza.');
    $('#builder-groups').scrollIntoView({ block: 'start' });
    return;
  }

  if (state.builderEditingIndex !== null) {
    state.cart[state.builderEditingIndex] = item;
    showToast('Alterações salvas no pedido.');
  } else {
    state.cart.push(item);
    showToast('Sua pizza montada foi adicionada ao pedido.');
  }
  saveCart();
  closeDialog('builder-dialog');
}

/* ==========================================================================
   PEDIDO
   ========================================================================== */

function renderCartCount() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  $('#cart-count').textContent = count;
  $('#open-cart').setAttribute('aria-label', `Abrir meu pedido, ${count} ${count === 1 ? 'item' : 'itens'}`);
}

function renderCart() {
  const items = $('#cart-items');
  const totalArea = $('#cart-total');
  const checkout = $('#cart-checkout');
  const confirm = $('#confirm-order');
  const speakBtn = $('#speak-cart');

  if (!state.cart.length) {
    items.innerHTML = `<div class="empty-cart"><strong>Seu pedido está vazio.</strong><span>Escolha uma pizza ou monte a sua do zero.</span></div>`;
    totalArea.hidden = checkout.hidden = confirm.hidden = speakBtn.hidden = true;
    return;
  }

  items.innerHTML = state.cart.map((item, index) => {
    const pizzaFora = !item.custom && acabou(menu.pizzas.find(p => p.id === item.pizzaId));
    return `
    <article class="cart-item ${item.custom ? 'cart-item-custom' : ''}${pizzaFora ? ' cart-item-out' : ''}">
      <div class="cart-item-top">
        <div>
          <h3>${esc(item.name)}</h3>
          <p>Massa ${esc(item.dough)} · ${esc(item.bake)} · borda ${esc(item.crust)}</p>
        </div>
        <strong class="cart-item-price">${currency.format(item.price * item.quantity)}</strong>
      </div>
      ${pizzaFora ? '<p class="sold-out-flag"><span aria-hidden="true">✕</span> Este sabor acabou. Remova para continuar.</p>' : ''}
      ${item.kept.length ? `<p><strong>${item.custom ? 'Ingredientes escolhidos:' : 'Mantidos:'}</strong> ${esc(item.kept.join(', '))}</p>` : ''}
      ${item.removed.length ? `<p><strong>Sem:</strong> ${esc(item.removed.join(', '))}</p>` : ''}
      ${item.extras.length ? `<p><strong>Adicionais:</strong> ${esc(item.extras.map(extra => extra.name).join(', '))}</p>` : ''}
      ${item.notes ? `<p><strong>Observação:</strong> ${esc(item.notes)}</p>` : ''}
      ${alergenoChips(item.alergenos)}
      <div class="cart-item-actions">
        <button type="button" data-edit-item="${index}">Editar</button>
        <button type="button" class="remove-item" data-remove-item="${index}">Remover</button>
        <span class="quantity-control" aria-label="Quantidade de ${esc(item.name)}">
          <button type="button" data-quantity="-1" data-index="${index}" aria-label="Diminuir quantidade de ${esc(item.name)}">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-quantity="1" data-index="${index}" aria-label="Aumentar quantidade de ${esc(item.name)}">+</button>
        </span>
      </div>
    </article>`;
  }).join('');

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('strong', totalArea).textContent = currency.format(total);
  totalArea.hidden = checkout.hidden = confirm.hidden = speakBtn.hidden = false;

  // Não deixa fechar pedido com sabor que acabou.
  const temEsgotado = state.cart.some(item =>
    !item.custom && acabou(menu.pizzas.find(p => p.id === item.pizzaId)));
  confirm.disabled = temEsgotado;
  confirm.textContent = temEsgotado ? 'Remova o item esgotado para confirmar' : 'Confirmar pedido';
}

function cartText() {
  if (!state.cart.length) return 'Seu pedido está vazio.';
  const lines = state.cart.map((item, index) => {
    const changes = [
      item.custom
        ? `montada com ${item.kept.join(', ')}`
        : (item.removed.length ? `sem ${item.removed.join(', ')}` : 'receita completa'),
      item.extras.length ? `com adicional de ${item.extras.map(extra => extra.name).join(', ')}` : '',
      item.notes ? `observação: ${item.notes}` : ''
    ].filter(Boolean).join('. ');
    return `${index + 1}. ${item.quantity} ${item.name}. Massa ${item.dough}, ${item.bake}, borda ${item.crust}. ${changes}. Total ${currency.format(item.price * item.quantity)}.`;
  });
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return `${lines.join(' ')} Total do pedido: ${currency.format(total)}.`;
}

function confirmOrder() {
  const name = $('#customer-name').value.trim();
  if (!name) {
    $('#customer-name').focus();
    showToast('Digite um nome para identificar o pedido.');
    return;
  }
  const service = $('input[name="service"]:checked')?.value || 'Comer no local';
  const payment = $('input[name="payment"]:checked')?.value || 'Pix';
  const code = `ESS-${Math.floor(1000 + Math.random() * 9000)}`;
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  state.orderText = `Pedido ${code} — ${name}\n${cartText()}\nRecebimento: ${service}. Pagamento: ${payment}.\nTotal: ${currency.format(total)}.`;
  $('#order-code').textContent = code;
  $('#success-message').textContent = `${name}, seu pedido foi revisado. Este protótipo não realiza cobrança real.`;
  closeDialog('cart-dialog');
  openDialog('success-dialog');
}

/* ==========================================================================
   ACESSIBILIDADE
   ========================================================================== */

function speak(text) {
  if (!('speechSynthesis' in window)) {
    showToast('A leitura em voz alta não está disponível neste navegador.');
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.92;
  speechSynthesis.speak(utterance);
  $('#stop-audio').hidden = false;
  showToast('Leitura iniciada. Use "Parar áudio" quando quiser.');
}

function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  $('#stop-audio').hidden = true;
  showToast('Leitura interrompida.');
}

function speakContext(context) {
  if (context === 'intro') {
    speak('Bem-vindo à Essência Pizzaria. Escolha sua pizza com tranquilidade. Você pode ver cada ingrediente, montar a sua do zero, personalizar e revisar antes de confirmar.');
  } else if (context === 'menu') {
    const disponiveis = menu.pizzas.filter(p => !acabou(p));
    const esgotadas = menu.pizzas.filter(acabou);
    speak(`Cardápio com ${disponiveis.length} sabores disponíveis hoje, além da opção Crie sua pizza a partir de ${currency.format(menu.montagem.precoBase)}. `
      + `${disponiveis.map(p => `${p.nome}, ${currency.format(p.preco)}. ${p.descricao}`).join(' ')} `
      + `${esgotadas.length ? `Hoje não temos: ${esgotadas.map(p => p.nome).join(', ')}.` : ''}`);
  } else if (context === 'customizer') {
    const item = getCustomization();
    if (!item) return;
    speak(`Resumo da pizza ${item.name}. Massa ${item.dough}. Ponto ${item.bake}. Borda ${item.crust}. Ingredientes mantidos: ${item.kept.join(', ')}. ${item.removed.length ? `Retirados: ${item.removed.join(', ')}.` : 'Nenhum ingrediente retirado.'} ${item.extras.length ? `Adicionais: ${item.extras.map(e => e.name).join(', ')}.` : ''} Total ${currency.format(item.price)}.`);
  } else if (context === 'builder') {
    const item = getBuilderSelection();
    speak(`Sua pizza montada. Massa ${item.dough}, ponto ${item.bake}, borda ${item.crust}. ${item.linhas.length ? `Você escolheu: ${item.linhas.map(l => `${l.quantidade > 1 ? `${l.quantidade} porções de ` : ''}${l.nome}`).join(', ')}.` : 'Você ainda não escolheu ingredientes.'} Total ${currency.format(item.price)}.`);
  } else if (context === 'cart') {
    speak(cartText());
  }
}

function readVisiblePage() {
  const visibleDialog = $$('dialog[open]').at(-1);
  const source = visibleDialog || document.querySelector('main');
  const text = source.innerText.replace(/\s+/g, ' ').trim().slice(0, 4500);
  speak(text);
}

function setPreference(key, enabled) {
  try {
    localStorage.setItem(`essencia-${key}`, String(enabled));
  } catch (error) {
    console.warn('Preferência não pôde ser salva.', error);
  }
  applyPreferences();
}

function applyPreferences() {
  const get = (key) => {
    try { return localStorage.getItem(key) === 'true'; } catch { return false; }
  };
  const settings = {
    font: get('essencia-font'),
    contrast: get('essencia-contrast'),
    focus: get('essencia-focus')
  };
  document.body.classList.toggle('large-text', settings.font);
  document.body.classList.toggle('high-contrast', settings.contrast);
  document.body.classList.toggle('focus-mode', settings.focus);
  $('#toggle-font').setAttribute('aria-pressed', String(settings.font));
  $('#toggle-contrast').setAttribute('aria-pressed', String(settings.contrast));
  $('#toggle-focus').setAttribute('aria-pressed', String(settings.focus));
}

function openVLibras() {
  closeDialog('access-dialog');
  const button = document.querySelector('[vw-access-button]');
  if (button) {
    button.click();
    showToast('Tradutor VLibras aberto no canto da tela.');
  } else {
    showToast('O tradutor de Libras ainda está carregando. Tente novamente em alguns segundos.');
  }
}

/* ==========================================================================
   EVENTOS
   ========================================================================== */

document.addEventListener('click', (event) => {
  const customize = event.target.closest('[data-pizza]');
  if (customize) openCustomizer(customize.dataset.pizza);

  const listen = event.target.closest('[data-listen-pizza]');
  if (listen) {
    const pizza = menu.pizzas.find(item => item.id === listen.dataset.listenPizza);
    if (pizza) {
      const alerta = (pizza.alergenos || []).length
        ? ` Contém ${pizza.alergenos.map(k => ALERGENOS[k] || k).join(', ')}.`
        : '';
      const aviso = acabou(pizza) ? ' Atenção: hoje não temos esta pizza.' : '';
      speak(`${pizza.nome}.${aviso} ${pizza.descricao} Ingredientes: ${pizza.ingredientes.map(([nome]) => nome).join(', ')}. Preço ${currency.format(pizza.preco)}.${alerta}`);
    }
  }

  if (event.target.closest('[data-listen-builder]')) {
    speak(`Crie sua pizza. Você começa com a massa da casa e o molho por ${currency.format(menu.montagem.precoBase)} e escolhe cada ingrediente: ${menu.montagem.grupos.map(g => g.titulo).join(', ')}. O preço aparece a cada escolha.`);
  }

  // O card "Crie sua pizza" e redesenhado junto com o cardapio, entao
  // o clique e tratado por delegacao para nunca perder o evento.
  if (event.target.closest('#open-builder')) openBuilder();

  const close = event.target.closest('[data-close]');
  if (close) closeDialog(close.dataset.close);

  const edit = event.target.closest('[data-edit-item]');
  if (edit) {
    const index = Number(edit.dataset.editItem);
    const item = state.cart[index];
    closeDialog('cart-dialog');
    if (item.custom) openBuilder(item, index);
    else openCustomizer(item.pizzaId, item, index);
  }

  const remove = event.target.closest('[data-remove-item]');
  if (remove) {
    state.cart.splice(Number(remove.dataset.removeItem), 1);
    saveCart();
    renderCart();
    showToast('Item removido do pedido.');
  }

  const quantity = event.target.closest('[data-quantity]');
  if (quantity) {
    const index = Number(quantity.dataset.index);
    state.cart[index].quantity = Math.max(1, state.cart[index].quantity + Number(quantity.dataset.quantity));
    saveCart();
    renderCart();
  }

  const speakButton = event.target.closest('[data-speak]');
  if (speakButton) speakContext(speakButton.dataset.speak);

  // Botoes + e - do montador
  const step = event.target.closest('.stepper-btn');
  if (step) {
    const node = step.closest('.builder-item');
    const valueEl = $('.stepper-value', node);
    const max = Number(node.dataset.max || 3);
    const atual = Number(valueEl.textContent);
    const novo = Math.min(max, Math.max(0, atual + Number(step.dataset.step)));
    valueEl.textContent = novo;
    valueEl.setAttribute('aria-label', `${node.dataset.item}: ${novo} porções`);
    node.classList.toggle('chosen', novo > 0);
    $('.stepper-btn[data-step="-1"]', node).disabled = novo === 0;
    $('.stepper-btn[data-step="1"]', node).disabled = novo >= max;
    updateBuilderSummary();
  }
});

$('#customizer-form').addEventListener('change', updateCustomizerSummary);
$('#builder-form').addEventListener('change', updateBuilderSummary);

$('#order-notes').addEventListener('input', (event) => {
  $('#notes-count').textContent = `${event.target.value.length}/240`;
  updateCustomizerSummary();
});
$('#builder-notes').addEventListener('input', (event) => {
  $('#builder-notes-count').textContent = `${event.target.value.length}/240`;
  updateBuilderSummary();
});

$('#reset-ingredients').addEventListener('click', () => {
  $$('input[name="ingredient"]').forEach(input => { input.checked = true; });
  updateCustomizerSummary();
});
$('#builder-reset').addEventListener('click', () => {
  openBuilder(null, state.builderEditingIndex);
  showToast('Montagem reiniciada.');
});

$('#add-customized').addEventListener('click', addCurrentToCart);
$('#add-builder').addEventListener('click', addBuilderToCart);
$('#open-cart').addEventListener('click', () => { renderCart(); openDialog('cart-dialog'); });
$('#open-access').addEventListener('click', () => openDialog('access-dialog'));
$('#read-page').addEventListener('click', readVisiblePage);
$('#stop-audio').addEventListener('click', stopSpeaking);
$('#open-libras').addEventListener('click', openVLibras);
$('#toggle-font').addEventListener('click', () => setPreference('font', $('#toggle-font').getAttribute('aria-pressed') !== 'true'));
$('#toggle-contrast').addEventListener('click', () => setPreference('contrast', $('#toggle-contrast').getAttribute('aria-pressed') !== 'true'));
$('#toggle-focus').addEventListener('click', () => setPreference('focus', $('#toggle-focus').getAttribute('aria-pressed') !== 'true'));
$('#confirm-order').addEventListener('click', confirmOrder);

$('#copy-order').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(state.orderText);
    showToast('Resumo copiado.');
  } catch {
    showToast('Não foi possível copiar automaticamente. Selecione o texto e copie.');
  }
});

$('#new-order').addEventListener('click', () => {
  state.cart = [];
  saveCart();
  closeDialog('success-dialog');
  document.querySelector('#cardapio').scrollIntoView();
  showToast('Novo pedido iniciado.');
});

// Fecha o dialogo ao clicar fora da caixa.
$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
});

// Se o painel do celular alterar o cardapio em outra aba, atualiza aqui.
window.addEventListener('storage', (event) => {
  if (event.key === 'essencia-menu') {
    menu = loadMenu();
    renderMenu();
    showToast('Cardápio atualizado.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!menu || !Array.isArray(menu.pizzas)) {
    $('#menu-grid').innerHTML = '<p class="empty-cart"><strong>Não foi possível carregar o cardápio.</strong><span>Verifique se o arquivo menu-dados.js está na mesma pasta.</span></p>';
    return;
  }
  renderMenu();
  renderCartCount();
  applyPreferences();
  try {
    if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app');
  } catch (error) {
    console.warn('VLibras indisponível:', error);
  }
});
