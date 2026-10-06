export default function Features({ heading, items = [] }) {
  return (
    <section className="section">
      {heading && <h2>{heading}</h2>}
      <div className="features">
        {items.map((item, i) => (
          <div className="feature-card" key={item.id ?? i}>
            <div className="feature-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

Features.label = 'Features grid';
Features.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  {
    name: 'items',
    label: 'Features',
    type: 'list',
    itemLabel: 'title',
    itemFields: [
      { name: 'icon', label: 'Icon (emoji)', type: 'emoji' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'text', label: 'Text', type: 'textarea' },
    ],
    newItem: { icon: '⭐', title: 'New feature', text: 'Describe it.' },
  },
];
Features.defaults = {
  heading: 'What we offer',
  items: [
    { icon: '⚡', title: 'Fast', text: 'We deliver quickly.' },
    { icon: '🎯', title: 'Precise', text: 'We get the details right.' },
    { icon: '🤝', title: 'Friendly', text: 'We are easy to work with.' },
  ],
};
