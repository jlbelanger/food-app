describe('diary', () => {
	before(() => {
		cy.login();
	});

	describe('navigation', () => {
		it('works', () => {
			cy.visit('/');
			cy.get('#previous').should('be.visible');
			cy.get('#next').should('not.be.visible');
			cy.get('#previous').click();
			cy.get('#previous').should('be.visible');
			cy.get('#next').should('be.visible');
			cy.get('#next').click();
			cy.get('#previous').should('be.visible');
			cy.get('#next').should('not.be.visible');

			cy.visit('/?date=2001-01-01');
			cy.get('h1').should('have.text', 'Mon, Jan 1, 2001');

			cy.get('#previous').click();
			cy.get('h1').should('have.text', 'Sun, Dec 31, 2000');
			cy.location('pathname').should('eq', '/');
			cy.location('search').should('eq', '?date=2000-12-31');

			cy.get('#next').click();
			cy.get('h1').should('have.text', 'Mon, Jan 1, 2001');
			cy.location('search').should('eq', '?date=2001-01-01');

			cy.get('#next').click();
			cy.get('h1').should('have.text', 'Tue, Jan 2, 2001');
			cy.location('search').should('eq', '?date=2001-01-02');
		});
	});

	describe('extras', () => {
		it('works', () => {
			cy.visit('/');
			cy.get('#diary-table').should('not.exist');

			// Add.
			cy.get('#note').type('Example extra');
			cy.get('#note + button').click();
			cy.contains('Extra added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#diary-table').should('be.visible');
			cy.get('input[id^="note-"]').should('have.value', 'Example extra');

			// TODO: Edit notes, trackables.

			// Delete.
			cy.get('.button--remove').click();
			cy.contains('Extra removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('input[id^="note-"]').should('not.exist');
			cy.get('#diary-table').should('not.exist');
			cy.visit('/');
			cy.get('#diary-table').should('not.exist');

			// TODO: Add then refresh.
			// TODO: Edit then refresh.
		});
	});

	describe('weight', () => {
		before(() => {
			cy.intercept('GET', '**/api/weights?**').as('getWeight');
			cy.intercept('POST', '**/api/weights').as('addWeight');
			cy.intercept('PUT', '**/api/weights/*').as('editWeight');
			cy.intercept('DELETE', '**/api/weights/*').as('deleteWeight');

			// Remove weight.
			cy.visit('/');
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight')
				.then(($el) => {
					if ($el.val()) {
						cy.get('#weight').clear();
						cy.get('#weight-form button').click();
						cy.contains('Weight removed successfully.').should('exist');
						cy.get('.formosa-toast__close').click();
					}
				});
		});

		it('works', () => {
			cy.visit('/');
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');

			// Add without weight.
			cy.get('#weight-form button').click();
			cy.contains('No changes to save.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Add with invalid weight.
			cy.get('#weight').type('a');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 422);
			cy.get('#weight-error').should('have.text', 'The weight must be a number.');
			cy.contains('Error.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Add without weight.
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 422);
			cy.get('#weight-error').should('have.text', 'The weight field is required.');
			cy.contains('Error.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Add.
			cy.get('#weight').type('11');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.contains('Weight saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Edit.
			cy.get('#weight').clear().type('22');
			cy.get('#weight-form button').click();
			cy.wait('@editWeight').its('response.statusCode').should('equal', 200);
			cy.contains('Weight saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Delete.
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.contains('Weight removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Add then refresh.
			cy.visit('/');
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');
			cy.get('#weight').type('33');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.contains('Weight saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.reload();
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '33');

			// Edit then refresh.
			cy.get('#weight').clear().type('44');
			cy.get('#weight-form button').click();
			cy.wait('@editWeight').its('response.statusCode').should('equal', 200);
			cy.contains('Weight saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.reload();
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '44');
			cy.get('#weight-form button').click();
			cy.contains('No changes to save.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Delete then refresh.
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.contains('Weight removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.reload();
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');

			// Add then delete then add.
			cy.visit('/');
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').type('55');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.contains('Weight saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.contains('Weight removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#weight').type('66');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.contains('Weight saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.reload();
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '66');

			// Add then check profile.
			cy.get('.nav__link').contains('Profile').click();
			cy.get('[id="weight.weight"]').should('have.value', '66');

			// Delete then check profile.
			cy.get('.nav__link').contains('Diary').click();
			cy.wait('@getWeight').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '66');
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.contains('Weight removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('.nav__link').contains('Profile').click();
			cy.get('[id="weight.weight"]').should('have.value', '');
		});
	});

	describe('food', () => {
		describe('when filtering by favourites', () => {
			it('works', () => {
				// TODO.
			});
		});

		describe('when adding food', () => {
			it('works', () => {
				// TODO.
			});
		});

		describe('when editing food', () => {
			it('works', () => {
				// TODO.
			});
		});

		describe('when removing food', () => {
			it('works', () => {
				// TODO.
			});
		});
	});

	describe('meals', () => {
		describe('when adding meal', () => {
			it('works', () => {
				// TODO.
			});
		});
	});
});
