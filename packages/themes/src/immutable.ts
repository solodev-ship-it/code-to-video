// Used only on validated, owned JSON data, never on React elements or user objects.
// Public APIs supply their readonly contracts; do not recursively map JSON unions.
export function freezeData<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freezeData(child);
    Object.freeze(value);
  }
  return value;
}
