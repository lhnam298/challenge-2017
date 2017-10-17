import { Component, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

@Component({
  selector: 'attachment-icon',
  templateUrl: './html/icon/attachment-icon.html',
  styleUrls: ['./css/icon.component.css']
})

export class AttachmentIcon {

  BYTES_PER_CHUNK = 1200;
  reader: FileReader;
  file: File;
  currentChunk;

  @Output() onReadContent = new EventEmitter<any>();
  @Output() onReadInfo = new EventEmitter<any>();

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'attachment',
        sanitizer.bypassSecurityTrustResourceUrl('../assets/ic_attachment_black_48px.svg'));
  }

  ngOnInit() {
    this.currentChunk = 0;
    this.reader = new FileReader();
  }

  changeListener($event) : void {
    this.file = $event.target.files[0];
    this.onReadInfo.emit(JSON.stringify({
      fileName: this.file.name,
      fileSize: this.file.size
    }));
    this.readFile();
  }

  readFile() : void {
    this.reader.onload = function() {
      this.onReadContent.emit(this.reader.result);
      this.currentChunk++;

      if( this.BYTES_PER_CHUNK * this.currentChunk < this.file.size ) {
          this.readNextChunk();
      }
    }.bind(this);

    this.readNextChunk();
  }

  readNextChunk() : void {
    let start = this.BYTES_PER_CHUNK * this.currentChunk;
    let end = Math.min( this.file.size, start + this.BYTES_PER_CHUNK );
    this.reader.readAsArrayBuffer( this.file.slice( start, end ) );
  }

}

@Component({
  selector: 'navigate-next-icon',
  templateUrl: './html/icon/navigate-next-icon.html',
  styleUrls: ['./css/icon.component.css']
})

export class NavigateNextIcon {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'navigate-next',
        sanitizer.bypassSecurityTrustResourceUrl('../assets/ic_navigate_next_black_48px.svg'));
  }

  ngOnInit() {

  }

}

@Component({
  selector: 'navigate-before-icon',
  templateUrl: './html/icon/navigate-before-icon.html',
  styleUrls: ['./css/icon.component.css']
})

export class NavigateBeforeIcon {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'navigate-before',
        sanitizer.bypassSecurityTrustResourceUrl('../assets/ic_navigate_before_black_48px.svg'));
  }

  ngOnInit() {

  }

}