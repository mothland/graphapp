import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getGraphs } from 'app/entities/graph/graph.reducer';
import { createEntity, getEntity, reset, updateEntity } from './node.reducer';

export const NodeUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const graphs = useAppSelector(state => state.graph.entities);
  const nodeEntity = useAppSelector(state => state.node.entity);
  const loading = useAppSelector(state => state.node.loading);
  const updating = useAppSelector(state => state.node.updating);
  const updateSuccess = useAppSelector(state => state.node.updateSuccess);

  const handleClose = () => {
    navigate('/node');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

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
    if (values.x !== undefined && typeof values.x !== 'number') {
      values.x = Number(values.x);
    }
    if (values.y !== undefined && typeof values.y !== 'number') {
      values.y = Number(values.y);
    }

    const entity = {
      ...nodeEntity,
      ...values,
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
          ...nodeEntity,
          graph: nodeEntity?.graph?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="graphappApp.node.home.createOrEditLabel" data-cy="NodeCreateUpdateHeading">
            Create or edit a Node
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="node-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Label"
                id="node-label"
                name="label"
                data-cy="label"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="X"
                id="node-x"
                name="x"
                data-cy="x"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="Y"
                id="node-y"
                name="y"
                data-cy="y"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField id="node-graph" name="graph" data-cy="graph" label="Graph" type="select">
                <option value="" key="0" />
                {graphs
                  ? graphs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/node" replace color="info">
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

export default NodeUpdate;
