import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { ChatBoxComponent } from './chat-box.component';
import { AuthencationFailureDialog, AlreadyBeUsedDialog } from './dialog.component';
import { AttachmentIcon, NavigateNextIcon, NavigateBeforeIcon } from './icon.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatBoxComponent,
    AuthencationFailureDialog,
    AlreadyBeUsedDialog,
    AttachmentIcon,
    NavigateNextIcon,
    NavigateBeforeIcon
  ],
  entryComponents: [
    AuthencationFailureDialog,
    AlreadyBeUsedDialog
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
    AppComponent
  ]
})

export class AppModule { }
