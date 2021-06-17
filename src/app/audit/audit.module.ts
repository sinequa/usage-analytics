import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {RouterModule, Routes} from "@angular/router";
import {GridsterModule} from "angular-gridster2";

import {IntlModule} from "@sinequa/core/intl";

import {UtilsModule} from "@sinequa/components/utils";
import {BsAdvancedModule} from "@sinequa/components/advanced";
import {BsActionModule} from "@sinequa/components/action";
import {BsFacetModule} from "@sinequa/components/facet";
import {BsPreviewModule} from "@sinequa/components/preview";

import {BsTimelineModule} from "@sinequa/analytics/timeline";
import {BsHeatmapModule} from "@sinequa/analytics/heatmap";
import {FusionChartsModule} from "@sinequa/analytics/fusioncharts";
import {NetworkModule} from "@sinequa/analytics/network";

import {AuditComponent} from "./audit.component";
import {AuditRangePickerComponent} from "./audit-range-picker/audit-range-picker.component";
import {DashboardItemComponent} from "./dashboard/dashboard-item.component";
import {WidgetPanoramaComponent} from "./widget-panorama/widget-panorama.component";
import { IconComponent } from './icon/icon.component';
import {AuditStatComponent} from "./dashboard/audit-stat/audit-stat.component";

const routes: Routes = [
  {path: '', component: AuditComponent}
]
@NgModule({

    imports: [
      CommonModule,
      ReactiveFormsModule,
      RouterModule.forChild(routes),
      
      GridsterModule,
      
      IntlModule,
      UtilsModule,
      BsTimelineModule,
      BsAdvancedModule,
      BsActionModule,
      BsFacetModule,
      BsPreviewModule,
      BsHeatmapModule,
      FusionChartsModule,
      NetworkModule
    ],
    declarations: [
      AuditComponent,
      AuditRangePickerComponent,
      DashboardItemComponent,
      WidgetPanoramaComponent,
      AuditStatComponent,
      IconComponent
    ],
    exports: []
})
export class AuditModule {
}
