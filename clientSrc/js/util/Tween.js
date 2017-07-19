/*
* Tween.js
*/

define([], function () {
    "use strict";

    /*
    * null-pattern callback
    */
    function nullfn () {};

    /*
    * default interpolator (linear)
    */
    function defaultInterpolate (i) {
        return i;
    };

    /**
    * Interpolation helper controller
    *
    * @param {Number} start - initial interpolation value
    * @param {Number} stop - ending interpolation value
    * @param {Number} duration - how long between start and stop values in millies
    *
    * @class Tween
    * @public
    */
    var Tween = function Tween (start, stop, duration) {
        this.startValue = start;
        this.stopValue = stop;
        this.duration = duration;
        this.interpolate = defaultInterpolate;
        this.step = nullfn;
        this.complete = nullfn;
        this.cbContext = null;
        this.timer = undefined;
    };

    /**
    * optionally set the context for the callbacks, (this pointer)
    *
    * @param {Object} context - what 'this' will point to in the callbacks
    * @return {Object}
    *
    * @method {set/get} context
    * @public
    */
    Object.defineProperty(Tween.prototype, "context", {
        set: function (val) {
            this.cbContext = val;
        },
        get: function () {
            return this.cbContext;
        }
    });

    /**
    * callback made on every step of interpolation
    *
    * @param {Function} onStep
    * @return {Function} onStep
    *
    * @method {set/get} onStep
    * @public
    */
    Object.defineProperty(Tween.prototype, "onStep", {
        set: function (val) {
            this.step = typeof val === "function" ? val : nullfn;
        },
        get: function () {
            return this.step;
        }
    });

    /**
    * callback made on when interpolation completes
    *
    * @param {Function} onComplete
    * @return {Function} onComplete
    *
    * @method {set/get} onComplete
    * @public
    */
    Object.defineProperty(Tween.prototype, "onComplete", {
        set: function (val) {
            this.complete = typeof val === "function" ? val : nullfn;
        },
        get: function () {
            return this.complete;
        }
    });

    /**
    * predicate to override interpolation method, defaults to ease-in
    *
    * @param {Function} interpolation
    * @return {Function} interpolation
    *
    * @method {set/get} interpolation
    * @public
    */
    Object.defineProperty(Tween.prototype, "interpolation", {
        set: function (val) {
            this.interpolate = typeof val === "function" ? val : defaultInterpolate;
        },
        get: function () {
            return this.interpolate;
        }
    });

    /**
    * start interpolation
    *
    * @method start
    * @public
    */
    Object.defineProperty(Tween.prototype, "start", {
        value: function () {
            if (!this.timer) {
                this.startTime = Date.now();
                this.timer = setInterval($.proxy(function () {
                    if (updateTween(this)) {
                        clearInterval(this.timer);
                        this.timer = undefined;
                        this.complete.call(this.context);
                    }
                }, this));
            }
        }
    })

    /**
    * stop value interpolation
    *
    * @method stop
    * @public
    */
    Object.defineProperty(Tween.prototype, "stop", {
        value: function () {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = undefined;
            }
        }
    });

    /**
    * run interpolation logic 
    *
    * @param {Tween} tween - the Tween object to interpolate
    * @return {Boolean} true: interpolation is complete
    *
    * @method updateTween
    * @private
    */
    function updateTween(tween) {
        var interp = tween.interpolate(Math.clamp(Date.now() - tween.startTime / tween.duration, 0, 1)),
            current = tween.startValue + ((tween.stopValue - tween.startValue) * interp);

        tween.step.call(tween.context, current);

        return interp >= 1;
    }

    return Tween;
});