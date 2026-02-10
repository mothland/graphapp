package com.graphapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A Graph.
 */
@Entity
@Table(name = "graph")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Graph implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at")
    private Instant createdAt;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "graph", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "graph" }, allowSetters = true)
    private Set<Node> nodes = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "graph", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "source", "target", "graph" }, allowSetters = true)
    private Set<Edge> edges = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "graph", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "graph" }, allowSetters = true)
    private Set<Comment> comments = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Graph id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Graph name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Graph description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Graph createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Set<Node> getNodes() {
        return this.nodes;
    }

    public void setNodes(Set<Node> nodes) {
        if (this.nodes != null) {
            this.nodes.forEach(i -> i.setGraph(null));
        }
        if (nodes != null) {
            nodes.forEach(i -> i.setGraph(this));
        }
        this.nodes = nodes;
    }

    public Graph nodes(Set<Node> nodes) {
        this.setNodes(nodes);
        return this;
    }

    public Graph addNodes(Node node) {
        this.nodes.add(node);
        node.setGraph(this);
        return this;
    }

    public Graph removeNodes(Node node) {
        this.nodes.remove(node);
        node.setGraph(null);
        return this;
    }

    public Set<Edge> getEdges() {
        return this.edges;
    }

    public void setEdges(Set<Edge> edges) {
        if (this.edges != null) {
            this.edges.forEach(i -> i.setGraph(null));
        }
        if (edges != null) {
            edges.forEach(i -> i.setGraph(this));
        }
        this.edges = edges;
    }

    public Graph edges(Set<Edge> edges) {
        this.setEdges(edges);
        return this;
    }

    public Graph addEdges(Edge edge) {
        this.edges.add(edge);
        edge.setGraph(this);
        return this;
    }

    public Graph removeEdges(Edge edge) {
        this.edges.remove(edge);
        edge.setGraph(null);
        return this;
    }

    public Set<Comment> getComments() {
        return this.comments;
    }

    public void setComments(Set<Comment> comments) {
        if (this.comments != null) {
            this.comments.forEach(i -> i.setGraph(null));
        }
        if (comments != null) {
            comments.forEach(i -> i.setGraph(this));
        }
        this.comments = comments;
    }

    public Graph comments(Set<Comment> comments) {
        this.setComments(comments);
        return this;
    }

    public Graph addComments(Comment comment) {
        this.comments.add(comment);
        comment.setGraph(this);
        return this;
    }

    public Graph removeComments(Comment comment) {
        this.comments.remove(comment);
        comment.setGraph(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Graph)) {
            return false;
        }
        return getId() != null && getId().equals(((Graph) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Graph{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
