describe('food', () => {
	beforeEach(() => {
		cy.login();
		cy.deleteAllData();
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
		cy.get('.formosa-toast__close').click();

		// Add all fields.
		cy.get('[name="name"]').type(`Barfoo ${timestamp}`);
		cy.get('[id="front_image"]').attachFile('front-image.jpg');
		cy.get('[id="info_image"]').attachFile('info-image.jpg');
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
		cy.get('.formosa-toast__close').click();

		// Verify all fields.
		cy.get('[name="name"]').should('have.value', `Barfoo ${timestamp}`);
		cy.get('[id="front_image-name"]').invoke('text').should('match', new RegExp(`/uploads/food/front_image/[^/]+/barfoo-${timestamp}.jpg`));
		cy.get('[id="info_image-name"]').invoke('text').should('match', new RegExp(`/uploads/food/info_image/[^/]+/barfoo-${timestamp}.jpg`));
		cy.get('[name="serving_size"]').should('have.value', '2');
		cy.get('[name="serving_units"]').should('have.value', 'cup');
		cy.get('[name="calories"]').should('have.value', '3');
		cy.get('[name="fat"]').should('have.value', '4');
		cy.get('[name="saturated_fat"]').should('have.value', '5');
		cy.get('[name="trans_fat"]').should('have.value', '6');
		cy.get('[name="polyunsaturated_fat"]').should('have.value', '7');
		cy.get('[name="omega_6"]').should('have.value', '8');
		cy.get('[name="omega_3"]').should('have.value', '9');
		cy.get('[name="monounsaturated_fat"]').should('have.value', '10');
		cy.get('[name="cholesterol"]').should('have.value', '1');
		cy.get('[name="sodium"]').should('have.value', '12');
		cy.get('[name="potassium"]').should('have.value', '13');
		cy.get('[name="carbohydrate"]').should('have.value', '14');
		cy.get('[name="fibre"]').should('have.value', '15');
		cy.get('[name="sugars"]').should('have.value', '16');
		cy.get('[name="protein"]').should('have.value', '17');
		cy.get('[name="vitamin_a"]').should('have.value', '18');
		cy.get('[name="vitamin_c"]').should('have.value', '19');
		cy.get('[name="calcium"]').should('have.value', '20');
		cy.get('[name="iron"]').should('have.value', '21');
		cy.get('[name="vitamin_d"]').should('have.value', '22');
		cy.get('[name="vitamin_e"]').should('have.value', '23');
		cy.get('[name="vitamin_k"]').should('have.value', '24');
		cy.get('[name="thiamin"]').should('have.value', '25');
		cy.get('[name="riboflavin"]').should('have.value', '26');
		cy.get('[name="niacin"]').should('have.value', '27');
		cy.get('[name="vitamin_b6"]').should('have.value', '28');
		cy.get('[name="folate"]').should('have.value', '29');
		cy.get('[name="vitamin_b12"]').should('have.value', '30');
		cy.get('[name="biotin"]').should('have.value', '31');
		cy.get('[name="pantothenate"]').should('have.value', '32');
		cy.get('[name="phosphorus"]').should('have.value', '33');
		cy.get('[name="iodine"]').should('have.value', '34');
		cy.get('[name="magnesium"]').should('have.value', '35');
		cy.get('[name="zinc"]').should('have.value', '36');
		cy.get('[name="selenium"]').should('have.value', '37');
		cy.get('[name="copper"]').should('have.value', '38');
		cy.get('[name="manganese"]').should('have.value', '39');
		cy.get('[name="chromium"]').should('have.value', '30');
		cy.get('[name="molybdenum"]').should('have.value', '41');
		cy.get('[name="chloride"]').should('have.value', '42');

		// Search.
		cy.visit('/food');
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
				cy.get('[data-key="slug"]').click();
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
		cy.wait('@favouriteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food unfavourited successfully.').should('exist');
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
		cy.wait('@favouriteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food favourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		heart = cy.get('.table-link')
			.contains(`Barfoo ${timestamp}`)
			.parents('tr')
			.children('td')
			.children('.heart');
		heart.should('not.have.class', 'favourite');
		heart.should('have.class', 'unfavourite');

		// Edit minimal fields.
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('[name="name"]').clear().type(`Bar ${timestamp}`);
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Food saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('[name="name"]').invoke('val').should('equal', `Bar ${timestamp}`);

		// Edit all fields.
		cy.get('[name="name"]').clear().type(`Example ${timestamp}`);
		cy.get('[id="front_image"]').attachFile('info-image.jpg');
		cy.get('[id="info_image"]').attachFile('front-image.jpg');
		cy.get('[name="serving_units"]').clear().type('bottles');
		cy.get('[name="calories"]').clear().type('98');
		cy.get('[name="fat"]').clear().type('97');
		cy.get('[name="saturated_fat"]').clear().type('96');
		cy.get('[name="trans_fat"]').clear().type('95');
		cy.get('[name="polyunsaturated_fat"]').clear().type('94');
		cy.get('[name="omega_6"]').clear().type('93');
		cy.get('[name="omega_3"]').clear().type('92');
		cy.get('[name="monounsaturated_fat"]').clear().type('91');
		cy.get('[name="cholesterol"]').clear().type('90');
		cy.get('[name="sodium"]').clear().type('89');
		cy.get('[name="potassium"]').clear().type('88');
		cy.get('[name="carbohydrate"]').clear().type('87');
		cy.get('[name="fibre"]').clear().type('86');
		cy.get('[name="sugars"]').clear().type('85');
		cy.get('[name="protein"]').clear().type('84');
		cy.get('[name="vitamin_a"]').clear().type('83');
		cy.get('[name="vitamin_c"]').clear().type('82');
		cy.get('[name="calcium"]').clear().type('81');
		cy.get('[name="iron"]').clear().type('80');
		cy.get('[name="vitamin_d"]').clear().type('79');
		cy.get('[name="vitamin_e"]').clear().type('78');
		cy.get('[name="vitamin_k"]').clear().type('77');
		cy.get('[name="thiamin"]').clear().type('76');
		cy.get('[name="riboflavin"]').clear().type('75');
		cy.get('[name="niacin"]').clear().type('74');
		cy.get('[name="vitamin_b6"]').clear().type('73');
		cy.get('[name="folate"]').clear().type('72');
		cy.get('[name="vitamin_b12"]').clear().type('71');
		cy.get('[name="biotin"]').clear().type('70');
		cy.get('[name="pantothenate"]').clear().type('69');
		cy.get('[name="phosphorus"]').clear().type('68');
		cy.get('[name="iodine"]').clear().type('67');
		cy.get('[name="magnesium"]').clear().type('66');
		cy.get('[name="zinc"]').clear().type('65');
		cy.get('[name="selenium"]').clear().type('64');
		cy.get('[name="copper"]').clear().type('63');
		cy.get('[name="manganese"]').clear().type('62');
		cy.get('[name="chromium"]').clear().type('61');
		cy.get('[name="molybdenum"]').clear().type('60');
		cy.get('[name="chloride"]').clear().type('59');
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Food saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();

		// Verify all fields.
		cy.reload();
		cy.get('[name="name"]').should('have.value', `Example ${timestamp}`);
		cy.get('[id="front_image-name"]').invoke('text').should('match', new RegExp(`/uploads/food/front_image/[^/]+/example-${timestamp}.jpg`));
		cy.get('[id="info_image-name"]').invoke('text').should('match', new RegExp(`/uploads/food/info_image/[^/]+/example-${timestamp}.jpg`));
		cy.get('[name="serving_size"]').should('have.value', '2');
		cy.get('[name="serving_units"]').should('have.value', 'bottle');
		cy.get('[name="calories"]').should('have.value', '98');
		cy.get('[name="fat"]').should('have.value', '97');
		cy.get('[name="saturated_fat"]').should('have.value', '96');
		cy.get('[name="trans_fat"]').should('have.value', '95');
		cy.get('[name="polyunsaturated_fat"]').should('have.value', '94');
		cy.get('[name="omega_6"]').should('have.value', '93');
		cy.get('[name="omega_3"]').should('have.value', '92');
		cy.get('[name="monounsaturated_fat"]').should('have.value', '91');
		cy.get('[name="cholesterol"]').should('have.value', '90');
		cy.get('[name="sodium"]').should('have.value', '89');
		cy.get('[name="potassium"]').should('have.value', '88');
		cy.get('[name="carbohydrate"]').should('have.value', '87');
		cy.get('[name="fibre"]').should('have.value', '86');
		cy.get('[name="sugars"]').should('have.value', '85');
		cy.get('[name="protein"]').should('have.value', '84');
		cy.get('[name="vitamin_a"]').should('have.value', '83');
		cy.get('[name="vitamin_c"]').should('have.value', '82');
		cy.get('[name="calcium"]').should('have.value', '81');
		cy.get('[name="iron"]').should('have.value', '80');
		cy.get('[name="vitamin_d"]').should('have.value', '79');
		cy.get('[name="vitamin_e"]').should('have.value', '78');
		cy.get('[name="vitamin_k"]').should('have.value', '77');
		cy.get('[name="thiamin"]').should('have.value', '76');
		cy.get('[name="riboflavin"]').should('have.value', '75');
		cy.get('[name="niacin"]').should('have.value', '74');
		cy.get('[name="vitamin_b6"]').should('have.value', '73');
		cy.get('[name="folate"]').should('have.value', '72');
		cy.get('[name="vitamin_b12"]').should('have.value', '71');
		cy.get('[name="biotin"]').should('have.value', '70');
		cy.get('[name="pantothenate"]').should('have.value', '69');
		cy.get('[name="phosphorus"]').should('have.value', '68');
		cy.get('[name="iodine"]').should('have.value', '67');
		cy.get('[name="magnesium"]').should('have.value', '66');
		cy.get('[name="zinc"]').should('have.value', '65');
		cy.get('[name="selenium"]').should('have.value', '64');
		cy.get('[name="copper"]').should('have.value', '63');
		cy.get('[name="manganese"]').should('have.value', '62');
		cy.get('[name="chromium"]').should('have.value', '61');
		cy.get('[name="molybdenum"]').should('have.value', '60');
		cy.get('[name="chloride"]').should('have.value', '59');

		// Remove optional fields.
		cy.reload();
		cy.get('[id="front_image-remove"]').click();
		cy.get('[id="info_image-remove"]').click();
		cy.get('[name="calories"]').clear();
		cy.get('[name="fat"]').clear();
		cy.get('[name="saturated_fat"]').clear();
		cy.get('[name="trans_fat"]').clear();
		cy.get('[name="polyunsaturated_fat"]').clear();
		cy.get('[name="omega_6"]').clear();
		cy.get('[name="omega_3"]').clear();
		cy.get('[name="monounsaturated_fat"]').clear();
		cy.get('[name="cholesterol"]').clear();
		cy.get('[name="sodium"]').clear();
		cy.get('[name="potassium"]').clear();
		cy.get('[name="carbohydrate"]').clear();
		cy.get('[name="fibre"]').clear();
		cy.get('[name="sugars"]').clear();
		cy.get('[name="protein"]').clear();
		cy.get('[name="vitamin_a"]').clear();
		cy.get('[name="vitamin_c"]').clear();
		cy.get('[name="calcium"]').clear();
		cy.get('[name="iron"]').clear();
		cy.get('[name="vitamin_d"]').clear();
		cy.get('[name="vitamin_e"]').clear();
		cy.get('[name="vitamin_k"]').clear();
		cy.get('[name="thiamin"]').clear();
		cy.get('[name="riboflavin"]').clear();
		cy.get('[name="niacin"]').clear();
		cy.get('[name="vitamin_b6"]').clear();
		cy.get('[name="folate"]').clear();
		cy.get('[name="vitamin_b12"]').clear();
		cy.get('[name="biotin"]').clear();
		cy.get('[name="pantothenate"]').clear();
		cy.get('[name="phosphorus"]').clear();
		cy.get('[name="iodine"]').clear();
		cy.get('[name="magnesium"]').clear();
		cy.get('[name="zinc"]').clear();
		cy.get('[name="selenium"]').clear();
		cy.get('[name="copper"]').clear();
		cy.get('[name="manganese"]').clear();
		cy.get('[name="chromium"]').clear();
		cy.get('[name="molybdenum"]').clear();
		cy.get('[name="chloride"]').clear();
		cy.get('.formosa-button').contains('Save').click();
		cy.wait('@putRecord').its('response.statusCode').should('equal', 200);
		cy.contains('Food saved successfully.').should('exist');
		cy.get('.formosa-toast__close').click();

		// Verify all fields.
		cy.reload();
		cy.get('[name="name"]').should('have.value', `Example ${timestamp}`);
		cy.get('[id="front_image-name"]').should('contain', 'No file selected.');
		cy.get('[id="info_image-name"]').should('contain', 'No file selected.');
		cy.get('[name="serving_size"]').should('have.value', '2');
		cy.get('[name="serving_units"]').should('have.value', 'bottle');
		cy.get('[name="calories"]').should('have.value', '');
		cy.get('[name="fat"]').should('have.value', '');
		cy.get('[name="saturated_fat"]').should('have.value', '');
		cy.get('[name="trans_fat"]').should('have.value', '');
		cy.get('[name="polyunsaturated_fat"]').should('have.value', '');
		cy.get('[name="omega_6"]').should('have.value', '');
		cy.get('[name="omega_3"]').should('have.value', '');
		cy.get('[name="monounsaturated_fat"]').should('have.value', '');
		cy.get('[name="cholesterol"]').should('have.value', '');
		cy.get('[name="sodium"]').should('have.value', '');
		cy.get('[name="potassium"]').should('have.value', '');
		cy.get('[name="carbohydrate"]').should('have.value', '');
		cy.get('[name="fibre"]').should('have.value', '');
		cy.get('[name="sugars"]').should('have.value', '');
		cy.get('[name="protein"]').should('have.value', '');
		cy.get('[name="vitamin_a"]').should('have.value', '');
		cy.get('[name="vitamin_c"]').should('have.value', '');
		cy.get('[name="calcium"]').should('have.value', '');
		cy.get('[name="iron"]').should('have.value', '');
		cy.get('[name="vitamin_d"]').should('have.value', '');
		cy.get('[name="vitamin_e"]').should('have.value', '');
		cy.get('[name="vitamin_k"]').should('have.value', '');
		cy.get('[name="thiamin"]').should('have.value', '');
		cy.get('[name="riboflavin"]').should('have.value', '');
		cy.get('[name="niacin"]').should('have.value', '');
		cy.get('[name="vitamin_b6"]').should('have.value', '');
		cy.get('[name="folate"]').should('have.value', '');
		cy.get('[name="vitamin_b12"]').should('have.value', '');
		cy.get('[name="biotin"]').should('have.value', '');
		cy.get('[name="pantothenate"]').should('have.value', '');
		cy.get('[name="phosphorus"]').should('have.value', '');
		cy.get('[name="iodine"]').should('have.value', '');
		cy.get('[name="magnesium"]').should('have.value', '');
		cy.get('[name="zinc"]').should('have.value', '');
		cy.get('[name="selenium"]').should('have.value', '');
		cy.get('[name="copper"]').should('have.value', '');
		cy.get('[name="manganese"]').should('have.value', '');
		cy.get('[name="chromium"]').should('have.value', '');
		cy.get('[name="molybdenum"]').should('have.value', '');
		cy.get('[name="chloride"]').should('have.value', '');

		// Unfavourite.
		cy.get('.heart').should('not.have.class', 'favourite');
		cy.get('.heart').should('have.class', 'unfavourite');
		cy.get('.heart').click();
		cy.wait('@favouriteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food unfavourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('.heart').should('have.class', 'favourite');
		cy.get('.heart').should('not.have.class', 'unfavourite');

		// Favourite.
		cy.get('.heart').click();
		cy.wait('@favouriteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food favourited successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.reload();
		cy.get('.heart').should('not.have.class', 'favourite');
		cy.get('.heart').should('have.class', 'unfavourite');

		// Delete.
		cy.get('.formosa-button--danger').contains('Delete').click();
		cy.get('dialog .formosa-button--danger').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food deleted successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Foobar ${timestamp}`).click();
		cy.wait('@getRecord').its('response.statusCode').should('equal', 200);
		cy.get('.formosa-button--danger').contains('Delete').click();
		cy.get('dialog .formosa-button--danger').contains('Delete').click();
		cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
		cy.contains('Food deleted successfully.').should('exist');
		cy.get('.formosa-toast__close').click();
		cy.wait('@getRecords').its('response.statusCode').should('equal', 200);
		cy.get('.table-link').contains(`Barfoo ${timestamp}`).should('not.exist');
		cy.get('.table-link').contains(`Foobar ${timestamp}`).should('not.exist');
	});

	describe('adding as favourite', () => {
		it('works', () => {
			const timestamp = (new Date()).getTime();
			cy.intercept('GET', '**/api/food?*').as('getRecords');
			cy.intercept('GET', '**/api/food/*').as('getRecord');
			cy.intercept('POST', '**/api/food').as('postRecord');
			cy.intercept('DELETE', '**/api/food/*').as('deleteRecord');

			cy.visit('/food/new');
			cy.get('[name="name"]').type(`Foobar ${timestamp}`);
			cy.get('[name="serving_size"]').type('1');
			cy.get('.formosa-button').contains('Save').click();
			cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
			cy.contains('Food added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('.heart').should('not.have.class', 'favourite');
			cy.get('.heart').should('have.class', 'unfavourite');

			cy.get('.formosa-button--danger').contains('Delete').click();
			cy.get('dialog .formosa-button--danger').contains('Delete').click();
			cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
			cy.contains('Food deleted successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
		});
	});

	describe('adding not as favourite', () => {
		it('works', () => {
			const timestamp = (new Date()).getTime();
			cy.intercept('GET', '**/api/food?*').as('getRecords');
			cy.intercept('GET', '**/api/food/*').as('getRecord');
			cy.intercept('POST', '**/api/food').as('postRecord');
			cy.intercept('DELETE', '**/api/food/*').as('deleteRecord');

			cy.visit('/food/new');
			cy.get('[name="name"]').type(`Foobar ${timestamp}`);
			cy.get('[name="serving_size"]').type('1');
			cy.get('[name="meta.is_favourite"]').uncheck();
			cy.get('.formosa-button').contains('Save').click();
			cy.wait('@postRecord').its('response.statusCode').should('equal', 201);
			cy.contains('Food added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('.heart').should('have.class', 'favourite');
			cy.get('.heart').should('not.have.class', 'unfavourite');

			cy.get('.formosa-button--danger').contains('Delete').click();
			cy.get('dialog .formosa-button--danger').contains('Delete').click();
			cy.wait('@deleteRecord').its('response.statusCode').should('equal', 204);
			cy.contains('Food deleted successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
		});
	});
});
