// The component registry: maps the "type" string stored in the config
// to the React component that renders it. To add a new section type,
// create a component (with label, fields and defaults) and register it here.
import Hero from './sections/Hero.jsx';
import TextBlock from './sections/TextBlock.jsx';
import Features from './sections/Features.jsx';
import Gallery from './sections/Gallery.jsx';
import Contact from './sections/Contact.jsx';

export const registry = {
  Hero,
  TextBlock,
  Features,
  Gallery,
  Contact,
};
