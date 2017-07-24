import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppComponent } from './app.component';

@Component({
  selector: 'chat-box',
  templateUrl: './html/chat-box.component.html',
  styleUrls: ['./css/chat-box.component.css']
})

export class ChatBoxComponent {
    txt: string;
    @Input() msgs: Array<string>;

    ngOnInit() {
      this.txt = '';
    }

    @Output() onSent = new EventEmitter<string>();

    sendMessage() {
        this.onSent.emit(this.txt);
        this.txt = '';
    }

}