
/* ====================
   Daum 지도 실행 스크립트
   ==================== */
try {
    new daum.roughmap.Lander({
        "timestamp" : "1763693511773",
        "key" : "cx676jw432g",
    }).render();
} catch(e) {
    // 지도 스크립트가 없는 페이지에서의 에러 방지
}


/* ====================
   [1] 헤더 스크롤 이벤트
   ==================== */
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    const header = document.getElementById('smartHeader');
    // header 요소가 없을 경우 에러 방지
    if (header) {
        const delta = 5; 
        const headerHeight = header.offsetHeight;

        window.addEventListener('scroll', function() {
            let scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (Math.abs(lastScrollTop - scrollTop) <= delta) return;
            if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                header.classList.add('hide');
            } else {
                if(scrollTop + window.innerHeight < document.body.scrollHeight) {
                    header.classList.remove('hide');
                }
            }
            lastScrollTop = scrollTop;
        });
    }
});


/* ====================
   [2] 메인 스크립트 모음
   ==================== */
document.addEventListener('DOMContentLoaded', () => {

    // 1. 스크롤 애니메이션
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
            else entry.target.classList.remove('active');
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.text-animate').forEach(target => observer.observe(target));


    // 2. 메인 슬라이더 (Hero)
    const heroTrack = document.getElementById('heroTrack');
    if (heroTrack) {
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
    }


    // 3. 서브 슬라이더
    const subContainer = document.querySelector('.sub-slider-container');
    const subTrack = document.getElementById('subTrack');
    if (subContainer && subTrack) {
        const subSlides = document.querySelectorAll('.sub-slider-container .slide-item');
        const subTotal = subSlides.length;
        let subIndex = 0;

        function moveSubSlider() {
            subIndex++;
            const isMobile = window.innerWidth <= 768;
            const slidesPerView = isMobile ? 1 : 3;
            const maxIndex = isMobile ? subTotal - 1 : subTotal - slidesPerView;
            
            if (subIndex > maxIndex) subIndex = 0;

            if (isMobile) {
                const currentSlide = subSlides[0];
                const realSlideWidth = currentSlide.offsetWidth;
                const containerWidth = subContainer.clientWidth;
                const centerPos = containerWidth / 2;
                const slideCenterPos = (subIndex * realSlideWidth) + (realSlideWidth / 2);
                const finalTranslate = centerPos - slideCenterPos;
                subTrack.style.transform = `translateX(${finalTranslate}px)`;
            } else {
                const slideWidth = subContainer.clientWidth / 3;
                subTrack.style.transform = `translateX(-${subIndex * slideWidth}px)`;
            }
        }

        let subInterval = setInterval(moveSubSlider, 3000);

        window.addEventListener('resize', () => {
            subIndex = -1;
            moveSubSlider();
        });

        setTimeout(() => {
            subIndex = -1;
            moveSubSlider();
        }, 50);
    }


    // 4. 하단 갤러리 로직 (인테리어 영역)
    const galleryTrack = document.getElementById('track');
    if (galleryTrack) {
        // 기존 변수명(items, currentIndex)과 충돌 방지를 위해 명확히 구분
        const galleryItems = document.querySelectorAll('.thumb-item');
        const mainImage = document.getElementById('mainImage');
        
        let galleryCurrentIndex = 0;
        const totalSlides = galleryItems.length;
        const visibleSlides = 3;
        
        // 초기 이미지 로드 체크
        if(galleryItems.length > 0) updateMainView(0);

        function updateMainView(index) {
            galleryItems.forEach(item => item.classList.remove('active'));
            if(galleryItems[index]) galleryItems[index].classList.add('active');
            
            if(mainImage && galleryItems[index]) {
                const newSrc = galleryItems[index].getAttribute('data-img');
                mainImage.src = newSrc;
            }
            
            const movePercentage = index * (100 / visibleSlides);
            galleryTrack.style.transform = `translateX(-${movePercentage}%)`;
        }

        function nextGallerySlide() {
            galleryCurrentIndex++;
            if (galleryCurrentIndex > totalSlides - visibleSlides) {
                galleryCurrentIndex = 0;
            }
            updateMainView(galleryCurrentIndex);
        }

        let galleryInterval = setInterval(nextGallerySlide, 3000);

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (index <= totalSlides - visibleSlides) {
                    galleryCurrentIndex = index;
                    updateMainView(galleryCurrentIndex);
                    clearInterval(galleryInterval);
                    galleryInterval = setInterval(nextGallerySlide, 3000);
                }
            });
        });
    }

    // 5. 연혁 슬라이더 (History Slider)
    // * 기존 코드와 변수명 충돌 방지를 위해 history 접두사 사용
    const historyData = [
        {
            title: '병원과 발달클리닉<br>유기적인 연계',
            desc: '3층 소아청소년과 및 2층 아동발달클리닉의 연계를 통해<br>발달 지연에 대한 의학적 진단과 평가, 상담, 치료 연계가<br>가능합니다.',
            imgUrl: 'http://woorikidsclinic.co.kr/base/main_side_01.webp'
        },
        {
            title: '전인적 성장을 위한<br>통합적인 발달 지원',
            desc: '아이의 전인적 성장을 위해 현재 상태와 발달 수준에 따른<br>다양한 전문 치료 프로그램을 운영하고, 각 영역이 유기적으로<br>발달할 수 있도록 돕습니다.',
            imgUrl: 'http://woorikidsclinic.co.kr/base/main_side_02.webp'
        },
        {
            title: '종합병원 다년간 근무,<br>능력있는 치료사',
            desc: '종합병원 발달클리닉에서 다년간 근무한 경험이 있는<br>치료사들이 경험과 능력을 토대로 아이들에 대해<br>1:1 맞춤 치료를 합니다.',
            imgUrl: 'http://woorikidsclinic.co.kr/base/main_side_03.webp'
        },
        {
            title: '초보 운전도 걱정없는<br>넓고 편안한 주차 환경',
            desc: '근처 병의원, 발달 클리닉 중 가장<br>넓고 편한 주차 환경을 제공합니다.',
            imgUrl: 'http://woorikidsclinic.co.kr/base/main_side_04.webp'
        }
    ];

    const historyNavItems = document.querySelectorAll('.nav-item');
    // history-slider가 있는 페이지에서만 실행
    if (historyNavItems.length > 0) {
        let historyIndex = 0;
        let historyIntervalId = null;
        
        const historyBg = document.getElementById('main-bg');
        const historyText = document.getElementById('main-text');

        // 초기 이미지 설정
        if(historyBg && historyData[0]) historyBg.style.backgroundImage = `url('${historyData[0].imgUrl}')`;

        function updateHistorySlide(index) {
            historyNavItems.forEach(item => item.classList.remove('active'));
            if(historyNavItems[index]) historyNavItems[index].classList.add('active');

            if (historyText && historyBg) {
                historyText.style.opacity = 0;
                historyText.style.transform = 'translateY(30px)';
                historyBg.style.opacity = 0.5;

                setTimeout(() => {
                    historyText.querySelector('h2').innerHTML = historyData[index].title;
                    historyText.querySelector('p').innerHTML = historyData[index].desc;
                    historyBg.style.backgroundImage = `url('${historyData[index].imgUrl}')`;
                    
                    historyBg.style.opacity = 1;
                    historyText.style.opacity = 1;
                    historyText.style.transform = 'translateY(0)';
                }, 300);
            }
            historyIndex = index;
        }

        function startHistoryRolling() {
            if (historyIntervalId) return; 
            historyIntervalId = setInterval(() => {
                let nextIndex = (historyIndex + 1) % historyData.length;
                updateHistorySlide(nextIndex);
            }, 3000);
        }

        function stopHistoryRolling() {
            if (historyIntervalId) {
                clearInterval(historyIntervalId);
                historyIntervalId = null;
            }
        }

        historyNavItems.forEach((item, index) => {
            // PC: Hover
            item.addEventListener('mouseenter', () => {
                stopHistoryRolling();
                updateHistorySlide(index);
            });
            item.addEventListener('mouseleave', () => {
                startHistoryRolling();
            });
            // Mobile: Click
            item.addEventListener('click', () => {
                stopHistoryRolling();
                updateHistorySlide(index);
            });
        });

        startHistoryRolling();
    }



});