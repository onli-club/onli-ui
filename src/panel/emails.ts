const EMAIL = /[^\s,;<>]+@[^\s,;<>]+\.[^\s,;<>]+/;

/** Every email in a pasted blob (a column from a sheet, an address line), once each. */
export const parseEmails = (text: string) => [
  ...new Set((text.match(new RegExp(EMAIL, "g")) ?? []).map((e) => e.toLowerCase())),
];

/** The pieces of a pasted blob that are not emails: a wrong column, a stray name. */
export const notEmails = (text: string) =>
  text.split(/[\s,;<>]+/).filter((t) => t && !EMAIL.test(t));
