import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Utils } from '@sinequa/core/base';
import { SesameService } from '../sesame.service';

@Component({
    selector: 'sq-explorer',
    templateUrl: './explorer.component.html',
    styleUrls: ['./explorer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerComponent implements OnChanges {
    @Input() data?: any;
    @Input() name = "";
    @Input() pretty = true;

    size: number;

    expanded = new Set<string>();

    constructor(
        public sesameService: SesameService
    ){
    }

    ngOnChanges() {
        if(this.data) {
            this.size = new TextEncoder().encode(JSON.stringify(this.data)).length;
        }
    }

    toggleExpanded(path: string) {
        if(this.isExpanded(path)) {
            this.expanded.delete(path);
        }
        else {
            this.expanded.add(path);
        }
        return false;
    }

    isExpanded(path: string) {
        return this.expanded.has(path);
    }

    setPretty(pretty: boolean) {
        this.pretty = pretty;
        return false;
    }

    keyClicked(path: string) {
        this.sesameService.copyToClipboard(path);
    }

    valueClicked(data) {
        data = data+"";
        this.sesameService.copyToClipboard(data);
    }

    nChildren(object) {
        return Object.keys(object).length;
    }

    isObject(data) {
        return Utils.isObject(data);
    }

    isArray(data) {
        return Utils.isArray(data);
    }

    isString(data) {
        return Utils.isString(data);
    }

    isNumber(data) {
        return Utils.isNumber(data);
    }

    isBoolean(data) {
        return Utils.isBoolean(data);
    }

    isNull(data) {
        return data === null;
    }

    isUndefined(data) {
        return data === undefined;
    }

    isOther(data) {
        return !this.isObject(data) && !this.isArray(data) && !this.isString(data) && !this.isNumber(data) && !this.isNumber(data) && !this.isBoolean(data) && !this.isNull(data) && !this.isUndefined(data);
    }
}