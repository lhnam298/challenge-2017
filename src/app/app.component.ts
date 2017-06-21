import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './html/app.component.html',
  styleUrls: ['./css/app.component.css']
})

export class AppComponent {
    constraints = {
        audio: false,
        video: true
    };

    ngOnInit(): void {
        this.getMedia();
    }

    getMedia = function() {
        navigator.mediaDevices.getUserMedia(this.constraints).then(this.gotUserMedia).catch(this.didntGetUserMedia);
    }

    gotUserMedia = function(stream) {
        var video = document.querySelector('video');
        video.srcObject = stream;
        video.onloadedmetadata = function(e) {
            video.play();
        };
    }

    didntGetUserMedia = function(err) {
        console.log(err.name + ": " + err.message);
    }

}
