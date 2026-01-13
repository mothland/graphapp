package com.graphapp.domain;

import static com.graphapp.domain.CommentTestSamples.*;
import static com.graphapp.domain.GraphTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.graphapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CommentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Comment.class);
        Comment comment1 = getCommentSample1();
        Comment comment2 = new Comment();
        assertThat(comment1).isNotEqualTo(comment2);

        comment2.setId(comment1.getId());
        assertThat(comment1).isEqualTo(comment2);

        comment2 = getCommentSample2();
        assertThat(comment1).isNotEqualTo(comment2);
    }

    @Test
    void graphTest() {
        Comment comment = getCommentRandomSampleGenerator();
        Graph graphBack = getGraphRandomSampleGenerator();

        comment.setGraph(graphBack);
        assertThat(comment.getGraph()).isEqualTo(graphBack);

        comment.graph(null);
        assertThat(comment.getGraph()).isNull();
    }
}
