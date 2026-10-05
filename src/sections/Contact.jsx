export default function Contact({ heading, email, phone, address }) {
  return (
    <section className="section contact" id="contact">
      {heading && <h2>{heading}</h2>}
      <ul>
        {email && (
          <li>
            ✉️ <a href={`mailto:${email}`}>{email}</a>
          </li>
        )}
        {phone && <li>📞 {phone}</li>}
        {address && <li>📍 {address}</li>}
      </ul>
    </section>
  );
}

Contact.label = 'Contact info';
Contact.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'address', label: 'Address', type: 'text' },
];
Contact.defaults = {
  heading: 'Contact us',
  email: 'hello@example.com',
  phone: '+55 11 99999-9999',
  address: 'São Paulo, Brazil',
};
