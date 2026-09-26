import { Schema } from "mongoose";
import { required } from "./validators.js";

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

function isValidCoordinates(coordinates: unknown): boolean {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }

  const [longitude, latitude] = coordinates as [unknown, unknown];

  return (
    typeof longitude === "number" &&
    typeof latitude === "number" &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

// GeoJSON Point com ordem [longitude, latitude] (DEC-012, BR-039).
export const geoPointSchema = new Schema<GeoPoint>(
  {
    type: {
      type: String,
      enum: { values: ["Point"], message: "localizacao.type deve ser Point." },
      required: required("localizacao.type é obrigatório."),
    },
    coordinates: {
      type: [Number],
      required: required("localizacao.coordinates é obrigatório."),
      validate: {
        validator: isValidCoordinates,
        message: "localizacao.coordinates deve ser [longitude, latitude] dentro dos limites válidos.",
      },
    },
  },
  { _id: false },
);
