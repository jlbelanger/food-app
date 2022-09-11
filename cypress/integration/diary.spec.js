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
		before(() => {
			cy.removeEntriesExtras();
		});

		it('works', () => {
			cy.intercept('GET', '**/api/extras?**').as('getExtras');
			cy.intercept('POST', '**/api/extras').as('postExtra');
			cy.intercept('PUT', '**/api/extras/**').as('putExtra');
			cy.intercept('DELETE', '**/api/extras/**').as('deleteExtra');

			// Add.
			cy.visit('/');
			cy.wait('@getExtras').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.get('#note').type('Example extra');
			cy.get('#note + button').click();
			cy.wait('@postExtra').its('response.statusCode').should('equal', 201);
			cy.contains('Extra added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit note and press enter.
			cy.get('#note-0').clear().type('New note{enter}');
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.contains('Extra saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#note-0').should('have.value', 'New note');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit note and blur.
			cy.get('#note-0').clear().type('Another note').blur();
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.contains('Extra saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#note-0').should('have.value', 'Another note');
			cy.get('.column-total--calories').should('have.text', '0');

			// TODO: Edit trackables and press enter.
			// TODO: Edit trackables and blur.

			// Delete.
			cy.get('.button--remove').click();
			cy.wait('@deleteExtra').its('response.statusCode').should('equal', 204);
			cy.contains('Extra removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#diary-table').should('not.exist');
			cy.get('#note-0').should('not.exist');

			// Add then refresh.
			cy.visit('/');
			cy.wait('@getExtras').its('response.statusCode').should('equal', 200);
			cy.get('#note').type('Example extra 2');
			cy.get('#note + button').click();
			cy.wait('@postExtra').its('response.statusCode').should('equal', 201);
			cy.contains('Extra added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra 2');
			cy.reload();
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra 2');

			// Edit note and press enter then refresh.
			cy.get('#note-0').clear().type('New note{enter}');
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.contains('Extra saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.reload();
			cy.wait('@getExtras').its('response.statusCode').should('equal', 200);
			cy.get('#note-0').should('have.value', 'New note');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit note and blur then refresh.
			cy.get('#note-0').clear().type('Another note').blur();
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.contains('Extra saved successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.reload();
			cy.wait('@getExtras').its('response.statusCode').should('equal', 200);
			cy.get('#note-0').should('have.value', 'Another note');
			cy.get('.column-total--calories').should('have.text', '0');

			// TODO: Edit trackables and press enter then refresh.
			// TODO: Edit trackables and blur then refresh.

			// Delete then refresh.
			cy.get('.button--remove').click();
			cy.wait('@deleteExtra').its('response.statusCode').should('equal', 204);
			cy.contains('Extra removed successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('#diary-table').should('not.exist');
			cy.get('#note-0').should('not.exist');
			cy.reload();
			cy.wait('@getExtras').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.get('#note-0').should('not.exist');
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
		before(() => {
			cy.removeEntriesExtras();
		});

		describe('when filtering by favourites', () => {
			it('works', () => {
				// Uncheck by default.
				cy.visit('/');
				cy.get('#search-favourites').uncheck();

				// Create food.
				const timestamp = (new Date()).getTime();
				cy.createFood(`Foo ${timestamp}`, 1, {}, true);
				cy.createFood(`Bar ${timestamp}`, 1, {}, false);

				// With option checked.
				cy.visit('/');
				cy.get('#search-favourites').should('not.be.checked');
				cy.get('#search-favourites').check();
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).should('be.visible');
				cy.get('#food').clear().type(`Bar ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').should('not.exist');

				// With option unchecked.
				cy.visit('/');
				cy.get('#search-favourites').should('be.checked');
				cy.get('#search-favourites').uncheck();
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).should('be.visible');
				cy.get('#food').clear().type(`Bar ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').contains(`Bar ${timestamp}`).should('be.visible');
			});
		});

		describe('when adding/editing/deleting food', () => {
			it('works', () => {
				cy.intercept('GET', '**/api/entries?**').as('getEntries');
				cy.intercept('POST', '**/api/entries').as('postEntry');
				cy.intercept('PUT', '**/api/entries/**').as('putEntry');
				cy.intercept('DELETE', '**/api/entries/**').as('deleteEntry');

				// Create food.
				const timestamp = (new Date()).getTime();
				cy.createFood(`Foo ${timestamp}`, 2, { calories: 100 });

				// Add.
				cy.visit('/');
				cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.contains(`Foo ${timestamp}`).click();
				cy.wait('@postEntry').its('response.statusCode').should('equal', 201);
				cy.contains('Food added successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#diary-table').should('be.visible');
				cy.get('#user_serving_size-0').should('have.value', '2');
				cy.get('.entry .column--calories').should('have.text', '100');
				cy.get('.column-total--calories').should('have.text', '100');

				// Edit serving size and press enter.
				cy.get('#user_serving_size-0').clear().type('1{enter}');
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.contains('Entry saved successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#user_serving_size-0').should('have.value', '1');
				cy.get('.entry .column--calories').should('have.text', '50');
				cy.get('.column-total--calories').should('have.text', '50');

				// Edit serving size and blur.
				cy.get('#user_serving_size-0').clear().type('.5').blur();
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.contains('Entry saved successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#user_serving_size-0').should('have.value', '.5');
				cy.get('.entry .column--calories').should('have.text', '25');
				cy.get('.column-total--calories').should('have.text', '25');

				// Delete.
				cy.get('.button--remove').click();
				cy.wait('@deleteEntry').its('response.statusCode').should('equal', 204);
				cy.contains('Food removed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#diary-table').should('not.exist');
				cy.get('#user_serving_size-0').should('not.exist');

				// Add then refresh.
				cy.visit('/');
				cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.contains(`Foo ${timestamp}`).click();
				cy.wait('@postEntry').its('response.statusCode').should('equal', 201);
				cy.contains('Food added successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('be.visible');
				cy.get('#user_serving_size-0').should('have.value', '2');
				cy.get('.entry .column--calories').should('have.text', '100');
				cy.get('.column-total--calories').should('have.text', '100');

				// Edit serving size and press enter then refresh.
				cy.get('#user_serving_size-0').clear().type('1{enter}');
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.contains('Entry saved successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
				cy.get('#user_serving_size-0').should('have.value', '1');
				cy.get('.entry .column--calories').should('have.text', '50');
				cy.get('.column-total--calories').should('have.text', '50');

				// Edit serving size and blur then refresh.
				cy.get('#user_serving_size-0').clear().type('.5').blur();
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.contains('Entry saved successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
				cy.get('#user_serving_size-0').should('have.value', '0.5');
				cy.get('.entry .column--calories').should('have.text', '25');
				cy.get('.column-total--calories').should('have.text', '25');

				// Delete then refresh.
				cy.get('.button--remove').click();
				cy.wait('@deleteEntry').its('response.statusCode').should('equal', 204);
				cy.contains('Food removed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#user_serving_size-0').should('not.exist');
			});
		});
	});

	describe('meals', () => {
		before(() => {
			cy.removeEntriesExtras();
		});

		it('works', () => {
			cy.intercept('GET', '**/api/meals?**').as('getMeals');

			const timestamp = (new Date()).getTime();
			cy.createFood(`Foo ${timestamp}`, 1);
			cy.createFood(`Bar ${timestamp}`, 2);
			cy.createMeal('Example meal', [`Foo ${timestamp}`, `Bar ${timestamp}`], true);

			cy.visit('/');
			cy.wait('@getMeals').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.contains('Example meal').click();
			cy.get('#diary-table').should('be.visible');
			cy.get('#user_serving_size-0').should('have.value', '1');
			cy.get('[id="user_serving_size-1"]').should('have.value', '2');
		});
	});
});