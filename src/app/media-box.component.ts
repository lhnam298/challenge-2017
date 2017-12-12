import { Component, Input, OnInit, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'media-box',
  templateUrl: './html/media-box.component.html',
  styleUrls: ['./css/media-box.component.css']
})

export class MediaBoxComponent implements OnInit {

    @Input() myProfile: any;
    @Input() peers: Array<any>;
    private width: number = 0;

    constructor() {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
      this.setVideoBoxWidth();
    }

    ngAfterViewChecked() {
//      this.setVideoBoxWidth();
    }

    setVideoBoxWidth = () => {
        this.width = (this.peers.length + 1) * 190;
    }
}