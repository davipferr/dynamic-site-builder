import { useId, useState } from 'react';
import { checkCondition, checkRules, validateForm, visibleFields, visibleValues } from '../forms/rules.js';

// A Typeform-style form. Each question can have a `showIf` condition and a
// list of `validation` rules, both plain JSON (see src/forms/rules.js).
export default function Form({ heading, intro, questions = [], submitLabel, successMessage }) {
  const formId = useId();
  const [values, setValues] = useState({});
  const [touched, setTouched] = useState({});
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [answers, setAnswers] = useState(null); // set after a valid submit

  // A question without a name still works; it just can't be used in conditions.
  const all = questions.map((q) => ({ ...q, name: q.name || q.id }));
  const shown = visibleFields(all, values);
  const errors = validateForm(all, values);

  const inputId = (name) => `${formId}-${name}`;
  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const touch = (name) => setTouched((prev) => ({ ...prev, [name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTriedSubmit(true);
    const firstError = shown.find((q) => errors[q.name]);
    if (firstError) {
      document.getElementById(inputId(firstError.name))?.focus();
      return;
    }
    // There's no backend yet, so the answers are just shown back.
    setAnswers(visibleValues(all, values));
  };

  const restart = () => {
    setValues({});
    setTouched({});
    setTriedSubmit(false);
    setAnswers(null);
  };

  if (answers) {
    return (
      <section className="section form-section">
        {heading && <h2>{heading}</h2>}
        <p className="form-section__success">{successMessage || 'Thanks! We got your answers.'}</p>
        <dl className="form-section__answers">
          {all
            .filter((q) => q.name in answers)
            .map((q) => (
              <div key={q.id ?? q.name}>
                <dt>{q.label}</dt>
                <dd>{formatAnswer(answers[q.name])}</dd>
              </div>
            ))}
        </dl>
        <button type="button" className="btn" onClick={restart}>
          Send another response
        </button>
      </section>
    );
  }

  return (
    <section className="section form-section">
      {heading && <h2>{heading}</h2>}
      {intro && <p>{intro}</p>}
      <form noValidate onSubmit={handleSubmit}>
        {shown.map((q) => {
          const error = (touched[q.name] || triedSubmit) && errors[q.name];
          const required = q.validation?.some((r) => r.rule === 'required' && !r.when);
          const id = inputId(q.name);
          // Radio buttons and checkbox groups are labelled by a <legend>.
          const isGroup = q.type === 'radio' || q.type === 'checkboxes';
          const Wrapper = isGroup ? 'fieldset' : 'div';
          return (
            <Wrapper key={q.id ?? q.name} className={`form-question ${error ? 'has-error' : ''}`}>
              {isGroup ? (
                <legend>
                  {q.label}
                  {required && <span aria-hidden="true"> *</span>}
                </legend>
              ) : (
                q.type !== 'checkbox' && (
                  <label htmlFor={id}>
                    {q.label}
                    {required && <span aria-hidden="true"> *</span>}
                  </label>
                )
              )}
              {q.help && <p className="form-question__help">{q.help}</p>}
              <QuestionInput
                question={q}
                id={id}
                value={values[q.name]}
                invalid={!!error}
                errorId={`${id}-error`}
                onChange={(v) => setValue(q.name, v)}
                onBlur={() => touch(q.name)}
              />
              {error && (
                <p className="form-question__error" id={`${id}-error`}>
                  {error}
                </p>
              )}
            </Wrapper>
          );
        })}
        <button type="submit" className="btn">
          {submitLabel || 'Submit'}
        </button>
      </form>
    </section>
  );
}

const splitOptions = (options) =>
  (options ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const formatAnswer = (value) => {
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value === undefined || value === '' ? '—' : String(value);
};

function QuestionInput({ question: q, id, value, invalid, errorId, onChange, onBlur }) {
  const a11y = { 'aria-invalid': invalid || undefined, 'aria-describedby': invalid ? errorId : undefined };

  switch (q.type) {
    case 'textarea':
      return (
        <textarea
          id={id}
          rows={4}
          placeholder={q.placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          {...a11y}
        />
      );
    case 'select':
      return (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} {...a11y}>
          <option value="">Choose…</option>
          {splitOptions(q.options).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'radio':
      return (
        <div className="form-question__choices">
          {splitOptions(q.options).map((opt, i) => (
            <label key={opt}>
              <input
                type="radio"
                // The first option gets the id, so errors can focus the group.
                id={i === 0 ? id : undefined}
                name={id}
                value={opt}
                checked={value === opt}
                onChange={() => {
                  onChange(opt);
                  onBlur();
                }}
                {...a11y}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'checkboxes': {
      const picked = Array.isArray(value) ? value : [];
      return (
        <div className="form-question__choices">
          {splitOptions(q.options).map((opt, i) => (
            <label key={opt}>
              <input
                type="checkbox"
                id={i === 0 ? id : undefined}
                checked={picked.includes(opt)}
                onChange={(e) => {
                  onChange(e.target.checked ? [...picked, opt] : picked.filter((p) => p !== opt));
                  onBlur();
                }}
                {...a11y}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }
    case 'checkbox':
      // A single yes/no box, e.g. "I accept the terms".
      return (
        <label className="form-question__single">
          <input
            type="checkbox"
            id={id}
            checked={!!value}
            onChange={(e) => {
              onChange(e.target.checked);
              onBlur();
            }}
            {...a11y}
          />
          {q.label}
        </label>
      );
    default:
      // text, email, number
      return (
        <input
          id={id}
          type={q.type === 'email' || q.type === 'number' ? q.type : 'text'}
          placeholder={q.placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          {...a11y}
        />
      );
  }
}

const withOptions = { field: 'type', in: ['select', 'radio', 'checkboxes'] };

Form.label = 'Form';
Form.fields = [
  { name: 'heading', label: 'Heading', type: 'text' },
  { name: 'intro', label: 'Intro text', type: 'textarea' },
  {
    name: 'questions',
    label: 'Questions',
    type: 'list',
    itemLabel: 'label',
    // The editor uses the same rules engine: "Options" only shows up
    // for question types that have options.
    itemFields: [
      { name: 'label', label: 'Question', type: 'text' },
      { name: 'name', label: 'Name (used in conditions)', type: 'text' },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        options: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkboxes', 'checkbox'],
      },
      { name: 'options', label: 'Options (comma-separated)', type: 'text', showIf: withOptions },
      {
        name: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        showIf: { field: 'type', in: ['text', 'email', 'number', 'textarea'] },
      },
      { name: 'help', label: 'Help text', type: 'text' },
      {
        name: 'showIf',
        label: 'Show only if (JSON)',
        type: 'json',
        placeholder: '{ "field": "hasPet", "equals": "yes" }',
        check: checkCondition,
      },
      {
        name: 'validation',
        label: 'Validation rules (JSON)',
        type: 'json',
        placeholder: '[{ "rule": "required" }]',
        check: checkRules,
      },
    ],
    newItem: { label: 'New question', name: '', type: 'text', validation: [] },
  },
  { name: 'submitLabel', label: 'Submit button', type: 'text' },
  { name: 'successMessage', label: 'Message after sending', type: 'textarea' },
];
Form.defaults = {
  heading: 'Tell us about you',
  intro: 'It takes less than a minute.',
  questions: [
    {
      label: 'Your name',
      name: 'name',
      type: 'text',
      validation: [{ rule: 'required' }, { rule: 'minLength', value: 2 }],
    },
    {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'you@example.com',
      validation: [{ rule: 'required' }, { rule: 'email' }],
    },
    {
      label: 'Do you have a pet?',
      name: 'hasPet',
      type: 'radio',
      options: 'Yes, No',
      validation: [{ rule: 'required', message: 'Please pick one.' }],
    },
    {
      label: "What's your pet's name?",
      name: 'petName',
      type: 'text',
      showIf: { field: 'hasPet', equals: 'yes' },
      validation: [{ rule: 'required' }],
    },
    {
      label: 'What kind of pet?',
      name: 'petKind',
      type: 'select',
      options: 'Dog, Cat, Bird, Other',
      showIf: { field: 'hasPet', equals: 'yes' },
    },
    {
      label: 'Tell us about it',
      name: 'petOther',
      type: 'textarea',
      showIf: { field: 'petKind', equals: 'Other' },
      validation: [{ rule: 'required' }, { rule: 'maxLength', value: 200 }],
    },
    {
      label: 'I agree to be contacted',
      name: 'consent',
      type: 'checkbox',
      validation: [{ rule: 'required', message: 'We need your OK to reply.' }],
    },
  ],
  submitLabel: 'Send',
  successMessage: 'Thanks! We will get back to you soon.',
};
