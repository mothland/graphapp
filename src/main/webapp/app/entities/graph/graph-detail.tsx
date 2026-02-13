import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './graph.reducer';

export const GraphDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const graphEntity = useAppSelector(state => state.graph.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="graphDetailsHeading">Graph</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{graphEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{graphEntity.name}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{graphEntity.description}</dd>
          <dt>
            <span id="createdAt">Created At</span>
          </dt>
          <dd>{graphEntity.createdAt ? <TextFormat value={graphEntity.createdAt} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
        </dl>
        <Button tag={Link} to="/" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/graph/${graphEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default GraphDetail;
