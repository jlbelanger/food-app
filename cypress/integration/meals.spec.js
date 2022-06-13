describe('meals', () => {
	before(() => {
		cy.login();
	});

	it('works', () => {
		const timestamp = (new Date()).getTime();
		cy.intercept('GET', '**/api/meals?*').as('getRecords');
		cy.intercept('GET', '**/api/meals/*').as('getRecord');
		cy.intercept('POST', '**/api/meals').as('postRecord');
		cy.intercept('PUT', '**/api/meals/*').as('putRecord');
		cy.intercept('DELETE', '**/api/meals/*').as('deleteRecord');

		cy.visit('/meals');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);

		// Add.
		cy.get('.formosa-button').contains('Add').click();
		cy.get('[name="name"]').type(`Foobar ${timestamp}`);
		cy.get('#add-another').check();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
		cy.contains('Meal added successfully.').should('exist');
		cy.get('[name="name"]').type(`Barfoo ${timestamp}`);
		cy.get('#add-another').uncheck();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
		cy.contains('Meal added successfully.').should('exist');

		// Search.
		cy.visit('/meals');
		cy.get('#search').type(timestamp);
		cy.get('.table-link').should('have.length', 2);

		// Sort.
		let names = [`Barfoo ${timestamp}`, `Foobar ${timestamp}`];
		cy.get('.table-link').each((item, index) => {
			cy.wrap(item).should('have.text', names[index]);
		})
			.then(() => {
				cy.get('[data-key="name"]').click();
				names = [`Foobar ${timestamp}`, `Barfoo ${timestamp}`];
				cy.get('.table-link').each((item, index) => {
					cy.wrap(item).should('have.text', names[index]);
				});
			});

		// TODO: Favourite/unfavourite from index.

		// Edit.
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('[name="name"]').clear().type(`Bar ${timestamp}`);
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal saved successfully.').should('exist');
		cy.reload();
		cy.get('[name="name"]').invoke('val').should('equal', `Bar ${timestamp}`);

		// Favourite.
		cy.get('.heart').should('have.class', 'favourite');
		cy.get('.heart').should('not.have.class', 'unfavourite');
		cy.get('.heart').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal favourited successfully.').should('exist');
		cy.reload();
		cy.get('.heart').should('not.have.class', 'favourite');
		cy.get('.heart').should('have.class', 'unfavourite');

		// Unfavourite.
		cy.get('.heart').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal unfavourited successfully.').should('exist');
		cy.reload();
		cy.get('.heart').should('have.class', 'favourite');
		cy.get('.heart').should('not.have.class', 'unfavourite');

		// TODO: Add/edit/remove foods.

		// Delete.
		cy.get('.formosa-button').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Meal deleted successfully.').should('exist');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Foobar ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('.formosa-button').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Meal deleted successfully.').should('exist');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).should('not.exist');
		cy.get('.table-link').contains(`Foobar ${timestamp}`).should('not.exist');
	});
});
