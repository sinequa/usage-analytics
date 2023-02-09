import {LocaleData} from "@sinequa/core/intl";
import "moment/locale/fr";
import d3Format from "d3-format/locale/fr-FR.json";
import d3Time from "d3-time-format/locale/fr-FR.json";
import {frCore} from "@sinequa/core";
import appMessages from "./messages/fr.json";
import "intl/locale-data/jsonp/fr-FR"; // Safari
import "@formatjs/intl-relativetimeformat/dist/locale-data/fr";
import {Utils} from "@sinequa/core/base";
import {frUtils} from "@sinequa/components/utils";
import {frAdvanced} from "@sinequa/components/advanced";
import {frFacet} from "@sinequa/components/facet";
import {frFeedback} from "@sinequa/components/feedback";
import {frNotification} from "@sinequa/components/notification";
import {frUserSettings} from "@sinequa/components/user-settings";
import { frModal } from "@sinequa/core/modal";
import { frHeatmap } from "@sinequa/analytics/heatmap";
import { frTimeline } from "@sinequa/analytics/timeline";
import { frFilters } from "@sinequa/components/filters";

d3Format.thousands = " "; // consistency with intl-number-format

const messages = Utils.merge({}, frCore, frUtils, frNotification, frUserSettings, frFeedback, frFacet, frModal, frAdvanced, frHeatmap, frTimeline, frFilters, appMessages);

export default <LocaleData>{
    intl: {
        locale: "fr-FR"
    },
    moment: {
        locale: "fr"
    },
    d3: {
        locale: "fr-FR",
        format: d3Format,
        time: d3Time
    },
    messages: messages
};
