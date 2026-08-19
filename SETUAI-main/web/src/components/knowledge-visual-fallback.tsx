type KnowledgeVisualFallbackProps = {
  variant: "lattice" | "heartbeat";
};

const latticeNodes = [
  "node-a",
  "node-b",
  "node-c",
  "node-d",
  "node-e",
  "node-f",
  "node-g",
];

export function KnowledgeVisualFallback({ variant }: KnowledgeVisualFallbackProps) {
  return (
    <div className={`knowledge-visual-fallback knowledge-visual-fallback--${variant}`} aria-hidden="true">
      <span className="knowledge-visual-axis knowledge-visual-axis--one" />
      <span className="knowledge-visual-axis knowledge-visual-axis--two" />
      <span className="knowledge-visual-axis knowledge-visual-axis--three" />
      <span className="knowledge-visual-axis knowledge-visual-axis--four" />
      <div className="knowledge-visual-core">
        <span className="knowledge-visual-core__facet knowledge-visual-core__facet--left" />
        <span className="knowledge-visual-core__facet knowledge-visual-core__facet--right" />
        <span className="knowledge-visual-core__facet knowledge-visual-core__facet--base" />
      </div>
      <div className="knowledge-visual-book">
        <span className="knowledge-visual-book__page knowledge-visual-book__page--left" />
        <span className="knowledge-visual-book__page knowledge-visual-book__page--right" />
      </div>
      <div className="knowledge-visual-network">
        {latticeNodes.map((node) => (
          <span key={node} className={`knowledge-visual-node knowledge-visual-node--${node}`} />
        ))}
      </div>
    </div>
  );
}
