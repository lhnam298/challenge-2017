import { Component, Input } from '@angular/core';

@Component({
  selector: 'video-frame',
  templateUrl: './html/video-frame.component.html',
  styleUrls: ['./css/video-frame.component.css']
})

export class VideoFrameComponent {

  @Input() username: string;
  @Input() status: string;

  hide_video;

  ngOnInit() {
    this.hide_video = false;
  }

  hideVideo() {
    this.hide_video = true;
  }
}