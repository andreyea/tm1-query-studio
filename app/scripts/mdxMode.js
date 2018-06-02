define("ace/mode/sql_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text_highlight_rules").TextHighlightRules,
        s = function () {
            var e = "ABSOLUTE|DESC|LEAVES|SELF_BEFORE_AFTER|ACTIONPARAMETERSET|DESCENDANTS|LEVEL|SESSION|ADDCALCULATEDMEMBERS|DESCRIPTION|LEVELS|SET|AFTER|DIMENSION|LINKMEMBER|SETTOARRAY|AGGREGATE|DIMENSIONS|LINREGINTERCEPT|SETTOSTR|ALL|DISTINCT|LINREGPOINT|SORT|ALLMEMBERS|DISTINCTCOUNT|LINREGR2|STDDEV|ANCESTOR|DRILLDOWNLEVEL|LINREGSLOPE|STDDEVP|ANCESTORS|DRILLDOWNLEVELBOTTOM|LINREGVARIANCE|STDEV|AND|DRILLDOWNLEVELTOP|LOOKUPCUBE|STDEVP|AS|DRILLDOWNMEMBER|MAX|STORAGE|ASC|DRILLDOWNMEMBERBOTTOM|MEASURE|STRIPCALCULATEDMEMBERS|ASCENDANTS|DRILLDOWNMEMBERTOP|MEDIAN|STRTOMEMBER|AVERAGE|DRILLUPLEVEL|MEMBER|STRTOSET|AXIS|DRILLUPMEMBER|MEMBERS|STRTOTUPLE|BASC|DROP|MEMBERTOSTR|STRTOVAL|BDESC|EMPTY|MIN|STRTOVALUE|BEFORE|END|MTD|SUBSET|BEFORE_AND_AFTER|ERROR|NAME|SUM|BOTTOMCOUNT|EXCEPT|NAMETOSET|TAIL|BOTTOMPERCENT|EXCLUDEEMPTY|NEST|THIS|BOTTOMSUM|EXTRACT|NEXTMEMBER|TOGGLEDRILLSTATE|BY|FALSE|NO_ALLOCATION|TOPCOUNT|CACHE|FILTER|NO_PROPERTIES|TOPPERCENT|CALCULATE|FIRSTCHILD|NON|TOPSUM|CALCULATION|FIRSTSIBLING|NONEMPTYCROSSJOIN|TOTALS|CALCULATIONCURRENTPASS|FOR|NOT_RELATED_TO_FACTS|TREE|CALCULATIONPASSVALUE|FREEZE|NULL|TRUE|CALCULATIONS|FROM|ON|TUPLETOSTR|CALL|GENERATE|OPENINGPERIOD|TYPE|CELL|GLOBAL|OR|UNION|CELLFORMULASETLIST|GROUP|PAGES|UNIQUE|CHAPTERS|GROUPING|PARALLELPERIOD|UNIQUENAME|CHILDREN|HEAD|PARENT|UPDATE|CLEAR|HIDDEN|PASS|USE|CLOSINGPERIOD|HIERARCHIZE|PERIODSTODATE|USE_EQUAL_ALLOCATION|COALESCEEMPTY|HIERARCHY|POST|USE_WEIGHTED_ALLOCATION|COLUMN|IGNORE|PREDICT|USE_WEIGHTED_INCREMENT|COLUMNS|IIF|PREVMEMBER|USERNAME|CORRELATION|INCLUDEEMPTY|PROPERTIES|VALIDMEASURE|COUNT|INDEX|PROPERTY|VALUE|COUSIN|INTERSECT|QTD|VAR|COVARIANCE|IS|RANK|VARIANCE|COVARIANCEN|ISANCESTOR|RECURSIVE|VARIANCEP|CREATE|ISEMPTY|RELATIVE|VARP|CREATEPROPERTYSET|ISGENERATION|ROLLUPCHILDREN|VISUAL|CREATEVIRTUALDIMENSION|ISLEAF|ROOT|VISUALTOTALS|CROSSJOIN|ISSIBLING|ROWS|WHERE|CUBE|ITEM|SCOPE|WITH|CURRENT|LAG|SECTIONS|WTD|CURRENTCUBE|LASTCHILD|SELECT|XOR|CURRENTMEMBER|LASTPERIODS|SELF|YTD|DEFAULT_MEMBER|LASTSIBLING|SELF_AND_AFTER||DEFAULTMEMBER|LEAD|SELF_AND_BEFORE|TM1FILTERBYPATTERN|TM1FILTERBYLEVEL|TM1DRILLDOWNMEMBER|TM1Member|TM1SORT|TM1SORTBYINDEX|TM1SUBSETALL|TM1SubsetToSet|TM1TupleSize|ANCESTORS",
                t = "true|false",
                n = "",
                r = "",
                i = this.createKeywordMapper({
                    "support.function": n,
                    keyword: e,
                    "constant.language": t,
                    "storage.type": r
                }, "identifier", !0);
            this.$rules = {
                start: [{
                    token: "comment",
                    regex: "#.*$"
                }, {
                    token: "comment",
                    start: "/\\*",
                    end: "\\*/"
                }, {
                    token: "string",
                    regex: '".*?"'
                }, {
                    token: "string",
                    regex: "'.*?'"
                }, {
                    token: "constant.numeric",
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: i,
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
                }, {
                    token: "paren.lparen",
                    regex: "[\\(]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\)]"
                }, {
                    token: "text",
                    regex: "\\s+"
                }]
            }, this.normalizeRules()
        };
    r.inherits(s, i), t.SqlHighlightRules = s
}), define("ace/mode/sql", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/sql_highlight_rules"], function (e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text").Mode,
        s = e("./sql_highlight_rules").SqlHighlightRules,
        o = function () {
            this.HighlightRules = s, this.$behaviour = this.$defaultBehaviour
        };
    r.inherits(o, i),
        function () {
            this.lineCommentStart = "#", this.$id = "ace/mode/sql"
        }.call(o.prototype), t.Mode = o
})

