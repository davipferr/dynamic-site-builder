// Purely visual: adds space between sections, with or without a line.
export default function Divider({ style, size }) {
  return (
    <div className={`divider divider--${size}`} aria-hidden="true">
      {style === 'line' && <hr />}
    </div>
  );
}

Divider.label = 'Divider / Spacer';
Divider.fields = [
  { name: 'style', label: 'Style', type: 'select', options: ['line', 'space'] },
  { name: 'size', label: 'Size', type: 'select', options: ['small', 'medium', 'large'] },
];
Divider.defaults = {
  style: 'line',
  size: 'medium',
};
