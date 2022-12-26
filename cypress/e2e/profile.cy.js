describe('profile', () => {
	beforeEach(() => {
		cy.login();
		cy.deleteAllData();
	});

	describe('when updating BMI settings', () => {
		describe('when adding BMI settings', () => {
			it('works', () => {
				cy.setWeight('130.5');
				cy.clearBmiSettings();

				cy.intercept('GET', '**/api/users/**').as('getUser');
				cy.intercept('PUT', '**/api/users/**').as('putUser');

				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="measurement_units"]')
					.then(($el) => {
						if (!$el.attr('disabled')) {
							cy.get('[name="measurement_units"]').select('imperial (weight in pounds, height in inches)');
						}
					});
				cy.get('[name="activity_level"]').select('moderately active');
				cy.get('[name="sex"]').select('');
				cy.get('[name="age"]').clear().type('30');
				cy.get('[name="height"]').clear().type('65');
				cy.get('#save-bmi').click();
				cy.wait('@putUser').its('response.statusCode').should('equal', 200);
				cy.contains('BMI settings updated successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#bmi').invoke('text').should('equal', 'Your BMI is 21.71 (normal - 18.5–24.9).');
				cy.get('#calories').should('not.exist');
			});
		});

		describe('when adding and clearing BMI and calories settings', () => {
			it('works', () => {
				cy.setWeight('130.5');
				cy.clearBmiSettings();

				cy.intercept('GET', '**/api/users/**').as('getUser');
				cy.intercept('PUT', '**/api/users/**').as('putUser');

				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="measurement_units"]')
					.then(($el) => {
						if (!$el.attr('disabled')) {
							cy.get('[name="measurement_units"]').select('imperial (weight in pounds, height in inches)');
						}
					});
				cy.get('[name="activity_level"]').select('moderately active');
				cy.get('[name="sex"]').select('male');
				cy.get('[name="age"]').clear().type('30');
				cy.get('[name="height"]').clear().type('65');
				cy.get('#save-bmi').click();
				cy.wait('@putUser').its('response.statusCode').should('equal', 200);
				cy.contains('BMI settings updated successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#bmi').invoke('text').should('equal', 'Your BMI is 21.71 (normal - 18.5–24.9).');
				cy.get('#calories').invoke('text').should('equal', 'You should be eating 2,132 calories a day to maintain your current weight.'
				+ 'You should not consume any less than 1,500 calories per day.'
				+ 'To lose one pound a week, you should be eating 1,632 calories a day.'
				+ 'There are 3,500 calories in one pound of fat, and 3,500 divided by 7 days of the week is 500, so to lose one pound a week, '
				+ 'you should eat 500 calories less in a day than the calories you would eat to maintain your weight.');

				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="measurement_units"]')
					.then(($el) => {
						if (!$el.attr('disabled')) {
							cy.get('[name="measurement_units"]').select('imperial (weight in pounds, height in inches)');
						}
					});
				cy.get('[name="activity_level"]').select('');
				cy.get('[name="sex"]').select('');
				cy.get('[name="age"]').clear();
				cy.get('[name="height"]').clear();
				cy.get('#save-bmi').click();
				cy.wait('@putUser').its('response.statusCode').should('equal', 200);
				cy.contains('BMI settings updated successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.get('#bmi').should('not.exist');
				cy.get('#calories').should('not.exist');
			});
		});
	});

	describe('when updating trackable settings', () => {
		it('works', () => {
			cy.intercept('GET', '**/api/trackables?').as('getTrackables');
			cy.intercept('GET', '**/api/users/**').as('getUser');
			cy.intercept('GET', '**/api/meals?**').as('getMeals');
			cy.intercept('GET', '**/api/food?**').as('getFoods');
			cy.intercept('GET', '**/api/meals**').as('getMeal');
			cy.intercept('PUT', '**/api/users/**').as('putUser');
			cy.intercept('POST', '**/api/entries').as('postEntry');

			const timestamp = (new Date()).getTime();

			// Remove all trackables to start.
			cy.setTrackables([]);

			// Add one trackable.
			cy.visit('/profile');
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);
			cy.get('#trackable-calories').should('not.be.checked');
			cy.get('#trackable-protein').should('not.be.checked');
			cy.get('#trackable-sodium').should('not.be.checked');
			cy.get('#trackable-fat').should('not.be.checked');
			cy.get('#trackable-calories').check();
			cy.get('#save-tracking').click();
			cy.wait('@putUser').its('response.statusCode').should('equal', 200);
			cy.contains('Tracking settings updated successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Add more trackables.
			cy.visit('/profile');
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);
			cy.get('#trackable-calories').should('be.checked');
			cy.get('#trackable-protein').should('not.be.checked');
			cy.get('#trackable-sodium').should('not.be.checked');
			cy.get('#trackable-fat').should('not.be.checked');
			cy.get('#trackable-protein').check();
			cy.get('#trackable-sodium').check();
			cy.get('#save-tracking').click();
			cy.wait('@putUser').its('response.statusCode').should('equal', 200);
			cy.contains('Tracking settings updated successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Remove one trackable.
			cy.visit('/profile');
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);
			cy.get('#trackable-calories').should('be.checked');
			cy.get('#trackable-protein').should('be.checked');
			cy.get('#trackable-sodium').should('be.checked');
			cy.get('#trackable-fat').should('not.be.checked');
			cy.get('#trackable-calories').uncheck();
			cy.get('#save-tracking').click();
			cy.wait('@putUser').its('response.statusCode').should('equal', 200);
			cy.contains('Tracking settings updated successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Create food and meal.
			cy.createFood(`Foo ${timestamp}`, 1);
			cy.createMeal(`Foo ${timestamp}`);

			// Check columns on food index.
			cy.get('.nav__link').contains('Food').click();
			cy.wait('@getFoods').its('response.statusCode').should('equal', 200);
			cy.get('[data-key="calories"]').should('not.exist');
			cy.get('[data-key="protein"]').should('exist');
			cy.get('[data-key="sodium"]').should('exist');
			cy.get('[data-key="fat"]').should('not.exist');

			// Check columns on meal form.
			cy.get('.nav__link').contains('Meals').click();
			cy.wait('@getMeals').its('response.statusCode').should('equal', 200);
			cy.get('#search').type(`Foo ${timestamp}`);
			cy.get('.table-link').contains(`Foo ${timestamp}`).click();
			cy.wait('@getMeal').its('response.statusCode').should('equal', 200);
			cy.get('#new-food').type(`Foo ${timestamp}`);
			cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).click();
			cy.get('.table-heading').contains('Calories').should('not.exist');
			cy.get('.table-heading').contains('Protein').should('exist');
			cy.get('.table-heading').contains('Sodium').should('exist');
			cy.get('.table-heading').contains('Fat').should('not.exist');
			cy.get('.formosa-button').contains('Delete').click();
			cy.contains('Meal deleted successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Check columns on diary.
			cy.get('.nav__link').contains('Diary').click();
			cy.get('#search-favourites').uncheck();
			cy.get('#food').type(`Foo ${timestamp}`);
			cy.get('.formosa-autocomplete__option__button').contains(`Foo ${timestamp}`).click();
			cy.wait('@postEntry').its('response.statusCode').should('equal', 201);
			cy.contains('Food added successfully.').should('exist');
			cy.get('.formosa-toast__close').click();
			cy.get('.table-heading').contains('Calories').should('not.exist');
			cy.get('.table-heading').contains('Protein').should('exist');
			cy.get('.table-heading').contains('Sodium').should('exist');
			cy.get('.table-heading').contains('Fat').should('not.exist');

			// Add and remove a trackable.
			cy.get('.nav__link').contains('Profile').click();
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);
			cy.get('#trackable-calories').should('not.be.checked');
			cy.get('#trackable-protein').should('be.checked');
			cy.get('#trackable-sodium').should('be.checked');
			cy.get('#trackable-fat').should('not.be.checked');
			cy.get('#trackable-protein').uncheck();
			cy.get('#trackable-fat').check();
			cy.get('#save-tracking').click();
			cy.wait('@putUser').its('response.statusCode').should('equal', 200);
			cy.contains('Tracking settings updated successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Remove all trackables.
			cy.visit('/profile');
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);
			cy.get('#trackable-calories').should('not.be.checked');
			cy.get('#trackable-protein').should('not.be.checked');
			cy.get('#trackable-sodium').should('be.checked');
			cy.get('#trackable-fat').should('be.checked');
			cy.get('#trackable-sodium').uncheck();
			cy.get('#trackable-fat').uncheck();
			cy.get('#save-tracking').click();
			cy.wait('@putUser').its('response.statusCode').should('equal', 200);
			cy.contains('Tracking settings updated successfully.').should('exist');
			cy.get('.formosa-toast__close').click();

			// Check trackables.
			cy.visit('/profile');
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);
			cy.wait('@getTrackables').its('response.statusCode').should('equal', 200);
			cy.get('#trackable-calories').should('not.be.checked');
			cy.get('#trackable-protein').should('not.be.checked');
			cy.get('#trackable-sodium').should('not.be.checked');
			cy.get('#trackable-fat').should('not.be.checked');
		});
	});

	describe('when changing username', () => {
		describe('with taken username', () => {
			it('shows an error', () => {
				cy.intercept('GET', '**/api/users/**').as('getUser');
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="username"]').clear().type(Cypress.env('taken_username'));
				cy.intercept('PUT', '**/api/users/*').as('putUser');
				cy.get('button').contains('Change username').click();
				cy.wait('@putUser').its('response.statusCode').should('equal', 422);
				cy.get('#username-error').invoke('text').should('equal', 'The username has already been taken.');
				cy.reload();
				cy.get(`[name="username"][value="${Cypress.env('default_username')}"]`).should('exist');
			});
		});

		describe('with valid input', () => {
			it('works', () => {
				cy.intercept('GET', '**/api/users/**').as('getUser');

				// Change.
				const name = `${Cypress.env('default_username')}2`;
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="username"]').clear().type(name);
				cy.intercept('PUT', '**/api/users/*').as('putUser');
				cy.get('button').contains('Change username').click();
				cy.wait('@putUser').its('response.statusCode').should('equal', 200);
				cy.contains('Username changed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.get(`[name="username"][value="${name}"]`).should('exist');

				// Change back.
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="username"]').clear().type(Cypress.env('default_username'));
				cy.get('button').contains('Change username').click();
				cy.wait('@putUser').its('response.statusCode').should('equal', 200);
				cy.contains('Username changed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.get(`[name="username"][value="${Cypress.env('default_username')}"]`).should('exist');
			});
		});
	});

	describe('when changing email', () => {
		describe('with taken email', () => {
			it('shows an error', () => {
				cy.intercept('GET', '**/api/users/**').as('getUser');
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
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
				cy.intercept('GET', '**/api/users/**').as('getUser');
				const email = `${Cypress.env('default_email')}2`;
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
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
				cy.intercept('GET', '**/api/users/**').as('getUser');

				// Change.
				const email = `${Cypress.env('default_email')}2`;
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="email"]').clear().type(email);
				cy.get('#current-password-email').clear().type(Cypress.env('default_password'));
				cy.intercept('PUT', '**/api/users/*/change-email').as('changeEmail');
				cy.get('button').contains('Change email').click();
				cy.wait('@changeEmail').its('response.statusCode').should('equal', 204);
				cy.contains('Email changed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.get(`[name="email"][value="${email}"]`).should('exist');

				// Change back.
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('[name="email"]').clear().type(Cypress.env('default_email'));
				cy.get('#current-password-email').clear().type(Cypress.env('default_password'));
				cy.get('button').contains('Change email').click();
				cy.wait('@changeEmail').its('response.statusCode').should('equal', 204);
				cy.contains('Email changed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
				cy.reload();
				cy.get(`[name="email"][value="${Cypress.env('default_email')}"]`).should('exist');
			});
		});
	});

	describe('when changing password', () => {
		describe('with non-matching passwords', () => {
			it('shows an error', () => {
				cy.intercept('GET', '**/api/users/**').as('getUser');

				// Change.
				const password = `${Cypress.env('default_password')}2`;
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
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
				cy.intercept('GET', '**/api/users/**').as('getUser');

				// Change.
				const password = `${Cypress.env('default_password')}2`;
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
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
				cy.intercept('GET', '**/api/users/**').as('getUser');

				// Change.
				const password = `${Cypress.env('default_password')}2`;
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('#new_password').clear().type(password);
				cy.get('#new_password_confirmation').clear().type(password);
				cy.get('#current-password-password').clear().type(Cypress.env('default_password'));
				cy.intercept('PUT', '**/api/users/*/change-password').as('changePassword');
				cy.get('button').contains('Change password').click();
				cy.wait('@changePassword').its('response.statusCode').should('equal', 204);
				cy.contains('Password changed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();

				// Change back.
				cy.visit('/profile');
				cy.wait('@getUser').its('response.statusCode').should('equal', 200);
				cy.get('#new_password').clear().type(Cypress.env('default_password'));
				cy.get('#new_password_confirmation').clear().type(Cypress.env('default_password'));
				cy.get('#current-password-password').clear().type(password);
				cy.get('button').contains('Change password').click();
				cy.wait('@changePassword').its('response.statusCode').should('equal', 204);
				cy.contains('Password changed successfully.').should('exist');
				cy.get('.formosa-toast__close').click();
			});
		});
	});

	describe('with demo user', () => {
		it('does not allow changing login info', () => {
			cy.intercept('GET', '**/api/users/*').as('getUser');
			cy.intercept('PUT', '**/api/users/*').as('putUser');
			cy.intercept('PUT', '**/api/users/*/change-email').as('changeEmail');
			cy.intercept('PUT', '**/api/users/*/change-password').as('changePassword');
			cy.intercept('DELETE', '**/api/auth/logout').as('logout');

			// Logout.
			cy.get('.nav__link').contains('Profile').click();
			cy.get('.nav__button').contains('Logout').click();
			cy.wait('@logout').its('response.statusCode').should('equal', 204);

			// Login.
			cy.login(Cypress.env('demo_username'), Cypress.env('demo_password'));

			// Go to profile.
			cy.visit('/profile');
			cy.wait('@getUser').its('response.statusCode').should('equal', 200);

			// Change username.
			cy.get('[name="username"]').clear().type('newdemousername');
			cy.get('button').contains('Change username').click();
			cy.wait('@putUser').its('response.statusCode').should('equal', 422);
			cy.get('.formosa-toast').contains('Error.').should('exist');
			cy.contains('The username cannot be changed.').should('exist');
			cy.reload();
			cy.get('[name="username"]').should('have.value', Cypress.env('demo_username'));

			// Change email.
			cy.get('[name="email"]').clear().type('newdemoemail@example.com');
			cy.get('#current-password-email').clear().type(Cypress.env('demo_password'));
			cy.get('button').contains('Change email').click();
			cy.wait('@changeEmail').its('response.statusCode').should('equal', 403);
			cy.get('.formosa-toast').contains('Error.').should('exist');
			cy.contains('You do not have permission to update this record.').should('exist');
			cy.reload();
			cy.get('[name="email"]').should('have.value', Cypress.env('demo_email'));

			// Change password.
			const password = 'newdemopassword';
			cy.get('#new_password').clear().type(password);
			cy.get('#new_password_confirmation').clear().type(password);
			cy.get('#current-password-password').clear().type(Cypress.env('demo_password'));
			cy.get('button').contains('Change password').click();
			cy.wait('@changePassword').its('response.statusCode').should('equal', 403);
			cy.get('.formosa-toast').contains('Error.').should('exist');
			cy.contains('You do not have permission to update this record.').should('exist');
		});
	});
});
