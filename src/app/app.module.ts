import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { ServicesModule } from './services/services.module';
import { HeroComponent } from './components/hero/hero.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { AppComponent } from './containers/app/app.component';

@NgModule({
  declarations: [
    HeroComponent,
    SearchInputComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ServicesModule,
    AngularSvgIconModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
