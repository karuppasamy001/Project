import { Injectable } from '@angular/core';
import { CouchDBService } from './backend/couchDB/couch-db.service';

@Injectable({
  providedIn: 'root'
})
export class StudentLogService {

  constructor(private couchDB: CouchDBService) { }

  isLoggedIn: boolean = false
  currentUserName!: string


}
