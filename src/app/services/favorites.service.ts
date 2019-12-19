import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'favorites';

@Injectable()
export class FavoritesService {
  private _ids$: BehaviorSubject<number[]> = new BehaviorSubject([]);
  readonly ids$: Observable<number[]> = this._ids$.asObservable();


  constructor() {
    let storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      this._ids$.next(JSON.parse(storedData));
    }
  }

  add(id: number) {
    let ids = this._ids$.getValue();
    if (ids.includes(id)) {
      throw new Error('Элемент уже в избранном.');
    }
    ids = [...ids, id]
    this._ids$.next(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  remove(id: number) {
    let ids = this._ids$.getValue();
    ids = ids.filter(f => f !== id);
    this._ids$.next(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  toggle(id: number) {
    if (this._ids$.getValue().includes(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }
}
