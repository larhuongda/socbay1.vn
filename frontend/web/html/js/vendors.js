if (typeof jQuery === 'undefined') {
    throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.')
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
        throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
    }
}(jQuery);
+function ($) {
    'use strict';

    function transitionEnd() {
        var el = document.createElement('bootstrap')
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {end: transEndEventNames[name]}
            }
        }
        return false
    }

    $.fn.emulateTransitionEnd = function (duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function () {
            called = true
        })
        var callback = function () {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }
    $(function () {
        $.support.transition = transitionEnd()
        if (!$.support.transition) return
        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })
}(jQuery);
+function ($) {
    'use strict';
    var dismiss = '[data-dismiss="alert"]'
    var Alert = function (el) {
        $(el).on('click', dismiss, this.close)
    }
    Alert.VERSION = '3.3.7'
    Alert.TRANSITION_DURATION = 150
    Alert.prototype.close = function (e) {
        var $this = $(this)
        var selector = $this.attr('data-target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        var $parent = $(selector === '#' ? [] : selector)
        if (e) e.preventDefault()
        if (!$parent.length) {
            $parent = $this.closest('.alert')
        }
        $parent.trigger(e = $.Event('close.bs.alert'))
        if (e.isDefaultPrevented()) return
        $parent.removeClass('in')

        function removeElement() {
            $parent.detach().trigger('closed.bs.alert').remove()
        }

        $.support.transition && $parent.hasClass('fade') ? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(Alert.TRANSITION_DURATION) : removeElement()
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.alert')
            if (!data) $this.data('bs.alert', (data = new Alert(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.alert
    $.fn.alert = Plugin
    $.fn.alert.Constructor = Alert
    $.fn.alert.noConflict = function () {
        $.fn.alert = old
        return this
    }
    $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
}(jQuery);
+function ($) {
    'use strict';
    var Button = function (element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Button.DEFAULTS, options)
        this.isLoading = false
    }
    Button.VERSION = '3.3.7'
    Button.DEFAULTS = {loadingText: 'loading...'}
    Button.prototype.setState = function (state) {
        var d = 'disabled'
        var $el = this.$element
        var val = $el.is('input') ? 'val' : 'html'
        var data = $el.data()
        state += 'Text'
        if (data.resetText == null) $el.data('resetText', $el[val]())
        setTimeout($.proxy(function () {
            $el[val](data[state] == null ? this.options[state] : data[state])
            if (state == 'loadingText') {
                this.isLoading = true
                $el.addClass(d).attr(d, d).prop(d, true)
            } else if (this.isLoading) {
                this.isLoading = false
                $el.removeClass(d).removeAttr(d).prop(d, false)
            }
        }, this), 0)
    }
    Button.prototype.toggle = function () {
        var changed = true
        var $parent = this.$element.closest('[data-toggle="buttons"]')
        if ($parent.length) {
            var $input = this.$element.find('input')
            if ($input.prop('type') == 'radio') {
                if ($input.prop('checked')) changed = false
                $parent.find('.active').removeClass('active')
                this.$element.addClass('active')
            } else if ($input.prop('type') == 'checkbox') {
                if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
                this.$element.toggleClass('active')
            }
            $input.prop('checked', this.$element.hasClass('active'))
            if (changed) $input.trigger('change')
        } else {
            this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
            this.$element.toggleClass('active')
        }
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.button')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.button', (data = new Button(this, options)))
            if (option == 'toggle') data.toggle()
            else if (option) data.setState(option)
        })
    }

    var old = $.fn.button
    $.fn.button = Plugin
    $.fn.button.Constructor = Button
    $.fn.button.noConflict = function () {
        $.fn.button = old
        return this
    }
    $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
        var $btn = $(e.target).closest('.btn')
        Plugin.call($btn, 'toggle')
        if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
            e.preventDefault()
            if ($btn.is('input,button')) $btn.trigger('focus')
            else $btn.find('input:visible,button:visible').first().trigger('focus')
        }
    }).on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
        $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })
}(jQuery);
+function ($) {
    'use strict';
    var Carousel = function (element, options) {
        this.$element = $(element)
        this.$indicators = this.$element.find('.carousel-indicators')
        this.options = options
        this.paused = null
        this.sliding = null
        this.interval = null
        this.$active = null
        this.$items = null
        this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))
        this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element.on('mouseenter.bs.carousel', $.proxy(this.pause, this)).on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
    }
    Carousel.VERSION = '3.3.7'
    Carousel.TRANSITION_DURATION = 600
    Carousel.DEFAULTS = {interval: 5000, pause: 'hover', wrap: true, keyboard: true}
    Carousel.prototype.keydown = function (e) {
        if (/input|textarea/i.test(e.target.tagName)) return
        switch (e.which) {
            case 37:
                this.prev();
                break
            case 39:
                this.next();
                break
            default:
                return
        }
        e.preventDefault()
    }
    Carousel.prototype.cycle = function (e) {
        e || (this.paused = false)
        this.interval && clearInterval(this.interval)
        this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
        return this
    }
    Carousel.prototype.getItemIndex = function (item) {
        this.$items = item.parent().children('.item')
        return this.$items.index(item || this.$active)
    }
    Carousel.prototype.getItemForDirection = function (direction, active) {
        var activeIndex = this.getItemIndex(active)
        var willWrap = (direction == 'prev' && activeIndex === 0) || (direction == 'next' && activeIndex == (this.$items.length - 1))
        if (willWrap && !this.options.wrap) return active
        var delta = direction == 'prev' ? -1 : 1
        var itemIndex = (activeIndex + delta) % this.$items.length
        return this.$items.eq(itemIndex)
    }
    Carousel.prototype.to = function (pos) {
        var that = this
        var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
        if (pos > (this.$items.length - 1) || pos < 0) return
        if (this.sliding) return this.$element.one('slid.bs.carousel', function () {
            that.to(pos)
        })
        if (activeIndex == pos) return this.pause().cycle()
        return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
    }
    Carousel.prototype.pause = function (e) {
        e || (this.paused = true)
        if (this.$element.find('.next, .prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end)
            this.cycle(true)
        }
        this.interval = clearInterval(this.interval)
        return this
    }
    Carousel.prototype.next = function () {
        if (this.sliding) return
        return this.slide('next')
    }
    Carousel.prototype.prev = function () {
        if (this.sliding) return
        return this.slide('prev')
    }
    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.item.active')
        var $next = next || this.getItemForDirection(type, $active)
        var isCycling = this.interval
        var direction = type == 'next' ? 'left' : 'right'
        var that = this
        if ($next.hasClass('active')) return (this.sliding = false)
        var relatedTarget = $next[0]
        var slideEvent = $.Event('slide.bs.carousel', {relatedTarget: relatedTarget, direction: direction})
        this.$element.trigger(slideEvent)
        if (slideEvent.isDefaultPrevented()) return
        this.sliding = true
        isCycling && this.pause()
        if (this.$indicators.length) {
            this.$indicators.find('.active').removeClass('active')
            var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
            $nextIndicator && $nextIndicator.addClass('active')
        }
        var slidEvent = $.Event('slid.bs.carousel', {relatedTarget: relatedTarget, direction: direction})
        if ($.support.transition && this.$element.hasClass('slide')) {
            $next.addClass(type)
            $next[0].offsetWidth
            $active.addClass(direction)
            $next.addClass(direction)
            $active.one('bsTransitionEnd', function () {
                $next.removeClass([type, direction].join(' ')).addClass('active')
                $active.removeClass(['active', direction].join(' '))
                that.sliding = false
                setTimeout(function () {
                    that.$element.trigger(slidEvent)
                }, 0)
            }).emulateTransitionEnd(Carousel.TRANSITION_DURATION)
        } else {
            $active.removeClass('active')
            $next.addClass('active')
            this.sliding = false
            this.$element.trigger(slidEvent)
        }
        isCycling && this.cycle()
        return this
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.carousel')
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
            var action = typeof option == 'string' ? option : options.slide
            if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
            if (typeof option == 'number') data.to(option)
            else if (action) data[action]()
            else if (options.interval) data.pause().cycle()
        })
    }

    var old = $.fn.carousel
    $.fn.carousel = Plugin
    $.fn.carousel.Constructor = Carousel
    $.fn.carousel.noConflict = function () {
        $.fn.carousel = old
        return this
    }
    var clickHandler = function (e) {
        var href
        var $this = $(this)
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''))
        if (!$target.hasClass('carousel')) return
        var options = $.extend({}, $target.data(), $this.data())
        var slideIndex = $this.attr('data-slide-to')
        if (slideIndex) options.interval = false
        Plugin.call($target, options)
        if (slideIndex) {
            $target.data('bs.carousel').to(slideIndex)
        }
        e.preventDefault()
    }
    $(document).on('click.bs.carousel.data-api', '[data-slide]', clickHandler).on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)
    $(window).on('load', function () {
        $('[data-ride="carousel"]').each(function () {
            var $carousel = $(this)
            Plugin.call($carousel, $carousel.data())
        })
    })
}(jQuery);
+function ($) {
    'use strict';
    var Collapse = function (element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Collapse.DEFAULTS, options)
        this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]')
        this.transitioning = null
        if (this.options.parent) {
            this.$parent = this.getParent()
        } else {
            this.addAriaAndCollapsedClass(this.$element, this.$trigger)
        }
        if (this.options.toggle) this.toggle()
    }
    Collapse.VERSION = '3.3.7'
    Collapse.TRANSITION_DURATION = 350
    Collapse.DEFAULTS = {toggle: true}
    Collapse.prototype.dimension = function () {
        var hasWidth = this.$element.hasClass('width')
        return hasWidth ? 'width' : 'height'
    }
    Collapse.prototype.show = function () {
        if (this.transitioning || this.$element.hasClass('in')) return
        var activesData
        var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')
        if (actives && actives.length) {
            activesData = actives.data('bs.collapse')
            if (activesData && activesData.transitioning) return
        }
        var startEvent = $.Event('show.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return
        if (actives && actives.length) {
            Plugin.call(actives, 'hide')
            activesData || actives.data('bs.collapse', null)
        }
        var dimension = this.dimension()
        this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true)
        this.$trigger.removeClass('collapsed').attr('aria-expanded', true)
        this.transitioning = 1
        var complete = function () {
            this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('')
            this.transitioning = 0
            this.$element.trigger('shown.bs.collapse')
        }
        if (!$.support.transition) return complete.call(this)
        var scrollSize = $.camelCase(['scroll', dimension].join('-'))
        this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
    }
    Collapse.prototype.hide = function () {
        if (this.transitioning || !this.$element.hasClass('in')) return
        var startEvent = $.Event('hide.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return
        var dimension = this.dimension()
        this.$element[dimension](this.$element[dimension]())[0].offsetHeight
        this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false)
        this.$trigger.addClass('collapsed').attr('aria-expanded', false)
        this.transitioning = 1
        var complete = function () {
            this.transitioning = 0
            this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse')
        }
        if (!$.support.transition) return complete.call(this)
        this.$element
            [dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)
    }
    Collapse.prototype.toggle = function () {
        this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }
    Collapse.prototype.getParent = function () {
        return $(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function (i, element) {
            var $element = $(element)
            this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
        }, this)).end()
    }
    Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
        var isOpen = $element.hasClass('in')
        $element.attr('aria-expanded', isOpen)
        $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen)
    }

    function getTargetFromTrigger($trigger) {
        var href
        var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
        return $(target)
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.collapse')
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
            if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.collapse
    $.fn.collapse = Plugin
    $.fn.collapse.Constructor = Collapse
    $.fn.collapse.noConflict = function () {
        $.fn.collapse = old
        return this
    }
    $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
        var $this = $(this)
        if (!$this.attr('data-target')) e.preventDefault()
        var $target = getTargetFromTrigger($this)
        var data = $target.data('bs.collapse')
        var option = data ? 'toggle' : $this.data()
        Plugin.call($target, option)
    })
}(jQuery);
+function ($) {
    'use strict';
    var backdrop = '.dropdown-backdrop'
    var toggle = '[data-toggle="dropdown"]'
    var Dropdown = function (element) {
        $(element).on('click.bs.dropdown', this.toggle)
    }
    Dropdown.VERSION = '3.3.7'

    function getParent($this) {
        var selector = $this.attr('data-target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        var $parent = selector && $(selector)
        return $parent && $parent.length ? $parent : $this.parent()
    }

    function clearMenus(e) {
        if (e && e.which === 3) return
        $(backdrop).remove()
        $(toggle).each(function () {
            var $this = $(this)
            var $parent = getParent($this)
            var relatedTarget = {relatedTarget: this}
            if (!$parent.hasClass('open')) return
            if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return
            $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
            if (e.isDefaultPrevented()) return
            $this.attr('aria-expanded', 'false')
            $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
        })
    }

    Dropdown.prototype.toggle = function (e) {
        var $this = $(this)
        if ($this.is('.disabled, :disabled')) return
        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')
        clearMenus()
        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                $(document.createElement('div')).addClass('dropdown-backdrop').insertAfter($(this)).on('click', clearMenus)
            }
            var relatedTarget = {relatedTarget: this}
            $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
            if (e.isDefaultPrevented()) return
            $this.trigger('focus').attr('aria-expanded', 'true')
            $parent.toggleClass('open').trigger($.Event('shown.bs.dropdown', relatedTarget))
        }
        return false
    }
    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()
        if ($this.is('.disabled, :disabled')) return
        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')
        if (!isActive && e.which != 27 || isActive && e.which == 27) {
            if (e.which == 27) $parent.find(toggle).trigger('focus')
            return $this.trigger('click')
        }
        var desc = ' li:not(.disabled):visible a'
        var $items = $parent.find('.dropdown-menu' + desc)
        if (!$items.length) return
        var index = $items.index(e.target)
        if (e.which == 38 && index > 0) index--
        if (e.which == 40 && index < $items.length - 1) index++
        if (!~index) index = 0
        $items.eq(index).trigger('focus')
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.dropdown')
            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.dropdown
    $.fn.dropdown = Plugin
    $.fn.dropdown.Constructor = Dropdown
    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old
        return this
    }
    $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
        e.stopPropagation()
    }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
}(jQuery);
+function ($) {
    'use strict';
    var Modal = function (element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$dialog = this.$element.find('.modal-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false
        if (this.options.remote) {
            this.$element.find('.modal-content').load(this.options.remote, $.proxy(function () {
                this.$element.trigger('loaded.bs.modal')
            }, this))
        }
    }
    Modal.VERSION = '3.3.7'
    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150
    Modal.DEFAULTS = {backdrop: true, keyboard: true, show: true}
    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }
    Modal.prototype.show = function (_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', {relatedTarget: _relatedTarget})
        this.$element.trigger(e)
        if (this.isShown || e.isDefaultPrevented()) return
        this.isShown = true
        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')
        this.escape()
        this.resize()
        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
        this.$dialog.on('mousedown.dismiss.bs.modal', function () {
            that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })
        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade')
            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body)
            }
            that.$element.show().scrollTop(0)
            that.adjustDialog()
            if (transition) {
                that.$element[0].offsetWidth
            }
            that.$element.addClass('in')
            that.enforceFocus()
            var e = $.Event('shown.bs.modal', {relatedTarget: _relatedTarget})
            transition ? that.$dialog.one('bsTransitionEnd', function () {
                that.$element.trigger('focus').trigger(e)
            }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger('focus').trigger(e)
        })
    }
    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault()
        e = $.Event('hide.bs.modal')
        this.$element.trigger(e)
        if (!this.isShown || e.isDefaultPrevented()) return
        this.isShown = false
        this.escape()
        this.resize()
        $(document).off('focusin.bs.modal')
        this.$element.removeClass('in').off('click.dismiss.bs.modal').off('mouseup.dismiss.bs.modal')
        this.$dialog.off('mousedown.dismiss.bs.modal')
        $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal()
    }
    Modal.prototype.enforceFocus = function () {
        $(document).off('focusin.bs.modal').on('focusin.bs.modal', $.proxy(function (e) {
            if (document !== e.target && this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                this.$element.trigger('focus')
            }
        }, this))
    }
    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }
    Modal.prototype.resize = function () {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.modal')
        }
    }
    Modal.prototype.hideModal = function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
        })
    }
    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }
    Modal.prototype.backdrop = function (callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate
            this.$backdrop = $(document.createElement('div')).addClass('modal-backdrop ' + animate).appendTo(this.$body)
            this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide()
            }, this))
            if (doAnimate) this.$backdrop[0].offsetWidth
            this.$backdrop.addClass('in')
            if (!callback) return
            doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback()
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')
            var callbackRemove = function () {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove()
        } else if (callback) {
            callback()
        }
    }
    Modal.prototype.handleUpdate = function () {
        this.adjustDialog()
    }
    Modal.prototype.adjustDialog = function () {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight
        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }
    Modal.prototype.resetAdjustments = function () {
        this.$element.css({paddingLeft: '', paddingRight: ''})
    }
    Modal.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) {
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }
    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }
    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad)
    }
    Modal.prototype.measureScrollbar = function () {
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

    var old = $.fn.modal
    $.fn.modal = Plugin
    $.fn.modal.Constructor = Modal
    $.fn.modal.noConflict = function () {
        $.fn.modal = old
        return this
    }
    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')))
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({remote: !/#/.test(href) && href}, $target.data(), $this.data())
        if ($this.is('a')) e.preventDefault()
        $target.one('show.bs.modal', function (showEvent) {
            if (showEvent.isDefaultPrevented()) return
            $target.one('hidden.bs.modal', function () {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })
}(jQuery);
+function ($) {
    'use strict';
    var Tooltip = function (element, options) {
        this.type = null
        this.options = null
        this.enabled = null
        this.timeout = null
        this.hoverState = null
        this.$element = null
        this.inState = null
        this.init('tooltip', element, options)
    }
    Tooltip.VERSION = '3.3.7'
    Tooltip.TRANSITION_DURATION = 150
    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {selector: 'body', padding: 0}
    }
    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true
        this.type = type
        this.$element = $(element)
        this.options = this.getOptions(options)
        this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
        this.inState = {click: false, hover: false, focus: false}
        if (this.$element[0] instanceof document.constructor && !this.options.selector) {
            throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
        }
        var triggers = this.options.trigger.split(' ')
        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]
            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }
        this.options.selector ? (this._options = $.extend({}, this.options, {
            trigger: 'manual',
            selector: ''
        })) : this.fixTitle()
    }
    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS
    }
    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)
        if (options.delay && typeof options.delay == 'number') {
            options.delay = {show: options.delay, hide: options.delay}
        }
        return options
    }
    Tooltip.prototype.getDelegateOptions = function () {
        var options = {}
        var defaults = this.getDefaults()
        this._options && $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value
        })
        return options
    }
    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type)
        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }
        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
        }
        if (self.tip().hasClass('in') || self.hoverState == 'in') {
            self.hoverState = 'in'
            return
        }
        clearTimeout(self.timeout)
        self.hoverState = 'in'
        if (!self.options.delay || !self.options.delay.show) return self.show()
        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }
    Tooltip.prototype.isInStateTrue = function () {
        for (var key in this.inState) {
            if (this.inState[key]) return true
        }
        return false
    }
    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type)
        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }
        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
        }
        if (self.isInStateTrue()) return
        clearTimeout(self.timeout)
        self.hoverState = 'out'
        if (!self.options.delay || !self.options.delay.hide) return self.hide()
        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }
    Tooltip.prototype.show = function () {
        var e = $.Event('show.bs.' + this.type)
        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)
            var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
            if (e.isDefaultPrevented() || !inDom) return
            var that = this
            var $tip = this.tip()
            var tipId = this.getUID(this.type)
            this.setContent()
            $tip.attr('id', tipId)
            this.$element.attr('aria-describedby', tipId)
            if (this.options.animation) $tip.addClass('fade')
            var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement
            var autoToken = /\s?auto?\s?/i
            var autoPlace = autoToken.test(placement)
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
            $tip.detach().css({top: 0, left: 0, display: 'block'}).addClass(placement).data('bs.' + this.type, this)
            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
            this.$element.trigger('inserted.bs.' + this.type)
            var pos = this.getPosition()
            var actualWidth = $tip[0].offsetWidth
            var actualHeight = $tip[0].offsetHeight
            if (autoPlace) {
                var orgPlacement = placement
                var viewportDim = this.getPosition(this.$viewport)
                placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement
                $tip.removeClass(orgPlacement).addClass(placement)
            }
            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
            this.applyPlacement(calculatedOffset, placement)
            var complete = function () {
                var prevHoverState = that.hoverState
                that.$element.trigger('shown.bs.' + that.type)
                that.hoverState = null
                if (prevHoverState == 'out') that.leave(that)
            }
            $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete()
        }
    }
    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var $tip = this.tip()
        var width = $tip[0].offsetWidth
        var height = $tip[0].offsetHeight
        var marginTop = parseInt($tip.css('margin-top'), 10)
        var marginLeft = parseInt($tip.css('margin-left'), 10)
        if (isNaN(marginTop)) marginTop = 0
        if (isNaN(marginLeft)) marginLeft = 0
        offset.top += marginTop
        offset.left += marginLeft
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({top: Math.round(props.top), left: Math.round(props.left)})
            }
        }, offset), 0)
        $tip.addClass('in')
        var actualWidth = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight
        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
        }
        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)
        if (delta.left) offset.left += delta.left
        else offset.top += delta.top
        var isVertical = /top|bottom/.test(placement)
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
        $tip.offset(offset)
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
    }
    Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
        this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '')
    }
    Tooltip.prototype.setContent = function () {
        var $tip = this.tip()
        var title = this.getTitle()
        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }
    Tooltip.prototype.hide = function (callback) {
        var that = this
        var $tip = $(this.$tip)
        var e = $.Event('hide.bs.' + this.type)

        function complete() {
            if (that.hoverState != 'in') $tip.detach()
            if (that.$element) {
                that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type)
            }
            callback && callback()
        }

        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $tip.removeClass('in')
        $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete()
        this.hoverState = null
        return this
    }
    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element
        if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }
    Tooltip.prototype.hasContent = function () {
        return this.getTitle()
    }
    Tooltip.prototype.getPosition = function ($element) {
        $element = $element || this.$element
        var el = $element[0]
        var isBody = el.tagName == 'BODY'
        var elRect = el.getBoundingClientRect()
        if (elRect.width == null) {
            elRect = $.extend({}, elRect, {width: elRect.right - elRect.left, height: elRect.bottom - elRect.top})
        }
        var isSvg = window.SVGElement && el instanceof window.SVGElement
        var elOffset = isBody ? {top: 0, left: 0} : (isSvg ? null : $element.offset())
        var scroll = {scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()}
        var outerDims = isBody ? {width: $(window).width(), height: $(window).height()} : null
        return $.extend({}, elRect, scroll, outerDims, elOffset)
    }
    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'top' ? {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'left' ? {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
        } : {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
    }
    Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
        var delta = {top: 0, left: 0}
        if (!this.$viewport) return delta
        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
        var viewportDimensions = this.getPosition(this.$viewport)
        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
            if (topEdgeOffset < viewportDimensions.top) {
                delta.top = viewportDimensions.top - topEdgeOffset
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth
            if (leftEdgeOffset < viewportDimensions.left) {
                delta.left = viewportDimensions.left - leftEdgeOffset
            } else if (rightEdgeOffset > viewportDimensions.right) {
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
            }
        }
        return delta
    }
    Tooltip.prototype.getTitle = function () {
        var title
        var $e = this.$element
        var o = this.options
        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)
        return title
    }
    Tooltip.prototype.getUID = function (prefix) {
        do prefix += ~~(Math.random() * 1000000)
        while (document.getElementById(prefix))
        return prefix
    }
    Tooltip.prototype.tip = function () {
        if (!this.$tip) {
            this.$tip = $(this.options.template)
            if (this.$tip.length != 1) {
                throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
            }
        }
        return this.$tip
    }
    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
    }
    Tooltip.prototype.enable = function () {
        this.enabled = true
    }
    Tooltip.prototype.disable = function () {
        this.enabled = false
    }
    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    }
    Tooltip.prototype.toggle = function (e) {
        var self = this
        if (e) {
            self = $(e.currentTarget).data('bs.' + this.type)
            if (!self) {
                self = new this.constructor(e.currentTarget, this.getDelegateOptions())
                $(e.currentTarget).data('bs.' + this.type, self)
            }
        }
        if (e) {
            self.inState.click = !self.inState.click
            if (self.isInStateTrue()) self.enter(self)
            else self.leave(self)
        } else {
            self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
        }
    }
    Tooltip.prototype.destroy = function () {
        var that = this
        clearTimeout(this.timeout)
        this.hide(function () {
            that.$element.off('.' + that.type).removeData('bs.' + that.type)
            if (that.$tip) {
                that.$tip.detach()
            }
            that.$tip = null
            that.$arrow = null
            that.$viewport = null
            that.$element = null
        })
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.tooltip')
            var options = typeof option == 'object' && option
            if (!data && /destroy|hide/.test(option)) return
            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tooltip
    $.fn.tooltip = Plugin
    $.fn.tooltip.Constructor = Tooltip
    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old
        return this
    }
}(jQuery);
+function ($) {
    'use strict';
    var Popover = function (element, options) {
        this.init('popover', element, options)
    }
    if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
    Popover.VERSION = '3.3.7'
    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    })
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
    Popover.prototype.constructor = Popover
    Popover.prototype.getDefaults = function () {
        return Popover.DEFAULTS
    }
    Popover.prototype.setContent = function () {
        var $tip = this.tip()
        var title = this.getTitle()
        var content = this.getContent()
        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content').children().detach().end()[this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'](content)
        $tip.removeClass('fade top bottom left right in')
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }
    Popover.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }
    Popover.prototype.getContent = function () {
        var $e = this.$element
        var o = this.options
        return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content)
    }
    Popover.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.popover')
            var options = typeof option == 'object' && option
            if (!data && /destroy|hide/.test(option)) return
            if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.popover
    $.fn.popover = Plugin
    $.fn.popover.Constructor = Popover
    $.fn.popover.noConflict = function () {
        $.fn.popover = old
        return this
    }
}(jQuery);
+function ($) {
    'use strict';

    function ScrollSpy(element, options) {
        this.$body = $(document.body)
        this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options)
        this.selector = (this.options.target || '') + ' .nav li > a'
        this.offsets = []
        this.targets = []
        this.activeTarget = null
        this.scrollHeight = 0
        this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
        this.refresh()
        this.process()
    }

    ScrollSpy.VERSION = '3.3.7'
    ScrollSpy.DEFAULTS = {offset: 10}
    ScrollSpy.prototype.getScrollHeight = function () {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }
    ScrollSpy.prototype.refresh = function () {
        var that = this
        var offsetMethod = 'offset'
        var offsetBase = 0
        this.offsets = []
        this.targets = []
        this.scrollHeight = this.getScrollHeight()
        if (!$.isWindow(this.$scrollElement[0])) {
            offsetMethod = 'position'
            offsetBase = this.$scrollElement.scrollTop()
        }
        this.$body.find(this.selector).map(function () {
            var $el = $(this)
            var href = $el.data('target') || $el.attr('href')
            var $href = /^#./.test(href) && $(href)
            return ($href && $href.length && $href.is(':visible') && [[$href[offsetMethod]().top + offsetBase, href]]) || null
        }).sort(function (a, b) {
            return a[0] - b[0]
        }).each(function () {
            that.offsets.push(this[0])
            that.targets.push(this[1])
        })
    }
    ScrollSpy.prototype.process = function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
        var scrollHeight = this.getScrollHeight()
        var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height()
        var offsets = this.offsets
        var targets = this.targets
        var activeTarget = this.activeTarget
        var i
        if (this.scrollHeight != scrollHeight) {
            this.refresh()
        }
        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
        }
        if (activeTarget && scrollTop < offsets[0]) {
            this.activeTarget = null
            return this.clear()
        }
        for (i = offsets.length; i--;) {
            activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i])
        }
    }
    ScrollSpy.prototype.activate = function (target) {
        this.activeTarget = target
        this.clear()
        var selector = this.selector + '[data-target="' + target + '"],' +
            this.selector + '[href="' + target + '"]'
        var active = $(selector).parents('li').addClass('active')
        if (active.parent('.dropdown-menu').length) {
            active = active.closest('li.dropdown').addClass('active')
        }
        active.trigger('activate.bs.scrollspy')
    }
    ScrollSpy.prototype.clear = function () {
        $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active')
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.scrollspy')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.scrollspy
    $.fn.scrollspy = Plugin
    $.fn.scrollspy.Constructor = ScrollSpy
    $.fn.scrollspy.noConflict = function () {
        $.fn.scrollspy = old
        return this
    }
    $(window).on('load.bs.scrollspy.data-api', function () {
        $('[data-spy="scroll"]').each(function () {
            var $spy = $(this)
            Plugin.call($spy, $spy.data())
        })
    })
}(jQuery);
+function ($) {
    'use strict';
    var Tab = function (element) {
        this.element = $(element)
    }
    Tab.VERSION = '3.3.7'
    Tab.TRANSITION_DURATION = 150
    Tab.prototype.show = function () {
        var $this = this.element
        var $ul = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        if ($this.parent('li').hasClass('active')) return
        var $previous = $ul.find('.active:last a')
        var hideEvent = $.Event('hide.bs.tab', {relatedTarget: $this[0]})
        var showEvent = $.Event('show.bs.tab', {relatedTarget: $previous[0]})
        $previous.trigger(hideEvent)
        $this.trigger(showEvent)
        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return
        var $target = $(selector)
        this.activate($this.closest('li'), $ul)
        this.activate($target, $target.parent(), function () {
            $previous.trigger({type: 'hidden.bs.tab', relatedTarget: $this[0]})
            $this.trigger({type: 'shown.bs.tab', relatedTarget: $previous[0]})
        })
    }
    Tab.prototype.activate = function (element, container, callback) {
        var $active = container.find('> .active')
        var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

        function next() {
            $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false)
            element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true)
            if (transition) {
                element[0].offsetWidth
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }
            if (element.parent('.dropdown-menu').length) {
                element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true)
            }
            callback && callback()
        }

        $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next()
        $active.removeClass('in')
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.tab')
            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tab
    $.fn.tab = Plugin
    $.fn.tab.Constructor = Tab
    $.fn.tab.noConflict = function () {
        $.fn.tab = old
        return this
    }
    var clickHandler = function (e) {
        e.preventDefault()
        Plugin.call($(this), 'show')
    }
    $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)
}(jQuery);
+function ($) {
    'use strict';
    var Affix = function (element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options)
        this.$target = $(this.options.target).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this))
        this.$element = $(element)
        this.affixed = null
        this.unpin = null
        this.pinnedOffset = null
        this.checkPosition()
    }
    Affix.VERSION = '3.3.7'
    Affix.RESET = 'affix affix-top affix-bottom'
    Affix.DEFAULTS = {offset: 0, target: window}
    Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        var targetHeight = this.$target.height()
        if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false
        if (this.affixed == 'bottom') {
            if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
            return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
        }
        var initializing = this.affixed == null
        var colliderTop = initializing ? scrollTop : position.top
        var colliderHeight = initializing ? targetHeight : height
        if (offsetTop != null && scrollTop <= offsetTop) return 'top'
        if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'
        return false
    }
    Affix.prototype.getPinnedOffset = function () {
        if (this.pinnedOffset) return this.pinnedOffset
        this.$element.removeClass(Affix.RESET).addClass('affix')
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        return (this.pinnedOffset = position.top - scrollTop)
    }
    Affix.prototype.checkPositionWithEventLoop = function () {
        setTimeout($.proxy(this.checkPosition, this), 1)
    }
    Affix.prototype.checkPosition = function () {
        if (!this.$element.is(':visible')) return
        var height = this.$element.height()
        var offset = this.options.offset
        var offsetTop = offset.top
        var offsetBottom = offset.bottom
        var scrollHeight = Math.max($(document).height(), $(document.body).height())
        if (typeof offset != 'object') offsetBottom = offsetTop = offset
        if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element)
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
        var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)
        if (this.affixed != affix) {
            if (this.unpin != null) this.$element.css('top', '')
            var affixType = 'affix' + (affix ? '-' + affix : '')
            var e = $.Event(affixType + '.bs.affix')
            this.$element.trigger(e)
            if (e.isDefaultPrevented()) return
            this.affixed = affix
            this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
            this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
        }
        if (affix == 'bottom') {
            this.$element.offset({top: scrollHeight - height - offsetBottom})
        }
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.affix')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.affix
    $.fn.affix = Plugin
    $.fn.affix.Constructor = Affix
    $.fn.affix.noConflict = function () {
        $.fn.affix = old
        return this
    }
    $(window).on('load', function () {
        $('[data-spy="affix"]').each(function () {
            var $spy = $(this)
            var data = $spy.data()
            data.offset = data.offset || {}
            if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
            if (data.offsetTop != null) data.offset.top = data.offsetTop
            Plugin.call($spy, data)
        })
    })
}(jQuery);
(function ($) {
    $.scrollTo = $.fn.scrollTo = function (x, y, options) {
        if (!(this instanceof $)) return $.fn.scrollTo.apply($('html, body'), arguments);
        options = $.extend({}, {
            gap: {x: 0, y: 0},
            animation: {easing: 'swing', duration: 600, complete: $.noop, step: $.noop}
        }, options);
        return this.each(function () {
            var elem = $(this);
            elem.stop().animate({
                scrollLeft: !isNaN(Number(x)) ? x : $(x).offset().left + options.gap.x,
                scrollTop: !isNaN(Number(y)) ? y : $(y).offset().top + options.gap.y
            }, options.animation);
        });
    };
})(jQuery);
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    $.extend($.fn, {
        validate: function (options) {
            if (!this.length) {
                if (options && options.debug && window.console) {
                    console.warn("Nothing selected, can't validate, returning nothing.");
                }
                return;
            }
            var validator = $.data(this[0], "validator");
            if (validator) {
                return validator;
            }
            this.attr("novalidate", "novalidate");
            validator = new $.validator(options, this[0]);
            $.data(this[0], "validator", validator);
            if (validator.settings.onsubmit) {
                this.validateDelegate(":submit", "click", function (event) {
                    if (validator.settings.submitHandler) {
                        validator.submitButton = event.target;
                    }
                    if ($(event.target).hasClass("cancel")) {
                        validator.cancelSubmit = true;
                    }
                    if ($(event.target).attr("formnovalidate") !== undefined) {
                        validator.cancelSubmit = true;
                    }
                });
                this.submit(function (event) {
                    if (validator.settings.debug) {
                        event.preventDefault();
                    }

                    function handle() {
                        var hidden;
                        if (validator.settings.submitHandler) {
                            if (validator.submitButton) {
                                hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val($(validator.submitButton).val()).appendTo(validator.currentForm);
                            }
                            validator.settings.submitHandler.call(validator, validator.currentForm, event);
                            if (validator.submitButton) {
                                hidden.remove();
                            }
                            return false;
                        }
                        return true;
                    }

                    if (validator.cancelSubmit) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if (validator.form()) {
                        if (validator.pendingRequest) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }
            return validator;
        }, valid: function () {
            var valid, validator;
            if ($(this[0]).is("form")) {
                valid = this.validate().form();
            } else {
                valid = true;
                validator = $(this[0].form).validate();
                this.each(function () {
                    valid = validator.element(this) && valid;
                });
            }
            return valid;
        }, removeAttrs: function (attributes) {
            var result = {}, $element = this;
            $.each(attributes.split(/\s/), function (index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        }, rules: function (command, argument) {
            var element = this[0], settings, staticRules, existingRules, data, param, filtered;
            if (command) {
                settings = $.data(element.form, "validator").settings;
                staticRules = settings.rules;
                existingRules = $.validator.staticRules(element);
                switch (command) {
                    case"add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        delete existingRules.messages;
                        staticRules[element.name] = existingRules;
                        if (argument.messages) {
                            settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                        }
                        break;
                    case"remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        filtered = {};
                        $.each(argument.split(/\s/), function (index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                            if (method === "required") {
                                $(element).removeAttr("aria-required");
                            }
                        });
                        return filtered;
                }
            }
            data = $.validator.normalizeRules($.extend({}, $.validator.classRules(element), $.validator.attributeRules(element), $.validator.dataRules(element), $.validator.staticRules(element)), element);
            if (data.required) {
                param = data.required;
                delete data.required;
                data = $.extend({required: param}, data);
                $(element).attr("aria-required", "true");
            }
            if (data.remote) {
                param = data.remote;
                delete data.remote;
                data = $.extend(data, {remote: param});
            }
            return data;
        }
    });
    $.extend($.expr[":"], {
        blank: function (a) {
            return !$.trim("" + $(a).val());
        }, filled: function (a) {
            return !!$.trim("" + $(a).val());
        }, unchecked: function (a) {
            return !$(a).prop("checked");
        }
    });
    $.validator = function (options, form) {
        this.settings = $.extend(true, {}, $.validator.defaults, options);
        this.currentForm = form;
        this.init();
    };
    $.validator.format = function (source, params) {
        if (arguments.length === 1) {
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply(this, args);
            };
        }
        if (arguments.length > 2 && params.constructor !== Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor !== Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                return n;
            });
        });
        return source;
    };
    $.extend($.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: ":hidden",
            ignoreTitle: false,
            onfocusin: function (element) {
                this.lastActive = element;
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    if (this.settings.unhighlight) {
                        this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.hideThese(this.errorsFor(element));
                }
            },
            onfocusout: function (element) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                    this.element(element);
                }
            },
            onkeyup: function (element, event) {
                if (event.which === 9 && this.elementValue(element) === "") {
                    return;
                } else if (element.name in this.submitted || element === this.lastElement) {
                    this.element(element);
                }
            },
            onclick: function (element) {
                if (element.name in this.submitted) {
                    this.element(element);
                } else if (element.parentNode.name in this.submitted) {
                    this.element(element.parentNode);
                }
            },
            highlight: function (element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                } else {
                    $(element).addClass(errorClass).removeClass(validClass);
                }
            },
            unhighlight: function (element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                } else {
                    $(element).removeClass(errorClass).addClass(validClass);
                }
            }
        },
        setDefaults: function (settings) {
            $.extend($.validator.defaults, settings);
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date ( ISO ).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: $.validator.format("Please enter no more than {0} characters."),
            minlength: $.validator.format("Please enter at least {0} characters."),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
            range: $.validator.format("Please enter a value between {0} and {1}."),
            max: $.validator.format("Please enter a value less than or equal to {0}."),
            min: $.validator.format("Please enter a value greater than or equal to {0}.")
        },
        autoCreateRanges: false,
        prototype: {
            init: function () {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();
                var groups = (this.groups = {}), rules;
                $.each(this.settings.groups, function (key, value) {
                    if (typeof value === "string") {
                        value = value.split(/\s/);
                    }
                    $.each(value, function (index, name) {
                        groups[name] = key;
                    });
                });
                rules = this.settings.rules;
                $.each(rules, function (key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator"),
                        eventType = "on" + event.type.replace(/^validate/, ""), settings = validator.settings;
                    if (settings[eventType] && !this.is(settings.ignore)) {
                        settings[eventType].call(validator, this[0], event);
                    }
                }

                $(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, " + "[type='number'], [type='search'] ,[type='tel'], [type='url'], " + "[type='email'], [type='datetime'], [type='date'], [type='month'], " + "[type='week'], [type='time'], [type='datetime-local'], " + "[type='range'], [type='color'], [type='radio'], [type='checkbox']", "focusin focusout keyup", delegate).validateDelegate("select, option, [type='radio'], [type='checkbox']", "click", delegate);
                if (this.settings.invalidHandler) {
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
                }
                $(this.currentForm).find("[required], [data-rule-required], .required").attr("aria-required", "true");
            }, form: function () {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid()) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
                this.showErrors();
                return this.valid();
            }, checkForm: function () {
                this.prepareForm();
                for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                    this.check(elements[i]);
                }
                return this.valid();
            }, element: function (element) {
                var cleanElement = this.clean(element), checkElement = this.validationTargetFor(cleanElement),
                    result = true;
                this.lastElement = checkElement;
                if (checkElement === undefined) {
                    delete this.invalid[cleanElement.name];
                } else {
                    this.prepareElement(checkElement);
                    this.currentElements = $(checkElement);
                    result = this.check(checkElement) !== false;
                    if (result) {
                        delete this.invalid[checkElement.name];
                    } else {
                        this.invalid[checkElement.name] = true;
                    }
                }
                $(element).attr("aria-invalid", !result);
                if (!this.numberOfInvalids()) {
                    this.toHide = this.toHide.add(this.containers);
                }
                this.showErrors();
                return result;
            }, showErrors: function (errors) {
                if (errors) {
                    $.extend(this.errorMap, errors);
                    this.errorList = [];
                    for (var name in errors) {
                        this.errorList.push({message: errors[name], element: this.findByName(name)[0]});
                    }
                    this.successList = $.grep(this.successList, function (element) {
                        return !(element.name in errors);
                    });
                }
                if (this.settings.showErrors) {
                    this.settings.showErrors.call(this, this.errorMap, this.errorList);
                } else {
                    this.defaultShowErrors();
                }
            }, resetForm: function () {
                if ($.fn.resetForm) {
                    $(this.currentForm).resetForm();
                }
                this.submitted = {};
                this.lastElement = null;
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass).removeData("previousValue").removeAttr("aria-invalid");
            }, numberOfInvalids: function () {
                return this.objectLength(this.invalid);
            }, objectLength: function (obj) {
                var count = 0, i;
                for (i in obj) {
                    count++;
                }
                return count;
            }, hideErrors: function () {
                this.hideThese(this.toHide);
            }, hideThese: function (errors) {
                errors.not(this.containers).text("");
                this.addWrapper(errors).hide();
            }, valid: function () {
                return this.size() === 0;
            }, size: function () {
                return this.errorList.length;
            }, focusInvalid: function () {
                if (this.settings.focusInvalid) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin");
                    } catch (e) {
                    }
                }
            }, findLastActive: function () {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function (n) {
                    return n.element.name === lastActive.name;
                }).length === 1 && lastActive;
            }, elements: function () {
                var validator = this, rulesCache = {};
                return $(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function () {
                    if (!this.name && validator.settings.debug && window.console) {
                        console.error("%o has no name assigned", this);
                    }
                    if (this.name in rulesCache || !validator.objectLength($(this).rules())) {
                        return false;
                    }
                    rulesCache[this.name] = true;
                    return true;
                });
            }, clean: function (selector) {
                return $(selector)[0];
            }, errors: function () {
                var errorClass = this.settings.errorClass.split(" ").join(".");
                return $(this.settings.errorElement + "." + errorClass, this.errorContext);
            }, reset: function () {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.currentElements = $([]);
            }, prepareForm: function () {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            }, prepareElement: function (element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            }, elementValue: function (element) {
                var val, $element = $(element), type = element.type;
                if (type === "radio" || type === "checkbox") {
                    return $("input[name='" + element.name + "']:checked").val();
                } else if (type === "number" && typeof element.validity !== "undefined") {
                    return element.validity.badInput ? false : $element.val();
                }
                val = $element.val();
                if (typeof val === "string") {
                    return val.replace(/\r/g, "");
                }
                return val;
            }, check: function (element) {
                element = this.validationTargetFor(this.clean(element));
                var rules = $(element).rules(), rulesCount = $.map(rules, function (n, i) {
                    return i;
                }).length, dependencyMismatch = false, val = this.elementValue(element), result, method, rule;
                for (method in rules) {
                    rule = {method: method, parameters: rules[method]};
                    try {
                        result = $.validator.methods[method].call(this, val, element, rule.parameters);
                        if (result === "dependency-mismatch" && rulesCount === 1) {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;
                        if (result === "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }
                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        if (this.settings.debug && window.console) {
                            console.log("Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e);
                        }
                        throw e;
                    }
                }
                if (dependencyMismatch) {
                    return;
                }
                if (this.objectLength(rules)) {
                    this.successList.push(element);
                }
                return true;
            }, customDataMessage: function (element, method) {
                return $(element).data("msg" + method.charAt(0).toUpperCase() +
                    method.substring(1).toLowerCase()) || $(element).data("msg");
            }, customMessage: function (name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor === String ? m : m[method]);
            }, findDefined: function () {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        return arguments[i];
                    }
                }
                return undefined;
            }, defaultMessage: function (element, method) {
                return this.findDefined(this.customMessage(element.name, method), this.customDataMessage(element, method), !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[method], "<strong>Warning: No message defined for " + element.name + "</strong>");
            }, formatAndAdd: function (element, rule) {
                var message = this.defaultMessage(element, rule.method), theregex = /\$?\{(\d+)\}/g;
                if (typeof message === "function") {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
                }
                this.errorList.push({message: message, element: element, method: rule.method});
                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            }, addWrapper: function (toToggle) {
                if (this.settings.wrapper) {
                    toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
                }
                return toToggle;
            }, defaultShowErrors: function () {
                var i, elements, error;
                for (i = 0; this.errorList[i]; i++) {
                    error = this.errorList[i];
                    if (this.settings.highlight) {
                        this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    for (i = 0; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    for (i = 0, elements = this.validElements(); elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            }, validElements: function () {
                return this.currentElements.not(this.invalidElements());
            }, invalidElements: function () {
                return $(this.errorList).map(function () {
                    return this.element;
                });
            }, showLabel: function (element, message) {
                var place, group, errorID, error = this.errorsFor(element), elementID = this.idOrName(element),
                    describedBy = $(element).attr("aria-describedby");
                if (error.length) {
                    error.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                    error.html(message);
                } else {
                    error = $("<" + this.settings.errorElement + ">").attr("id", elementID + "-error").addClass(this.settings.errorClass).html(message || "");
                    place = error;
                    if (this.settings.wrapper) {
                        place = error.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (this.labelContainer.length) {
                        this.labelContainer.append(place);
                    } else if (this.settings.errorPlacement) {
                        this.settings.errorPlacement(place, $(element));
                    } else {
                        place.insertAfter(element);
                    }
                    if (error.is("label")) {
                        error.attr("for", elementID);
                    } else if (error.parents("label[for='" + elementID + "']").length === 0) {
                        errorID = error.attr("id");
                        if (!describedBy) {
                            describedBy = errorID;
                        } else if (!describedBy.match(new RegExp("\b" + errorID + "\b"))) {
                            describedBy += " " + errorID;
                        }
                        $(element).attr("aria-describedby", describedBy);
                        group = this.groups[element.name];
                        if (group) {
                            $.each(this.groups, function (name, testgroup) {
                                if (testgroup === group) {
                                    $("[name='" + name + "']", this.currentForm).attr("aria-describedby", error.attr("id"));
                                }
                            });
                        }
                    }
                }
                if (!message && this.settings.success) {
                    error.text("");
                    if (typeof this.settings.success === "string") {
                        error.addClass(this.settings.success);
                    } else {
                        this.settings.success(error, element);
                    }
                }
                this.toShow = this.toShow.add(error);
            }, errorsFor: function (element) {
                var name = this.idOrName(element), describer = $(element).attr("aria-describedby"),
                    selector = "label[for='" + name + "'], label[for='" + name + "'] *";
                if (describer) {
                    selector = selector + ", #" + describer.replace(/\s+/g, ", #");
                }
                return this.errors().filter(selector);
            }, idOrName: function (element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            }, validationTargetFor: function (element) {
                if (this.checkable(element)) {
                    element = this.findByName(element.name).not(this.settings.ignore)[0];
                }
                return element;
            }, checkable: function (element) {
                return (/radio|checkbox/i).test(element.type);
            }, findByName: function (name) {
                return $(this.currentForm).find("[name='" + name + "']");
            }, getLength: function (value, element) {
                switch (element.nodeName.toLowerCase()) {
                    case"select":
                        return $("option:selected", element).length;
                    case"input":
                        if (this.checkable(element)) {
                            return this.findByName(element.name).filter(":checked").length;
                        }
                }
                return value.length;
            }, depend: function (param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            }, dependTypes: {
                "boolean": function (param) {
                    return param;
                }, "string": function (param, element) {
                    return !!$(param, element.form).length;
                }, "function": function (param, element) {
                    return param(element);
                }
            }, optional: function (element) {
                var val = this.elementValue(element);
                return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
            }, startRequest: function (element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            }, stopRequest: function (element, valid) {
                this.pendingRequest--;
                if (this.pendingRequest < 0) {
                    this.pendingRequest = 0;
                }
                delete this.pending[element.name];
                if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                    this.formSubmitted = false;
                } else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false;
                }
            }, previousValue: function (element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, "remote")
                });
            }
        },
        classRuleSettings: {
            required: {required: true},
            email: {email: true},
            url: {url: true},
            date: {date: true},
            dateISO: {dateISO: true},
            number: {number: true},
            digits: {digits: true},
            creditcard: {creditcard: true}
        },
        addClassRules: function (className, rules) {
            if (className.constructor === String) {
                this.classRuleSettings[className] = rules;
            } else {
                $.extend(this.classRuleSettings, className);
            }
        },
        classRules: function (element) {
            var rules = {}, classes = $(element).attr("class");
            if (classes) {
                $.each(classes.split(" "), function () {
                    if (this in $.validator.classRuleSettings) {
                        $.extend(rules, $.validator.classRuleSettings[this]);
                    }
                });
            }
            return rules;
        },
        attributeRules: function (element) {
            var rules = {}, $element = $(element), type = element.getAttribute("type"), method, value;
            for (method in $.validator.methods) {
                if (method === "required") {
                    value = element.getAttribute(method);
                    if (value === "") {
                        value = true;
                    }
                    value = !!value;
                } else {
                    value = $element.attr(method);
                }
                if (/min|max/.test(method) && (type === null || /number|range|text/.test(type))) {
                    value = Number(value);
                }
                if (value || value === 0) {
                    rules[method] = value;
                } else if (type === method && type !== "range") {
                    rules[method] = true;
                }
            }
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }
            return rules;
        },
        dataRules: function (element) {
            var method, value, rules = {}, $element = $(element);
            for (method in $.validator.methods) {
                value = $element.data("rule" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase());
                if (value !== undefined) {
                    rules[method] = value;
                }
            }
            return rules;
        },
        staticRules: function (element) {
            var rules = {}, validator = $.data(element.form, "validator");
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },
        normalizeRules: function (rules, element) {
            $.each(rules, function (prop, val) {
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case"string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case"function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });
            $.each(rules, function (rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });
            $.each(["minlength", "maxlength"], function () {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(["rangelength", "range"], function () {
                var parts;
                if (rules[this]) {
                    if ($.isArray(rules[this])) {
                        rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                    } else if (typeof rules[this] === "string") {
                        parts = rules[this].replace(/[\[\]]/g, "").split(/[\s,]+/);
                        rules[this] = [Number(parts[0]), Number(parts[1])];
                    }
                }
            });
            if ($.validator.autoCreateRanges) {
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }
            return rules;
        },
        normalizeRule: function (data) {
            if (typeof data === "string") {
                var transformed = {};
                $.each(data.split(/\s/), function () {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },
        addMethod: function (name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },
        methods: {
            required: function (value, element, param) {
                if (!this.depend(param, element)) {
                    return "dependency-mismatch";
                }
                if (element.nodeName.toLowerCase() === "select") {
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                if (this.checkable(element)) {
                    return this.getLength(value, element) > 0;
                }
                return $.trim(value).length > 0;
            }, email: function (value, element) {
                return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
            }, url: function (value, element) {
                return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            }, date: function (value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
            }, dateISO: function (value, element) {
                return this.optional(element) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
            }, number: function (value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            }, digits: function (value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            }, creditcard: function (value, element) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                if (/[^0-9 \-]+/.test(value)) {
                    return false;
                }
                var nCheck = 0, nDigit = 0, bEven = false, n, cDigit;
                value = value.replace(/\D/g, "");
                if (value.length < 13 || value.length > 19) {
                    return false;
                }
                for (n = value.length - 1; n >= 0; n--) {
                    cDigit = value.charAt(n);
                    nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9) {
                            nDigit -= 9;
                        }
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }
                return (nCheck % 10) === 0;
            }, minlength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length >= param;
            }, maxlength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length <= param;
            }, rangelength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || (length >= param[0] && length <= param[1]);
            }, min: function (value, element, param) {
                return this.optional(element) || value >= param;
            }, max: function (value, element, param) {
                return this.optional(element) || value <= param;
            }, range: function (value, element, param) {
                return this.optional(element) || (value >= param[0] && value <= param[1]);
            }, equalTo: function (value, element, param) {
                var target = $(param);
                if (this.settings.onfocusout) {
                    target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function () {
                        $(element).valid();
                    });
                }
                return value === target.val();
            }, remote: function (value, element, param) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                var previous = this.previousValue(element), validator, data;
                if (!this.settings.messages[element.name]) {
                    this.settings.messages[element.name] = {};
                }
                previous.originalMessage = this.settings.messages[element.name].remote;
                this.settings.messages[element.name].remote = previous.message;
                param = typeof param === "string" && {url: param} || param;
                if (previous.old === value) {
                    return previous.valid;
                }
                previous.old = value;
                validator = this;
                this.startRequest(element);
                data = {};
                data[element.name] = value;
                $.ajax($.extend(true, {
                    url: param,
                    mode: "abort",
                    port: "validate" + element.name,
                    dataType: "json",
                    data: data,
                    context: validator.currentForm,
                    success: function (response) {
                        var valid = response === true || response === "true", errors, message, submitted;
                        validator.settings.messages[element.name].remote = previous.originalMessage;
                        if (valid) {
                            submitted = validator.formSubmitted;
                            validator.prepareElement(element);
                            validator.formSubmitted = submitted;
                            validator.successList.push(element);
                            delete validator.invalid[element.name];
                            validator.showErrors();
                        } else {
                            errors = {};
                            message = response || validator.defaultMessage(element, "remote");
                            errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                            validator.invalid[element.name] = true;
                            validator.showErrors(errors);
                        }
                        previous.valid = valid;
                        validator.stopRequest(element, valid);
                    }
                }, param));
                return "pending";
            }
        }
    });
    $.format = function deprecated() {
        throw"$.format has been deprecated. Please use $.validator.format instead.";
    };
    var pendingRequests = {}, ajax;
    if ($.ajaxPrefilter) {
        $.ajaxPrefilter(function (settings, _, xhr) {
            var port = settings.port;
            if (settings.mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = xhr;
            }
        });
    } else {
        ajax = $.ajax;
        $.ajax = function (settings) {
            var mode = ("mode" in settings ? settings : $.ajaxSettings).mode,
                port = ("port" in settings ? settings : $.ajaxSettings).port;
            if (mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = ajax.apply(this, arguments);
                return pendingRequests[port];
            }
            return ajax.apply(this, arguments);
        };
    }
    $.extend($.fn, {
        validateDelegate: function (delegate, type, handler) {
            return this.bind(type, function (event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        }
    });
}));

function RepositionNav() {
    var windowHeight = $(window).height();
    var navHeight = $('#nav').height() / 2;
    var windowCenter = (windowHeight / 2);
    var newtop = windowCenter - navHeight;
    $('#nav').css({"top": newtop});
}

(function ($) {
    $.fn.parallax = function (xpos, adjuster, inertia, outerHeight) {
        function inView(pos, element) {
            element.each(function () {
                var element = $(this);
                var top = element.offset().top;
                if (outerHeight == true) {
                    var height = element.outerHeight(true);
                } else {
                    var height = element.height();
                }
                if (top + height >= pos && top + height - windowHeight < pos) {
                    move(pos, height);
                }
                if (top <= pos && (top + height) >= pos && (top - windowHeight) < pos && top + height - windowHeight > pos) {
                    move(pos, height);
                }
                if (top + height > pos && top - windowHeight < pos && top > pos) {
                    move(pos, height);
                }
            });
        }

        var $window = $(window);
        var windowHeight = $(window).height();
        var pos = $window.scrollTop();
        var $this = $(this);
        if (xpos == null) {
            xpos = "50%"
        }
        if (adjuster == null) {
            adjuster = 0
        }
        if (inertia == null) {
            inertia = 0.1
        }
        if (outerHeight == null) {
            outerHeight = true
        }
        height = $this.height();
        $this.css({'backgroundPosition': newPos(xpos, outerHeight, adjuster, inertia)});

        function newPos(xpos, windowHeight, pos, adjuster, inertia) {
            return xpos + " " + Math.round((-((windowHeight + pos) - adjuster) * inertia)) + "px";
        }

        function move(pos, height) {
            $this.css({'backgroundPosition': newPos(xpos, height, pos, adjuster, inertia)});
        }

        $window.bind('scroll', function () {
            var pos = $window.scrollTop();
            inView(pos, $this);
            $('#pixels').html(pos);
        })
    }
})(jQuery);
(function (d) {
    var g = -1, e = -1, n = function (a) {
        var b = null, c = [];
        d(a).each(function () {
            var a = d(this), k = a.offset().top - h(a.css("margin-top")), l = 0 < c.length ? c[c.length - 1] : null;
            null === l ? c.push(a) : 1 >= Math.floor(Math.abs(b - k)) ? c[c.length - 1] = l.add(a) : c.push(a);
            b = k
        });
        return c
    }, h = function (a) {
        return parseFloat(a) || 0
    }, b = d.fn.matchHeight = function (a) {
        if ("remove" === a) {
            var f = this;
            this.css("height", "");
            d.each(b._groups, function (a, b) {
                b.elements = b.elements.not(f)
            });
            return this
        }
        if (1 >= this.length) return this;
        a = "undefined" !== typeof a ? a : !0;
        b._groups.push({elements: this, byRow: a});
        b._apply(this, a);
        return this
    };
    b._groups = [];
    b._throttle = 80;
    b._maintainScroll = !1;
    b._beforeUpdate = null;
    b._afterUpdate = null;
    b._apply = function (a, f) {
        var c = d(a), e = [c], k = d(window).scrollTop(), l = d("html").outerHeight(!0),
            g = c.parents().filter(":hidden");
        g.css("display", "block");
        f && (c.each(function () {
            var a = d(this), b = "inline-block" === a.css("display") ? "inline-block" : "block";
            a.data("style-cache", a.attr("style"));
            a.css({
                display: b,
                "padding-top": "0",
                "padding-bottom": "0",
                "margin-top": "0",
                "margin-bottom": "0",
                "border-top-width": "0",
                "border-bottom-width": "0",
                height: "100px"
            })
        }), e = n(c), c.each(function () {
            var a = d(this);
            a.attr("style", a.data("style-cache") || "").css("height", "")
        }));
        d.each(e, function (a, b) {
            var c = d(b), e = 0;
            f && 1 >= c.length || (c.each(function () {
                var a = d(this), b = "inline-block" === a.css("display") ? "inline-block" : "block";
                a.css({display: b, height: ""});
                a.outerHeight(!1) > e && (e = a.outerHeight(!1));
                a.css("display", "")
            }), c.each(function () {
                var a = d(this), b = 0;
                "border-box" !== a.css("box-sizing") && (b += h(a.css("border-top-width")) + h(a.css("border-bottom-width")), b += h(a.css("padding-top")) + h(a.css("padding-bottom")));
                a.css("height", e - b)
            }))
        });
        g.css("display", "");
        b._maintainScroll && d(window).scrollTop(k / l * d("html").outerHeight(!0));
        return this
    };
    b._applyDataApi = function () {
        var a = {};
        d("[data-match-height], [data-mh]").each(function () {
            var b = d(this), c = b.attr("data-match-height") || b.attr("data-mh");
            a[c] = c in a ? a[c].add(b) : b
        });
        d.each(a, function () {
            this.matchHeight(!0)
        })
    };
    var m = function (a) {
        b._beforeUpdate && b._beforeUpdate(a, b._groups);
        d.each(b._groups, function () {
            b._apply(this.elements, this.byRow)
        });
        b._afterUpdate && b._afterUpdate(a, b._groups)
    };
    b._update = function (a, f) {
        if (f && "resize" === f.type) {
            var c = d(window).width();
            if (c === g) return;
            g = c
        }
        a ? -1 === e && (e = setTimeout(function () {
            m(f);
            e = -1
        }, b._throttle)) : m(f)
    };
    d(b._applyDataApi);
    d(window).bind("load", function (a) {
        b._update(!1, a)
    });
    d(window).bind("resize orientationchange", function (a) {
        b._update(!0, a)
    })
})(jQuery);
(function ($) {
    $.fn.extend({
        hideMaxListItems: function (options) {
            var defaults = {
                max: 3,
                speed: 1000,
                moreText: 'View More',
                lessText: 'View Less',
                moreHTML: '<p class="maxlist-more"><a href="#"></a></p>',
            };
            var options = $.extend(defaults, options);
            return this.each(function () {
                var op = options;
                var totalListItems = $(this).children("li").length;
                var speedPerLI;
                if (totalListItems > 0 && op.speed > 0) {
                    speedPerLI = Math.round(op.speed / totalListItems);
                    if (speedPerLI < 1) {
                        speedPerLI = 1;
                    }
                } else {
                    speedPerLI = 0;
                }
                if ((totalListItems > 0) && (totalListItems > op.max)) {
                    $(this).children("li").each(function (index) {
                        if ((index + 1) > op.max) {
                            $(this).hide(0);
                            $(this).addClass('maxlist-hidden');
                        }
                    });
                    var howManyMore = totalListItems - op.max;
                    var newMoreText = op.moreText;
                    var newLessText = op.lessText;
                    if (howManyMore > 0) {
                        newMoreText = newMoreText.replace("[COUNT]", howManyMore);
                        newLessText = newLessText.replace("[COUNT]", howManyMore);
                    }
                    $(this).after(op.moreHTML);
                    $(this).next(".maxlist-more").children("a").text(newMoreText);
                    $(this).next(".maxlist-more").children("a").click(function (e) {
                        var listElements = $(this).parent().prev("ul, ol").children("li");
                        listElements = listElements.slice(op.max);
                        if ($(this).text() == newMoreText) {
                            $(this).text(newLessText);
                            var i = 0;
                            (function () {
                                $(listElements[i++] || []).slideToggle(speedPerLI, arguments.callee);
                            })();
                        }
                        else {
                            $(this).text(newMoreText);
                            var i = listElements.length - 1;
                            (function () {
                                $(listElements[i--] || []).slideToggle(speedPerLI, arguments.callee);
                            })();
                        }
                        e.preventDefault();
                    });
                }
            });
        }
    });
})(jQuery);
!function (e) {
    e.fn.niceSelect = function (t) {
        function s(t) {
            t.after(e("<div></div>").addClass("nice-select").addClass(t.attr("class") || "").addClass(t.attr("disabled") ? "disabled" : "").attr("tabindex", t.attr("disabled") ? null : "0").html('<span class="current"></span><ul class="list"></ul>'));
            var s = t.next(), n = t.find("option"), i = t.find("option:selected");
            s.find(".current").html(i.data("display") || i.text()), n.each(function (t) {
                var n = e(this), i = n.data("display");
                s.find("ul").append(e("<li></li>").attr("data-value", n.val()).attr("data-display", i || null).addClass("option" + (n.is(":selected") ? " selected" : "") + (n.is(":disabled") ? " disabled" : "")).html(n.text()))
            })
        }

        if ("string" == typeof t) return "update" == t ? this.each(function () {
            var t = e(this), n = e(this).next(".nice-select"), i = n.hasClass("open");
            n.length && (n.remove(), s(t), i && t.next().trigger("click"))
        }) : "destroy" == t ? (this.each(function () {
            var t = e(this), s = e(this).next(".nice-select");
            s.length && (s.remove(), t.css("display", ""))
        }), 0 == e(".nice-select").length && e(document).off(".nice_select")) : console.log('Method "' + t + '" does not exist.'), this;
        this.hide(), this.each(function () {
            var t = e(this);
            t.next().hasClass("nice-select") || s(t)
        }), e(document).off(".nice_select"), e(document).on("click.nice_select", ".nice-select", function (t) {
            var s = e(this);
            e(".nice-select").not(s).removeClass("open"), s.toggleClass("open"), s.hasClass("open") ? (s.find(".option"), s.find(".focus").removeClass("focus"), s.find(".selected").addClass("focus")) : s.focus()
        }), e(document).on("click.nice_select", function (t) {
            0 === e(t.target).closest(".nice-select").length && e(".nice-select").removeClass("open").find(".option")
        }), e(document).on("click.nice_select", ".nice-select .option:not(.disabled)", function (t) {
            var s = e(this), n = s.closest(".nice-select");
            n.find(".selected").removeClass("selected"), s.addClass("selected");
            var i = s.data("display") || s.text();
            n.find(".current").text(i), n.prev("select").val(s.data("value")).trigger("change")
        }), e(document).on("keydown.nice_select", ".nice-select", function (t) {
            var s = e(this), n = e(s.find(".focus") || s.find(".list .option.selected"));
            if (32 == t.keyCode || 13 == t.keyCode) return s.hasClass("open") ? n.trigger("click") : s.trigger("click"), !1;
            if (40 == t.keyCode) {
                if (s.hasClass("open")) {
                    var i = n.nextAll(".option:not(.disabled)").first();
                    i.length > 0 && (s.find(".focus").removeClass("focus"), i.addClass("focus"))
                } else s.trigger("click");
                return !1
            }
            if (38 == t.keyCode) {
                if (s.hasClass("open")) {
                    var l = n.prevAll(".option:not(.disabled)").first();
                    l.length > 0 && (s.find(".focus").removeClass("focus"), l.addClass("focus"))
                } else s.trigger("click");
                return !1
            }
            if (27 == t.keyCode) s.hasClass("open") && s.trigger("click"); else if (9 == t.keyCode && s.hasClass("open")) return !1
        });
        var n = document.createElement("a").style;
        return n.cssText = "pointer-events:auto", "auto" !== n.pointerEvents && e("html").addClass("no-csspointerevents"), this
    }
}(jQuery);
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function (jQuery) {
    "use strict";
    var domfocus = false, mousefocus = false, tabindexcounter = 0, ascrailcounter = 2000, globalmaxzindex = 0;
    var $ = jQuery, _doc = document, _win = window, $window = $(_win);
    var delegatevents = [];

    function getScriptPath() {
        var scripts = _doc.currentScript || (function () {
            var s = _doc.getElementsByTagName('script');
            return (s.length) ? s[s.length - 1] : false;
        })();
        var path = scripts ? scripts.src.split('?')[0] : '';
        return (path.split('/').length > 0) ? path.split('/').slice(0, -1).join('/') + '/' : '';
    }

    var setAnimationFrame = _win.requestAnimationFrame || _win.webkitRequestAnimationFrame || _win.mozRequestAnimationFrame || false;
    var clearAnimationFrame = _win.cancelAnimationFrame || _win.webkitCancelAnimationFrame || _win.mozCancelAnimationFrame || false;
    if (!setAnimationFrame) {
        var anilasttime = 0;
        setAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - anilasttime));
            var id = _win.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            anilasttime = currTime + timeToCall;
            return id;
        };
        clearAnimationFrame = function (id) {
            _win.clearTimeout(id);
        };
    } else {
        if (!_win.cancelAnimationFrame) clearAnimationFrame = function (id) {
        };
    }
    var ClsMutationObserver = _win.MutationObserver || _win.WebKitMutationObserver || false;
    var now = Date.now || function () {
        return new Date().getTime();
    };
    var _globaloptions = {
        zindex: "auto",
        cursoropacitymin: 0,
        cursoropacitymax: 1,
        cursorcolor: "#424242",
        cursorwidth: "6px",
        cursorborder: "1px solid #fff",
        cursorborderradius: "5px",
        scrollspeed: 40,
        mousescrollstep: 9 * 3,
        touchbehavior: false,
        emulatetouch: false,
        hwacceleration: true,
        usetransition: true,
        boxzoom: false,
        dblclickzoom: true,
        gesturezoom: true,
        grabcursorenabled: true,
        autohidemode: true,
        background: "",
        iframeautoresize: true,
        cursorminheight: 32,
        preservenativescrolling: true,
        railoffset: false,
        railhoffset: false,
        bouncescroll: true,
        spacebarenabled: true,
        railpadding: {top: 0, right: 0, left: 0, bottom: 0},
        disableoutline: true,
        horizrailenabled: true,
        railalign: "right",
        railvalign: "bottom",
        enabletranslate3d: true,
        enablemousewheel: true,
        enablekeyboard: true,
        smoothscroll: true,
        sensitiverail: true,
        enablemouselockapi: true,
        cursorfixedheight: false,
        directionlockdeadzone: 6,
        hidecursordelay: 400,
        nativeparentscrolling: true,
        enablescrollonselection: true,
        overflowx: true,
        overflowy: true,
        cursordragspeed: 0.3,
        rtlmode: "auto",
        cursordragontouch: false,
        oneaxismousemode: "auto",
        scriptpath: getScriptPath(),
        preventmultitouchscrolling: true,
        disablemutationobserver: false,
        enableobserver: true,
        scrollbarid: false
    };
    var browserdetected = false;
    var getBrowserDetection = function () {
        if (browserdetected) return browserdetected;
        var _el = _doc.createElement('DIV'), _style = _el.style, _agent = navigator.userAgent,
            _platform = navigator.platform, d = {};
        d.haspointerlock = "pointerLockElement" in _doc || "webkitPointerLockElement" in _doc || "mozPointerLockElement" in _doc;
        d.isopera = ("opera" in _win);
        d.isopera12 = (d.isopera && ("getUserMedia" in navigator));
        d.isoperamini = (Object.prototype.toString.call(_win.operamini) === "[object OperaMini]");
        d.isie = (("all" in _doc) && ("attachEvent" in _el) && !d.isopera);
        d.isieold = (d.isie && !("msInterpolationMode" in _style));
        d.isie7 = d.isie && !d.isieold && (!("documentMode" in _doc) || (_doc.documentMode === 7));
        d.isie8 = d.isie && ("documentMode" in _doc) && (_doc.documentMode === 8);
        d.isie9 = d.isie && ("performance" in _win) && (_doc.documentMode === 9);
        d.isie10 = d.isie && ("performance" in _win) && (_doc.documentMode === 10);
        d.isie11 = ("msRequestFullscreen" in _el) && (_doc.documentMode >= 11);
        d.ismsedge = ("msCredentials" in _win);
        d.ismozilla = ("MozAppearance" in _style);
        d.iswebkit = !d.ismsedge && ("WebkitAppearance" in _style);
        d.ischrome = d.iswebkit && ("chrome" in _win);
        d.ischrome38 = (d.ischrome && ("touchAction" in _style));
        d.ischrome22 = (!d.ischrome38) && (d.ischrome && d.haspointerlock);
        d.ischrome26 = (!d.ischrome38) && (d.ischrome && ("transition" in _style));
        d.cantouch = ("ontouchstart" in _doc.documentElement) || ("ontouchstart" in _win);
        d.hasw3ctouch = (_win.PointerEvent || false) && ((navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        d.hasmstouch = (!d.hasw3ctouch) && (_win.MSPointerEvent || false);
        d.ismac = /^mac$/i.test(_platform);
        d.isios = d.cantouch && /iphone|ipad|ipod/i.test(_platform);
        d.isios4 = d.isios && !("seal" in Object);
        d.isios7 = d.isios && ("webkitHidden" in _doc);
        d.isios8 = d.isios && ("hidden" in _doc);
        d.isios10 = d.isios && _win.Proxy;
        d.isandroid = (/android/i.test(_agent));
        d.haseventlistener = ("addEventListener" in _el);
        d.trstyle = false;
        d.hastransform = false;
        d.hastranslate3d = false;
        d.transitionstyle = false;
        d.hastransition = false;
        d.transitionend = false;
        d.trstyle = "transform";
        d.hastransform = ("transform" in _style) || (function () {
            var check = ['msTransform', 'webkitTransform', 'MozTransform', 'OTransform'];
            for (var a = 0, c = check.length; a < c; a++) {
                if (_style[check[a]] !== undefined) {
                    d.trstyle = check[a];
                    break;
                }
            }
            d.hastransform = (!!d.trstyle);
        })();
        if (d.hastransform) {
            _style[d.trstyle] = "translate3d(1px,2px,3px)";
            d.hastranslate3d = /translate3d/.test(_style[d.trstyle]);
        }
        d.transitionstyle = "transition";
        d.prefixstyle = '';
        d.transitionend = "transitionend";
        d.hastransition = ("transition" in _style) || (function () {
            d.transitionend = false;
            var check = ['webkitTransition', 'msTransition', 'MozTransition', 'OTransition', 'OTransition', 'KhtmlTransition'];
            var prefix = ['-webkit-', '-ms-', '-moz-', '-o-', '-o', '-khtml-'];
            var evs = ['webkitTransitionEnd', 'msTransitionEnd', 'transitionend', 'otransitionend', 'oTransitionEnd', 'KhtmlTransitionEnd'];
            for (var a = 0, c = check.length; a < c; a++) {
                if (check[a] in _style) {
                    d.transitionstyle = check[a];
                    d.prefixstyle = prefix[a];
                    d.transitionend = evs[a];
                    break;
                }
            }
            if (d.ischrome26) d.prefixstyle = prefix[1];
            d.hastransition = (d.transitionstyle);
        })();

        function detectCursorGrab() {
            var lst = ['grab', '-webkit-grab', '-moz-grab'];
            if ((d.ischrome && !d.ischrome38) || d.isie) lst = [];
            for (var a = 0, l = lst.length; a < l; a++) {
                var p = lst[a];
                _style.cursor = p;
                if (_style.cursor == p) return p;
            }
            return 'url(https://cdnjs.cloudflare.com/ajax/libs/slider-pro/1.3.0/css/images/openhand.cur),n-resize';
        }

        d.cursorgrabvalue = detectCursorGrab();
        d.hasmousecapture = ("setCapture" in _el);
        d.hasMutationObserver = (ClsMutationObserver !== false);
        _el = null;
        browserdetected = d;
        return d;
    };
    var NiceScrollClass = function (myopt, me) {
        var self = this;
        this.version = '3.7.6';
        this.name = 'nicescroll';
        this.me = me;
        var $body = $("body");
        var opt = this.opt = {doc: $body, win: false};
        $.extend(opt, _globaloptions);
        opt.snapbackspeed = 80;
        if (myopt || false) {
            for (var a in opt) {
                if (myopt[a] !== undefined) opt[a] = myopt[a];
            }
        }
        if (opt.disablemutationobserver) ClsMutationObserver = false;
        this.doc = opt.doc;
        this.iddoc = (this.doc && this.doc[0]) ? this.doc[0].id || '' : '';
        this.ispage = /^BODY|HTML/.test((opt.win) ? opt.win[0].nodeName : this.doc[0].nodeName);
        this.haswrapper = (opt.win !== false);
        this.win = opt.win || (this.ispage ? $window : this.doc);
        this.docscroll = (this.ispage && !this.haswrapper) ? $window : this.win;
        this.body = $body;
        this.viewport = false;
        this.isfixed = false;
        this.iframe = false;
        this.isiframe = ((this.doc[0].nodeName == 'IFRAME') && (this.win[0].nodeName == 'IFRAME'));
        this.istextarea = (this.win[0].nodeName == 'TEXTAREA');
        this.forcescreen = false;
        this.canshowonmouseevent = (opt.autohidemode != "scroll");
        this.onmousedown = false;
        this.onmouseup = false;
        this.onmousemove = false;
        this.onmousewheel = false;
        this.onkeypress = false;
        this.ongesturezoom = false;
        this.onclick = false;
        this.onscrollstart = false;
        this.onscrollend = false;
        this.onscrollcancel = false;
        this.onzoomin = false;
        this.onzoomout = false;
        this.view = false;
        this.page = false;
        this.scroll = {x: 0, y: 0};
        this.scrollratio = {x: 0, y: 0};
        this.cursorheight = 20;
        this.scrollvaluemax = 0;
        if (opt.rtlmode == "auto") {
            var target = this.win[0] == _win ? this.body : this.win;
            var writingMode = target.css("writing-mode") || target.css("-webkit-writing-mode") || target.css("-ms-writing-mode") || target.css("-moz-writing-mode");
            if (writingMode == "horizontal-tb" || writingMode == "lr-tb" || writingMode === "") {
                this.isrtlmode = (target.css("direction") == "rtl");
                this.isvertical = false;
            } else {
                this.isrtlmode = (writingMode == "vertical-rl" || writingMode == "tb" || writingMode == "tb-rl" || writingMode == "rl-tb");
                this.isvertical = (writingMode == "vertical-rl" || writingMode == "tb" || writingMode == "tb-rl");
            }
        } else {
            this.isrtlmode = (opt.rtlmode === true);
            this.isvertical = false;
        }
        this.scrollrunning = false;
        this.scrollmom = false;
        this.observer = false;
        this.observerremover = false;
        this.observerbody = false;
        if (opt.scrollbarid !== false) {
            this.id = opt.scrollbarid;
        } else {
            do {
                this.id = "ascrail" + (ascrailcounter++);
            } while (_doc.getElementById(this.id));
        }
        this.rail = false;
        this.cursor = false;
        this.cursorfreezed = false;
        this.selectiondrag = false;
        this.zoom = false;
        this.zoomactive = false;
        this.hasfocus = false;
        this.hasmousefocus = false;
        this.railslocked = false;
        this.locked = false;
        this.hidden = false;
        this.cursoractive = true;
        this.wheelprevented = false;
        this.overflowx = opt.overflowx;
        this.overflowy = opt.overflowy;
        this.nativescrollingarea = false;
        this.checkarea = 0;
        this.events = [];
        this.saved = {};
        this.delaylist = {};
        this.synclist = {};
        this.lastdeltax = 0;
        this.lastdeltay = 0;
        this.detected = getBrowserDetection();
        var cap = $.extend({}, this.detected);
        this.canhwscroll = (cap.hastransform && opt.hwacceleration);
        this.ishwscroll = (this.canhwscroll && self.haswrapper);
        if (!this.isrtlmode) {
            this.hasreversehr = false;
        } else if (this.isvertical) {
            this.hasreversehr = !(cap.iswebkit || cap.isie || cap.isie11);
        } else {
            this.hasreversehr = !(cap.iswebkit || (cap.isie && !cap.isie10 && !cap.isie11));
        }
        this.istouchcapable = false;//## Check WebKit-based desktop with touch support
//## + Firefox 18 nightly build (desktop) false positive (or desktop with touch support)
        if (!cap.cantouch && (cap.hasw3ctouch || cap.hasmstouch)) {
            this.istouchcapable = true;
        } else if (cap.cantouch && !cap.isios && !cap.isandroid && (cap.iswebkit || cap.ismozilla)) {
            this.istouchcapable = true;
        }//## disable MouseLock API on user request
        if (!opt.enablemouselockapi) {
            cap.hasmousecapture = false;
            cap.haspointerlock = false;
        }
        this.debounced = function (name, fn, tm) {
            if (!self) return;
            var dd = self.delaylist[name] || false;
            if (!dd) {
                self.delaylist[name] = {
                    h: setAnimationFrame(function () {
                        self.delaylist[name].fn.call(self);
                        self.delaylist[name] = false;
                    }, tm)
                };
                fn.call(self);
            }
            self.delaylist[name].fn = fn;
        };
        this.synched = function (name, fn) {
            if (self.synclist[name]) self.synclist[name] = fn; else {
                self.synclist[name] = fn;
                setAnimationFrame(function () {
                    if (!self) return;
                    self.synclist[name] && self.synclist[name].call(self);
                    self.synclist[name] = null;
                });
            }
        };
        this.unsynched = function (name) {
            if (self.synclist[name]) self.synclist[name] = false;
        };
        this.css = function (el, pars) {
            for (var n in pars) {
                self.saved.css.push([el, n, el.css(n)]);
                el.css(n, pars[n]);
            }
        };
        this.scrollTop = function (val) {
            return (val === undefined) ? self.getScrollTop() : self.setScrollTop(val);
        };
        this.scrollLeft = function (val) {
            return (val === undefined) ? self.getScrollLeft() : self.setScrollLeft(val);
        };
        var BezierClass = function (st, ed, spd, p1, p2, p3, p4) {
            this.st = st;
            this.ed = ed;
            this.spd = spd;
            this.p1 = p1 || 0;
            this.p2 = p2 || 1;
            this.p3 = p3 || 0;
            this.p4 = p4 || 1;
            this.ts = now();
            this.df = ed - st;
        };
        BezierClass.prototype = {
            B2: function (t) {
                return 3 * (1 - t) * (1 - t) * t;
            }, B3: function (t) {
                return 3 * (1 - t) * t * t;
            }, B4: function (t) {
                return t * t * t;
            }, getPos: function () {
                return (now() - this.ts) / this.spd;
            }, getNow: function () {
                var pc = (now() - this.ts) / this.spd;
                var bz = this.B2(pc) + this.B3(pc) + this.B4(pc);
                return (pc >= 1) ? this.ed : this.st + (this.df * bz) | 0;
            }, update: function (ed, spd) {
                this.st = this.getNow();
                this.ed = ed;
                this.spd = spd;
                this.ts = now();
                this.df = this.ed - this.st;
                return this;
            }
        };

        function getMatrixValues() {
            var tr = self.doc.css(cap.trstyle);
            if (tr && (tr.substr(0, 6) == "matrix")) {
                return tr.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, '').split(/, +/);
            }
            return false;
        }

        if (this.ishwscroll) {
            this.doc.translate = {x: 0, y: 0, tx: "0px", ty: "0px"};
            if (cap.hastranslate3d && cap.isios) this.doc.css("-webkit-backface-visibility", "hidden");
            this.getScrollTop = function (last) {
                if (!last) {
                    var mtx = getMatrixValues();
                    if (mtx) return (mtx.length == 16) ? -mtx[13] : -mtx[5];
                    if (self.timerscroll && self.timerscroll.bz) return self.timerscroll.bz.getNow();
                }
                return self.doc.translate.y;
            };
            this.getScrollLeft = function (last) {
                if (!last) {
                    var mtx = getMatrixValues();
                    if (mtx) return (mtx.length == 16) ? -mtx[12] : -mtx[4];
                    if (self.timerscroll && self.timerscroll.bh) return self.timerscroll.bh.getNow();
                }
                return self.doc.translate.x;
            };
            this.notifyScrollEvent = function (el) {
                var e = _doc.createEvent("UIEvents");
                e.initUIEvent("scroll", false, false, _win, 1);
                e.niceevent = true;
                el.dispatchEvent(e);
            };
            var cxscrollleft = (this.isrtlmode) ? 1 : -1;
            if (cap.hastranslate3d && opt.enabletranslate3d) {
                this.setScrollTop = function (val, silent) {
                    self.doc.translate.y = val;
                    self.doc.translate.ty = (val * -1) + "px";
                    self.doc.css(cap.trstyle, "translate3d(" + self.doc.translate.tx + "," + self.doc.translate.ty + ",0)");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
                this.setScrollLeft = function (val, silent) {
                    self.doc.translate.x = val;
                    self.doc.translate.tx = (val * cxscrollleft) + "px";
                    self.doc.css(cap.trstyle, "translate3d(" + self.doc.translate.tx + "," + self.doc.translate.ty + ",0)");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
            } else {
                this.setScrollTop = function (val, silent) {
                    self.doc.translate.y = val;
                    self.doc.translate.ty = (val * -1) + "px";
                    self.doc.css(cap.trstyle, "translate(" + self.doc.translate.tx + "," + self.doc.translate.ty + ")");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
                this.setScrollLeft = function (val, silent) {
                    self.doc.translate.x = val;
                    self.doc.translate.tx = (val * cxscrollleft) + "px";
                    self.doc.css(cap.trstyle, "translate(" + self.doc.translate.tx + "," + self.doc.translate.ty + ")");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
            }
        } else {
            this.getScrollTop = function () {
                return self.docscroll.scrollTop();
            };
            this.setScrollTop = function (val) {
                self.docscroll.scrollTop(val);
            };
            this.getScrollLeft = function () {
                var val;
                if (!self.hasreversehr) {
                    val = self.docscroll.scrollLeft();
                } else if (self.detected.ismozilla) {
                    val = self.page.maxw - Math.abs(self.docscroll.scrollLeft());
                } else {
                    val = self.page.maxw - self.docscroll.scrollLeft();
                }
                return val;
            };
            this.setScrollLeft = function (val) {
                return setTimeout(function () {
                    if (!self) return;
                    if (self.hasreversehr) {
                        if (self.detected.ismozilla) {
                            val = -(self.page.maxw - val);
                        } else {
                            val = self.page.maxw - val;
                        }
                    }
                    return self.docscroll.scrollLeft(val);
                }, 1);
            };
        }
        this.getTarget = function (e) {
            if (!e) return false;
            if (e.target) return e.target;
            if (e.srcElement) return e.srcElement;
            return false;
        };
        this.hasParent = function (e, id) {
            if (!e) return false;
            var el = e.target || e.srcElement || e || false;
            while (el && el.id != id) {
                el = el.parentNode || false;
            }
            return (el !== false);
        };

        function getZIndex() {
            var dom = self.win;
            if ("zIndex" in dom) return dom.zIndex();
            while (dom.length > 0) {
                if (dom[0].nodeType == 9) return false;
                var zi = dom.css('zIndex');
                if (!isNaN(zi) && zi !== 0) return parseInt(zi);
                dom = dom.parent();
            }
            return false;
        }

        var _convertBorderWidth = {"thin": 1, "medium": 3, "thick": 5};

        function getWidthToPixel(dom, prop, chkheight) {
            var wd = dom.css(prop);
            var px = parseFloat(wd);
            if (isNaN(px)) {
                px = _convertBorderWidth[wd] || 0;
                var brd = (px == 3) ? ((chkheight) ? (self.win.outerHeight() - self.win.innerHeight()) : (self.win.outerWidth() - self.win.innerWidth())) : 1;
                if (self.isie8 && px) px += 1;
                return (brd) ? px : 0;
            }
            return px;
        }

        this.getDocumentScrollOffset = function () {
            return {
                top: _win.pageYOffset || _doc.documentElement.scrollTop,
                left: _win.pageXOffset || _doc.documentElement.scrollLeft
            };
        };
        this.getOffset = function () {
            if (self.isfixed) {
                var ofs = self.win.offset();
                var scrl = self.getDocumentScrollOffset();
                ofs.top -= scrl.top;
                ofs.left -= scrl.left;
                return ofs;
            }
            var ww = self.win.offset();
            if (!self.viewport) return ww;
            var vp = self.viewport.offset();
            return {top: ww.top - vp.top, left: ww.left - vp.left};
        };
        this.updateScrollBar = function (len) {
            var pos, off;
            if (self.ishwscroll) {
                self.rail.css({height: self.win.innerHeight() - (opt.railpadding.top + opt.railpadding.bottom)});
                if (self.railh) self.railh.css({width: self.win.innerWidth() - (opt.railpadding.left + opt.railpadding.right)});
            } else {
                var wpos = self.getOffset();
                pos = {top: wpos.top, left: wpos.left - (opt.railpadding.left + opt.railpadding.right)};
                pos.top += getWidthToPixel(self.win, 'border-top-width', true);
                pos.left += (self.rail.align) ? self.win.outerWidth() - getWidthToPixel(self.win, 'border-right-width') - self.rail.width : getWidthToPixel(self.win, 'border-left-width');
                off = opt.railoffset;
                if (off) {
                    if (off.top) pos.top += off.top;
                    if (off.left) pos.left += off.left;
                }
                if (!self.railslocked) self.rail.css({
                    top: pos.top,
                    left: pos.left,
                    height: ((len) ? len.h : self.win.innerHeight()) - (opt.railpadding.top + opt.railpadding.bottom)
                });
                if (self.zoom) {
                    self.zoom.css({
                        top: pos.top + 1,
                        left: (self.rail.align == 1) ? pos.left - 20 : pos.left + self.rail.width + 4
                    });
                }
                if (self.railh && !self.railslocked) {
                    pos = {top: wpos.top, left: wpos.left};
                    off = opt.railhoffset;
                    if (off) {
                        if (off.top) pos.top += off.top;
                        if (off.left) pos.left += off.left;
                    }
                    var y = (self.railh.align) ? pos.top + getWidthToPixel(self.win, 'border-top-width', true) + self.win.innerHeight() - self.railh.height : pos.top + getWidthToPixel(self.win, 'border-top-width', true);
                    var x = pos.left + getWidthToPixel(self.win, 'border-left-width');
                    self.railh.css({
                        top: y - (opt.railpadding.top + opt.railpadding.bottom),
                        left: x,
                        width: self.railh.width
                    });
                }
            }
        };
        this.doRailClick = function (e, dbl, hr) {
            var fn, pg, cur, pos;
            if (self.railslocked) return;
            self.cancelEvent(e);
            if (!("pageY" in e)) {
                e.pageX = e.clientX + _doc.documentElement.scrollLeft;
                e.pageY = e.clientY + _doc.documentElement.scrollTop;
            }
            if (dbl) {
                fn = (hr) ? self.doScrollLeft : self.doScrollTop;
                cur = (hr) ? ((e.pageX - self.railh.offset().left - (self.cursorwidth / 2)) * self.scrollratio.x) : ((e.pageY - self.rail.offset().top - (self.cursorheight / 2)) * self.scrollratio.y);
                self.unsynched("relativexy");
                fn(cur | 0);
            } else {
                fn = (hr) ? self.doScrollLeftBy : self.doScrollBy;
                cur = (hr) ? self.scroll.x : self.scroll.y;
                pos = (hr) ? e.pageX - self.railh.offset().left : e.pageY - self.rail.offset().top;
                pg = (hr) ? self.view.w : self.view.h;
                fn((cur >= pos) ? pg : -pg);
            }
        };
        self.newscrolly = self.newscrollx = 0;
        self.hasanimationframe = ("requestAnimationFrame" in _win);
        self.hascancelanimationframe = ("cancelAnimationFrame" in _win);
        self.hasborderbox = false;
        this.init = function () {
            self.saved.css = [];
            if (cap.isoperamini) return true;
            if (cap.isandroid && !("hidden" in _doc)) return true;
            opt.emulatetouch = opt.emulatetouch || opt.touchbehavior;
            self.hasborderbox = _win.getComputedStyle && (_win.getComputedStyle(_doc.body)['box-sizing'] === "border-box");
            var _scrollyhidden = {'overflow-y': 'hidden'};
            if (cap.isie11 || cap.isie10) _scrollyhidden['-ms-overflow-style'] = 'none';
            if (self.ishwscroll) {
                this.doc.css(cap.transitionstyle, cap.prefixstyle + 'transform 0ms ease-out');
                if (cap.transitionend) self.bind(self.doc, cap.transitionend, self.onScrollTransitionEnd, false);
            }
            self.zindex = "auto";
            if (!self.ispage && opt.zindex == "auto") {
                self.zindex = getZIndex() || "auto";
            } else {
                self.zindex = opt.zindex;
            }
            if (!self.ispage && self.zindex != "auto" && self.zindex > globalmaxzindex) {
                globalmaxzindex = self.zindex;
            }
            if (self.isie && self.zindex === 0 && opt.zindex == "auto") {
                self.zindex = "auto";
            }
            if (!self.ispage || !cap.isieold) {
                var cont = self.docscroll;
                if (self.ispage) cont = (self.haswrapper) ? self.win : self.doc;
                self.css(cont, _scrollyhidden);
                if (self.ispage && (cap.isie11 || cap.isie)) {
                    self.css($("html"), _scrollyhidden);
                }
                if (cap.isios && !self.ispage && !self.haswrapper) self.css($body, {"-webkit-overflow-scrolling": "touch"});
                var cursor = $(_doc.createElement('div'));
                cursor.css({
                    position: "relative",
                    top: 0,
                    "float": "right",
                    width: opt.cursorwidth,
                    height: 0,
                    'background-color': opt.cursorcolor,
                    border: opt.cursorborder,
                    'background-clip': 'padding-box',
                    '-webkit-border-radius': opt.cursorborderradius,
                    '-moz-border-radius': opt.cursorborderradius,
                    'border-radius': opt.cursorborderradius
                });
                cursor.addClass('nicescroll-cursors');
                self.cursor = cursor;
                var rail = $(_doc.createElement('div'));
                rail.attr('id', self.id);
                rail.addClass('nicescroll-rails nicescroll-rails-vr');
                var v, a, kp = ["left", "right", "top", "bottom"];
                for (var n in kp) {
                    a = kp[n];
                    v = opt.railpadding[a] || 0;
                    v && rail.css("padding-" + a, v + "px");
                }
                rail.append(cursor);
                rail.width = Math.max(parseFloat(opt.cursorwidth), cursor.outerWidth());
                rail.css({
                    width: rail.width + "px",
                    zIndex: self.zindex,
                    background: opt.background,
                    cursor: "default"
                });
                rail.visibility = true;
                rail.scrollable = true;
                rail.align = (opt.railalign == "left") ? 0 : 1;
                self.rail = rail;
                self.rail.drag = false;
                var zoom = false;
                if (opt.boxzoom && !self.ispage && !cap.isieold) {
                    zoom = _doc.createElement('div');
                    self.bind(zoom, "click", self.doZoom);
                    self.bind(zoom, "mouseenter", function () {
                        self.zoom.css('opacity', opt.cursoropacitymax);
                    });
                    self.bind(zoom, "mouseleave", function () {
                        self.zoom.css('opacity', opt.cursoropacitymin);
                    });
                    self.zoom = $(zoom);
                    self.zoom.css({
                        cursor: "pointer",
                        zIndex: self.zindex,
                        backgroundImage: 'url(' + opt.scriptpath + 'zoomico.png)',
                        height: 18,
                        width: 18,
                        backgroundPosition: '0 0'
                    });
                    if (opt.dblclickzoom) self.bind(self.win, "dblclick", self.doZoom);
                    if (cap.cantouch && opt.gesturezoom) {
                        self.ongesturezoom = function (e) {
                            if (e.scale > 1.5) self.doZoomIn(e);
                            if (e.scale < 0.8) self.doZoomOut(e);
                            return self.cancelEvent(e);
                        };
                        self.bind(self.win, "gestureend", self.ongesturezoom);
                    }
                }
                self.railh = false;
                var railh;
                if (opt.horizrailenabled) {
                    self.css(cont, {overflowX: 'hidden'});
                    cursor = $(_doc.createElement('div'));
                    cursor.css({
                        position: "absolute",
                        top: 0,
                        height: opt.cursorwidth,
                        width: 0,
                        backgroundColor: opt.cursorcolor,
                        border: opt.cursorborder,
                        backgroundClip: 'padding-box',
                        '-webkit-border-radius': opt.cursorborderradius,
                        '-moz-border-radius': opt.cursorborderradius,
                        'border-radius': opt.cursorborderradius
                    });
                    if (cap.isieold) cursor.css('overflow', 'hidden');
                    cursor.addClass('nicescroll-cursors');
                    self.cursorh = cursor;
                    railh = $(_doc.createElement('div'));
                    railh.attr('id', self.id + '-hr');
                    railh.addClass('nicescroll-rails nicescroll-rails-hr');
                    railh.height = Math.max(parseFloat(opt.cursorwidth), cursor.outerHeight());
                    railh.css({height: railh.height + "px", 'zIndex': self.zindex, "background": opt.background});
                    railh.append(cursor);
                    railh.visibility = true;
                    railh.scrollable = true;
                    railh.align = (opt.railvalign == "top") ? 0 : 1;
                    self.railh = railh;
                    self.railh.drag = false;
                }
                if (self.ispage) {
                    rail.css({position: "fixed", top: 0, height: "100%"});
                    rail.css((rail.align) ? {right: 0} : {left: 0});
                    self.body.append(rail);
                    if (self.railh) {
                        railh.css({position: "fixed", left: 0, width: "100%"});
                        railh.css((railh.align) ? {bottom: 0} : {top: 0});
                        self.body.append(railh);
                    }
                } else {
                    if (self.ishwscroll) {
                        if (self.win.css('position') == 'static') self.css(self.win, {'position': 'relative'});
                        var bd = (self.win[0].nodeName == 'HTML') ? self.body : self.win;
                        $(bd).scrollTop(0).scrollLeft(0);
                        if (self.zoom) {
                            self.zoom.css({position: "absolute", top: 1, right: 0, "margin-right": rail.width + 4});
                            bd.append(self.zoom);
                        }
                        rail.css({position: "absolute", top: 0});
                        rail.css((rail.align) ? {right: 0} : {left: 0});
                        bd.append(rail);
                        if (railh) {
                            railh.css({position: "absolute", left: 0, bottom: 0});
                            railh.css((railh.align) ? {bottom: 0} : {top: 0});
                            bd.append(railh);
                        }
                    } else {
                        self.isfixed = (self.win.css("position") == "fixed");
                        var rlpos = (self.isfixed) ? "fixed" : "absolute";
                        if (!self.isfixed) self.viewport = self.getViewport(self.win[0]);
                        if (self.viewport) {
                            self.body = self.viewport;
                            if (!(/fixed|absolute/.test(self.viewport.css("position")))) self.css(self.viewport, {"position": "relative"});
                        }
                        rail.css({position: rlpos});
                        if (self.zoom) self.zoom.css({position: rlpos});
                        self.updateScrollBar();
                        self.body.append(rail);
                        if (self.zoom) self.body.append(self.zoom);
                        if (self.railh) {
                            railh.css({position: rlpos});
                            self.body.append(railh);
                        }
                    }
                    if (cap.isios) self.css(self.win, {
                        '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
                        '-webkit-touch-callout': 'none'
                    });
                    if (opt.disableoutline) {
                        if (cap.isie) self.win.attr("hideFocus", "true");
                        if (cap.iswebkit) self.win.css('outline', 'none');
                    }
                }
                if (opt.autohidemode === false) {
                    self.autohidedom = false;
                    self.rail.css({opacity: opt.cursoropacitymax});
                    if (self.railh) self.railh.css({opacity: opt.cursoropacitymax});
                } else if ((opt.autohidemode === true) || (opt.autohidemode === "leave")) {
                    self.autohidedom = $().add(self.rail);
                    if (cap.isie8) self.autohidedom = self.autohidedom.add(self.cursor);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
                    if (self.railh && cap.isie8) self.autohidedom = self.autohidedom.add(self.cursorh);
                } else if (opt.autohidemode == "scroll") {
                    self.autohidedom = $().add(self.rail);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
                } else if (opt.autohidemode == "cursor") {
                    self.autohidedom = $().add(self.cursor);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.cursorh);
                } else if (opt.autohidemode == "hidden") {
                    self.autohidedom = false;
                    self.hide();
                    self.railslocked = false;
                }
                if (cap.cantouch || self.istouchcapable || opt.emulatetouch || cap.hasmstouch) {
                    self.scrollmom = new ScrollMomentumClass2D(self);
                    var delayedclick = null;
                    self.ontouchstart = function (e) {
                        if (self.locked) return false;
                        if (e.pointerType && (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return false;
                        self.hasmoving = false;
                        if (self.scrollmom.timer) {
                            self.triggerScrollEnd();
                            self.scrollmom.stop();
                        }
                        if (!self.railslocked) {
                            var tg = self.getTarget(e);
                            if (tg) {
                                var skp = (/INPUT/i.test(tg.nodeName)) && (/range/i.test(tg.type));
                                if (skp) return self.stopPropagation(e);
                            }
                            var ismouse = (e.type === "mousedown");
                            if (!("clientX" in e) && ("changedTouches" in e)) {
                                e.clientX = e.changedTouches[0].clientX;
                                e.clientY = e.changedTouches[0].clientY;
                            }
                            if (self.forcescreen) {
                                var le = e;
                                e = {"original": (e.original) ? e.original : e};
                                e.clientX = le.screenX;
                                e.clientY = le.screenY;
                            }
                            self.rail.drag = {
                                x: e.clientX,
                                y: e.clientY,
                                sx: self.scroll.x,
                                sy: self.scroll.y,
                                st: self.getScrollTop(),
                                sl: self.getScrollLeft(),
                                pt: 2,
                                dl: false,
                                tg: tg
                            };
                            if (self.ispage || !opt.directionlockdeadzone) {
                                self.rail.drag.dl = "f";
                            } else {
                                var view = {w: $window.width(), h: $window.height()};
                                var page = self.getContentSize();
                                var maxh = page.h - view.h;
                                var maxw = page.w - view.w;
                                if (self.rail.scrollable && !self.railh.scrollable) self.rail.drag.ck = (maxh > 0) ? "v" : false; else if (!self.rail.scrollable && self.railh.scrollable) self.rail.drag.ck = (maxw > 0) ? "h" : false; else self.rail.drag.ck = false;
                            }
                            if (opt.emulatetouch && self.isiframe && cap.isie) {
                                var wp = self.win.position();
                                self.rail.drag.x += wp.left;
                                self.rail.drag.y += wp.top;
                            }
                            self.hasmoving = false;
                            self.lastmouseup = false;
                            self.scrollmom.reset(e.clientX, e.clientY);
                            if (tg && ismouse) {
                                var ip = /INPUT|SELECT|BUTTON|TEXTAREA/i.test(tg.nodeName);
                                if (!ip) {
                                    if (cap.hasmousecapture) tg.setCapture();
                                    if (opt.emulatetouch) {
                                        if (tg.onclick && !(tg._onclick || false)) {
                                            tg._onclick = tg.onclick;
                                            tg.onclick = function (e) {
                                                if (self.hasmoving) return false;
                                                tg._onclick.call(this, e);
                                            };
                                        }
                                        return self.cancelEvent(e);
                                    }
                                    return self.stopPropagation(e);
                                }
                                if (/SUBMIT|CANCEL|BUTTON/i.test($(tg).attr('type'))) {
                                    self.preventclick = {"tg": tg, "click": false};
                                }
                            }
                        }
                    };
                    self.ontouchend = function (e) {
                        if (!self.rail.drag) return true;
                        if (self.rail.drag.pt == 2) {
                            if (e.pointerType && (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return false;
                            self.rail.drag = false;
                            var ismouse = (e.type === "mouseup");
                            if (self.hasmoving) {
                                self.scrollmom.doMomentum();
                                self.lastmouseup = true;
                                self.hideCursor();
                                if (cap.hasmousecapture) _doc.releaseCapture();
                                if (ismouse) return self.cancelEvent(e);
                            }
                        }
                        else if (self.rail.drag.pt == 1) {
                            return self.onmouseup(e);
                        }
                    };
                    var moveneedoffset = (opt.emulatetouch && self.isiframe && !cap.hasmousecapture);
                    var locktollerance = opt.directionlockdeadzone * 0.3 | 0;
                    self.ontouchmove = function (e, byiframe) {
                        if (!self.rail.drag) return true;
                        if (e.targetTouches && opt.preventmultitouchscrolling) {
                            if (e.targetTouches.length > 1) return true;
                        }
                        if (e.pointerType && (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return true;
                        if (self.rail.drag.pt == 2) {
                            if (("changedTouches" in e)) {
                                e.clientX = e.changedTouches[0].clientX;
                                e.clientY = e.changedTouches[0].clientY;
                            }
                            var ofy, ofx;
                            ofx = ofy = 0;
                            if (moveneedoffset && !byiframe) {
                                var wp = self.win.position();
                                ofx = -wp.left;
                                ofy = -wp.top;
                            }
                            var fy = e.clientY + ofy;
                            var my = (fy - self.rail.drag.y);
                            var fx = e.clientX + ofx;
                            var mx = (fx - self.rail.drag.x);
                            var ny = self.rail.drag.st - my;
                            if (self.ishwscroll && opt.bouncescroll) {
                                if (ny < 0) {
                                    ny = Math.round(ny / 2);
                                } else if (ny > self.page.maxh) {
                                    ny = self.page.maxh + Math.round((ny - self.page.maxh) / 2);
                                }
                            } else {
                                if (ny < 0) {
                                    ny = 0;
                                    fy = 0;
                                }
                                else if (ny > self.page.maxh) {
                                    ny = self.page.maxh;
                                    fy = 0;
                                }
                                if (fy === 0 && !self.hasmoving) {
                                    if (!self.ispage) self.rail.drag = false;
                                    return true;
                                }
                            }
                            var nx = self.getScrollLeft();
                            if (self.railh && self.railh.scrollable) {
                                nx = (self.isrtlmode) ? mx - self.rail.drag.sl : self.rail.drag.sl - mx;
                                if (self.ishwscroll && opt.bouncescroll) {
                                    if (nx < 0) {
                                        nx = Math.round(nx / 2);
                                    } else if (nx > self.page.maxw) {
                                        nx = self.page.maxw + Math.round((nx - self.page.maxw) / 2);
                                    }
                                } else {
                                    if (nx < 0) {
                                        nx = 0;
                                        fx = 0;
                                    }
                                    if (nx > self.page.maxw) {
                                        nx = self.page.maxw;
                                        fx = 0;
                                    }
                                }
                            }
                            if (!self.hasmoving) {
                                if (self.rail.drag.y === e.clientY && self.rail.drag.x === e.clientX) return self.cancelEvent(e);
                                var ay = Math.abs(my);
                                var ax = Math.abs(mx);
                                var dz = opt.directionlockdeadzone;
                                if (!self.rail.drag.ck) {
                                    if (ay > dz && ax > dz) self.rail.drag.dl = "f"; else if (ay > dz) self.rail.drag.dl = (ax > locktollerance) ? "f" : "v"; else if (ax > dz) self.rail.drag.dl = (ay > locktollerance) ? "f" : "h";
                                }
                                else if (self.rail.drag.ck == "v") {
                                    if (ax > dz && ay <= locktollerance) {
                                        self.rail.drag = false;
                                    }
                                    else if (ay > dz) self.rail.drag.dl = "v";
                                }
                                else if (self.rail.drag.ck == "h") {
                                    if (ay > dz && ax <= locktollerance) {
                                        self.rail.drag = false;
                                    }
                                    else if (ax > dz) self.rail.drag.dl = "h";
                                }
                                if (!self.rail.drag.dl) return self.cancelEvent(e);
                                self.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0);
                                self.hasmoving = true;
                            }
                            if (self.preventclick && !self.preventclick.click) {
                                self.preventclick.click = self.preventclick.tg.onclick || false;
                                self.preventclick.tg.onclick = self.onpreventclick;
                            }
                            if (self.rail.drag.dl) {
                                if (self.rail.drag.dl == "v") nx = self.rail.drag.sl; else if (self.rail.drag.dl == "h") ny = self.rail.drag.st;
                            }
                            self.synched("touchmove", function () {
                                if (self.rail.drag && (self.rail.drag.pt == 2)) {
                                    if (self.prepareTransition) self.resetTransition();
                                    if (self.rail.scrollable) self.setScrollTop(ny);
                                    self.scrollmom.update(fx, fy);
                                    if (self.railh && self.railh.scrollable) {
                                        self.setScrollLeft(nx);
                                        self.showCursor(ny, nx);
                                    } else {
                                        self.showCursor(ny);
                                    }
                                    if (cap.isie10) _doc.selection.clear();
                                }
                            });
                            return self.cancelEvent(e);
                        }
                        else if (self.rail.drag.pt == 1) {
                            return self.onmousemove(e);
                        }
                    };
                    self.ontouchstartCursor = function (e, hronly) {
                        if (self.rail.drag && self.rail.drag.pt != 3) return;
                        if (self.locked) return self.cancelEvent(e);
                        self.cancelScroll();
                        self.rail.drag = {
                            x: e.touches[0].clientX,
                            y: e.touches[0].clientY,
                            sx: self.scroll.x,
                            sy: self.scroll.y,
                            pt: 3,
                            hr: (!!hronly)
                        };
                        var tg = self.getTarget(e);
                        if (!self.ispage && cap.hasmousecapture) tg.setCapture();
                        if (self.isiframe && !cap.hasmousecapture) {
                            self.saved.csspointerevents = self.doc.css("pointer-events");
                            self.css(self.doc, {"pointer-events": "none"});
                        }
                        return self.cancelEvent(e);
                    };
                    self.ontouchendCursor = function (e) {
                        if (self.rail.drag) {
                            if (cap.hasmousecapture) _doc.releaseCapture();
                            if (self.isiframe && !cap.hasmousecapture) self.doc.css("pointer-events", self.saved.csspointerevents);
                            if (self.rail.drag.pt != 3) return;
                            self.rail.drag = false;
                            return self.cancelEvent(e);
                        }
                    };
                    self.ontouchmoveCursor = function (e) {
                        if (self.rail.drag) {
                            if (self.rail.drag.pt != 3) return;
                            self.cursorfreezed = true;
                            if (self.rail.drag.hr) {
                                self.scroll.x = self.rail.drag.sx + (e.touches[0].clientX - self.rail.drag.x);
                                if (self.scroll.x < 0) self.scroll.x = 0;
                                var mw = self.scrollvaluemaxw;
                                if (self.scroll.x > mw) self.scroll.x = mw;
                            } else {
                                self.scroll.y = self.rail.drag.sy + (e.touches[0].clientY - self.rail.drag.y);
                                if (self.scroll.y < 0) self.scroll.y = 0;
                                var my = self.scrollvaluemax;
                                if (self.scroll.y > my) self.scroll.y = my;
                            }
                            self.synched('touchmove', function () {
                                if (self.rail.drag && (self.rail.drag.pt == 3)) {
                                    self.showCursor();
                                    if (self.rail.drag.hr) self.doScrollLeft(Math.round(self.scroll.x * self.scrollratio.x), opt.cursordragspeed); else self.doScrollTop(Math.round(self.scroll.y * self.scrollratio.y), opt.cursordragspeed);
                                }
                            });
                            return self.cancelEvent(e);
                        }
                    };
                }
                self.onmousedown = function (e, hronly) {
                    if (self.rail.drag && self.rail.drag.pt != 1) return;
                    if (self.railslocked) return self.cancelEvent(e);
                    self.cancelScroll();
                    self.rail.drag = {
                        x: e.clientX,
                        y: e.clientY,
                        sx: self.scroll.x,
                        sy: self.scroll.y,
                        pt: 1,
                        hr: hronly || false
                    };
                    var tg = self.getTarget(e);
                    if (cap.hasmousecapture) tg.setCapture();
                    if (self.isiframe && !cap.hasmousecapture) {
                        self.saved.csspointerevents = self.doc.css("pointer-events");
                        self.css(self.doc, {"pointer-events": "none"});
                    }
                    self.hasmoving = false;
                    return self.cancelEvent(e);
                };
                self.onmouseup = function (e) {
                    if (self.rail.drag) {
                        if (self.rail.drag.pt != 1) return true;
                        if (cap.hasmousecapture) _doc.releaseCapture();
                        if (self.isiframe && !cap.hasmousecapture) self.doc.css("pointer-events", self.saved.csspointerevents);
                        self.rail.drag = false;
                        self.cursorfreezed = false;
                        if (self.hasmoving) self.triggerScrollEnd();
                        return self.cancelEvent(e);
                    }
                };
                self.onmousemove = function (e) {
                    if (self.rail.drag) {
                        if (self.rail.drag.pt !== 1) return;
                        if (cap.ischrome && e.which === 0) return self.onmouseup(e);
                        self.cursorfreezed = true;
                        if (!self.hasmoving) self.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0);
                        self.hasmoving = true;
                        if (self.rail.drag.hr) {
                            self.scroll.x = self.rail.drag.sx + (e.clientX - self.rail.drag.x);
                            if (self.scroll.x < 0) self.scroll.x = 0;
                            var mw = self.scrollvaluemaxw;
                            if (self.scroll.x > mw) self.scroll.x = mw;
                        } else {
                            self.scroll.y = self.rail.drag.sy + (e.clientY - self.rail.drag.y);
                            if (self.scroll.y < 0) self.scroll.y = 0;
                            var my = self.scrollvaluemax;
                            if (self.scroll.y > my) self.scroll.y = my;
                        }
                        self.synched('mousemove', function () {
                            if (self.cursorfreezed) {
                                self.showCursor();
                                if (self.rail.drag.hr) {
                                    self.scrollLeft(Math.round(self.scroll.x * self.scrollratio.x));
                                } else {
                                    self.scrollTop(Math.round(self.scroll.y * self.scrollratio.y));
                                }
                            }
                        });
                        return self.cancelEvent(e);
                    }
                    else {
                        self.checkarea = 0;
                    }
                };
                if (cap.cantouch || opt.emulatetouch) {
                    self.onpreventclick = function (e) {
                        if (self.preventclick) {
                            self.preventclick.tg.onclick = self.preventclick.click;
                            self.preventclick = false;
                            return self.cancelEvent(e);
                        }
                    };
                    self.onclick = (cap.isios) ? false : function (e) {
                        if (self.lastmouseup) {
                            self.lastmouseup = false;
                            return self.cancelEvent(e);
                        } else {
                            return true;
                        }
                    };
                    if (opt.grabcursorenabled && cap.cursorgrabvalue) {
                        self.css((self.ispage) ? self.doc : self.win, {'cursor': cap.cursorgrabvalue});
                        self.css(self.rail, {'cursor': cap.cursorgrabvalue});
                    }
                } else {
                    var checkSelectionScroll = function (e) {
                        if (!self.selectiondrag) return;
                        if (e) {
                            var ww = self.win.outerHeight();
                            var df = (e.pageY - self.selectiondrag.top);
                            if (df > 0 && df < ww) df = 0;
                            if (df >= ww) df -= ww;
                            self.selectiondrag.df = df;
                        }
                        if (self.selectiondrag.df === 0) return;
                        var rt = -(self.selectiondrag.df * 2 / 6) | 0;
                        self.doScrollBy(rt);
                        self.debounced("doselectionscroll", function () {
                            checkSelectionScroll();
                        }, 50);
                    };
                    if ("getSelection" in _doc) {
                        self.hasTextSelected = function () {
                            return (_doc.getSelection().rangeCount > 0);
                        };
                    } else if ("selection" in _doc) {
                        self.hasTextSelected = function () {
                            return (_doc.selection.type != "None");
                        };
                    } else {
                        self.hasTextSelected = function () {
                            return false;
                        };
                    }
                    self.onselectionstart = function (e) {
                        if (self.ispage) return;
                        self.selectiondrag = self.win.offset();
                    };
                    self.onselectionend = function (e) {
                        self.selectiondrag = false;
                    };
                    self.onselectiondrag = function (e) {
                        if (!self.selectiondrag) return;
                        if (self.hasTextSelected()) self.debounced("selectionscroll", function () {
                            checkSelectionScroll(e);
                        }, 250);
                    };
                }
                if (cap.hasw3ctouch) {
                    self.css((self.ispage) ? $("html") : self.win, {'touch-action': 'none'});
                    self.css(self.rail, {'touch-action': 'none'});
                    self.css(self.cursor, {'touch-action': 'none'});
                    self.bind(self.win, "pointerdown", self.ontouchstart);
                    self.bind(_doc, "pointerup", self.ontouchend);
                    self.delegate(_doc, "pointermove", self.ontouchmove);
                } else if (cap.hasmstouch) {
                    self.css((self.ispage) ? $("html") : self.win, {'-ms-touch-action': 'none'});
                    self.css(self.rail, {'-ms-touch-action': 'none'});
                    self.css(self.cursor, {'-ms-touch-action': 'none'});
                    self.bind(self.win, "MSPointerDown", self.ontouchstart);
                    self.bind(_doc, "MSPointerUp", self.ontouchend);
                    self.delegate(_doc, "MSPointerMove", self.ontouchmove);
                    self.bind(self.cursor, "MSGestureHold", function (e) {
                        e.preventDefault();
                    });
                    self.bind(self.cursor, "contextmenu", function (e) {
                        e.preventDefault();
                    });
                } else if (cap.cantouch) {
                    self.bind(self.win, "touchstart", self.ontouchstart, false, true);
                    self.bind(_doc, "touchend", self.ontouchend, false, true);
                    self.bind(_doc, "touchcancel", self.ontouchend, false, true);
                    self.delegate(_doc, "touchmove", self.ontouchmove, false, true);
                }
                if (opt.emulatetouch) {
                    self.bind(self.win, "mousedown", self.ontouchstart, false, true);
                    self.bind(_doc, "mouseup", self.ontouchend, false, true);
                    self.bind(_doc, "mousemove", self.ontouchmove, false, true);
                }
                if (opt.cursordragontouch || (!cap.cantouch && !opt.emulatetouch)) {
                    self.rail.css({cursor: "default"});
                    self.railh && self.railh.css({cursor: "default"});
                    self.jqbind(self.rail, "mouseenter", function () {
                        if (!self.ispage && !self.win.is(":visible")) return false;
                        if (self.canshowonmouseevent) self.showCursor();
                        self.rail.active = true;
                    });
                    self.jqbind(self.rail, "mouseleave", function () {
                        self.rail.active = false;
                        if (!self.rail.drag) self.hideCursor();
                    });
                    if (opt.sensitiverail) {
                        self.bind(self.rail, "click", function (e) {
                            self.doRailClick(e, false, false);
                        });
                        self.bind(self.rail, "dblclick", function (e) {
                            self.doRailClick(e, true, false);
                        });
                        self.bind(self.cursor, "click", function (e) {
                            self.cancelEvent(e);
                        });
                        self.bind(self.cursor, "dblclick", function (e) {
                            self.cancelEvent(e);
                        });
                    }
                    if (self.railh) {
                        self.jqbind(self.railh, "mouseenter", function () {
                            if (!self.ispage && !self.win.is(":visible")) return false;
                            if (self.canshowonmouseevent) self.showCursor();
                            self.rail.active = true;
                        });
                        self.jqbind(self.railh, "mouseleave", function () {
                            self.rail.active = false;
                            if (!self.rail.drag) self.hideCursor();
                        });
                        if (opt.sensitiverail) {
                            self.bind(self.railh, "click", function (e) {
                                self.doRailClick(e, false, true);
                            });
                            self.bind(self.railh, "dblclick", function (e) {
                                self.doRailClick(e, true, true);
                            });
                            self.bind(self.cursorh, "click", function (e) {
                                self.cancelEvent(e);
                            });
                            self.bind(self.cursorh, "dblclick", function (e) {
                                self.cancelEvent(e);
                            });
                        }
                    }
                }
                if (opt.cursordragontouch && (this.istouchcapable || cap.cantouch)) {
                    self.bind(self.cursor, "touchstart", self.ontouchstartCursor);
                    self.bind(self.cursor, "touchmove", self.ontouchmoveCursor);
                    self.bind(self.cursor, "touchend", self.ontouchendCursor);
                    self.cursorh && self.bind(self.cursorh, "touchstart", function (e) {
                        self.ontouchstartCursor(e, true);
                    });
                    self.cursorh && self.bind(self.cursorh, "touchmove", self.ontouchmoveCursor);
                    self.cursorh && self.bind(self.cursorh, "touchend", self.ontouchendCursor);
                }
                if (!opt.emulatetouch && !cap.isandroid && !cap.isios) {
                    self.bind((cap.hasmousecapture) ? self.win : _doc, "mouseup", self.onmouseup);
                    self.bind(_doc, "mousemove", self.onmousemove);
                    if (self.onclick) self.bind(_doc, "click", self.onclick);
                    self.bind(self.cursor, "mousedown", self.onmousedown);
                    self.bind(self.cursor, "mouseup", self.onmouseup);
                    if (self.railh) {
                        self.bind(self.cursorh, "mousedown", function (e) {
                            self.onmousedown(e, true);
                        });
                        self.bind(self.cursorh, "mouseup", self.onmouseup);
                    }
                    if (!self.ispage && opt.enablescrollonselection) {
                        self.bind(self.win[0], "mousedown", self.onselectionstart);
                        self.bind(_doc, "mouseup", self.onselectionend);
                        self.bind(self.cursor, "mouseup", self.onselectionend);
                        if (self.cursorh) self.bind(self.cursorh, "mouseup", self.onselectionend);
                        self.bind(_doc, "mousemove", self.onselectiondrag);
                    }
                    if (self.zoom) {
                        self.jqbind(self.zoom, "mouseenter", function () {
                            if (self.canshowonmouseevent) self.showCursor();
                            self.rail.active = true;
                        });
                        self.jqbind(self.zoom, "mouseleave", function () {
                            self.rail.active = false;
                            if (!self.rail.drag) self.hideCursor();
                        });
                    }
                } else {
                    self.bind((cap.hasmousecapture) ? self.win : _doc, "mouseup", self.ontouchend);
                    if (self.onclick) self.bind(_doc, "click", self.onclick);
                    if (opt.cursordragontouch) {
                        self.bind(self.cursor, "mousedown", self.onmousedown);
                        self.bind(self.cursor, "mouseup", self.onmouseup);
                        self.cursorh && self.bind(self.cursorh, "mousedown", function (e) {
                            self.onmousedown(e, true);
                        });
                        self.cursorh && self.bind(self.cursorh, "mouseup", self.onmouseup);
                    } else {
                        self.bind(self.rail, "mousedown", function (e) {
                            e.preventDefault();
                        });
                        self.railh && self.bind(self.railh, "mousedown", function (e) {
                            e.preventDefault();
                        });
                    }
                }
                if (opt.enablemousewheel) {
                    if (!self.isiframe) self.mousewheel((cap.isie && self.ispage) ? _doc : self.win, self.onmousewheel);
                    self.mousewheel(self.rail, self.onmousewheel);
                    if (self.railh) self.mousewheel(self.railh, self.onmousewheelhr);
                }
                if (!self.ispage && !cap.cantouch && !(/HTML|^BODY/.test(self.win[0].nodeName))) {
                    if (!self.win.attr("tabindex")) self.win.attr({"tabindex": ++tabindexcounter});
                    self.bind(self.win, "focus", function (e) {
                        domfocus = (self.getTarget(e)).id || self.getTarget(e) || false;
                        self.hasfocus = true;
                        if (self.canshowonmouseevent) self.noticeCursor();
                    });
                    self.bind(self.win, "blur", function (e) {
                        domfocus = false;
                        self.hasfocus = false;
                    });
                    self.bind(self.win, "mouseenter", function (e) {
                        mousefocus = (self.getTarget(e)).id || self.getTarget(e) || false;
                        self.hasmousefocus = true;
                        if (self.canshowonmouseevent) self.noticeCursor();
                    });
                    self.bind(self.win, "mouseleave", function (e) {
                        mousefocus = false;
                        self.hasmousefocus = false;
                        if (!self.rail.drag) self.hideCursor();
                    });
                }
                self.onkeypress = function (e) {
                    if (self.railslocked && self.page.maxh === 0) return true;
                    e = e || _win.event;
                    var tg = self.getTarget(e);
                    if (tg && /INPUT|TEXTAREA|SELECT|OPTION/.test(tg.nodeName)) {
                        var tp = tg.getAttribute('type') || tg.type || false;
                        if ((!tp) || !(/submit|button|cancel/i.tp)) return true;
                    }
                    if ($(tg).attr('contenteditable')) return true;
                    if (self.hasfocus || (self.hasmousefocus && !domfocus) || (self.ispage && !domfocus && !mousefocus)) {
                        var key = e.keyCode;
                        if (self.railslocked && key != 27) return self.cancelEvent(e);
                        var ctrl = e.ctrlKey || false;
                        var shift = e.shiftKey || false;
                        var ret = false;
                        switch (key) {
                            case 38:
                            case 63233:
                                self.doScrollBy(24 * 3);
                                ret = true;
                                break;
                            case 40:
                            case 63235:
                                self.doScrollBy(-24 * 3);
                                ret = true;
                                break;
                            case 37:
                            case 63232:
                                if (self.railh) {
                                    (ctrl) ? self.doScrollLeft(0) : self.doScrollLeftBy(24 * 3);
                                    ret = true;
                                }
                                break;
                            case 39:
                            case 63234:
                                if (self.railh) {
                                    (ctrl) ? self.doScrollLeft(self.page.maxw) : self.doScrollLeftBy(-24 * 3);
                                    ret = true;
                                }
                                break;
                            case 33:
                            case 63276:
                                self.doScrollBy(self.view.h);
                                ret = true;
                                break;
                            case 34:
                            case 63277:
                                self.doScrollBy(-self.view.h);
                                ret = true;
                                break;
                            case 36:
                            case 63273:
                                (self.railh && ctrl) ? self.doScrollPos(0, 0) : self.doScrollTo(0);
                                ret = true;
                                break;
                            case 35:
                            case 63275:
                                (self.railh && ctrl) ? self.doScrollPos(self.page.maxw, self.page.maxh) : self.doScrollTo(self.page.maxh);
                                ret = true;
                                break;
                            case 32:
                                if (opt.spacebarenabled) {
                                    (shift) ? self.doScrollBy(self.view.h) : self.doScrollBy(-self.view.h);
                                    ret = true;
                                }
                                break;
                            case 27:
                                if (self.zoomactive) {
                                    self.doZoom();
                                    ret = true;
                                }
                                break;
                        }
                        if (ret) return self.cancelEvent(e);
                    }
                };
                if (opt.enablekeyboard) self.bind(_doc, (cap.isopera && !cap.isopera12) ? "keypress" : "keydown", self.onkeypress);
                self.bind(_doc, "keydown", function (e) {
                    var ctrl = e.ctrlKey || false;
                    if (ctrl) self.wheelprevented = true;
                });
                self.bind(_doc, "keyup", function (e) {
                    var ctrl = e.ctrlKey || false;
                    if (!ctrl) self.wheelprevented = false;
                });
                self.bind(_win, "blur", function (e) {
                    self.wheelprevented = false;
                });
                self.bind(_win, 'resize', self.onscreenresize);
                self.bind(_win, 'orientationchange', self.onscreenresize);
                self.bind(_win, "load", self.lazyResize);
                if (cap.ischrome && !self.ispage && !self.haswrapper) {
                    var tmp = self.win.attr("style");
                    var ww = parseFloat(self.win.css("width")) + 1;
                    self.win.css('width', ww);
                    self.synched("chromefix", function () {
                        self.win.attr("style", tmp);
                    });
                }
                self.onAttributeChange = function (e) {
                    self.lazyResize(self.isieold ? 250 : 30);
                };
                if (opt.enableobserver) {
                    if ((!self.isie11) && (ClsMutationObserver !== false)) {
                        self.observerbody = new ClsMutationObserver(function (mutations) {
                            mutations.forEach(function (mut) {
                                if (mut.type == "attributes") {
                                    return ($body.hasClass("modal-open") && $body.hasClass("modal-dialog") && !$.contains($('.modal-dialog')[0], self.doc[0])) ? self.hide() : self.show();
                                }
                            });
                            if (self.me.clientWidth != self.page.width || self.me.clientHeight != self.page.height) return self.lazyResize(30);
                        });
                        self.observerbody.observe(_doc.body, {
                            childList: true,
                            subtree: true,
                            characterData: false,
                            attributes: true,
                            attributeFilter: ['class']
                        });
                    }
                    if (!self.ispage && !self.haswrapper) {
                        var _dom = self.win[0];
                        if (ClsMutationObserver !== false) {
                            self.observer = new ClsMutationObserver(function (mutations) {
                                mutations.forEach(self.onAttributeChange);
                            });
                            self.observer.observe(_dom, {
                                childList: true,
                                characterData: false,
                                attributes: true,
                                subtree: false
                            });
                            self.observerremover = new ClsMutationObserver(function (mutations) {
                                mutations.forEach(function (mo) {
                                    if (mo.removedNodes.length > 0) {
                                        for (var dd in mo.removedNodes) {
                                            if (!!self && (mo.removedNodes[dd] === _dom)) return self.remove();
                                        }
                                    }
                                });
                            });
                            self.observerremover.observe(_dom.parentNode, {
                                childList: true,
                                characterData: false,
                                attributes: false,
                                subtree: false
                            });
                        } else {
                            self.bind(_dom, (cap.isie && !cap.isie9) ? "propertychange" : "DOMAttrModified", self.onAttributeChange);
                            if (cap.isie9) _dom.attachEvent("onpropertychange", self.onAttributeChange);
                            self.bind(_dom, "DOMNodeRemoved", function (e) {
                                if (e.target === _dom) self.remove();
                            });
                        }
                    }
                }
                if (!self.ispage && opt.boxzoom) self.bind(_win, "resize", self.resizeZoom);
                if (self.istextarea) {
                    self.bind(self.win, "keydown", self.lazyResize);
                    self.bind(self.win, "mouseup", self.lazyResize);
                }
                self.lazyResize(30);
            }
            if (this.doc[0].nodeName == 'IFRAME') {
                var oniframeload = function () {
                    self.iframexd = false;
                    var doc;
                    try {
                        doc = 'contentDocument' in this ? this.contentDocument : this.contentWindow._doc;
                        var a = doc.domain;
                    } catch (e) {
                        self.iframexd = true;
                        doc = false;
                    }
                    if (self.iframexd) {
                        if ("console" in _win) console.log('NiceScroll error: policy restriced iframe');
                        return true;
                    }
                    self.forcescreen = true;
                    if (self.isiframe) {
                        self.iframe = {
                            "doc": $(doc),
                            "html": self.doc.contents().find('html')[0],
                            "body": self.doc.contents().find('body')[0]
                        };
                        self.getContentSize = function () {
                            return {
                                w: Math.max(self.iframe.html.scrollWidth, self.iframe.body.scrollWidth),
                                h: Math.max(self.iframe.html.scrollHeight, self.iframe.body.scrollHeight)
                            };
                        };
                        self.docscroll = $(self.iframe.body);
                    }
                    if (!cap.isios && opt.iframeautoresize && !self.isiframe) {
                        self.win.scrollTop(0);
                        self.doc.height("");
                        var hh = Math.max(doc.getElementsByTagName('html')[0].scrollHeight, doc.body.scrollHeight);
                        self.doc.height(hh);
                    }
                    self.lazyResize(30);
                    self.css($(self.iframe.body), _scrollyhidden);
                    if (cap.isios && self.haswrapper) {
                        self.css($(doc.body), {'-webkit-transform': 'translate3d(0,0,0)'});
                    }
                    if ('contentWindow' in this) {
                        self.bind(this.contentWindow, "scroll", self.onscroll);
                    } else {
                        self.bind(doc, "scroll", self.onscroll);
                    }
                    if (opt.enablemousewheel) {
                        self.mousewheel(doc, self.onmousewheel);
                    }
                    if (opt.enablekeyboard) self.bind(doc, (cap.isopera) ? "keypress" : "keydown", self.onkeypress);
                    if (cap.cantouch) {
                        self.bind(doc, "touchstart", self.ontouchstart);
                        self.bind(doc, "touchmove", self.ontouchmove);
                    }
                    else if (opt.emulatetouch) {
                        self.bind(doc, "mousedown", self.ontouchstart);
                        self.bind(doc, "mousemove", function (e) {
                            return self.ontouchmove(e, true);
                        });
                        if (opt.grabcursorenabled && cap.cursorgrabvalue) self.css($(doc.body), {'cursor': cap.cursorgrabvalue});
                    }
                    self.bind(doc, "mouseup", self.ontouchend);
                    if (self.zoom) {
                        if (opt.dblclickzoom) self.bind(doc, 'dblclick', self.doZoom);
                        if (self.ongesturezoom) self.bind(doc, "gestureend", self.ongesturezoom);
                    }
                };
                if (this.doc[0].readyState && this.doc[0].readyState === "complete") {
                    setTimeout(function () {
                        oniframeload.call(self.doc[0], false);
                    }, 500);
                }
                self.bind(this.doc, "load", oniframeload);
            }
        };
        this.showCursor = function (py, px) {
            if (self.cursortimeout) {
                clearTimeout(self.cursortimeout);
                self.cursortimeout = 0;
            }
            if (!self.rail) return;
            if (self.autohidedom) {
                self.autohidedom.stop().css({opacity: opt.cursoropacitymax});
                self.cursoractive = true;
            }
            if (!self.rail.drag || self.rail.drag.pt != 1) {
                if (py !== undefined && py !== false) {
                    self.scroll.y = (py / self.scrollratio.y) | 0;
                }
                if (px !== undefined) {
                    self.scroll.x = (px / self.scrollratio.x) | 0;
                }
            }
            self.cursor.css({height: self.cursorheight, top: self.scroll.y});
            if (self.cursorh) {
                var lx = (self.hasreversehr) ? self.scrollvaluemaxw - self.scroll.x : self.scroll.x;
                self.cursorh.css({
                    width: self.cursorwidth,
                    left: (!self.rail.align && self.rail.visibility) ? lx + self.rail.width : lx
                });
                self.cursoractive = true;
            }
            if (self.zoom) self.zoom.stop().css({opacity: opt.cursoropacitymax});
        };
        this.hideCursor = function (tm) {
            if (self.cursortimeout) return;
            if (!self.rail) return;
            if (!self.autohidedom) return;
            if (self.hasmousefocus && opt.autohidemode === "leave") return;
            self.cursortimeout = setTimeout(function () {
                if (!self.rail.active || !self.showonmouseevent) {
                    self.autohidedom.stop().animate({opacity: opt.cursoropacitymin});
                    if (self.zoom) self.zoom.stop().animate({opacity: opt.cursoropacitymin});
                    self.cursoractive = false;
                }
                self.cursortimeout = 0;
            }, tm || opt.hidecursordelay);
        };
        this.noticeCursor = function (tm, py, px) {
            self.showCursor(py, px);
            if (!self.rail.active) self.hideCursor(tm);
        };
        this.getContentSize = (self.ispage) ? function () {
            return {
                w: Math.max(_doc.body.scrollWidth, _doc.documentElement.scrollWidth),
                h: Math.max(_doc.body.scrollHeight, _doc.documentElement.scrollHeight)
            };
        } : (self.haswrapper) ? function () {
            return {w: self.doc[0].offsetWidth, h: self.doc[0].offsetHeight};
        } : function () {
            return {w: self.docscroll[0].scrollWidth, h: self.docscroll[0].scrollHeight};
        };
        this.onResize = function (e, page) {
            if (!self || !self.win) return false;
            var premaxh = self.page.maxh, premaxw = self.page.maxw, previewh = self.view.h, previeww = self.view.w;
            self.view = {
                w: (self.ispage) ? self.win.width() : self.win[0].clientWidth,
                h: (self.ispage) ? self.win.height() : self.win[0].clientHeight
            };
            self.page = (page) ? page : self.getContentSize();
            self.page.maxh = Math.max(0, self.page.h - self.view.h);
            self.page.maxw = Math.max(0, self.page.w - self.view.w);
            if ((self.page.maxh == premaxh) && (self.page.maxw == premaxw) && (self.view.w == previeww) && (self.view.h == previewh)) {
                if (!self.ispage) {
                    var pos = self.win.offset();
                    if (self.lastposition) {
                        var lst = self.lastposition;
                        if ((lst.top == pos.top) && (lst.left == pos.left)) return self;
                    }
                    self.lastposition = pos;
                } else {
                    return self;
                }
            }
            if (self.page.maxh === 0) {
                self.hideRail();
                self.scrollvaluemax = 0;
                self.scroll.y = 0;
                self.scrollratio.y = 0;
                self.cursorheight = 0;
                self.setScrollTop(0);
                if (self.rail) self.rail.scrollable = false;
            } else {
                self.page.maxh -= (opt.railpadding.top + opt.railpadding.bottom);
                self.rail.scrollable = true;
            }
            if (self.page.maxw === 0) {
                self.hideRailHr();
                self.scrollvaluemaxw = 0;
                self.scroll.x = 0;
                self.scrollratio.x = 0;
                self.cursorwidth = 0;
                self.setScrollLeft(0);
                if (self.railh) {
                    self.railh.scrollable = false;
                }
            } else {
                self.page.maxw -= (opt.railpadding.left + opt.railpadding.right);
                if (self.railh) self.railh.scrollable = (opt.horizrailenabled);
            }
            self.railslocked = (self.locked) || ((self.page.maxh === 0) && (self.page.maxw === 0));
            if (self.railslocked) {
                if (!self.ispage) self.updateScrollBar(self.view);
                return false;
            }
            if (!self.hidden) {
                if (!self.rail.visibility) self.showRail();
                if (self.railh && !self.railh.visibility) self.showRailHr();
            }
            if (self.istextarea && self.win.css('resize') && self.win.css('resize') != 'none') self.view.h -= 20;
            self.cursorheight = Math.min(self.view.h, Math.round(self.view.h * (self.view.h / self.page.h)));
            self.cursorheight = (opt.cursorfixedheight) ? opt.cursorfixedheight : Math.max(opt.cursorminheight, self.cursorheight);
            self.cursorwidth = Math.min(self.view.w, Math.round(self.view.w * (self.view.w / self.page.w)));
            self.cursorwidth = (opt.cursorfixedheight) ? opt.cursorfixedheight : Math.max(opt.cursorminheight, self.cursorwidth);
            self.scrollvaluemax = self.view.h - self.cursorheight - (opt.railpadding.top + opt.railpadding.bottom);
            if (!self.hasborderbox) self.scrollvaluemax -= self.cursor[0].offsetHeight - self.cursor[0].clientHeight;
            if (self.railh) {
                self.railh.width = (self.page.maxh > 0) ? (self.view.w - self.rail.width) : self.view.w;
                self.scrollvaluemaxw = self.railh.width - self.cursorwidth - (opt.railpadding.left + opt.railpadding.right);
            }
            if (!self.ispage) self.updateScrollBar(self.view);
            self.scrollratio = {x: (self.page.maxw / self.scrollvaluemaxw), y: (self.page.maxh / self.scrollvaluemax)};
            var sy = self.getScrollTop();
            if (sy > self.page.maxh) {
                self.doScrollTop(self.page.maxh);
            } else {
                self.scroll.y = (self.getScrollTop() / self.scrollratio.y) | 0;
                self.scroll.x = (self.getScrollLeft() / self.scrollratio.x) | 0;
                if (self.cursoractive) self.noticeCursor();
            }
            if (self.scroll.y && (self.getScrollTop() === 0)) self.doScrollTo((self.scroll.y * self.scrollratio.y) | 0);
            return self;
        };
        this.resize = self.onResize;
        var hlazyresize = 0;
        this.onscreenresize = function (e) {
            clearTimeout(hlazyresize);
            var hiderails = (!self.ispage && !self.haswrapper);
            if (hiderails) self.hideRails();
            hlazyresize = setTimeout(function () {
                if (self) {
                    if (hiderails) self.showRails();
                    self.resize();
                }
                hlazyresize = 0;
            }, 120);
        };
        this.lazyResize = function (tm) {
            clearTimeout(hlazyresize);
            tm = isNaN(tm) ? 240 : tm;
            hlazyresize = setTimeout(function () {
                self && self.resize();
                hlazyresize = 0;
            }, tm);
            return self;
        };

        function _modernWheelEvent(dom, name, fn, bubble) {
            self._bind(dom, name, function (e) {
                e = e || _win.event;
                var event = {
                    original: e,
                    target: e.target || e.srcElement,
                    type: "wheel",
                    deltaMode: e.type == "MozMousePixelScroll" ? 0 : 1,
                    deltaX: 0,
                    deltaZ: 0,
                    preventDefault: function () {
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                        return false;
                    },
                    stopImmediatePropagation: function () {
                        (e.stopImmediatePropagation) ? e.stopImmediatePropagation() : e.cancelBubble = true;
                    }
                };
                if (name == "mousewheel") {
                    e.wheelDeltaX && (event.deltaX = -1 / 40 * e.wheelDeltaX);
                    e.wheelDeltaY && (event.deltaY = -1 / 40 * e.wheelDeltaY);
                    !event.deltaY && !event.deltaX && (event.deltaY = -1 / 40 * e.wheelDelta);
                } else {
                    event.deltaY = e.detail;
                }
                return fn.call(dom, event);
            }, bubble);
        }

        this.jqbind = function (dom, name, fn) {
            self.events.push({e: dom, n: name, f: fn, q: true});
            $(dom).on(name, fn);
        };
        this.mousewheel = function (dom, fn, bubble) {
            var el = ("jquery" in dom) ? dom[0] : dom;
            if ("onwheel" in _doc.createElement("div")) {
                self._bind(el, "wheel", fn, bubble || false);
            } else {
                var wname = (_doc.onmousewheel !== undefined) ? "mousewheel" : "DOMMouseScroll";
                _modernWheelEvent(el, wname, fn, bubble || false);
                if (wname == "DOMMouseScroll") _modernWheelEvent(el, "MozMousePixelScroll", fn, bubble || false);
            }
        };
        var passiveSupported = false;
        if (cap.haseventlistener) {
            try {
                var options = Object.defineProperty({}, "passive", {
                    get: function () {
                        passiveSupported = !0;
                    }
                });
                _win.addEventListener("test", null, options);
            } catch (err) {
            }
            this.stopPropagation = function (e) {
                if (!e) return false;
                e = (e.original) ? e.original : e;
                e.stopPropagation();
                return false;
            };
            this.cancelEvent = function (e) {
                if (e.cancelable) e.preventDefault();
                e.stopImmediatePropagation();
                if (e.preventManipulation) e.preventManipulation();
                return false;
            };
        } else {
            Event.prototype.preventDefault = function () {
                this.returnValue = false;
            };
            Event.prototype.stopPropagation = function () {
                this.cancelBubble = true;
            };
            _win.constructor.prototype.addEventListener = _doc.constructor.prototype.addEventListener = Element.prototype.addEventListener = function (type, listener, useCapture) {
                this.attachEvent("on" + type, listener);
            };
            _win.constructor.prototype.removeEventListener = _doc.constructor.prototype.removeEventListener = Element.prototype.removeEventListener = function (type, listener, useCapture) {
                this.detachEvent("on" + type, listener);
            };
            this.cancelEvent = function (e) {
                e = e || _win.event;
                if (e) {
                    e.cancelBubble = true;
                    e.cancel = true;
                    e.returnValue = false;
                }
                return false;
            };
            this.stopPropagation = function (e) {
                e = e || _win.event;
                if (e) e.cancelBubble = true;
                return false;
            };
        }
        this.delegate = function (dom, name, fn, bubble, active) {
            var de = delegatevents[name] || false;
            if (!de) {
                de = {
                    a: [], l: [], f: function (e) {
                        var lst = de.l, l = lst.length - 1;
                        var r = false;
                        for (var a = l; a >= 0; a--) {
                            r = lst[a].call(e.target, e);
                            if (r === false) return false;
                        }
                        return r;
                    }
                };
                self.bind(dom, name, de.f, bubble, active);
                delegatevents[name] = de;
            }
            if (self.ispage) {
                de.a = [self.id].concat(de.a);
                de.l = [fn].concat(de.l);
            } else {
                de.a.push(self.id);
                de.l.push(fn);
            }
        };
        this.undelegate = function (dom, name, fn, bubble, active) {
            var de = delegatevents[name] || false;
            if (de && de.l) {
                for (var a = 0, l = de.l.length; a < l; a++) {
                    if (de.a[a] === self.id) {
                        de.a.splice(a);
                        de.l.splice(a);
                        if (de.a.length === 0) {
                            self._unbind(dom, name, de.l.f);
                            delegatevents[name] = null;
                        }
                    }
                }
            }
        };
        this.bind = function (dom, name, fn, bubble, active) {
            var el = ("jquery" in dom) ? dom[0] : dom;
            self._bind(el, name, fn, bubble || false, active || false);
        };
        this._bind = function (el, name, fn, bubble, active) {
            self.events.push({e: el, n: name, f: fn, b: bubble, q: false});
            (passiveSupported && active) ? el.addEventListener(name, fn, {
                passive: false,
                capture: bubble
            }) : el.addEventListener(name, fn, bubble || false);
        };
        this._unbind = function (el, name, fn, bub) {
            if (delegatevents[name]) self.undelegate(el, name, fn, bub); else el.removeEventListener(name, fn, bub);
        };
        this.unbindAll = function () {
            for (var a = 0; a < self.events.length; a++) {
                var r = self.events[a];
                (r.q) ? r.e.unbind(r.n, r.f) : self._unbind(r.e, r.n, r.f, r.b);
            }
        };
        this.showRails = function () {
            return self.showRail().showRailHr();
        };
        this.showRail = function () {
            if ((self.page.maxh !== 0) && (self.ispage || self.win.css('display') != 'none')) {
                self.rail.visibility = true;
                self.rail.css('display', 'block');
            }
            return self;
        };
        this.showRailHr = function () {
            if (self.railh) {
                if ((self.page.maxw !== 0) && (self.ispage || self.win.css('display') != 'none')) {
                    self.railh.visibility = true;
                    self.railh.css('display', 'block');
                }
            }
            return self;
        };
        this.hideRails = function () {
            return self.hideRail().hideRailHr();
        };
        this.hideRail = function () {
            self.rail.visibility = false;
            self.rail.css('display', 'none');
            return self;
        };
        this.hideRailHr = function () {
            if (self.railh) {
                self.railh.visibility = false;
                self.railh.css('display', 'none');
            }
            return self;
        };
        this.show = function () {
            self.hidden = false;
            self.railslocked = false;
            return self.showRails();
        };
        this.hide = function () {
            self.hidden = true;
            self.railslocked = true;
            return self.hideRails();
        };
        this.toggle = function () {
            return (self.hidden) ? self.show() : self.hide();
        };
        this.remove = function () {
            self.stop();
            if (self.cursortimeout) clearTimeout(self.cursortimeout);
            for (var n in self.delaylist) if (self.delaylist[n]) clearAnimationFrame(self.delaylist[n].h);
            self.doZoomOut();
            self.unbindAll();
            if (cap.isie9) self.win[0].detachEvent("onpropertychange", self.onAttributeChange);
            if (self.observer !== false) self.observer.disconnect();
            if (self.observerremover !== false) self.observerremover.disconnect();
            if (self.observerbody !== false) self.observerbody.disconnect();
            self.events = null;
            if (self.cursor) {
                self.cursor.remove();
            }
            if (self.cursorh) {
                self.cursorh.remove();
            }
            if (self.rail) {
                self.rail.remove();
            }
            if (self.railh) {
                self.railh.remove();
            }
            if (self.zoom) {
                self.zoom.remove();
            }
            for (var a = 0; a < self.saved.css.length; a++) {
                var d = self.saved.css[a];
                d[0].css(d[1], (d[2] === undefined) ? '' : d[2]);
            }
            self.saved = false;
            self.me.data('__nicescroll', '');
            var lst = $.nicescroll;
            lst.each(function (i) {
                if (!this) return;
                if (this.id === self.id) {
                    delete lst[i];
                    for (var b = ++i; b < lst.length; b++, i++) lst[i] = lst[b];
                    lst.length--;
                    if (lst.length) delete lst[lst.length];
                }
            });
            for (var i in self) {
                self[i] = null;
                delete self[i];
            }
            self = null;
        };
        this.scrollstart = function (fn) {
            this.onscrollstart = fn;
            return self;
        };
        this.scrollend = function (fn) {
            this.onscrollend = fn;
            return self;
        };
        this.scrollcancel = function (fn) {
            this.onscrollcancel = fn;
            return self;
        };
        this.zoomin = function (fn) {
            this.onzoomin = fn;
            return self;
        };
        this.zoomout = function (fn) {
            this.onzoomout = fn;
            return self;
        };
        this.isScrollable = function (e) {
            var dom = (e.target) ? e.target : e;
            if (dom.nodeName == 'OPTION') return true;
            while (dom && (dom.nodeType == 1) && (dom !== this.me[0]) && !(/^BODY|HTML/.test(dom.nodeName))) {
                var dd = $(dom);
                var ov = dd.css('overflowY') || dd.css('overflowX') || dd.css('overflow') || '';
                if (/scroll|auto/.test(ov)) return (dom.clientHeight != dom.scrollHeight);
                dom = (dom.parentNode) ? dom.parentNode : false;
            }
            return false;
        };
        this.getViewport = function (me) {
            var dom = (me && me.parentNode) ? me.parentNode : false;
            while (dom && (dom.nodeType == 1) && !(/^BODY|HTML/.test(dom.nodeName))) {
                var dd = $(dom);
                if (/fixed|absolute/.test(dd.css("position"))) return dd;
                var ov = dd.css('overflowY') || dd.css('overflowX') || dd.css('overflow') || '';
                if ((/scroll|auto/.test(ov)) && (dom.clientHeight != dom.scrollHeight)) return dd;
                if (dd.getNiceScroll().length > 0) return dd;
                dom = (dom.parentNode) ? dom.parentNode : false;
            }
            return false;
        };
        this.triggerScrollStart = function (cx, cy, rx, ry, ms) {
            if (self.onscrollstart) {
                var info = {
                    type: "scrollstart",
                    current: {x: cx, y: cy},
                    request: {x: rx, y: ry},
                    end: {x: self.newscrollx, y: self.newscrolly},
                    speed: ms
                };
                self.onscrollstart.call(self, info);
            }
        };
        this.triggerScrollEnd = function () {
            if (self.onscrollend) {
                var px = self.getScrollLeft();
                var py = self.getScrollTop();
                var info = {type: "scrollend", current: {x: px, y: py}, end: {x: px, y: py}};
                self.onscrollend.call(self, info);
            }
        };
        var scrolldiry = 0, scrolldirx = 0, scrolltmr = 0, scrollspd = 1;

        function doScrollRelative(px, py, chkscroll, iswheel) {
            if (!self.scrollrunning) {
                self.newscrolly = self.getScrollTop();
                self.newscrollx = self.getScrollLeft();
                scrolltmr = now();
            }
            var gap = (now() - scrolltmr);
            scrolltmr = now();
            if (gap > 350) {
                scrollspd = 1;
            } else {
                scrollspd += (2 - scrollspd) / 10;
            }
            px = px * scrollspd | 0;
            py = py * scrollspd | 0;
            if (px) {
                if (iswheel) {
                    if (px < 0) {
                        if (self.getScrollLeft() >= self.page.maxw) return true;
                    } else {
                        if (self.getScrollLeft() <= 0) return true;
                    }
                }
                var dx = px > 0 ? 1 : -1;
                if (scrolldirx !== dx) {
                    if (self.scrollmom) self.scrollmom.stop();
                    self.newscrollx = self.getScrollLeft();
                    scrolldirx = dx;
                }
                self.lastdeltax -= px;
            }
            if (py) {
                var chk = (function () {
                    var top = self.getScrollTop();
                    if (py < 0) {
                        if (top >= self.page.maxh) return true;
                    } else {
                        if (top <= 0) return true;
                    }
                })();
                if (chk) {
                    if (opt.nativeparentscrolling && chkscroll && !self.ispage && !self.zoomactive) return true;
                    var ny = self.view.h >> 1;
                    if (self.newscrolly < -ny) {
                        self.newscrolly = -ny;
                        py = -1;
                    }
                    else if (self.newscrolly > self.page.maxh + ny) {
                        self.newscrolly = self.page.maxh + ny;
                        py = 1;
                    }
                    else py = 0;
                }
                var dy = py > 0 ? 1 : -1;
                if (scrolldiry !== dy) {
                    if (self.scrollmom) self.scrollmom.stop();
                    self.newscrolly = self.getScrollTop();
                    scrolldiry = dy;
                }
                self.lastdeltay -= py;
            }
            if (py || px) {
                self.synched("relativexy", function () {
                    var dty = self.lastdeltay + self.newscrolly;
                    self.lastdeltay = 0;
                    var dtx = self.lastdeltax + self.newscrollx;
                    self.lastdeltax = 0;
                    if (!self.rail.drag) self.doScrollPos(dtx, dty);
                });
            }
        }

        var hasparentscrollingphase = false;

        function execScrollWheel(e, hr, chkscroll) {
            var px, py;
            if (!chkscroll && hasparentscrollingphase) return true;
            if (e.deltaMode === 0) {
                px = -(e.deltaX * (opt.mousescrollstep / (18 * 3))) | 0;
                py = -(e.deltaY * (opt.mousescrollstep / (18 * 3))) | 0;
            } else if (e.deltaMode === 1) {
                px = -(e.deltaX * opt.mousescrollstep * 50 / 80) | 0;
                py = -(e.deltaY * opt.mousescrollstep * 50 / 80) | 0;
            }
            if (hr && opt.oneaxismousemode && (px === 0) && py) {
                px = py;
                py = 0;
                if (chkscroll) {
                    var hrend = (px < 0) ? (self.getScrollLeft() >= self.page.maxw) : (self.getScrollLeft() <= 0);
                    if (hrend) {
                        py = px;
                        px = 0;
                    }
                }
            }
            if (self.isrtlmode) px = -px;
            var chk = doScrollRelative(px, py, chkscroll, true);
            if (chk) {
                if (chkscroll) hasparentscrollingphase = true;
            } else {
                hasparentscrollingphase = false;
                e.stopImmediatePropagation();
                return e.preventDefault();
            }
        }

        this.onmousewheel = function (e) {
            if (self.wheelprevented || self.locked) return false;
            if (self.railslocked) {
                self.debounced("checkunlock", self.resize, 250);
                return false;
            }
            if (self.rail.drag) return self.cancelEvent(e);
            if (opt.oneaxismousemode === "auto" && e.deltaX !== 0) opt.oneaxismousemode = false;
            if (opt.oneaxismousemode && e.deltaX === 0) {
                if (!self.rail.scrollable) {
                    if (self.railh && self.railh.scrollable) {
                        return self.onmousewheelhr(e);
                    } else {
                        return true;
                    }
                }
            }
            var nw = now();
            var chk = false;
            if (opt.preservenativescrolling && ((self.checkarea + 600) < nw)) {
                self.nativescrollingarea = self.isScrollable(e);
                chk = true;
            }
            self.checkarea = nw;
            if (self.nativescrollingarea) return true;
            var ret = execScrollWheel(e, false, chk);
            if (ret) self.checkarea = 0;
            return ret;
        };
        this.onmousewheelhr = function (e) {
            if (self.wheelprevented) return;
            if (self.railslocked || !self.railh.scrollable) return true;
            if (self.rail.drag) return self.cancelEvent(e);
            var nw = now();
            var chk = false;
            if (opt.preservenativescrolling && ((self.checkarea + 600) < nw)) {
                self.nativescrollingarea = self.isScrollable(e);
                chk = true;
            }
            self.checkarea = nw;
            if (self.nativescrollingarea) return true;
            if (self.railslocked) return self.cancelEvent(e);
            return execScrollWheel(e, true, chk);
        };
        this.stop = function () {
            self.cancelScroll();
            if (self.scrollmon) self.scrollmon.stop();
            self.cursorfreezed = false;
            self.scroll.y = Math.round(self.getScrollTop() * (1 / self.scrollratio.y));
            self.noticeCursor();
            return self;
        };
        this.getTransitionSpeed = function (dif) {
            return 80 + (dif / 72) * opt.scrollspeed | 0;
        };
        if (!opt.smoothscroll) {
            this.doScrollLeft = function (x, spd) {
                var y = self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollTop = function (y, spd) {
                var x = self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollPos = function (x, y, spd) {
                var nx = (x > self.page.maxw) ? self.page.maxw : x;
                if (nx < 0) nx = 0;
                var ny = (y > self.page.maxh) ? self.page.maxh : y;
                if (ny < 0) ny = 0;
                self.synched('scroll', function () {
                    self.setScrollTop(ny);
                    self.setScrollLeft(nx);
                });
            };
            this.cancelScroll = function () {
            };
        } else if (self.ishwscroll && cap.hastransition && opt.usetransition && !!opt.smoothscroll) {
            var lasttransitionstyle = '';
            this.resetTransition = function () {
                lasttransitionstyle = '';
                self.doc.css(cap.prefixstyle + 'transition-duration', '0ms');
            };
            this.prepareTransition = function (dif, istime) {
                var ex = (istime) ? dif : self.getTransitionSpeed(dif);
                var trans = ex + 'ms';
                if (lasttransitionstyle !== trans) {
                    lasttransitionstyle = trans;
                    self.doc.css(cap.prefixstyle + 'transition-duration', trans);
                }
                return ex;
            };
            this.doScrollLeft = function (x, spd) {
                var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollTop = function (y, spd) {
                var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };
            this.cursorupdate = {
                running: false, start: function () {
                    var m = this;
                    if (m.running) return;
                    m.running = true;
                    var loop = function () {
                        if (m.running) setAnimationFrame(loop);
                        self.showCursor(self.getScrollTop(), self.getScrollLeft());
                        self.notifyScrollEvent(self.win[0]);
                    };
                    setAnimationFrame(loop);
                }, stop: function () {
                    this.running = false;
                }
            };
            this.doScrollPos = function (x, y, spd) {
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                if (((self.newscrolly - py) * (y - py) < 0) || ((self.newscrollx - px) * (x - px) < 0)) self.cancelScroll();
                if (!opt.bouncescroll) {
                    if (y < 0) y = 0; else if (y > self.page.maxh) y = self.page.maxh;
                    if (x < 0) x = 0; else if (x > self.page.maxw) x = self.page.maxw;
                } else {
                    if (y < 0) y = y / 2 | 0; else if (y > self.page.maxh) y = self.page.maxh + (y - self.page.maxh) / 2 | 0;
                    if (x < 0) x = x / 2 | 0; else if (x > self.page.maxw) x = self.page.maxw + (x - self.page.maxw) / 2 | 0;
                }
                if (self.scrollrunning && x == self.newscrollx && y == self.newscrolly) return false;
                self.newscrolly = y;
                self.newscrollx = x;
                var top = self.getScrollTop();
                var lft = self.getScrollLeft();
                var dst = {};
                dst.x = x - lft;
                dst.y = y - top;
                var dd = Math.sqrt((dst.x * dst.x) + (dst.y * dst.y)) | 0;
                var ms = self.prepareTransition(dd);
                if (!self.scrollrunning) {
                    self.scrollrunning = true;
                    self.triggerScrollStart(lft, top, x, y, ms);
                    self.cursorupdate.start();
                }
                self.scrollendtrapped = true;
                if (!cap.transitionend) {
                    if (self.scrollendtrapped) clearTimeout(self.scrollendtrapped);
                    self.scrollendtrapped = setTimeout(self.onScrollTransitionEnd, ms);
                }
                self.setScrollTop(self.newscrolly);
                self.setScrollLeft(self.newscrollx);
            };
            this.cancelScroll = function () {
                if (!self.scrollendtrapped) return true;
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                self.scrollrunning = false;
                if (!cap.transitionend) clearTimeout(cap.transitionend);
                self.scrollendtrapped = false;
                self.resetTransition();
                self.setScrollTop(py);
                if (self.railh) self.setScrollLeft(px);
                if (self.timerscroll && self.timerscroll.tm) clearInterval(self.timerscroll.tm);
                self.timerscroll = false;
                self.cursorfreezed = false;
                self.cursorupdate.stop();
                self.showCursor(py, px);
                return self;
            };
            this.onScrollTransitionEnd = function () {
                if (!self.scrollendtrapped) return;
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                if (py < 0) py = 0; else if (py > self.page.maxh) py = self.page.maxh;
                if (px < 0) px = 0; else if (px > self.page.maxw) px = self.page.maxw;
                if ((py != self.newscrolly) || (px != self.newscrollx)) return self.doScrollPos(px, py, opt.snapbackspeed);
                if (self.scrollrunning) self.triggerScrollEnd();
                self.scrollrunning = false;
                self.scrollendtrapped = false;
                self.resetTransition();
                self.timerscroll = false;
                self.setScrollTop(py);
                if (self.railh) self.setScrollLeft(px);
                self.cursorupdate.stop();
                self.noticeCursor(false, py, px);
                self.cursorfreezed = false;
            };
        } else {
            this.doScrollLeft = function (x, spd) {
                var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollTop = function (y, spd) {
                var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollPos = function (x, y, spd) {
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                if (((self.newscrolly - py) * (y - py) < 0) || ((self.newscrollx - px) * (x - px) < 0)) self.cancelScroll();
                var clipped = false;
                if (!self.bouncescroll || !self.rail.visibility) {
                    if (y < 0) {
                        y = 0;
                        clipped = true;
                    } else if (y > self.page.maxh) {
                        y = self.page.maxh;
                        clipped = true;
                    }
                }
                if (!self.bouncescroll || !self.railh.visibility) {
                    if (x < 0) {
                        x = 0;
                        clipped = true;
                    } else if (x > self.page.maxw) {
                        x = self.page.maxw;
                        clipped = true;
                    }
                }
                if (self.scrollrunning && (self.newscrolly === y) && (self.newscrollx === x)) return true;
                self.newscrolly = y;
                self.newscrollx = x;
                self.dst = {};
                self.dst.x = x - px;
                self.dst.y = y - py;
                self.dst.px = px;
                self.dst.py = py;
                var dd = Math.sqrt((self.dst.x * self.dst.x) + (self.dst.y * self.dst.y)) | 0;
                var ms = self.getTransitionSpeed(dd);
                self.bzscroll = {};
                var p3 = (clipped) ? 1 : 0.58;
                self.bzscroll.x = new BezierClass(px, self.newscrollx, ms, 0, 0, p3, 1);
                self.bzscroll.y = new BezierClass(py, self.newscrolly, ms, 0, 0, p3, 1);
                var loopid = now();
                var loop = function () {
                    if (!self.scrollrunning) return;
                    var x = self.bzscroll.y.getPos();
                    self.setScrollLeft(self.bzscroll.x.getNow());
                    self.setScrollTop(self.bzscroll.y.getNow());
                    if (x <= 1) {
                        self.timer = setAnimationFrame(loop);
                    } else {
                        self.scrollrunning = false;
                        self.timer = 0;
                        self.triggerScrollEnd();
                    }
                };
                if (!self.scrollrunning) {
                    self.triggerScrollStart(px, py, x, y, ms);
                    self.scrollrunning = true;
                    self.timer = setAnimationFrame(loop);
                }
            };
            this.cancelScroll = function () {
                if (self.timer) clearAnimationFrame(self.timer);
                self.timer = 0;
                self.bzscroll = false;
                self.scrollrunning = false;
                return self;
            };
        }
        this.doScrollBy = function (stp, relative) {
            doScrollRelative(0, stp);
        };
        this.doScrollLeftBy = function (stp, relative) {
            doScrollRelative(stp, 0);
        };
        this.doScrollTo = function (pos, relative) {
            var ny = (relative) ? Math.round(pos * self.scrollratio.y) : pos;
            if (ny < 0) ny = 0; else if (ny > self.page.maxh) ny = self.page.maxh;
            self.cursorfreezed = false;
            self.doScrollTop(pos);
        };
        this.checkContentSize = function () {
            var pg = self.getContentSize();
            if ((pg.h != self.page.h) || (pg.w != self.page.w)) self.resize(false, pg);
        };
        self.onscroll = function (e) {
            if (self.rail.drag) return;
            if (!self.cursorfreezed) {
                self.synched('scroll', function () {
                    self.scroll.y = Math.round(self.getScrollTop() / self.scrollratio.y);
                    if (self.railh) self.scroll.x = Math.round(self.getScrollLeft() / self.scrollratio.x);
                    self.noticeCursor();
                });
            }
        };
        self.bind(self.docscroll, "scroll", self.onscroll);
        this.doZoomIn = function (e) {
            if (self.zoomactive) return;
            self.zoomactive = true;
            self.zoomrestore = {style: {}};
            var lst = ['position', 'top', 'left', 'zIndex', 'backgroundColor', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
            var win = self.win[0].style;
            for (var a in lst) {
                var pp = lst[a];
                self.zoomrestore.style[pp] = (win[pp] !== undefined) ? win[pp] : '';
            }
            self.zoomrestore.style.width = self.win.css('width');
            self.zoomrestore.style.height = self.win.css('height');
            self.zoomrestore.padding = {
                w: self.win.outerWidth() - self.win.width(),
                h: self.win.outerHeight() - self.win.height()
            };
            if (cap.isios4) {
                self.zoomrestore.scrollTop = $window.scrollTop();
                $window.scrollTop(0);
            }
            self.win.css({
                position: (cap.isios4) ? "absolute" : "fixed",
                top: 0,
                left: 0,
                zIndex: globalmaxzindex + 100,
                margin: 0
            });
            var bkg = self.win.css("backgroundColor");
            if ("" === bkg || /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(bkg)) self.win.css("backgroundColor", "#fff");
            self.rail.css({zIndex: globalmaxzindex + 101});
            self.zoom.css({zIndex: globalmaxzindex + 102});
            self.zoom.css('backgroundPosition', '0 -18px');
            self.resizeZoom();
            if (self.onzoomin) self.onzoomin.call(self);
            return self.cancelEvent(e);
        };
        this.doZoomOut = function (e) {
            if (!self.zoomactive) return;
            self.zoomactive = false;
            self.win.css("margin", "");
            self.win.css(self.zoomrestore.style);
            if (cap.isios4) {
                $window.scrollTop(self.zoomrestore.scrollTop);
            }
            self.rail.css({"z-index": self.zindex});
            self.zoom.css({"z-index": self.zindex});
            self.zoomrestore = false;
            self.zoom.css('backgroundPosition', '0 0');
            self.onResize();
            if (self.onzoomout) self.onzoomout.call(self);
            return self.cancelEvent(e);
        };
        this.doZoom = function (e) {
            return (self.zoomactive) ? self.doZoomOut(e) : self.doZoomIn(e);
        };
        this.resizeZoom = function () {
            if (!self.zoomactive) return;
            var py = self.getScrollTop();
            self.win.css({
                width: $window.width() - self.zoomrestore.padding.w + "px",
                height: $window.height() - self.zoomrestore.padding.h + "px"
            });
            self.onResize();
            self.setScrollTop(Math.min(self.page.maxh, py));
        };
        this.init();
        $.nicescroll.push(this);
    };
    var ScrollMomentumClass2D = function (nc) {
        var self = this;
        this.nc = nc;
        this.lastx = 0;
        this.lasty = 0;
        this.speedx = 0;
        this.speedy = 0;
        this.lasttime = 0;
        this.steptime = 0;
        this.snapx = false;
        this.snapy = false;
        this.demulx = 0;
        this.demuly = 0;
        this.lastscrollx = -1;
        this.lastscrolly = -1;
        this.chkx = 0;
        this.chky = 0;
        this.timer = 0;
        this.reset = function (px, py) {
            self.stop();
            self.steptime = 0;
            self.lasttime = now();
            self.speedx = 0;
            self.speedy = 0;
            self.lastx = px;
            self.lasty = py;
            self.lastscrollx = -1;
            self.lastscrolly = -1;
        };
        this.update = function (px, py) {
            var tm = now();
            self.steptime = tm - self.lasttime;
            self.lasttime = tm;
            var dy = py - self.lasty;
            var dx = px - self.lastx;
            var sy = self.nc.getScrollTop();
            var sx = self.nc.getScrollLeft();
            var newy = sy + dy;
            var newx = sx + dx;
            self.snapx = (newx < 0) || (newx > self.nc.page.maxw);
            self.snapy = (newy < 0) || (newy > self.nc.page.maxh);
            self.speedx = dx;
            self.speedy = dy;
            self.lastx = px;
            self.lasty = py;
        };
        this.stop = function () {
            self.nc.unsynched("domomentum2d");
            if (self.timer) clearTimeout(self.timer);
            self.timer = 0;
            self.lastscrollx = -1;
            self.lastscrolly = -1;
        };
        this.doSnapy = function (nx, ny) {
            var snap = false;
            if (ny < 0) {
                ny = 0;
                snap = true;
            } else if (ny > self.nc.page.maxh) {
                ny = self.nc.page.maxh;
                snap = true;
            }
            if (nx < 0) {
                nx = 0;
                snap = true;
            } else if (nx > self.nc.page.maxw) {
                nx = self.nc.page.maxw;
                snap = true;
            }
            (snap) ? self.nc.doScrollPos(nx, ny, self.nc.opt.snapbackspeed) : self.nc.triggerScrollEnd();
        };
        this.doMomentum = function (gp) {
            var t = now();
            var l = (gp) ? t + gp : self.lasttime;
            var sl = self.nc.getScrollLeft();
            var st = self.nc.getScrollTop();
            var pageh = self.nc.page.maxh;
            var pagew = self.nc.page.maxw;
            self.speedx = (pagew > 0) ? Math.min(60, self.speedx) : 0;
            self.speedy = (pageh > 0) ? Math.min(60, self.speedy) : 0;
            var chk = l && (t - l) <= 60;
            if ((st < 0) || (st > pageh) || (sl < 0) || (sl > pagew)) chk = false;
            var sy = (self.speedy && chk) ? self.speedy : false;
            var sx = (self.speedx && chk) ? self.speedx : false;
            if (sy || sx) {
                var tm = Math.max(16, self.steptime);
                if (tm > 50) {
                    var xm = tm / 50;
                    self.speedx *= xm;
                    self.speedy *= xm;
                    tm = 50;
                }
                self.demulxy = 0;
                self.lastscrollx = self.nc.getScrollLeft();
                self.chkx = self.lastscrollx;
                self.lastscrolly = self.nc.getScrollTop();
                self.chky = self.lastscrolly;
                var nx = self.lastscrollx;
                var ny = self.lastscrolly;
                var onscroll = function () {
                    var df = ((now() - t) > 600) ? 0.04 : 0.02;
                    if (self.speedx) {
                        nx = Math.floor(self.lastscrollx - (self.speedx * (1 - self.demulxy)));
                        self.lastscrollx = nx;
                        if ((nx < 0) || (nx > pagew)) df = 0.10;
                    }
                    if (self.speedy) {
                        ny = Math.floor(self.lastscrolly - (self.speedy * (1 - self.demulxy)));
                        self.lastscrolly = ny;
                        if ((ny < 0) || (ny > pageh)) df = 0.10;
                    }
                    self.demulxy = Math.min(1, self.demulxy + df);
                    self.nc.synched("domomentum2d", function () {
                        if (self.speedx) {
                            var scx = self.nc.getScrollLeft();
                            self.chkx = nx;
                            self.nc.setScrollLeft(nx);
                        }
                        if (self.speedy) {
                            var scy = self.nc.getScrollTop();
                            self.chky = ny;
                            self.nc.setScrollTop(ny);
                        }
                        if (!self.timer) {
                            self.nc.hideCursor();
                            self.doSnapy(nx, ny);
                        }
                    });
                    if (self.demulxy < 1) {
                        self.timer = setTimeout(onscroll, tm);
                    } else {
                        self.stop();
                        self.nc.hideCursor();
                        self.doSnapy(nx, ny);
                    }
                };
                onscroll();
            } else {
                self.doSnapy(self.nc.getScrollLeft(), self.nc.getScrollTop());
            }
        };
    };
    var _scrollTop = jQuery.fn.scrollTop;
    jQuery.cssHooks.pageYOffset = {
        get: function (elem, computed, extra) {
            var nice = $.data(elem, '__nicescroll') || false;
            return (nice && nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(elem);
        }, set: function (elem, value) {
            var nice = $.data(elem, '__nicescroll') || false;
            (nice && nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call(elem, value);
            return this;
        }
    };
    jQuery.fn.scrollTop = function (value) {
        if (value === undefined) {
            var nice = (this[0]) ? $.data(this[0], '__nicescroll') || false : false;
            return (nice && nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(this);
        } else {
            return this.each(function () {
                var nice = $.data(this, '__nicescroll') || false;
                (nice && nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call($(this), value);
            });
        }
    };
    var _scrollLeft = jQuery.fn.scrollLeft;
    $.cssHooks.pageXOffset = {
        get: function (elem, computed, extra) {
            var nice = $.data(elem, '__nicescroll') || false;
            return (nice && nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(elem);
        }, set: function (elem, value) {
            var nice = $.data(elem, '__nicescroll') || false;
            (nice && nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call(elem, value);
            return this;
        }
    };
    jQuery.fn.scrollLeft = function (value) {
        if (value === undefined) {
            var nice = (this[0]) ? $.data(this[0], '__nicescroll') || false : false;
            return (nice && nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(this);
        } else {
            return this.each(function () {
                var nice = $.data(this, '__nicescroll') || false;
                (nice && nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call($(this), value);
            });
        }
    };
    var NiceScrollArray = function (doms) {
        var self = this;
        this.length = 0;
        this.name = "nicescrollarray";
        this.each = function (fn) {
            $.each(self, fn);
            return self;
        };
        this.push = function (nice) {
            self[self.length] = nice;
            self.length++;
        };
        this.eq = function (idx) {
            return self[idx];
        };
        if (doms) {
            for (var a = 0; a < doms.length; a++) {
                var nice = $.data(doms[a], '__nicescroll') || false;
                if (nice) {
                    this[this.length] = nice;
                    this.length++;
                }
            }
        }
        return this;
    };

    function mplex(el, lst, fn) {
        for (var a = 0, l = lst.length; a < l; a++) fn(el, lst[a]);
    }

    mplex(NiceScrollArray.prototype, ['show', 'hide', 'toggle', 'onResize', 'resize', 'remove', 'stop', 'doScrollPos'], function (e, n) {
        e[n] = function () {
            var args = arguments;
            return this.each(function () {
                this[n].apply(this, args);
            });
        };
    });
    jQuery.fn.getNiceScroll = function (index) {
        if (index === undefined) {
            return new NiceScrollArray(this);
        } else {
            return this[index] && $.data(this[index], '__nicescroll') || false;
        }
    };
    var pseudos = jQuery.expr.pseudos || jQuery.expr[':'];
    pseudos.nicescroll = function (a) {
        return $.data(a, '__nicescroll') !== undefined;
    };
    $.fn.niceScroll = function (wrapper, _opt) {
        if (_opt === undefined && typeof wrapper == "object" && !("jquery" in wrapper)) {
            _opt = wrapper;
            wrapper = false;
        }
        var ret = new NiceScrollArray();
        this.each(function () {
            var $this = $(this);
            var opt = $.extend({}, _opt);
            if (wrapper || false) {
                var wrp = $(wrapper);
                opt.doc = (wrp.length > 1) ? $(wrapper, $this) : wrp;
                opt.win = $this;
            }
            var docundef = !("doc" in opt);
            if (!docundef && !("win" in opt)) opt.win = $this;
            var nice = $this.data('__nicescroll') || false;
            if (!nice) {
                opt.doc = opt.doc || $this;
                nice = new NiceScrollClass(opt, $this);
                $this.data('__nicescroll', nice);
            }
            ret.push(nice);
        });
        return (ret.length === 1) ? ret[0] : ret;
    };
    _win.NiceScroll = {
        getjQuery: function () {
            return jQuery;
        }
    };
    if (!$.nicescroll) {
        $.nicescroll = new NiceScrollArray();
        $.nicescroll.options = _globaloptions;
    }
}));
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {
        };F.prototype = obj;
        return new F();
    };
}
(function ($, window, document, undefined) {
    var Carousel = {
        init: function (options, el) {
            var base = this;
            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);
            base.userOptions = options;
            base.loadContent();
        }, loadContent: function () {
            var base = this;
            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }
            if (typeof base.options.jsonPath === "string") {
                var url = base.options.jsonPath;

                function getData(data) {
                    if (typeof base.options.jsonSuccess === "function") {
                        base.options.jsonSuccess.apply(this, [data]);
                    } else {
                        var content = "";
                        for (var i in data["owl"]) {
                            content += data["owl"][i]["item"];
                        }
                        base.$elem.html(content);
                    }
                    base.logIn();
                }

                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        }, logIn: function (action) {
            var base = this;
            base.$elem.data("owl-originalStyles", base.$elem.attr("style")).data("owl-originalClasses", base.$elem.attr("class"));
            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible;
            base.setVars();
        }, setVars: function () {
            var base = this;
            if (base.$elem.children().length === 0) {
                return false
            }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        }, onStartup: function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();
            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();
            base.$elem.find(".owl-wrapper").css("display", "block")
            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        }, eachMoveUpdate: function () {
            var base = this;
            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();
            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        }, updateVars: function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        }, reload: function (elements) {
            var base = this;
            setTimeout(function () {
                base.updateVars();
            }, 0)
        }, watchVisibility: function () {
            var base = this;
            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                clearInterval(base.autoPlayInterval);
                clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    clearInterval(base.checkVisible);
                }
            }, 500);
        }, wrapItems: function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        }, baseClass: function () {
            var base = this;
            var hasBaseClass = base.$elem.hasClass(base.options.baseClass);
            var hasThemeClass = base.$elem.hasClass(base.options.theme);
            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }
            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        }, updateItems: function () {
            var base = this;
            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }
            var width = $(base.options.responsiveBaseWidth).width();
            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (typeof(base.options.itemsCustom) !== 'undefined' && base.options.itemsCustom !== false) {
                base.options.itemsCustom.sort(function (a, b) {
                    return a[0] - b[0];
                });
                for (var i in base.options.itemsCustom) {
                    if (typeof(base.options.itemsCustom[i]) !== 'undefined' && base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }
            } else {
                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }
                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }
                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }
                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }
                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        }, response: function () {
            var base = this, smallDelay;
            if (base.options.responsive !== true) {
                return false
            }
            var lastWindowWidth = $(window).width();
            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        clearInterval(base.autoPlayInterval);
                    }
                    clearTimeout(smallDelay);
                    smallDelay = setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            }
            $(window).resize(base.resizer)
        }, updatePosition: function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        }, appendItemsSizes: function () {
            var base = this;
            var roundPages = 0;
            var lastItem = base.itemsAmount - base.options.items;
            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this.css({"width": base.itemWidth}).data("owl-item", Number(index));
                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages)
            });
        }, appendWrapperSizes: function () {
            var base = this;
            var width = 0;
            var width = base.$owlItems.length * base.itemWidth;
            base.$owlWrapper.css({"width": width * 2, "left": 0});
            base.appendItemsSizes();
        }, calculateAll: function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        }, calculateWidth: function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items)
        }, max: function () {
            var base = this;
            var maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        }, min: function () {
            return 0;
        }, loops: function () {
            var base = this;
            base.positionsInArray = [0];
            base.pagesInArray = [];
            var prev = 0;
            var elWidth = 0;
            for (var i = 0; i < base.itemsAmount; i++) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);
                if (base.options.scrollPerPage === true) {
                    var item = $(base.$owlItems[i]);
                    var roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        }, buildControls: function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        }, buildButtons: function () {
            var base = this;
            var buttonsWrapper = $("<div class=\"owl-buttons\"/>")
            base.owlControls.append(buttonsWrapper);
            base.buttonPrev = $("<div/>", {"class": "owl-prev", "html": base.options.navigationText[0] || ""});
            base.buttonNext = $("<div/>", {"class": "owl-next", "html": base.options.navigationText[1] || ""});
            buttonsWrapper.append(base.buttonPrev).append(base.buttonNext);
            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            })
            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            })
        }, buildPagination: function () {
            var base = this;
            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);
            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        }, updatePagination: function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.html("");
            var counter = 0;
            var lastPage = base.itemsAmount - base.itemsAmount % base.options.items;
            for (var i = 0; i < base.itemsAmount; i++) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        var lastItem = base.itemsAmount - base.options.items;
                    }
                    var paginationButton = $("<div/>", {"class": "owl-page"});
                    var paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);
                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);
                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        }, checkPagination: function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function (i, v) {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper.find(".owl-page").removeClass("active");
                    $(this).addClass("active");
                }
            });
        }, checkNavigation: function () {
            var base = this;
            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        }, updateControls: function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        }, destroyControls: function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        }, next: function (speed) {
            var base = this;
            if (base.isTransition) {
                return false;
            }
            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage == true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        }, prev: function (speed) {
            var base = this;
            if (base.isTransition) {
                return false;
            }
            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind"
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        }, goTo: function (position, speed, drag) {
            var base = this;
            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            }
            else if (position <= 0) {
                position = 0;
            }
            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0)
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            var goToPixel = base.positionsInArray[position];
            if (base.browser.support3d === true) {
                base.isCss3Finish = false;
                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);
                } else {
                    base.swapSpeed("slideSpeed");
                    setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        }, jumpTo: function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            }
            else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0)
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        }, afterGo: function () {
            var base = this;
            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0)
            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();
                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        }, stop: function () {
            var base = this;
            base.apStatus = "stop";
            clearInterval(base.autoPlayInterval);
        }, checkAp: function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        }, play: function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        }, swapSpeed: function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        }, addCssSpeed: function (speed) {
            var base = this;
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        }, removeTransition: function () {
            return {"-webkit-transition": "", "-moz-transition": "", "-o-transition": "", "transition": ""};
        }, doTranslate: function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        }, transition3d: function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        }, css2move: function (value) {
            var base = this;
            base.$owlWrapper.css({"left": value})
        }, css2slide: function (value, speed) {
            var base = this;
            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({"left": value}, {
                duration: speed || base.options.slideSpeed,
                complete: function () {
                    base.isCssFinish = true;
                }
            });
        }, checkBrowser: function () {
            var base = this;
            var translate3D = "translate3d(0px, 0px, 0px)", tempElem = document.createElement("div");
            tempElem.style.cssText = "  -moz-transform:" + translate3D + "; -ms-transform:" + translate3D + "; -o-transform:" + translate3D + "; -webkit-transform:" + translate3D + "; transform:" + translate3D;
            var regex = /translate3d\(0px, 0px, 0px\)/g, asSupport = tempElem.style.cssText.match(regex),
                support3d = (asSupport !== null && asSupport.length === 1);
            var isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;
            base.browser = {"support3d": support3d, "isTouch": isTouch}
        }, moveEvents: function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        }, eventTypes: function () {
            var base = this;
            var types = ["s", "e", "x"];
            base.ev_types = {};
            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = ["touchstart.owl mousedown.owl", "touchmove.owl mousemove.owl", "touchend.owl touchcancel.owl mouseup.owl"];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = ["touchstart.owl", "touchmove.owl", "touchend.owl touchcancel.owl"];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = ["mousedown.owl", "mousemove.owl", "mouseup.owl"];
            }
            base.ev_types["start"] = types[0];
            base.ev_types["move"] = types[1];
            base.ev_types["end"] = types[2];
        }, disabledEvents: function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) {
                event.preventDefault();
            });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        }, gestures: function () {
            var base = this;
            var locals = {
                offsetX: 0,
                offsetY: 0,
                baseElWidth: 0,
                relativePos: 0,
                position: null,
                minSwipe: null,
                maxSwipe: null,
                sliding: null,
                dargging: null,
                targetElement: null
            }
            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches) {
                    return {x: event.touches[0].pageX, y: event.touches[0].pageY}
                } else {
                    if (event.pageX !== undefined) {
                        return {x: event.pageX, y: event.pageY}
                    } else {
                        return {x: event.clientX, y: event.clientY}
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types["move"], dragMove);
                    $(document).on(base.ev_types["end"], dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types["move"]);
                    $(document).off(base.ev_types["end"]);
                }
            }

            function dragStart(event) {
                var event = event.originalEvent || event || window.event;
                if (event.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.options.autoPlay !== false) {
                    clearInterval(base.autoPlayInterval);
                }
                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing")
                }
                base.newPosX = 0;
                base.newRelativeX = 0;
                $(this).css(base.removeTransition());
                var position = $(this).position();
                locals.relativePos = position.left;
                locals.offsetX = getTouches(event).x - position.left;
                locals.offsetY = getTouches(event).y - position.top;
                swapEvents("on");
                locals.sliding = false;
                locals.targetElement = event.target || event.srcElement;
            }

            function dragMove(event) {
                var event = event.originalEvent || event || window.event;
                base.newPosX = getTouches(event).x - locals.offsetX;
                base.newPosY = getTouches(event).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;
                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }
                if (base.newRelativeX > 8 || base.newRelativeX < -8 && base.browser.isTouch === true) {
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    locals.sliding = true;
                }
                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }
                var minSwipe = function () {
                    return base.newRelativeX / 5;
                }
                var maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                }
                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var event = event.originalEvent || event || window.event;
                event.target = event.target || event.srcElement;
                locals.dragging = false;
                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }
                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left"
                } else {
                    base.dragDirection = base.owl.dragDirection = "right"
                }
                if (base.newRelativeX !== 0) {
                    var newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === event.target && base.browser.isTouch !== true) {
                        $(event.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(event.target).off("click.disable");
                        });
                        var handlers = $._data(event.target, "events")["click"];
                        var owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }

            base.$elem.on(base.ev_types["start"], ".owl-wrapper", dragStart);
        }, getNewPosition: function () {
            var base = this, newPosition;
            newPosition = base.closestItem();
            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        }, closestItem: function () {
            var base = this, array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX, closest = null;
            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                }
                else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        }, moveDirection: function () {
            var base = this, direction;
            if (base.newRelativeX < 0) {
                direction = "right"
                base.playDirection = "next"
            } else {
                direction = "left"
                base.playDirection = "prev"
            }
            return direction
        }, customEvents: function () {
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item)
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item)
            });
        }, stopOnHover: function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        }, lazyLoad: function () {
            var base = this;
            if (base.options.lazyLoad === false) {
                return false;
            }
            for (var i = 0; i < base.itemsAmount; i++) {
                var $item = $(base.$owlItems[i]);
                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }
                var itemNumber = $item.data("owl-item"), $lazyImg = $item.find(".lazyOwl"), follow;
                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        }, lazyPreload: function ($item, $lazyImg) {
            var base = this, iterations = 0;
            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                var isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }
            checkLazyImage();

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {
                    setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                base.options.lazyEffect === "fade" ? $lazyImg.fadeIn(400) : $lazyImg.show();
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }
        }, autoHeight: function () {
            var base = this;
            var $currentimg = $(base.$owlItems[base.currentItem]).find("img");
            if ($currentimg.get(0) !== undefined) {
                var iterations = 0;
                checkImage();
            } else {
                addHeight();
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) {
                    setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", "");
                }
            }

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }
        }, completeImg: function (img) {
            if (!img.complete) {
                return false;
            }
            if (typeof img.naturalWidth !== "undefined" && img.naturalWidth == 0) {
                return false;
            }
            return true;
        }, onVisibleItems: function () {
            var base = this;
            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (var i = base.currentItem; i < base.currentItem + base.options.items; i++) {
                base.visibleItems.push(i);
                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        }, transitionTypes: function (className) {
            var base = this;
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        }, singleItemTransition: function () {
            var base = this;
            base.isTransition = true;
            var outClass = base.outClass, inClass = base.inClass, $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2;
            base.$owlWrapper.addClass('owl-origin').css({
                "-webkit-transform-origin": origin + "px",
                "-moz-perspective-origin": origin + "px",
                "perspective-origin": origin + "px"
            });

            function transStyles(prevPos, zindex) {
                return {"position": "relative", "left": prevPos + "px"};
            }

            var animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';
            $prevItem.css(transStyles(prevPos, 10)).addClass(outClass).on(animEnd, function () {
                base.endPrev = true;
                $prevItem.off(animEnd);
                base.clearTransStyle($prevItem, outClass);
            });
            $currentItem.addClass(inClass).on(animEnd, function () {
                base.endCurrent = true;
                $currentItem.off(animEnd);
                base.clearTransStyle($currentItem, inClass);
            });
        }, clearTransStyle: function (item, classToRemove) {
            var base = this;
            item.css({"position": "", "left": ""}).removeClass(classToRemove);
            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        }, owlStatus: function () {
            var base = this;
            base.owl = {
                "userOptions": base.userOptions,
                "baseElement": base.$elem,
                "userItems": base.$userItems,
                "owlItems": base.$owlItems,
                "currentItem": base.currentItem,
                "prevItem": base.prevItem,
                "visibleItems": base.visibleItems,
                "isTouch": base.browser.isTouch,
                "browser": base.browser,
                "dragDirection": base.dragDirection
            }
        }, clearEvents: function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        }, unWrap: function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem.attr("style", base.$elem.data("owl-originalStyles") || "").attr("class", base.$elem.data("owl-originalClasses"));
        }, destroy: function () {
            var base = this;
            base.stop();
            clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        }, reinit: function (newOptions) {
            var base = this;
            var options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        }, addItem: function (htmlString, targetPosition) {
            var base = this, position;
            if (!htmlString) {
                return false
            }
            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString)
            } else {
                base.$userItems.eq(position).before(htmlString)
            }
            base.setVars();
        }, removeItem: function (targetPosition) {
            var base = this, position;
            if (base.$elem.children().length === 0) {
                return false
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }
    };
    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };
    $.fn.owlCarousel.options = {
        items: 5,
        itemsCustom: false,
        itemsDesktop: [1199, 4],
        itemsDesktopSmall: [979, 3],
        itemsTablet: [768, 2],
        itemsTabletSmall: false,
        itemsMobile: [479, 1],
        singleItem: false,
        itemsScaleUp: false,
        slideSpeed: 200,
        paginationSpeed: 800,
        rewindSpeed: 1000,
        autoPlay: false,
        stopOnHover: false,
        navigation: false,
        navigationText: ["prev", "next"],
        rewindNav: true,
        scrollPerPage: false,
        pagination: true,
        paginationNumbers: false,
        responsive: true,
        responsiveRefreshRate: 200,
        responsiveBaseWidth: window,
        baseClass: "owl-carousel",
        theme: "owl-theme",
        lazyLoad: false,
        lazyFollow: true,
        lazyEffect: "fade",
        autoHeight: false,
        jsonPath: false,
        jsonSuccess: false,
        dragBeforeAnimFinish: true,
        mouseDrag: true,
        touchDrag: true,
        addClassActive: false,
        transitionStyle: false,
        beforeUpdate: false,
        afterUpdate: false,
        beforeInit: false,
        afterInit: false,
        beforeMove: false,
        afterMove: false,
        afterAction: false,
        startDragging: false,
        afterLazyLoad: false
    };
})(jQuery, window, document);