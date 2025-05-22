
// Define the Google Charts API structure
interface GoogleCharts {
  load: (version: string, options: { packages: string[] }) => void;
  setOnLoadCallback: (callback: () => void) => void;
  Line: any;
  Bar: any;
  Histogram: any;
  Scatter: any;
}

interface GoogleVisualization {
  DataTable: new () => any;
  Sankey: new (element: HTMLElement) => any;
  LineChart: any;
  BarChart: any;
  ComboChart: any;
  PieChart: any;
  ScatterChart: any;
  ColumnChart: any;
}

// Extend the Window interface to include google object
declare global {
  interface Window {
    google: {
      charts: GoogleCharts;
      visualization: GoogleVisualization;
      maps?: any;
    };
  }
}

export {};
