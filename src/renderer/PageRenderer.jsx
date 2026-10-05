import { registry } from '../registry.js';

// Turns a site config (plain JSON) into React components.
// This is the core of a schema-driven UI: the renderer knows nothing about
// any particular client; everything comes from the config.
export default function PageRenderer({ site }) {
  const { theme, sections } = site;

  // The theme becomes CSS variables, which every section's CSS uses.
  const themeVars = {
    '--primary': theme.primaryColor,
    '--bg': theme.backgroundColor,
    '--text': theme.textColor,
    '--font': theme.font,
  };

  return (
    <div className="site" style={themeVars}>
      {sections.map((section) => {
        const Component = registry[section.type];
        if (!Component) {
          return (
            <div key={section.id} className="unknown-section">
              Unknown section type: {section.type}
            </div>
          );
        }
        return <Component key={section.id} {...section.props} />;
      })}
    </div>
  );
}
