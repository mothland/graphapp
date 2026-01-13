package com.graphapp.web.rest;

import com.graphapp.domain.Edge;
import com.graphapp.repository.EdgeRepository;
import com.graphapp.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
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
 * REST controller for managing {@link com.graphapp.domain.Edge}.
 */
@RestController
@RequestMapping("/api/edges")
@Transactional
public class EdgeResource {

    private static final Logger LOG = LoggerFactory.getLogger(EdgeResource.class);

    private static final String ENTITY_NAME = "edge";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EdgeRepository edgeRepository;

    public EdgeResource(EdgeRepository edgeRepository) {
        this.edgeRepository = edgeRepository;
    }

    /**
     * {@code POST  /edges} : Create a new edge.
     *
     * @param edge the edge to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new edge, or with status {@code 400 (Bad Request)} if the edge has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Edge> createEdge(@Valid @RequestBody Edge edge) throws URISyntaxException {
        LOG.debug("REST request to save Edge : {}", edge);
        if (edge.getId() != null) {
            throw new BadRequestAlertException("A new edge cannot already have an ID", ENTITY_NAME, "idexists");
        }
        edge = edgeRepository.save(edge);
        return ResponseEntity.created(new URI("/api/edges/" + edge.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, edge.getId().toString()))
            .body(edge);
    }

    /**
     * {@code PUT  /edges/:id} : Updates an existing edge.
     *
     * @param id the id of the edge to save.
     * @param edge the edge to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated edge,
     * or with status {@code 400 (Bad Request)} if the edge is not valid,
     * or with status {@code 500 (Internal Server Error)} if the edge couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Edge> updateEdge(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Edge edge)
        throws URISyntaxException {
        LOG.debug("REST request to update Edge : {}, {}", id, edge);
        if (edge.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, edge.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!edgeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        edge = edgeRepository.save(edge);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, edge.getId().toString()))
            .body(edge);
    }

    /**
     * {@code PATCH  /edges/:id} : Partial updates given fields of an existing edge, field will ignore if it is null
     *
     * @param id the id of the edge to save.
     * @param edge the edge to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated edge,
     * or with status {@code 400 (Bad Request)} if the edge is not valid,
     * or with status {@code 404 (Not Found)} if the edge is not found,
     * or with status {@code 500 (Internal Server Error)} if the edge couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Edge> partialUpdateEdge(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Edge edge
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Edge partially : {}, {}", id, edge);
        if (edge.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, edge.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!edgeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Edge> result = edgeRepository
            .findById(edge.getId())
            .map(existingEdge -> {
                if (edge.getWeight() != null) {
                    existingEdge.setWeight(edge.getWeight());
                }
                if (edge.getDirected() != null) {
                    existingEdge.setDirected(edge.getDirected());
                }

                return existingEdge;
            })
            .map(edgeRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, edge.getId().toString())
        );
    }

    /**
     * {@code GET  /edges} : get all the edges.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of edges in body.
     */
    @GetMapping("")
    public List<Edge> getAllEdges() {
        LOG.debug("REST request to get all Edges");
        return edgeRepository.findAll();
    }

    /**
     * {@code GET  /edges/:id} : get the "id" edge.
     *
     * @param id the id of the edge to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the edge, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Edge> getEdge(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Edge : {}", id);
        Optional<Edge> edge = edgeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(edge);
    }

    /**
     * {@code DELETE  /edges/:id} : delete the "id" edge.
     *
     * @param id the id of the edge to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEdge(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Edge : {}", id);
        edgeRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
