/**
 * Metadati di paginazione delle liste, speculari a PaginazioneModel lato
 * server.
 *
 * Il client guarda un campo solo per decidere se continuare a scorrere:
 * `ultimaPagina`. Dedurre la fine confrontando quanti record sono arrivati
 * con quanti se ne erano chiesti sbaglia ogni volta che il totale e' un
 * multiplo esatto della dimensione pagina — l'ultima richiesta tornerebbe
 * piena e il client chiederebbe una pagina in piu' a vuoto.
 */
export interface PaginazioneDTO {
  page: number;
  size: number;
  totaleElementi: number;
  ultimaPagina: boolean;
}

/** Parametri di richiesta comuni alle liste paginate. */
export interface RichiestaPaginata {
  page: number;
  size: number;
}

/** Dimensione pagina di default per le liste con infinite scroll. */
export const DIMENSIONE_PAGINA_LISTE = 20;
