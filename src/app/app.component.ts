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

    private msgs: Array<any> = [];
    private lid: string;
    private uid: number;
    private sid: string;

    private username: string;
    private status: string;
    private room: number;
    private authenticated: boolean = false;

    private incomingFileInfo: any;
    private incomingFileData: any;
    private bytesReceived: number;

    private videos: any = {};
    private videoStreams: any = {};

    private rtc: any;
    private socket: any;
    private haveLocalMedia: boolean = false;
    private pc: any = {};
    private dc: any = {};
    private peers: Array<any> = [];
    private constraints: any = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    constructor(public dialog: MdDialog) {

    }

    ngOnInit() {
        this.room = null;
        this.getMedia();

        this.socket = io();

        this.socket.on('welcome', function (data) {
            this.sid = data.sid;
        });

        this.socket.on('auth', (data) => {
            if (data.valid) {
                if (data.usable) {
                    this.authenticated = true;
                    this.uid = data.uid;
                    this.username = data.username;
                    this.status = data.status;
                    this.room = data.room;
                    this.peers = data.peers;
                    if (data.connectable) {
                        this.offer();
                    }
                } else {
                    this.openDialog(AlreadyBeUsedDialog);
                }
            } else {
                this.openDialog(AuthencationFailureDialog);
            }
        });

        this.socket.on('message', (data) => {
            let i = data.from;
            let msg = data.content;

            if (msg.type === "offer") {
                this.peers.push(i);
                this.pc[i] = this.createPC(i);
                this.pc[i].setRemoteDescription(new RTCSessionDescription(msg));
                this.answer(i);
            } else if (msg.type === "answer") {
                this.pc[i].setRemoteDescription(new RTCSessionDescription(msg));
            } else if (msg.type === "candidate") {
                this.pc[i].addIceCandidate(new RTCIceCandidate({sdpMLineIndex:msg.mlineindex, candidate:msg.candidate}));
            }
        });

        this.socket.on('leave', (data) => {
            let sid = data.sid;
            let index: number = this.peers.indexOf(sid);
            if (index !== -1) {
                this.peers.splice(index, 1);
                delete this.pc.sid;
                delete this.dc.sid;
            }
        })
    }

    connect = () => {
        if (this.haveLocalMedia && !this.authenticated) {
            this.socket.emit('auth', { lid: this.lid });
        }
    };

    getMedia = () => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).then(this.gotUserMedia).catch(this.didntGetUserMedia);
    };

    gotUserMedia = (stream) => {
        let sid = this.sid;
        this.videoStreams[sid] = stream;
        this.haveLocalMedia = true;

        this.videos[sid] = document.getElementById('myVideo').querySelector('video');
        this.videos[sid].srcObject = this.videoStreams[sid];
        this.videos[sid].onloadedmetadata = (e) => {
            this.videos[sid].play();
        };

    };

    didntGetUserMedia = (err) => {
        console.log(err.name + ": " + err.message);
    };

    attachMediaIfReady(i) {
        if (this.pc[i] && this.haveLocalMedia) {
            this.attachMedia(i);
        }
    }

    attachMedia(i) {
        this.pc[i].addStream(this.videoStreams[0]);
    }

    offer = () => {
        for (let i of this.peers) {
            this.pc[i] = this.createPC(i);
            this.dc[i] = this.pc[i].createDataChannel('chat');
            this.setupDataHandlers(i);
            this.pc[i].createOffer((localDesc) => {
                this.pc[i].setLocalDescription(localDesc);
                this.send(localDesc, i, true);
            }, this.doNothing, this.constraints);
        }

    }

    answer = (i) => {
        this.pc[i].createAnswer((localDesc) => {
            this.pc[i].setLocalDescription(localDesc);
            this.send(localDesc, i, true);
        }, this.doNothing, this.constraints);
    }

    doNothing() {
    };

    send = (msg, to, isOfferAnswer=false) => {
        if (isOfferAnswer) {
            this.socket.emit('message', { to: to, username: this.username, status: this.status, msg: msg });
        } else {
            this.socket.emit('message', { to: to, msg: msg });
        }
    }

    createPC = function (i) {
        let config = [{"url": "stun:stun.l.google.com:19302"}];

        let onIceCandidate = (e) => {
            if (e.candidate) {
                this.send({type: 'candidate', mlineindex: e.candidate.sdpMLineIndex, candidate: e.candidate.candidate}, i);
            }
        };

        let onRemoteStreamAdded = function (e) {
            this.videoStreams[i] = e.stream;
            this.videos[i] = document.getElementById('yourVideo_' + i).querySelector('video_' + i);
            this.videos[i].srcObject = this.videoStreams[i];
            this.videos[i].onloadedmetadata = (e) => {
                this.videos[i].play();
            };
        };

        let onRemoteStreamRemoved = function (e) {
        }

        let onDataChannelAdded = (e) => {
            this.dc[i] = e.channel;
            this.setupDataHandlers(i);
        };

        let _pc: any;
        _pc = new RTCPeerConnection({iceServers:config});
        _pc.onicecandidate = onIceCandidate;
        _pc.onaddstream = onRemoteStreamAdded;
        _pc.onremovestream = onRemoteStreamRemoved;
        _pc.ondatachannel = onDataChannelAdded;
        this.attachMediaIfReady(i);

        return _pc;
    };

    setupDataHandlers(i) {
        this.dc[i].onmessage = (function(e) {
            try {
              var msg = JSON.parse(e.data);

              switch(msg.type) {
                case 'chat':
                  this.msgs.push({msg_type: 'receive-msg', content: msg.content});
                  break;

                case 'candidate':
                  this.startDownload(msg.content);
                  break;
              }

            } catch (ex) {
              this.progressDownload(e.data);
            }
        }).bind(this);
    }

    startDownload(data) : void {
      this.incomingFileInfo = JSON.parse(data.toString());
      this.incomingFileData = [];
      this.bytesReceived = 0;
    }

    progressDownload(data) : void {
      this.bytesReceived += data.byteLength;
      this.incomingFileData.push(data);
      if(this.bytesReceived === this.incomingFileInfo.fileSize) {
          this.endDownload();
      }
    }

    endDownload() : void {
      var blob = new window.Blob(this.incomingFileData);
      var anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = this.incomingFileInfo.fileName;
      anchor.textContent = 'XXXXXXX';

      if( anchor.click ) {
          anchor.click();
      } else {
          var evt = document.createEvent('MouseEvents');
          evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          anchor.dispatchEvent(evt);
      }
    }

    sendChat(msg) : void {
        this.msgs.push({msg_type: 'send-msg', content: msg});
        var data = JSON.stringify({
          type: 'chat',
          content: msg
        });
        for (let i of this.peers) {
            this.dc[i].send(data);
        }
    }

    sendMeta(meta) : void {
        var data = JSON.stringify({
          type: 'candidate',
          content: meta
        });
        for (let i of this.peers) {
          this.dc[i].send(data);
        }
    }

    sendData(chunk) : void {
        for (let i of this.peers) {
            this.dc[i].send(chunk);
        }
    }

    openDialog = (type) => {
        this.dialog.open(type);
    };

    createVideoBox(sender) : void {
//      let parent = document.getElementsByClassName('media-area');
//      let child = '<video-frame id="partner_'+ sender +'"></video-frame>';
//      parent.innerHTML = child;
    }
}
