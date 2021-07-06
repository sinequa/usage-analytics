import { Component, Input } from '@angular/core';

@Component({
  selector: '[sqIcon]',
  templateUrl: './icon.component.html',
})
export class IconComponent  {
  @Input() sqIcon:string;
}
