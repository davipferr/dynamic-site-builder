export default function Gallery({ heading, images = [] }) {
  return (
    <section className="section">
      {heading && <h2>{heading}</h2>}
      <div className="gallery">
        {images.map((img, i) => (
          <figure key={img.id ?? i}>
            <img src={img.url} alt={img.caption || ''} loading="lazy" />
            {img.caption && <figcaption>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

Gallery.label = 'Image gallery';
Gallery.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  {
    name: 'images',
    label: 'Images',
    type: 'list',
    itemLabel: 'caption',
    itemFields: [
      { name: 'url', label: 'Image URL', type: 'text' },
      { name: 'caption', label: 'Caption', type: 'text' },
    ],
    newItem: { url: 'https://picsum.photos/seed/new/600/400', caption: '' },
  },
];
Gallery.defaults = {
  heading: 'Gallery',
  images: [
    { url: 'https://picsum.photos/seed/one/600/400', caption: 'First' },
    { url: 'https://picsum.photos/seed/two/600/400', caption: 'Second' },
    { url: 'https://picsum.photos/seed/three/600/400', caption: 'Third' },
  ],
};
