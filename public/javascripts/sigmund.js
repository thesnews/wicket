(function($) {

    Handlebars.registerHelper('breaklines', function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.toString();
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        return new Handlebars.SafeString(text);
    });

    Handlebars.registerHelper('date', function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.toString();

        var d = new Date(text*1000);
        return d;

    });

    $(function() {
        var list_templ = Handlebars.compile($("#sigmund-story-template").html());

        $.ajax({
            dataType: 'json',
            data: {
                limit: 1000,
                offset: 0,
                sig: 'rfesafkda232qklefdaslfkl32321qafxccsa32432avv342qlk'
            },
            url: '/sigmund/stories',
            success: function(data) {
                var context = {stories: data};
                var html = list_templ(context);

                $('#main-content').empty();
                $('#main-content').html(html);

            }
        });

        $('#main-content').on('click', '[data-action="approve"]', function(e) {
            e.preventDefault();

            var hash = $(this).attr('data-hash');

            $.ajax({
                dataType: 'json',
                data: {
                    sig: 'rfesafkda232qklefdaslfkl32321qafxccsa32432avv342qlk'
                },
                url: '/sigmund/'+hash+'/approve',
                success: function(data) {
                    $('#story-'+hash+' span.label.label-notice')
                        .removeClass('label-notice')
                        .addClass('label-success')
                        .text('Approved');
                }
            });

        });


        $('#main-content').on('click', '[data-action="remove"]', function(e) {
            e.preventDefault();

            var hash = $(this).attr('data-hash');

            if( confirm('Are you sure you want to delete this entry?') ) {
                $.ajax({
                    dataType: 'json',
                    data: {
                        sig: 'rfesafkda232qklefdaslfkl32321qafxccsa32432avv342qlk'
                    },
                    url: '/sigmund/'+hash+'/remove',
                    success: function(data) {
                        $('#story-'+hash).remove();
                    }
                });

            }
        });

    });
})(jQuery);