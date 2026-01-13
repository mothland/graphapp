import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './node.reducer';

export const NodeDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const nodeEntity = useAppSelector(state => state.node.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="nodeDetailsHeading">Node</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{nodeEntity.id}</dd>
          <dt>
            <span id="label">Label</span>
          </dt>
          <dd>{nodeEntity.label}</dd>
          <dt>
            <span id="x">X</span>
          </dt>
          <dd>{nodeEntity.x}</dd>
          <dt>
            <span id="y">Y</span>
          </dt>
          <dd>{nodeEntity.y}</dd>
          <dt>Graph</dt>
          <dd>{nodeEntity.graph ? nodeEntity.graph.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/node" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/node/${nodeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default NodeDetail;
