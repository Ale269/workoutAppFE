

import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, Observable, switchMap, take} from 'rxjs';
import {ApiCatalogService} from "./api-catalog.service";

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    constructor(private apiCatalogService: ApiCatalogService) {

    }

    getAllProducts(): Observable<any> {
        return this.apiCatalogService.executeApiCall('products','getAll');
    }

    getProductById(id: number): Observable<any> {
        return this.apiCatalogService.executeApiCall('products', 'annuncio', { id: id }, undefined);
    }
}