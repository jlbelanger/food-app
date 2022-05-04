import './commands';

beforeEach(() => {
	Cypress.Cookies.preserveOnce('food_id', 'food_token');
});

Cypress.Commands.add('login', () => {
	cy.clearCookies();
	cy.visit('/');
	cy.get('[name="username"]').type(Cypress.env('default_username'));
	cy.get('[name="password"]').type(Cypress.env('default_password'));
	cy.intercept('POST', '**/api/auth/login').as('login');
	cy.get('[type="submit"]').click();
	cy.wait('@login').its('response.statusCode').should('be.oneOf', [200]);
});
