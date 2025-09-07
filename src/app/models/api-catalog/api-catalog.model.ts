

export interface ApiEndpoint {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description?: string;
    mocked?: boolean;
    // Aggiungi altre proprietà specifiche per i tuoi endpoint (es. headers, auth)
}


export interface DefaultModule {
    baseUrl: string;
    host: string;
    protocol: "http" | "https";
    security: string
    mocked?: boolean;
    // Aggiungi altre proprietà specifiche per i tuoi endpoint (es. headers, auth)
}

export interface ApiName {
    name: string;
    endpoint: string;
    method: string;
    description?: string;
    isMocked?: boolean;
}


export interface ApiCatalog {
    defaults: DefaultModule,
    apis: {

    }
    // Aggiungi altre sezioni come necessario
    //[key: string]: any; // Permette proprietà dinamiche se il catalogo è molto flessibile
}