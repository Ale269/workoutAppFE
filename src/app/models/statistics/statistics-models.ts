export interface RiepilogoResponse {
  totaleAllenamenti: number;
  volumeTotaleKg: number;
  streakSettimane: number;
  mediaAllenamentiSettimana: number;
}

export interface VolumeDataPoint {
  periodo: string;
  volumeKg: number;
}

export interface VolumeResponse {
  datiVolume: VolumeDataPoint[];
}

export interface DistribuzioneMuscoloItem {
  idMuscolo: number;
  nomeMuscolo: string;
  percentuale: number;
  conteggio: number;
}

export interface DistribuzioneResponse {
  distribuzione: DistribuzioneMuscoloItem[];
}

export interface RecordPersonaleItem {
  idTipoEsercizio: number;
  nomeEsercizio: string;
  maxCarico: number;
  dataRecord: string;
  idIcona: number;
}

export interface RecordResponse {
  records: RecordPersonaleItem[];
}

export interface FrequenzaData {
  label: string;
  count: number;
}

export interface ProgressioneData {
  labels: string[];
  maxCarico: number[];
  volume: number[];
}
