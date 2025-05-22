
import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SankeyData, SankeyNode, SankeyLink } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useGoogleMaps } from "@/hooks/use-google-maps";

interface SankeyChartProps {
  data: SankeyData;
  height?: number | string;
}

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartInitialized, setChartInitialized] = useState(false);
  const { isLoaded, loadError } = useGoogleMaps({
    autoLoad: true
  });

  useEffect(() => {
    const loadGoogleVisualizationApi = async () => {
      if (!window.google || !window.google.charts) {
        // Load Google Visualization API
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://www.gstatic.com/charts/loader.js';
          script.async = true;
          script.onload = () => {
            if (window.google && window.google.charts) {
              window.google.charts.load('current', { 'packages': ['sankey'] });
              window.google.charts.setOnLoadCallback(() => {
                setChartInitialized(true);
                resolve();
              });
            } else {
              reject(new Error('Failed to load Google Charts API'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Google Charts API'));
          document.head.appendChild(script);
        });
      } else if (!chartInitialized) {
        window.google.charts.load('current', { 'packages': ['sankey'] });
        window.google.charts.setOnLoadCallback(() => {
          setChartInitialized(true);
        });
      }
    };

    if (isLoaded) {
      loadGoogleVisualizationApi();
    }
  }, [isLoaded, chartInitialized]);

  useEffect(() => {
    if (!chartInitialized || !containerRef.current || !data.nodes.length || !data.links.length) {
      return;
    }

    try {
      // Convert data to Google Charts format
      const chartData = new window.google.visualization.DataTable();
      chartData.addColumn('string', 'From');
      chartData.addColumn('string', 'To');
      chartData.addColumn('number', 'Value');
      chartData.addColumn({ type: 'string', role: 'tooltip' });

      // Add rows from our links data
      const rows = data.links.map(link => {
        const sourceNode = data.nodes.find((n, idx) => 
          typeof link.source === 'string' ? n.id === link.source : idx === link.source
        );
        
        const targetNode = data.nodes.find((n, idx) => 
          typeof link.target === 'string' ? n.id === link.target : idx === link.target
        );

        if (!sourceNode || !targetNode) {
          return null;
        }

        return [
          sourceNode.name, 
          targetNode.name, 
          link.value,
          `${sourceNode.name} → ${targetNode.name}: ${formatCurrency(link.value)}`
        ];
      }).filter(Boolean);

      chartData.addRows(rows as any[]);

      // Set chart options
      const options = {
        height: Number(height),
        width: containerRef.current.clientWidth,
        sankey: {
          node: {
            colors: data.nodes.map(node => {
              if (node.type === 'deposit') {
                return "#3B82F6"; // blue for deposits
              } else if (node.type === 'category') {
                // Try to get color from category name
                const categoryName = node.category?.toLowerCase().replace(/\s+/g, '-');
                // Use a default color if category not found
                return categoryName ? `hsl(var(--${categoryName}))` : "#9CA3AF";
              } else {
                return "#EF4444"; // red for expenses
              }
            }),
            label: {
              fontSize: 14,
              color: '#000',
              bold: true,
            },
            width: 15,
            nodePadding: 50
          },
          link: {
            colorMode: 'gradient',
            colors: ['#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6']
          }
        },
        tooltip: { isHtml: false }
      };

      // Draw chart
      const chart = new window.google.visualization.Sankey(containerRef.current);
      chart.draw(chartData, options);

      // Redraw chart on window resize
      const handleResize = () => {
        if (containerRef.current) {
          options.width = containerRef.current.clientWidth;
          chart.draw(chartData, options);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Error rendering Google Sankey chart:', error);
    }
  }, [data, chartInitialized, height]);

  if (loadError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Money Flow</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-10">
          <div className="text-red-500">
            Error loading Google Charts API: {loadError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded || !chartInitialized) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Money Flow</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-10">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="w-3/4 h-10 bg-gray-200 rounded"></div>
            <div className="w-full h-[400px] bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height: height }}></div>
  );
};
