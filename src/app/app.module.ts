import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { BannerComponent } from './componentes/banner/banner.component';
import { HttpClientModule } from '@angular/common/http';
import { ContactComponent } from './componentes/contact/contact.component';
import { OfertasComponent } from './componentes/ofertas/ofertas.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    BannerComponent,
    ContactComponent,
    OfertasComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
