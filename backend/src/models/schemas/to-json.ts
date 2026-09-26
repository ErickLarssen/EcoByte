// Transformação padrão de saída JSON (06_API §40): `_id` é exposto como `id`
// e campos internos (`__v`) nunca chegam à API.
export function toJsonTransform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  const { _id, ...rest } = ret;
  delete rest.__v;

  return { id: String(_id), ...rest };
}
