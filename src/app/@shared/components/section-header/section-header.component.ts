import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: false,
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.css']
})
export class SectionHeaderComponent implements OnInit {

  @Input() logoClass!:string;
  @Input() sectionName!:string;
  @Input() nameColor!:string;
  @Input() nameSize!:string;
  constructor() { }

  ngOnInit(): void {
  }

}
