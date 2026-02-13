package com.graphapp.web.rest;

import com.graphapp.domain.Graph;
import com.graphapp.repository.GraphRepository;
import com.graphapp.service.dto.FullGraphDTO;
import com.graphapp.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.graphapp.domain.Graph}.
 */
@RestController
@RequestMapping("/api/graphs")
@Transactional
public class GraphResource {

    private static final Logger LOG = LoggerFactory.getLogger(GraphResource.class);

    private static final String ENTITY_NAME = "graph";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GraphRepository graphRepository;

    public GraphResource(GraphRepository graphRepository) {
        this.graphRepository = graphRepository;
    }

    /**
     * {@code POST  /graphs} : Create a new graph.
     *
     * @param graph the graph to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new graph, or with status {@code 400 (Bad Request)} if the graph has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Graph> createGraph(@Valid @RequestBody Graph graph) throws URISyntaxException {
        LOG.debug("REST request to save Graph : {}", graph);
        if (graph.getId() != null) {
            throw new BadRequestAlertException("A new graph cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (graph.getCreatedAt() == null) {
            graph.setCreatedAt(Instant.now());
        }
        graph = graphRepository.save(graph);
        return ResponseEntity.created(new URI("/api/graphs/" + graph.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, graph.getId().toString()))
            .body(graph);
    }

    /**
     * {@code PUT  /graphs/:id} : Updates an existing graph.
     *
     * @param id the id of the graph to save.
     * @param graph the graph to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated graph,
     * or with status {@code 400 (Bad Request)} if the graph is not valid,
     * or with status {@code 500 (Internal Server Error)} if the graph couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Graph> updateGraph(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Graph graph)
        throws URISyntaxException {
        LOG.debug("REST request to update Graph : {}, {}", id, graph);
        if (graph.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, graph.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!graphRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        graph = graphRepository.save(graph);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, graph.getId().toString()))
            .body(graph);
    }

    /**
     * {@code PATCH  /graphs/:id} : Partial updates given fields of an existing graph, field will ignore if it is null
     *
     * @param id the id of the graph to save.
     * @param graph the graph to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated graph,
     * or with status {@code 400 (Bad Request)} if the graph is not valid,
     * or with status {@code 404 (Not Found)} if the graph is not found,
     * or with status {@code 500 (Internal Server Error)} if the graph couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Graph> partialUpdateGraph(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Graph graph
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Graph partially : {}, {}", id, graph);
        if (graph.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, graph.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!graphRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Graph> result = graphRepository
            .findById(graph.getId())
            .map(existingGraph -> {
                if (graph.getName() != null) {
                    existingGraph.setName(graph.getName());
                }
                if (graph.getDescription() != null) {
                    existingGraph.setDescription(graph.getDescription());
                }
                if (graph.getCreatedAt() != null) {
                    existingGraph.setCreatedAt(graph.getCreatedAt());
                }

                return existingGraph;
            })
            .map(graphRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, graph.getId().toString())
        );
    }

    /**
     * {@code GET  /graphs} : get all the graphs.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of graphs in body.
     */
    @GetMapping("")
    public List<Graph> getAllGraphs() {
        LOG.debug("REST request to get all Graphs");
        return graphRepository.findAll();
    }

    /**
     * {@code GET  /graphs/:id} : get the "id" graph.
     *
     * @param id the id of the graph to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the graph, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Graph> getGraph(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Graph : {}", id);
        Optional<Graph> graph = graphRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(graph);
    }

    /**
     * {@code DELETE  /graphs/:id} : delete the "id" graph.
     *
     * @param id the id of the graph to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGraph(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Graph : {}", id);
        graphRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @GetMapping("/{id}/full")
    @Transactional(readOnly = true)
    public ResponseEntity<FullGraphDTO> getFullGraph(@PathVariable Long id) {
        LOG.debug("REST request to get FULL Graph aggregate by id : {}", id);

        return graphRepository
            .findById(id)
            .map(graph -> {
                // ---- Graph DTO
                FullGraphDTO.GraphDTO graphDTO = new FullGraphDTO.GraphDTO();
                graphDTO.id = graph.getId();
                graphDTO.name = graph.getName();
                graphDTO.description = graph.getDescription();

                // ---- Nodes DTOs
                var nodeDTOs = graph
                    .getNodes()
                    .stream()
                    .map(n -> {
                        FullGraphDTO.NodeDTO dto = new FullGraphDTO.NodeDTO();
                        dto.id = n.getId();
                        dto.label = n.getLabel();
                        dto.x = n.getX();
                        dto.y = n.getY();
                        return dto;
                    })
                    .toList();

                // ---- Edges DTOs
                var edgeDTOs = graph
                    .getEdges()
                    .stream()
                    .map(e -> {
                        FullGraphDTO.EdgeDTO dto = new FullGraphDTO.EdgeDTO();
                        dto.id = e.getId();
                        dto.source = e.getSource().getId();
                        dto.target = e.getTarget().getId();
                        dto.weight = e.getWeight();
                        dto.directed = e.getDirected();
                        return dto;
                    })
                    .toList();

                return ResponseEntity.ok(new FullGraphDTO(graphDTO, nodeDTOs, edgeDTOs));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
