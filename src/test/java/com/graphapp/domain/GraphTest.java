package com.graphapp.domain;

import static com.graphapp.domain.CommentTestSamples.*;
import static com.graphapp.domain.EdgeTestSamples.*;
import static com.graphapp.domain.GraphTestSamples.*;
import static com.graphapp.domain.NodeTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.graphapp.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class GraphTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Graph.class);
        Graph graph1 = getGraphSample1();
        Graph graph2 = new Graph();
        assertThat(graph1).isNotEqualTo(graph2);

        graph2.setId(graph1.getId());
        assertThat(graph1).isEqualTo(graph2);

        graph2 = getGraphSample2();
        assertThat(graph1).isNotEqualTo(graph2);
    }

    @Test
    void nodesTest() {
        Graph graph = getGraphRandomSampleGenerator();
        Node nodeBack = getNodeRandomSampleGenerator();

        graph.addNodes(nodeBack);
        assertThat(graph.getNodes()).containsOnly(nodeBack);
        assertThat(nodeBack.getGraph()).isEqualTo(graph);

        graph.removeNodes(nodeBack);
        assertThat(graph.getNodes()).doesNotContain(nodeBack);
        assertThat(nodeBack.getGraph()).isNull();

        graph.nodes(new HashSet<>(Set.of(nodeBack)));
        assertThat(graph.getNodes()).containsOnly(nodeBack);
        assertThat(nodeBack.getGraph()).isEqualTo(graph);

        graph.setNodes(new HashSet<>());
        assertThat(graph.getNodes()).doesNotContain(nodeBack);
        assertThat(nodeBack.getGraph()).isNull();
    }

    @Test
    void edgesTest() {
        Graph graph = getGraphRandomSampleGenerator();
        Edge edgeBack = getEdgeRandomSampleGenerator();

        graph.addEdges(edgeBack);
        assertThat(graph.getEdges()).containsOnly(edgeBack);
        assertThat(edgeBack.getGraph()).isEqualTo(graph);

        graph.removeEdges(edgeBack);
        assertThat(graph.getEdges()).doesNotContain(edgeBack);
        assertThat(edgeBack.getGraph()).isNull();

        graph.edges(new HashSet<>(Set.of(edgeBack)));
        assertThat(graph.getEdges()).containsOnly(edgeBack);
        assertThat(edgeBack.getGraph()).isEqualTo(graph);

        graph.setEdges(new HashSet<>());
        assertThat(graph.getEdges()).doesNotContain(edgeBack);
        assertThat(edgeBack.getGraph()).isNull();
    }

    @Test
    void commentsTest() {
        Graph graph = getGraphRandomSampleGenerator();
        Comment commentBack = getCommentRandomSampleGenerator();

        graph.addComments(commentBack);
        assertThat(graph.getComments()).containsOnly(commentBack);
        assertThat(commentBack.getGraph()).isEqualTo(graph);

        graph.removeComments(commentBack);
        assertThat(graph.getComments()).doesNotContain(commentBack);
        assertThat(commentBack.getGraph()).isNull();

        graph.comments(new HashSet<>(Set.of(commentBack)));
        assertThat(graph.getComments()).containsOnly(commentBack);
        assertThat(commentBack.getGraph()).isEqualTo(graph);

        graph.setComments(new HashSet<>());
        assertThat(graph.getComments()).doesNotContain(commentBack);
        assertThat(commentBack.getGraph()).isNull();
    }
}
