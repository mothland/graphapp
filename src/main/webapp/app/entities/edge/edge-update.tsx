import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getNodes } from 'app/entities/node/node.reducer';
import { getEntities as getGraphs } from 'app/entities/graph/graph.reducer';
import { createEntity, getEntity, reset, updateEntity } from './edge.reducer';

export const EdgeUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const nodes = useAppSelector(state => state.node.entities);
  const graphs = useAppSelector(state => state.graph.entities);
  const edgeEntity = useAppSelector(state => state.edge.entity);
  const loading = useAppSelector(state => state.edge.loading);
  const updating = useAppSelector(state => state.edge.updating);
  const updateSuccess = useAppSelector(state => state.edge.updateSuccess);

  const handleClose = () => {
    navigate('/edge');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getNodes({}));
    dispatch(getGraphs({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    if (values.weight !== undefined && typeof values.weight !== 'number') {
      values.weight = Number(values.weight);
    }

    const entity = {
      ...edgeEntity,
      ...values,
      source: nodes.find(it => it.id.toString() === values.source?.toString()),
      target: nodes.find(it => it.id.toString() === values.target?.toString()),
      graph: graphs.find(it => it.id.toString() === values.graph?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...edgeEntity,
          source: edgeEntity?.source?.id,
          target: edgeEntity?.target?.id,
          graph: edgeEntity?.graph?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="graphappApp.edge.home.createOrEditLabel" data-cy="EdgeCreateUpdateHeading">
            Create or edit a Edge
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="edge-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Weight"
                id="edge-weight"
                name="weight"
                data-cy="weight"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField label="Directed" id="edge-directed" name="directed" data-cy="directed" check type="checkbox" />
              <ValidatedField id="edge-source" name="source" data-cy="source" label="Source" type="select">
                <option value="" key="0" />
                {nodes
                  ? nodes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="edge-target" name="target" data-cy="target" label="Target" type="select">
                <option value="" key="0" />
                {nodes
                  ? nodes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="edge-graph" name="graph" data-cy="graph" label="Graph" type="select">
                <option value="" key="0" />
                {graphs
                  ? graphs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/edge" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default EdgeUpdate;
