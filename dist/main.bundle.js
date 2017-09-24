webpackJsonp([1,5],{

/***/ 105:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 105;


/***/ }),

/***/ 106:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__(113);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__(123);




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 115:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client__ = __webpack_require__(263);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_socket_io_client__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dialog_component__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_material__ = __webpack_require__(42);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var AppComponent = (function () {
    function AppComponent(dialog) {
        var _this = this;
        this.dialog = dialog;
        this.msgs = [];
        this.myProfile = {
            username: '',
            status: '',
            avatar: ''
        };
        this.authenticated = false;
        this.videos = {};
        this.videoStreams = {};
        this.haveLocalMedia = false;
        this.pc = {};
        this.dc = {};
        this.peers = [];
        this.constraints = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };
        this.connect = function () {
            if (_this.haveLocalMedia && !_this.authenticated) {
                _this.socket.emit('auth', { lid: _this.lid });
            }
        };
        this.getMedia = function () {
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            }).then(_this.gotUserMedia).catch(_this.didntGetUserMedia);
        };
        this.gotUserMedia = function (stream) {
            var sid = _this.sid;
            _this.videoStreams[sid] = stream;
            _this.haveLocalMedia = true;
            _this.videos[sid] = document.getElementById('myVideo').querySelector('video');
            _this.videos[sid].srcObject = _this.videoStreams[sid];
            _this.videos[sid].onloadedmetadata = function (e) {
                _this.videos[sid].play();
            };
        };
        this.didntGetUserMedia = function (err) {
            console.log(err.name + ": " + err.message);
        };
        this.offer = function () {
            var _loop_1 = function (peer) {
                _this.pc[peer.sid] = _this.createPC(peer.sid);
                _this.dc[peer.sid] = _this.pc[peer.sid].createDataChannel('chat');
                _this.setupDataHandlers(peer.sid);
                _this.pc[peer.sid].createOffer(function (localDesc) {
                    _this.pc[peer.sid].setLocalDescription(localDesc);
                    _this.send(localDesc, peer.sid);
                }, _this.doNothing, _this.constraints);
            };
            for (var _i = 0, _a = _this.peers; _i < _a.length; _i++) {
                var peer = _a[_i];
                _loop_1(peer);
            }
        };
        this.answer = function (sid) {
            _this.pc[sid].createAnswer(function (localDesc) {
                _this.pc[sid].setLocalDescription(localDesc);
                _this.send(localDesc, sid);
            }, _this.doNothing, _this.constraints);
        };
        this.send = function (msg, to) {
            _this.socket.emit('message', { to: to, username: _this.myProfile.username, status: _this.myProfile.status, msg: msg });
        };
        this.createPC = function (i) {
            var _this = this;
            var config = [{ "url": "stun:stun.l.google.com:19302" }];
            var onIceCandidate = function (e) {
                if (e.candidate) {
                    _this.send({ type: 'candidate', mlineindex: e.candidate.sdpMLineIndex, candidate: e.candidate.candidate }, i);
                }
            };
            var onRemoteStreamAdded = function (e) {
                var _this = this;
                this.videoStreams[i] = e.stream;
                this.videos[i] = document.getElementById('yourVideo_' + i).querySelector('video_' + i);
                this.videos[i].srcObject = this.videoStreams[i];
                this.videos[i].onloadedmetadata = function (e) {
                    _this.videos[i].play();
                };
            };
            var onRemoteStreamRemoved = function (e) {
            };
            var onDataChannelAdded = function (e) {
                _this.dc[i] = e.channel;
                _this.setupDataHandlers(i);
            };
            var _pc;
            _pc = new RTCPeerConnection({ iceServers: config });
            _pc.onicecandidate = onIceCandidate;
            _pc.onaddstream = onRemoteStreamAdded;
            _pc.onremovestream = onRemoteStreamRemoved;
            _pc.ondatachannel = onDataChannelAdded;
            this.attachMediaIfReady(i);
            return _pc;
        };
        this.openDialog = function (type) {
            _this.dialog.open(type);
        };
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.room = null;
        this.getMedia();
        this.socket = __WEBPACK_IMPORTED_MODULE_1_socket_io_client__();
        this.socket.on('welcome', function (data) {
            this.sid = data.sid;
        });
        this.socket.on('auth', function (data) {
            if (data.valid) {
                if (data.usable) {
                    _this.authenticated = true;
                    _this.uid = data.uid;
                    _this.myProfile.username = data.username;
                    _this.myProfile.status = data.status;
                    _this.myProfile.avatar = data.avatar;
                    _this.room = data.room;
                    _this.peers = data.peers;
                    if (data.connectable) {
                        _this.offer();
                    }
                }
                else {
                    _this.openDialog(__WEBPACK_IMPORTED_MODULE_2__dialog_component__["b" /* AlreadyBeUsedDialog */]);
                }
            }
            else {
                _this.openDialog(__WEBPACK_IMPORTED_MODULE_2__dialog_component__["a" /* AuthencationFailureDialog */]);
            }
        });
        this.socket.on('message', function (data) {
            var msg = data.content;
            var peer = {
                sid: data.from,
                username: data.username,
                status: data.status
            };
            if (msg.type === "offer") {
                _this.peers.push(peer);
                _this.pc[peer.sid] = _this.createPC(peer.sid);
                _this.pc[peer.sid].setRemoteDescription(new RTCSessionDescription(msg));
                _this.answer(peer.sid);
            }
            else if (msg.type === "answer") {
                _this.pc[peer.sid].setRemoteDescription(new RTCSessionDescription(msg));
            }
            else if (msg.type === "candidate") {
                _this.pc[peer.sid].addIceCandidate(new RTCIceCandidate({ sdpMLineIndex: msg.mlineindex, candidate: msg.candidate }));
            }
        });
        this.socket.on('leave', function (data) {
            var sid = data.sid;
            for (var i = 0; i < _this.peers.length; i++) {
                if (_this.peers[i].sid === sid) {
                    _this.peers.splice(i, 1);
                    delete _this.pc.sid;
                    delete _this.dc.sid;
                    break;
                }
            }
        });
    };
    AppComponent.prototype.attachMediaIfReady = function (sid) {
        if (this.pc[sid] && this.haveLocalMedia) {
            this.attachMedia(sid);
        }
    };
    AppComponent.prototype.attachMedia = function (i) {
        this.pc[i].addStream(this.videoStreams[0]);
    };
    AppComponent.prototype.doNothing = function () {
    };
    ;
    AppComponent.prototype.setupDataHandlers = function (i) {
        this.dc[i].onmessage = (function (e) {
            try {
                var msg = JSON.parse(e.data);
                switch (msg.type) {
                    case 'chat':
                        this.msgs.push({ msg_type: 'receive-msg', content: msg.content });
                        break;
                    case 'candidate':
                        this.startDownload(msg.content);
                        break;
                }
            }
            catch (ex) {
                this.progressDownload(e.data);
            }
        }).bind(this);
    };
    AppComponent.prototype.startDownload = function (data) {
        this.incomingFileInfo = JSON.parse(data.toString());
        this.incomingFileData = [];
        this.bytesReceived = 0;
    };
    AppComponent.prototype.progressDownload = function (data) {
        this.bytesReceived += data.byteLength;
        this.incomingFileData.push(data);
        if (this.bytesReceived === this.incomingFileInfo.fileSize) {
            this.endDownload();
        }
    };
    AppComponent.prototype.endDownload = function () {
        var blob = new window.Blob(this.incomingFileData);
        var anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = this.incomingFileInfo.fileName;
        anchor.textContent = 'XXXXXXX';
        if (anchor.click) {
            anchor.click();
        }
        else {
            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            anchor.dispatchEvent(evt);
        }
    };
    AppComponent.prototype.sendChat = function (msg) {
        this.msgs.push({ msg_type: 'send-msg', content: msg });
        var data = JSON.stringify({
            type: 'chat',
            content: msg
        });
        for (var _i = 0, _a = this.peers; _i < _a.length; _i++) {
            var peer = _a[_i];
            this.dc[peer.sid].send(data);
        }
    };
    AppComponent.prototype.sendMeta = function (meta) {
        var data = JSON.stringify({
            type: 'candidate',
            content: meta
        });
        for (var _i = 0, _a = this.peers; _i < _a.length; _i++) {
            var peer = _a[_i];
            this.dc[peer.sid].send(data);
        }
    };
    AppComponent.prototype.sendData = function (chunk) {
        for (var _i = 0, _a = this.peers; _i < _a.length; _i++) {
            var peer = _a[_i];
            this.dc[peer.sid].send(chunk);
        }
    };
    return AppComponent;
}());
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__(204),
        styles: [__webpack_require__(191)]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_3__angular_material__["c" /* MdDialog */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_material__["c" /* MdDialog */]) === "function" && _a || Object])
], AppComponent);

var _a;
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 116:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_material__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser_animations__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__menu_bar_component__ = __webpack_require__(120);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__media_area_component__ = __webpack_require__(119);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__video_frame_component__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__chat_box_component__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__dialog_component__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__icon_component__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__progress_component__ = __webpack_require__(121);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};















var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["b" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */],
            __WEBPACK_IMPORTED_MODULE_7__menu_bar_component__["a" /* MenuBarComponent */],
            __WEBPACK_IMPORTED_MODULE_8__media_area_component__["a" /* MediaAreaComponent */],
            __WEBPACK_IMPORTED_MODULE_9__video_frame_component__["a" /* VideoFrameComponent */],
            __WEBPACK_IMPORTED_MODULE_10__chat_box_component__["a" /* ChatBoxComponent */],
            __WEBPACK_IMPORTED_MODULE_11__dialog_component__["a" /* AuthencationFailureDialog */],
            __WEBPACK_IMPORTED_MODULE_11__dialog_component__["b" /* AlreadyBeUsedDialog */],
            __WEBPACK_IMPORTED_MODULE_12__icon_component__["a" /* AttachmentIcon */],
            __WEBPACK_IMPORTED_MODULE_13__progress_component__["a" /* ProgressBar */]
        ],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_11__dialog_component__["a" /* AuthencationFailureDialog */],
            __WEBPACK_IMPORTED_MODULE_11__dialog_component__["b" /* AlreadyBeUsedDialog */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["a" /* MaterialModule */],
            __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */]
        ],
        providers: [],
        bootstrap: [
            __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */]
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 117:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChatBoxComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ChatBoxComponent = (function () {
    function ChatBoxComponent() {
        this.onSendChat = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
        this.onTransferData = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
        this.onTransferMeta = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
    }
    ChatBoxComponent.prototype.ngOnInit = function () {
        this.txt = '';
    };
    ChatBoxComponent.prototype.sendMessage = function () {
        this.onSendChat.emit(this.txt);
        this.txt = '';
    };
    ChatBoxComponent.prototype.transferData = function (chunk) {
        this.onTransferData.emit(chunk);
    };
    ChatBoxComponent.prototype.transferMeta = function (info) {
        this.onTransferMeta.emit(info);
    };
    return ChatBoxComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Object)
], ChatBoxComponent.prototype, "msgs", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Output */])(),
    __metadata("design:type", Object)
], ChatBoxComponent.prototype, "onSendChat", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Output */])(),
    __metadata("design:type", Object)
], ChatBoxComponent.prototype, "onTransferData", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Output */])(),
    __metadata("design:type", Object)
], ChatBoxComponent.prototype, "onTransferMeta", void 0);
ChatBoxComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'chat-box',
        template: __webpack_require__(205),
        styles: [__webpack_require__(192)]
    })
], ChatBoxComponent);

//# sourceMappingURL=chat-box.component.js.map

/***/ }),

/***/ 118:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material__ = __webpack_require__(42);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AttachmentIcon; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AttachmentIcon = (function () {
    function AttachmentIcon(iconRegistry, sanitizer) {
        this.BYTES_PER_CHUNK = 1200;
        this.onReadContent = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
        this.onReadInfo = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
        iconRegistry.addSvgIcon('attachment', sanitizer.bypassSecurityTrustResourceUrl('../assets/ic_attachment_black_48px.svg'));
    }
    AttachmentIcon.prototype.ngOnInit = function () {
        this.currentChunk = 0;
        this.reader = new FileReader();
    };
    AttachmentIcon.prototype.changeListener = function ($event) {
        this.file = $event.target.files[0];
        this.onReadInfo.emit(JSON.stringify({
            fileName: this.file.name,
            fileSize: this.file.size
        }));
        this.readFile();
    };
    AttachmentIcon.prototype.readFile = function () {
        this.reader.onload = function () {
            this.onReadContent.emit(this.reader.result);
            this.currentChunk++;
            if (this.BYTES_PER_CHUNK * this.currentChunk < this.file.size) {
                this.readNextChunk();
            }
        }.bind(this);
        this.readNextChunk();
    };
    AttachmentIcon.prototype.readNextChunk = function () {
        var start = this.BYTES_PER_CHUNK * this.currentChunk;
        var end = Math.min(this.file.size, start + this.BYTES_PER_CHUNK);
        this.reader.readAsArrayBuffer(this.file.slice(start, end));
    };
    return AttachmentIcon;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Output */])(),
    __metadata("design:type", Object)
], AttachmentIcon.prototype, "onReadContent", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Output */])(),
    __metadata("design:type", Object)
], AttachmentIcon.prototype, "onReadInfo", void 0);
AttachmentIcon = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'attachment-icon',
        template: __webpack_require__(208),
        styles: [__webpack_require__(193)]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__angular_material__["b" /* MdIconRegistry */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_material__["b" /* MdIconRegistry */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["f" /* DomSanitizer */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["f" /* DomSanitizer */]) === "function" && _b || Object])
], AttachmentIcon);

var _a, _b;
//# sourceMappingURL=icon.component.js.map

/***/ }),

/***/ 119:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MediaAreaComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var MediaAreaComponent = (function () {
    function MediaAreaComponent() {
    }
    MediaAreaComponent.prototype.ngOnInit = function () {
    };
    return MediaAreaComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Object)
], MediaAreaComponent.prototype, "myProfile", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Object)
], MediaAreaComponent.prototype, "peers", void 0);
MediaAreaComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'media-area',
        template: __webpack_require__(209),
        styles: [__webpack_require__(194)]
    }),
    __metadata("design:paramtypes", [])
], MediaAreaComponent);

//# sourceMappingURL=media-area.component.js.map

/***/ }),

/***/ 120:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MenuBarComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var MenuBarComponent = (function () {
    function MenuBarComponent() {
    }
    return MenuBarComponent;
}());
MenuBarComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'menu-bar',
        template: __webpack_require__(210),
        styles: [__webpack_require__(195)]
    })
], MenuBarComponent);

//# sourceMappingURL=menu-bar.component.js.map

/***/ }),

/***/ 121:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProgressBar; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var ProgressBar = (function () {
    function ProgressBar() {
    }
    return ProgressBar;
}());
ProgressBar = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'progress-bar',
        template: __webpack_require__(211),
        styles: [__webpack_require__(196)]
    })
], ProgressBar);

//# sourceMappingURL=progress.component.js.map

/***/ }),

/***/ 122:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return VideoFrameComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var VideoFrameComponent = (function () {
    function VideoFrameComponent() {
    }
    VideoFrameComponent.prototype.ngOnInit = function () {
        this.hideVideo = false;
    };
    VideoFrameComponent.prototype.hide = function () {
        this.hideVideo = true;
    };
    return VideoFrameComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], VideoFrameComponent.prototype, "username", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], VideoFrameComponent.prototype, "status", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], VideoFrameComponent.prototype, "avatar", void 0);
VideoFrameComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'video-frame',
        template: __webpack_require__(212),
        styles: [__webpack_require__(197)]
    })
], VideoFrameComponent);

//# sourceMappingURL=video-frame.component.js.map

/***/ }),

/***/ 123:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ 191:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 192:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, ".chat-box {\n\twidth: 500px;\n\theight: 500px;\n\tbottom: 0px;\n\tleft: 0px;\n\tmargin-top: 70px;\n}\n\n.chat-box-output {\n\twidth: 500px;\n\theight: 400px;\n\tborder: 1px solid;\n\toverflow: auto;\n}\n\n.input-full-width {\n\twidth: 100%;\n}\n\n.send-msg {\n\tfloat: left;\n\tclear: both;\n\tmax-width: 300px;\n\tword-break: normal;\n\tmargin: 5px 3px 0 0;\n}\n\n.receive-msg {\n\tfloat: right;\n\tclear: both;\n\tmax-width: 300px;\n\tword-break: normal;\n\tmargin: 5px 0 0 3px;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 193:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, ".attachment {\n\tcursor: pointer;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 194:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, ".media-area {\n\theight: 350px;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 195:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 196:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 197:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(12)();
// imports


// module
exports.push([module.i, ".video-frame {\n\twidth: 300px;\n\tword-break: break-word;\n\tfloat: left;\n\tmargin: 10px;\n}\n\n.info {\n\theight: 61px;\n}\n\n.avatar-image {\n\tbackground-image: url('#');\n\tbackground-size: cover;\n}\n\nvideo {\n\twidth: 300px;\n\theight: 225px;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 204:
/***/ (function(module, exports) {

module.exports = "<menu-bar></menu-bar>\n<md-input-container>\n\t<input mdInput [(ngModel)]=\"lid\" placeholder=\"Login ID\">\n</md-input-container>\n<button md-button (click)=\"connect()\" *ngIf=\"!authenticated\">Connect!</button>\n<media-area [(myProfile)]=\"myProfile\" [(peers)]=\"peers\"></media-area>\n<chat-box (onSendChat)=\"sendChat($event)\" (onTransferData)=\"sendData($event)\" (onTransferMeta)=\"sendMeta($event)\" [(msgs)]=\"msgs\"></chat-box>\n"

/***/ }),

/***/ 205:
/***/ (function(module, exports) {

module.exports = "<div class=\"chat-box\">\n\t<div class=\"chat-box-output\">\n\t\t<md-chip-list *ngFor=\"let msg of msgs\" [ngClass]=\"msg.msg_type\">\n\t\t\t<md-chip>{{msg.content}}</md-chip>\n\t\t</md-chip-list>\n\t\t<!-- <progress-bar></progress-bar> -->\n\t</div>\n\t<div class=\"chat-box-input\">\n\t\t<attachment-icon (onReadContent)=\"transferData($event)\" (onReadInfo)=\"transferMeta($event)\"></attachment-icon>\n\t\t<md-input-container class=\"input-full-width\">\n\t\t\t<textarea [(ngModel)]=\"txt\" (keyup.enter)=\"sendMessage()\" mdInput placeholder=\"Type some text\"></textarea>\n\t\t</md-input-container>\n\t</div>\n</div>"

/***/ }),

/***/ 206:
/***/ (function(module, exports) {

module.exports = "<p>This account already be used! Please use another account!</p>"

/***/ }),

/***/ 207:
/***/ (function(module, exports) {

module.exports = "<p>Invalid username!!!</p>"

/***/ }),

/***/ 208:
/***/ (function(module, exports) {

module.exports = "<label>\n\t<md-icon svgIcon=\"attachment\" class=\"attachment\"></md-icon>\n\t<input type=\"file\" name=\"input-name\" (change)=\"changeListener($event)\" style=\"display: none;\" />\n</label>"

/***/ }),

/***/ 209:
/***/ (function(module, exports) {

module.exports = "<div class=\"media-area\">\n\t<video-frame id=\"myVideo\" [(username)]=\"myProfile.username\" [(status)]=\"myProfile.status\" [(avatar)]=\"myProfile.avatar\"></video-frame>\n\t<video-frame *ngFor=\"let peer of peers\" [id]=\"peer.sid\" [(username)]=\"peer.username\" [(status)]=\"peer.status\" [(avatar)]=\"peer.avatar\"></video-frame>\n</div>\n"

/***/ }),

/***/ 210:
/***/ (function(module, exports) {

module.exports = "<md-toolbar><h1>Realtime communication with WebRTC</h1></md-toolbar>"

/***/ }),

/***/ 211:
/***/ (function(module, exports) {

module.exports = "<md-progress-bar mode=\"indeterminate\" color=\"primary\"></md-progress-bar>"

/***/ }),

/***/ 212:
/***/ (function(module, exports) {

module.exports = "<md-card class=\"video-frame\" *ngIf=\"!hideVideo\">\n\t<md-card-header class=\"info\">\n\t\t<div md-card-avatar class=\"avatar-image\" [ngStyle]=\"{'background-image': 'url(' + avatar + ')'}\"></div>\n\t\t<md-card-title>{{username}}</md-card-title>\n\t\t<md-card-subtitle>{{status}}</md-card-subtitle>\n\t</md-card-header>\n\t<md-card-content>\n\t\t<video autoplay></video>\n\t</md-card-content>\n\t<md-card-actions>\n\t\t<button md-button>BUZZ</button>\n\t\t<button md-button (click)='hide()'>HIDE</button>\n\t</md-card-actions>\n</md-card>"

/***/ }),

/***/ 270:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(106);


/***/ }),

/***/ 43:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthencationFailureDialog; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return AlreadyBeUsedDialog; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AuthencationFailureDialog = (function () {
    function AuthencationFailureDialog() {
    }
    return AuthencationFailureDialog;
}());
AuthencationFailureDialog = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'authencation-failure-dialog',
        template: __webpack_require__(207),
    })
], AuthencationFailureDialog);

var AlreadyBeUsedDialog = (function () {
    function AlreadyBeUsedDialog() {
    }
    return AlreadyBeUsedDialog;
}());
AlreadyBeUsedDialog = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'already-be-used-dialog',
        template: __webpack_require__(206),
    })
], AlreadyBeUsedDialog);

//# sourceMappingURL=dialog.component.js.map

/***/ })

},[271]);
//# sourceMappingURL=main.bundle.js.map