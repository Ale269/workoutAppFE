export interface ultimiAllenamentiSvoltiDTO {
  id: number;
  descrizioneAllenamento: string;
  giornoAllenamento: number;
  giorniTotaliAllenamentiScheda: number;
  dataSvolgimento: Date;
  /** Id icona degli esercizi svolti, nell'ordine di esecuzione. */
  idIcone: number[];
}
