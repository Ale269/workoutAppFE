
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';
import { Yacht, Department } from '../models/yacht.model';

@Injectable({
    providedIn: 'root'
})
export class YachtService {
    private apiUrl = `${environment.apiUrl}/yachts`;

    constructor(private http: HttpClient) {
    }

    getYachts(): Observable<Yacht[]> {
        return this.http.get<Yacht[]>(this.apiUrl);
    }

    getYachtById(id: string): Observable<Yacht> {
        return this.http.get<Yacht>(`${this.apiUrl}/${id}`);
    }

    createYacht(yacht: Partial<Yacht>): Observable<Yacht> {
        return this.http.post<Yacht>(this.apiUrl, yacht);
    }

    updateYacht(id: string, yacht: Partial<Yacht>): Observable<Yacht> {
        return this.http.put<Yacht>(`${this.apiUrl}/${id}`, yacht);
    }

    deleteYacht(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
