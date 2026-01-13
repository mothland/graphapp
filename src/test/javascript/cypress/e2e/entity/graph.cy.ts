import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('Graph e2e test', () => {
  const graphPageUrl = '/graph';
  const graphPageUrlPattern = new RegExp('/graph(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const graphSample = { name: 'back ponder black' };

  let graph;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/graphs+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/graphs').as('postEntityRequest');
    cy.intercept('DELETE', '/api/graphs/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (graph) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/graphs/${graph.id}`,
      }).then(() => {
        graph = undefined;
      });
    }
  });

  it('Graphs menu should load Graphs page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('graph');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Graph').should('exist');
    cy.url().should('match', graphPageUrlPattern);
  });

  describe('Graph page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(graphPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Graph page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/graph/new$'));
        cy.getEntityCreateUpdateHeading('Graph');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', graphPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/graphs',
          body: graphSample,
        }).then(({ body }) => {
          graph = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/graphs+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [graph],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(graphPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Graph page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('graph');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', graphPageUrlPattern);
      });

      it('edit button click should load edit Graph page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Graph');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', graphPageUrlPattern);
      });

      it('edit button click should load edit Graph page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Graph');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', graphPageUrlPattern);
      });

      it('last delete button click should delete instance of Graph', () => {
        cy.intercept('GET', '/api/graphs/*').as('dialogDeleteRequest');
        cy.get(entityDeleteButtonSelector).last().click();
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('graph').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', graphPageUrlPattern);

        graph = undefined;
      });
    });
  });

  describe('new Graph page', () => {
    beforeEach(() => {
      cy.visit(`${graphPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Graph');
    });

    it('should create an instance of Graph', () => {
      cy.get(`[data-cy="name"]`).type('vainly as');
      cy.get(`[data-cy="name"]`).should('have.value', 'vainly as');

      cy.get(`[data-cy="description"]`).type('intensely cruelly overdub');
      cy.get(`[data-cy="description"]`).should('have.value', 'intensely cruelly overdub');

      cy.get(`[data-cy="createdAt"]`).type('2026-01-12T21:55');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-01-12T21:55');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        graph = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', graphPageUrlPattern);
    });
  });
});
