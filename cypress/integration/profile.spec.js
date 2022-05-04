describe('profile', () => {
	before(() => {
		cy.login();
	});

	describe('when changing username', () => {
		describe('with taken username', () => {
			it('shows an error', () => {
				cy.visit('/profile');
				cy.get('[name="username"]').clear().type(Cypress.env('taken_username'));
				cy.intercept('PUT', '**/api/users/*').as('edit');
				cy.get('button').contains('Change username').click();
				cy.wait('@edit').its('response.statusCode').should('equal', 422);
				cy.get('#username-error').invoke('text').should('equal', 'The username has already been taken.');
				cy.reload();
				cy.get(`[name="username"][value="${Cypress.env('default_username')}"]`).should('exist');
			});
		});

		describe('with valid input', () => {
			it('works', () => {
				// Change.
				const name = `${Cypress.env('default_username')}2`;
				cy.visit('/profile');
				cy.get('[name="username"]').clear().type(name);
				cy.intercept('PUT', '**/api/users/*').as('edit');
				cy.get('button').contains('Change username').click();
				cy.wait('@edit').its('response.statusCode').should('equal', 200);
				cy.contains('Username changed successfully.').should('exist');
				cy.reload();
				cy.get(`[name="username"][value="${name}"]`).should('exist');

				// Change back.
				cy.visit('/profile');
				cy.get('[name="username"]').clear().type(Cypress.env('default_username'));
				cy.get('button').contains('Change username').click();
				cy.wait('@edit').its('response.statusCode').should('equal', 200);
				cy.contains('Username changed successfully.').should('exist');
				cy.reload();
				cy.get(`[name="username"][value="${Cypress.env('default_username')}"]`).should('exist');
			});
		});
	});

	describe('when changing email', () => {
		describe('with taken email', () => {
			it('shows an error', () => {
				cy.visit('/profile');
				cy.get('[name="email"]').clear().type(Cypress.env('taken_email'));
				cy.get('#current-password-email').clear().type(Cypress.env('default_password'));
				cy.intercept('PUT', '**/api/users/*/change-email').as('changeEmail');
				cy.get('button').contains('Change email').click();
				cy.wait('@changeEmail').its('response.statusCode').should('equal', 422);
				cy.get('#email-error').invoke('text').should('equal', 'The email has already been taken.');
				cy.reload();
				cy.get(`[name="email"][value="${Cypress.env('default_email')}"]`).should('exist');
			});
		});

		describe('with invalid current password', () => {
			it('shows an error', () => {
				const email = `${Cypress.env('default_email')}2`;
				cy.visit('/profile');
				cy.get('[name="email"]').clear().type(email);
				cy.get('#current-password-email').clear().type('wrongpassword');
				cy.intercept('PUT', '**/api/users/*/change-email').as('changeEmail');
				cy.get('button').contains('Change email').click();
				cy.wait('@changeEmail').its('response.statusCode').should('equal', 422);
				cy.get('#current-password-email-error').invoke('text').should('equal', 'Current password is incorrect.');
				cy.reload();
				cy.get(`[name="email"][value="${Cypress.env('default_email')}"]`).should('exist');
			});
		});

		describe('with valid input', () => {
			it('works', () => {
				// Change.
				const email = `${Cypress.env('default_email')}2`;
				cy.visit('/profile');
				cy.get('[name="email"]').clear().type(email);
				cy.get('#current-password-email').clear().type(Cypress.env('default_password'));
				cy.intercept('PUT', '**/api/users/*/change-email').as('changeEmail');
				cy.get('button').contains('Change email').click();
				cy.wait('@changeEmail').its('response.statusCode').should('equal', 204);
				cy.contains('Email changed successfully.').should('exist');
				cy.reload();
				cy.get(`[name="email"][value="${email}"]`).should('exist');

				// Change back.
				cy.visit('/profile');
				cy.get('[name="email"]').clear().type(Cypress.env('default_email'));
				cy.get('#current-password-email').clear().type(Cypress.env('default_password'));
				cy.get('button').contains('Change email').click();
				cy.wait('@changeEmail').its('response.statusCode').should('equal', 204);
				cy.contains('Email changed successfully.').should('exist');
				cy.reload();
				cy.get(`[name="email"][value="${Cypress.env('default_email')}"]`).should('exist');
			});
		});
	});

	describe('when changing password', () => {
		describe('with non-matching passwords', () => {
			it('shows an error', () => {
				// Change.
				const password = `${Cypress.env('default_password')}2`;
				cy.visit('/profile');
				cy.get('#new_password').clear().type(password);
				cy.get('#new_password_confirmation').clear().type('somethingelse');
				cy.get('#current-password-password').clear().type(Cypress.env('default_password'));
				cy.intercept('PUT', '**/api/users/*/change-password').as('changePassword');
				cy.get('button').contains('Change password').click();
				cy.wait('@changePassword').its('response.statusCode').should('equal', 422);
				cy.get('#new_password-error').invoke('text').should('equal', 'The new password confirmation does not match.');
			});
		});

		describe('with invalid current password', () => {
			it('shows an error', () => {
				// Change.
				const password = `${Cypress.env('default_password')}2`;
				cy.visit('/profile');
				cy.get('#new_password').clear().type(password);
				cy.get('#new_password_confirmation').clear().type(password);
				cy.get('#current-password-password').clear().type('wrongpassword');
				cy.intercept('PUT', '**/api/users/*/change-password').as('changePassword');
				cy.get('button').contains('Change password').click();
				cy.wait('@changePassword').its('response.statusCode').should('equal', 422);
				cy.get('#current-password-password-error').invoke('text').should('equal', 'Current password is incorrect.');
			});
		});

		describe('with valid input', () => {
			it('works', () => {
				// Change.
				const password = `${Cypress.env('default_password')}2`;
				cy.visit('/profile');
				cy.get('#new_password').clear().type(password);
				cy.get('#new_password_confirmation').clear().type(password);
				cy.get('#current-password-password').clear().type(Cypress.env('default_password'));
				cy.intercept('PUT', '**/api/users/*/change-password').as('changePassword');
				cy.get('button').contains('Change password').click();
				cy.wait('@changePassword').its('response.statusCode').should('equal', 204);
				cy.contains('Password changed successfully.').should('exist');

				// Change back.
				cy.visit('/profile');
				cy.get('#new_password').clear().type(Cypress.env('default_password'));
				cy.get('#new_password_confirmation').clear().type(Cypress.env('default_password'));
				cy.get('#current-password-password').clear().type(password);
				cy.get('button').contains('Change password').click();
				cy.wait('@changePassword').its('response.statusCode').should('equal', 204);
				cy.contains('Password changed successfully.').should('exist');
			});
		});
	});
});
