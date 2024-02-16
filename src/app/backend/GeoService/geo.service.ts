import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  private username = 'pythonsk'; // Replace with your Geonames username
  currentGeonameId!: string

  constructor(private http: HttpClient) { }

  getCountries(): Observable<any[]> {
    return this.http.get(`http://api.geonames.org/countryInfoJSON?username=${this.username}`).pipe(
      map((data: any) => data.geonames)
    );
  }

  getGeonameIdByCountryName(countryName: string): Observable<string> {
    return this.http.get(`http://api.geonames.org/searchJSON?q=${countryName}&maxRows=1&username=${this.username}`).pipe(
      map((data: any) => data.geonames[0]?.geonameId)
    );
  }

  getAdminCodeByAdminName(adminName: string): Observable<string> {
    return this.http.get(`http://api.geonames.org/searchJSON?q=${adminName}&maxRows=1&username=${this.username}`).pipe(
      map((data: any) => data.geonames[0]?.adminCode1)
    );
  }

  getStates(geonameId: string): Observable<any[]> {
    this.currentGeonameId = geonameId
    return this.http.get(`http://api.geonames.org/childrenJSON?geonameId=${geonameId}&username=${this.username}`).pipe(
      map((data: any) => data.geonames)
    );
  }

  getCountryCode(geonameId: string): Observable<string> {
    return this.http.get(`http://api.geonames.org/getJSON?geonameId=${this.currentGeonameId}&username=${this.username}`).pipe(
      map((data: any) => data?.countryCode)
    );
  }

  getCities(countryCode: string, stateCode: string): Observable<any[]> {
    return this.http.get(`http://api.geonames.org/searchJSON?country=${countryCode}&adminCode1=${stateCode}&username=${this.username}`).pipe(
      map((data: any) => data.geonames)
    );
  }
}
