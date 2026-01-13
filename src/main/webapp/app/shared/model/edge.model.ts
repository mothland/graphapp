import { INode } from 'app/shared/model/node.model';
import { IGraph } from 'app/shared/model/graph.model';

export interface IEdge {
  id?: number;
  weight?: number;
  directed?: boolean;
  source?: INode | null;
  target?: INode | null;
  graph?: IGraph | null;
}

export const defaultValue: Readonly<IEdge> = {
  directed: false,
};
