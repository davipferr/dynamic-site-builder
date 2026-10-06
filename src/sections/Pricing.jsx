export default function Pricing({ heading, plans = [] }) {
  return (
    <section className="section">
      {heading && <h2>{heading}</h2>}
      <div className="pricing">
        {plans.map((plan, i) => (
          <div className={`plan ${plan.highlighted ? 'plan--highlighted' : ''}`} key={plan.id ?? i}>
            <h3>{plan.name}</h3>
            <p className="plan__price">
              {plan.price}
              {plan.period && <span> / {plan.period}</span>}
            </p>
            <ul>
              {plan.features
                ?.split('\n')
                .filter(Boolean)
                .map((feature, j) => <li key={j}>{feature}</li>)}
            </ul>
            {plan.buttonText && (
              <a className="btn" href={plan.buttonLink || '#'}>
                {plan.buttonText}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

Pricing.label = 'Pricing table';
Pricing.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  {
    name: 'plans',
    label: 'Plans',
    type: 'list',
    itemLabel: 'name',
    itemFields: [
      { name: 'name', label: 'Plan name', type: 'text' },
      { name: 'price', label: 'Price', type: 'text' },
      { name: 'period', label: 'Period (e.g. month)', type: 'text' },
      { name: 'features', label: 'Features (one per line)', type: 'textarea' },
      { name: 'buttonText', label: 'Button text', type: 'text' },
      { name: 'buttonLink', label: 'Button link', type: 'text' },
      { name: 'highlighted', label: 'Highlight this plan', type: 'toggle' },
    ],
    newItem: {
      name: 'New plan',
      price: '$0',
      period: 'month',
      features: 'A feature',
      buttonText: 'Choose',
      buttonLink: '#contact',
      highlighted: false,
    },
  },
];
Pricing.defaults = {
  heading: 'Pricing',
  plans: [
    {
      name: 'Basic',
      price: '$9',
      period: 'month',
      features: '1 project\nEmail support',
      buttonText: 'Choose Basic',
      buttonLink: '#contact',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      features: '10 projects\nPriority support\nCustom domain',
      buttonText: 'Choose Pro',
      buttonLink: '#contact',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$99',
      period: 'month',
      features: 'Unlimited projects\nPhone support\nTeam accounts',
      buttonText: 'Contact us',
      buttonLink: '#contact',
      highlighted: false,
    },
  ],
};
