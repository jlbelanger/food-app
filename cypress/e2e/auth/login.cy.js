describe('login', () => {
	describe('with an invalid username', () => {
		it('shows an error', () => {
			cy.intercept('POST', '**/api/auth/login').as('login');

			cy.clearCookies();
			cy.visit('/');
			cy.get('[name="username"]').type('doesnotexist');
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.get('[type="submit"]').click();
			cy.wait('@login').its('response.statusCode').should('equal', 401);
			cy.get('.formosa-message--error').invoke('text').should('equal', 'Username or password is incorrect.');
		});
	});

	describe('with an invalid password', () => {
		it('shows an error', () => {
			cy.intercept('POST', '**/api/auth/login').as('login');

			cy.clearCookies();
			cy.visit('/');
			cy.get('[name="username"]').type(Cypress.env('default_username'));
			cy.get('[name="password"]').type('wrongpassword');
			cy.get('[type="submit"]').click();
			cy.wait('@login').its('response.statusCode').should('equal', 401);
			cy.get('.formosa-message--error').invoke('text').should('equal', 'Username or password is incorrect.');
		});
	});

	describe('with a valid username and password', () => {
		it('works', () => {
			cy.intercept('POST', '**/api/auth/register').as('register');
			cy.intercept('POST', '**/api/auth/login').as('login');
			cy.intercept('DELETE', '**/api/auth/logout').as('logout');

			// Register.
			const username = `foo+${Date.now()}`;
			cy.clearCookies();
			cy.visit('/register');
			cy.get('[name="username"]').type(username);
			cy.get('[name="email"]').type(`${username}@example.com`);
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.get('[name="password_confirmation"]').type(Cypress.env('default_password'));
			cy.get('[type="submit"]').click();
			cy.wait('@register').its('response.statusCode').should('equal', 200);
			cy.get('.nav__link').contains('Profile').click();
			cy.get('.nav__button').contains('Logout').click();
			cy.wait('@logout').its('response.statusCode').should('equal', 204);
			cy.location('pathname').should('eq', '/');

			// Login.
			cy.clearCookies();
			cy.visit('/');
			cy.get('[name="username"]').type(username);
			cy.get('[name="password"]').type(Cypress.env('default_password'));
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
