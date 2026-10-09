// Initial data: two "clients", each with their own site config.
// In a real product this would live in a database (e.g. one MongoDB document per site).
export const defaultSites = {
  bakery: {
    name: "Davi's Bakery",
    theme: {
      primaryColor: '#c2410c',
      backgroundColor: '#fffaf3',
      textColor: '#292524',
      font: 'Georgia, serif',
    },
    sections: [
      {
        id: 's1',
        type: 'Hero',
        props: {
          title: "Davi's Bakery",
          subtitle: 'Fresh bread every morning since 1998.',
          buttonText: 'Visit us',
          buttonLink: '#contact',
          backgroundImage: 'https://picsum.photos/seed/bread/1600/700',
        },
      },
      {
        id: 's2',
        type: 'Features',
        props: {
          heading: 'Our specialties',
          items: [
            { icon: '🥖', title: 'Sourdough', text: 'Fermented for 48 hours.' },
            { icon: '🥐', title: 'Croissants', text: 'Real butter, 27 layers.' },
            { icon: '🎂', title: 'Cakes', text: 'Made to order for any occasion.' },
          ],
        },
      },
      {
        id: 's4',
        type: 'Form',
        props: {
          heading: 'Order a cake',
          intro: 'Tell us what you need and we will confirm by email.',
          questions: [
            {
              label: 'Your name',
              name: 'name',
              type: 'text',
              validation: [{ rule: 'required' }],
            },
            {
              label: 'Email',
              name: 'email',
              type: 'email',
              placeholder: 'you@example.com',
              validation: [{ rule: 'required' }, { rule: 'email' }],
            },
            {
              label: 'Is it for a special occasion?',
              name: 'occasion',
              type: 'radio',
              options: 'Yes, No',
              validation: [{ rule: 'required', message: 'Please pick one.' }],
            },
            {
              label: 'Which occasion?',
              name: 'occasionType',
              type: 'select',
              options: 'Birthday, Wedding, Other',
              showIf: { field: 'occasion', equals: 'yes' },
              validation: [{ rule: 'required' }],
            },
            {
              label: 'How many guests?',
              name: 'guests',
              type: 'number',
              help: 'Weddings need at least 20 guests.',
              showIf: { field: 'occasionType', in: ['Wedding'] },
              validation: [
                { rule: 'required' },
                { rule: 'min', value: 20, message: 'For weddings we bake for 20 guests or more.' },
              ],
            },
            {
              label: 'Name to write on the cake',
              name: 'cakeText',
              type: 'text',
              showIf: { field: 'occasionType', equals: 'Birthday' },
              validation: [{ rule: 'maxLength', value: 30 }],
            },
            {
              label: 'Pickup code (5 digits, if you have one)',
              name: 'code',
              type: 'text',
              validation: [{ rule: 'pattern', value: '^[0-9]{5}$', message: 'The code has 5 digits.' }],
            },
          ],
          submitLabel: 'Send order',
          successMessage: 'Thanks! We will email you within a day to confirm your order.',
        },
      },
      {
        id: 's3',
        type: 'Contact',
        props: {
          heading: 'Find us',
          email: 'hello@bakery.example',
          phone: '+55 11 99999-0000',
          address: 'Rua das Flores, 123, São Paulo',
        },
      },
    ],
  },
  studio: {
    name: 'Pixel Studio',
    theme: {
      primaryColor: '#7c3aed',
      backgroundColor: '#0f0f14',
      textColor: '#e5e5ef',
      font: 'system-ui, sans-serif',
    },
    sections: [
      {
        id: 's1',
        type: 'Hero',
        props: {
          title: 'Pixel Studio',
          subtitle: 'We design and build digital products.',
          buttonText: 'See our work',
          buttonLink: '#',
          backgroundImage: '',
        },
      },
      {
        id: 's2',
        type: 'TextBlock',
        props: {
          heading: 'Who we are',
          body: 'A small team of designers and developers.\nWe care about details.',
          align: 'center',
        },
      },
      {
        id: 's3',
        type: 'Gallery',
        props: {
          heading: 'Recent projects',
          images: [
            { url: 'https://picsum.photos/seed/p1/600/400', caption: 'Banking app' },
            { url: 'https://picsum.photos/seed/p2/600/400', caption: 'E-commerce' },
            { url: 'https://picsum.photos/seed/p3/600/400', caption: 'Portfolio' },
          ],
        },
      },
    ],
  },
};
