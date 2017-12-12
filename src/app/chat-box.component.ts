import { Component, EventEmitter, Input, Output, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { AppComponent } from './app.component';

@Component({
  selector: 'chat-box',
  templateUrl: './html/chat-box.component.html',
  styleUrls: ['./css/chat-box.component.css']
})

export class ChatBoxComponent implements AfterViewChecked {
    @ViewChild('message_display') private chatScroll: ElementRef;
    private inputMessage: string;

    @Input() msgs: Array<any>;
    @Output() onSendChat = new EventEmitter<string>();
    @Output() onTransferData = new EventEmitter<any>();
    @Output() onTransferMeta = new EventEmitter<any>();

    ngOnInit() {
      this.inputMessage = '';
    }

    ngAfterViewChecked() {
      this.scrollToBottom();
    }

    sendMessage = () => {
        let message = this.inputMessage.trim();
        if (message.length == 0) return;
        this.onSendChat.emit(message);
        this.inputMessage = '';
    }

    transferData = (chunk) => {
      this.onTransferData.emit(chunk);
    }

    transferMeta = (info) => {
      this.onTransferMeta.emit(info);
    }

    scrollToBottom = () => {
      try {
          this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      } catch(err) {

      }
  }
}