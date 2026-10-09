// A tiny rules engine for forms. Conditions ("show X if Y = 'yes'") and
// validation rules are plain JSON, so they can live in the site config,
// be edited as text and be saved to a database like everything else.
//
// Condition examples:
//   { "field": "hasPet", "equals": "yes" }
//   { "field": "age", "gte": 18 }
//   { "field": "topics", "contains": "design" }
//   { "field": "email", "filled": true }
//   { "all": [ ...conditions ] }   every one must be true
//   { "any": [ ...conditions ] }   at least one must be true
//   { "not": condition }
//
// Validation rule examples (a field has a list of them):
//   { "rule": "required" }
//   { "rule": "minLength", "value": 3, "message": "Too short" }
//   { "rule": "pattern", "value": "^[0-9]{5}$" }
//   { "rule": "min", "value": 18, "when": { "field": "country", "equals": "BR" } }
//   { "rule": "sameAs", "field": "password" }

const isEmpty = (v) =>
  v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && v.length === 0);

// Numbers typed into text inputs arrive as strings; compare them as numbers.
const toNumber = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

// Text is compared ignoring case, so "yes" matches an option called "Yes".
// A single checkbox is compared as true/false, so unchecked equals false.
const same = (a, b) =>
  typeof b === 'boolean'
    ? Boolean(a) === b
    : String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

// Every comparison operator a condition can use: (fieldValue, expected) => boolean.
// For multi-choice answers (arrays), "equals" means "one of the picked options is".
const operators = {
  equals: (v, x) => (Array.isArray(v) ? v.some((item) => same(item, x)) : same(v, x)),
  notEquals: (v, x) => !operators.equals(v, x),
  in: (v, list) => Array.isArray(list) && list.some((x) => operators.equals(v, x)),
  notIn: (v, list) => !operators.in(v, list),
  contains: (v, x) =>
    Array.isArray(v)
      ? v.some((item) => same(item, x))
      : String(v ?? '').toLowerCase().includes(String(x).toLowerCase()),
  filled: (v, x) => isEmpty(v) !== Boolean(x),
  gt: (v, x) => toNumber(v) > x,
  gte: (v, x) => toNumber(v) >= x,
  lt: (v, x) => toNumber(v) < x,
  lte: (v, x) => toNumber(v) <= x,
};

export const operatorNames = Object.keys(operators);

// Returns true when the condition holds for the given answers.
// No condition at all means "always".
export function evaluate(condition, values) {
  if (!condition) return true;
  if (condition.all) return condition.all.every((c) => evaluate(c, values));
  if (condition.any) return condition.any.some((c) => evaluate(c, values));
  if (condition.not) return !evaluate(condition.not, values);

  const value = values[condition.field];
  // Every operator in the object must pass: { "field": "age", "gte": 18, "lt": 65 }.
  return operatorNames
    .filter((op) => op in condition)
    .every((op) => operators[op](value, condition[op]));
}

// Which fields are shown right now. Fields are checked top to bottom and a
// hidden field counts as unanswered, so a chain (C depends on B, B depends
// on A) collapses as soon as A changes.
export function visibleFields(fields, values) {
  const seen = {};
  return fields.filter((field) => {
    if (!evaluate(field.showIf, seen)) return false;
    seen[field.name] = values[field.name];
    return true;
  });
}

// The answers that would actually be submitted: hidden fields are dropped.
export function visibleValues(fields, values) {
  return Object.fromEntries(visibleFields(fields, values).map((f) => [f.name, values[f.name]]));
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Every validation rule: (value, rule, allValues) => error message or null.
// Rules other than "required" skip empty values, so an optional field
// with { "rule": "email" } can still be left blank.
const validators = {
  required: (v) => (isEmpty(v) ? 'This field is required.' : null),
  minLength: (v, r) => (String(v).length < r.value ? `Use at least ${r.value} characters.` : null),
  maxLength: (v, r) => (String(v).length > r.value ? `Use at most ${r.value} characters.` : null),
  min: (v, r) => (!(toNumber(v) >= r.value) ? `Must be ${r.value} or more.` : null),
  max: (v, r) => (!(toNumber(v) <= r.value) ? `Must be ${r.value} or less.` : null),
  email: (v) => (emailPattern.test(v) ? null : 'Enter a valid email address.'),
  pattern: (v, r) => (new RegExp(r.value).test(v) ? null : 'The format is not valid.'),
  sameAs: (v, r, values) => (v === values[r.field] ? null : `Must match "${r.field}".`),
  minSelected: (v, r) =>
    (Array.isArray(v) ? v.length : 0) < r.value ? `Pick at least ${r.value}.` : null,
  maxSelected: (v, r) =>
    (Array.isArray(v) ? v.length : 0) > r.value ? `Pick at most ${r.value}.` : null,
};

export const ruleNames = Object.keys(validators);

// The first error for a field, or null when it's valid.
export function validateField(field, values) {
  const value = values[field.name];
  for (const rule of field.validation ?? []) {
    if (!evaluate(rule.when, values)) continue;
    if (rule.rule !== 'required' && isEmpty(value)) continue;
    const error = validators[rule.rule]?.(value, rule, values);
    if (error) return rule.message || error;
  }
  return null;
}

// Errors for every visible field, as { fieldName: message }.
// Hidden fields are never validated.
export function validateForm(fields, values) {
  const answers = visibleValues(fields, values);
  const errors = {};
  for (const field of visibleFields(fields, values)) {
    const error = validateField(field, answers);
    if (error) errors[field.name] = error;
  }
  return errors;
}

// ---------- Checking the JSON itself (used by the editor) ----------
// These catch typos like { "feild": "x" } or { "rule": "requried" } while
// the user writes the JSON, instead of the form silently misbehaving.

const isObject = (x) => x && typeof x === 'object' && !Array.isArray(x);

export function checkCondition(condition) {
  if (!isObject(condition)) return 'A condition must be an object, like { "field": "x", "equals": "yes" }.';

  for (const group of ['all', 'any']) {
    if (group in condition) {
      if (!Array.isArray(condition[group])) return `"${group}" must be a list of conditions.`;
      for (const c of condition[group]) {
        const error = checkCondition(c);
        if (error) return error;
      }
      return null;
    }
  }
  if ('not' in condition) return checkCondition(condition.not);

  if (typeof condition.field !== 'string') return 'Missing "field": the name of the field to check.';
  const unknown = Object.keys(condition).filter((k) => k !== 'field' && !operatorNames.includes(k));
  if (unknown.length) return `Unknown operator "${unknown[0]}". Use one of: ${operatorNames.join(', ')}.`;
  if (Object.keys(condition).length === 1) return `Add an operator, like "equals". Options: ${operatorNames.join(', ')}.`;
  if ('in' in condition && !Array.isArray(condition.in)) return '"in" must be a list.';
  if ('notIn' in condition && !Array.isArray(condition.notIn)) return '"notIn" must be a list.';
  return null;
}

export function checkRules(rules) {
  if (!Array.isArray(rules)) return 'Validation must be a list of rules, like [{ "rule": "required" }].';
  for (const r of rules) {
    if (!isObject(r)) return 'Each rule must be an object.';
    if (!ruleNames.includes(r.rule)) return `Unknown rule "${r.rule}". Use one of: ${ruleNames.join(', ')}.`;
    if (r.rule === 'pattern') {
      try {
        new RegExp(r.value);
      } catch {
        return `"${r.value}" is not a valid regular expression.`;
      }
    }
    if (r.rule === 'sameAs' && typeof r.field !== 'string') return '"sameAs" needs a "field".';
    if (r.when) {
      const error = checkCondition(r.when);
      if (error) return `In "when": ${error}`;
    }
  }
  return null;
}
