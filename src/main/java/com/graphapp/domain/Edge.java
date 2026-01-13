package com.graphapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Edge.
 */
@Entity
@Table(name = "edge")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Edge implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "weight", nullable = false)
    private Float weight;

    @NotNull
    @Column(name = "directed", nullable = false)
    private Boolean directed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "graph" }, allowSetters = true)
    private Node source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "graph" }, allowSetters = true)
    private Node target;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "nodes", "edges", "comments" }, allowSetters = true)
    private Graph graph;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Edge id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Float getWeight() {
        return this.weight;
    }

    public Edge weight(Float weight) {
        this.setWeight(weight);
        return this;
    }

    public void setWeight(Float weight) {
        this.weight = weight;
    }

    public Boolean getDirected() {
        return this.directed;
    }

    public Edge directed(Boolean directed) {
        this.setDirected(directed);
        return this;
    }

    public void setDirected(Boolean directed) {
        this.directed = directed;
    }

    public Node getSource() {
        return this.source;
    }

    public void setSource(Node node) {
        this.source = node;
    }

    public Edge source(Node node) {
        this.setSource(node);
        return this;
    }

    public Node getTarget() {
        return this.target;
    }

    public void setTarget(Node node) {
        this.target = node;
    }

    public Edge target(Node node) {
        this.setTarget(node);
        return this;
    }

    public Graph getGraph() {
        return this.graph;
    }

    public void setGraph(Graph graph) {
        this.graph = graph;
    }

    public Edge graph(Graph graph) {
        this.setGraph(graph);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Edge)) {
            return false;
        }
        return getId() != null && getId().equals(((Edge) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Edge{" +
            "id=" + getId() +
            ", weight=" + getWeight() +
            ", directed='" + getDirected() + "'" +
            "}";
    }
}
