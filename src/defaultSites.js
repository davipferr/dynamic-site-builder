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
