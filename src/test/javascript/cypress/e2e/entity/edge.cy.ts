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

describe('Edge e2e test', () => {
  const edgePageUrl = '/edge';
  const edgePageUrlPattern = new RegExp('/edge(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const edgeSample = { weight: 26757.26, directed: false };

  let edge;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/edges+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/edges').as('postEntityRequest');
    cy.intercept('DELETE', '/api/edges/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (edge) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/edges/${edge.id}`,
      }).then(() => {
        edge = undefined;
      });
    }
  });

  it('Edges menu should load Edges page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('edge');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Edge').should('exist');
    cy.url().should('match', edgePageUrlPattern);
  });

  describe('Edge page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(edgePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Edge page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/edge/new$'));
        cy.getEntityCreateUpdateHeading('Edge');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', edgePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/edges',
          body: edgeSample,
        }).then(({ body }) => {
          edge = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/edges+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [edge],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(edgePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Edge page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('edge');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', edgePageUrlPattern);
      });

      it('edit button click should load edit Edge page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Edge');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', edgePageUrlPattern);
      });

      it('edit button click should load edit Edge page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Edge');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', edgePageUrlPattern);
      });

      it('last delete button click should delete instance of Edge', () => {
        cy.intercept('GET', '/api/edges/*').as('dialogDeleteRequest');
        cy.get(entityDeleteButtonSelector).last().click();
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('edge').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', edgePageUrlPattern);

        edge = undefined;
      });
    });
  });

  describe('new Edge page', () => {
    beforeEach(() => {
      cy.visit(`${edgePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Edge');
    });

    it('should create an instance of Edge', () => {
      cy.get(`[data-cy="weight"]`).type('20148.49');
      cy.get(`[data-cy="weight"]`).should('have.value', '20148.49');

      cy.get(`[data-cy="directed"]`).should('not.be.checked');
      cy.get(`[data-cy="directed"]`).click();
      cy.get(`[data-cy="directed"]`).should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        edge = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', edgePageUrlPattern);
    });
  });
});
