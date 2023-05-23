import './commands';

Cypress.Commands.add('login', (username = '', password = '') => {
	username = username || Cypress.env('default_username');
	password = password || Cypress.env('default_password');
	cy.session([username, password], () => {
		const timestamp = (new Date()).getTime();
		cy.visit('/');
		cy.get('[name="username"]').type(username);
		cy.get('[name="password"]').type(password);
		cy.intercept('POST', '**/api/auth/login').as(`login${timestamp}`);
		cy.get('[type="submit"]').click();
		cy.wait(`@login${timestamp}`);
		cy.get('body')
			.then(($body) => {
				if ($body.find('.formosa-alert--error').length > 0) {
					cy.register(username, password);
				}
			});
	});
});

Cypress.Commands.add('register', (username = '', password = '') => {
	cy.visit('/register');
	cy.get('[name="username"]').type(username);
	cy.get('[name="email"]').type(`${username}@example.com`);
	cy.get('[name="password"]').type(password);
	cy.get('[name="password_confirmation"]').type(password);
	cy.intercept('POST', '**/api/auth/register').as('register');
	cy.get('[type="submit"]').click();
	cy.wait('@register').its('response.statusCode').should('equal', 200);
	cy.location('pathname').should('eq', '/');
});
