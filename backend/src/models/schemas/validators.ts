// `required: [true, "mensagem"]` literal é inferido como (string | boolean)[],
// o que faz o Mongoose tipar o campo como `unknown`. A tupla explícita
// preserva a inferência dos models (InferSchemaType).
export const required = (message: string): [true, string] => [true, message];
