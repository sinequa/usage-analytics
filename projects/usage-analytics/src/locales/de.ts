import {LocaleData} from "@sinequa/core/intl";
import "moment/locale/de";
import d3Format from "d3-format/locale/de-DE.json";
import d3Time from "d3-time-format/locale/de-DE.json";
import {deCore} from "@sinequa/core";
import appMessages from "./messages/de.json";
import "intl/locale-data/jsonp/de-DE"; // Safari
import "@formatjs/intl-relativetimeformat/dist/locale-data/de";
import {Utils} from "@sinequa/core/base";
import {deUtils} from "@sinequa/components/utils";
import {deAdvanced} from "@sinequa/components/advanced";
import {deFacet} from "@sinequa/components/facet";
import {deFeedback} from "@sinequa/components/feedback";
import {deNotification} from "@sinequa/components/notification";
import {deUserSettings} from "@sinequa/components/user-settings";
import { deModal } from "@sinequa/core/modal";
import { deHeatmap } from "@sinequa/analytics/heatmap";
import { deTimeline } from "@sinequa/analytics/timeline";

const messages = Utils.merge({}, deCore, deUtils, deNotification, deUserSettings, deFeedback, deFacet, deModal, deAdvanced, deHeatmap, deTimeline, appMessages);

export default <LocaleData>{
    intl: {
        locale: "de-DE"
    },
    moment: {
        locale: "de"
    },
    d3: {
        locale: "de-DE",
        format: d3Format,
        time: d3Time
    },
    messages: messages
};
