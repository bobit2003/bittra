var tradingSessionsObject = {
    cx: 250,
    cy: 250,
    answer: null,
    americanTowns: [],
    europeanTowns: [],
    asianTowns: [],
    pacificTowns: [],
    timer: null,
    minute: null,
    countTown: null,
    radius: 240,
    arrowsRadius: null,
    townArray: [],
    townWithUTCTimeArray: {},
    elementInSector: null,
    elementHasManySectors: false,
    hasManySectors: false,
    minCircleRadius: 3,
    isGetOpenSessions: [],
    isGetCloseSessions: [],
    marketActivitySectors: ["13:00", "17:00", "19:00", "21:00", "24:00", "2:00", "7:00", "11:00"],
    toOpen: 'to open',
    toClose: 'to close',
    americanSessionRect: null,
    europeanSessionRect: null,
    asianSessionRect: null,
    oceanSessionRect: null,
    helpLine: null,
    oceanLastSessionRect: null,
    holidays: ['25.12', '01.01'],
    openSessionsArr: {},

    funcInit: function (to_open, to_close, text) {
        var marginTopForMapObjects = parseFloat(getComputedStyle(document.getElementsByClassName('page__header')[0]).height);
        var marginLeftForMapObjects = parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).width) + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft);
        var mapHeight = parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).height);
        var mapWidthScale = (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).width) + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft)) / 809;
        var mapHeightScale = mapHeight / 500;
        if(mapHeightScale < 0.5) {
          var mapHeightScale = 0.5;
        }

        this.line = document.getElementsByClassName('block-trading-sessions__line')[0];
        this.helpLine = document.getElementsByClassName('block-trading-sessions__help-line')[0];
        //document.getElementsByClassName('block-trading-sessions__line').style.height = mapHeight + 'px';
        document.getElementsByClassName('block-trading-sessions__line')[0].style.marginTop = marginTopForMapObjects + 'px';
        this.helpLine.style.marginTop = marginTopForMapObjects + 'px';
        this.helpLine.style.height = mapHeight + 'px';
        this.line.style.height = mapHeight + 'px';
        document.getElementsByClassName('block-trading-sessions__utc')[0].style.marginTop = (marginTopForMapObjects + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).height) - 1.5 * parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__utc')[0]).height)) + 'px';
        document.getElementsByClassName('block-trading-sessions__utc')[0].style.marginLeft = (marginLeftForMapObjects - parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__utc')[0]).width)) + 'px';
        document.getElementsByClassName('block-trading-sessions__utc_ar')[0].style.marginRight = (marginLeftForMapObjects - parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__utc')[0]).width)) + 'px';
        document.getElementsByClassName('block-trading-sessions__sessions_american')[0].style.marginTop = ((3 * (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__sessions_american')[0]).height))) + marginTopForMapObjects) * mapHeightScale + 'px';
        document.getElementsByClassName('block-trading-sessions__sessions_european')[0].style.marginTop = ((6 * (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__sessions_european')[0]).height))) + marginTopForMapObjects) * mapHeightScale + 'px';
        document.getElementsByClassName('block-trading-sessions__sessions_asian')[0].style.marginTop = ((9 * (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__sessions_asian')[0]).height))) + marginTopForMapObjects) * mapHeightScale + 'px';
        document.getElementsByClassName('block-trading-sessions__sessions_ocean')[0].style.marginTop = ((12 * (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__sessions_ocean')[0]).height))) + marginTopForMapObjects) * mapHeightScale + 'px';
        document.getElementsByClassName('block-trading-sessions__sessions_ocean_last')[0].style.marginTop = ((12 * (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__sessions_ocean')[0]).height))) + marginTopForMapObjects) * mapHeightScale + 'px';

        this.americanSessionRect = document.getElementsByClassName('block-trading-sessions__sessions_american')[0];
        this.europeanSessionRect = document.getElementsByClassName('block-trading-sessions__sessions_european')[0];
        this.asianSessionRect = document.getElementsByClassName('block-trading-sessions__sessions_asian')[0];
        this.oceanSessionRect = document.getElementsByClassName('block-trading-sessions__sessions_ocean')[0];
        this.oceanLastSessionRect = document.getElementsByClassName('block-trading-sessions__sessions_ocean_last')[0];


        if (typeof to_open !== 'undefined') {
            tradingSessionsObject.toOpen = to_open;
        }

        if (typeof to_close !== 'undefined') {
            tradingSessionsObject.toClose = to_close;
        }

        //ajax('/ajax/get-trader-session', this.funcCallback.bind(this), {});
        this.funcCallback(JSON.stringify(text));
    },
    funcCallback: function (responseText) {
        this.answer = JSON.parse(responseText);
        for (var key in this.answer) {
            if (key === 'american') {
                for (var americanCity in this.answer[key]) {
                    this.americanTowns.push(this.answer[key][americanCity].city);
                    this.countTown++;
                }
            }
            if (key === 'european') {
                for (var europeanCity in this.answer[key]) {
                    this.europeanTowns.push(this.answer[key][europeanCity].city);
                    this.countTown++;
                }
            }
            if (key === 'asian') {
                for (var asianCity in this.answer[key]) {
                    this.asianTowns.push(this.answer[key][asianCity].city);
                    this.countTown++;
                }
            }
            if (key === 'pacific') {
                for (var pacificCity in this.answer[key]) {
                    this.pacificTowns.push(this.answer[key][pacificCity].city);
                    this.countTown++;
                }
            }
        }

        var element = document.querySelector('.main_block-trading-sessions');
        var americanSession = element.getElementsByClassName('block-trading-sessions__sessions_american')[0];
        var europeanSession = element.getElementsByClassName('block-trading-sessions__sessions_european')[0];
        var asianSession = element.getElementsByClassName('block-trading-sessions__sessions_asian')[0];
        var oceanSession = element.getElementsByClassName('block-trading-sessions__sessions_ocean')[0];
        var americanSession_ar = element.getElementsByClassName('block-trading-sessions__sessions_american_ar')[0];
        var europeanSession_ar = element.getElementsByClassName('block-trading-sessions__sessions_european_ar')[0];
        var asianSession_ar = element.getElementsByClassName('block-trading-sessions__sessions_asian_ar')[0];
        var oceanSession_ar = element.getElementsByClassName('block-trading-sessions__sessions_ocean_ar')[0];
        var oceanSessionLast = element.getElementsByClassName('block-trading-sessions__sessions_ocean_last')[0];
        var mapPadding = parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft);
        var mapWidthScale = (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).width) + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft)) / 809;

        var rectanglesArray = {};
        for (var j = 0; j < Object.keys(this.answer).length; j++) {
            var tmpStartHour = new Date().setHours(this.answer[Object.keys(this.answer)[j]][0]['start'].split(':')[0], this.answer[Object.keys(this.answer)[j]][0]['start'].split(':')[1], 0);
            var tmpEndHour = new Date().setHours(this.answer[Object.keys(this.answer)[j]][0]['end'].split(':')[0], this.answer[Object.keys(this.answer)[j]][0]['end'].split(':')[1], 0);

            var tmpUTCStartHour = (this.answer[Object.keys(this.answer)[j]][0]['utc'] < 0) ? new Date(new Date(tmpStartHour).getTime() + Math.abs(this.answer[Object.keys(this.answer)[j]][0]['utc']) * 60 * 60 * 1000) : new Date(new Date(tmpStartHour).getTime() - Math.abs(this.answer[Object.keys(this.answer)[j]][0]['utc']) * 60 * 60 * 1000);
            var tmpUTCEndHour = (this.answer[Object.keys(this.answer)[j]][0]['utc'] < 0) ? new Date(new Date(tmpEndHour).getTime() + Math.abs(this.answer[Object.keys(this.answer)[j]][0]['utc']) * 60 * 60 * 1000) : new Date(new Date(tmpEndHour).getTime() - Math.abs(this.answer[Object.keys(this.answer)[j]][0]['utc']) * 60 * 60 * 1000);

            for (var i = 0; i < this.answer[Object.keys(this.answer)[j]].length; i++) {
                var tmpTownHour = new Date().setHours(this.answer[Object.keys(this.answer)[j]][i]['start'].split(':')[0], this.answer[Object.keys(this.answer)[j]][i]['start'].split(':')[1], 0);
                var tmpUTCTownHour = (this.answer[Object.keys(this.answer)[j]][i]['utc'] < 0) ? new Date(new Date(tmpTownHour).getTime() + Math.abs(this.answer[Object.keys(this.answer)[j]][i]['utc']) * 60 * 60 * 1000) : new Date(new Date(tmpTownHour).getTime() - Math.abs(this.answer[Object.keys(this.answer)[j]][i]['utc']) * 60 * 60 * 1000);
                var tmpTownHourEnd = new Date().setHours(this.answer[Object.keys(this.answer)[j]][i]['end'].split(':')[0], this.answer[Object.keys(this.answer)[j]][i]['end'].split(':')[1], 0);
                var tmpUTCTownHourEnd = (this.answer[Object.keys(this.answer)[j]][i]['utc'] < 0) ? new Date(new Date(tmpTownHourEnd).getTime() + Math.abs(this.answer[Object.keys(this.answer)[j]][i]['utc']) * 60 * 60 * 1000) : new Date(new Date(tmpTownHourEnd).getTime() - Math.abs(this.answer[Object.keys(this.answer)[j]][i]['utc']) * 60 * 60 * 1000);
                tradingSessionsObject.townWithUTCTimeArray[this.answer[Object.keys(this.answer)[j]][i]['city']] = [tmpUTCTownHour, tmpUTCTownHourEnd];
                if (tmpUTCTownHour < tmpUTCStartHour) {
                    tmpUTCStartHour = tmpUTCTownHour;
                }
                if (tmpUTCTownHourEnd > tmpUTCEndHour) {
                    tmpUTCEndHour = tmpUTCTownHourEnd;
                }
            }

            if (tmpUTCStartHour.getDate() === tmpUTCEndHour.getDate()) {
                rectanglesArray[Object.keys(this.answer)[j]] = [tmpUTCStartHour.getHours() + ':' + tmpUTCStartHour.getMinutes(), tmpUTCEndHour.getHours() + ':' + tmpUTCEndHour.getMinutes()];
            } else {
                rectanglesArray[Object.keys(this.answer)[j]] = ['0:0', tmpUTCEndHour.getHours() + ':' + tmpUTCEndHour.getMinutes(), '24:0', tmpUTCStartHour.getHours() + ':' + tmpUTCStartHour.getMinutes()];
            }
        }

        americanSession.style.marginLeft = (((((24 - parseInt(rectanglesArray['american'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['american'][1].split(':')[1] * 0.5)) * mapWidthScale + mapPadding) + 'px';
        europeanSession.style.marginLeft = (((((24 - parseInt(rectanglesArray['european'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['european'][1].split(':')[1] * 0.5)) * mapWidthScale + mapPadding) + 'px';
        asianSession.style.marginLeft = (((((24 - parseInt(rectanglesArray['asian'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['asian'][1].split(':')[1] * 0.5)) + mapPadding) * mapWidthScale + 'px';
        oceanSession.style.marginLeft = (((((24 - parseInt(rectanglesArray['pacific'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['pacific'][1].split(':')[1] * 0.5)) * mapWidthScale + mapPadding) + 'px';
        americanSession_ar.style.marginRight = (((((24 - parseInt(rectanglesArray['american'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['american'][1].split(':')[1] * 0.5)) * mapWidthScale + mapPadding) + 'px';
        europeanSession_ar.style.marginRight = (((((24 - parseInt(rectanglesArray['european'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['european'][1].split(':')[1] * 0.5)) * mapWidthScale + mapPadding) + 'px';
        asianSession_ar.style.marginRight = (((((24 - parseInt(rectanglesArray['asian'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['asian'][1].split(':')[1] * 0.5)) + mapPadding) * mapWidthScale + 'px';
        oceanSession_ar.style.marginRight = (((((24 - parseInt(rectanglesArray['pacific'][1].split(':')[0])) * 33) - 3) - (rectanglesArray['pacific'][1].split(':')[1] * 0.5)) * mapWidthScale + mapPadding) + 'px';
        oceanSessionLast.style.marginLeft = mapPadding + 'px';

        americanSession.style.width = Math.floor(
            Math.abs(
                ((parseInt(rectanglesArray['american'][1].split(':')[0]) - parseInt(rectanglesArray['american'][0].split(':')[0])) * 33) + 3
            ) + Math.abs(
            (parseInt(rectanglesArray['american'][1].split(':')[1]) - parseInt(rectanglesArray['american'][0].split(':')[1])) * 0.5
            )
        ) * mapWidthScale + 'px';
        europeanSession.style.width = Math.floor(
            Math.abs(
                ((parseInt(rectanglesArray['european'][1].split(':')[0]) - parseInt(rectanglesArray['european'][0].split(':')[0])) * 33) + 3
            ) + Math.abs(
            (parseInt(rectanglesArray['european'][1].split(':')[1]) - parseInt(rectanglesArray['european'][0].split(':')[1])) * 0.5
            )
        ) * mapWidthScale + 'px';
        asianSession.style.width = Math.floor(
            Math.abs(
                ((parseInt(rectanglesArray['asian'][1].split(':')[0]) - parseInt(rectanglesArray['asian'][0].split(':')[0])) * 33) + 3
            ) + Math.abs(
            (parseInt(rectanglesArray['asian'][1].split(':')[1]) - parseInt(rectanglesArray['asian'][0].split(':')[1])) * 0.5
            )
        ) * mapWidthScale + 'px';
        oceanSession.style.width = Math.floor(
            Math.abs(
                ((parseInt(rectanglesArray['pacific'][1].split(':')[0]) - parseInt(rectanglesArray['pacific'][0].split(':')[0])) * 33) + 3
            ) + Math.abs(
            (parseInt(rectanglesArray['pacific'][1].split(':')[1]) - parseInt(rectanglesArray['pacific'][0].split(':')[1])) * 0.5
            )
        ) * mapWidthScale + 'px';
        oceanSessionLast.style.width = Math.floor(
            Math.abs(
                ((parseInt(rectanglesArray['pacific'][3].split(':')[0]) - parseInt(rectanglesArray['pacific'][2].split(':')[0])) * 33) + 3
            ) + Math.abs(
            (parseInt(rectanglesArray['pacific'][3].split(':')[1]) - parseInt(rectanglesArray['pacific'][2].split(':')[1])) * 0.5
            )
        ) * mapWidthScale + 'px';

        tradingSessionsObject.openSessionsArr = rectanglesArray;

        this.timer = setInterval(this.funcTickSecond.bind(this), 1000);
    },
    funcTickSecond: function () {
        var elements = document.getElementsByClassName('block-trading-sessions__name');
        if (!elements.length) {
            clearInterval(tradingSessionsObject.timer);
            return false;
        }
        var currentUTCTime = new Date(((((new Date()).getTime()) / 1000)) * 1000);
        var currentMinute = currentUTCTime.getMinutes();

        if (this.minute === currentMinute) return false;

        this.minute = currentMinute;

        for (var i = 0, size = elements[0].children.length; i < size; i++) {
            tradingSessionsObject.funcTickUpdateHeader(elements[0].children[i]);
        }
    },
    funcTickUpdateHeader: function (element) {
        var i;

        let leftSecondToOpen = null;
        let leftSecondToClose = 0;
        let schedules = this.answer[element.dataset.session];
        let isOpen = false;
        let isHoliday = false;
        console.log(element);

        var elementHeaderSpan = element.lastElementChild.getElementsByTagName('span')[0];

        this.isGetOpenSessions = [];
        this.isGetCloseSessions = [];

        for (i = 0; i < schedules.length; i++) {
            let schedule = schedules[i];
            let date = new Date(((((new Date()).getTime()) / 1000) + schedule.utc * 60 * 60) * 1000);
            let hours = date.getUTCHours();
            let minutes = date.getUTCMinutes();
            let second = date.getUTCSeconds();
            let numberOfDay = date.getUTCDay();

            let start = schedule.start.split(':');
            let end = schedule.end.split(':');
            let startSecond = parseInt(start[0]) * 60 * 60 + parseInt(start[1]) * 60;
            let endSecond = parseInt(end[0]) * 60 * 60 + parseInt(end[1]) * 60;

            let currentSeconds = hours * 60 * 60 + minutes * 60 + second;

            if (tradingSessionsObject.funcCheckTodayIsHoliday() === false) {
                if (startSecond < currentSeconds && currentSeconds < endSecond && numberOfDay !== 0 && numberOfDay !== 6) {
                    leftSecondToClose = Math.max(endSecond - currentSeconds, leftSecondToClose);
                    isOpen = true;
                } else {
                    let leftSecond = 0;

                    if (numberOfDay !== 0 && numberOfDay !== 6) {
                        if (currentSeconds < startSecond) {
                            leftSecond = startSecond - currentSeconds;
                        } else {
                            leftSecond = 86400 - currentSeconds + startSecond;
                            if (numberOfDay === 5) leftSecond += 172800;
                        }
                    } else {
                        leftSecond = 86400 - currentSeconds + startSecond;
                        if (numberOfDay === 6) leftSecond += 86400;
                    }

                    if (leftSecondToOpen === null) {
                        leftSecondToOpen = leftSecond;
                    } else {
                        leftSecondToOpen = Math.min(leftSecond, leftSecondToOpen);
                    }
                }
            } else {

                var dateNow = new Date();
                var today = dateNow.getUTCDay();
                var utcSeconds = dateNow.getUTCHours() * 60 * 60 + dateNow.getUTCMinutes() * 60;
                var startOpenSession = tradingSessionsObject.openSessionsArr[element.dataset.session][0].split(':');
                var stSec = null;
                if (element.dataset.session !== 'pacific')
                    stSec = parseInt(startOpenSession[0]) * 60 * 60 + parseInt(startOpenSession[1]) * 60;
                else
                    stSec = (parseInt(startOpenSession[0]) - (24 - parseInt(tradingSessionsObject.openSessionsArr[element.dataset.session][3].split(':')[0]))) * 60 * 60 + parseInt(startOpenSession[1]) * 60;


                isHoliday = true;

                if (today !== 0 && today !== 6) {
                    if (today === 5) leftSecondToClose = (259200 + stSec) - utcSeconds;
                    if (today === 1 || today === 2 || today === 3 || today === 4) leftSecondToClose = (86400 + stSec) - utcSeconds;
                } else {
                    if (today === 6) {
                        leftSecondToClose = (172800 + stSec) - utcSeconds;
                    } else {
                        leftSecondToClose = (86400 + stSec) - utcSeconds;
                    }
                }
            }
        }
        if (isOpen) {
            elementHeaderSpan.parentElement.parentElement.classList.add('widget-trader-session__active');
            elementHeaderSpan.innerHTML = tradingSessionsObject.toClose + ' ' + this.funcGetLeftTime(leftSecondToClose);

            if (element.dataset.session === 'american') {
                this.isGetOpenSessions = this.isGetOpenSessions.concat(this.americanTowns);
                document.getElementsByClassName('block-trading-sessions__city-time')[1].getElementsByClassName('block-trading-sessions__city')[2].classList.add('widget-trader-session__active');
                this.americanSessionRect.style.background = "#c57f7f";
            }
            if (element.dataset.session === 'pacific') {
                this.isGetOpenSessions = this.isGetOpenSessions.concat(this.pacificTowns);
                document.getElementsByClassName('block-trading-sessions__city-time')[0].getElementsByClassName('block-trading-sessions__city')[0].classList.add('widget-trader-session__active');
                document.getElementsByClassName('block-trading-sessions__city-time')[0].getElementsByClassName('block-trading-sessions__city')[2].classList.add('widget-trader-session__active');
                this.oceanSessionRect.style.background = "#0078ff";
                this.oceanLastSessionRect.style.background = "#0078ff";
            }
            if (element.dataset.session === 'asian') {
                this.isGetOpenSessions = this.isGetOpenSessions.concat(this.asianTowns);
                document.getElementsByClassName('block-trading-sessions__city-time')[0].getElementsByClassName('block-trading-sessions__city')[1].classList.add('widget-trader-session__active');
                this.asianSessionRect.style.background = "#9064aa";
            }
            if (element.dataset.session === 'european') {
                this.isGetOpenSessions = this.isGetOpenSessions.concat(this.europeanTowns);
                document.getElementsByClassName('block-trading-sessions__city-time')[1].getElementsByClassName('block-trading-sessions__city')[0].classList.add('widget-trader-session__active');
                document.getElementsByClassName('block-trading-sessions__city-time')[1].getElementsByClassName('block-trading-sessions__city')[1].classList.add('widget-trader-session__active');
                this.europeanSessionRect.style.background = "#2cb363";
            }
        } else {
            if (isHoliday === false) {
                elementHeaderSpan.parentElement.parentElement.classList.remove('widget-trader-session__active');
                elementHeaderSpan.innerHTML = tradingSessionsObject.toOpen + ' ' + this.funcGetLeftTime(leftSecondToOpen);
            } else {
                elementHeaderSpan.parentElement.parentElement.classList.remove('widget-trader-session__active');
                elementHeaderSpan.innerHTML = tradingSessionsObject.toOpen + ' ' + this.funcGetLeftTime(leftSecondToClose);
            }
            if (element.dataset.session === 'american') {
                this.isGetCloseSessions = this.isGetCloseSessions.concat(this.americanTowns);
                this.americanSessionRect.style.background = "#9e9e9e";
            }
            if (element.dataset.session === 'pacific') {
                this.isGetCloseSessions = this.isGetCloseSessions.concat(this.pacificTowns);
                this.oceanSessionRect.style.background = "#9e9e9e";
                this.oceanLastSessionRect.style.background = "#9e9e9e";
            }
            if (element.dataset.session === 'asian') {
                this.isGetCloseSessions = this.isGetCloseSessions.concat(this.asianTowns);
                this.asianSessionRect.style.background = "#9e9e9e";
            }
            if (element.dataset.session === 'european') {
                this.isGetCloseSessions = this.isGetCloseSessions.concat(this.europeanTowns);
                this.europeanSessionRect.style.background = "#9e9e9e";
            }
        }

        var line = document.getElementsByClassName('block-trading-sessions__line')[0];
        var line_ar = document.getElementsByClassName('block-trading-sessions__line_ar')[0];
        var helpLine_ar = document.getElementsByClassName('block-trading-sessions__help-line_ar')[0];

        var mapWidthScale = (parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).width) + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft)) / 809;

        var currentUTCTime = new Date(((((new Date()).getTime()) / 1000)) * 1000);
        line.style.marginLeft = ((((((24 - currentUTCTime.getUTCHours()) * 33) - 3) - (currentUTCTime.getUTCMinutes()) * 0.5) + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft))) * mapWidthScale + 'px';
        line_ar.style.marginRight = ((((((24 - currentUTCTime.getUTCHours()) * 33) - 3) - (currentUTCTime.getUTCMinutes()) * 0.5) + parseFloat(getComputedStyle(document.getElementsByClassName('block-trading-sessions__map')[0]).paddingLeft))) * mapWidthScale + 'px';
        this.helpLine.style.marginLeft = (parseFloat(getComputedStyle(line).marginLeft) - 5) + 'px';
        helpLine_ar.style.marginRight = (parseFloat(getComputedStyle(line).marginLeft) - 8) + 'px';

        var wellingtonTime = new Date(((((new Date()).getTime()) / 1000) + this.answer['pacific'][1].utc * 60 * 60) * 1000);
        var tokioTime = new Date(((((new Date()).getTime()) / 1000) + this.answer['asian'][0].utc * 60 * 60) * 1000);
        var sydneyTime = new Date(((((new Date()).getTime()) / 1000) + this.answer['pacific'][0].utc * 60 * 60) * 1000);

        var frankfurtTime = new Date(((((new Date()).getTime()) / 1000) + this.answer['european'][1].utc * 60 * 60) * 1000);
        var londonTime = new Date(((((new Date()).getTime()) / 1000) + this.answer['european'][0].utc * 60 * 60) * 1000);
        var chicagoTime = new Date(((((new Date()).getTime()) / 1000) + this.answer['american'][0].utc * 60 * 60) * 1000);

        var wellington = document.getElementsByClassName('block-trading-sessions__city')[0];
        var tokio = document.getElementsByClassName('block-trading-sessions__city')[1];
        var sydney = document.getElementsByClassName('block-trading-sessions__city')[2];

        var frankfurt = document.getElementsByClassName('block-trading-sessions__city')[3];
        var london = document.getElementsByClassName('block-trading-sessions__city')[4];
        var chicago = document.getElementsByClassName('block-trading-sessions__city')[5];

        wellington.lastElementChild.innerHTML = ("0" + wellingtonTime.getUTCHours()).slice(-2) + ':' + ("0" + wellingtonTime.getUTCMinutes()).slice(-2);
        tokio.lastElementChild.innerHTML = ("0" + tokioTime.getUTCHours()).slice(-2) + ':' + ("0" + tokioTime.getUTCMinutes()).slice(-2);
        sydney.lastElementChild.innerHTML = ("0" + sydneyTime.getUTCHours()).slice(-2) + ':' + ("0" + sydneyTime.getUTCMinutes()).slice(-2);
        frankfurt.lastElementChild.innerHTML = ("0" + frankfurtTime.getUTCHours()).slice(-2) + ':' + ("0" + frankfurtTime.getUTCMinutes()).slice(-2);
        london.lastElementChild.innerHTML = ("0" + londonTime.getUTCHours()).slice(-2) + ':' + ("0" + londonTime.getUTCMinutes()).slice(-2);
        chicago.lastElementChild.innerHTML = ("0" + chicagoTime.getUTCHours()).slice(-2) + ':' + ("0" + chicagoTime.getUTCMinutes()).slice(-2);

        return [this.isGetOpenSessions, this.isGetCloseSessions];
    },
    funcCheckTodayIsHoliday: function () {
        var today = new Date();
        var numOfDay = (today.getUTCDate() < 9) ? '0' + today.getUTCDate() : today.getUTCDate();
        var numOfMonth = (today.getUTCMonth() < 9) ? '0' + (today.getUTCMonth() + 1) : today.getUTCMonth() + 1;
        for (var i = 0; i < tradingSessionsObject.holidays.length; i++) {
            var arr = tradingSessionsObject.holidays[i].split('.');
            if (parseInt(numOfDay) === parseInt(arr[0]) && parseInt(numOfMonth) === parseInt(arr[1])) return true;
        }

        return false;
    },
    funcGetLeftTime: function (seconds) {
        var hours, minutes;
        hours = Math.floor(seconds / 60 / 60);
        minutes = Math.floor(seconds / 60) - hours * 60;
        return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
    }
};
