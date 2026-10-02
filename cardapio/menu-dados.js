/* ===========================================================================
   ESSENCIA PIZZARIA — DADOS DO CARDAPIO
   ---------------------------------------------------------------------------
   Este arquivo guarda TODO o cardapio: pizzas, precos, ingredientes,
   adicionais, bordas e o montador "Crie sua pizza".

   NAO precisa editar na mao. Abra  admin.html  no celular, mexa no que quiser
   e o painel gera este arquivo pronto para voce substituir no GitHub.
   =========================================================================== */

window.MENU_ESSENCIA = {
  "versao": "2026-10-01",
  "observacao": "Este arquivo guarda TODO o cardapio. Edite pelo painel do celular (admin.html) e substitua este arquivo no GitHub.",
  "pizzas": [
    {
      "id": "abobrinha",
      "nome": "Abobrinha",
      "preco": 71,
      "tag": "Vegetariana",
      "cor": "#1d7247",
      "descricao": "Abobrinha em fatias finas com palmito e tomate seco.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "180 g"
        ],
        [
          "Abobrinha",
          "120 g"
        ],
        [
          "Palmito",
          "80 g"
        ],
        [
          "Tomate seco",
          "50 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "atum",
      "nome": "Atum",
      "preco": 72.9,
      "tag": "Do mar",
      "cor": "#0b5fb0",
      "descricao": "Atum sólido com cebola em tiras, sem queijo.",
      "alergenos": [
        "peixe",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Atum",
          "200 g"
        ],
        [
          "Cebola",
          "60 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "atum-especial",
      "nome": "Atum Especial",
      "preco": 80,
      "tag": "Do mar",
      "cor": "#0b5fb0",
      "descricao": "Atum e cebola sobre uma camada de muçarela.",
      "alergenos": [
        "peixe",
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Atum",
          "180 g"
        ],
        [
          "Cebola",
          "50 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "bacon",
      "nome": "Bacon",
      "preco": 69.9,
      "tag": "Clássica",
      "cor": "#c8402f",
      "descricao": "Bacon em cubos dourados com muçarela e tomate.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "180 g"
        ],
        [
          "Bacon",
          "150 g"
        ],
        [
          "Tomate",
          "80 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "brocolis",
      "nome": "Brócolis",
      "preco": 75,
      "tag": "Cremosa",
      "cor": "#1d7247",
      "descricao": "Brócolis com bacon, alho frito e catupiry.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Brócolis",
          "130 g"
        ],
        [
          "Bacon",
          "90 g"
        ],
        [
          "Alho frito",
          "20 g"
        ],
        [
          "Catupiry",
          "100 g"
        ]
      ]
    },
    {
      "id": "caipira",
      "nome": "Caipira",
      "preco": 78,
      "tag": "Cremosa",
      "cor": "#f2b632",
      "descricao": "Frango desfiado com catupiry e milho.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Frango desfiado",
          "170 g"
        ],
        [
          "Catupiry",
          "100 g"
        ],
        [
          "Milho",
          "60 g"
        ]
      ]
    },
    {
      "id": "calabresa",
      "nome": "Calabresa",
      "preco": 53.9,
      "tag": "Clássica",
      "cor": "#c8402f",
      "descricao": "Calabresa fatiada com cebola, sem queijo.",
      "alergenos": [
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Calabresa",
          "180 g"
        ],
        [
          "Cebola",
          "60 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "calabresa-especial",
      "nome": "Calabresa Especial",
      "preco": 65.9,
      "tag": "Clássica",
      "cor": "#c8402f",
      "descricao": "Calabresa e cebola sobre camada de muçarela.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "160 g"
        ],
        [
          "Calabresa",
          "160 g"
        ],
        [
          "Cebola",
          "50 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "camarao",
      "nome": "Camarão",
      "preco": 85.9,
      "tag": "Do mar",
      "cor": "#0b5fb0",
      "descricao": "Camarão temperado com muçarela e catupiry.",
      "alergenos": [
        "crustaceo",
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Camarão",
          "160 g"
        ],
        [
          "Catupiry",
          "100 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "cubana",
      "nome": "Cubana",
      "preco": 80,
      "tag": "Completa",
      "cor": "#744a91",
      "descricao": "Atum, bacon e tomate sobre muçarela.",
      "alergenos": [
        "peixe",
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Atum",
          "150 g"
        ],
        [
          "Bacon",
          "90 g"
        ],
        [
          "Tomate",
          "70 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "frango-catupiry",
      "nome": "Frango com Catupiry",
      "preco": 85,
      "tag": "Cremosa",
      "cor": "#f2b632",
      "descricao": "Frango desfiado, catupiry e alho frito.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Frango desfiado",
          "180 g"
        ],
        [
          "Catupiry",
          "110 g"
        ],
        [
          "Alho frito",
          "20 g"
        ]
      ]
    },
    {
      "id": "lombo-canadense",
      "nome": "Lombo Canadense",
      "preco": 82,
      "tag": "Especial",
      "cor": "#744a91",
      "descricao": "Lombo canadense com palmito e champignon.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "160 g"
        ],
        [
          "Lombo canadense",
          "150 g"
        ],
        [
          "Palmito",
          "80 g"
        ],
        [
          "Champignon",
          "70 g"
        ]
      ]
    },
    {
      "id": "marguerita",
      "nome": "Marguerita",
      "preco": 68,
      "tag": "Fresca",
      "cor": "#1d7247",
      "descricao": "Muçarela, parmesão, tomate e manjericão fresco.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "200 g"
        ],
        [
          "Parmesão",
          "40 g"
        ],
        [
          "Tomate",
          "90 g"
        ],
        [
          "Manjericão",
          "8 folhas"
        ]
      ]
    },
    {
      "id": "milho",
      "nome": "Milho",
      "preco": 65,
      "tag": "Sabor suave",
      "cor": "#f2b632",
      "descricao": "Milho verde com muçarela. Sabor suave e previsível.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "200 g"
        ],
        [
          "Milho",
          "120 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "mucarela",
      "nome": "Muçarela",
      "preco": 65,
      "tag": "Sabor suave",
      "cor": "#f2b632",
      "descricao": "Receita simples, conhecida e fácil de personalizar.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "250 g"
        ],
        [
          "Tomate",
          "80 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "essencia",
      "nome": "Essência",
      "preco": 65,
      "tag": "Da casa",
      "cor": "#1d7247",
      "descricao": "Nossa pizza da casa: calabresa com cebola caramelizada.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "170 g"
        ],
        [
          "Calabresa",
          "150 g"
        ],
        [
          "Cebola caramelizada",
          "70 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "palmito",
      "nome": "Palmito",
      "preco": 73,
      "tag": "Vegetariana",
      "cor": "#1d7247",
      "descricao": "Palmito em rodelas com muçarela e cebola.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "180 g"
        ],
        [
          "Palmito",
          "150 g"
        ],
        [
          "Cebola",
          "50 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "pepperoni",
      "nome": "Pepperoni",
      "preco": 92,
      "tag": "Intensa",
      "cor": "#c8402f",
      "descricao": "Pepperoni fatiado sobre muçarela e molho da casa.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "200 g"
        ],
        [
          "Pepperoni",
          "150 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "portuguesa",
      "nome": "Portuguesa",
      "preco": 75,
      "tag": "Completa",
      "cor": "#0b5fb0",
      "descricao": "Presunto, ovo, cebola e ervilha sobre muçarela.",
      "alergenos": [
        "leite",
        "ovo",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "180 g"
        ],
        [
          "Presunto",
          "120 g"
        ],
        [
          "Ovo cozido",
          "2 unidades"
        ],
        [
          "Cebola",
          "50 g"
        ],
        [
          "Ervilha",
          "50 g"
        ]
      ]
    },
    {
      "id": "toscana",
      "nome": "Toscana",
      "preco": 65.9,
      "tag": "Clássica",
      "cor": "#c8402f",
      "descricao": "Calabresa moída com muçarela e cebola.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "170 g"
        ],
        [
          "Calabresa moída",
          "170 g"
        ],
        [
          "Cebola",
          "50 g"
        ],
        [
          "Orégano",
          "2 g"
        ]
      ]
    },
    {
      "id": "4-queijos",
      "nome": "4 Queijos",
      "preco": 78,
      "tag": "Cremosa",
      "cor": "#744a91",
      "descricao": "Muçarela, catupiry, parmesão e gorgonzola.",
      "alergenos": [
        "leite",
        "gluten"
      ],
      "ingredientes": [
        [
          "Molho de tomate",
          "90 g"
        ],
        [
          "Muçarela",
          "150 g"
        ],
        [
          "Catupiry",
          "90 g"
        ],
        [
          "Parmesão",
          "50 g"
        ],
        [
          "Gorgonzola",
          "60 g"
        ]
      ]
    }
  ],
  "adicionais": [
    {
      "nome": "Muçarela extra",
      "preco": 8,
      "alergenos": [
        "leite"
      ]
    },
    {
      "nome": "Catupiry",
      "preco": 10,
      "alergenos": [
        "leite"
      ]
    },
    {
      "nome": "Cheddar",
      "preco": 10,
      "alergenos": [
        "leite"
      ]
    },
    {
      "nome": "Bacon",
      "preco": 12,
      "alergenos": []
    },
    {
      "nome": "Milho",
      "preco": 4,
      "alergenos": []
    },
    {
      "nome": "Tomate",
      "preco": 4,
      "alergenos": []
    },
    {
      "nome": "Cebola",
      "preco": 3,
      "alergenos": []
    },
    {
      "nome": "Azeitonas",
      "preco": 5,
      "alergenos": []
    },
    {
      "nome": "Champignon",
      "preco": 9,
      "alergenos": []
    },
    {
      "nome": "Palmito",
      "preco": 9,
      "alergenos": []
    }
  ],
  "bordas": [
    {
      "nome": "Tradicional",
      "preco": 0,
      "detalhe": "Sem acréscimo",
      "alergenos": []
    },
    {
      "nome": "Catupiry",
      "preco": 10,
      "detalhe": "Borda recheada",
      "alergenos": [
        "leite"
      ]
    },
    {
      "nome": "Cheddar",
      "preco": 12,
      "detalhe": "Borda recheada",
      "alergenos": [
        "leite"
      ]
    },
    {
      "nome": "Chocolate",
      "preco": 12,
      "detalhe": "Borda doce",
      "alergenos": [
        "leite",
        "soja"
      ]
    }
  ],
  "massas": [
    {
      "nome": "Fina",
      "detalhe": "Mais crocante"
    },
    {
      "nome": "Tradicional",
      "detalhe": "Equilíbrio de maciez"
    },
    {
      "nome": "Alta",
      "detalhe": "Mais macia"
    }
  ],
  "pontos": [
    {
      "nome": "Clara",
      "detalhe": "Menos tostada"
    },
    {
      "nome": "No ponto",
      "detalhe": "Assamento padrão"
    },
    {
      "nome": "Bem assada",
      "detalhe": "Mais dourada e crocante"
    }
  ],
  "montagem": {
    "precoBase": 45,
    "descricaoBase": "Massa Essência, molho da casa e 8 fatias. A partir daí, tudo é escolha sua.",
    "grupos": [
      {
        "id": "base",
        "titulo": "Molho da base",
        "descricao": "Escolha uma opção. Já está incluída no preço inicial.",
        "tipo": "unico",
        "itens": [
          {
            "nome": "Molho de tomate da casa",
            "preco": 0,
            "alergenos": []
          },
          {
            "nome": "Molho branco",
            "preco": 6,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Azeite e alho",
            "preco": 4,
            "alergenos": []
          },
          {
            "nome": "Sem molho",
            "preco": 0,
            "alergenos": []
          }
        ]
      },
      {
        "id": "queijos",
        "titulo": "Queijos",
        "descricao": "Pode repetir o mesmo queijo para deixar mais forte.",
        "tipo": "quantidade",
        "maximo": 3,
        "itens": [
          {
            "nome": "Muçarela",
            "preco": 8,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Catupiry",
            "preco": 10,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Cheddar",
            "preco": 10,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Parmesão",
            "preco": 8,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Gorgonzola",
            "preco": 12,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Provolone",
            "preco": 10,
            "alergenos": [
              "leite"
            ]
          }
        ]
      },
      {
        "id": "carnes",
        "titulo": "Carnes",
        "descricao": "Escolha quantas quiser ou deixe sem nenhuma.",
        "tipo": "quantidade",
        "maximo": 3,
        "itens": [
          {
            "nome": "Calabresa",
            "preco": 10,
            "alergenos": []
          },
          {
            "nome": "Calabresa moída",
            "preco": 10,
            "alergenos": []
          },
          {
            "nome": "Bacon",
            "preco": 12,
            "alergenos": []
          },
          {
            "nome": "Frango desfiado",
            "preco": 12,
            "alergenos": []
          },
          {
            "nome": "Presunto",
            "preco": 9,
            "alergenos": []
          },
          {
            "nome": "Pepperoni",
            "preco": 16,
            "alergenos": []
          },
          {
            "nome": "Lombo canadense",
            "preco": 14,
            "alergenos": []
          },
          {
            "nome": "Atum",
            "preco": 16,
            "alergenos": [
              "peixe"
            ]
          },
          {
            "nome": "Camarão",
            "preco": 22,
            "alergenos": [
              "crustaceo"
            ]
          }
        ]
      },
      {
        "id": "vegetais",
        "titulo": "Vegetais e legumes",
        "descricao": "Sabores mais leves e texturas mais previsíveis.",
        "tipo": "quantidade",
        "maximo": 3,
        "itens": [
          {
            "nome": "Tomate",
            "preco": 4,
            "alergenos": []
          },
          {
            "nome": "Tomate seco",
            "preco": 9,
            "alergenos": []
          },
          {
            "nome": "Cebola",
            "preco": 3,
            "alergenos": []
          },
          {
            "nome": "Cebola caramelizada",
            "preco": 6,
            "alergenos": []
          },
          {
            "nome": "Milho",
            "preco": 4,
            "alergenos": []
          },
          {
            "nome": "Ervilha",
            "preco": 4,
            "alergenos": []
          },
          {
            "nome": "Palmito",
            "preco": 9,
            "alergenos": []
          },
          {
            "nome": "Champignon",
            "preco": 9,
            "alergenos": []
          },
          {
            "nome": "Brócolis",
            "preco": 7,
            "alergenos": []
          },
          {
            "nome": "Abobrinha",
            "preco": 6,
            "alergenos": []
          },
          {
            "nome": "Pimentão",
            "preco": 4,
            "alergenos": []
          },
          {
            "nome": "Azeitonas",
            "preco": 5,
            "alergenos": []
          },
          {
            "nome": "Rúcula",
            "preco": 6,
            "alergenos": []
          }
        ]
      },
      {
        "id": "finalizacao",
        "titulo": "Finalizações",
        "descricao": "O toque final, colocado depois de assar.",
        "tipo": "quantidade",
        "maximo": 2,
        "itens": [
          {
            "nome": "Orégano",
            "preco": 0,
            "alergenos": []
          },
          {
            "nome": "Manjericão fresco",
            "preco": 3,
            "alergenos": []
          },
          {
            "nome": "Alho frito",
            "preco": 5,
            "alergenos": []
          },
          {
            "nome": "Azeite",
            "preco": 0,
            "alergenos": []
          },
          {
            "nome": "Parmesão ralado",
            "preco": 6,
            "alergenos": [
              "leite"
            ]
          },
          {
            "nome": "Ovo cozido",
            "preco": 5,
            "alergenos": [
              "ovo"
            ]
          }
        ]
      }
    ]
  },
  "receitaBase": {
    "massa": [
      "Farinha de trigo — 250 g",
      "Água — 155 ml",
      "Fermento biológico — 4 g",
      "Azeite — 10 ml",
      "Açúcar — 5 g",
      "Sal — 5 g"
    ],
    "passos": [
      "Misturar e sovar a massa até ficar lisa.",
      "Descansar até crescer e abrir na espessura escolhida.",
      "Adicionar o molho e somente os ingredientes confirmados.",
      "Assar conforme o ponto escolhido e revisar a observação antes de servir."
    ]
  }
};
