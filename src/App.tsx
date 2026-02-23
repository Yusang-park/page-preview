import React from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import { encodePreviewState } from "./lib/state-codec";
import { pagePreviewStories } from "./stories";
import type { PagePreviewEntry } from "./lib/types";

// --- Icons ---

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Logic ---

const groupEntries = (entries: PagePreviewEntry[]) =>
  entries.reduce<Record<string, PagePreviewEntry[]>>((acc, entry) => {
    const key = entry.group ?? "Ungrouped";
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

const buildTargetUrl = (
  entry: PagePreviewEntry,
  variantId?: string,
  options?: { hideToolbar?: boolean },
) => {
  const origin = entry.target.origin ?? "http://127.0.0.1:4000";
  const url = new URL(entry.target.path, origin);
  if (entry.target.variantQueryKey) {
    const resolvedVariant = variantId ?? entry.variants[0]?.id;
    if (resolvedVariant) {
      url.searchParams.set(entry.target.variantQueryKey, resolvedVariant);
    }
  }
  const selectedVariant =
    entry.variants.find((variant) => variant.id === variantId) ?? entry.variants[0];
  const stateKey = entry.target.stateQueryKey ?? "__pp";
  if (selectedVariant?.state) {
    url.searchParams.set(stateKey, encodePreviewState(selectedVariant.state));
  } else {
    url.searchParams.delete(stateKey);
  }
  if (options?.hideToolbar) {
    url.searchParams.set("__pp_toolbar", "0");
  }
  return url.toString();
};

// --- Components ---

const ScaledPreviewFrame = ({
  src,
  title,
  compact = false,
}: {
  src: string;
  title: string;
  compact?: boolean;
}) => {
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new ResizeObserver((entries) => {
      const target = entries[0];
      if (!target) return;
      const width = target.contentRect.width;
      const height = target.contentRect.height;
      // 1920x1280 is the base resolution for scaling
      const nextScale = Math.min(width / 1920, height / 1280);
      setScale(nextScale);
    });
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={shellRef} className={`pp-canvas-shell ${compact ? "pp-canvas-shell-compact" : ""}`}>
      <div
        className="pp-canvas-inner"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <iframe className="pp-viewer-frame" src={src} title={title} />
      </div>
    </div>
  );
};

const PreviewGrid = () => {
  const grouped = groupEntries(pagePreviewStories);
  return (
    <div className="pp-main">
      <div className="pp-shell">
        <header className="pp-header">
          <div className="pp-kicker">Runtime Environment</div>
          <h1 className="pp-title">Page Preview Gallery</h1>
          <p className="pp-description">
            Explore and verify page states in an isolated React runtime.
          </p>
        </header>
        {Object.keys(grouped).length === 0 ? (
          <section className="pp-group">
            <div className="pp-group-head">
              <h2 className="pp-group-title">No previews registered</h2>
            </div>
            <p className="pp-description" style={{ marginTop: 12 }}>
              Pass a stories file with `page-preview dev --stories path/to/page-preview-stories.ts`.
            </p>
          </section>
        ) : null}
        {Object.entries(grouped).map(([groupName, entries]) => (
          <section key={groupName} className="pp-group">
            <div className="pp-group-head">
              <h2 className="pp-group-title">{groupName}</h2>
            </div>
            <div className="pp-grid">
              {entries.map((entry) => (
                <article key={entry.id} className="pp-card">
                  <Link to={`/${entry.id}`} className="pp-frame-wrap" style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ pointerEvents: 'none' }}>
                      <ScaledPreviewFrame
                        title={`${entry.id}-preview`}
                        src={buildTargetUrl(entry, entry.variants[0]?.id, { hideToolbar: true })}
                        compact
                      />
                    </div>
                  </Link>
                  <Link to={`/${entry.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="pp-card-title">{entry.name ?? entry.id}</h3>
                  </Link>
                  <div className="pp-chip-row">
                    {entry.variants.map((v) => (
                      <a className="pp-chip" href={buildTargetUrl(entry, v.id)} key={v.id}>
                        {v.label}
                      </a>
                    ))}
                  </div>
                  <div className="pp-action-row">
                    <Link className="pp-open" to={`/${entry.id}`}>
                      View Details
                      <span style={{ marginLeft: 8 }}><ExternalLinkIcon /></span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

const PageViewer = ({ entry }: { entry: PagePreviewEntry }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selected = params.get("variant");
  const [highlightId, setHighlightId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selected) {
      setHighlightId(selected);
      const timer = setTimeout(() => setHighlightId(null), 2000);
      
      // Scroll to the selected variant
      const element = document.getElementById(`variant-${selected}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      
      return () => clearTimeout(timer);
    }
  }, [selected]);

  return (
    <div className="pp-main pp-viewer-root">
      <div className="pp-viewer-toolbar">
        <div className="pp-viewer-top">
          <div className="pp-viewer-back-wrap">
            <Link className="pp-toolbar-back" to="/" aria-label="Back to gallery">
              <BackIcon />
            </Link>
          </div>
          <div className="pp-viewer-title">
            <strong>{entry.group ?? "Preview"}</strong>
            <span>{entry.name ?? entry.id}</span>
          </div>
          <div style={{ width: 40 }} /> {/* Spacer for centering title */}
        </div>
      </div>
      
      <div className="pp-viewer-shell">
        <div className="pp-viewer-grid">
          {entry.variants.map((v) => (
            <article 
              key={v.id} 
              id={`variant-${v.id}`}
              className={`pp-preview-card ${v.id === highlightId ? "pp-preview-card-active" : ""}`}
            >
              <ScaledPreviewFrame title={`${entry.id}-${v.label}`} src={buildTargetUrl(entry, v.id)} />
              <div className="pp-preview-card-footer">
                <h3 className="pp-preview-card-title">{v.label}</h3>
                <a className="pp-open pp-preview-open-link" href={buildTargetUrl(entry, v.id)}>
                  Open page
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const PreviewPageRoute = () => {
  const params = useParams();
  const pageId = params["*"] ? `${params.pageId}/${params["*"]}` : params.pageId;
  const entry = pagePreviewStories.find((s) => s.id === pageId);
  if (!entry) return <Navigate to="/" replace />;
  return <PageViewer entry={entry} />;
};

const Sidebar = ({ activePageId }: { activePageId?: string }) => {
  const grouped = groupEntries(pagePreviewStories);
  return (
    <aside className="pp-sidebar">
      <div className="pp-sidebar-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)' }}>
          <LogoIcon />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Page Preview</span>
        </div>
      </div>
      <nav className="pp-sidebar-nav">
        {Object.entries(grouped).map(([groupName, entries]) => (
          <div key={groupName}>
             <h3 className="pp-sidebar-group-title">{groupName}</h3>
             <div className="pp-sidebar-links">
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  className={`pp-sidebar-link ${activePageId === entry.id ? "pp-sidebar-link-active" : ""}`}
                  to={`/${entry.id}`}
                >
                  {entry.name ?? entry.id}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default function App() {
  const location = useLocation();
  const pageId = location.pathname.substring(1) || undefined;
  return (
    <div className="pp-root">
      <Sidebar activePageId={pageId} />
      <Routes>
        <Route path="/" element={<PreviewGrid />} />
        <Route path="/:pageId/*" element={<PreviewPageRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
