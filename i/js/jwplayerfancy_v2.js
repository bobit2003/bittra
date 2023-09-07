(function() {
    var player,
        statusvideo = false;

    $(document).ready(function(){
        player = jwplayer("player_html5_fancy").setup({
            image: '',
            file: $('[data-videotrading]:first').attr('data-videotrading')
        });
        
        $('.jwplayerflex__fancy__close').click(function(){
            CloseJwplayerFancy();
        });

        $('[data-videotrading]').click(function(){
            videosrc_jw = $(this).attr('data-videotrading');
            setTimeout(function(){
                statusvideo = true;
                player.load({
                    file: videosrc_jw
                }).play(true);
                $('.jwplayerflex__fancy').removeClass('jwplayerflex__hide');
            }, 1);
        });
        
        $('body').click(function(event){
            var target = $(event.target);
            object_click = target.parents('.jwplayerflex__fancy__one').html();
            
            if(object_click == null && statusvideo){
               CloseJwplayerFancy();
            }
        });
    });

    function CloseJwplayerFancy(){
        $('.jwplayerflex__fancy').addClass('jwplayerflex__hide');
        player.stop();
    }
})();