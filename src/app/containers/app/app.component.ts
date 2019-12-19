import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero';
import { Subject, Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { FavoritesService } from 'src/app/services/favorites.service';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.pug',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {
  showFavoritesOnly$ = new BehaviorSubject<boolean>(false);
  heroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;
  offset = 0;
  totalCount = 0;
  count = 0;
  searchText = '';

  private destroy$ = new Subject();

  constructor(
    private heroService: HeroService,
    private favorites: FavoritesService
  ) {

  }

  ngOnInit() {
    this.heroes$ = combineLatest(
      this.heroService.heroes$,
      this.favorites.ids$,
      this.showFavoritesOnly$,
    ).pipe(
      map((result: any) => {
        let heroes: Hero[] = result[0];
        const favorites: number[] = result[1];
        const showFavorites = result[2];
        if (showFavorites) {
          heroes = heroes.filter(h => favorites.includes(h.id));
        }
        return heroes.map((h: Hero) => ({ ...h, isFavorite: favorites.includes(h.id) }));
      }),
    );
    this.heroes$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.count = this.heroService.count;
      this.totalCount = this.heroService.total;
      this.offset = this.heroService.offset;
    });
    this.loading$ = this.heroService.loading$;
    this.heroService.getAll();
  }

  handleSearch(name: string) {
    this.offset = 0;
    this.searchText = name;
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
    if (this.searchText) {
      this.heroService.findByName(this.searchText, this.offset);
    } else {
      this.heroService.getAll(this.offset, false);
    }
  }

  toggleFavoritesOnly() {
    this.showFavoritesOnly$.next(!this.showFavoritesOnly$.getValue());
  }
}
