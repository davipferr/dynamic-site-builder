import { useEffect, useRef, useState } from 'react';
import PageRenderer from './renderer/PageRenderer.jsx';
import Editor from './editor/Editor.jsx';
import { loadSites, saveSites, resetSites } from './storage.js';

// Which client's site to show. Comes from the URL (?site=studio), like a
// real multi-tenant app would use a subdomain (studio.mysite.com).
function getInitialSiteId(sites) {
  const fromUrl = new URLSearchParams(window.location.search).get('site');
  return fromUrl && sites[fromUrl] ? fromUrl : Object.keys(sites)[0];
}

export default function App() {
  const [sites, setSites] = useState(loadSites);
  const [siteId, setSiteId] = useState(() => getInitialSiteId(sites));
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview' | 'json'

  const site = sites[siteId];

  const [saveStatus, setSaveStatus] = useState(null); // null | 'saved' | 'error'
  const loadedSites = useRef(sites);

  // Persist every change and briefly show "Saved ✓". Nothing is shown for
  // the data we just loaded, only for the user's edits.
  useEffect(() => {
    const ok = saveSites(sites);
    if (sites === loadedSites.current) return;
    setSaveStatus(ok ? 'saved' : 'error');
    if (!ok) return;
    const timer = setTimeout(() => setSaveStatus(null), 1500);
    return () => clearTimeout(timer);
  }, [sites]);

  // Keep the URL in sync with the selected site.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('site', siteId);
    window.history.replaceState(null, '', url);
  }, [siteId]);

  const updateSite = (newSite) => setSites({ ...sites, [siteId]: newSite });

  const handleReset = () => {
    if (window.confirm('Discard all changes and restore the example sites?')) {
      const fresh = resetSites();
      setSites(fresh);
      if (!fresh[siteId]) setSiteId(Object.keys(fresh)[0]);
    }
  };

  return (
    <div className="app">
      <header className="toolbar">
        <strong className="toolbar__brand">Site Builder</strong>

        <span
          className={`save-status ${saveStatus ? `save-status--${saveStatus}` : ''}`}
          role="status"
        >
          {saveStatus === 'saved' && 'Saved ✓'}
          {saveStatus === 'error' && "Couldn't save"}
        </span>

        <label className="toolbar__site">
          Client:
          <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {Object.entries(sites).map(([id, s]) => (
              <option key={id} value={id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <div className="toolbar__modes">
          {['edit', 'preview', 'json'].map((m) => (
            <button
              key={m}
              type="button"
              className={mode === m ? 'active' : ''}
              onClick={() => setMode(m)}
            >
              {m === 'json' ? 'JSON' : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <button type="button" className="link" onClick={handleReset}>
          Reset
        </button>
      </header>

      <main className={`workspace workspace--${mode}`}>
        {mode === 'edit' && (
          <aside className="sidebar">
            <Editor site={site} onChange={updateSite} />
          </aside>
        )}

        {mode === 'json' ? (
          <pre className="json-view">{JSON.stringify(site, null, 2)}</pre>
        ) : (
          <div className="preview">
            <PageRenderer site={site} />
          </div>
        )}
      </main>
    </div>
  );
}
