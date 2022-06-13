describe('food', () => {
	before(() => {
		cy.login();
	});

	it('works', () => {
		const timestamp = (new Date()).getTime();
		cy.intercept('GET', '**/api/food?*').as('getRecords');
		cy.intercept('GET', '**/api/food/*').as('getRecord');
		cy.intercept('POST', '**/api/food').as('postRecord');
		cy.intercept('POST', '**/api/food/*/favourite').as('favouriteRecord');
		cy.intercept('PUT', '**/api/food/*').as('putRecord');
		cy.intercept('DELETE', '**/api/food/*').as('deleteRecord');

		cy.visit('/food');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);

		// Add minimal fields.
		cy.get('.formosa-button').contains('Add').click();
		cy.get('[name="name"]').type(`Foobar ${timestamp}`);
		cy.get('[name="serving_size"]').type('1');
		cy.get('#add-another').check();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
		cy.contains('Food added successfully.').should('exist');

		// Add all fields.
		cy.get('[name="name"]').type(`Barfoo ${timestamp}`);
		// TODO: front_image.
		// TODO: info_image.
		cy.get('[name="serving_size"]').type('2');
		cy.get('[name="serving_units"]').type('cups');
		cy.get('[name="calories"]').type('3');
		cy.get('[name="fat"]').type('4');
		cy.get('[name="saturated_fat"]').type('5');
		cy.get('[name="trans_fat"]').type('6');
		cy.get('[name="polyunsaturated_fat"]').type('7');
		cy.get('[name="omega_6"]').type('8');
		cy.get('[name="omega_3"]').type('9');
		cy.get('[name="monounsaturated_fat"]').type('10');
		cy.get('[name="cholesterol"]').type('1');
		cy.get('[name="sodium"]').type('12');
		cy.get('[name="potassium"]').type('13');
		cy.get('[name="carbohydrate"]').type('14');
		cy.get('[name="fibre"]').type('15');
		cy.get('[name="sugars"]').type('16');
		cy.get('[name="protein"]').type('17');
		cy.get('[name="vitamin_a"]').type('18');
		cy.get('[name="vitamin_c"]').type('19');
		cy.get('[name="calcium"]').type('20');
		cy.get('[name="iron"]').type('21');
		cy.get('[name="vitamin_d"]').type('22');
		cy.get('[name="vitamin_e"]').type('23');
		cy.get('[name="vitamin_k"]').type('24');
		cy.get('[name="thiamin"]').type('25');
		cy.get('[name="riboflavin"]').type('26');
		cy.get('[name="niacin"]').type('27');
		cy.get('[name="vitamin_b6"]').type('28');
		cy.get('[name="folate"]').type('29');
		cy.get('[name="vitamin_b12"]').type('30');
		cy.get('[name="biotin"]').type('31');
		cy.get('[name="pantothenate"]').type('32');
		cy.get('[name="phosphorus"]').type('33');
		cy.get('[name="iodine"]').type('34');
		cy.get('[name="magnesium"]').type('35');
		cy.get('[name="zinc"]').type('36');
		cy.get('[name="selenium"]').type('37');
		cy.get('[name="copper"]').type('38');
		cy.get('[name="manganese"]').type('39');
		cy.get('[name="chromium"]').type('30');
		cy.get('[name="molybdenum"]').type('41');
		cy.get('[name="chloride"]').type('42');
		cy.get('#add-another').uncheck();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
		cy.contains('Food added successfully.').should('exist');

		// Search.
		cy.visit('/food');
		cy.get('#search').type(timestamp);
		cy.get('.table-link').should('have.length', 2);

		// Sort.
		let names = [`Barfoo ${timestamp}`, `Foobar ${timestamp}`];
		cy.get('.table-link').each((item, index) => {
			cy.wrap(item).should('have.text', names[index]);
		})
			.then(() => {
				cy.get('[data-key="slug"]').click();
				names = [`Foobar ${timestamp}`, `Barfoo ${timestamp}`];
				cy.get('.table-link').each((item, index) => {
					cy.wrap(item).should('have.text', names[index]);
				});
			});

		// TODO: Favourite/unfavourite from index.

		// Edit minimal fields.
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('[name="name"]').clear().type(`Bar ${timestamp}`);
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Food saved successfully.').should('exist');
		cy.reload();
		cy.get('[name="name"]').invoke('val').should('equal', `Bar ${timestamp}`);

		// TODO: Edit all fields.

		// Favourite.
		cy.get('.heart').should('have.class', 'favourite');
		cy.get('.heart').should('not.have.class', 'unfavourite');
		cy.get('.heart').click();
		cy.wait('@favouriteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food favourited successfully.').should('exist');
		cy.reload();
		cy.get('.heart').should('not.have.class', 'favourite');
		cy.get('.heart').should('have.class', 'unfavourite');

		// Unfavourite.
		cy.get('.heart').click();
		cy.wait('@favouriteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food unfavourited successfully.').should('exist');
		cy.reload();
		cy.get('.heart').should('have.class', 'favourite');
		cy.get('.heart').should('not.have.class', 'unfavourite');

		// Delete.
		cy.get('.formosa-button').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food deleted successfully.').should('exist');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Foobar ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('.formosa-button').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food deleted successfully.').should('exist');
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).should('not.exist');
		cy.get('.table-link').contains(`Foobar ${timestamp}`).should('not.exist');
	});
});
