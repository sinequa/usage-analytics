import {LocaleData} from "@sinequa/core/intl";
import {enCore} from "@sinequa/core";
import appMessages from "./messages/en.json";
import "intl/locale-data/jsonp/en-US"; // Safari
import {Utils} from "@sinequa/core/base";
import {enNotification} from "@sinequa/components/notification";
import {enUserSettings} from "@sinequa/components/user-settings"
import { enFeedback } from "@sinequa/components/feedback";
import { enFacet } from "@sinequa/components/facet";
import { enModal } from "@sinequa/core/modal";
import { enAdvanced } from "@sinequa/components/advanced";
import { enUtils } from "@sinequa/components/utils";
import { enTimeline } from "@sinequa/analytics/timeline";
import { enFilters } from "@sinequa/components/filters";
import { enHeatmap } from "@sinequa/analytics/heatmap";
import * as format from "node_modules/d3-format/locale/en-US.json";
import * as time from "node_modules/d3-time-format/locale/en-US.json";

const messages = Utils.merge({}, enCore, enUtils, enNotification, enUserSettings, enFeedback, enFacet, enModal, enAdvanced, enTimeline, enFilters, enHeatmap, appMessages);

export default <LocaleData>{
    intl: {
        locale: "en-US"
    },
    d3: {
        locale: "en-US",
        format,
        time
    },
    messages: messages
};
