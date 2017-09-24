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

    private myProfile: any = {
        username: '',
        status: '',
        avatar: ''
    }

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
                    this.myProfile.username = data.username;
                    this.myProfile.status = data.status;
                    this.myProfile.avatar = data.avatar;
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
            let msg = data.content;
            let peer: any = {
                sid: data.from,
                username: data.username,
                status: data.status
            }

            if (msg.type === "offer") {
                this.peers.push(peer);
                this.pc[peer.sid] = this.createPC(peer.sid);
                this.pc[peer.sid].setRemoteDescription(new RTCSessionDescription(msg));
                this.answer(peer.sid);
            } else if (msg.type === "answer") {
                this.pc[peer.sid].setRemoteDescription(new RTCSessionDescription(msg));
            } else if (msg.type === "candidate") {
                this.pc[peer.sid].addIceCandidate(new RTCIceCandidate({sdpMLineIndex:msg.mlineindex, candidate:msg.candidate}));
            }
        });

        this.socket.on('leave', (data) => {
            let sid: string = data.sid;
            for (let i: number = 0; i < this.peers.length; i++) {
                if (this.peers[i].sid === sid) {
                    this.peers.splice(i, 1);
                    delete this.pc.sid;
                    delete this.dc.sid;
                    break;
                }
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

    attachMediaIfReady(sid) {
        if (this.pc[sid] && this.haveLocalMedia) {
            this.attachMedia(sid);
        }
    }

    attachMedia(i) {
        this.pc[i].addStream(this.videoStreams[0]);
    }

    offer = () => {
        for (let peer of this.peers) {
            this.pc[peer.sid] = this.createPC(peer.sid);
            this.dc[peer.sid] = this.pc[peer.sid].createDataChannel('chat');
            this.setupDataHandlers(peer.sid);
            this.pc[peer.sid].createOffer((localDesc) => {
                this.pc[peer.sid].setLocalDescription(localDesc);
                this.send(localDesc, peer.sid);
            }, this.doNothing, this.constraints);
        }

    }

    answer = (sid) => {
        this.pc[sid].createAnswer((localDesc) => {
            this.pc[sid].setLocalDescription(localDesc);
            this.send(localDesc, sid);
        }, this.doNothing, this.constraints);
    }

    doNothing() {
    };

    send = (msg, to) => {
        this.socket.emit('message', { to: to, username: this.myProfile.username, status: this.myProfile.status, msg: msg });
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
        for (let peer of this.peers) {
            this.dc[peer.sid].send(data);
        }
    }

    sendMeta(meta) : void {
        var data = JSON.stringify({
          type: 'candidate',
          content: meta
        });
        for (let peer of this.peers) {
          this.dc[peer.sid].send(data);
        }
    }

    sendData(chunk) : void {
        for (let peer of this.peers) {
            this.dc[peer.sid].send(chunk);
        }
    }

    openDialog = (type) => {
        this.dialog.open(type);
    };

}
