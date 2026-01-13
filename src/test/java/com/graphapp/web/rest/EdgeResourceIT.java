package com.graphapp.web.rest;

import static com.graphapp.domain.EdgeAsserts.*;
import static com.graphapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphapp.IntegrationTest;
import com.graphapp.domain.Edge;
import com.graphapp.repository.EdgeRepository;
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
 * Integration tests for the {@link EdgeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class EdgeResourceIT {

    private static final Float DEFAULT_WEIGHT = 1F;
    private static final Float UPDATED_WEIGHT = 2F;

    private static final Boolean DEFAULT_DIRECTED = false;
    private static final Boolean UPDATED_DIRECTED = true;

    private static final String ENTITY_API_URL = "/api/edges";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private EdgeRepository edgeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEdgeMockMvc;

    private Edge edge;

    private Edge insertedEdge;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Edge createEntity() {
        return new Edge().weight(DEFAULT_WEIGHT).directed(DEFAULT_DIRECTED);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Edge createUpdatedEntity() {
        return new Edge().weight(UPDATED_WEIGHT).directed(UPDATED_DIRECTED);
    }

    @BeforeEach
    void initTest() {
        edge = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedEdge != null) {
            edgeRepository.delete(insertedEdge);
            insertedEdge = null;
        }
    }

    @Test
    @Transactional
    void createEdge() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Edge
        var returnedEdge = om.readValue(
            restEdgeMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(edge)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Edge.class
        );

        // Validate the Edge in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertEdgeUpdatableFieldsEquals(returnedEdge, getPersistedEdge(returnedEdge));

        insertedEdge = returnedEdge;
    }

    @Test
    @Transactional
    void createEdgeWithExistingId() throws Exception {
        // Create the Edge with an existing ID
        edge.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEdgeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(edge)))
            .andExpect(status().isBadRequest());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkWeightIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        edge.setWeight(null);

        // Create the Edge, which fails.

        restEdgeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(edge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDirectedIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        edge.setDirected(null);

        // Create the Edge, which fails.

        restEdgeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(edge)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEdges() throws Exception {
        // Initialize the database
        insertedEdge = edgeRepository.saveAndFlush(edge);

        // Get all the edgeList
        restEdgeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(edge.getId().intValue())))
            .andExpect(jsonPath("$.[*].weight").value(hasItem(DEFAULT_WEIGHT.doubleValue())))
            .andExpect(jsonPath("$.[*].directed").value(hasItem(DEFAULT_DIRECTED)));
    }

    @Test
    @Transactional
    void getEdge() throws Exception {
        // Initialize the database
        insertedEdge = edgeRepository.saveAndFlush(edge);

        // Get the edge
        restEdgeMockMvc
            .perform(get(ENTITY_API_URL_ID, edge.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(edge.getId().intValue()))
            .andExpect(jsonPath("$.weight").value(DEFAULT_WEIGHT.doubleValue()))
            .andExpect(jsonPath("$.directed").value(DEFAULT_DIRECTED));
    }

    @Test
    @Transactional
    void getNonExistingEdge() throws Exception {
        // Get the edge
        restEdgeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingEdge() throws Exception {
        // Initialize the database
        insertedEdge = edgeRepository.saveAndFlush(edge);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the edge
        Edge updatedEdge = edgeRepository.findById(edge.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedEdge are not directly saved in db
        em.detach(updatedEdge);
        updatedEdge.weight(UPDATED_WEIGHT).directed(UPDATED_DIRECTED);

        restEdgeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedEdge.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedEdge))
            )
            .andExpect(status().isOk());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedEdgeToMatchAllProperties(updatedEdge);
    }

    @Test
    @Transactional
    void putNonExistingEdge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        edge.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEdgeMockMvc
            .perform(put(ENTITY_API_URL_ID, edge.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(edge)))
            .andExpect(status().isBadRequest());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEdge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        edge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEdgeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(edge))
            )
            .andExpect(status().isBadRequest());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEdge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        edge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEdgeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(edge)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEdgeWithPatch() throws Exception {
        // Initialize the database
        insertedEdge = edgeRepository.saveAndFlush(edge);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the edge using partial update
        Edge partialUpdatedEdge = new Edge();
        partialUpdatedEdge.setId(edge.getId());

        partialUpdatedEdge.weight(UPDATED_WEIGHT);

        restEdgeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEdge.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEdge))
            )
            .andExpect(status().isOk());

        // Validate the Edge in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEdgeUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedEdge, edge), getPersistedEdge(edge));
    }

    @Test
    @Transactional
    void fullUpdateEdgeWithPatch() throws Exception {
        // Initialize the database
        insertedEdge = edgeRepository.saveAndFlush(edge);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the edge using partial update
        Edge partialUpdatedEdge = new Edge();
        partialUpdatedEdge.setId(edge.getId());

        partialUpdatedEdge.weight(UPDATED_WEIGHT).directed(UPDATED_DIRECTED);

        restEdgeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEdge.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEdge))
            )
            .andExpect(status().isOk());

        // Validate the Edge in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEdgeUpdatableFieldsEquals(partialUpdatedEdge, getPersistedEdge(partialUpdatedEdge));
    }

    @Test
    @Transactional
    void patchNonExistingEdge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        edge.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEdgeMockMvc
            .perform(patch(ENTITY_API_URL_ID, edge.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(edge)))
            .andExpect(status().isBadRequest());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEdge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        edge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEdgeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(edge))
            )
            .andExpect(status().isBadRequest());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEdge() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        edge.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEdgeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(edge)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Edge in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEdge() throws Exception {
        // Initialize the database
        insertedEdge = edgeRepository.saveAndFlush(edge);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the edge
        restEdgeMockMvc
            .perform(delete(ENTITY_API_URL_ID, edge.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return edgeRepository.count();
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

    protected Edge getPersistedEdge(Edge edge) {
        return edgeRepository.findById(edge.getId()).orElseThrow();
    }

    protected void assertPersistedEdgeToMatchAllProperties(Edge expectedEdge) {
        assertEdgeAllPropertiesEquals(expectedEdge, getPersistedEdge(expectedEdge));
    }

    protected void assertPersistedEdgeToMatchUpdatableProperties(Edge expectedEdge) {
        assertEdgeAllUpdatablePropertiesEquals(expectedEdge, getPersistedEdge(expectedEdge));
    }
}
