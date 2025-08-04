

export class SearchForm {
    titolo: string = '';
    prezzoMinimo: number | null = null;
    prezzoMassimo: number | null = null;
    localita: string = '';
    categoria: string = '';
    distanzaKm: number | null = null;
    soloScambio: boolean = false; // Aggiunto per il filtro di solo scambio
    soloVendita: boolean = false; // Aggiunto per il filtro di solo vendita
    tipoAnnuncio: 'vendita' | 'scambio' | '' = ''; // Aggiunto per il tipo di annuncio

    constructor(init?: Partial<SearchForm>) {
        Object.assign(this, init);
    }
}

