import dayjs from 'dayjs';
import { IGraph } from 'app/shared/model/graph.model';

export interface IComment {
  id?: number;
  content?: string;
  createdAt?: dayjs.Dayjs | null;
  graph?: IGraph | null;
}

export const defaultValue: Readonly<IComment> = {};
