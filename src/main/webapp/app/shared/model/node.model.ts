import { IGraph } from 'app/shared/model/graph.model';

export interface INode {
  id?: number;
  label?: string;
  x?: number;
  y?: number;
  graph?: IGraph | null;
}

export const defaultValue: Readonly<INode> = {};
