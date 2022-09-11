import 'cypress-file-upload'; // eslint-disable-line import/no-extraneous-dependencies

Cypress.Commands.add('createFood', (name, servingSize, attributes = {}) => {
	cy.intercept('POST', '**/api/food').as('postFoodRecord');
	cy.visit('/food/new');
	cy.get('[name="name"]').type(name);
	cy.get('[name="serving_size"]').type(servingSize);
	Object.keys(attributes).forEach((key) => {
		cy.get(`[name="${key}"]`).type(attributes[key]);
	});
	cy.get('.formosa-button').contains('Save').click();
	cy.wait('@postFoodRecord').its('response.statusCode').should('equal', 201);
	cy.contains('Food added successfully.').should('exist');
	cy.get('.formosa-toast__close').click();
});

Cypress.Commands.add('createMeal', (name, foods = [], addToFavourites = false) => {
	cy.intercept('POST', '**/api/meals').as('postMealRecord');
	cy.intercept('PUT', '**/api/meals/**').as('putMealRecord');

	cy.visit('/meals/new');
	cy.get('[name="name"]').type(name);
	cy.get('.formosa-button').contains('Save').click();
	cy.wait('@postMealRecord').its('response.statusCode').should('equal', 201);
	cy.contains('Meal added successfully.').should('exist');
	cy.get('.formosa-toast__close').click();

	foods.forEach((food) => {
		cy.get('#new-food').type(food);
		cy.contains(food).click();
	});
	cy.get('.formosa-button').contains('Save').click();
	cy.wait('@putMealRecord').its('response.statusCode').should('equal', 200);
	cy.contains('Meal saved successfully.').should('exist');
	cy.get('.formosa-toast__close').click();

	if (addToFavourites) {
		cy.get('.heart').click();
		cy.wait('@putMealRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Meal favourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
	}
});

Cypress.Commands.add('removeEntriesExtras', () => {
	cy.intercept('GET', '**/api/entries?**').as('getEntries');
	cy.intercept('DELETE', '**/api/entries/**').as('deleteEntry');
	cy.intercept('GET', '**/api/extras?**').as('getExtras');
	cy.intercept('DELETE', '**/api/extras/**').as('deleteExtra');

	cy.visit('/');
	cy.wait('@getEntries').its('response.statusCode').should('equal', 200);
	cy.wait('@getExtras').its('response.statusCode').should('equal', 200);
	cy.get('body')
		.then(($body) => {
			if ($body.find('.entry .button--remove').length > 0) {
				cy.get('.entry .button--remove')
					.each(($el) => {
						$el.click();
						cy.wait('@deleteEntry');
						cy.get('.formosa-toast__close').click();
					});
			}

			if ($body.find('.extra .button--remove').length > 0) {
				cy.get('.extra .button--remove')
					.each(($el) => {
						$el.click();
						cy.wait('@deleteExtra');
						cy.get('.formosa-toast__close').click();
					});
			}
		});
});

Cypress.Commands.add('setWeight', (weight) => {
	cy.intercept('GET', '**/api/weights?**').as('getWeight');
	cy.visit('/');
	cy.wait('@getWeight');
	cy.get('#weight')
		.then(($el) => {
			if ($el.val() !== weight) {
				cy.get('#weight').clear().type(weight);
				cy.get('#weight-form button').click();
				cy.contains('Weight saved successfully.').should('exist');
			}
		});
});
