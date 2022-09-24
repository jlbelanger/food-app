describe('meals', () => {
	before(() => {
		cy.login();
		cy.deleteAllData();
	});

	it('works', () => {
		const timestamp = (new Date()).getTime();
		cy.intercept('GET', '**/api/meals?*').as('getRecords');
		cy.intercept('GET', '**/api/meals/*').as('getRecord');
		cy.intercept('POST', '**/api/meals').as('postRecord');
		cy.intercept('PUT', '**/api/meals/*').as('putRecord');
		cy.intercept('DELETE', '**/api/meals/*').as('deleteRecord');

		// Create food.
		cy.createFood(`Foo ${timestamp}`, 1, { calories: 100 });
		cy.createFood(`Bar ${timestamp}`, 2, { calories: 20 });

		// Ensure calories is in trackables.
		cy.setTrackables(['calories']);

		// Add.
		cy.visit('/meals');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.formosa-button').contains('Add').click();
		cy.get('[name="name"]').type(`Foobar ${timestamp}`);
		cy.get('#add-another').check();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
		cy.contains('Meal added successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.get('[name="name"]').type(`Barfoo ${timestamp}`);
		cy.get('#add-another').uncheck();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
		cy.contains('Meal added successfully.').should('exist');
		cy.get('.formosa-toast__close').click();

		// Verify all fields.
		cy.get('[name="name"]').should('have.value', `Barfoo ${timestamp}`);

		// Search.
		cy.visit('/meals');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('#search').type('thereshouldbenoresults');
		cy.get('table').should('not.exist');
		cy.contains('No results found.').should('exist');
		cy.get('#search').clear().type(timestamp);
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

		// Unfavourite from index.
		let heart = cy.get('.table-link')
			.contains(`Barfoo ${timestamp}`)
			.parents('tr')
			.children('td')
			.children('.heart');
		heart.should('not.have.class', 'favourite');
		heart.should('have.class', 'unfavourite');
		heart.click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal unfavourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		heart = cy.get('.table-link')
			.contains(`Barfoo ${timestamp}`)
			.parents('tr')
			.children('td')
			.children('.heart');
		heart.should('have.class', 'favourite');
		heart.should('not.have.class', 'unfavourite');

		// Favourite from index.
		heart.click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal favourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		heart = cy.get('.table-link')
			.contains(`Barfoo ${timestamp}`)
			.parents('tr')
			.children('td')
			.children('.heart');
		heart.should('not.have.class', 'favourite');
		heart.should('have.class', 'unfavourite');

		// Edit.
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('[name="name"]').clear().type(`Bar ${timestamp}`);
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('[name="name"]').invoke('val').should('equal', `Bar ${timestamp}`);

		// Unfavourite.
		cy.get('.heart').should('not.have.class', 'favourite');
		cy.get('.heart').should('have.class', 'unfavourite');
		cy.get('.heart').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal unfavourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('.heart').should('have.class', 'favourite');
		cy.get('.heart').should('not.have.class', 'unfavourite');

		// Favourite.
		cy.get('.heart').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal favourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('.heart').should('not.have.class', 'favourite');
		cy.get('.heart').should('have.class', 'unfavourite');

		// Add food.
		cy.get('#new-food').type(`Foo ${timestamp}`);
		cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).click();
		cy.get(`.row--foo-${timestamp}`).should('exist');
		cy.get('[id="foods.0.user_serving_size"]').should('have.value', '1');
		cy.get(`.row--foo-${timestamp} .column--calories`).should('contain', '100');
		cy.get('#new-food').type(`Foo ${timestamp}`);
		cy.get('.formosa-autocomplete__option__button').should('not.exist');
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get(`.row--foo-${timestamp}`).should('exist');
		cy.get('[id="foods.0.user_serving_size"]').should('have.value', '1');
		cy.get(`.row--foo-${timestamp} .column--calories`).should('contain', '100');

		// Add food.
		cy.get('#new-food').type(`Bar ${timestamp}`);
		cy.get('.formosa-autocomplete__option__button').contains(`Bar ${timestamp}`).click();
		cy.get(`.row--bar-${timestamp}`).should('exist');
		cy.get('[id="foods.1.user_serving_size"]').should('have.value', '2');
		cy.get(`.row--bar-${timestamp} .column--calories`).should('contain', '20');
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get(`.row--foo-${timestamp}`).should('exist');
		cy.get('[id="foods.0.user_serving_size"]').should('have.value', '1');
		cy.get(`.row--foo-${timestamp} .column--calories`).should('contain', '100');
		cy.get(`.row--bar-${timestamp}`).should('exist');
		cy.get('[id="foods.1.user_serving_size"]').should('have.value', '2');
		cy.get(`.row--bar-${timestamp} .column--calories`).should('contain', '20');

		// Edit food.
		cy.get('[id="foods.0.user_serving_size"]').clear().type('.5');
		cy.get(`.row--foo-${timestamp} .column--calories`).should('contain', '50');
		cy.get('.column-total--calories').should('contain', '70');
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('[id="foods.0.user_serving_size"]').should('have.value', '0.5');
		cy.get(`.row--foo-${timestamp} .column--calories`).should('contain', '50');
		cy.get('[id="foods.1.user_serving_size"]').should('have.value', '2');
		cy.get(`.row--bar-${timestamp} .column--calories`).should('contain', '20');
		cy.get('.column-total--calories').should('contain', '70');

		// Remove food.
		cy.get('[data-index="0"]').click();
		cy.get(`.row--foo-${timestamp}`).should('not.exist');
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get(`.row--foo-${timestamp}`).should('not.exist');
		cy.get(`.row--bar-${timestamp}`).should('exist');

		// Delete.
		cy.get('.formosa-button').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Meal deleted successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Foobar ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('.formosa-button').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Meal deleted successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.contains(`Barfoo ${timestamp}`).should('not.exist');
		cy.contains(`Foobar ${timestamp}`).should('not.exist');
	});

	describe('adding as favourite', () => {
		it('works', () => {
			const timestamp = (new Date()).getTime();
			cy.intercept('GET', '**/api/meals?*').as('getRecords');
			cy.intercept('GET', '**/api/meals/*').as('getRecord');
			cy.intercept('POST', '**/api/meals').as('postRecord');
			cy.intercept('DELETE', '**/api/meals/*').as('deleteRecord');

			cy.visit('/meals/new');
			cy.get('[name="name"]').type(`Foobar ${timestamp}`);
			cy.get('.formosa-button').contains('Save').click();
			cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
			cy.contains('Meal added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('.heart').should('not.have.class', 'favourite');
			cy.get('.heart').should('have.class', 'unfavourite');

			cy.get('.formosa-button').contains('Delete').click();
			cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
			cy.contains('Meal deleted successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
		});
	});

	describe('adding not as favourite', () => {
		it('works', () => {
			const timestamp = (new Date()).getTime();
			cy.intercept('GET', '**/api/meals?*').as('getRecords');
			cy.intercept('GET', '**/api/meals/*').as('getRecord');
			cy.intercept('POST', '**/api/meals').as('postRecord');
			cy.intercept('DELETE', '**/api/meals/*').as('deleteRecord');

			cy.visit('/meals/new');
			cy.get('[name="name"]').type(`Foobar ${timestamp}`);
			cy.get('[name="is_favourite"]').uncheck();
			cy.get('.formosa-button').contains('Save').click();
			cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
			cy.contains('Meal added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('.heart').should('have.class', 'favourite');
			cy.get('.heart').should('not.have.class', 'unfavourite');

			cy.get('.formosa-button').contains('Delete').click();
			cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
			cy.contains('Meal deleted successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
		});
	});
});
