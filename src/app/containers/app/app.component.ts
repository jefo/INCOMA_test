import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero';
import { Subject, Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { FavoritesService } from 'src/app/services/favorites.service';
import { takeUntil, map, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.pug',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {
  showFavoritesOnly$ = new BehaviorSubject<boolean>(false);
  allHeroes$: Observable<Hero[]>;
  favorites$: Observable<Hero[]>;
  favoritesIds: number[] = [];
  // heroes to display (favorite or all)
  heroes: Hero[] = [];
  loading$: Observable<boolean>;
  offset = 0;
  totalCount = 0;
  count = 0;
  searchText$ = new BehaviorSubject('');

  private destroy$ = new Subject();

  constructor(
    private heroService: HeroService,
    private favorites: FavoritesService
  ) {

  }

  ngOnInit() {
    const setIsFavorite = (h: Hero, favorites) => ({ ...h, isFavorite: favorites.includes(h.id) });
    combineLatest(
      this.heroService.heroes$,
      this.favorites.ids$,
      this.showFavoritesOnly$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe((results: any) => {
      this.count = this.heroService.count;
      this.totalCount = this.heroService.total;
      let heroes: Hero[] = results[0];
      const favorites: number[] = results[1];
      this.count = heroes.length;
      if (!results[2]) {
        heroes = heroes.map(h => setIsFavorite(h, favorites));
        this.heroes = heroes;
      }
    });
    combineLatest(
      this.favorites.ids$.pipe(
        switchMap(ids => this.heroService.getByIds(ids)),
      ),
      this.showFavoritesOnly$,
      this.searchText$,
    ).subscribe(results => {
      if (results[1]) {
        this.heroes = results[0].filter((h: Hero) => h.name.toLowerCase().startsWith(results[2].toLowerCase())).map(h => ({ ...h, isFavorite: true }));
      }
    }),
    this.loading$ = this.heroService.loading$;
    this.heroService.getAll();
  }

  handleSearch(name: string) {
    this.offset = 0;
    this.searchText$.next(name);
    if (name) {
      this.heroService.findByName(name, this.offset, true);
    } else {
      this.heroService.getAll(this.offset, true);
    }
  }

  toggleFavorite(id: number) {
    this.favorites.toggle(id);
  }

  loadMore() {
    this.offset += this.heroService.limit;
    if (this.searchText$) {
      this.heroService.findByName(this.searchText$.getValue(), this.offset);
    } else {
      this.heroService.getAll(this.offset, false);
    }
  }

  toggleFavoritesOnly() {
    const showFavorites = this.showFavoritesOnly$.getValue();
    this.showFavoritesOnly$.next(!showFavorites);
  }
}
