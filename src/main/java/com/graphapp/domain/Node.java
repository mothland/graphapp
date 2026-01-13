package com.graphapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Node.
 */
@Entity
@Table(name = "node")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Node implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "label", nullable = false)
    private String label;

    @NotNull
    @Column(name = "x", nullable = false)
    private Float x;

    @NotNull
    @Column(name = "y", nullable = false)
    private Float y;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "nodes", "edges", "comments" }, allowSetters = true)
    private Graph graph;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Node id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return this.label;
    }

    public Node label(String label) {
        this.setLabel(label);
        return this;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Float getX() {
        return this.x;
    }

    public Node x(Float x) {
        this.setX(x);
        return this;
    }

    public void setX(Float x) {
        this.x = x;
    }

    public Float getY() {
        return this.y;
    }

    public Node y(Float y) {
        this.setY(y);
        return this;
    }

    public void setY(Float y) {
        this.y = y;
    }

    public Graph getGraph() {
        return this.graph;
    }

    public void setGraph(Graph graph) {
        this.graph = graph;
    }

    public Node graph(Graph graph) {
        this.setGraph(graph);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Node)) {
            return false;
        }
        return getId() != null && getId().equals(((Node) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Node{" +
            "id=" + getId() +
            ", label='" + getLabel() + "'" +
            ", x=" + getX() +
            ", y=" + getY() +
            "}";
    }
}
