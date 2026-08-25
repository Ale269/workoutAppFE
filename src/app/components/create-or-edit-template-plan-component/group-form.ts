import { FormControl, FormGroup } from "@angular/forms";
import {
  GruppoDTO,
  TipoGruppo,
} from "src/app/models/create-or-edit-template-or-entity-form-dto/gruppodto";

export interface GruppoFormModel {
  identifier: FormControl<number | null>;
  id: FormControl<number | null>;
  idTemplate: FormControl<number | null>;
  tipoGruppo: FormControl<TipoGruppo | null>;
  tempoRecupero: FormControl<number | null>;
  numeroGiri: FormControl<number | null>;
}

/**
 * Form di un gruppo di esercizi (superset / circuito).
 * L'appartenenza degli esercizi al gruppo vive su EsercizioForm.idGruppo,
 * che contiene l'identifier client di questo gruppo.
 */
export class GruppoForm {
  public form: FormGroup;

  /**
   * Posizione di ancoraggio (indice nella lista globale esercizi) usata SOLO
   * finché il gruppo è vuoto: appena ha membri la posizione deriva da loro.
   * Permette a un gruppo appena creato di mantenere il suo posto nella pagina
   * anche quando si aggiungono esercizi sciolti o si riordina.
   */
  public emptyAnchorIndex: number = 0;

  constructor(identifier: number, gruppoDTO?: GruppoDTO) {
    this.form = new FormGroup<GruppoFormModel>({
      identifier: new FormControl<number | null>(identifier),
      id: new FormControl<number | null>(gruppoDTO?.id || null),
      idTemplate: new FormControl<number | null>(gruppoDTO?.idTemplate || null),
      tipoGruppo: new FormControl<TipoGruppo | null>(
        gruppoDTO?.tipoGruppo || null
      ),
      tempoRecupero: new FormControl<number | null>(
        gruppoDTO?.tempoRecupero ?? null
      ),
      numeroGiri: new FormControl<number | null>(gruppoDTO?.numeroGiri ?? null),
    });
  }

  get identifier(): number {
    return this.form.get("identifier")?.value ?? 0;
  }

  get tipoGruppo(): TipoGruppo {
    return this.form.get("tipoGruppo")?.value ?? "SUPERSET";
  }

  getDatiGruppoDaSalvare(progressivo: number): GruppoDTO {
    try {
      const gruppoDaSalvare: GruppoDTO = {
        id: this.form.controls["id"].value ? this.form.controls["id"].value : 0,
        idTemplate: this.form.controls["idTemplate"].value
          ? this.form.controls["idTemplate"].value
          : 0,
        tipoGruppo: this.tipoGruppo,
        tempoRecupero: this.form.controls["tempoRecupero"].value ?? null,
        numeroGiri: this.form.controls["numeroGiri"].value ?? null,
        progressivo: progressivo,
      };
      return gruppoDaSalvare;
    } catch (error) {
      throw new Error("GruppoForm.getDatiGruppoDaSalvare: " + error);
    }
  }
}
