function preencherProduto(dados) {
  cy.get('[name="name"]').clear().type(dados.name);
  cy.get('[name="category"]').select(dados.category);
  cy.get('[name="description"]').clear().type(dados.description ?? 'Produto criado pelo Cypress');
  cy.get('[name="price"]').clear().type(String(dados.price));
  cy.get('[name="stock"]').clear().type(String(dados.stock));
  cy.get('[name="minimum_stock"]').clear().type(String(dados.minimum_stock));
}

Cypress.Commands.add('criarProduto', (dados) => {
  cy.visit('/produtos/create');
  preencherProduto(dados);
  cy.get('button').contains('Salvar').click();
  cy.url().should('eq', `${Cypress.config('baseUrl')}/produtos`);
});

Cypress.Commands.add('criarCliente', (dados) => {
  cy.visit('/clientes/create');
  cy.get('[name="name"]').clear().type(dados.name);
  cy.get('[name="email"]').clear().type(dados.email);
  cy.get('[name="phone"]').clear().type(dados.phone);
  cy.get('[name="address"]').clear().type(dados.address);
  cy.get('[name="city"]').clear().type(dados.city);
  cy.get('button').contains('Salvar').click();
  cy.url().should('eq', `${Cypress.config('baseUrl')}/clientes`);
});

Cypress.Commands.add('preencherProduto', preencherProduto);
