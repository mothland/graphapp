import graph from 'app/entities/graph/graph.reducer';
import node from 'app/entities/node/node.reducer';
import edge from 'app/entities/edge/edge.reducer';
import comment from 'app/entities/comment/comment.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const entitiesReducers = {
  graph,
  node,
  edge,
  comment,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
};

export default entitiesReducers;
