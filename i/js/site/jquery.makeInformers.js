;(function($) {

    $.fn.makeInformers = function(list, delay) {

        var $this = this,
            lang = $('body').attr('data-lng') || 'en',
            delay = delay || 1000,
            defaults = [
             // 'prime_news',
                'analyticsReviews',
                'russian_news',
                'forex_news',
                'photo_news',
                'forex_humor',
                'company_news',
                'analytics'
            ];

        function shuffleContent(a,b)
        {
            return Math.random() - 0.5;
        }

        defaults.sort(shuffleContent);

        var informers = ($.isArray(list) && list.length) ? list : defaults;

        var urlLang = (lang === 'en' || lang === 'cn') ? '' : '/' + lang;

        setTimeout(function() {
            $.get(
                urlLang + '/informer_last_news.php',
                {
                    list: informers
                },
                function(res) {
                    if(res)
                        $this.html(res);
                });
        }, delay);

        /*
         * Последовательная ajax-загрузка информеров
         *
        setTimeout(function() {

            var promise = $.when();
            $.each(informers, function(i, type) {

                if(lang != 'ru' && type == 'russian_news')
                    return true;

                promise = promise.then(function() {
                    return $.ajax(urlLang + '/informer_last_news.php?informer=' + type + '&count='+i);
                }).then(function(result) {

                    if (result)
                        $this.append('<div class="' + type + '">' + result + '</div>');

                });
            });
            promise.then(function() {
                console.log('Complete');
            });
        }, delay);*/

        return this;
    };
})(jQuery);
