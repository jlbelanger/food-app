import './commands';

beforeEach(() => {
	Cypress.Cookies.preserveOnce('food_user', 'food_token');
});

Cypress.Commands.add('login', (username, password) => {
	cy.clearCookies();
	cy.visit('/');
	cy.get('[name="username"]').type(username || Cypress.env('default_username'));
	cy.get('[name="password"]').type(password || Cypress.env('default_password'));
	cy.intercept('POST', '**/api/auth/login').as('login');
	cy.get('[type="submit"]').click();
	cy.wait('@login').its('response.statusCode').should('be.oneOf', [200]);
});
