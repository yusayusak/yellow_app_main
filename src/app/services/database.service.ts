// db.service.ts

import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { database } from './database';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
    providedIn: 'root'
})

export class DbService {
    private storage: SQLiteObject;
    songsList = new BehaviorSubject([]);
    private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private platform: Platform,
        private sqlite: SQLite,
        private httpClient: HttpClient,
        private sqlPorter: SQLitePorter,
    ) {
        this.platform.ready().then(() => {
            this.sqlite.create({
                name: 'positronx_db.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {
                    this.storage = db;
                    this.getFakeData();
                });
        });
    }

    dbState() {
        return this.isDbReady.asObservable();
    }

    fetchSongs(): Observable<Song[]> {
        return this.songsList.asObservable();
    }

    // Render fake data
    getFakeData() {
        this.httpClient.get(
            'assets/dump.sql',
            {responseType: 'text'}
        ).subscribe(data => {
            this.sqlPorter.importSqlToDb(this.storage, data)
                .then(_ => {
                    this.getSongs();
                    this.isDbReady.next(true);
                })
                .catch(error => console.error(error));
        });
    }

    // Get list
    getData(){
        return this.storage.executeSql('SELECT * FROM meting', []).then(res => {
            let items: meting[] = [];
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    items.push({
                        id: res.rows.item(i).id,
                        Naam: res.rows.item(i).Naam,
                        Leeftijd: res.rows.item(i).Leeftijd,
                        Geslacht: res.rows.item(i).Geslacht,
                        Alcohol_Promillage: res.rows.item(i).Alcohol_Promillage,
                    });
                }
            }
            this.songsList.next(items);
        });
    }

    // Toevoegen
    addData(Naam, Leeftijd, Geslacht, Alcohol_Promillage) {
        let data = [Naam, Leeftijd, Geslacht, Alcohol_Promillage];
        return this.storage.executeSql('INSERT INTO meting(Naam, Leeftijd, Geslacht, Alcohol_Promillage) VALUES (?, ?)', data)
            .then(res => {
                this.meting();
            });
    }

    // Get single object
    getSong(id): Promise<Song> {
        return this.storage.executeSql('SELECT * FROM meting WHERE id = ?', [id]).then(res => {
            return {
                id: res.rows.item(0).id,
                artist_name: res.rows.item(0).artist_name,
                song_name: res.rows.item(0).song_name
            }
        });
    }

    // Update
    updateSong(Naam, Leeftijd, Geslacht, Alcohol_Promillage) {
        let data = [song.Naam, song.Leeftijd, song.Geslacht, song.Alcohol_Promillage];
        return this.storage.executeSql(`UPDATE meting SET Naam = ?, Leeftijd = ?, Geslacht = ?, Alcohol_Promillage = ?, WHERE id = ${id}`, data)
            .then(data => {
                this.getSongs();
            })
    }

    // Delete
    deleteSong(id) {
        return this.storage.executeSql('DELETE FROM meting WHERE id = ?', [id])
            .then(_ => {
                this.getSongs();
            });
    }
}



