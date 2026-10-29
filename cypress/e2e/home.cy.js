describe('Exercícios Cypress — Doce Gestão', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('02 — abre a página inicial e exibe Doce Gestão', () => {
    cy.contains('Doce Gest').should('be.visible');
  });

  it('03 — navega pelos módulos do menu', () => {
    [
      ['Estoque', '/produtos'],
      ['Clientes', '/clientes'],
      ['Pedidos', '/pedidos'],
      ['Fretes', '/entregas'],
    ].forEach(([link, path]) => {
      cy.visit('/');
      cy.contains('nav a', link).click();
      cy.url().should('include', path);
    });
  });

  it('04 — mostra a tabela, registros e cabeçalhos de produtos', () => {
    cy.visit('/produtos');
    cy.get('.table-wrap table').should('exist');
    cy.get('.table-wrap table tr').should('have.length.greaterThan', 1);
    cy.get('th').then(($headers) => {
      const text = $headers.text().toLowerCase();
      expect(text).to.include('produto');
      expect(text).to.include('categoria');
      expect(text).to.include('estoque');
      expect(text).to.match(/pre/);
    });
  });

  it('05 — abre o formulário de novo produto', () => {
    cy.visit('/produtos');
    cy.contains('a', 'Novo produto').click();
    cy.url().should('include', '/produtos/create');
    ['name', 'category', 'price', 'stock', 'minimum_stock'].forEach((name) => {
      cy.get(`[name="${name}"]`).should('exist');
    });
  });

  it('07 — cadastra produto e volta para a listagem com sucesso', () => {
    cy.fixture('produto').then((produto) => {
      cy.criarProduto({ ...produto, name: `${produto.name} exercício 07` });
      cy.contains(`${produto.name} exercício 07`).should('be.visible');
      cy.contains('Produto cadastrado com sucesso.').should('be.visible');
    });
  });

  it('08 — mostra erros ao enviar o formulário de produto vazio', () => {
    cy.visit('/produtos/create');
    cy.get('form').invoke('attr', 'novalidate', 'novalidate');
    cy.get('button').contains('Salvar').click();
    cy.contains('Revise os campos:').should('be.visible');
    cy.get('.alert li').should('have.length.at.least', 5);
  });

  it('09a — rejeita preço negativo', () => {
    cy.visit('/produtos/create');
    cy.get('form').invoke('attr', 'novalidate', 'novalidate');
    cy.preencherProduto({ name: 'Preço negativo', category: 'Bolos', price: -1, stock: 2, minimum_stock: 0 });
    cy.get('button').contains('Salvar').click();
    cy.contains('Revise os campos:').should('be.visible');
  });

  it('09b — rejeita estoque negativo', () => {
    cy.visit('/produtos/create');
    cy.get('form').invoke('attr', 'novalidate', 'novalidate');
    cy.preencherProduto({ name: 'Estoque negativo', category: 'Bolos', price: 1, stock: -1, minimum_stock: 0 });
    cy.get('button').contains('Salvar').click();
    cy.contains('Revise os campos:').should('be.visible');
  });

  it('09c — campo numérico não aceita texto', () => {
    cy.visit('/produtos/create');
    cy.get('[name="price"]').invoke('val', 'abc').trigger('input').should('have.value', '');
  });

  it('10 — edita o preço de um produto existente', () => {
    cy.criarProduto({ name: 'Produto para editar', category: 'Doces', price: 10, stock: 12, minimum_stock: 2 });
    cy.contains('tr', 'Produto para editar').contains('Editar').click();
    cy.get('[name="price"]').clear().type('19.50');
    cy.get('button').contains('Salvar').click();
    cy.contains('Produto atualizado com sucesso.').should('be.visible');
    cy.contains('tr', 'Produto para editar').should('contain', '19,50');
  });

  it('11 — exclui um produto de teste', () => {
    cy.criarProduto({ name: 'Produto para excluir', category: 'Doces', price: 5, stock: 3, minimum_stock: 1 });
    cy.on('window:confirm', () => true);
    cy.contains('tr', 'Produto para excluir').contains('Excluir').click();
    cy.contains('Produto para excluir').should('not.exist');
  });

  it('12 — cria, edita e exclui um cliente com contato e endereço', () => {
    cy.criarCliente({ name: 'Cliente CRUD', email: 'crud@example.com', phone: '11999990000', address: 'Rua A, 1', city: 'Santos' });
    cy.contains('tr', 'Cliente CRUD').contains('Editar').click();
    cy.get('[name="phone"]').clear().type('11911112222');
    cy.get('button').contains('Salvar').click();
    cy.contains('tr', 'Cliente CRUD').should('contain', '11911112222');
    cy.on('window:confirm', () => true);
    cy.contains('tr', 'Cliente CRUD').contains('Excluir').click();
    cy.contains('Cliente CRUD').should('not.exist');
  });

  it('13 — sinaliza estoque abaixo do mínimo e não sinaliza estoque suficiente', () => {
    cy.criarProduto({ name: 'Estoque baixo Cypress', category: 'Bolos', price: 8, stock: 1, minimum_stock: 4 });
    cy.contains('tr', 'Estoque baixo Cypress').find('small.badge').should('have.attr', 'style').and('include', '#ffe0d7');
    cy.criarProduto({ name: 'Estoque normal Cypress', category: 'Bolos', price: 8, stock: 8, minimum_stock: 4 });
    cy.contains('tr', 'Estoque normal Cypress').find('small.badge').should('not.have.attr', 'style', 'background:#ffe0d7');
  });

  it('14 — preenche produto e cliente com fixtures JSON', () => {
    cy.fixture('produto').then((produto) => {
      cy.criarProduto({ ...produto, name: `${produto.name} fixture` });
    });
    cy.fixture('cliente').then((cliente) => {
      cy.criarCliente({ ...cliente, name: `${cliente.name} fixture` });
    });
  });

  it('15 — disponibiliza comandos para criar produtos e clientes', () => {
    cy.criarProduto({ name: 'Produto pelo comando', category: 'Doces', price: 7, stock: 10, minimum_stock: 2 });
    cy.contains('Produto pelo comando').should('be.visible');
    cy.criarCliente({ name: 'Cliente pelo comando', email: 'comando@example.com', phone: '11900000000', address: 'Rua B', city: 'Recife' });
    cy.contains('Cliente pelo comando').should('be.visible');
  });

  it('16 — pagina uma listagem com mais de dez produtos', () => {
    Cypress._.times(11, (index) => {
      cy.criarProduto({ name: `Produto paginação ${index}`, category: 'Doces', price: 3, stock: 20, minimum_stock: 1 });
    });
    cy.visit('/produtos');
    cy.get('.table-wrap tr').eq(1).invoke('text').as('primeiroRegistro');
    cy.get('a[rel="next"]').click();
    cy.get('@primeiroRegistro').then((primeiroRegistro) => {
      cy.get('.table-wrap tr').eq(1).should(($registro) => {
        expect($registro.text()).not.to.equal(primeiroRegistro);
      });
    });
    cy.get('a[rel="prev"]').click();
    cy.url().should('not.include', 'page=2');
  });

  it('17 — cria pedido e confirma a baixa automática do estoque', () => {
    cy.criarCliente({ name: 'Cliente pedido 17', email: 'pedido17@example.com', phone: '11900000017', address: 'Rua C', city: 'Natal' });
    cy.criarProduto({ name: 'Produto pedido 17', category: 'Bolos', price: 15, stock: 10, minimum_stock: 1 });
    cy.visit('/pedidos/create');
    cy.get('[name="customer_id"] option').contains('Cliente pedido 17').then(($option) => cy.get('[name="customer_id"]').select($option.val()));
    cy.get('[name="product_id"] option').contains('Produto pedido 17').then(($option) => cy.get('[name="product_id"]').select($option.val()));
    cy.get('[name="quantity"]').clear().type('3');
    cy.get('[name="status"]').select('pending');
    cy.get('button').contains('Salvar').click();
    cy.contains('Pedido criado e estoque atualizado.').should('be.visible');
    cy.visit('/pedidos');
    cy.contains('tr', 'Produto pedido 17').should('contain', 'pending');
    cy.visit('/produtos');
    cy.contains('tr', 'Produto pedido 17').should('contain', '7 un.');
  });

  it('18 — rejeita pedido com quantidade maior que o estoque', () => {
    cy.criarCliente({ name: 'Cliente pedido 18', email: 'pedido18@example.com', phone: '11900000018', address: 'Rua D', city: 'Natal' });
    cy.criarProduto({ name: 'Produto pedido 18', category: 'Bolos', price: 15, stock: 2, minimum_stock: 1 });
    cy.visit('/pedidos/create');
    cy.get('[name="customer_id"] option').contains('Cliente pedido 18').then(($option) => cy.get('[name="customer_id"]').select($option.val()));
    cy.get('[name="product_id"] option').contains('Produto pedido 18').then(($option) => cy.get('[name="product_id"]').select($option.val()));
    cy.get('[name="quantity"]').clear().type('3');
    cy.get('[name="status"]').select('pending');
    cy.get('button').contains('Salvar').click();
    cy.contains('Estoque insuficiente para este produto.').should('be.visible');
  });

  it('19 — cadastra frete e atualiza o status até a entrega', () => {
    cy.criarCliente({ name: 'Cliente frete 19', email: 'frete19@example.com', phone: '11900000019', address: 'Rua E', city: 'Natal' });
    cy.criarProduto({ name: 'Produto frete 19', category: 'Bolos', price: 15, stock: 10, minimum_stock: 1 });
    cy.visit('/pedidos/create');
    cy.get('[name="customer_id"] option').contains('Cliente frete 19').then(($option) => cy.get('[name="customer_id"]').select($option.val()));
    cy.get('[name="product_id"] option').contains('Produto frete 19').then(($option) => cy.get('[name="product_id"]').select($option.val()));
    cy.get('[name="quantity"]').clear().type('1');
    cy.get('[name="status"]').select('pending');
    cy.get('button').contains('Salvar').click();
    cy.visit('/entregas/create');
    cy.get('[name="order_id"] option').should('have.length.greaterThan', 1).last().then(($option) => cy.get('[name="order_id"]').select($option.val()));
    cy.get('[name="address"]').type('Rua E, 10');
    cy.get('[name="city"]').type('Natal');
    cy.get('[name="fee"]').clear().type('12.50');
    cy.get('[name="scheduled_at"]').type('2027-01-10');
    cy.get('[name="tracking_code"]').type('CYPRESS19');
    cy.get('button').contains('Salvar').click();
    cy.visit('/entregas');
    cy.contains('CYPRESS19').should('be.visible');
    cy.contains('tr', 'CYPRESS19').contains('Editar').click();
    cy.get('[name="status"]').select('in_transit');
    cy.get('button').contains('Salvar').click();
    cy.visit('/entregas');
    cy.contains('in_transit').should('be.visible');
    cy.contains('tr', 'CYPRESS19').contains('Editar').click();
    cy.get('[name="status"]').select('delivered');
    cy.get('button').contains('Salvar').click();
    cy.visit('/entregas');
    cy.contains('delivered').should('be.visible');
  });

  it('20 — intercepta a criação do pedido e completa o fluxo até o frete', () => {
    cy.criarCliente({ name: 'Cliente E2E 20', email: 'e2e20@example.com', phone: '11900000020', address: 'Rua F', city: 'Natal' });
    cy.criarProduto({ name: 'Produto E2E 20', category: 'Bolos', price: 15, stock: 10, minimum_stock: 1 });
    cy.intercept('POST', '/pedidos').as('criarPedido');
    cy.visit('/pedidos/create');
    cy.get('[name="customer_id"] option').contains('Cliente E2E 20').then(($option) => cy.get('[name="customer_id"]').select($option.val()));
    cy.get('[name="product_id"] option').contains('Produto E2E 20').then(($option) => cy.get('[name="product_id"]').select($option.val()));
    cy.get('[name="quantity"]').clear().type('2');
    cy.get('[name="status"]').select('confirmed');
    cy.get('button').contains('Salvar').click();
    cy.wait('@criarPedido').its('response.statusCode').should('be.oneOf', [302, 303]);
    cy.visit('/entregas/create');
    cy.get('[name="order_id"] option').should('have.length.greaterThan', 1).last().then(($option) => cy.get('[name="order_id"]').select($option.val()));
    cy.get('[name="address"]').type('Rua F, 20');
    cy.get('[name="city"]').type('Natal');
    cy.get('[name="fee"]').clear().type('9.90');
    cy.get('[name="status"]').select('scheduled');
    cy.get('[name="tracking_code"]').type('E2E-CYPRESS-20');
    cy.get('button').contains('Salvar').click();
    cy.visit('/entregas');
    cy.contains('E2E-CYPRESS-20').should('be.visible');
  });
});
