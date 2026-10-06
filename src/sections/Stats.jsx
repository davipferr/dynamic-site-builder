export default function Stats({ heading, items = [] }) {
  return (
    <section className="section">
      {heading && <h2>{heading}</h2>}
      <div className="stats">
        {items.map((item, i) => (
          <div className="stat" key={item.id ?? i}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

Stats.label = 'Stats / Numbers';
Stats.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  {
    name: 'items',
    label: 'Numbers',
    type: 'list',
    itemLabel: 'label',
    itemFields: [
      { name: 'value', label: 'Value (e.g. 120+)', type: 'text' },
      { name: 'label', label: 'Label', type: 'text' },
    ],
    newItem: { value: '0', label: 'New stat' },
  },
];
Stats.defaults = {
  heading: '',
  items: [
    { value: '120+', label: 'Happy clients' },
    { value: '8', label: 'Years in business' },
    { value: '24h', label: 'Response time' },
  ],
};
