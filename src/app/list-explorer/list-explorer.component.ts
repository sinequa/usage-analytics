import { Component, Input } from '@angular/core';

@Component({
    selector: 'sq-list-explorer',
    templateUrl: './list-explorer.component.html',
    styles: [`
a {
    text-decoration: none;
}    
`]
})
export class ListExplorerComponent {
    @Input() data?: any;
    @Input() titleField: string;
    @Input() name = "";
    @Input() pretty = true;

    size: number;
    
    expanded?: any;

    ngOnChanges(){
        this.expanded = undefined;
        if(this.data) {
            this.size = new TextEncoder().encode(JSON.stringify(this.data)).length;
        }
    }

    onClick(element: any) {
        this.expanded = this.expanded === element? undefined : element;
        return false;
    }
}