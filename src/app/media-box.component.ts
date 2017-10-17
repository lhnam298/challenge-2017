import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'media-box',
  templateUrl: './html/media-box.component.html',
  styleUrls: ['./css/media-box.component.css']
})

export class MediaBoxComponent implements OnInit {

    @Input() myProfile: any;
    @Input() peers: Array<any>;

    constructor() {

    }

    ngOnInit() {

    }

    overWidthSize() {
      
      return false;
    }

}