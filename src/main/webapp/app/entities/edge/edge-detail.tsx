import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './edge.reducer';

export const EdgeDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const edgeEntity = useAppSelector(state => state.edge.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="edgeDetailsHeading">Edge</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{edgeEntity.id}</dd>
          <dt>
            <span id="weight">Weight</span>
          </dt>
          <dd>{edgeEntity.weight}</dd>
          <dt>
            <span id="directed">Directed</span>
          </dt>
          <dd>{edgeEntity.directed ? 'true' : 'false'}</dd>
          <dt>Source</dt>
          <dd>{edgeEntity.source ? edgeEntity.source.id : ''}</dd>
          <dt>Target</dt>
          <dd>{edgeEntity.target ? edgeEntity.target.id : ''}</dd>
          <dt>Graph</dt>
          <dd>{edgeEntity.graph ? edgeEntity.graph.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/edge" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/edge/${edgeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default EdgeDetail;
