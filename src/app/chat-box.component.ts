import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppComponent } from './app.component';

@Component({
  selector: 'chat-box',
  templateUrl: './html/chat-box.component.html',
  styleUrls: ['./css/chat-box.component.css']
})

export class ChatBoxComponent {
    private txt: string;

    @Input() msgs: Array<string>;
    @Output() onSendChat = new EventEmitter<string>();
    @Output() onTransferData = new EventEmitter<any>();
    @Output() onTransferMeta = new EventEmitter<any>();

    ngOnInit() {
      this.txt = '';
    }

    sendMessage() : void {
        this.onSendChat.emit(this.txt);
        this.txt = '';
    }

    transferData(chunk) : void {
      this.onTransferData.emit(chunk);
    }

    transferMeta(info) : void {
      this.onTransferMeta.emit(info);
    }
}