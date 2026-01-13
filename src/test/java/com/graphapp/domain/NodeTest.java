package com.graphapp.domain;

import static com.graphapp.domain.GraphTestSamples.*;
import static com.graphapp.domain.NodeTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.graphapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NodeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Node.class);
        Node node1 = getNodeSample1();
        Node node2 = new Node();
        assertThat(node1).isNotEqualTo(node2);

        node2.setId(node1.getId());
        assertThat(node1).isEqualTo(node2);

        node2 = getNodeSample2();
        assertThat(node1).isNotEqualTo(node2);
    }

    @Test
    void graphTest() {
        Node node = getNodeRandomSampleGenerator();
        Graph graphBack = getGraphRandomSampleGenerator();

        node.setGraph(graphBack);
        assertThat(node.getGraph()).isEqualTo(graphBack);

        node.graph(null);
        assertThat(node.getGraph()).isNull();
    }
}
