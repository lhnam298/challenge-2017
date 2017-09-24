import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'media-area',
  templateUrl: './html/media-area.component.html',
  styleUrls: ['./css/media-area.component.css']
})

export class MediaAreaComponent implements OnInit {

    @Input() myProfile: any;
    @Input() peers: Array<any>;

    constructor() {

    }

    ngOnInit() {

    }
}