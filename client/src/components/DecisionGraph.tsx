import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties?: Record<string, unknown>;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface DecisionGraphProps {
  graph: KnowledgeGraph | null;
  title?: string;
}

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Disease: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
  Symptom: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  Treatment: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  Biomarker: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  Finding: { bg: "#e0e7ff", border: "#6366f1", text: "#3730a3" },
  default: { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
};

export default function DecisionGraph({ graph, title = "Decision Graph" }: DecisionGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!graph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (graph.nodes.length === 0) return;

    const nodePositions = new Map<string, { x: number; y: number }>();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    graph.nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / graph.nodes.length - Math.PI / 2;
      nodePositions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;

    graph.edges.forEach((edge) => {
      const source = nodePositions.get(edge.source);
      const target = nodePositions.get(edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(edge.relationship, midX, midY - 5);

      const angle = Math.atan2(target.y - source.y, target.x - source.x);
      const arrowLength = 10;
      const arrowX = target.x - 25 * Math.cos(angle);
      const arrowY = target.y - 25 * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
        arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
        arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = "#94a3b8";
      ctx.fill();
    });

    graph.nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const colors = NODE_COLORS[node.type] || NODE_COLORS.default;
      const nodeRadius = 20;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = colors.bg;
      ctx.fill();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const label = node.label.length > 10 ? node.label.substring(0, 10) + "..." : node.label;
      ctx.fillText(label, pos.x, pos.y + nodeRadius + 15);

      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(node.type, pos.x, pos.y + nodeRadius + 28);
    });
  }, [graph]);

  if (!graph) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No knowledge graph generated yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4 flex-wrap">
          <span>{title}</span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">Disease</Badge>
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">Symptom</Badge>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">Treatment</Badge>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">Biomarker</Badge>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-300">Finding</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg bg-white dark:bg-gray-900 p-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full max-w-full"
            data-testid="canvas-decision-graph"
          />
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Graph contains {graph.nodes.length} nodes and {graph.edges.length} relationships
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {graph.nodes.slice(0, 6).map((node) => (
              <div key={node.id} className="p-2 bg-muted rounded">
                <span className="font-medium">{node.label}</span>
                <span className="text-muted-foreground ml-1">({node.type})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
