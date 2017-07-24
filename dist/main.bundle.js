webpackJsonp([1,5],{

/***/ 103:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 103;


/***/ }),

/***/ 104:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__(120);




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 114:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client__ = __webpack_require__(254);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_socket_io_client__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dialog_component__ = __webpack_require__(267);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_material__ = __webpack_require__(111);
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
        this.dialog = dialog;
        //    connected;
        this.haveLocalMedia = false;
        this.constraints = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };
    }
    AppComponent.prototype.connect = function () {
        if (this.haveLocalMedia && this.username !== '') {
            this.socket.emit('auth', { msg: this.username });
        }
    };
    AppComponent.prototype.ngOnInit = function () {
        this.msgs = [];
        this.username = '';
        this.authenticated = false;
        //        this.connected = false;
        this.getMedia();
        this.socket = __WEBPACK_IMPORTED_MODULE_1_socket_io_client__();
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
            }
            else {
                this.openDialog(__WEBPACK_IMPORTED_MODULE_2__dialog_component__["a" /* AuthencationFailureDialog */]);
            }
        }).bind(this));
        this.socket.on('message', (function (data) {
            if (data.type === "offer") {
                this.createPC();
                this.pc.setRemoteDescription(new RTCSessionDescription(data));
                this.answer();
            }
            else if (data.type === "answer") {
                this.pc.setRemoteDescription(new RTCSessionDescription(data));
            }
            else if (data.type === "candidate") {
                this.pc.addIceCandidate(new RTCIceCandidate({ sdpMLineIndex: data.mlineindex, candidate: data.candidate }));
            }
        }).bind(this));
    };
    AppComponent.prototype.getMedia = function () {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }).then(this.gotUserMedia.bind(this)).catch(this.didntGetUserMedia);
    };
    AppComponent.prototype.gotUserMedia = function (stream) {
        this.myVideoStream = stream;
        this.haveLocalMedia = true;
        this.myVideo = document.getElementById('myVideo').querySelector('video');
        this.myVideo.srcObject = this.myVideoStream;
        this.myVideo.onloadedmetadata = (function (e) {
            this.myVideo.play();
        }).bind(this);
        this.attachMediaIfReady();
    };
    AppComponent.prototype.didntGetUserMedia = function (err) {
        console.log(err.name + ": " + err.message);
    };
    AppComponent.prototype.attachMediaIfReady = function () {
        if (this.pc && this.haveLocalMedia) {
            this.attachMedia();
        }
    };
    AppComponent.prototype.attachMedia = function () {
        this.pc.addStream(this.myVideoStream);
    };
    AppComponent.prototype.offer = function () {
        this.dc = this.pc.createDataChannel('chat');
        this.setupDataHandlers();
        this.pc.createOffer(this.gotDescription.bind(this), this.doNothing, this.constraints);
    };
    AppComponent.prototype.answer = function () {
        this.pc.createAnswer(this.gotDescription.bind(this), this.doNothing, this.constraints);
    };
    AppComponent.prototype.gotDescription = function (localDesc) {
        this.pc.setLocalDescription(localDesc);
        this.send(localDesc);
    };
    AppComponent.prototype.doNothing = function () {
    };
    ;
    AppComponent.prototype.send = function (msg) {
        this.socket.emit('message', { msg: msg });
    };
    AppComponent.prototype.createPC = function () {
        var config = [{ "url": "stun:stun.l.google.com:19302" }];
        this.pc = new RTCPeerConnection({ iceServers: config });
        this.pc.onicecandidate = this.onIceCandidate.bind(this);
        this.pc.onaddstream = this.onRemoteStreamAdded.bind(this);
        this.pc.onremovestream = this.onRemoteStreamRemoved;
        this.pc.ondatachannel = this.onDataChannelAdded.bind(this);
        this.attachMediaIfReady();
    };
    AppComponent.prototype.onIceCandidate = function (e) {
        if (e.candidate) {
            this.send({ type: 'candidate', mlineindex: e.candidate.sdpMLineIndex, candidate: e.candidate.candidate });
        }
    };
    AppComponent.prototype.onRemoteStreamAdded = function (e) {
        this.yourVideoStream = e.stream;
        this.yourVideo = document.getElementById('yourVideo').querySelector('video');
        this.yourVideo.srcObject = this.yourVideoStream;
        this.yourVideo.onloadedmetadata = (function (e) {
            this.yourVideo.play();
        }).bind(this);
    };
    ;
    AppComponent.prototype.onRemoteStreamRemoved = function (e) {
    };
    AppComponent.prototype.onDataChannelAdded = function (e) {
        this.dc = e.channel;
        //        this.connected = true;
        this.setupDataHandlers();
    };
    AppComponent.prototype.setupDataHandlers = function () {
        this.dc.onmessage = (function (e) {
            var msg = JSON.parse(e.data);
            this.msgs.push({ msg_type: 'receive-msg', content: msg });
        }).bind(this);
    };
    AppComponent.prototype.sendChat = function (msg) {
        this.msgs.push({ msg_type: 'send-msg', content: msg });
        //        if (!this.connected) return;
        var data = JSON.stringify(msg);
        this.dc.send(data);
    };
    AppComponent.prototype.openDialog = function (type) {
        this.dialog.open(type);
    };
    return AppComponent;
}());
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__(199),
        styles: [__webpack_require__(188)]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_3__angular_material__["b" /* MdDialog */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_material__["b" /* MdDialog */]) === "function" && _a || Object])
], AppComponent);

var _a;
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 115:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_material__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser_animations__ = __webpack_require__(113);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__menu_bar_component__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__media_area_component__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__video_frame_component__ = __webpack_require__(119);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__chat_box_component__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__dialog_component__ = __webpack_require__(267);
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
            __WEBPACK_IMPORTED_MODULE_11__dialog_component__["a" /* AuthencationFailureDialog */]
        ],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_11__dialog_component__["a" /* AuthencationFailureDialog */]
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
            __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */],
            __WEBPACK_IMPORTED_MODULE_7__menu_bar_component__["a" /* MenuBarComponent */],
            __WEBPACK_IMPORTED_MODULE_8__media_area_component__["a" /* MediaAreaComponent */],
            __WEBPACK_IMPORTED_MODULE_9__video_frame_component__["a" /* VideoFrameComponent */],
            __WEBPACK_IMPORTED_MODULE_10__chat_box_component__["a" /* ChatBoxComponent */],
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 116:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
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
        this.onSent = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
    }
    ChatBoxComponent.prototype.ngOnInit = function () {
        this.txt = '';
    };
    ChatBoxComponent.prototype.sendMessage = function () {
        this.onSent.emit(this.txt);
        this.txt = '';
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
], ChatBoxComponent.prototype, "onSent", void 0);
ChatBoxComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'chat-box',
        template: __webpack_require__(200),
        styles: [__webpack_require__(189)]
    })
], ChatBoxComponent);

//# sourceMappingURL=chat-box.component.js.map

/***/ }),

/***/ 117:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MediaAreaComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var MediaAreaComponent = (function () {
    function MediaAreaComponent() {
    }
    return MediaAreaComponent;
}());
MediaAreaComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'media-area',
        template: __webpack_require__(201),
        styles: [__webpack_require__(190)]
    })
], MediaAreaComponent);

//# sourceMappingURL=media-area.component.js.map

/***/ }),

/***/ 118:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
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
        template: __webpack_require__(202),
        styles: [__webpack_require__(191)]
    })
], MenuBarComponent);

//# sourceMappingURL=menu-bar.component.js.map

/***/ }),

/***/ 119:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return VideoFrameComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var VideoFrameComponent = (function () {
    function VideoFrameComponent() {
    }
    return VideoFrameComponent;
}());
VideoFrameComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* Component */])({
        selector: 'video-frame',
        template: __webpack_require__(203),
        styles: [__webpack_require__(192)]
    })
], VideoFrameComponent);

//# sourceMappingURL=video-frame.component.js.map

/***/ }),

/***/ 120:
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

/***/ 188:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(18)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 189:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(18)();
// imports


// module
exports.push([module.i, ".chat-box {\n\twidth: 500px;\n\theight: 500px;\n\tbottom: 0px;\n\tleft: 0px;\n\tmargin-top: 100px;\n}\n\n.chat-box-output {\n\twidth: 500px;\n\theight: 400px;\n\tborder: 1px solid;\n\toverflow: auto;\n}\n\n.input-full-width {\n\twidth: 100%;\n}\n\n.send-msg {\n\tfloat: left;\n\tclear: both;\n\tmax-width: 300px;\n\tword-break: normal;\n}\n\n.receive-msg {\n\tfloat: right;\n\tclear: both;\n\tmax-width: 300px;\n\tword-break: normal;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 190:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(18)();
// imports


// module
exports.push([module.i, ".media-area {\n\theight: 350px;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 191:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(18)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 192:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(18)();
// imports


// module
exports.push([module.i, ".video-frame {\n\twidth: 300px;\n\tword-break: break-word;\n\tfloat: left;\n\tmargin: 10px;\n}\n\n.avatar-image {\n\tbackground-image: url('#');\n\tbackground-size: cover;\n}\n\nvideo {\n\twidth: 300px;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 199:
/***/ (function(module, exports) {

module.exports = "<menu-bar></menu-bar>\n<md-input-container>\n\t<input mdInput [(ngModel)]=\"username\" placeholder=\"Username\">\n</md-input-container>\n<button md-button (click)=\"connect()\" *ngIf=\"!authenticated\">Connect!</button>\n<media-area></media-area>\n<chat-box (onSent)=\"sendChat($event)\" style=\"display: none\"></chat-box>\n<chat-box (onSent)=\"sendChat($event)\" [(msgs)]=\"msgs\"></chat-box>\n"

/***/ }),

/***/ 200:
/***/ (function(module, exports) {

module.exports = "<div class=\"chat-box\">\n\t<div class=\"chat-box-output\">\n\t\t<md-chip-list *ngFor=\"let msg of msgs\" [ngClass]=\"msg.msg_type\">\n\t\t\t<md-chip>{{msg.content}}</md-chip>\n\t\t</md-chip-list>\n\t</div>\n\t<div class=\"chat-box-input\">\n\t\t<md-input-container class=\"input-full-width\">\n\t\t\t<textarea [(ngModel)]=\"txt\" (keyup.enter)=\"sendMessage()\" mdInput placeholder=\"Type some text\"></textarea>\n\t\t</md-input-container>\n\t</div>\n</div>"

/***/ }),

/***/ 201:
/***/ (function(module, exports) {

module.exports = "<div class=\"media-area\">\n\t<video-frame id=\"myVideo\"></video-frame>\n\t<video-frame id=\"yourVideo\"></video-frame>\n</div>\n"

/***/ }),

/***/ 202:
/***/ (function(module, exports) {

module.exports = "<md-toolbar><h1>Realtime communication with WebRTC</h1></md-toolbar>"

/***/ }),

/***/ 203:
/***/ (function(module, exports) {

module.exports = "<md-card class=\"video-frame\">\n\t<md-card-header>\n\t\t<div md-card-avatar class=\"avatar-image\"></div>\n\t\t<md-card-title>Nickname</md-card-title>\n\t\t<md-card-subtitle>Category</md-card-subtitle>\n\t</md-card-header>\n\t\t<video autoplay></video>\n\t<md-card-content>\n\t\t<p>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>\n\t</md-card-content>\n\t<md-card-actions>\n\t\t<button md-button>BUZZ</button>\n\t\t<button md-button>HIDE</button>\n\t</md-card-actions>\n</md-card>"

/***/ }),

/***/ 261:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 262:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(104);


/***/ }),

/***/ 266:
/***/ (function(module, exports) {

module.exports = "<p>Invalid username!!!</p>"

/***/ }),

/***/ 267:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(4);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthencationFailureDialog; });
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
        template: __webpack_require__(266),
    })
], AuthencationFailureDialog);

//# sourceMappingURL=dialog.component.js.map

/***/ })

},[262]);
//# sourceMappingURL=main.bundle.js.map