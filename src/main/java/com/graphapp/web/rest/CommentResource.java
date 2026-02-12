package com.graphapp.web.rest;

import com.graphapp.domain.Comment;
import com.graphapp.repository.CommentRepository;
import com.graphapp.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
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
 * REST controller for managing {@link com.graphapp.domain.Comment}.
 */
@RestController
@RequestMapping("/api/comments")
@Transactional
public class CommentResource {

    private static final Logger LOG = LoggerFactory.getLogger(CommentResource.class);

    private static final String ENTITY_NAME = "comment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CommentRepository commentRepository;

    public CommentResource(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    /**
     * {@code POST  /comments} : Create a new comment.
     *
     * @param comment the comment to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new comment, or with status {@code 400 (Bad Request)} if the comment has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Comment> createComment(@Valid @RequestBody Comment comment) throws URISyntaxException {
        LOG.debug("REST request to save Comment : {}", comment);
        if (comment.getId() != null) {
            throw new BadRequestAlertException("A new comment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(Instant.now());
        }
        comment = commentRepository.save(comment);
        return ResponseEntity.created(new URI("/api/comments/" + comment.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, comment.getId().toString()))
            .body(comment);
    }

    /**
     * {@code PUT  /comments/:id} : Updates an existing comment.
     *
     * @param id the id of the comment to save.
     * @param comment the comment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated comment,
     * or with status {@code 400 (Bad Request)} if the comment is not valid,
     * or with status {@code 500 (Internal Server Error)} if the comment couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Comment comment
    ) throws URISyntaxException {
        LOG.debug("REST request to update Comment : {}, {}", id, comment);
        if (comment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, comment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!commentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        comment = commentRepository.save(comment);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, comment.getId().toString()))
            .body(comment);
    }

    /**
     * {@code PATCH  /comments/:id} : Partial updates given fields of an existing comment, field will ignore if it is null
     *
     * @param id the id of the comment to save.
     * @param comment the comment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated comment,
     * or with status {@code 400 (Bad Request)} if the comment is not valid,
     * or with status {@code 404 (Not Found)} if the comment is not found,
     * or with status {@code 500 (Internal Server Error)} if the comment couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Comment> partialUpdateComment(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Comment comment
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Comment partially : {}, {}", id, comment);
        if (comment.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, comment.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!commentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Comment> result = commentRepository
            .findById(comment.getId())
            .map(existingComment -> {
                if (comment.getContent() != null) {
                    existingComment.setContent(comment.getContent());
                }
                if (comment.getCreatedAt() != null) {
                    existingComment.setCreatedAt(comment.getCreatedAt());
                }

                return existingComment;
            })
            .map(commentRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, comment.getId().toString())
        );
    }

    /**
     * {@code GET  /comments} : get all the comments.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of comments in body.
     */
    @GetMapping("")
    public List<Comment> getAllComments(@RequestParam(value = "graphId", required = false) Long graphId) {
        LOG.debug("REST request to get all Comments for graphId={}", graphId);
        if (graphId != null) {
            return commentRepository.findAllByGraphIdOrderByCreatedAtDescIdDesc(graphId);
        }
        return commentRepository.findAll();
    }

    /**
     * {@code GET  /comments/:id} : get the "id" comment.
     *
     * @param id the id of the comment to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the comment, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Comment> getComment(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Comment : {}", id);
        Optional<Comment> comment = commentRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(comment);
    }

    /**
     * {@code DELETE  /comments/:id} : delete the "id" comment.
     *
     * @param id the id of the comment to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Comment : {}", id);
        commentRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
