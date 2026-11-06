/* Painel do cardápio da Essência (admin.html). Separado do HTML para a
   página poder usar Content-Security-Policy sem script embutido. */
(function () {
  'use strict';

  var ALERGENOS = {
    leite:'Leite', gluten:'Glúten', ovo:'Ovo', peixe:'Peixe',
    crustaceo:'Crustáceo', soja:'Soja', amendoim:'Amendoim', castanhas:'Castanhas'
  };
  var CORES = [
    ['#1d7247','Verde'], ['#f2b632','Amarelo'], ['#0b5fb0','Azul'],
    ['#c8402f','Vermelho'], ['#744a91','Roxo']
  ];

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function moeda(n) {
    return Number(n || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  }
  // Lê um preço. Aceita vírgula; se não der para entender, mantém o valor antigo.
  var precoRuim = false;
  function lerPreco(input, antigo) {
    var v = input.valueAsNumber;
    if (isNaN(v)) v = Number(String(input.value).replace(',', '.'));
    if (String(input.value).trim() === '' || isNaN(v) || v < 0) { precoRuim = true; return Number(antigo) || 0; }
    return Math.round(v * 100) / 100;
  }
  function slug(txt) {
    return String(txt).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pizza-' + Date.now();
  }
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ---------------- estado ---------------- */
  var publicado = window.MENU_ESSENCIA;
  var menu;
  try {
    var salvo = JSON.parse(localStorage.getItem('essencia-menu') || 'null');
    menu = (salvo && salvo.pizzas && salvo.pizzas.length) ? salvo : clone(publicado);
  } catch (e) {
    menu = clone(publicado);
  }
  if (!menu || !menu.pizzas) { menu = clone(publicado); }

  var aba = 'pizzas';

  /* ---------------- abas ---------------- */
  var ABAS = ['pizzas', 'extras', 'bordas', 'montagem', 'estoque', 'publicar'];
  function irPara(nome) {
    aba = nome;
    ABAS.forEach(function (a) {
      $('#tab-' + a).setAttribute('aria-selected', String(a === nome));
      $('#p-' + a).hidden = (a !== nome);
    });
    if (nome === 'estoque') { renderEstoque(); }
    if (nome === 'publicar') { atualizarPreview(); }
    renderAddBar();
    // Salto direto, sem animação: trocar de aba não deve virar um scroll longo.
    window.scrollTo(0, 0);
  }
  ABAS.forEach(function (a) {
    $('#tab-' + a).addEventListener('click', function () { irPara(a); });
  });

  function renderAddBar() {
    var bar = $('#addbar');
    var mapa = {
      pizzas:   '<button class="btn primary" data-add="pizza">+ Nova pizza</button>',
      extras:   '<button class="btn primary" data-add="extra">+ Novo adicional</button>',
      bordas:   '<button class="btn primary" data-add="borda">+ Nova borda</button>',
      montagem: '<button class="btn primary" data-add="grupo">+ Novo grupo</button>',
      estoque:  '',
      publicar: ''
    };
    bar.innerHTML = (mapa[aba] || '') +
      '<button class="btn ' + ((aba === 'publicar' || aba === 'estoque') ? 'primary' : 'ghost') + '" data-salvar>Salvar</button>';
    bar.hidden = false;
  }

  /* ---------------- campos reutilizáveis ---------------- */
  function campoAlergenos(lista, attrs) {
    return '<fieldset class="aler"><legend>Contém</legend><div class="aler-grid">' +
      Object.keys(ALERGENOS).map(function (k) {
        var on = (lista || []).indexOf(k) >= 0;
        return '<label><input type="checkbox" ' + attrs + ' data-aler="' + k + '"' + (on ? ' checked' : '') + ' />' +
               esc(ALERGENOS[k]) + '</label>';
      }).join('') +
      '</div></fieldset>';
  }

  /* ---------------- PIZZAS ---------------- */
  function renderPizzas() {
    var alvo = $('#lista-pizzas');
    if (!menu.pizzas.length) {
      alvo.innerHTML = '<p class="empty">Nenhuma pizza ainda. Toque em <strong>+ Nova pizza</strong> ali embaixo.</p>';
      return;
    }
    alvo.innerHTML = menu.pizzas.map(function (p, i) {
      return '' +
      '<details class="item" data-i="' + i + '">' +
        '<summary>' +
          '<span class="swatch" style="background:' + esc(p.cor || '#1d7247') + '"></span>' +
          '<span class="nm">' + esc(p.nome) + '</span>' +
          '<span class="pr">' + moeda(p.preco) + '</span>' +
        '</summary>' +
        '<div class="body">' +
          '<div class="row">' +
            '<label class="f"><span>Nome</span><input type="text" data-f="nome" value="' + esc(p.nome) + '" /></label>' +
            '<label class="f"><span>Preço (R$)</span><input type="number" min="0" step="0.1" inputmode="decimal" data-f="preco" value="' + Number(p.preco) + '" /></label>' +
          '</div>' +
          '<div class="row">' +
            '<label class="f"><span>Etiqueta</span><input type="text" data-f="tag" value="' + esc(p.tag || '') + '" placeholder="Clássica, Cremosa..." /></label>' +
            '<label class="f"><span>Cor</span><select data-f="cor">' +
              CORES.map(function (c) {
                return '<option value="' + c[0] + '"' + ((p.cor || '') === c[0] ? ' selected' : '') + '>' + c[1] + '</option>';
              }).join('') +
            '</select></label>' +
          '</div>' +
          '<label class="f"><span>Descrição</span><textarea data-f="descricao" maxlength="160">' + esc(p.descricao || '') + '</textarea></label>' +

          campoAlergenos(p.alergenos, 'data-scope="pizza"') +

          '<span style="display:block;margin-bottom:6px;font-size:.84rem;font-weight:800">Ingredientes</span>' +
          '<div data-ings>' +
            p.ingredientes.map(function (ing, j) {
              return '<div class="row3" data-j="' + j + '">' +
                '<input type="text" data-ing="nome" value="' + esc(ing[0]) + '" aria-label="Nome do ingrediente" />' +
                '<input type="text" data-ing="qtd" value="' + esc(ing[1]) + '" aria-label="Quantidade" placeholder="150 g" />' +
                '<button type="button" class="btn danger mini" data-del-ing="' + j + '" aria-label="Remover ' + esc(ing[0]) + '">×</button>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div class="btn-row">' +
            '<button type="button" class="btn ghost" data-add-ing>+ Ingrediente</button>' +
            '<button type="button" class="btn ghost" data-mover="-1" aria-label="Subir pizza">↑</button>' +
            '<button type="button" class="btn ghost" data-mover="1" aria-label="Descer pizza">↓</button>' +
            '<button type="button" class="btn danger" data-del-pizza>Apagar pizza</button>' +
          '</div>' +
        '</div>' +
      '</details>';
    }).join('');
  }

  /* ---------------- ADICIONAIS / BORDAS ---------------- */
  function renderSimples(chave, alvoSel, temDetalhe) {
    var lista = menu[chave] || [];
    var alvo = $(alvoSel);
    if (!lista.length) {
      alvo.innerHTML = '<p class="empty">Nada cadastrado ainda.</p>';
      return;
    }
    alvo.innerHTML = lista.map(function (it, i) {
      return '' +
      '<details class="item" data-i="' + i + '" data-lista="' + chave + '">' +
        '<summary><span class="nm">' + esc(it.nome) + '</span>' +
        '<span class="pr">' + (it.preco ? '+ ' + moeda(it.preco) : 'Grátis') + '</span></summary>' +
        '<div class="body">' +
          '<div class="row">' +
            '<label class="f"><span>Nome</span><input type="text" data-f="nome" value="' + esc(it.nome) + '" /></label>' +
            '<label class="f"><span>Preço (R$)</span><input type="number" min="0" step="0.5" inputmode="decimal" data-f="preco" value="' + Number(it.preco) + '" /></label>' +
          '</div>' +
          (temDetalhe ? '<label class="f"><span>Detalhe</span><input type="text" data-f="detalhe" value="' + esc(it.detalhe || '') + '" placeholder="Borda recheada" /></label>' : '') +
          campoAlergenos(it.alergenos, 'data-scope="simples"') +
          '<div class="btn-row"><button type="button" class="btn danger" data-del-simples>Apagar</button></div>' +
        '</div>' +
      '</details>';
    }).join('');
  }

  /* ---------------- MONTAGEM ---------------- */
  function renderMontagem() {
    $('#preco-base').value = Number(menu.montagem.precoBase);
    $('#desc-base').value = menu.montagem.descricaoBase || '';

    $('#lista-grupos').innerHTML = menu.montagem.grupos.map(function (g, gi) {
      return '' +
      '<div class="group-box" data-g="' + gi + '">' +
        '<h3>' + esc(g.titulo) + '</h3>' +
        '<p>' + (g.tipo === 'unico' ? 'O cliente escolhe UMA opção.' : 'O cliente pode repetir até ' + g.maximo + 'x cada item.') + '</p>' +
        '<label class="f"><span>Título do grupo</span><input type="text" data-gf="titulo" value="' + esc(g.titulo) + '" /></label>' +
        '<label class="f"><span>Explicação</span><input type="text" data-gf="descricao" value="' + esc(g.descricao || '') + '" /></label>' +
        (g.tipo === 'unico' ? '' :
          '<label class="f"><span>Máximo por item</span><input type="number" min="1" max="9" inputmode="numeric" data-gf="maximo" value="' + Number(g.maximo || 3) + '" /></label>') +
        '<span style="display:block;margin:4px 0 6px;font-size:.84rem;font-weight:800">Ingredientes deste grupo</span>' +
        g.itens.map(function (it, ii) {
          return '<div class="row3" data-gi="' + ii + '">' +
            '<input type="text" data-gif="nome" value="' + esc(it.nome) + '" aria-label="Nome" />' +
            '<input type="number" min="0" step="0.5" inputmode="decimal" data-gif="preco" value="' + Number(it.preco) + '" aria-label="Preço" />' +
            '<button type="button" class="btn danger mini" data-del-gitem="' + ii + '" aria-label="Remover ' + esc(it.nome) + '">×</button>' +
          '</div>' +
          '<details class="gi-aler" data-gi="' + ii + '"><summary>Alérgenos de ' + esc(it.nome) +
            ((it.alergenos || []).length ? ' (' + it.alergenos.length + ')' : ' (nenhum marcado)') + '</summary>' +
            campoAlergenos(it.alergenos, 'data-scope="gitem"') + '</details>';
        }).join('') +
        '<div class="btn-row">' +
          '<button type="button" class="btn ghost" data-add-gitem>+ Ingrediente</button>' +
          '<button type="button" class="btn danger" data-del-grupo>Apagar grupo</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderTudo() {
    renderPizzas();
    renderSimples('adicionais', '#lista-extras', false);
    renderSimples('bordas', '#lista-bordas', true);
    renderMontagem();
    renderAddBar();
  }

  /* ---------------- leitura dos campos ---------------- */
  function lerPizzas() {
    $$('#lista-pizzas .item').forEach(function (node) {
      var p = menu.pizzas[Number(node.dataset.i)];
      if (!p) return;
      p.nome = $('[data-f="nome"]', node).value.trim() || p.nome;
      p.preco = lerPreco($('[data-f="preco"]', node), p.preco);
      p.tag = $('[data-f="tag"]', node).value.trim();
      p.cor = $('[data-f="cor"]', node).value;
      p.descricao = $('[data-f="descricao"]', node).value.trim();
      p.alergenos = $$('[data-aler]:checked', node).map(function (c) { return c.dataset.aler; });
      p.ingredientes = $$('[data-ings] .row3', node).map(function (r) {
        return [ $('[data-ing="nome"]', r).value.trim(), $('[data-ing="qtd"]', r).value.trim() ];
      }).filter(function (par) { return par[0]; });
      if (!p.id) p.id = slug(p.nome);
    });
  }

  function lerSimples(chave, sel) {
    $$(sel + ' .item').forEach(function (node) {
      var it = menu[chave][Number(node.dataset.i)];
      if (!it) return;
      it.nome = $('[data-f="nome"]', node).value.trim() || it.nome;
      it.preco = lerPreco($('[data-f="preco"]', node), it.preco);
      var det = $('[data-f="detalhe"]', node);
      if (det) it.detalhe = det.value.trim();
      it.alergenos = $$('[data-aler]:checked', node).map(function (c) { return c.dataset.aler; });
    });
  }

  function lerMontagem() {
    menu.montagem.precoBase = lerPreco($('#preco-base'), menu.montagem.precoBase);
    menu.montagem.descricaoBase = $('#desc-base').value.trim();
    $$('#lista-grupos .group-box').forEach(function (node) {
      var g = menu.montagem.grupos[Number(node.dataset.g)];
      if (!g) return;
      g.titulo = $('[data-gf="titulo"]', node).value.trim() || g.titulo;
      g.descricao = $('[data-gf="descricao"]', node).value.trim();
      var max = $('[data-gf="maximo"]', node);
      if (max) g.maximo = Math.max(1, Number(max.value) || 3);
      g.itens = $$('.row3', node).map(function (r, i) {
        var antigo = g.itens[i] || {};
        var caixa = $('.gi-aler[data-gi="' + r.dataset.gi + '"]', node);
        var novo = {
          nome: $('[data-gif="nome"]', r).value.trim(),
          preco: lerPreco($('[data-gif="preco"]', r), antigo.preco),
          alergenos: caixa ? $$('[data-aler]:checked', caixa).map(function (c) { return c.dataset.aler; }) : (antigo.alergenos || [])
        };
        // preserva a marcação de "acabou" feita na aba O que acabou
        if (antigo.esgotado === true) novo.esgotado = true;
        return novo;
      }).filter(function (it) { return it.nome; });
    });
  }

  function lerTudo() {
    precoRuim = false;
    lerPizzas();
    lerSimples('adicionais', '#lista-extras');
    lerSimples('bordas', '#lista-bordas');
    lerMontagem();
    menu.versao = new Date().toISOString().slice(0, 10);
  }

  /* ---------------- arquivo final ---------------- */
  function gerarArquivo() {
    var cabecalho =
'/* ===========================================================================\n' +
'   ESSENCIA PIZZARIA — DADOS DO CARDAPIO\n' +
'   ---------------------------------------------------------------------------\n' +
'   Gerado pelo painel admin.html em ' + new Date().toLocaleString('pt-BR') + '\n' +
'   Substitua este arquivo no GitHub para publicar o cardapio novo.\n' +
'   =========================================================================== */\n\n' +
'window.MENU_ESSENCIA = ';
    return cabecalho + JSON.stringify(menu, null, 2) + ';\n';
  }

  function atualizarPreview() {
    lerTudo();
    $('#preview').textContent = gerarArquivo();
  }

  /* ---------------- ações ---------------- */
  function salvarLocal() {
    lerTudo();
    try {
      localStorage.setItem('essencia-menu', JSON.stringify(menu));
      toast(precoRuim ? 'Salvo. Atenção: um preço não foi entendido e ficou como estava. Confira.' : 'Salvo neste aparelho. Toque em "Ver cardápio" para conferir.');
    } catch (e) {
      toast('Não foi possível salvar neste aparelho.');
    }
    renderTudo();
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;

    if (t.closest('[data-salvar]')) { salvarLocal(); return; }

    /* --- adicionar --- */
    var add = t.closest('[data-add]');
    if (add) {
      lerTudo();
      var tipo = add.dataset.add;
      if (tipo === 'pizza') {
        menu.pizzas.push({
          id: 'nova-' + Date.now(), nome: 'Nova pizza', preco: 65, tag: 'Nova', cor: '#1d7247',
          descricao: '', alergenos: ['gluten'],
          ingredientes: [['Molho de tomate', '90 g'], ['Muçarela', '180 g']]
        });
      } else if (tipo === 'extra') {
        menu.adicionais.push({ nome: 'Novo adicional', preco: 5, alergenos: [] });
      } else if (tipo === 'borda') {
        menu.bordas.push({ nome: 'Nova borda', preco: 10, detalhe: 'Borda recheada', alergenos: [] });
      } else if (tipo === 'grupo') {
        menu.montagem.grupos.push({
          id: 'grupo-' + Date.now(), titulo: 'Novo grupo', descricao: '',
          tipo: 'quantidade', maximo: 3, itens: [{ nome: 'Novo ingrediente', preco: 5, alergenos: [] }]
        });
      }
      renderTudo();
      var novos = $$('#p-' + aba + ' .item, #p-' + aba + ' .group-box');
      var ultimo = novos[novos.length - 1];
      if (ultimo) { if (ultimo.tagName === 'DETAILS') ultimo.open = true; ultimo.scrollIntoView({ block:'center' }); }
      toast('Adicionado. Não esqueça de Salvar.');
      return;
    }

    /* --- pizzas --- */
    var item = t.closest('.item[data-i]');
    if (item && !item.dataset.lista) {
      var idx = Number(item.dataset.i);

      if (t.closest('[data-add-ing]')) {
        lerTudo();
        menu.pizzas[idx].ingredientes.push(['Novo ingrediente', '50 g']);
        renderTudo();
        var re = $('#lista-pizzas .item[data-i="' + idx + '"]'); if (re) re.open = true;
        return;
      }
      var delIng = t.closest('[data-del-ing]');
      if (delIng) {
        lerTudo();
        menu.pizzas[idx].ingredientes.splice(Number(delIng.dataset.delIng), 1);
        renderTudo();
        var re2 = $('#lista-pizzas .item[data-i="' + idx + '"]'); if (re2) re2.open = true;
        return;
      }
      if (t.closest('[data-del-pizza]')) {
        if (!window.confirm('Apagar "' + menu.pizzas[idx].nome + '" do cardápio?')) return;
        lerTudo();
        menu.pizzas.splice(idx, 1);
        renderTudo();
        toast('Pizza apagada. Não esqueça de Salvar.');
        return;
      }
      var mover = t.closest('[data-mover]');
      if (mover) {
        var destino = idx + Number(mover.dataset.mover);
        if (destino < 0 || destino >= menu.pizzas.length) return;
        lerTudo();
        var tmp = menu.pizzas[idx];
        menu.pizzas[idx] = menu.pizzas[destino];
        menu.pizzas[destino] = tmp;
        renderTudo();
        var re3 = $('#lista-pizzas .item[data-i="' + destino + '"]');
        if (re3) { re3.open = true; re3.scrollIntoView({ block:'center' }); }
        return;
      }
    }

    /* --- adicionais e bordas --- */
    var simples = t.closest('.item[data-lista]');
    if (simples && t.closest('[data-del-simples]')) {
      var chave = simples.dataset.lista;
      var i2 = Number(simples.dataset.i);
      if (!window.confirm('Apagar "' + menu[chave][i2].nome + '"?')) return;
      lerTudo();
      menu[chave].splice(i2, 1);
      renderTudo();
      toast('Apagado. Não esqueça de Salvar.');
      return;
    }

    /* --- grupos do Crie sua pizza --- */
    var box = t.closest('.group-box');
    if (box) {
      var gi = Number(box.dataset.g);
      if (t.closest('[data-add-gitem]')) {
        lerTudo();
        menu.montagem.grupos[gi].itens.push({ nome: 'Novo ingrediente', preco: 5, alergenos: [] });
        renderTudo();
        var rb = $('#lista-grupos .group-box[data-g="' + gi + '"]'); if (rb) rb.scrollIntoView({ block:'center' });
        return;
      }
      var delG = t.closest('[data-del-gitem]');
      if (delG) {
        lerTudo();
        menu.montagem.grupos[gi].itens.splice(Number(delG.dataset.delGitem), 1);
        renderTudo();
        return;
      }
      if (t.closest('[data-del-grupo]')) {
        if (!window.confirm('Apagar o grupo "' + menu.montagem.grupos[gi].titulo + '"?')) return;
        lerTudo();
        menu.montagem.grupos.splice(gi, 1);
        renderTudo();
        toast('Grupo apagado. Não esqueça de Salvar.');
        return;
      }
    }
  });

  /* mantém nome e preço visíveis no cabeçalho enquanto digita */
  document.addEventListener('input', function (ev) {
    var node = ev.target.closest('.item');
    if (!node) return;
    var f = ev.target.dataset.f;
    if (f === 'nome') $('.nm', node).textContent = ev.target.value || '(sem nome)';
    if (f === 'preco') {
      var v = Number(ev.target.value) || 0;
      $('.pr', node).textContent = node.dataset.lista ? (v ? '+ ' + moeda(v) : 'Grátis') : moeda(v);
    }
    if (f === 'cor') { var s = $('.swatch', node); if (s) s.style.background = ev.target.value; }
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.dataset.f === 'cor') {
      var node = ev.target.closest('.item');
      var s = node && $('.swatch', node);
      if (s) s.style.background = ev.target.value;
    }
  });

  $('#btn-salvar').addEventListener('click', salvarLocal);

  $('#btn-descartar').addEventListener('click', function () {
    if (!window.confirm('Descartar suas alterações e voltar ao cardápio que está publicado no site?')) return;
    try { localStorage.removeItem('essencia-menu'); } catch (e) {}
    menu = clone(publicado);
    renderTudo();
    if (aba === 'estoque') renderEstoque();
    atualizarPreview();
    toast('Voltou para o cardápio publicado.');
  });

  $('#btn-copiar').addEventListener('click', async function () {
    atualizarPreview();
    var texto = gerarArquivo();
    try {
      await navigator.clipboard.writeText(texto);
      toast('Copiado! Agora é só colar no GitHub.');
    } catch (e) {
      var pre = $('#preview');
      var sel = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges();
      sel.addRange(range);
      toast('Não consegui copiar sozinho. Selecionei o texto: toque e escolha Copiar.');
    }
  });

  $('#btn-baixar').addEventListener('click', function () {
    atualizarPreview();
    var blob = new Blob([gerarArquivo()], { type: 'text/javascript;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'menu-dados.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('Arquivo baixado: menu-dados.js');
  });


  /* ---------------- O QUE ACABOU ---------------- */

  /** Todas as listas de itens que podem ficar esgotados. */
  function fontesEstoque() {
    var fontes = [
      { titulo: 'Pizzas', itens: menu.pizzas },
      { titulo: 'Adicionais', itens: menu.adicionais },
      { titulo: 'Bordas', itens: menu.bordas }
    ];
    menu.montagem.grupos.forEach(function (g) {
      fontes.push({ titulo: 'Crie sua pizza — ' + g.titulo, itens: g.itens });
    });
    return fontes;
  }

  function renderEstoque() {
    var fontes = fontesEstoque();
    var total = 0, fora = 0;

    $('#lista-estoque').innerHTML = fontes.map(function (f, fi) {
      return '<div class="stk-group">' +
        '<h3>' + esc(f.titulo) + '</h3>' +
        f.itens.map(function (it, ii) {
          var out = it.esgotado === true;
          total++; if (out) fora++;
          return '<div class="stk-row' + (out ? ' out' : '') + '" data-f="' + fi + '" data-i="' + ii + '">' +
            '<span class="stk-name">' + esc(it.nome) + '</span>' +
            '<button type="button" class="stk-toggle" aria-pressed="' + out + '" ' +
              'aria-label="' + esc(it.nome) + (out ? ': marcado como acabou' : ': disponível') + '">' +
              (out ? 'Acabou' : 'Tem') + '</button>' +
          '</div>';
        }).join('') +
      '</div>';
    }).join('');

    $('#resumo-estoque').innerHTML = fora
      ? '<strong>' + fora + ' de ' + total + ' itens marcados como esgotados.</strong>' +
        'Lembre de <em>Salvar</em> e depois <em>Publicar</em> para os clientes verem.'
      : '<strong>Está tudo disponível.</strong>Nada marcado como esgotado no momento.';
    $('#resumo-estoque').className = fora ? 'note' : 'note ok';
  }

  document.addEventListener('click', function (ev) {
    var botao = ev.target.closest('.stk-toggle');
    if (!botao) return;
    var linha = botao.closest('.stk-row');
    var f = fontesEstoque()[Number(linha.dataset.f)];
    var item = f.itens[Number(linha.dataset.i)];
    item.esgotado = !(item.esgotado === true);
    renderEstoque();
    toast(item.esgotado ? '"' + item.nome + '" marcado como acabou.' : '"' + item.nome + '" está disponível de novo.');
  });

  $('#btn-repor').addEventListener('click', function () {
    fontesEstoque().forEach(function (f) {
      f.itens.forEach(function (it) { delete it.esgotado; });
    });
    renderEstoque();
    toast('Tudo marcado como disponível.');
  });


  /* =========================================================================
     ACESSO DA EQUIPE
     -------------------------------------------------------------------------
     ATENCAO: isto e uma tranca simples, NAO e seguranca de verdade.
     Como o site e estatico, nao existe login de verdade: o codigo guarda so
     o resumo (hash) do usuario e da senha. Serve para evitar que alguem mexa
     por engano, nao para impedir quem realmente queira entrar.
     Isso nao e um risco: este painel nao altera o site publicado. Ele so
     monta o arquivo que o Marcio decide colar no GitHub.
     ========================================================================= */

  // Só o resumo (SHA-256) de "usuário|senha" fica no código, nunca o texto.
  var ACESSO_SAL = 'essencia-admin-v1:';
  var ACESSO_HASH = '2e3562c037d2f51be92be59c5905c293b9ccc642cd1402596fe5183a09731210';
  function resumo(txt) {
    var dados = new TextEncoder().encode(ACESSO_SAL + txt);
    return crypto.subtle.digest('SHA-256', dados).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  var telaLogin = $('#login-screen');
  var alvosBloqueio = [$('.stickytop'), $('main'), $('#addbar')];

  function bloquear(sim) {
    document.body.classList.toggle('travado', sim);
    alvosBloqueio.forEach(function (el) {
      if (!el) return;
      if (sim) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
  }

  function entrar() {
    telaLogin.remove();
    bloquear(false);
    try { sessionStorage.setItem('essencia-acesso', '1'); } catch (e) {}
    toast('Bem-vindo! Lembre de Salvar e Publicar ao terminar.');
  }

  function jaEntrou() {
    try { return sessionStorage.getItem('essencia-acesso') === '1'; } catch (e) { return false; }
  }

  $('#login-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var u = $('#login-user').value.trim().toLowerCase().replace(/\s+/g, ' ');
    var p = $('#login-pass').value;
    var erro = $('#login-erro');

    if (!(window.crypto && crypto.subtle && window.TextEncoder)) {
      erro.textContent = 'Abra o painel pelo link do site (https). Aberto como arquivo, o navegador não confere a senha.';
      erro.classList.add('show');
      return;
    }
    resumo(u + '|' + p).then(function (h) {
      if (h === ACESSO_HASH) { entrar(); return; }
      erro.textContent = 'Usuário ou senha incorretos. Confira e tente de novo.';
      erro.classList.add('show');
      $('#login-pass').value = '';
      $('#login-pass').focus();
    });
  });

  $('#ver-senha').addEventListener('click', function () {
    var campo = $('#login-pass');
    var mostrando = campo.type === 'text';
    campo.type = mostrando ? 'password' : 'text';
    this.textContent = mostrando ? 'Mostrar' : 'Ocultar';
    this.setAttribute('aria-pressed', String(!mostrando));
    campo.focus();
  });

  $('#btn-sair').addEventListener('click', function () {
    if (!window.confirm('Sair do painel? Alterações não salvas serão perdidas.')) return;
    try { sessionStorage.removeItem('essencia-acesso'); } catch (e) {}
    location.reload();
  });

  renderTudo();
  irPara('pizzas');

  if (jaEntrou()) {
    telaLogin.remove();
  } else {
    bloquear(true);
    $('#login-user').focus();
  }
})();
