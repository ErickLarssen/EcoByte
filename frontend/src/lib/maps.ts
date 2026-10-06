import type { GeoPoint } from "./api/collections";
import type { EcopointAddress } from "./api/ecopoint";
import { formatCep } from "./format";

type Destination = {
  endereco: Pick<EcopointAddress, "logradouro" | "numero" | "bairro" | "cidade" | "estado" | "cep">;
  localizacao: GeoPoint | null;
};

// "Como chegar" (DEC-079, DEC-084): link para rotas em um app de mapas externo,
// sem mapa embutido (OQ-031, 13 §23). Serve ao ecoponto e ao endereço da coleta.
// Usa as coordenadas quando houver; senão, o endereço. GeoJSON guarda
// [longitude, latitude] (DEC-012).
export function directionsUrl(ecopoint: Destination): string {
  const destination = ecopoint.localizacao
    ? `${ecopoint.localizacao.coordinates[1]},${ecopoint.localizacao.coordinates[0]}`
    : [
        `${ecopoint.endereco.logradouro}, ${ecopoint.endereco.numero}`,
        ecopoint.endereco.bairro,
        `${ecopoint.endereco.cidade} - ${ecopoint.endereco.estado}`,
        formatCep(ecopoint.endereco.cep),
      ].join(", ");

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
