import { Component, Input } from '@angular/core';

@Component({
    selector: '[sqIcon]',
    templateUrl: './icon.component.html',
    standalone: false
})
export class IconComponent  {
  @Input() sqIcon:string;
}
