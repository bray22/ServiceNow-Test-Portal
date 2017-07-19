/*
* DanStuff.js
*/

define(["three", "jquery", "view/BalloonView"], function (THREE, $, BalloonView) {
    "use strict";

    return {

        "3D": function () {
            function _renderScene() {
                requestAnimationFrame(_renderScene);
                renderer.render(scene, camera);
            }

            var scene = new THREE.Scene(),
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000000),
                renderer = new THREE.WebGLRenderer();

            renderer.setSize(window.innerWidth, window.innerHeight);

            scene.fog = new THREE.FogExp2( 0x007db8, 0.00069 );

            $("#content-body").append(renderer.domElement);

            $(window).on("resize", function () {
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.render(scene, camera);
            });

            scene.add(new THREE.Mesh( 
                new THREE.BoxGeometry( window.innerWidth, window.innerHeight, 10000000 ), 
                new THREE.MeshPhongMaterial( {
                    color: 0x0E7A9E,
                    side: THREE.BackSide
                })));

            renderer.render(scene, camera);

            $("#powered-by").css("color", "#FFF");
        },

        BUBBLES: function () {
            var width = window.innerWidth,
                height = window.innerHeight,
                count = 2000,
                i = 0;

            for (; i < count; i++) {
                setTimeout(function () {
                    new BalloonView({
                        message: "New Defect Assigned!",
                        x: Math.random() * width,
                        y: Math.random() * height
                    });
                }, i * 50);
            }
        },

        Tease: function () {
            var balloon = new BalloonView({
                message: "Click <a href='javascript:;'>here</a> to get a raise!",
                x: window.innerWidth * 0.5,
                y: window.innerHeight * 0.5
            });

            var $link = balloon.$el.find("a");

            $(document).on("mousemove.tease", function (e) {
                var o = $link.offset(),
                    dx = o.left - e.pageX,
                    dy = o.top - e.pageY,
                    dist = Math.sqrt((dx * dx) + (dy * dy)),
                    den = dx + dy,
                    nx = dx / den,
                    ny = dy / den,
                    dDist = 150 - dist;

                nx *= dx < 0 ? -1 : 1;
                ny *= dy < 0 ? -1 : 1;

                if (dist < 150) {
                    balloon.$el.css({
                        left: "+=" + (nx * dDist),
                        top: "+=" + (ny * dDist)
                    });

                    var now = balloon.$el.offset();

                    if (now.left < 0 || now.left + balloon.$el.width() > window.innerWidth
                        || now.top < 0 || now.top + balloon.$el.height() > window.innerHeight) {
                        balloon.$el.css({
                            left: Math.random() * window.innerWidth,
                            top: Math.random() * window.innerHeight
                        });
                    }
                }
            });
        },

        Dance: function () {
            var widgets = require("app").HubView.getActiveDesktopModel().get("WidgetCollection");

            widgets.each(function (model) {
                setInterval((function (m) {
                    return function () {
                        m.trigger("configure");
                    };
                }(model)), Math.clamp(Math.random() * 3000, 1000, 2000));
            });
        }
    };
});