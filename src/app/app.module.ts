import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MenuBarComponent } from './menu-bar.component';
import { MediaAreaComponent } from './media-area.component';
import { VideoFrameComponent } from './video-frame.component';
import { ChatBoxComponent } from './chat-box.component';
import { AuthencationFailureDialog } from './dialog.component';
import { AlreadyBeUsedDialog } from './dialog.component';
import { AttachmentIcon } from './icon.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuBarComponent,
    MediaAreaComponent,
    VideoFrameComponent,
    ChatBoxComponent,
    AuthencationFailureDialog,
    AlreadyBeUsedDialog,
    AttachmentIcon,
  ],
  entryComponents: [
    AuthencationFailureDialog,
    AlreadyBeUsedDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})

export class AppModule { }
