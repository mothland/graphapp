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

describe('Node e2e test', () => {
  const nodePageUrl = '/node';
  const nodePageUrlPattern = new RegExp('/node(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const nodeSample = { label: 'lest psst so', x: 9617.83, y: 6577.4 };

  let node;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/nodes+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/nodes').as('postEntityRequest');
    cy.intercept('DELETE', '/api/nodes/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (node) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/nodes/${node.id}`,
      }).then(() => {
        node = undefined;
      });
    }
  });

  it('Nodes menu should load Nodes page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('node');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Node').should('exist');
    cy.url().should('match', nodePageUrlPattern);
  });

  describe('Node page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(nodePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Node page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/node/new$'));
        cy.getEntityCreateUpdateHeading('Node');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', nodePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/nodes',
          body: nodeSample,
        }).then(({ body }) => {
          node = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/nodes+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [node],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(nodePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Node page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('node');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', nodePageUrlPattern);
      });

      it('edit button click should load edit Node page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Node');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', nodePageUrlPattern);
      });

      it('edit button click should load edit Node page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Node');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', nodePageUrlPattern);
      });

      it('last delete button click should delete instance of Node', () => {
        cy.intercept('GET', '/api/nodes/*').as('dialogDeleteRequest');
        cy.get(entityDeleteButtonSelector).last().click();
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('node').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', nodePageUrlPattern);

        node = undefined;
      });
    });
  });

  describe('new Node page', () => {
    beforeEach(() => {
      cy.visit(`${nodePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Node');
    });

    it('should create an instance of Node', () => {
      cy.get(`[data-cy="label"]`).type('fellow');
      cy.get(`[data-cy="label"]`).should('have.value', 'fellow');

      cy.get(`[data-cy="x"]`).type('6690.24');
      cy.get(`[data-cy="x"]`).should('have.value', '6690.24');

      cy.get(`[data-cy="y"]`).type('16368.28');
      cy.get(`[data-cy="y"]`).should('have.value', '16368.28');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        node = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', nodePageUrlPattern);
    });
  });
});
