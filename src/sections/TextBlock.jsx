export default function TextBlock({ heading, body, align }) {
  return (
    <section className="section text-block" style={{ textAlign: align }}>
      {heading && <h2>{heading}</h2>}
      {body
        ?.split('\n')
        .filter(Boolean)
        .map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    </section>
  );
}

TextBlock.label = 'Text block';
TextBlock.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  { name: 'body', label: 'Body (one paragraph per line)', type: 'textarea' },
  { name: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
];
TextBlock.defaults = {
  heading: 'About us',
  body: 'Write something about yourself here.\nA new line starts a new paragraph.',
  align: 'left',
};
