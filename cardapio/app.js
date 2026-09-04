const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const pizzas = [
  {
    id: 'calabresa', name: 'Calabresa', price: 42, tag: 'Clássica', accent: '#c84136',
    description: 'Sabor marcante com cebola em tiras e orégano.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '180 g'], ['Calabresa', '150 g'], ['Cebola', '40 g'], ['Orégano', '2 g']
    ]
  },
  {
    id: 'mucarela', name: 'Muçarela', price: 40, tag: 'Sabor suave', accent: '#f2b632',
    description: 'Receita simples, conhecida e fácil de personalizar.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '250 g'], ['Tomate', '80 g'], ['Azeitonas', '30 g'], ['Orégano', '2 g']
    ]
  },
  {
    id: 'pepperoni', name: 'Pepperoni', price: 92, tag: 'Intensa', accent: '#2d62a9',
    description: 'Pepperoni fatiado sobre muçarela e molho da casa.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '200 g'], ['Pepperoni', '150 g'], ['Orégano', '2 g']
    ]
  },
  {
    id: 'frango-catupiry', name: 'Frango com Catupiry', price: 45, tag: 'Cremosa', accent: '#744a91',
    description: 'Frango desfiado e Catupiry em uma combinação cremosa.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '150 g'], ['Frango desfiado', '170 g'], ['Catupiry', '100 g'], ['Orégano', '2 g']
    ]
  },
  {
    id: 'vegetariana', name: 'Vegetariana', price: 43, tag: 'Sem carne', accent: '#1d7247',
    description: 'Legumes coloridos com muçarela e tempero suave.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '180 g'], ['Tomate', '70 g'], ['Milho', '50 g'], ['Cebola', '35 g'], ['Pimentão', '40 g'], ['Orégano', '2 g']
    ]
  },
  {
    id: 'marguerita', name: 'Marguerita', price: 41, tag: 'Fresca', accent: '#df6b2d',
    description: 'Tomate, manjericão e azeite com aroma delicado.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '200 g'], ['Tomate', '90 g'], ['Manjericão', '8 folhas'], ['Azeite', '5 ml']
    ]
  },
  {
    id: 'portuguesa', name: 'Portuguesa', price: 47, tag: 'Completa', accent: '#184f6f',
    description: 'Presunto, ovo, cebola, ervilha e azeitonas.',
    ingredients: [
      ['Molho de tomate', '90 g'], ['Muçarela', '180 g'], ['Presunto', '100 g'], ['Ovo cozido', '2 unidades'], ['Cebola', '35 g'], ['Ervilha', '40 g'], ['Azeitonas', '25 g'], ['Orégano', '2 g']
    ]
  }
];

const extras = [
  { name: 'Muçarela extra', price: 5 },
  { name: 'Catupiry', price: 5 },
  { name: 'Cheddar', price: 5 },
  { name: 'Milho', price: 3 },
  { name: 'Tomate', price: 3 },
  { name: 'Cebola', price: 2 },
  { name: 'Azeitonas', price: 3 },
  { name: 'Cogumelos', price: 6 }
];

const baseRecipe = {
  dough: ['Farinha de trigo — 250 g', 'Água — 155 ml', 'Fermento biológico — 4 g', 'Azeite — 10 ml', 'Açúcar — 5 g', 'Sal — 5 g'],
  steps: [
    'Misturar e sovar a massa até ficar lisa.',
    'Descansar até crescer e abrir na espessura escolhida.',
    'Adicionar o molho e somente os ingredientes confirmados.',
    'Assar conforme o ponto escolhido e revisar a observação antes de servir.'
  ]
};

const state = {
  cart: readSavedCart(),
  currentPizza: null,
  editingIndex: null,
  orderText: ''
};

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('essencia-cart') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function saveCart() {
  localStorage.setItem('essencia-cart', JSON.stringify(state.cart));
  renderCartCount();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function renderMenu() {
  $('#menu-grid').innerHTML = pizzas.map((pizza, index) => `
    <article class="pizza-card" style="--card-accent:${pizza.accent}" data-number="0${index + 1}">
      <div class="pizza-meta">
        <span class="pizza-tag">${pizza.tag}</span>
        <strong class="pizza-price">${currency.format(pizza.price)}</strong>
      </div>
      <h3>${pizza.name}</h3>
      <p>${pizza.description}</p>
      <div class="ingredient-preview" aria-label="Ingredientes principais">
        ${pizza.ingredients.slice(0, 5).map(([name]) => `<span>${name}</span>`).join('')}
        ${pizza.ingredients.length > 5 ? `<span>+ ${pizza.ingredients.length - 5}</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="button primary customize-card" type="button" data-pizza="${pizza.id}">Ver e personalizar</button>
        <button class="button listen-card" type="button" data-listen-pizza="${pizza.id}" aria-label="Ouvir detalhes da pizza ${pizza.name}">▶</button>
      </div>
    </article>
  `).join('');
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog?.open) dialog.close();
}

function openCustomizer(pizzaId, existingItem = null, index = null) {
  const pizza = pizzas.find(item => item.id === pizzaId);
  if (!pizza) return;
  state.currentPizza = pizza;
  state.editingIndex = index;

  $('#customizer-kicker').textContent = existingItem ? 'Edite e confira novamente' : 'Personalize no seu ritmo';
  $('#customizer-title').textContent = pizza.name;

  const kept = existingItem?.kept || pizza.ingredients.map(([name]) => name);
  $('#ingredient-list').innerHTML = pizza.ingredients.map(([name, quantity], ingredientIndex) => `
    <label class="ingredient-choice">
      <input type="checkbox" name="ingredient" value="${name}" ${kept.includes(name) ? 'checked' : ''} />
      <span><strong>${name}</strong><small>${quantity}</small></span>
    </label>
  `).join('');

  const selectedExtras = existingItem?.extras?.map(item => item.name) || [];
  $('#extras-list').innerHTML = extras.map((extra) => `
    <label class="extra-choice">
      <input type="checkbox" name="extra" value="${extra.name}" data-price="${extra.price}" ${selectedExtras.includes(extra.name) ? 'checked' : ''} />
      <span><strong>${extra.name}</strong><small>+ ${currency.format(extra.price)}</small></span>
    </label>
  `).join('');

  setRadio('dough', existingItem?.dough || 'Tradicional');
  setRadio('bake', existingItem?.bake || 'No ponto');
  setRadio('crust', existingItem?.crust || 'Tradicional');
  $('#order-notes').value = existingItem?.notes || '';
  $('#notes-count').textContent = `${$('#order-notes').value.length}/240`;
  $('#add-customized').textContent = existingItem ? 'Salvar alterações' : 'Adicionar ao pedido';
  renderFullRecipe(pizza);
  updateCustomizerSummary();
  openDialog('customizer-dialog');
}

function setRadio(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
  if (input) input.checked = true;
}

function getCustomization() {
  const pizza = state.currentPizza;
  const kept = $$('input[name="ingredient"]:checked').map(input => input.value);
  const removed = pizza.ingredients.map(([name]) => name).filter(name => !kept.includes(name));
  const selectedExtras = $$('input[name="extra"]:checked').map(input => ({ name: input.value, price: Number(input.dataset.price) }));
  const crustInput = $('input[name="crust"]:checked');
  const crustPrice = Number(crustInput?.dataset.price || 0);
  const price = pizza.price + crustPrice + selectedExtras.reduce((sum, item) => sum + item.price, 0);
  return {
    pizzaId: pizza.id,
    name: pizza.name,
    basePrice: pizza.price,
    kept,
    removed,
    extras: selectedExtras,
    dough: $('input[name="dough"]:checked')?.value || 'Tradicional',
    bake: $('input[name="bake"]:checked')?.value || 'No ponto',
    crust: crustInput?.value || 'Tradicional',
    crustPrice,
    notes: $('#order-notes').value.trim(),
    price,
    quantity: state.editingIndex !== null ? state.cart[state.editingIndex].quantity : 1
  };
}

function updateCustomizerSummary() {
  if (!state.currentPizza) return;
  const item = getCustomization();
  $('#removed-summary').textContent = item.removed.length ? `Retirados: ${item.removed.join(', ')}.` : 'Nenhum ingrediente retirado.';
  $('#live-summary').innerHTML = `
    <div class="summary-line"><span>Sabor</span><strong>${item.name}</strong></div>
    <div class="summary-line"><span>Massa</span><strong>${item.dough}</strong></div>
    <div class="summary-line"><span>Assamento</span><strong>${item.bake}</strong></div>
    <div class="summary-line"><span>Borda</span><strong>${item.crust}</strong></div>
    <p><strong>Ingredientes mantidos</strong></p>
    <ul class="summary-list">${item.kept.map(name => `<li>${name}</li>`).join('')}</ul>
    ${item.removed.length ? `<p><strong>Sem:</strong> ${item.removed.join(', ')}</p>` : ''}
    ${item.extras.length ? `<p><strong>Adicionais:</strong> ${item.extras.map(extra => extra.name).join(', ')}</p>` : ''}
    ${item.notes ? `<p><strong>Observação:</strong> ${item.notes}</p>` : ''}
  `;
  $('#custom-total').textContent = currency.format(item.price);
}

function renderFullRecipe(pizza) {
  $('#full-recipe-content').innerHTML = `
    <div class="recipe-detail-grid">
      <div><h4>Massa</h4><ul>${baseRecipe.dough.map(item => `<li>${item}</li>`).join('')}</ul></div>
      <div><h4>Cobertura ${pizza.name}</h4><ul>${pizza.ingredients.map(([name, quantity]) => `<li>${name} — ${quantity}</li>`).join('')}</ul></div>
      <ol class="recipe-steps">${baseRecipe.steps.map(step => `<li>${step}</li>`).join('')}</ol>
    </div>
  `;
}

function addCurrentToCart() {
  const item = getCustomization();
  if (!item.kept.length) {
    showToast('Mantenha pelo menos um ingrediente ou escolha outra pizza.');
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
  const speak = $('#speak-cart');

  if (!state.cart.length) {
    items.innerHTML = `<div class="empty-cart"><strong>Seu pedido está vazio.</strong><span>Escolha uma pizza e personalize do seu jeito.</span></div>`;
    totalArea.hidden = checkout.hidden = confirm.hidden = speak.hidden = true;
    return;
  }

  items.innerHTML = state.cart.map((item, index) => `
    <article class="cart-item">
      <div class="cart-item-top">
        <div><h3>${item.name}</h3><p>Massa ${item.dough} · ${item.bake} · borda ${item.crust}</p></div>
        <strong class="cart-item-price">${currency.format(item.price * item.quantity)}</strong>
      </div>
      <p><strong>Mantidos:</strong> ${item.kept.join(', ')}</p>
      ${item.removed.length ? `<p><strong>Sem:</strong> ${item.removed.join(', ')}</p>` : ''}
      ${item.extras.length ? `<p><strong>Adicionais:</strong> ${item.extras.map(extra => extra.name).join(', ')}</p>` : ''}
      ${item.notes ? `<p><strong>Observação:</strong> ${item.notes}</p>` : ''}
      <div class="cart-item-actions">
        <button type="button" data-edit-item="${index}">Editar</button>
        <button type="button" class="remove-item" data-remove-item="${index}">Remover</button>
        <span class="quantity-control" aria-label="Quantidade de ${item.name}">
          <button type="button" data-quantity="-1" data-index="${index}" aria-label="Diminuir quantidade de ${item.name}">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-quantity="1" data-index="${index}" aria-label="Aumentar quantidade de ${item.name}">+</button>
        </span>
      </div>
    </article>
  `).join('');

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('strong', totalArea).textContent = currency.format(total);
  totalArea.hidden = checkout.hidden = confirm.hidden = speak.hidden = false;
}

function cartText() {
  if (!state.cart.length) return 'Seu pedido está vazio.';
  const lines = state.cart.map((item, index) => {
    const changes = [
      item.removed.length ? `sem ${item.removed.join(', ')}` : 'receita completa',
      item.extras.length ? `com adicional de ${item.extras.map(extra => extra.name).join(', ')}` : '',
      item.notes ? `observação: ${item.notes}` : ''
    ].filter(Boolean).join('. ');
    return `${index + 1}. ${item.quantity} pizza ${item.name}. Massa ${item.dough}, ${item.bake}, borda ${item.crust}. ${changes}. Total ${currency.format(item.price * item.quantity)}.`;
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
  showToast('Leitura iniciada. Use a opção novamente para reiniciar.');
}

function speakContext(context) {
  if (context === 'intro') {
    speak('Bem-vindo à Essência Pizzaria. Escolha sua pizza com tranquilidade. Você poderá ver cada ingrediente, personalizar e revisar antes de confirmar.');
  } else if (context === 'menu') {
    speak(`Cardápio com sete sabores. ${pizzas.map(pizza => `${pizza.name}, ${currency.format(pizza.price)}. ${pizza.description}`).join(' ')}`);
  } else if (context === 'customizer') {
    const item = getCustomization();
    speak(`Resumo da pizza ${item.name}. Massa ${item.dough}. Ponto ${item.bake}. Borda ${item.crust}. Ingredientes mantidos: ${item.kept.join(', ')}. ${item.removed.length ? `Ingredientes retirados: ${item.removed.join(', ')}.` : 'Nenhum ingrediente retirado.'} ${item.extras.length ? `Adicionais: ${item.extras.map(extra => extra.name).join(', ')}.` : ''} Total ${currency.format(item.price)}.`);
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
  localStorage.setItem(`essencia-${key}`, String(enabled));
  applyPreferences();
}

function applyPreferences() {
  const settings = {
    font: localStorage.getItem('essencia-font') === 'true',
    contrast: localStorage.getItem('essencia-contrast') === 'true',
    focus: localStorage.getItem('essencia-focus') === 'true'
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

document.addEventListener('click', (event) => {
  const customize = event.target.closest('[data-pizza]');
  if (customize) openCustomizer(customize.dataset.pizza);

  const listen = event.target.closest('[data-listen-pizza]');
  if (listen) {
    const pizza = pizzas.find(item => item.id === listen.dataset.listenPizza);
    speak(`${pizza.name}. ${pizza.description} Ingredientes: ${pizza.ingredients.map(([name]) => name).join(', ')}. Preço ${currency.format(pizza.price)}.`);
  }

  const close = event.target.closest('[data-close]');
  if (close) closeDialog(close.dataset.close);

  const edit = event.target.closest('[data-edit-item]');
  if (edit) {
    const index = Number(edit.dataset.editItem);
    const item = state.cart[index];
    closeDialog('cart-dialog');
    openCustomizer(item.pizzaId, item, index);
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
});

$('#customizer-form').addEventListener('change', updateCustomizerSummary);
$('#order-notes').addEventListener('input', (event) => {
  $('#notes-count').textContent = `${event.target.value.length}/240`;
  updateCustomizerSummary();
});
$('#reset-ingredients').addEventListener('click', () => {
  $$('input[name="ingredient"]').forEach(input => { input.checked = true; });
  updateCustomizerSummary();
});
$('#add-customized').addEventListener('click', addCurrentToCart);
$('#open-cart').addEventListener('click', () => { renderCart(); openDialog('cart-dialog'); });
$('#open-access').addEventListener('click', () => openDialog('access-dialog'));
$('#read-page').addEventListener('click', readVisiblePage);
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
    showToast('Não foi possível copiar automaticamente.');
  }
});
$('#new-order').addEventListener('click', () => {
  state.cart = [];
  saveCart();
  closeDialog('success-dialog');
  document.querySelector('#cardapio').scrollIntoView();
  showToast('Novo pedido iniciado.');
});

$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
});

window.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCartCount();
  applyPreferences();
  try {
    if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app');
  } catch (error) {
    console.warn('VLibras indisponível:', error);
  }
});
