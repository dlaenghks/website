(function () {
    'use strict';

    document.querySelectorAll('[data-reasons]').forEach(function (root) {
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-reason-card]'));
        if (!cards.length) return;

        var active = 0;
        var hovered = null;
        var focused = null;
        var timer = 0;
        var inView = false;

        function activate(index) {
            active = index;
            cards.forEach(function (card, cardIndex) {
                card.classList.toggle('is-active', cardIndex === active);
            });
        }

        function pause() {
            window.clearTimeout(timer);
            timer = 0;
        }

        function resume() {
            pause();
            if (!inView || document.hidden || hovered !== null || focused !== null || cards.length < 2) return;
            timer = window.setTimeout(function () {
                timer = 0;
                activate((active + 1) % cards.length);
                resume();
            }, 3000);
        }

        cards.forEach(function (card, index) {
            card.addEventListener('pointerenter', function (event) {
                if (event.pointerType === 'touch') return;
                hovered = index;
                activate(index);
                pause();
            });

            card.addEventListener('pointerleave', function (event) {
                if (event.pointerType === 'touch') return;
                hovered = null;
                if (focused !== null) activate(focused);
                resume();
            });

            card.addEventListener('focusin', function () {
                focused = index;
                if (hovered === null) activate(index);
                pause();
            });

            card.addEventListener('focusout', function (event) {
                if (card.contains(event.relatedTarget)) return;
                focused = null;
                if (hovered !== null) activate(hovered);
                resume();
            });
        });

        new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
            resume();
        }, { threshold: 0 }).observe(root);

        document.addEventListener('visibilitychange', resume);
        activate(0);
    });
}());
