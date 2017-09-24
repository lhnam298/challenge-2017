import { Component, Input } from '@angular/core';

@Component({
  selector: 'video-frame',
  templateUrl: './html/video-frame.component.html',
  styleUrls: ['./css/video-frame.component.css']
})

export class VideoFrameComponent {

  @Input() username: string;
  @Input() status: string;
  @Input() avatar: string;

  private hideVideo: boolean;

  ngOnInit() {
    this.hideVideo = false;
  }

  hide() {
    this.hideVideo = true;
  }
}