import 'cypress-file-upload'; // eslint-disable-line import/no-extraneous-dependencies

Cypress.Commands.add('clearBmiSettings', () => {
	cy.intercept('GET', '**/api/users/*').as('getUser');
	cy.intercept('PUT', '**/api/users/*').as('putUser');

	cy.visit('/profile');
	cy.wait('@getUser').its('response.statusCode').should('equal', 200);
	cy.get('[name="activity_level"]').select('');
	cy.get('[name="sex"]').select('');
	cy.get('[name="age"]').clear();
	cy.get('[name="height"]').clear();
	cy.get('#save-bmi').click();
	cy.get('.formosa-toast').should('exist');
	cy.get('.formosa-toast__close').click();
});

Cypress.Commands.add('createFood', (name, servingSize, attributes = {}, addToFavourites = false) => {
	cy.intercept('POST', '**/api/food').as('postFoodRecord');
	cy.intercept('POST', '**/api/food/*/favourite').as('favouriteFoodRecord');

	cy.visit('/food/new');
	cy.get('[name="name"]').type(name);
	cy.get('[name="serving_size"]').type(servingSize);
	Object.keys(attributes).forEach((key) => {
		cy.get(`[name="${key}"]`).type(attributes[key]);
	});
	if (!addToFavourites) {
		cy.get('[name="meta.is_favourite"]').uncheck();
	}
	cy.get('.formosa-button').contains('Save').click();
	cy.wait('@postFoodRecord').its('response.statusCode').should('equal', 201);
	cy.closeToast('Food added successfully.');
});

Cypress.Commands.add('createMeal', (name, foods = [], addToFavourites = false) => {
	cy.intercept('POST', '**/api/meals').as('postMealRecord');
	cy.intercept('PUT', '**/api/meals/*').as('putMealRecord');

	cy.visit('/meals/new');
	cy.get('[name="name"]').type(name);
	if (!addToFavourites) {
		cy.get('[name="is_favourite"]').uncheck();
	}
	cy.get('.formosa-button').contains('Save').click();
	cy.wait('@postMealRecord').its('response.statusCode').should('equal', 201);
	cy.closeToast('Meal added successfully.');

	if (foods.length > 0) {
		foods.forEach((food) => {
			cy.get('#new-food').type(food);
			cy.get('.formosa-autocomplete__option__button').contains(food).click();
		});
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putMealRecord').its('response.statusCode').should('equal', 200);
		cy.closeToast('Meal saved successfully.');
	}
});

Cypress.Commands.add('deleteAllData', () => {
	cy.intercept('GET', '**/api/users/*').as('getUser');
	cy.intercept('POST', '**/api/users/delete-data').as('deleteData');

	cy.visit('/profile');
	cy.wait('@getUser').its('response.statusCode').should('equal', 200);
	cy.get('[value="entries"]').check();
	cy.get('[value="meals"]').check();
	cy.get('[value="weights"]').check();
	cy.get('.formosa-button--danger').contains('Delete selected data').click();
	cy.get('dialog .formosa-button--danger').contains('Delete').click();
	cy.wait('@deleteData').its('response.statusCode').should('equal', 204);
	cy.closeToast('Data deleted successfully.');
});

Cypress.Commands.add('closeToast', (message) => {
	cy.contains(message).should('exist');
	cy.get('.formosa-toast__close').click();
});

Cypress.Commands.add('removeEntriesExtras', () => {
	cy.intercept('GET', '**/api/date?*').as('getDate');
	cy.intercept('DELETE', '**/api/entries/*').as('deleteEntryRecord');
	cy.intercept('DELETE', '**/api/extras/*').as('deleteExtraRecord');

	cy.visit('/');
	cy.wait('@getDate').its('response.statusCode').should('equal', 200);
	cy.get('body')
		.then(($body) => {
			if ($body.find('.entry .button--remove').length > 0) {
				cy.get('.entry .button--remove')
					.each(($el) => {
						$el.click();
						cy.wait('@deleteEntryRecord').its('response.statusCode').should('equal', 204);
						cy.get('.formosa-toast__close').click();
					});
			}

			if ($body.find('.extra .button--remove').length > 0) {
				cy.get('.extra .button--remove')
					.each(($el) => {
						$el.click();
						cy.wait('@deleteExtraRecord').its('response.statusCode').should('equal', 204);
						cy.get('.formosa-toast__close').click();
					});
			}
		});
});

Cypress.Commands.add('setWeight', (weight) => {
	cy.intercept('GET', '**/api/date?*').as('getDate');
	cy.intercept('POST', '**/api/weights').as('postWeightRecord');
	cy.intercept('PUT', '**/api/weights/*').as('putWeightRecord');

	cy.visit('/');
	cy.wait('@getDate').its('response.statusCode').should('equal', 200);
	cy.get('#weight')
		.then(($el) => {
			const val = $el.val();
			if (val !== weight) {
				cy.get('#weight').clear().type(weight);
				cy.get('#weight-form button').click();
				if (val === '') {
					cy.wait('@postWeightRecord').its('response.statusCode').should('equal', 201);
				} else {
					cy.wait('@putWeightRecord').its('response.statusCode').should('equal', 200);
				}
				cy.closeToast('Weight saved successfully.');
			}
		});
});

Cypress.Commands.add('setTrackables', (trackables = []) => {
	cy.intercept('GET', '**/api/trackables?*').as('getTrackables');
	cy.intercept('GET', '**/api/users/*').as('getUserRecord');

	cy.visit('/profile');
	cy.wait('@getUserRecord').its('response.statusCode').should('equal', 200);
	cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);

	cy.get('body')
		.then(($body) => {
			if ($body.find('[id^="trackable-"]:checked').length > 0) {
				cy.get('[id^="trackable-"]:checked')
					.each((item) => {
						const id = item.attr('id').replace('trackable-', '');
						if (!trackables.includes(id)) {
							cy.wrap(item).uncheck();
						}
					});
			}
		});

	trackables.forEach((slug) => {
		cy.get(`[id="trackable-${slug}"]`).check();
	});

	cy.get('#save-tracking').click();
	cy.get('.formosa-toast').should('exist');
	cy.get('.formosa-toast__close').click();
});

export const mockServerError = (method, url) => ( // eslint-disable-line import/prefer-default-export
	cy.intercept(
		method,
		url,
		{
			statusCode: 500,
			body: {
				errors: [
					{
						title: 'Unable to connect to the server. Please try again later.',
						status: '500',
					},
				],
			},
		}
	)
);
