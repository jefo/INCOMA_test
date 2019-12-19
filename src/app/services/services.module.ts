import { NgModule } from '@angular/core';
import { FavoritesService } from './favorites.service';
import { HeroService } from './hero.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    HeroService,
    FavoritesService,
  ],
})
export class ServicesModule {

}
