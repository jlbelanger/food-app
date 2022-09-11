describe('register', () => {
	describe('with username that is taken', () => {
		it('shows an error', () => {
			cy.clearCookies();
			cy.visit('/register');
			cy.get('[name="username"]').type(Cypress.env('default_username'));
			cy.get('[name="email"]').type(`foo+${Date.now()}@example.com`);
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.get('[name="password_confirmation"]').type(Cypress.env('default_password'));
			cy.intercept('POST', '**/api/auth/register').as('register');
			cy.get('[type="submit"]').click();
			cy.wait('@register').its('response.statusCode').should('equal', 422);
			cy.get('#username-error').invoke('text').should('equal', 'The username has already been taken.');
		});
	});

	describe('with an email that is taken', () => {
		it('shows an error', () => {
			cy.clearCookies();
			cy.visit('/register');
			cy.get('[name="username"]').type(`foo+${Date.now()}`);
			cy.get('[name="email"]').type(Cypress.env('default_email'));
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.get('[name="password_confirmation"]').type(Cypress.env('default_password'));
			cy.intercept('POST', '**/api/auth/register').as('register');
			cy.get('[type="submit"]').click();
			cy.wait('@register').its('response.statusCode').should('equal', 422);
			cy.get('#email-error').invoke('text').should('equal', 'The email has already been taken.');
		});
	});

	describe('with mismatched passwords', () => {
		it('shows an error', () => {
			const username = `foo+${Date.now()}`;
			cy.clearCookies();
			cy.visit('/register');
			cy.get('[name="username"]').type(username);
			cy.get('[name="email"]').type(`${username}@example.com`);
			cy.get('[name="password"]').type('foo1');
			cy.get('[name="password_confirmation"]').type('foo2');
			cy.intercept('POST', '**/api/auth/register').as('register');
			cy.get('[type="submit"]').click();
			cy.wait('@register').its('response.statusCode').should('equal', 422);
			cy.get('#password-error').invoke('text').should('equal', 'The password confirmation does not match.');
		});
	});

	describe('with valid input', () => {
		it('works', () => {
			cy.intercept('GET', '**/api/calendar/**').as('getCalendar');

			const username = `foo+${Date.now()}`;

			// Register.
			cy.clearCookies();
			cy.visit('/register');
			cy.get('[name="username"]').type(username);
			cy.get('[name="email"]').type(`${username}@example.com`);
			cy.get('[name="password"]').type(Cypress.env('default_password'));
			cy.get('[name="password_confirmation"]').type(Cypress.env('default_password'));
			cy.intercept('POST', '**/api/auth/register').as('register');
			cy.get('[type="submit"]').click();
			cy.wait('@register').its('response.statusCode').should('equal', 200);
			cy.location('pathname').should('eq', '/');

			// Set measurement units.
			cy.get('.nav__link').contains('Profile').click();
			cy.get('#height + .formosa-suffix').should('contain', 'centimetres');
			cy.get('[id="weight.weight"] + .formosa-suffix').should('contain', 'kgs');
			cy.get('#measurement_units').select('imperial (weight in pounds, height in inches)');
			cy.get('#height + .formosa-suffix').should('contain', 'inches');
			cy.get('[id="weight.weight"] + .formosa-suffix').should('contain', 'lbs');
			cy.get('#save-bmi').click();
			cy.get('#measurement_units').should('be.disabled');

			// Shows correct weight units on diary.
			cy.get('.nav__link').contains('Diary').click();
			cy.get('#weight + .formosa-suffix').should('contain', 'lbs');

			// Shows correct weight units on calendar.
			cy.setWeight('130.5');
			cy.visit('/calendar');
			cy.wait('@getCalendar').its('response.statusCode').should('equal', 200);
			cy.get('.calendar__item').contains('130.5 lbs').should('be.visible');

			// Delete.
			cy.get('.nav__link').contains('Profile').click();
			cy.get('.formosa-button--danger').click();
			cy.location('pathname').should('eq', '/');
		});
	});
});
