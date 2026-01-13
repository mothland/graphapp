package com.graphapp.domain;

import static com.graphapp.domain.EdgeTestSamples.*;
import static com.graphapp.domain.GraphTestSamples.*;
import static com.graphapp.domain.NodeTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.graphapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class EdgeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Edge.class);
        Edge edge1 = getEdgeSample1();
        Edge edge2 = new Edge();
        assertThat(edge1).isNotEqualTo(edge2);

        edge2.setId(edge1.getId());
        assertThat(edge1).isEqualTo(edge2);

        edge2 = getEdgeSample2();
        assertThat(edge1).isNotEqualTo(edge2);
    }

    @Test
    void sourceTest() {
        Edge edge = getEdgeRandomSampleGenerator();
        Node nodeBack = getNodeRandomSampleGenerator();

        edge.setSource(nodeBack);
        assertThat(edge.getSource()).isEqualTo(nodeBack);

        edge.source(null);
        assertThat(edge.getSource()).isNull();
    }

    @Test
    void targetTest() {
        Edge edge = getEdgeRandomSampleGenerator();
        Node nodeBack = getNodeRandomSampleGenerator();

        edge.setTarget(nodeBack);
        assertThat(edge.getTarget()).isEqualTo(nodeBack);

        edge.target(null);
        assertThat(edge.getTarget()).isNull();
    }

    @Test
    void graphTest() {
        Edge edge = getEdgeRandomSampleGenerator();
        Graph graphBack = getGraphRandomSampleGenerator();

        edge.setGraph(graphBack);
        assertThat(edge.getGraph()).isEqualTo(graphBack);

        edge.graph(null);
        assertThat(edge.getGraph()).isNull();
    }
}
