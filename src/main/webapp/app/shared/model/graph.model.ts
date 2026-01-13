import dayjs from 'dayjs';

export interface IGraph {
  id?: number;
  name?: string;
  description?: string | null;
  createdAt?: dayjs.Dayjs | null;
}

export const defaultValue: Readonly<IGraph> = {};
