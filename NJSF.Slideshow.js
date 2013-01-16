/*
* NJSF Slideshow lite 
*/
NJSF = NJSF || {};
NJSF.components = NJSF.components || {}
NJSF.components.Slideshow = function () {
    return {
        init: function () {

            // Controller achterwege laten, en View is eigenlijk ModelPresenter
            var slideshowModel = NJSF.components.Slideshow.model;            
            slideshowModel.fetch();
            var controller = NJSF.components.Slideshow.controller({model: slideshowModel});
            var slidesView = new NJSF.components.Slideshow.views.SlidesView({ model: slideshowModel });
            var arrowView = new NJSF.components.Slideshow.views.ArrowsView({ model: slideshowModel });

            var navigationView = new NJSF.components.Slideshow.views.NavigationView({ model: slideshowModel });
            navigationView.render();

        }
    }
}

NJSF.components.Slideshow.model = {
    activeSlide: 0,
    slides: [],

    getNextSlideId: function () {
        if (this.activeSlide > this.slides.length - 2) {
            return 0;
        }
        return this.activeSlide + 1;
    },

    getPreviousSlideId: function () {
        if (this.activeSlide === 0) {
            return this.slides.length - 1;
        }
        return this.activeSlide - 1;
    },

    userInteractionOccured : function() {
        NJSF.components.Slideshow.signals.userInteractionHasOccured.dispatch();
    },

    setActiveSlide: function (id) {
        this.activeSlide = id;
        NJSF.components.Slideshow.signals.slideIdChanged.dispatch(id);
    },

    fetch: function () {
        var _this = this;
        $(".slideitem").each(function (index) {
            _this.slides.push({ Name: $("h1", this).text(), Active : (index == 0 ? 'active' : '') });
        });
    }
}

NJSF.components.Slideshow.controller = function(options) {
    this.model = options.model,
    this.interval;

    this.init = function() {
        var _this = this;
        if(this.model.slides.length > 1) {
            this.interval = setInterval(function() {
                _this.model.setActiveSlide(_this.model.getNextSlideId());
            },7000);
            NJSF.components.Slideshow.signals.userInteractionHasOccured.add(function() {                
                clearInterval(_this.interval);
            });            
        }
    }

    this.init();
}

NJSF.components.Slideshow.signals = {
    slideIdChanged: new signals.Signal(),
    userInteractionHasOccured: new signals.Signal()    
};

NJSF.components.Slideshow.views = {}

NJSF.components.Slideshow.views.NavigationView = function (options) {

    this.el = "#slidernavigation ul",
    this.model = options.model,
    this.template = "#slideNavigationTemplate",

    this.render = function () {
        var _this = this;
        $(this.template).tmpl(this.model.slides).appendTo(this.el);

        $("a", this.el).click(function (e) {
            e.preventDefault();
            var activeSlideIndex = $("#slidernavigation ul a").index($(this));
            _this.model.userInteractionOccured();
            _this.model.setActiveSlide(activeSlideIndex);
            
        });
    },

    this.slideIdChanged = function (activeSlideId) {
        this.setBulletActive.apply(this, [activeSlideId]);
    },

    this.setBulletActive = function (index) {
        $("a.active", this.el).removeClass('active');
        $("a", this.el).eq(index).addClass('active');
    }

    this.addListeners = function () {
        // Listen to signal for slide change
        NJSF.components.Slideshow.signals.slideIdChanged.add(this.slideIdChanged, this);
    }

    this.init = function () {
        this.addListeners();
    }

    this.init();
}

NJSF.components.Slideshow.views.ArrowsView = function (options) {

    this.model = options.model,
    this.el = "#slideshowArrowNav",
    this.render = function () {
        var _this = this;

        $("a", this.el).click(function (e) {
            e.preventDefault();
            var activeSlideIndex;
            // Lelijk, moet dymanische classes krijgen
            if ($(this).attr('class') == 'prev') {
                activeSlideIndex = _this.model.getPreviousSlideId();
            } else {
                activeSlideIndex = _this.model.getNextSlideId();
            }
            _this.model.userInteractionOccured();
            _this.model.setActiveSlide(activeSlideIndex);
        });
    },

    this.slideIdChanged = function (activeSlideId) {

    },

    this.setBulletActive = function (index) {

    }

    this.addListeners = function () {
        // Listen to signal for slide change
        NJSF.components.Slideshow.signals.slideIdChanged.add(this.slideIdChanged, this);
    }

    this.init = function () {
        this.addListeners();
        this.render();
    }

    this.init();
}

NJSF.components.Slideshow.views.SlidesView = function (options) {
    this.el = "#slidecontainer";
    this.render = function () {
        NJSF.components.Slideshow.signals.slideIdChanged.add(this.slideIdChanged, this);
    };

    this.slideIdChanged = function (activeSlideId) {
        this.updateActiveSlide(activeSlideId);
    }

    this.updateActiveSlide = function (activeSlideIndex) {
        if(NJSF.helpers.animation.hasCSS3TransitionSupport()) {
            $("#slidecontainer > div.active").removeClass('active');
            $("#slidecontainer > div").eq(activeSlideIndex).addClass('active');
        } 
        else {
            $("div.slideitem.current").fadeOut(2000).removeClass('current');
            $("#slidecontainer > div").eq(activeSlideIndex).addClass('current').hide().fadeIn(2000);
            
        }
    }

    this.init = function () {
        if(typeof NJSF.components.Slideshow.views.SlideView !== 'undefined') {
            var slide;
            $(this.el + " > div").each(function (index) {
                slide = new NJSF.components.Slideshow.views.SlideView({el: this});            
            });
        }

        if(!NJSF.helpers.animation.hasCSS3TransitionSupport()) {
            
            $("div.slideitem.active").addClass('current');
        }

        this.render();
    }

    this.init();

    return {

    }
}

/* Optional */
NJSF.components.Slideshow.views.SlideView = function (options) {
    this.el = options.el;

    this.render = function () {

    };

    this.makePointerActive = function (pointerIndex, slideEl) {
        


        $(".active .slideproducts > div > div.active").removeClass('active');
        $(".active .slideproducts > div > div").eq(pointerIndex).addClass('active');
        $(".current .slideproducts > div > div.active").removeClass('active');
        $(".current .slideproducts > div > div").eq(pointerIndex).addClass('active');

        
    }

    this.init = function () {
        var _this = this;

        if (document.location.hash !== "") {
                // hash on init
                var productID = document.location.hash;
                var productElement = $(productID, ".slideproducts");
                var pointerIndex = $(".active .slideproducts > div > div").index(productElement);
                _this.makePointerActive(pointerIndex);
            }

        $(".pointers a", this.el).click(function (e) {
            //e.preventDefault();

            var pointerIndex = $(_this.el).find(".pointers a").index(this);
            
            if (pointerIndex < 0) {
            //    pointerIndex = $(".current .pointers a").index(this);
            }

            _this.makePointerActive(pointerIndex, _this.el);
        });

        this.render();
    }

    this.init();

    return {

    }
}


