import mongoose from "mongoose";

export async function connectDatabase(uri: string): Promise<void> {
  // Remove dos filtros campos que não existem no schema,
  // reduzindo o risco de injeção de operadores (09 §42).
  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
