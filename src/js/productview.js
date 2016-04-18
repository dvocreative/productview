(function(domService, packager, factory, root){

    if (root.jQuery) {
        packager.jquery($, domService.jquery, factory);
    }

    packager.dom(root, domService.dom, factory);

})({

    dom : {
        create : function(tagName, attrs) {
            var el = document.createElement(tagName);
            for (attrKey in attrs) {
                el.setAttribute(((attrKey !== 'className') ? attrKey : 'class'), attrs[attrKey]);
            }
            return el;
        },
        setAttribute : function(el, attrKey, val) {
            el.setAttribute(attrKey, val);
        },
        append : function(el, parent) {
            parent.appendChild(el);
        },
        addListener : function(type, el, cb) {
            el.addEventListener(type, (function(_cb){
                return function(e){
                    _cb(e);
                };
            })(cb));
        },
        addClass : function(el, className) {
            var existingClass = el.getAttribute('class') || '';
            var existingClasses = existingClass.split(' ');
            if (existingClasses.indexOf(className) === -1) {
                el.setAttribute('class', existingClass + ' ' + className);
            }
        },
        removeClass : function(el, className) {
            var existingClasses = (el.getAttribute('class') || '').split(' ');
            var classPos = existingClasses.indexOf(className);
            if (classPos > -1) {
                existingClasses.splice(classPos, 1);
            }
            el.setAttribute('class', existingClasses.join(' '));
        },
        getTopParent : function() {
            return document.body;
        },
        moveTo : function(el, x, y) {
            el.style.left = x + "px";
            el.style.top = y + "px";
        },
        getOffset : function(el) {
            var rect = el.getBoundingClientRect();
            return {
                top : rect.top,
                left : rect.left
            };
        },
        getSize : function(el) {
            var cs = window.getComputedStyle(el);
            return {
                width : cs.getPropertyValue('width'),
                height : cs.getPropertyValue('height')
            }
        },
        css : function(el, prop, val) {
            el.style[prop] = val;
        }
    },

    jquery : {

    }

}, {

    dom : function(root, domService, factory) {
        root['ProductView'] = factory('dom', domService);
    },

    jquery : function($, factory) {

    },

    react : function() {

    },

    angular : function() {

    }

}, function(useType, domService) {

    var ProductView = function(container, config) {

        this.container = container;
        this.config = config || {};

        this.els = [];
        this.currentIndex = 0;
        this.currentEl = null;
        this.zoomEl = null;
        this.zoomElImg = null;
        this.zoomSize = null;

        this._initialize();

    };

    ProductView.prototype = {

        _initialize : function() {

            if (!this.config.images) {
                this.config.images = this._buildImagesFromMarkup();
            }

            this.config.zoomWidth = this.config.zoomWidth || 200;
            this.config.zoomHeight = this.config.zoomHeight || 200;

            this.config.images.sort(this._sortImages);

            domService.addClass(this.container, 'productview-container');

            this.zoomEl = domService.create('div', {
                className : 'productview-zoom'
            });
            domService.css(this.zoomEl, 'width', this.config.zoomWidth + 'px');
            domService.css(this.zoomEl, 'height', this.config.zoomHeight + 'px');
            this.zoomElImg = domService.create('img', {
                className : 'productview-zoom-img'
            });
            domService.append(this.zoomElImg, this.zoomEl);
            domService.append(this.zoomEl, domService.getTopParent());

            this._setListeners();

            this.containerOffset = domService.getOffset(this.container);

            this._showView(this.currentIndex);

            this.containerSize = domService.getSize(this.container);

        },

        _buildImagesFromMarkup : function() {

        },

        _sortImages : function(img1, img2) {
            var retVal = 0;
            if (img1.degree && img2.degree) {
                retVal = (parseInt(img1.degree) > parseInt(img2.degree)) ? 1 : -1;
            }
            return retVal;
        },

        _setListeners : function() {

            var self = this;

            domService.setAttribute(this.container, 'tabindex', 99999);

            domService.addListener('keydown', this.container, function(e){
                if (e.keyCode == 39) {
                    self._showView(self._getNextIndex());
                } else if (e.keyCode == 37) {
                    self._showView(self._getPrevIndex());
                }
            });

            domService.addListener('mousemove', this.container, function(e){
                domService.addClass(self.zoomEl, 'active');
            });

            domService.addListener('mouseenter', this.container, function(e){
                domService.addClass(self.zoomEl, 'active');
            });

            domService.addListener('mouseleave', this.container, function(e){
                domService.removeClass(self.zoomEl, 'active');
            });

            domService.addListener('mousemove', this.container, function(e){
                var relX = ((e.clientX - self.containerOffset.left)/parseInt(self.containerSize.width)),
                    relY = ((e.clientY - self.containerOffset.top)/parseInt(self.containerSize.height));
                var imgPosX = (parseInt(self.zoomSize.width) - self.config.zoomWidth) * relX * -1,
                    imgPosY = (parseInt(self.zoomSize.height) - self.config.zoomHeight) * relY * -1;
                domService.moveTo(self.zoomEl, (e.clientX + 20), (e.clientY + 20));
                domService.moveTo(self.zoomElImg, imgPosX, imgPosY);
            });

        },

        _getNextIndex : function() {
            return (this.currentIndex < (this.config.images.length - 1)) ? (this.currentIndex + 1) : 0;
        },

        _getPrevIndex : function() {
            return (this.currentIndex > 0) ? (this.currentIndex - 1) : (this.config.images.length - 1);
        },

        _showView : function(viewIndex) {

            if (this.config.images[viewIndex]) {

                if (!this.els[viewIndex]) {
                    this.els[viewIndex] = domService.create('img', {
                        src : this.config.images[viewIndex].url,
                        className : 'productView-image'
                    });
                    domService.append(this.els[viewIndex], this.container);
                }

                if (this.currentEl) {
                    domService.removeClass(this.currentEl, 'active');
                }

                domService.addClass(this.els[viewIndex], 'active');
                this.currentEl = this.els[viewIndex];

                domService.setAttribute(this.zoomElImg, 'src', this.config.images[viewIndex].url);
                this.zoomSize = domService.getSize(this.zoomElImg);

                this.currentIndex = viewIndex;

            }

        }

    };

    return ProductView;

}, this);