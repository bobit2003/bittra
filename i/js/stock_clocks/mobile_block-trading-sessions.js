let tradingSessions = {
    widthLine: 80,
    radius: 400,
    schedule: null,
    timer: null,
    tToClose: "tToClose",
    tToOpen: "tToOpen",
    funcInit: function() {
        let e = this.widthLine
          , t = this.radius
          , s = t + e / 2
          , n = t - e / 2
          , i = document.getElementsByClassName("mobile-block-trading-sessions");
        for (let r = 0, a = i.length; r < a; r++) {
            let a = i[r]
              , l = this.schedule[a.dataset.session]
              , o = a.getElementsByClassName("block-trading-sessions__item")
              , c = a.getElementsByClassName("block-trading-sessions__header")[0].getElementsByTagName("span")[0]
              , d = null
              , f = 0;
            for (let e = 0, t = l.length; e < t; e++) {
                let t = l[e]
                  , s = new Date(1e3 * ((new Date).getTime() / 1e3 + 60 * t.utc * 60))
                  , n = s.getUTCHours()
                  , i = s.getUTCMinutes()
                  , r = s.getUTCSeconds()
                  , a = s.getUTCDay()
                  , o = t.start.split(":")
                  , c = t.end.split(":")
                  , u = 60 * parseInt(o[0]) * 60 + 60 * parseInt(o[1])
                  , h = 60 * parseInt(c[0]) * 60 + 60 * parseInt(c[1])
                  , g = 60 * n * 60 + 60 * i + r;
                if (u < g && g < h && 0 !== a && 6 !== a)
                    f = Math.max(h - g, f);
                else {
                    let e = 0;
                    0 !== a && 6 !== a ? g < u ? e = u - g : (e = 86400 - g + u,
                    5 === a && (e += 172800)) : (e = 86400 - g + u,
                    6 === a && (e += 86400)),
                    d = null === d ? e : Math.min(e, d)
                }
            }
            let u = !1;
            for (let i = 0, a = l.length; i < a; i++) {
                let a = l[i]
                  , c = new Date(1e3 * ((new Date).getTime() / 1e3 + 60 * a.utc * 60))
                  , d = c.getUTCHours()
                  , f = c.getUTCMinutes()
                  , h = c.getUTCSeconds()
                  , g = c.getUTCDay()
                  , p = a.start.split(":")
                  , m = a.end.split(":")
                  , T = 60 * parseInt(p[0]) * 60 + 60 * parseInt(p[1])
                  , _ = 60 * parseInt(m[0]) * 60 + 60 * parseInt(m[1])
                  , C = 3.6
                  , v = 864
                  , y = C * (T / v)
                  , x = C * (_ / v)
                  , w = 60 * d * 60 + 60 * f + h
                  , k = C * (w / 864)
                  , b = this.funcPolarToCartesian(500, 500, t, k)
                  , L = C * ((60 * f + h) / 36)
                  , M = this.funcPolarToCartesian(500, 500, t, L)
                  , I = C * (h / .6)
                  , B = this.funcPolarToCartesian(500, 500, t, I)
                  , G = !1
                  , O = !0;
                if (T < w && w < _ && 0 !== g && 6 !== g)
                    u = !0,
                    G = !0,
                    O = !1;
                else {
                    let e = 0;
                    0 !== g && 6 !== g ? w < T ? e = T - w : (e = 86400 - w + T,
                    5 === g && (e += 172800)) : (e = 86400 - w + T,
                    6 === g && (e += 86400)),
                    e < 86400 && (G = !0)
                }
                let U = this.funcPolarToCartesian(500, 500, n, y)
                  , D = this.funcPolarToCartesian(500, 500, s, x)
                  , E = this.funcPolarToCartesian(500, 500, s, y - e / 10)
                  , S = this.funcPolarToCartesian(500, 500, n, y - e / 10)
                  , H = this.funcPolarToCartesian(500, 500, n, x + e / 10)
                  , P = this.funcPolarToCartesian(500, 500, s, x + e / 10);
                a.close = O,
                a.close && o[i].classList.add("_close");
                let A = (G ? '<svg class="block-trading-sessions__period" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="1000" height="1000" viewBox="0 0 1000 1000"><defs><linearGradient id="grad' + r + "_" + i + '" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" style="stop-color:#9D0000;stop-opacity:1" /><stop offset="100%" style="stop-color:#f62525;stop-opacity:1" />\n</linearGradient></defs><path class="period_path" stroke-width="0" fill="url(#grad' + r + "_" + i + ')" d="' + this.funcDescribeArc(500, 500, s, y, x) + " C " + E.x + " " + E.y + ", " + S.x + " " + S.y + ", " + U.x + " " + U.y + this.funcDescribeArc(500, 500, n, x, y, !1) + "C " + H.x + " " + H.y + ", " + P.x + " " + P.y + ", " + D.x + " " + D.y + '"></path></svg>' : "") + '<svg class="block-trading-sessions__seconds" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="1000" height="1000" viewBox="0 0 1000 1000"><circle fill="#606060" cx="' + B.x + '" cy="' + B.y + '" r="' + e / 4 + '"/></svg><svg class="block-trading-sessions__minutes" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="1000" height="1000" viewBox="0 0 1000 1000"><defs><filter id="filterMinutes0' + r + '" x="-50%" y="-50%" width="200%" height="200%"><feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" /><feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" /><feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="20" /><feBlend in="SourceGraphic" in2="blurOut" mode="normal" /></filter></defs><circle filter="url(#filterMinutes0' + r + ')" fill="white" cx="' + M.x + '" cy="' + M.y + '" r="' + e / 1.4 + '"/></svg><svg class="block-trading-sessions__hours" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="1000" height="1000" viewBox="0 0 1000 1000"><defs><filter id="filterHours0' + r + '" x="-50%" y="-50%" width="200%" height="200%"><feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" /><feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0 0 0 0 0 0 0.24 0 0 0 0 0 1 0 0 0 0 0 1 0 "/><feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="20" /><feBlend in="SourceGraphic" in2="blurOut" mode="normal" /></filter></defs><circle /*filter="url(#filterHours0' + r + ')"*/ filter="drop-shadow(0px 0px 10px rgb(126 4 4 / 1))" fill="white" cx="' + b.x + '" cy="' + b.y + '" r="' + e / 1.3 + '"/></svg><div class="block-trading-sessions__info">' + this.funcGenerateBlockInfo(a) + "</div>";
                o[i].getElementsByClassName("block-trading-sessions__svg-block")[0].innerHTML = "";
                o[i].getElementsByClassName("block-trading-sessions__svg-block")[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="1000" height="1000" viewBox="0 0 1000 1000"><path stroke="#f0f0f0" stroke-width="80" fill="none" d="M 500, 500m -400, 0a 400,400 0 1,0 800,0a 400,400 0 1,0 -800,0"></path></svg>';
                o[i].getElementsByClassName("block-trading-sessions__svg-block")[0].insertAdjacentHTML("beforeend", A)
            }
            u ? (c.parentElement.classList.remove("block-trading-sessions__header_red"),
            c.parentElement.classList.add("block-trading-sessions__header_green"),
            c.innerHTML = this.tToClose + " " + this.funcGetLeftTime(f)) : (c.parentElement.classList.remove("block-trading-sessions__header_green"),
            c.parentElement.classList.add("block-trading-sessions__header_red"),
            c.innerHTML = this.tToOpen + " " + this.funcGetLeftTime(d))
        }
        this.timer = setInterval(this.funcTickSecond, 1e3)
    },
    funcPolarToCartesian: function(e, t, s, n) {
        let i = (n - 90) * Math.PI / 180;
        return {
            x: e + s * Math.cos(i),
            y: t + s * Math.sin(i)
        }
    },
    funcDescribeArc: function(e, t, s, n, i, r) {
        let a = this.funcPolarToCartesian(e, t, s, i)
          , l = this.funcPolarToCartesian(e, t, s, n)
          , o = i - n <= 180 ? "0" : "1"
          , c = i < n ? 1 : 0;
        return null == r || !0 === r ? ["M", a.x, a.y, "A", s, s, 0, o, c, l.x, l.y].join(" ") : ["A", s, s, 0, o, c, l.x, l.y].join(" ")
    },
    funcGenerateBlockInfo: function(e) {
        let t, s = !1, n = new Date(1e3 * ((new Date).getTime() / 1e3 + 60 * e.utc * 60)), i = n.getUTCHours(), r = n.getUTCMinutes(), a = n.getUTCSeconds(), l = n.getUTCDay(), o = 60 * i * 60 + 60 * r + a, c = e.start.split(":"), d = e.end.split(":"), f = 60 * parseInt(c[0]) * 60 + 60 * parseInt(c[1]), u = 60 * parseInt(d[0]) * 60 + 60 * parseInt(d[1]);
        return f < o && o < u && 0 !== l && 6 !== l ? (s = !0,
        t = u - o) : 0 !== l && 6 !== l ? o < u ? t = f - o : (t = 86400 - o + f,
        5 === l && (t += 172800)) : (t = 86400 - o + f,
        6 === l && (t += 86400)),
        "<div>UTC" + (e.utc <= 0 ? e.utc : "+" + e.utc) + "</div><div>" + (i < 10 ? "0" + i : i) + ":" + (r < 10 ? "0" + r : r) + "</div><div>" + this.funcGenerateBlockInfoGetLeftTime(t) + "</div><div>" + (s ? this.tToClose : this.tToOpen) + "</div>"
    },
    funcGetLeftTime: function(e) {
        let t, s;
        return (t = Math.floor(e / 60 / 60)) + ":" + ((s = Math.floor(e / 60) - 60 * t) < 10 ? "0" + s : s)
    },
    funcGenerateBlockInfoGetLeftTime: function(e) {
        let t, s;
        return ((t = Math.floor(e / 60 / 60)) < 10 ? "0" + t : t) + ":" + ((s = Math.floor(e / 60) - 60 * t) < 10 ? "0" + s : s) + ":" + ((e -= 60 * t * 60 + 60 * s) < 10 ? "0" + e : e)
    },
    funcTickSecond: function() {
        let e, t, s, n, i = document.getElementsByClassName("mobile-block-trading-sessions");
        if (!i.length)
            return clearInterval(tradingSessions.timer),
            !1;
        for (e = 0,
        t = i.length; e < t; e++) {
            let t = tradingSessions.schedule[i[e].dataset.session]
              , r = i[e].getElementsByClassName("block-trading-sessions__info");
            for (s = 0,
            n = r.length; s < n; s++)
                r[s].innerHTML = tradingSessions.funcGenerateBlockInfo(t[s]);
            tradingSessions.funcTickUpdateHeader(i[e])
        }
    },
    funcTickUpdateHeader: function(e) {
        let t = this.schedule[e.dataset.session]
          , s = e.querySelector(".block-trading-sessions__header span")
          , n = e.getElementsByClassName("block-trading-sessions__item")
          , i = null
          , r = 0
          , a = !1;
        for (let e = 0, s = t.length; e < s; e++) {
            let s = t[e]
              , l = new Date(1e3 * ((new Date).getTime() / 1e3 + 60 * s.utc * 60))
              , o = l.getUTCHours()
              , c = l.getUTCMinutes()
              , d = l.getUTCSeconds()
              , f = l.getUTCDay()
              , u = s.start.split(":")
              , h = s.end.split(":")
              , g = 60 * parseInt(u[0]) * 60 + 60 * parseInt(u[1])
              , p = 60 * parseInt(h[0]) * 60 + 60 * parseInt(h[1])
              , m = 60 * o * 60 + 60 * c + d
              , T = !0;
            if (g < m && m < p && 0 !== f && 6 !== f)
                r = Math.max(p - m, r),
                a = !0,
                T = !1;
            else {
                let e = 0;
                0 !== f && 6 !== f ? m < g ? e = g - m : (e = 86400 - m + g,
                5 === f && (e += 172800)) : (e = 86400 - m + g,
                6 === f && (e += 86400)),
                i = null === i ? e : Math.min(e, i)
            }
            s.close !== T && (s.close = !s.close,
            s.close ? n[e].classList.add("_close") : n[e].classList.remove("_close"))
        }
        a ? (s.parentElement.classList.remove("block-trading-sessions__header_red"),
        s.parentElement.classList.add("block-trading-sessions__header_green"),
        s.innerHTML = this.tToClose + " " + this.funcGetLeftTime(r)) : (s.parentElement.classList.remove("block-trading-sessions__header_green"),
        s.parentElement.classList.add("block-trading-sessions__header_red"),
        s.innerHTML = this.tToOpen + " " + this.funcGetLeftTime(i))
    }
};
