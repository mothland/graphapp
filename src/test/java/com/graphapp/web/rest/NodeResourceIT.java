package com.graphapp.web.rest;

import static com.graphapp.domain.NodeAsserts.*;
import static com.graphapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphapp.IntegrationTest;
import com.graphapp.domain.Node;
import com.graphapp.repository.NodeRepository;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link NodeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class NodeResourceIT {

    private static final String DEFAULT_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_LABEL = "BBBBBBBBBB";

    private static final Float DEFAULT_X = 1F;
    private static final Float UPDATED_X = 2F;

    private static final Float DEFAULT_Y = 1F;
    private static final Float UPDATED_Y = 2F;

    private static final String ENTITY_API_URL = "/api/nodes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNodeMockMvc;

    private Node node;

    private Node insertedNode;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Node createEntity() {
        return new Node().label(DEFAULT_LABEL).x(DEFAULT_X).y(DEFAULT_Y);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Node createUpdatedEntity() {
        return new Node().label(UPDATED_LABEL).x(UPDATED_X).y(UPDATED_Y);
    }

    @BeforeEach
    void initTest() {
        node = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedNode != null) {
            nodeRepository.delete(insertedNode);
            insertedNode = null;
        }
    }

    @Test
    @Transactional
    void createNode() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Node
        var returnedNode = om.readValue(
            restNodeMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Node.class
        );

        // Validate the Node in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertNodeUpdatableFieldsEquals(returnedNode, getPersistedNode(returnedNode));

        insertedNode = returnedNode;
    }

    @Test
    @Transactional
    void createNodeWithExistingId() throws Exception {
        // Create the Node with an existing ID
        node.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNodeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
            .andExpect(status().isBadRequest());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        node.setLabel(null);

        // Create the Node, which fails.

        restNodeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkXIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        node.setX(null);

        // Create the Node, which fails.

        restNodeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkYIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        node.setY(null);

        // Create the Node, which fails.

        restNodeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllNodes() throws Exception {
        // Initialize the database
        insertedNode = nodeRepository.saveAndFlush(node);

        // Get all the nodeList
        restNodeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(node.getId().intValue())))
            .andExpect(jsonPath("$.[*].label").value(hasItem(DEFAULT_LABEL)))
            .andExpect(jsonPath("$.[*].x").value(hasItem(DEFAULT_X.doubleValue())))
            .andExpect(jsonPath("$.[*].y").value(hasItem(DEFAULT_Y.doubleValue())));
    }

    @Test
    @Transactional
    void getNode() throws Exception {
        // Initialize the database
        insertedNode = nodeRepository.saveAndFlush(node);

        // Get the node
        restNodeMockMvc
            .perform(get(ENTITY_API_URL_ID, node.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(node.getId().intValue()))
            .andExpect(jsonPath("$.label").value(DEFAULT_LABEL))
            .andExpect(jsonPath("$.x").value(DEFAULT_X.doubleValue()))
            .andExpect(jsonPath("$.y").value(DEFAULT_Y.doubleValue()));
    }

    @Test
    @Transactional
    void getNonExistingNode() throws Exception {
        // Get the node
        restNodeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingNode() throws Exception {
        // Initialize the database
        insertedNode = nodeRepository.saveAndFlush(node);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the node
        Node updatedNode = nodeRepository.findById(node.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedNode are not directly saved in db
        em.detach(updatedNode);
        updatedNode.label(UPDATED_LABEL).x(UPDATED_X).y(UPDATED_Y);

        restNodeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedNode.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedNode))
            )
            .andExpect(status().isOk());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedNodeToMatchAllProperties(updatedNode);
    }

    @Test
    @Transactional
    void putNonExistingNode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        node.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNodeMockMvc
            .perform(put(ENTITY_API_URL_ID, node.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
            .andExpect(status().isBadRequest());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        node.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(node))
            )
            .andExpect(status().isBadRequest());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        node.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(node)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNodeWithPatch() throws Exception {
        // Initialize the database
        insertedNode = nodeRepository.saveAndFlush(node);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the node using partial update
        Node partialUpdatedNode = new Node();
        partialUpdatedNode.setId(node.getId());

        partialUpdatedNode.label(UPDATED_LABEL);

        restNodeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNode.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNode))
            )
            .andExpect(status().isOk());

        // Validate the Node in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNodeUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedNode, node), getPersistedNode(node));
    }

    @Test
    @Transactional
    void fullUpdateNodeWithPatch() throws Exception {
        // Initialize the database
        insertedNode = nodeRepository.saveAndFlush(node);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the node using partial update
        Node partialUpdatedNode = new Node();
        partialUpdatedNode.setId(node.getId());

        partialUpdatedNode.label(UPDATED_LABEL).x(UPDATED_X).y(UPDATED_Y);

        restNodeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNode.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNode))
            )
            .andExpect(status().isOk());

        // Validate the Node in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNodeUpdatableFieldsEquals(partialUpdatedNode, getPersistedNode(partialUpdatedNode));
    }

    @Test
    @Transactional
    void patchNonExistingNode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        node.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNodeMockMvc
            .perform(patch(ENTITY_API_URL_ID, node.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(node)))
            .andExpect(status().isBadRequest());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        node.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(node))
            )
            .andExpect(status().isBadRequest());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        node.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(node)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Node in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNode() throws Exception {
        // Initialize the database
        insertedNode = nodeRepository.saveAndFlush(node);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the node
        restNodeMockMvc
            .perform(delete(ENTITY_API_URL_ID, node.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return nodeRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Node getPersistedNode(Node node) {
        return nodeRepository.findById(node.getId()).orElseThrow();
    }

    protected void assertPersistedNodeToMatchAllProperties(Node expectedNode) {
        assertNodeAllPropertiesEquals(expectedNode, getPersistedNode(expectedNode));
    }

    protected void assertPersistedNodeToMatchUpdatableProperties(Node expectedNode) {
        assertNodeAllUpdatablePropertiesEquals(expectedNode, getPersistedNode(expectedNode));
    }
}
