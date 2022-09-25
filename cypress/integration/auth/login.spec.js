describe('login', () => {
	describe('with an invalid username', () => {
		it('shows an error', () => {
			cy.clearCookies();
			cy.visit('/');
			cy.get('[name="username"]').type('doesnotexist');
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.intercept('POST', '**/api/auth/login').as('login');
			cy.get('[type="submit"]').click();
			cy.wait('@login').its('response.statusCode').should('equal', 401);
			cy.get('.formosa-message--error').invoke('text').should('equal', 'Username or password is incorrect.');
		});
	});

	describe('with an invalid password', () => {
		it('shows an error', () => {
			cy.clearCookies();
			cy.visit('/');
			cy.get('[name="username"]').type(Cypress.env('default_username'));
			cy.get('[name="password"]').type('wrongpassword');
			cy.intercept('POST', '**/api/auth/login').as('login');
			cy.get('[type="submit"]').click();
			cy.wait('@login').its('response.statusCode').should('equal', 401);
			cy.get('.formosa-message--error').invoke('text').should('equal', 'Username or password is incorrect.');
		});
	});

	describe('with a valid username and password', () => {
		it('works', () => {
			cy.intercept('DELETE', '**/api/auth/logout').as('logout');

			// Login.
			cy.clearCookies();
			cy.visit('/');
			cy.get('[name="username"]').type(Cypress.env('default_username'));
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.intercept('POST', '**/api/auth/login').as('login');
			cy.get('[type="submit"]').click();
			cy.wait('@login').its('response.statusCode').should('equal', 200);
			cy.location('pathname').should('eq', '/');

			// Logout.
			cy.get('.nav__link').contains('Profile').click();
			cy.get('.nav__button').contains('Logout').click();
			cy.wait('@logout').its('response.statusCode').should('equal', 204);
			cy.location('pathname').should('eq', '/');
		});
	});
});
