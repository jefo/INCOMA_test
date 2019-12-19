import md5 from 'js-md5';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, concat, observable, merge, combineLatest } from 'rxjs';
import { Hero } from '../models/hero';
import { map, tap, catchError, takeLast, switchMap, mergeAll, mergeMap, take } from 'rxjs/operators';

const API_KEY = '08a0d00a1c68e8c5029c1c460c062b89';
const API_KEY_PRIVATE = 'e82311685787316fbe221ee05734ff92cfb9ed32';

const apiUrl = entity => {
  const ts = new Date().getTime();
  const hash = md5(`${ts}${API_KEY_PRIVATE}${API_KEY}`);
  return `https://gateway.marvel.com:443/v1/public/${entity}?ts=${ts}&apikey=${API_KEY}&hash=${hash}`;
};

const PAGE_SIZE = 8;

export class GetAllParams {
  constructor(
    public limit = PAGE_SIZE,
    public offset = 0,
    // // if set true heroes$ will be replaced with response data
    public replace = true,
  ) { }
}

export class FindByNameParams extends GetAllParams {
  name?: string;
}

@Injectable()
export class HeroService {
  private _heroes$: BehaviorSubject<Hero[]> = new BehaviorSubject([]);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string>('');

  readonly heroes$: Observable<Hero[]> = this._heroes$.asObservable();
  readonly error$: Observable<string> = this._error$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();

  offset = 0;
  total = 0;
  count = 0;
  limit = PAGE_SIZE;

  constructor(private http: HttpClient) { }

  get heroes() {
    return this._heroes$.getValue();
  }

  getAll(offset = 0, replace = false) {
    this.count = 0;
    this.total = 0;
    this._loading$.next(true);
    this._handleRequest(
      this.http.get<any>(apiUrl('characters'), {
        params: { offset: offset.toString(), limit: PAGE_SIZE.toString() },
      }),
      replace,
    );
  }

  findByName(name: string, offset = 0, replace = false) {
    this._loading$.next(true);
    this.count = 0;
    this.total = 0;
    this._handleRequest(
      this.http.get<any>(apiUrl('characters'), {
        params: { offset: offset.toString(), limit: PAGE_SIZE.toString(), nameStartsWith: name },
      }),
      replace
    );
  }

  getByIds(ids: number[]) {
    let observables: Observable<Hero>[] = []
    ids.forEach(id => {
      observables.push(this.http.get<any>(apiUrl('characters'), {
        params: { id: id.toString() },
      }).pipe(map((resp: any) => resp.data.results[0])));
    });
    return combineLatest(...observables);;
  }

  private _handleRequest(request: Observable<Hero[]>, replace: boolean) {
    if (replace) {
      this._heroes$.next([]);
      this.total = 0;
      this.count = 0;
    }
    request.pipe(take(1)).subscribe(
      (resp: any) => {
        this.offset = resp.data.offset;
        this.total = resp.data.total;
        const heroes = [...this._heroes$.getValue(), ...resp.data.results];
        this.count = heroes.length;
        this._heroes$.next(heroes);
        this._loading$.next(false);
      },
      err => {
        if (err.message) {
          this._error$.next(err.message)
        } else {
          this._error$.next('Ошибка сервера.');
        }
        return err;
      }
    )
  }
}
