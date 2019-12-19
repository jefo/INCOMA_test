import { Component, Input, Output, EventEmitter, OnInit, SimpleChange } from '@angular/core';
import { Hero } from 'src/app/models/hero';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.pug',
  styleUrls: ['./hero.component.styl']
})
export class HeroComponent implements OnInit {
  @Input() hero: Hero;
  @Output() favorite = new EventEmitter<boolean>();

  favIcon: string;

  ngOnInit() {
    this._setFavIcon(this.hero.isFavorite);
  }

  onChanges(changes: SimpleChange) {
    this._setFavIcon(changes.currentValue.isFavorite);
  }

  toggleFavorite() {
    this.favorite.emit(this.hero.isFavorite);
  }

  private _setFavIcon(isFavorite: boolean) {
    this.favIcon = isFavorite ? 'assets/favorite.svg' : 'assets/favorite_border.svg'
  }
}
