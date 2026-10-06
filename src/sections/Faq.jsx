// Native <details>/<summary> handle opening and closing, so no state is needed.
export default function Faq({ heading, items = [] }) {
  return (
    <section className="section faq">
      {heading && <h2>{heading}</h2>}
      {items.map((item, i) => (
        <details key={item.id ?? i}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

Faq.label = 'FAQ';
Faq.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  {
    name: 'items',
    label: 'Questions',
    type: 'list',
    itemLabel: 'question',
    itemFields: [
      { name: 'question', label: 'Question', type: 'text' },
      { name: 'answer', label: 'Answer', type: 'textarea' },
    ],
    newItem: { question: 'New question?', answer: 'The answer.' },
  },
];
Faq.defaults = {
  heading: 'Frequently asked questions',
  items: [
    { question: 'How long does a project take?', answer: 'Most projects take two to four weeks.' },
    { question: 'Do you work remotely?', answer: 'Yes, we work with clients all over the world.' },
    { question: 'How do I get started?', answer: 'Send us a message and we will reply within a day.' },
  ],
};
