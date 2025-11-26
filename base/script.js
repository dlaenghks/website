/* ====================
   Daum 지도 실행 스크립트
   ==================== */
new daum.roughmap.Lander({
    "timestamp" : "1763693511773",
    "key" : "cx676jw432g",
}).render();


/* ====================
   [신규 추가] 스크롤 방향에 따른 헤더 숨김/노출 로직
   ==================== */
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    const header = document.getElementById('smartHeader');
    const delta = 5; // 약간의 스크롤은 무시 (민감도 조절)
    const headerHeight = header.offsetHeight;

    window.addEventListener('scroll', function() {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;

        // 바운스 효과로 인해 scrollTop이 음수가 되는 경우 방지
        if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

        // 스크롤을 내렸을 때 && 헤더 높이보다 더 많이 내려갔을 때 -> 숨김
        if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
            header.classList.add('hide');
        } else {
            // 스크롤을 올렸을 때 -> 보임
            if(scrollTop + window.innerHeight < document.body.scrollHeight) {
                header.classList.remove('hide');
            }
        }
        
        lastScrollTop = scrollTop;
    });
});


document.addEventListener('DOMContentLoaded', () => {

    // 스크롤 애니메이션
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
            else entry.target.classList.remove('active');
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.text-animate').forEach(target => observer.observe(target));


    // 메인 슬라이더
    const heroTrack = document.getElementById('heroTrack');
    const dots = document.querySelectorAll('.dot');
    let heroIndex = 0;

    function updateHeroSlide(index) {
        heroTrack.style.transform = `translateX(-${index * 25}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        heroIndex = index;
    }

    function nextHeroSlide() { updateHeroSlide((heroIndex + 1) % 4); }

    let heroInterval = setInterval(nextHeroSlide, 3000);

    dots.forEach(dot => dot.addEventListener('click', (e) => {
        updateHeroSlide(parseInt(e.target.dataset.index));
        clearInterval(heroInterval); heroInterval = setInterval(nextHeroSlide, 3000);
    }));


    // ==========================================
    // [최종 수정] 서브 슬라이더 JS (비율 강제 적용)
    // ==========================================
    const subContainer = document.querySelector('.sub-slider-container');
    const subTrack = document.getElementById('subTrack');
    const subSlides = document.querySelectorAll('.sub-slider-container .slide-item');
    const subTotal = subSlides.length;
    let subIndex = 0;

    function moveSubSlider() {
        subIndex++;

        // 1. 모바일 체크
        const isMobile = window.innerWidth <= 768;
        
        // 2. 화면당 개수
        const slidesPerView = isMobile ? 1 : 3;

        // 3. 리셋 로직
        const maxIndex = isMobile ? subTotal - 1 : subTotal - slidesPerView;
        if (subIndex > maxIndex) {
            subIndex = 0;
        }

        if (isMobile) {
            // [모바일 정밀 보정 로직]
            // 실제 렌더링된 슬라이드 하나의 너비를 가져옵니다. (오차 없음)
            const currentSlide = subSlides[0];
            const realSlideWidth = currentSlide.offsetWidth;
            const containerWidth = subContainer.clientWidth;

            // 공식: (컨테이너의 중앙) - (슬라이드의 중앙)
            // 컨테이너 중앙 = containerWidth / 2
            // 슬라이드 중앙(현재 인덱스 기준) = (인덱스 * 너비) + (너비 / 2)
            
            const centerPos = containerWidth / 2;
            const slideCenterPos = (subIndex * realSlideWidth) + (realSlideWidth / 2);
            
            // 이동해야 할 거리 (왼쪽으로 가야 하므로 결과값은 보통 음수가 나옴, 여기선 양수로 계산하고 아래에서 - 붙임)
            // 우리는 transform: translateX(값)을 쓸 것이므로, (중앙 - 슬라이드위치) 값을 그대로 넣습니다.
            const finalTranslate = centerPos - slideCenterPos;

            subTrack.style.transform = `translateX(${finalTranslate}px)`;

        } else {
            // [PC 로직]
            // PC는 기존 방식(단순 이동) 유지
            const slideWidth = subContainer.clientWidth / 3;
            subTrack.style.transform = `translateX(-${subIndex * slideWidth}px)`;
        }
    }

    // 3초마다 실행
    let subInterval = setInterval(moveSubSlider, 3000);

    // 리사이즈 시 위치 초기화
    window.addEventListener('resize', () => {
        subIndex = -1;
        moveSubSlider();
    });

    // 로딩 직후 초기 위치 잡기 (모바일 중앙 정렬 위해 필수)
    setTimeout(() => {
        subIndex = -1; // 0번이 중앙에 오도록 세팅
        moveSubSlider();
    }, 50);


    // [하단 갤러리 로직]

    const track = document.getElementById('track');
    const items = document.querySelectorAll('.thumb-item');
    const mainImage = document.getElementById('mainImage');
    
    let currentIndex = 0;
    const totalSlides = items.length; // 10개
    const visibleSlides = 3; // 한 번에 보이는 개수
    
    updateMainView(0);

    function updateMainView(index) {
        items.forEach(item => item.classList.remove('active'));
        items[index].classList.add('active');
        const newSrc = items[index].getAttribute('data-img');
        mainImage.src = newSrc;
        
        const movePercentage = index * (100 / visibleSlides);
        track.style.transform = `translateX(-${movePercentage}%)`;
    }

    function nextGallerySlide() {
        currentIndex++;
        if (currentIndex > totalSlides - visibleSlides) {
            currentIndex = 0;
        }
        updateMainView(currentIndex);
    }

    // 3초마다 자동 롤링 (변수명 충돌 방지를 위해 galleryInterval로 변경)
    let galleryInterval = setInterval(nextGallerySlide, 3000);

    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index <= totalSlides - visibleSlides) {
                currentIndex = index;
                updateMainView(currentIndex);
                clearInterval(galleryInterval);
                galleryInterval = setInterval(nextGallerySlide, 3000);
            }
        });
    });

});