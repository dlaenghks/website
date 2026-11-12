(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function pad(number) {
        return String(number + 1).padStart(2, '0');
    }

    function createSlider(root) {
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
        var pagination = root.querySelector('.hero__pagination');
        var current = 0;
        var timer;

        slides.forEach(function (_, index) {
            var button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', (index + 1) + '번 슬라이드');
            button.innerHTML = '<span>' + pad(index) + '</span><i></i>';
            button.addEventListener('click', function () {
                go(index);
                restart();
            });
            pagination.appendChild(button);
        });

        var dots = Array.prototype.slice.call(pagination.querySelectorAll('button'));

        function go(next) {
            if (next === current) return;
            slides[current].classList.remove('is-active');
            slides[current].setAttribute('aria-hidden', 'true');
            dots[current].classList.remove('is-active');
            current = (next + slides.length) % slides.length;
            slides[current].classList.add('is-active');
            slides[current].removeAttribute('aria-hidden');
            dots[current].classList.add('is-active');
        }

        function restart() {
            window.clearInterval(timer);
            if (!reduceMotion) {
                timer = window.setInterval(function () { go(current + 1); }, 6500);
            }
        }

        dots[0].classList.add('is-active');
        root.querySelector('[data-prev]').addEventListener('click', function () { go(current - 1); restart(); });
        root.querySelector('[data-next]').addEventListener('click', function () { go(current + 1); restart(); });
        restart();
    }

    document.querySelectorAll('.js-slider').forEach(createSlider);

    var header = document.querySelector('[data-header]');
    function updateHeader() {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('pageshow', updateHeader);
    updateHeader();

    var menuToggle = document.querySelector('.menu-toggle');
    var gnb = document.querySelector('.gnb');
    menuToggle.addEventListener('click', function () {
        var open = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!open));
        menuToggle.setAttribute('aria-label', open ? '메뉴 열기' : '메뉴 닫기');
        document.body.classList.toggle('menu-open', !open);
    });
    gnb.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });

    var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (element) { revealObserver.observe(element); });

    var counted = false;
    var numbers = document.querySelector('.numbers');
    var countObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting || counted) return;
        counted = true;
        document.querySelectorAll('[data-count]').forEach(function (element) {
            var target = Number(element.dataset.count);
            if (reduceMotion) {
                element.textContent = target.toLocaleString('ko-KR');
                return;
            }
            var start = performance.now();
            var duration = 1900;
            function tick(now) {
                var progress = Math.min((now - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 4);
                element.textContent = Math.max(1, Math.floor(target * eased)).toLocaleString('ko-KR');
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
        countObserver.disconnect();
    }, { threshold: 0.3 });
    if (numbers) {
        countObserver.observe(numbers);
    }

    (function standardSlider() {
        var root = document.querySelector('.js-standard');
        if (!root) return;
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-standard-slide]'));
        var currentText = root.querySelector('[data-standard-current]');
        var prevNumber = root.querySelector('[data-prev-number]');
        var nextNumber = root.querySelector('[data-next-number]');
        var prevButton = root.querySelector('[data-standard-prev]');
        var nextButton = root.querySelector('[data-standard-next]');
        var current = 0;
        var locked = false;
        var timer;

        function updateEdges() {
            currentText.textContent = pad(current);
            prevNumber.textContent = current > 0 ? pad(current - 1) : '';
            nextNumber.textContent = current < slides.length - 1 ? pad(current + 1) : '';
            prevButton.disabled = current === 0;
            nextButton.disabled = current === slides.length - 1;
        }

        function go(next, direction) {
            if (next < 0 || next >= slides.length || next === current || locked) return;
            locked = true;
            var outgoing = slides[current];
            var incoming = slides[next];
            outgoing.classList.add(direction === 'next' ? 'is-leaving-up' : 'is-leaving-down');
            incoming.classList.add(direction === 'next' ? 'is-entering-down' : 'is-entering-up');
            incoming.removeAttribute('aria-hidden');
            window.setTimeout(function () {
                outgoing.className = 'standard__slide';
                outgoing.setAttribute('aria-hidden', 'true');
                incoming.className = 'standard__slide is-active';
                current = next;
                updateEdges();
                locked = false;
            }, reduceMotion ? 30 : 850);
        }

        function restartAuto() {
            window.clearInterval(timer);
            if (!reduceMotion) {
                timer = window.setInterval(function () {
                    go(current === slides.length - 1 ? 0 : current + 1, 'next');
                }, 5000);
            }
        }

        prevButton.addEventListener('click', function () {
            go(current - 1, 'prev');
            restartAuto();
        });
        nextButton.addEventListener('click', function () {
            go(current + 1, 'next');
            restartAuto();
        });
        updateEdges();
        restartAuto();
    }());

    // Keep the displayed photo opaque until a decoded incoming photo covers it.
    // Finish an in-progress fade before applying the most recent queued selection.
    function createPhotoFader(main) {
        var busy = false;
        var pending = null;
        var loaded = Object.create(null);

        function load(src) {
            if (!loaded[src]) {
                loaded[src] = new Promise(function (resolve, reject) {
                    var image = new Image();
                    image.onload = function () {
                        if (image.decode) image.decode().then(function () { resolve(image); }, function () { resolve(image); });
                        else resolve(image);
                    };
                    image.onerror = reject;
                    image.src = src;
                });
            }
            return loaded[src];
        }

        function run() {
            if (busy || !pending) return;
            var task = pending;
            pending = null;
            busy = true;

            load(task.src).then(function (image) {
                if (pending) {
                    busy = false;
                    run();
                    return;
                }

                function commit(overlay) {
                    if (main.src !== image.src) main.src = image.src;
                    main.alt = task.alt;
                    var ready = main.decode ? main.decode().catch(function () {}) : Promise.resolve();
                    ready.then(function () {
                        task.commit();
                        if (overlay) overlay.remove();
                        busy = false;
                        run();
                    });
                }

                if (reduceMotion || main.src === image.src) {
                    commit(null);
                    return;
                }

                image.className = 'photo-fader__incoming';
                image.alt = '';
                image.setAttribute('aria-hidden', 'true');
                image.draggable = false;
                main.parentElement.appendChild(image);
                var finished = false;
                var fallback;
                function finish() {
                    if (finished) return;
                    finished = true;
                    window.clearTimeout(fallback);
                    image.removeEventListener('transitionend', onTransitionEnd);
                    commit(image);
                }
                function onTransitionEnd(event) {
                    if (event.target === image && event.propertyName === 'opacity') finish();
                }
                image.addEventListener('transitionend', onTransitionEnd);
                void image.offsetWidth;
                image.classList.add('is-visible');
                fallback = window.setTimeout(finish, 850);
            }, function () {
                // Retain the last good photo when an incoming image cannot be loaded.
                delete loaded[task.src];
                busy = false;
                run();
            });
        }

        return function (src, alt, commit) {
            pending = { src: src, alt: alt, commit: commit };
            run();
        };
    }

    (function gallery() {
        var root = document.querySelector('.js-gallery');
        if (!root) return;
        var main = root.querySelector('[data-gallery-main]');
        var number = root.querySelector('[data-gallery-number]');
        var title = root.querySelector('[data-gallery-title]');
        var text = root.querySelector('[data-gallery-text]');
        var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-gallery-thumb]'));
        var timer;
        var fadePhoto = createPhotoFader(main);

        function show(index) {
            var button = thumbs[index];
            if (!button) return;
            fadePhoto(button.dataset.src, button.dataset.alt, function () {
                title.textContent = button.dataset.title;
                text.textContent = button.dataset.text;
                number.textContent = pad(index);
                thumbs.forEach(function (thumb) { thumb.classList.remove('is-active'); });
                button.classList.add('is-active');
            });
        }

        function restart(index) {
            window.clearInterval(timer);
            var current = index;
            if (!reduceMotion) {
                timer = window.setInterval(function () {
                    current = (current + 1) % thumbs.length;
                    show(current);
                }, 5000);
            }
        }

        thumbs.forEach(function (button, index) {
            button.addEventListener('click', function () { show(index); restart(index); });
        });

        if (thumbs.length) {
            main.src = thumbs[0].dataset.src;
            main.alt = thumbs[0].dataset.alt;
            title.textContent = thumbs[0].dataset.title;
            text.textContent = thumbs[0].dataset.text;
            number.textContent = pad(0);
        }
        restart(0);
    }());

    (function care() {
        var root = document.querySelector('.js-care');
        if (!root) return;
        var main = root.querySelector('[data-care-main]');
        var number = root.querySelector('[data-care-number]');
        var label = root.querySelector('[data-care-label]');
        var copy = root.querySelector('[data-care-text]');
        var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-care-thumb]'));
        var current = 0;
        var timer = 0;
        var fadePhoto = createPhotoFader(main);

        function show(index) {
            var button = thumbs[index];
            if (!button) return;
            current = index;
            fadePhoto(button.dataset.src, button.dataset.alt, function () {
                copy.textContent = button.dataset.text;
                number.textContent = pad(index);
                label.textContent = button.dataset.label;
                thumbs.forEach(function (thumb) { thumb.classList.remove('is-active'); });
                button.classList.add('is-active');
            });
        }

        function restart() {
            window.clearInterval(timer);
            if (!reduceMotion && thumbs.length > 1) {
                timer = window.setInterval(function () { show((current + 1) % thumbs.length); }, 5000);
            }
        }

        thumbs.forEach(function (button, index) {
            button.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        if (thumbs.length) {
            main.src = thumbs[0].dataset.src;
            main.alt = thumbs[0].dataset.alt;
            copy.textContent = thumbs[0].dataset.text;
            label.textContent = thumbs[0].dataset.label;
            number.textContent = pad(0);
        }
        restart();
    }());

    (function partnerScroll() {
        var root = document.querySelector('.js-partner');
        if (!root) return;

        var scene = root.querySelector('.partner__scene');
        var shade = root.querySelector('.partner__shade');
        var content = root.querySelector('.partner__content');
        var copy = root.querySelector('.partner__copy');
        var gallery = root.querySelector('.partner__gallery');
        var track = root.querySelector('[data-partner-track]');
        var items = Array.prototype.slice.call(track.querySelectorAll('.partner__item'));
        var scrollHint = root.querySelector('.partner__scroll-hint');
        var targetProgress = 0;
        var currentProgress = 0;
        var frame = 0;
        var lastFrameTime = 0;
        var initialized = false;
        var maxShift = 0;

        function clamp(value) {
            return Math.min(1, Math.max(0, value));
        }

        function ease(value) {
            return 1 - Math.pow(1 - value, 3);
        }

        function smoothStep(value) {
            return value * value * (3 - (2 * value));
        }

        function measure() {
            maxShift = Math.max(0, track.scrollWidth - window.innerWidth + (window.innerWidth < 768 ? 24 : 40));
        }

        function readProgress() {
            var rect = root.getBoundingClientRect();
            var scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight);
            return clamp(-rect.top / scrollDistance);
        }

        function paint(progress) {
            var imageProgress = ease(clamp(progress / .42));
            var contentProgress = ease(clamp((progress - .34) / .23));
            var galleryProgress = ease(clamp((progress - .5) / .2));
            var trackProgress = smoothStep(clamp((progress - .48) / .52));
            var initialScale = window.innerWidth < 768 ? .68 : .5;
            scene.style.transform = 'scale(' + (initialScale + ((1 - initialScale) * imageProgress)).toFixed(4) + ')';
            shade.style.opacity = (.84 * imageProgress).toFixed(4);
            content.style.opacity = contentProgress.toFixed(4);
            copy.style.transform = 'translate3d(0, ' + ((1 - contentProgress) * 52).toFixed(2) + 'px, 0)';
            gallery.style.opacity = galleryProgress.toFixed(4);
            gallery.style.transform = 'translate3d(0, ' + ((1 - galleryProgress) * 64).toFixed(2) + 'px, 0)';
            track.style.transform = 'translate3d(' + (-maxShift * trackProgress).toFixed(2) + 'px, 0, 0)';
            scrollHint.style.opacity = (1 - contentProgress).toFixed(4);

            items.forEach(function (item, index) {
                if (window.innerWidth < 1025) {
                    item.style.removeProperty('opacity');
                    item.style.removeProperty('transform');
                    item.style.removeProperty('filter');
                    return;
                }

                var focus = trackProgress * Math.max(0, items.length - 1);
                var distance = Math.min(1, Math.abs(index - focus));
                item.style.opacity = (1 - (distance * .34)).toFixed(3);
                item.style.transform = 'translate3d(0, ' + (distance * 18).toFixed(2) + 'px, 0) scale(' + (1 - (distance * .075)).toFixed(4) + ')';
                item.style.filter = 'saturate(' + (1 - (distance * .2)).toFixed(3) + ') brightness(' + (1 - (distance * .12)).toFixed(3) + ')';
            });
        }

        function render(time) {
            var elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 64) : 16;
            var smoothing = 1 - Math.exp(-elapsed / 300);
            lastFrameTime = time;
            currentProgress += (targetProgress - currentProgress) * smoothing;

            if (Math.abs(targetProgress - currentProgress) < .0001) {
                currentProgress = targetProgress;
            }

            paint(currentProgress);

            if (currentProgress !== targetProgress) {
                frame = window.requestAnimationFrame(render);
            } else {
                frame = 0;
                lastFrameTime = 0;
            }
        }

        function updateTarget(immediate) {
            if (immediate) measure();
            targetProgress = readProgress();

            if (reduceMotion) return;

            if (immediate || !initialized) {
                currentProgress = targetProgress;
                initialized = true;
                paint(currentProgress);
                return;
            }

            if (!frame) {
                frame = window.requestAnimationFrame(render);
            }
        }

        window.addEventListener('scroll', function () { updateTarget(false); }, { passive: true });
        window.addEventListener('resize', function () { updateTarget(true); });
        window.addEventListener('load', function () { updateTarget(true); });
        updateTarget(true);
    }());

    (function partnerShowcaseScroll() {
        var root = document.querySelector('.js-partner-showcase');
        if (!root) return;

        var backdrop = root.querySelector('.partner-showcase__backdrop img');
        var copy = root.querySelector('.partner-showcase__copy');
        var visual = root.querySelector('.partner-showcase__visual');
        var frameElement = root.querySelector('[data-showcase-frame]');
        var slides = Array.prototype.slice.call(root.querySelectorAll('.partner-showcase__item'));
        var steps = Array.prototype.slice.call(root.querySelectorAll('.partner-showcase__steps li'));
        var current = root.querySelector('[data-showcase-current]');
        var targetProgress = 0;
        var currentProgress = 0;
        var frame = 0;
        var lastFrameTime = 0;
        var initialized = false;
        var activeIndex = -1;

        function clamp(value) {
            return Math.min(1, Math.max(0, value));
        }

        function ease(value) {
            return 1 - Math.pow(1 - value, 3);
        }

        function readProgress() {
            var rect = root.getBoundingClientRect();
            var scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight);
            return clamp(-rect.top / scrollDistance);
        }

        function paint(progress) {
            var introProgress = ease(clamp(progress / .16));
            var sceneProgress = clamp((progress - .12) / .8);
            var scenePosition = sceneProgress * Math.max(0, slides.length - 1);
            var nextIndex = Math.min(slides.length - 1, Math.floor(scenePosition + .5));
            var usesSplitLayout = window.innerWidth >= 760;

            backdrop.style.transform = 'scale(' + (1.08 - (.045 * progress)).toFixed(4) + ')';
            copy.style.opacity = introProgress.toFixed(4);
            visual.style.opacity = introProgress.toFixed(4);

            if (usesSplitLayout) {
                copy.style.transform = 'translate3d(0, ' + ((1 - introProgress) * 48).toFixed(2) + 'px, 0) translateY(-50%)';
                visual.style.transform = 'translate3d(' + ((1 - introProgress) * 40).toFixed(2) + 'px, -50%, 0)';
            } else {
                copy.style.transform = 'translate3d(0, ' + ((1 - introProgress) * 40).toFixed(2) + 'px, 0)';
                visual.style.transform = 'translate3d(0, ' + ((1 - introProgress) * 36).toFixed(2) + 'px, 0)';
            }

            frameElement.style.clipPath = 'inset(' + ((1 - introProgress) * 100).toFixed(2) + '% 0 0 0)';

            slides.forEach(function (slide, index) {
                var signedDistance = index - scenePosition;
                var distance = Math.abs(signedDistance);
                var fadeRate = signedDistance < 0 ? 1.75 : 1.25;
                var visibility = clamp(1 - (distance * fadeRate));
                slide.style.opacity = visibility.toFixed(4);
                slide.style.transform = 'translate3d(0, ' + (signedDistance * 5).toFixed(3) + '%, 0) scale(' + (1.02 + (Math.min(1, distance) * .045)).toFixed(4) + ')';
            });

            if (nextIndex !== activeIndex) {
                activeIndex = nextIndex;
                current.textContent = String(activeIndex + 1).padStart(2, '0');
                steps.forEach(function (step, index) {
                    step.classList.toggle('is-active', index === activeIndex);
                });
            }
        }

        function render(time) {
            var elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 64) : 16;
            var smoothing = 1 - Math.exp(-elapsed / 260);
            lastFrameTime = time;
            currentProgress += (targetProgress - currentProgress) * smoothing;

            if (Math.abs(targetProgress - currentProgress) < .0001) {
                currentProgress = targetProgress;
            }

            paint(currentProgress);

            if (currentProgress !== targetProgress) {
                frame = window.requestAnimationFrame(render);
            } else {
                frame = 0;
                lastFrameTime = 0;
            }
        }

        function updateTarget(immediate) {
            targetProgress = readProgress();
            if (reduceMotion) return;

            if (immediate || !initialized) {
                currentProgress = targetProgress;
                initialized = true;
                paint(currentProgress);
                return;
            }

            if (!frame) frame = window.requestAnimationFrame(render);
        }

        window.addEventListener('scroll', function () { updateTarget(false); }, { passive: true });
        window.addEventListener('resize', function () { updateTarget(true); });
        window.addEventListener('load', function () { updateTarget(true); });
        updateTarget(true);
    }());
    document.querySelectorAll('.accordion__button').forEach(function (button) {
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            var panel = button.nextElementSibling;
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    });
}());
