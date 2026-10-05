export default function Hero({ title, subtitle, buttonText, buttonLink, backgroundImage }) {
  const style = backgroundImage
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${backgroundImage})` }
    : undefined;

  return (
    <section className={`hero ${backgroundImage ? 'hero--image' : ''}`} style={style}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {buttonText && (
        <a className="btn" href={buttonLink || '#'}>
          {buttonText}
        </a>
      )}
    </section>
  );
}

Hero.label = 'Hero banner';
Hero.fields = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
  { name: 'buttonText', label: 'Button text', type: 'text' },
  { name: 'buttonLink', label: 'Button link', type: 'text' },
  { name: 'backgroundImage', label: 'Background image URL', type: 'text' },
];
Hero.defaults = {
  title: 'Welcome to my site',
  subtitle: 'Tell visitors what you do in one sentence.',
  buttonText: 'Get in touch',
  buttonLink: '#contact',
  backgroundImage: '',
};
