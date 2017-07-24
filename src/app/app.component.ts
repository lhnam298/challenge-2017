import { Component } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthencationFailureDialog } from './dialog.component';
import { MdDialog } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './html/app.component.html',
  styleUrls: ['./css/app.component.css']
})

export class AppComponent {

    constructor(public dialog: MdDialog) {}
    rtc;
    socket;
    msgs;
    username;
    authenticated;
//    connected;

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
        if (this.haveLocalMedia && this.username !== '') {
            this.socket.emit('auth', { msg: this.username });
        }
    }

    ngOnInit() {
        this.msgs = [];
        this.username = '';
        this.authenticated = false;
//        this.connected = false;
        this.getMedia();

        this.socket = io();

        this.socket.on('id', (function (data) {
            console.log(data);
        }).bind(this));

        this.socket.on('auth', (function (data) {
          if (data.valid) {
              this.authenticated = true;
              if (data.ready_for_connect) {
                  this.createPC();
                  this.offer();
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
            video: true
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
        this.socket.emit('message', { msg: msg });
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
//        this.connected = true;
        this.setupDataHandlers();
    }

    setupDataHandlers() {
        this.dc.onmessage = (function(e) {
            var msg = JSON.parse(e.data);
            this.msgs.push({msg_type: 'receive-msg', content: msg});
        }).bind(this);
    }

    sendChat(msg) {
        this.msgs.push({msg_type: 'send-msg', content: msg});
//        if (!this.connected) return;
        var data = JSON.stringify(msg)
        this.dc.send(data);
    }

    openDialog(type) {
        this.dialog.open(type);
    }
}
