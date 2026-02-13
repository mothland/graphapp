import './graph-insights.scss';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, CardBody, CardHeader, Col, Row, Spinner } from 'reactstrap';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

type GraphRow = {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string | null;
};

export const GraphInsights = () => {
  const [rows, setRows] = useState<GraphRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await axios.get<GraphRow[]>('/api/graphs?sort=createdAt,asc');
        if (!isActive) return;
        setRows(res.data ?? []);
      } catch (err: any) {
        if (!isActive) return;
        setErrorMessage(err?.message ?? 'Failed to load graph data.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, []);

  const columnDefs = useMemo<ColDef<GraphRow>[]>(
    () => [
      { field: 'id', headerName: 'ID', maxWidth: 110, sort: 'asc' },
      { field: 'name', headerName: 'Graph Name', minWidth: 180 },
      { field: 'description', headerName: 'Description', minWidth: 220 },
      {
        field: 'createdAt',
        headerName: 'Created At',
        minWidth: 180,
        valueFormatter: params => (params.value ? new Date(params.value).toLocaleString() : '-'),
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<GraphRow>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
    }),
    [],
  );

  const chartOptions = useMemo<Highcharts.Options>(() => {
    const countsByDay = rows.reduce<Map<string, number>>((acc, row) => {
      const day = row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : 'Unknown';
      acc.set(day, (acc.get(day) ?? 0) + 1);
      return acc;
    }, new Map());

    const sortedDays = [...countsByDay.keys()].sort();
    const data = sortedDays.map(day => countsByDay.get(day) ?? 0);

    return {
      chart: { type: 'column', height: 360 },
      title: { text: 'Graphs Created Per Day' },
      credits: { enabled: false },
      xAxis: {
        categories: sortedDays.length > 0 ? sortedDays : ['No Data'],
        title: { text: 'Date' },
      },
      yAxis: {
        min: 0,
        title: { text: 'Number of Graphs' },
        allowDecimals: false,
      },
      series: [
        {
          type: 'column',
          name: 'Graphs',
          data: sortedDays.length > 0 ? data : [0],
          color: '#198754',
        },
      ],
    };
  }, [rows]);

  return (
    <div className="graph-insights-page">
      <div className="graph-insights-page__header">
        <div>
          <h2>Graph Insights</h2>
          <p className="text-muted mb-0">Quick insights on your graphs with table and chart views.</p>
        </div>
        <Button tag={Link} to="/" color="secondary">
          Back Home
        </Button>
      </div>

      {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

      {loading ? (
        <div className="graph-insights-page__loading">
          <Spinner size="sm" /> Loading data...
        </div>
      ) : (
        <Row className="g-3">
          <Col lg="7">
            <Card className="shadow-sm">
              <CardHeader>ag-grid: Graph List</CardHeader>
              <CardBody>
                <div className="ag-theme-alpine graph-insights-page__grid">
                  <AgGridReact rowData={rows} columnDefs={columnDefs} defaultColDef={defaultColDef} pagination paginationPageSize={8} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="5">
            <Card className="shadow-sm">
              <CardHeader>Highcharts: Daily Creation Count</CardHeader>
              <CardBody>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default GraphInsights;
