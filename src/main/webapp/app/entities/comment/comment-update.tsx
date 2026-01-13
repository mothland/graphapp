import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getGraphs } from 'app/entities/graph/graph.reducer';
import { createEntity, getEntity, reset, updateEntity } from './comment.reducer';

export const CommentUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const graphs = useAppSelector(state => state.graph.entities);
  const commentEntity = useAppSelector(state => state.comment.entity);
  const loading = useAppSelector(state => state.comment.loading);
  const updating = useAppSelector(state => state.comment.updating);
  const updateSuccess = useAppSelector(state => state.comment.updateSuccess);

  const handleClose = () => {
    navigate('/comment');
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
    values.createdAt = convertDateTimeToServer(values.createdAt);

    const entity = {
      ...commentEntity,
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
      ? {
          createdAt: displayDefaultDateTime(),
        }
      : {
          ...commentEntity,
          createdAt: convertDateTimeFromServer(commentEntity.createdAt),
          graph: commentEntity?.graph?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="graphappApp.comment.home.createOrEditLabel" data-cy="CommentCreateUpdateHeading">
            Create or edit a Comment
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="comment-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Content"
                id="comment-content"
                name="content"
                data-cy="content"
                type="textarea"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Created At"
                id="comment-createdAt"
                name="createdAt"
                data-cy="createdAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField id="comment-graph" name="graph" data-cy="graph" label="Graph" type="select">
                <option value="" key="0" />
                {graphs
                  ? graphs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/comment" replace color="info">
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

export default CommentUpdate;
