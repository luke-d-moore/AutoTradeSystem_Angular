import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PriceData } from '../components/market-prices/market-prices.component';

const API_URL = 'https://localhost:44351/api/Price';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  constructor(private http: HttpClient) { }

  getPrices(): Observable<PriceData> {
    return this.http.get<{ Prices: PriceData }>(API_URL).pipe(
      map(response => response.Prices)
    );
  }
}
