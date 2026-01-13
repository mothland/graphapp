package com.graphapp.web.rest;

import com.graphapp.domain.Node;
import com.graphapp.repository.NodeRepository;
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
 * REST controller for managing {@link com.graphapp.domain.Node}.
 */
@RestController
@RequestMapping("/api/nodes")
@Transactional
public class NodeResource {

    private static final Logger LOG = LoggerFactory.getLogger(NodeResource.class);

    private static final String ENTITY_NAME = "node";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final NodeRepository nodeRepository;

    public NodeResource(NodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    /**
     * {@code POST  /nodes} : Create a new node.
     *
     * @param node the node to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new node, or with status {@code 400 (Bad Request)} if the node has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Node> createNode(@Valid @RequestBody Node node) throws URISyntaxException {
        LOG.debug("REST request to save Node : {}", node);
        if (node.getId() != null) {
            throw new BadRequestAlertException("A new node cannot already have an ID", ENTITY_NAME, "idexists");
        }
        node = nodeRepository.save(node);
        return ResponseEntity.created(new URI("/api/nodes/" + node.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, node.getId().toString()))
            .body(node);
    }

    /**
     * {@code PUT  /nodes/:id} : Updates an existing node.
     *
     * @param id the id of the node to save.
     * @param node the node to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated node,
     * or with status {@code 400 (Bad Request)} if the node is not valid,
     * or with status {@code 500 (Internal Server Error)} if the node couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Node> updateNode(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Node node)
        throws URISyntaxException {
        LOG.debug("REST request to update Node : {}, {}", id, node);
        if (node.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, node.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!nodeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        node = nodeRepository.save(node);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, node.getId().toString()))
            .body(node);
    }

    /**
     * {@code PATCH  /nodes/:id} : Partial updates given fields of an existing node, field will ignore if it is null
     *
     * @param id the id of the node to save.
     * @param node the node to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated node,
     * or with status {@code 400 (Bad Request)} if the node is not valid,
     * or with status {@code 404 (Not Found)} if the node is not found,
     * or with status {@code 500 (Internal Server Error)} if the node couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Node> partialUpdateNode(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Node node
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Node partially : {}, {}", id, node);
        if (node.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, node.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!nodeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Node> result = nodeRepository
            .findById(node.getId())
            .map(existingNode -> {
                if (node.getLabel() != null) {
                    existingNode.setLabel(node.getLabel());
                }
                if (node.getX() != null) {
                    existingNode.setX(node.getX());
                }
                if (node.getY() != null) {
                    existingNode.setY(node.getY());
                }

                return existingNode;
            })
            .map(nodeRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, node.getId().toString())
        );
    }

    /**
     * {@code GET  /nodes} : get all the nodes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of nodes in body.
     */
    @GetMapping("")
    public List<Node> getAllNodes() {
        LOG.debug("REST request to get all Nodes");
        return nodeRepository.findAll();
    }

    /**
     * {@code GET  /nodes/:id} : get the "id" node.
     *
     * @param id the id of the node to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the node, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Node> getNode(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Node : {}", id);
        Optional<Node> node = nodeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(node);
    }

    /**
     * {@code DELETE  /nodes/:id} : delete the "id" node.
     *
     * @param id the id of the node to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Node : {}", id);
        nodeRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
