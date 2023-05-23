describe('diary', () => {
	beforeEach(() => {
		cy.login();
		cy.deleteAllData();
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
			cy.removeEntriesExtras();

			cy.intercept('GET', '**/api/date?**').as('getDate');
			cy.intercept('POST', '**/api/extras').as('postExtra');
			cy.intercept('PUT', '**/api/extras/*').as('putExtra');
			cy.intercept('DELETE', '**/api/extras/*').as('deleteExtra');

			// Ensure calories is in trackables.
			cy.setTrackables(['calories']);

			// Add.
			cy.visit('/');
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.get('#note').type('Example extra');
			cy.get('#note + button').click();
			cy.wait('@postExtra').its('response.statusCode').should('equal', 201);
			cy.closeToast('Extra added successfully.');
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit note and press enter.
			cy.get('#note-0').clear().type('New note{enter}');
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.get('#note-0').should('have.value', 'New note');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit note and blur.
			cy.get('#note-0').clear().type('Another note').blur();
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.get('#note-0').should('have.value', 'Another note');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit trackable and press enter.
			cy.get('#calories-0').type('100{enter}');
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.get('#calories-0').should('have.value', '100');
			cy.get('.column-total--calories').should('have.text', '100');

			// Edit trackable and blur.
			cy.get('#calories-0').clear().type('50').blur();
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.get('#calories-0').should('have.value', '50');
			cy.get('.column-total--calories').should('have.text', '50');

			// Delete.
			cy.get('.button--remove').click();
			cy.wait('@deleteExtra').its('response.statusCode').should('equal', 204);
			cy.closeToast('Extra removed successfully.');
			cy.get('#diary-table').should('not.exist');
			cy.get('#note-0').should('not.exist');

			// Add then refresh.
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#note').type('Example extra 2');
			cy.get('#note + button').click();
			cy.wait('@postExtra').its('response.statusCode').should('equal', 201);
			cy.closeToast('Extra added successfully.');
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra 2');
			cy.reload();
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra 2');

			// Edit note and press enter then refresh.
			cy.get('#note-0').clear().type('New note{enter}');
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#note-0').should('have.value', 'New note');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit note and blur then refresh.
			cy.get('#note-0').clear().type('Another note').blur();
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#note-0').should('have.value', 'Another note');
			cy.get('.column-total--calories').should('have.text', '0');

			// Edit trackable and press enter then refresh.
			cy.get('#calories-0').type('100{enter}');
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#calories-0').should('have.value', '100');
			cy.get('.column-total--calories').should('have.text', '100');

			// Edit trackable and blur then refresh.
			cy.get('#calories-0').clear().type('50').blur();
			cy.wait('@putExtra').its('response.statusCode').should('equal', 200);
			cy.closeToast('Extra saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#calories-0').should('have.value', '50');
			cy.get('.column-total--calories').should('have.text', '50');

			// Delete then refresh.
			cy.get('.button--remove').click();
			cy.wait('@deleteExtra').its('response.statusCode').should('equal', 204);
			cy.closeToast('Extra removed successfully.');
			cy.get('#diary-table').should('not.exist');
			cy.get('#note-0').should('not.exist');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.get('#note-0').should('not.exist');

			// Add to other date.
			cy.visit('/?date=2001-01-01');
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#note').type('Example extra');
			cy.get('#note + button').click();
			cy.wait('@postExtra').its('response.statusCode').should('equal', 201);
			cy.closeToast('Extra added successfully.');
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra');
			cy.reload();
			cy.get('#diary-table').should('be.visible');
			cy.get('#note-0').should('have.value', 'Example extra');
		});
	});

	describe('weight', () => {
		it('works', () => {
			cy.intercept('GET', '**/api/date?**').as('getDate');
			cy.intercept('POST', '**/api/weights').as('addWeight');
			cy.intercept('PUT', '**/api/weights/*').as('putWeight');
			cy.intercept('DELETE', '**/api/weights/*').as('deleteWeight');
			cy.intercept('GET', '**/api/users/*').as('getUser');

			// Remove weight.
			cy.visit('/');
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight')
				.then(($el) => {
					if ($el.val()) {
						cy.get('#weight').clear();
						cy.get('#weight-form button').click();
						cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
						cy.closeToast('Weight removed successfully.');
					}
				});

			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');

			// Add without weight.
			cy.get('#weight-form button').click();
			cy.closeToast('No changes to save.');

			// Add with invalid weight.
			cy.get('#weight').type('a');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 422);
			cy.get('#weight-error').should('have.text', 'The weight must be a number.');

			// Add without weight.
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 422);
			cy.get('#weight-error').should('have.text', 'The weight field is required.');

			// Add.
			cy.get('#weight').type('11');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.closeToast('Weight saved successfully.');

			// Edit.
			cy.get('#weight').clear().type('22');
			cy.get('#weight-form button').click();
			cy.wait('@putWeight').its('response.statusCode').should('equal', 200);
			cy.closeToast('Weight saved successfully.');

			// Delete.
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.closeToast('Weight removed successfully.');

			// Add then refresh.
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');
			cy.get('#weight').type('33');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.closeToast('Weight saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '33');

			// Edit then refresh.
			cy.get('#weight').clear().type('44');
			cy.get('#weight-form button').click();
			cy.wait('@putWeight').its('response.statusCode').should('equal', 200);
			cy.closeToast('Weight saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '44');
			cy.get('#weight-form button').click();
			cy.closeToast('No changes to save.');

			// Delete then refresh.
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.closeToast('Weight removed successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');

			// Add then delete then add.
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').type('55');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.closeToast('Weight saved successfully.');
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.closeToast('Weight removed successfully.');
			cy.get('#weight').type('66');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.closeToast('Weight saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '66');

			// Add then check profile.
			cy.get('.nav__link').contains('Profile').click();
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.get('[id="weight.weight"]').should('have.value', '66');

			// Delete then check profile.
			cy.get('.nav__link').contains('Diary').click();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '66');
			cy.get('#weight').clear();
			cy.get('#weight-form button').click();
			cy.wait('@deleteWeight').its('response.statusCode').should('equal', 204);
			cy.closeToast('Weight removed successfully.');
			cy.get('.nav__link').contains('Profile').click();
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.get('[id="weight.weight"]').should('have.value', '');

			// Add to other date.
			cy.visit('/?date=2002-02-02');
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '');
			cy.get('#weight').type('77');
			cy.get('#weight-form button').click();
			cy.wait('@addWeight').its('response.statusCode').should('equal', 201);
			cy.closeToast('Weight saved successfully.');
			cy.reload();
			cy.wait('@getDate').its('response.statusCode').should('equal', 200);
			cy.get('#weight').should('have.value', '77');
		});
	});

	describe('food', () => {
		describe('when filtering by favourites', () => {
			it('works', () => {
				cy.removeEntriesExtras();

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
				cy.reload();
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
				cy.removeEntriesExtras();

				cy.intercept('GET', '**/api/date?**').as('getDate');
				cy.intercept('POST', '**/api/entries').as('postEntry');
				cy.intercept('PUT', '**/api/entries/*').as('putEntry');
				cy.intercept('DELETE', '**/api/entries/*').as('deleteEntry');

				// Ensure calories is in trackables.
				cy.setTrackables(['calories']);

				// Create food.
				const timestamp = (new Date()).getTime();
				cy.createFood(`Foo ${timestamp}`, 2, { calories: 100 });

				// Add.
				cy.visit('/');
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).click();
				cy.wait('@postEntry').its('response.statusCode').should('equal', 201);
				cy.closeToast('Food added successfully.');
				cy.get('#diary-table').should('be.visible');
				cy.get('#user_serving_size-0').should('have.value', '2');
				cy.get('.entry .column--calories').should('have.text', '100');
				cy.get('.column-total--calories').should('have.text', '100');

				// Edit serving size and press enter.
				cy.get('#user_serving_size-0').clear().type('1{enter}');
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.closeToast('Entry saved successfully.');
				cy.get('#user_serving_size-0').should('have.value', '1');
				cy.get('.entry .column--calories').should('have.text', '50');
				cy.get('.column-total--calories').should('have.text', '50');

				// Edit serving size and blur.
				cy.get('#user_serving_size-0').clear().type('.5').blur();
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.closeToast('Entry saved successfully.');
				cy.get('#user_serving_size-0').should('have.value', '.5');
				cy.get('.entry .column--calories').should('have.text', '25');
				cy.get('.column-total--calories').should('have.text', '25');

				// Delete.
				cy.get('.button--remove').click();
				cy.wait('@deleteEntry').its('response.statusCode').should('equal', 204);
				cy.closeToast('Food removed successfully.');
				cy.get('#diary-table').should('not.exist');
				cy.get('#user_serving_size-0').should('not.exist');

				// Add then refresh.
				cy.reload();
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).click();
				cy.wait('@postEntry').its('response.statusCode').should('equal', 201);
				cy.closeToast('Food added successfully.');
				cy.reload();
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('be.visible');
				cy.get('#user_serving_size-0').should('have.value', '2');
				cy.get('.entry .column--calories').should('have.text', '100');
				cy.get('.column-total--calories').should('have.text', '100');

				// Edit serving size and press enter then refresh.
				cy.get('#user_serving_size-0').clear().type('1{enter}');
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.closeToast('Entry saved successfully.');
				cy.reload();
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#user_serving_size-0').should('have.value', '1');
				cy.get('.entry .column--calories').should('have.text', '50');
				cy.get('.column-total--calories').should('have.text', '50');

				// Edit serving size and blur then refresh.
				cy.get('#user_serving_size-0').clear().type('.5').blur();
				cy.wait('@putEntry').its('response.statusCode').should('equal', 200);
				cy.closeToast('Entry saved successfully.');
				cy.reload();
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#user_serving_size-0').should('have.value', '0.5');
				cy.get('.entry .column--calories').should('have.text', '25');
				cy.get('.column-total--calories').should('have.text', '25');

				// Delete then refresh.
				cy.get('.button--remove').click();
				cy.wait('@deleteEntry').its('response.statusCode').should('equal', 204);
				cy.closeToast('Food removed successfully.');
				cy.reload();
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#user_serving_size-0').should('not.exist');

				// Add to other date.
				cy.visit('/?date=2003-03-03');
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('not.exist');
				cy.get('#food').type(`Foo ${timestamp}`);
				cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).click();
				cy.wait('@postEntry').its('response.statusCode').should('equal', 201);
				cy.closeToast('Food added successfully.');
				cy.reload();
				cy.wait('@getDate').its('response.statusCode').should('equal', 200);
				cy.get('#diary-table').should('be.visible');
				cy.get('#user_serving_size-0').should('have.value', '2');
				cy.get('.entry .column--calories').should('have.text', '100');
				cy.get('.column-total--calories').should('have.text', '100');
			});
		});
	});

	describe('meals', () => {
		it('works', () => {
			cy.removeEntriesExtras();

			cy.intercept('GET', '**/api/meals?**').as('getMeals');

			// Ensure calories is in trackables.
			cy.setTrackables(['calories']);

			// Create food/meal.
			const timestamp = (new Date()).getTime();
			cy.createFood(`Foo ${timestamp}`, 1, { calories: 100 });
			cy.createFood(`Bar ${timestamp}`, 2, { calories: 50 });
			cy.createMeal(`Meal ${timestamp}`, [`Foo ${timestamp}`, `Bar ${timestamp}`], true);

			// Add meal.
			cy.visit('/');
			cy.wait('@getMeals').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.contains(`Meal ${timestamp}`).click();
			cy.get('#diary-table').should('be.visible');
			cy.get('#user_serving_size-0').should('have.value', '1');
			cy.get('#user_serving_size-1').should('have.value', '2');
			cy.get('#entry-row-0 .column--calories').should('have.text', '100');
			cy.get('#entry-row-1 .column--calories').should('have.text', '50');
			cy.get('.column-total--calories').should('have.text', '150');
			cy.reload();
			cy.wait('@getMeals').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('be.visible');
			cy.get('#user_serving_size-0').should('have.value', '1');
			cy.get('#user_serving_size-1').should('have.value', '2');
			cy.get('#entry-row-0 .column--calories').should('have.text', '100');
			cy.get('#entry-row-1 .column--calories').should('have.text', '50');
			cy.get('.column-total--calories').should('have.text', '150');

			// Add to other date.
			cy.visit('/?date=2004-04-04');
			cy.wait('@getMeals').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('not.exist');
			cy.contains(`Meal ${timestamp}`).click();
			cy.get('#diary-table').should('be.visible');
			cy.get('#user_serving_size-0').should('have.value', '1');
			cy.get('#user_serving_size-1').should('have.value', '2');
			cy.get('#entry-row-0 .column--calories').should('have.text', '100');
			cy.get('#entry-row-1 .column--calories').should('have.text', '50');
			cy.get('.column-total--calories').should('have.text', '150');
			cy.reload();
			cy.wait('@getMeals').its('response.statusCode').should('equal', 200);
			cy.get('#diary-table').should('be.visible');
			cy.get('#user_serving_size-0').should('have.value', '1');
			cy.get('#user_serving_size-1').should('have.value', '2');
			cy.get('#entry-row-0 .column--calories').should('have.text', '100');
			cy.get('#entry-row-1 .column--calories').should('have.text', '50');
			cy.get('.column-total--calories').should('have.text', '150');
		});
	});
});
