import { Component } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthencationFailureDialog, AlreadyBeUsedDialog } from './dialog.component';
import { MdDialog } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './html/app.component.html',
  styleUrls: ['./css/app.component.css']
})

export class AppComponent {

    constructor(public dialog: MdDialog) {

    }

    rtc;
    socket;
    msgs;
    lid;
    username: string;
    status: string;
    room;
    authenticated;

    incomingFileInfo;
    incomingFileData;
    bytesReceived;

    public haveLocalMedia = false;
    public myVideo;
    public yourVideo;
    public myVideoStream;
    public yourVideoStream;
    public pc;
    public dc;
    public constraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    connect() {
        if (this.haveLocalMedia && !this.authenticated) {
            this.socket.emit('auth', { room: this.room, msg: this.lid });
        }
    }

    ngOnInit() {
        this.msgs = [];
        this.room = null;
        this.authenticated = false;
        this.getMedia();

        this.socket = io();

        this.socket.on('id', (function (data) {
            console.log(data);
        }).bind(this));

        this.socket.on('auth', (function (data) {
          if (data.valid) {
              if (data.usable) {
                  this.authenticated = true;
                  this.username = data.username;
                  this.status = data.status;
                  this.room = data.room;
                  if (data.connectable) {
                      this.createPC();
                      this.offer();
                  }
              } else {
                  this.openDialog(AlreadyBeUsedDialog);
              }
          } else {
              this.openDialog(AuthencationFailureDialog);
          }
        }).bind(this));

        this.socket.on('message', (function (data) {
            if (data.type === "offer") {
                this.createPC();
                this.pc.setRemoteDescription(new RTCSessionDescription(data));
                this.answer();
            } else if (data.type === "answer") {
                this.pc.setRemoteDescription(new RTCSessionDescription(data));
            } else if (data.type === "candidate") {
                this.pc.addIceCandidate(new RTCIceCandidate({sdpMLineIndex:data.mlineindex, candidate:data.candidate}));
            }
        }).bind(this));
    }

    getMedia() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).then(this.gotUserMedia.bind(this)).catch(this.didntGetUserMedia);
    }

    gotUserMedia(stream) {
        this.myVideoStream = stream;
        this.haveLocalMedia = true;

        this.myVideo = document.getElementById('myVideo').querySelector('video');
        this.myVideo.srcObject = this.myVideoStream;
        this.myVideo.onloadedmetadata = (function(e) {
            this.myVideo.play();
        }).bind(this);

        this.attachMediaIfReady();
    }

    didntGetUserMedia(err) {
        console.log(err.name + ": " + err.message);
    }

    attachMediaIfReady() {
        if (this.pc && this.haveLocalMedia) {
            this.attachMedia();
        }
    }

    attachMedia() {
        this.pc.addStream(this.myVideoStream);
    }

    offer() {
        this.dc = this.pc.createDataChannel('chat');
        this.setupDataHandlers();
        this.pc.createOffer(this.gotDescription.bind(this), this.doNothing, this.constraints);
    }

    answer() {
        this.pc.createAnswer(this.gotDescription.bind(this), this.doNothing, this.constraints);
    }

    gotDescription(localDesc) {
        this.pc.setLocalDescription(localDesc);
        this.send(localDesc);
    }

    doNothing() {
    };

    send(msg) {
        this.socket.emit('message', { room: this.room, msg: msg });
    }

    createPC() {
        var config = [{"url": "stun:stun.l.google.com:19302"}];

        this.pc = new RTCPeerConnection({iceServers:config});
        this.pc.onicecandidate = this.onIceCandidate.bind(this);
        this.pc.onaddstream = this.onRemoteStreamAdded.bind(this);
        this.pc.onremovestream = this.onRemoteStreamRemoved;
        this.pc.ondatachannel = this.onDataChannelAdded.bind(this);

        this.attachMediaIfReady();
    }

    onIceCandidate(e) {
        if (e.candidate) {
            this.send({type: 'candidate', mlineindex: e.candidate.sdpMLineIndex, candidate: e.candidate.candidate});
        }
    }

    onRemoteStreamAdded(e) {
        this.yourVideoStream = e.stream;
        this.yourVideo = document.getElementById('yourVideo').querySelector('video');
        this.yourVideo.srcObject = this.yourVideoStream;
        this.yourVideo.onloadedmetadata = (function(e) {
          this.yourVideo.play();
        }).bind(this);
    };

    onRemoteStreamRemoved(e) {
    }

    onDataChannelAdded(e) {
        this.dc = e.channel;
        this.setupDataHandlers();
    }

    setupDataHandlers() {
        this.dc.onmessage = (function(e) {
            var msg = JSON.parse(e.data);

            switch(msg.type) {
              case 'chat':
                this.msgs.push({msg_type: 'receive-msg', content: msg.content});
                break;

              case 'candidate':
                this.startDownload(msg.content);
                break;

              case 'data':
                this.progressDownload(msg.content);
                break;

              default:
                break;
            }

        }).bind(this);
    }

    startDownload(data) : void {
      this.incomingFileInfo = JSON.parse(data.toString());
      this.incomingFileData = [];
      this.bytesReceived = 0;
      console.log( 'incoming file <b>' + this.incomingFileInfo.fileName + '</b> of ' + this.incomingFileInfo.fileSize + ' bytes' );
    }

    progressDownload(data) : void {
      this.bytesReceived += data.byteLength;
      this.incomingFileData.push(data);
      console.log( 'progress: ' +  ((this.bytesReceived / this.incomingFileInfo.fileSize ) * 100).toFixed( 2 ) + '%' );
      if( this.bytesReceived === this.incomingFileInfo.fileSize ) {
          this.endDownload();
      }
    }

    endDownload() : void {
      var blob = new window.Blob(this.incomingFileData);
      var anchor = document.createElement( 'a' );
      anchor.href = URL.createObjectURL( blob );
      anchor.download = this.incomingFileInfo.fileName;
      anchor.textContent = 'XXXXXXX';

      if( anchor.click ) {
          anchor.click();
      } else {
          var evt = document.createEvent( 'MouseEvents' );
          evt.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
          anchor.dispatchEvent( evt );
      }
    }

    sendChat(msg) {
        this.msgs.push({msg_type: 'send-msg', content: msg});
        var data = JSON.stringify({
          type: 'chat',
          content: msg
        });
        this.dc.send(data);
    }

    sendMeta(meta) : void {
        var data = JSON.stringify({
          type: 'candidate',
          content: meta
        });
        this.dc.send(data);
    }

    sendData(chunk) : void {
        var data = JSON.stringify({
          type: 'data',
          content: chunk
        });
        this.dc.send(data);
    }

    openDialog(type) {
        this.dialog.open(type);
    }
}
