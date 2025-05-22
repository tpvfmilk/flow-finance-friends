
declare global {
  interface Window {
    google: {
      charts: {
        load: (version: string, options: { packages: string[] }) => void;
        setOnLoadCallback: (callback: () => void) => void;
        Line: any;
        Bar: any;
        Histogram: any;
        Scatter: any;
      };
      visualization: {
        DataTable: new () => any;
        Sankey: new (element: Element) => any;
        LineChart: any;
        BarChart: any;
        ComboChart: any;
        PieChart: any;
        ScatterChart: any;
        ColumnChart: any;
      };
      maps?: any;
    };
  }
}

export {};
