// TODO: make slides nested, such that for the same heading multiple slides might exist and the headings aren't animated in that case
// TODO: test embedding of images and other stuff...
// TODO: introduce some sort of metadata to further customize the slides

(function($) {
    var defaultSettings = {
        nextButton : '#nextBtn',
        prevButton : '#prevBtn'
    };

    $.prezentid = function(settings) {
        settings = $.extend({}, defaultSettings, settings);
        
        loadMarkdownSource(settings.url, function(content) {
            if($.isFunction(settings.preprocessMarkdown)) {
                content = settings.preprocessMarkdown(content);
            }
            
            processMarkdown(content, settings);

            // jump to a slide indicated by window.hash
            if(window.location.hash) {
                var $slide = $(window.location.hash+'.slide');
                if(0 !== $slide.length) {
                    $('.slide.current').removeClass('current');
                    $slide.addClass('current');
                }
            }
            
            if(0 === $('.slide.current').length) {
                $('.slide').first().addClass('current');
            }

        });
        
        initNavigation(settings);
    };
    
    $.prezentid.nextSlide = function() {
        var nextId = $('.slide.current').next('.slide').attr('id');
        if(nextId) { window.location.hash = nextId; }
    };

    $.prezentid.prevSlide = function() { 
        var prevId = $('.slide.current').prev('.slide').attr('id');
        if(prevId) { window.location.hash = prevId; }
    };
    
    $.prezentid.jumpToSlide = function(id) {
        var $curr = $('.slide.current');
        var $next = $('.slide#'+id);
        
        if(0 === $next.length) { return false; }
        
        $curr.show().removeClass('current');
        $next.hide().addClass('current');
        
        $curr.fadeOut(500, function() { $next.fadeIn(500); });
    }
    

    // PRIVATE STUFF...
    function initNavigation(settings) {
        $(settings.nextButton).click($.prezentid.nextSlide);
        $(settings.prevButton).click($.prezentid.prevSlide);
        
        $('body').keydown(function(e) {
            switch(e.keyCode) {
                case 39: case 32: $.prezentid.nextSlide(); break;
                case 37: case 8: $.prezentid.prevSlide(); break;
            }
        });
        
        // Navigation-handlers
        window.onhashchange = function() {
            var slideId=window.location.hash.replace('#', '');
            $.prezentid.jumpToSlide(slideId);
        };
    }

    function loadMarkdownSource(url, onLoadComplete) {
        $.get(url, onLoadComplete);
    }
    
    function processMarkdown(content, settings) {
        // generate HTML
        var converter = new Showdown.converter();
        var $html = $(converter.makeHtml(content));
        
        // generate slides  
        var currSlide = null;
        var currTitle = null;
        var newSlide = function() {
            if(null !== currSlide) {
                currSlide.clone().appendTo('.content');
            }
            
            currSlide = $('<div class="slide"></div>');
            if(null !== currTitle) {
                currSlide.append(currTitle);
            }
        };
        
        newSlide();
        
        $html.each(function(idx) {
            var $this = $(this);
            
            if($this.is('hr')) { newSlide(); return; }
            if($this.is('h1')) { // h1 creates a frontpage and adds itself to every following page
                currTitle = $this;
                currSlide.addClass('frontpage').append($this);
                newSlide();
                return;
            }
            
            currSlide.append($this);
        });
        
        currSlide.appendTo('.content');
        
        // Highlight syntax
        hljs.initHighlighting();
        $('.slide pre code').each(function() {
            hljs.highlightBlock(this, '    ');
        });
        
        // assign ids if not present
        $('.slide').each(function(idx) {
            var id = $(this).attr('id');
            if(!id) { $(this).attr('id', "slide" + (idx+1)); }
        });
    }
    


})(jQuery);
// vim: ts=4 sw=4 expandtab
