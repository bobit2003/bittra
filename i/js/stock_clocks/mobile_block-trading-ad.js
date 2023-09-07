var blockTradingAdObject = {
    funcClickClose: function(e) {
        for (var t = (e || window.event).target; null !== t && !t.classList.contains("block-trading-ad"); )
            t = t.parentElement;
        if (null === t)
            return !1;
        t.style.display = "none";
        var n = new Date((new Date).getTime() + 324e5);
        document.cookie = "mt5_user-Hide_block_trading=1; path=/; expires=" + n.toUTCString()
    },
    funcCheckVisible: function() {
        if (!document.cookie.match(new RegExp("(?:^|; )" + "mt5_user-Hide_block_trading".replace(/([.$?*|{}()\[\]\\\/+^])/g, "\\$1") + "=([^;]*)"))) {
            var e = document.getElementsByClassName("block-trading-ad")
              , t = (new Date).getUTCDay();
            if (!e.length || 6 === t || 0 === t)
                return !1;
            e[0].style.display = "block"
        }
    }
};
