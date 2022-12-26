describe('calendar', () => {
	beforeEach(() => {
		cy.login();
		cy.deleteAllData();
	});

	describe('navigation', () => {
		it('works', () => {
			cy.intercept('GET', '**/api/calendar/**').as('getCalendar');

			cy.visit('/calendar');
			cy.wait('@getCalendar').its('response.statusCode').should('equal', 200);

			cy.get('#previous').should('be.visible');
			cy.get('#next').should('not.be.visible');
			cy.get('#previous').click();
			cy.get('#previous').should('be.visible');
			cy.get('#next').should('be.visible');
			cy.get('#next').click();
			cy.get('#previous').should('be.visible');
			cy.get('#next').should('not.be.visible');

			cy.visit('/calendar?year=2001');
			cy.get('h1').should('have.text', '2001');

			cy.get('#previous').click();
			cy.get('h1').should('have.text', '2000');
			cy.location('pathname').should('eq', '/calendar');
			cy.location('search').should('eq', '?year=2000');

			cy.get('#next').click();
			cy.get('h1').should('have.text', '2001');
			cy.location('search').should('eq', '?year=2001');

			cy.get('#next').click();
			cy.get('h1').should('have.text', '2002');
			cy.location('search').should('eq', '?year=2002');
		});
	});
});
