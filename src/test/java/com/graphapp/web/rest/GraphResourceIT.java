package com.graphapp.web.rest;

import static com.graphapp.domain.GraphAsserts.*;
import static com.graphapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphapp.IntegrationTest;
import com.graphapp.domain.Graph;
import com.graphapp.repository.GraphRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link GraphResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class GraphResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/graphs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private GraphRepository graphRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGraphMockMvc;

    private Graph graph;

    private Graph insertedGraph;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Graph createEntity() {
        return new Graph().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION).createdAt(DEFAULT_CREATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Graph createUpdatedEntity() {
        return new Graph().name(UPDATED_NAME).description(UPDATED_DESCRIPTION).createdAt(UPDATED_CREATED_AT);
    }

    @BeforeEach
    void initTest() {
        graph = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedGraph != null) {
            graphRepository.delete(insertedGraph);
            insertedGraph = null;
        }
    }

    @Test
    @Transactional
    void createGraph() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Graph
        var returnedGraph = om.readValue(
            restGraphMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(graph)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Graph.class
        );

        // Validate the Graph in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertGraphUpdatableFieldsEquals(returnedGraph, getPersistedGraph(returnedGraph));

        insertedGraph = returnedGraph;
    }

    @Test
    @Transactional
    void createGraphWithExistingId() throws Exception {
        // Create the Graph with an existing ID
        graph.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGraphMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(graph)))
            .andExpect(status().isBadRequest());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        graph.setName(null);

        // Create the Graph, which fails.

        restGraphMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(graph)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllGraphs() throws Exception {
        // Initialize the database
        insertedGraph = graphRepository.saveAndFlush(graph);

        // Get all the graphList
        restGraphMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(graph.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @Test
    @Transactional
    void getGraph() throws Exception {
        // Initialize the database
        insertedGraph = graphRepository.saveAndFlush(graph);

        // Get the graph
        restGraphMockMvc
            .perform(get(ENTITY_API_URL_ID, graph.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(graph.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingGraph() throws Exception {
        // Get the graph
        restGraphMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingGraph() throws Exception {
        // Initialize the database
        insertedGraph = graphRepository.saveAndFlush(graph);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the graph
        Graph updatedGraph = graphRepository.findById(graph.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedGraph are not directly saved in db
        em.detach(updatedGraph);
        updatedGraph.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).createdAt(UPDATED_CREATED_AT);

        restGraphMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGraph.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedGraph))
            )
            .andExpect(status().isOk());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedGraphToMatchAllProperties(updatedGraph);
    }

    @Test
    @Transactional
    void putNonExistingGraph() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        graph.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGraphMockMvc
            .perform(put(ENTITY_API_URL_ID, graph.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(graph)))
            .andExpect(status().isBadRequest());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGraph() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        graph.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGraphMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(graph))
            )
            .andExpect(status().isBadRequest());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGraph() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        graph.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGraphMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(graph)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGraphWithPatch() throws Exception {
        // Initialize the database
        insertedGraph = graphRepository.saveAndFlush(graph);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the graph using partial update
        Graph partialUpdatedGraph = new Graph();
        partialUpdatedGraph.setId(graph.getId());

        partialUpdatedGraph.name(UPDATED_NAME).createdAt(UPDATED_CREATED_AT);

        restGraphMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGraph.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGraph))
            )
            .andExpect(status().isOk());

        // Validate the Graph in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGraphUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedGraph, graph), getPersistedGraph(graph));
    }

    @Test
    @Transactional
    void fullUpdateGraphWithPatch() throws Exception {
        // Initialize the database
        insertedGraph = graphRepository.saveAndFlush(graph);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the graph using partial update
        Graph partialUpdatedGraph = new Graph();
        partialUpdatedGraph.setId(graph.getId());

        partialUpdatedGraph.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).createdAt(UPDATED_CREATED_AT);

        restGraphMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGraph.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGraph))
            )
            .andExpect(status().isOk());

        // Validate the Graph in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGraphUpdatableFieldsEquals(partialUpdatedGraph, getPersistedGraph(partialUpdatedGraph));
    }

    @Test
    @Transactional
    void patchNonExistingGraph() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        graph.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGraphMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, graph.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(graph))
            )
            .andExpect(status().isBadRequest());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGraph() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        graph.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGraphMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(graph))
            )
            .andExpect(status().isBadRequest());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGraph() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        graph.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGraphMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(graph)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Graph in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGraph() throws Exception {
        // Initialize the database
        insertedGraph = graphRepository.saveAndFlush(graph);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the graph
        restGraphMockMvc
            .perform(delete(ENTITY_API_URL_ID, graph.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return graphRepository.count();
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

    protected Graph getPersistedGraph(Graph graph) {
        return graphRepository.findById(graph.getId()).orElseThrow();
    }

    protected void assertPersistedGraphToMatchAllProperties(Graph expectedGraph) {
        assertGraphAllPropertiesEquals(expectedGraph, getPersistedGraph(expectedGraph));
    }

    protected void assertPersistedGraphToMatchUpdatableProperties(Graph expectedGraph) {
        assertGraphAllUpdatablePropertiesEquals(expectedGraph, getPersistedGraph(expectedGraph));
    }
}
