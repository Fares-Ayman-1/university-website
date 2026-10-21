import styles from "./diagrams.module.css";

/** The agent–environment loop: percepts in through sensors, actions out through actuators. */
export function AgentLoop({ caption }: { caption?: string }) {
  return (
    <figure className={styles.diagram}>
      <div className={styles.scroll}>
        <svg viewBox="0 0 640 260" style={{ minWidth: 480 }} role="img" aria-label={caption ?? "Agent and environment loop"}>
          <defs>
            <marker id="agentloop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHeadGold} />
            </marker>
          </defs>

          <rect x="20" y="20" width="270" height="220" rx="18" className={styles.panelNavy} />
          <text x="155" y="52" className={styles.panelTitleLight}>Agent</text>
          <rect x="44" y="72" width="222" height="40" rx="10" className={styles.panelInner} />
          <text x="155" y="97" className={styles.panelTextLight}>Sensors</text>
          <rect x="44" y="124" width="222" height="44" rx="10" className={styles.panelGold} />
          <text x="155" y="151" className={styles.panelTextDark}>Agent program: f(percepts) → action</text>
          <rect x="44" y="180" width="222" height="40" rx="10" className={styles.panelInner} />
          <text x="155" y="205" className={styles.panelTextLight}>Actuators</text>
          <line x1="155" y1="112" x2="155" y2="122" className={styles.edgeGold} />
          <line x1="155" y1="168" x2="155" y2="178" className={styles.edgeGold} />

          <rect x="430" y="20" width="190" height="220" rx="18" className={styles.panelOutline} />
          <text x="525" y="128" className={styles.panelTitle}>Environment</text>
          <text x="525" y="152" className={styles.panelSub}>world state</text>

          <path d="M430 70 C 370 70, 340 92, 268 92" className={styles.flow} markerEnd="url(#agentloop-arrow)" />
          <text x="360" y="62" className={styles.flowLabel}>Percepts</text>
          <path d="M268 200 C 340 200, 370 190, 428 190" className={styles.flow} markerEnd="url(#agentloop-arrow)" />
          <text x="360" y="222" className={styles.flowLabel}>Actions</text>
        </svg>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
