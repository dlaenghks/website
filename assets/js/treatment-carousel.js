(function () {
    'use strict';

    var root = document.querySelector('[data-treatment-carousel]');
    if (!root) return;

    var viewport = root.querySelector('[data-treatment-viewport]');
    var track = root.querySelector('[data-treatment-track]');
    var cards = Array.prototype.slice.call(track.children);
    var previous = root.querySelector('[data-treatment-prev]');
    var next = root.querySelector('[data-treatment-next]');
    var current = root.querySelector('[data-treatment-current]');
    var total = root.querySelector('[data-treatment-total]');
    var progress = root.querySelector('[data-treatment-progress]');
    var status = root.querySelector('[data-treatment-status]');
    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hoverPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
    var timer = 0;
    var completionTimer = 0;
    var moving = 0;
    var step = 0;
    var visibleCount = 1;
    var hoveredCard = null;
    var touching = false;
    var inView = false;
    var pointerLocked = false;
    var lastPointer = null;
    var measuredWidth = 0;
    var gesture = null;
    var suppressClick = false;
    var clickResetTimer = 0;
    var manualMove = false;

    function format(number) {
        return String(number).padStart(2, '0');
    }

    cards.forEach(function (card, index) {
        card.dataset.treatmentIndex = index;
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', '슬라이드');
        card.setAttribute('aria-label', (index + 1) + ' / ' + cards.length + ' ' + card.querySelector('h3').textContent);
        card.querySelector('img').draggable = false;

        function clearInteraction() {
            card.classList.remove('is-interacting');
        }

        card.addEventListener('pointerenter', function (event) {
            if (gesture && gesture.dragging) return;
            if (!lastPointer) lastPointer = { x: event.clientX, y: event.clientY };
            if (event.pointerType !== 'touch' && hoverPreference.matches) {
                hoveredCard = card;
                syncAutoplay();
            }
            if (!moving && !pointerLocked && event.pointerType !== 'touch' && hoverPreference.matches) {
                card.classList.add('is-interacting');
            }
        });
        card.addEventListener('pointermove', function (event) {
            if (gesture && gesture.dragging) return;
            var changed = !lastPointer || event.clientX !== lastPointer.x || event.clientY !== lastPointer.y;
            lastPointer = { x: event.clientX, y: event.clientY };
            if (!moving && changed && event.pointerType !== 'touch' && hoverPreference.matches) {
                pointerLocked = false;
                card.classList.add('is-interacting');
            }
        });
        card.addEventListener('pointerleave', function () {
            if (!card.contains(document.activeElement)) clearInteraction();
            if (hoveredCard === card) {
                hoveredCard = null;
                syncAutoplay();
            }
        });
        card.addEventListener('focusin', function () {
            if (!moving && !card.querySelector('.treatment-tile__details:focus')) {
                card.classList.add('is-interacting');
            }
        });
        card.addEventListener('focusout', function (event) {
            if (!card.contains(event.relatedTarget)) clearInteraction();
        });
        var details = card.querySelector('.treatment-tile__details');
        details.addEventListener('click', function () {
            var expanded = card.classList.toggle('is-expanded');
            details.setAttribute('aria-expanded', String(expanded));
            details.textContent = expanded ? '설명 닫기' : '설명 보기';
            syncAutoplay();
        });
    });

    total.textContent = format(cards.length);
    progress.setAttribute('aria-valuemax', cards.length);

    function measure() {
        var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        step = track.firstElementChild.getBoundingClientRect().width + gap;
        visibleCount = Math.min(cards.length, Math.max(1, Math.floor((viewport.clientWidth + gap + 1) / step)));
        measuredWidth = viewport.clientWidth;
    }

    function update() {
        var first = Number(track.firstElementChild.dataset.treatmentIndex) + 1;
        current.textContent = format(first);
        progress.style.setProperty('--treatment-progress', first / cards.length);
        progress.setAttribute('aria-valuenow', first);
        progress.setAttribute('aria-valuetext', first + ' / ' + cards.length);
        Array.prototype.forEach.call(track.children, function (card, index) {
            var hidden = index >= visibleCount;
            card.inert = hidden;
            card.setAttribute('aria-hidden', String(hidden));
        });
    }

    function resetTransform(value) {
        track.classList.add('is-resetting');
        track.style.transform = 'translate3d(' + value + 'px, 0, 0)';
        // Commit the reset before restoring the transition, so the loop never jumps.
        void track.offsetWidth;
        track.classList.remove('is-resetting');
    }

    function finishMove() {
        if (!moving) return;
        window.clearTimeout(completionTimer);
        if (moving === 1) track.appendChild(track.firstElementChild);
        resetTransform(0);
        moving = 0;
        previous.removeAttribute('aria-disabled');
        next.removeAttribute('aria-disabled');
        measure();
        update();
        root.classList.remove('is-moving');
        if (manualMove) {
            status.textContent = '가장 왼쪽 카드: ' + track.firstElementChild.querySelector('h3').textContent + ', ' + current.textContent + ' / ' + total.textContent;
        }
        manualMove = false;
    }

    function move(direction, manual, preparedPrevious) {
        if (moving || (gesture && gesture.dragging) || cards.length <= visibleCount) return;
        pointerLocked = true;
        cards.forEach(function (card) {
            card.classList.remove('is-interacting', 'is-expanded');
            var button = card.querySelector('.treatment-tile__details');
            button.setAttribute('aria-expanded', 'false');
            button.textContent = '설명 보기';
        });
        moving = direction;
        root.classList.add('is-moving');
        manualMove = !!manual;
        previous.setAttribute('aria-disabled', 'true');
        next.setAttribute('aria-disabled', 'true');
        if (direction < 0) {
            if (!preparedPrevious) {
                track.insertBefore(track.lastElementChild, track.firstElementChild);
                resetTransform(-step);
            }
            track.style.transform = 'translate3d(0, 0, 0)';
        } else {
            track.style.transform = 'translate3d(' + (-step) + 'px, 0, 0)';
        }
        if (motionPreference.matches) {
            finishMove();
        } else {
            completionTimer = window.setTimeout(finishMove, 750);
        }
    }

    track.addEventListener('transitionend', function (event) {
        if (event.target === track && event.propertyName === 'transform') finishMove();
    });

    function syncAutoplay() {
        // Hover pauses only over cards; arrow controls never block autoplay.
        var shouldPause = hoveredCard || touching || !inView || document.hidden || track.contains(document.activeElement) || root.querySelector('.is-expanded') || cards.length <= visibleCount;
        if (shouldPause) {
            window.clearInterval(timer);
            timer = 0;
        } else if (!timer) {
            // Observer callbacks must not continually restart the countdown.
            timer = window.setInterval(function () { move(1, false); }, 5000);
        }
    }

    previous.addEventListener('click', function () { move(-1, true); });
    next.addEventListener('click', function () { move(1, true); });
    root.addEventListener('focusin', syncAutoplay);
    root.addEventListener('focusout', function () { window.setTimeout(syncAutoplay, 0); });
    root.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        // Keep focus on a stable control before moving the card elements.
        (event.key === 'ArrowLeft' ? previous : next).focus();
        move(event.key === 'ArrowLeft' ? -1 : 1, true);
    });

    // A horizontal gesture moves the entire card strip, including text and links.
    // Capture only after a drag starts so ordinary link/button clicks keep working.
    viewport.addEventListener('pointerdown', function (event) {
        if (!event.isPrimary || event.button !== 0 || moving || gesture || cards.length <= visibleCount) return;
        gesture = {
            id: event.pointerId,
            type: event.pointerType,
            x: event.clientX,
            y: event.clientY,
            clientX: event.clientX,
            clientY: event.clientY,
            dx: 0,
            dragging: false,
            prepended: false
        };
        touching = true;
        syncAutoplay();
    });

    window.addEventListener('pointermove', function (event) {
        if (!gesture || event.pointerId !== gesture.id) return;
        gesture.clientX = event.clientX;
        gesture.clientY = event.clientY;
        var dx = event.clientX - gesture.x;
        var dy = event.clientY - gesture.y;

        if (!gesture.dragging) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
            if (Math.abs(dy) > Math.abs(dx) * 1.3) {
                cancelGesture();
                return;
            }
            if (Math.abs(dx) <= Math.abs(dy) * 1.3) return;
            gesture.dragging = true;
            pointerLocked = true;
            hoveredCard = null;
            window.clearTimeout(clickResetTimer);
            suppressClick = true;
            root.classList.add('is-dragging', 'is-moving');
            cards.forEach(function (card) {
                card.classList.remove('is-interacting', 'is-expanded');
                var button = card.querySelector('.treatment-tile__details');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '설명 보기';
            });
            viewport.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
        gesture.dx = Math.max(-step, Math.min(step, dx));
        // Reuse the real offscreen card on whichever side the user is dragging.
        if (gesture.dx > 0 && !gesture.prepended) {
            track.insertBefore(track.lastElementChild, track.firstElementChild);
            gesture.prepended = true;
        } else if (gesture.dx <= 0 && gesture.prepended) {
            track.appendChild(track.firstElementChild);
            gesture.prepended = false;
        }
        var offset = (gesture.prepended ? -step : 0) + gesture.dx;
        track.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
    }, { passive: false });

    function endGesture(commit, event) {
        if (!gesture) return;
        var ended = gesture;
        if (event) {
            ended.clientX = event.clientX;
            ended.clientY = event.clientY;
        }
        gesture = null;
        touching = false;
        if (viewport.hasPointerCapture(ended.id)) viewport.releasePointerCapture(ended.id);

        if (ended.dragging) {
            // Commit the dragged position before restoring the easing for the release.
            void track.offsetWidth;
            root.classList.remove('is-dragging');
            if (commit && Math.abs(ended.dx) > 45) {
                move(ended.dx < 0 ? 1 : -1, true, ended.prepended);
            } else {
                // Snap back; append the prepared previous card to restore the old order.
                moving = ended.prepended ? 1 : -1;
                manualMove = false;
                previous.setAttribute('aria-disabled', 'true');
                next.setAttribute('aria-disabled', 'true');
                track.style.transform = 'translate3d(' + (ended.prepended ? -step : 0) + 'px, 0, 0)';
                if (motionPreference.matches) finishMove();
                else completionTimer = window.setTimeout(finishMove, 750);
            }
            clickResetTimer = window.setTimeout(function () { suppressClick = false; }, 400);
            if (ended.type !== 'touch' && hoverPreference.matches) {
                var element = document.elementFromPoint(ended.clientX, ended.clientY);
                var card = element && element.closest('.treatment-tile');
                hoveredCard = card && track.contains(card) ? card : null;
            }
        }
        syncAutoplay();
    }

    function cancelGesture() {
        endGesture(false);
    }

    window.addEventListener('pointerup', function (event) {
        if (gesture && event.pointerId === gesture.id) endGesture(true, event);
    });
    window.addEventListener('pointercancel', function (event) {
        if (gesture && event.pointerId === gesture.id) cancelGesture();
    });
    viewport.addEventListener('lostpointercapture', function (event) {
        if (event.target === viewport && gesture && event.pointerId === gesture.id) cancelGesture();
    });
    viewport.addEventListener('dragstart', function (event) { event.preventDefault(); });
    viewport.addEventListener('click', function (event) {
        if (suppressClick || moving) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelGesture();
            finishMove();
        }
        syncAutoplay();
    });
    var observer = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        syncAutoplay();
    }, { threshold: 0 });
    observer.observe(root);
    new ResizeObserver(function () {
        if (viewport.clientWidth === measuredWidth) return;
        cancelGesture();
        finishMove();
        measure();
        update();
        syncAutoplay();
    }).observe(viewport);
    motionPreference.addEventListener('change', function () {
        finishMove();
        syncAutoplay();
    });

    measure();
    update();
    syncAutoplay();
}());
