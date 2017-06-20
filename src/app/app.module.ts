import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MenuBarComponent } from './menu-bar.component';
import { MediaAreaComponent } from './media-area.component';
import { VideoFrameComponent } from './video-frame.component';
import { ChatBoxComponent } from './chat-box.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuBarComponent,
    MediaAreaComponent,
    VideoFrameComponent,
    ChatBoxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [
    AppComponent,
    MenuBarComponent,
    MediaAreaComponent,
    VideoFrameComponent,
    ChatBoxComponent
  ]
})

export class AppModule { }
