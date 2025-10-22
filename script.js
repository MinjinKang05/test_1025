// script.js 파일의 모든 내용을 이 코드로 교체하세요.

document.addEventListener('DOMContentLoaded', () => {

    // Debounce 함수 (성능 최적화를 위해)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===== 스크롤 진행 표시기 =====
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;
        if (scrollProgressBar) {
            scrollProgressBar.style.width = scrollProgress + '%';
        }
    }

    // 1. 점수/레벨 및 STAGE 바 업데이트 (+ 레벨업 애니메이션)
    const statusScoreEl = document.getElementById('status-score');
    const statusLevelEl = document.getElementById('status-level');
    const statusTimeEl = document.getElementById('status-time');
    let score = 0;
    let currentLevel = 1;
    let time = 0;

    const handleScrollUpdates = () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        score = Math.floor(scrollTop * 1.5);
        if (statusScoreEl) {
            statusScoreEl.textContent = String(score).padStart(4, '0');
        }
        
        const newLevel = Math.min(10, Math.floor(scrollTop / 1000) + 1);
        if (statusLevelEl) {
            if (newLevel > currentLevel) {
                statusLevelEl.classList.add('level-up');
                setTimeout(() => {
                    statusLevelEl.classList.remove('level-up');
                }, 500);
            }
            currentLevel = newLevel;
            statusLevelEl.textContent = String(currentLevel).padStart(2, '0');
        }
        updateProgressBar();
        updateScrollProgress();
        // handleAboutImageParallax(); // 이미지 스크롤 효과(패럴랙스)를 제거하기 위해 이 줄을 주석 처리
    };

    window.addEventListener('scroll', debounce(handleScrollUpdates, 10));

    // 시간 카운터
    setInterval(() => {
        time++;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        if (statusTimeEl) {
            statusTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);

   // 2. 초기 배경 (쌓여있는 블록) 생성
    const tetrisBg = document.getElementById('tetrisBg');
    if (tetrisBg) {
        const colors = ['#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1'];
        const heroSection = document.querySelector('.hero');
        const heroHeight = heroSection.offsetHeight;
        const blockSize = 30;
        const cols = Math.floor(window.innerWidth / blockSize) + 1;
        const rows = 12;
        const board = Array.from({ length: rows }, () => Array(cols).fill(0));
        for (let r = rows - 1; r >= 0; r--) {
            for (let c = 0; c < cols; c++) {
                if (r === rows - 1 || board[r + 1][c] || (c > 0 && board[r + 1][c - 1]) || (c < cols - 1 && board[r + 1][c + 1])) {
                    if (Math.random() < 0.8) board[r][c] = 1;
                }
            }
        }
        const fragment = document.createDocumentFragment();
        board.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell === 1) {
                    const block = document.createElement('div');
                    block.className = 'tetris-block';
                    block.style.top = `${heroHeight - (rows - r) * blockSize}px`;
                    block.style.left = `${c * blockSize}px`;
                    block.style.width = `${blockSize}px`;
                    block.style.height = `${blockSize}px`;
                    block.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    block.style.animationDelay = `${Math.random() * 1.5}s`;
                    fragment.appendChild(block);
                }
            });
        });
        tetrisBg.appendChild(fragment);
    }

    // 3. STAGE 바(Progress Bar) 로직
    const progressBlocksContainer = document.getElementById('stageBlocks');
    const totalBlocks = 20;
    let lastFilledCount = 0;
    if (progressBlocksContainer) {
        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.className = 'progress-block';
            progressBlocksContainer.appendChild(block);
        }
    }
    const progressBlocks = document.querySelectorAll('.progress-block');

    function updateProgressBar() {
        if(!progressBlocks.length) return;
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const filledCount = Math.floor(scrollPercent * totalBlocks);
        if (filledCount > lastFilledCount) {
            for (let i = lastFilledCount; i < filledCount; i++) {
                setTimeout(() => { if (progressBlocks[i]) progressBlocks[i].classList.add('filled'); }, (i - lastFilledCount) * 40);
            }
        } else if (filledCount < lastFilledCount) {
            for (let i = filledCount; i < lastFilledCount; i++) {
                if (progressBlocks[i]) progressBlocks[i].classList.remove('filled');
            }
        }
        lastFilledCount = filledCount;
    }

    // 4. 스크롤에 따른 요소 등장 애니메이션
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // 5. 히어로 패널 3D 마우스 인터랙션
    const heroPanel = document.getElementById('hero-panel');
    if (heroPanel) {
        heroPanel.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = heroPanel.getBoundingClientRect();
            const x = e.clientX - left - width / 2;
            const y = e.clientY - top - height / 2;
            const rotateX = (y / height) * -15;
            const rotateY = (x / width) * 15;
            heroPanel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        heroPanel.addEventListener('mouseleave', () => {
            heroPanel.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }

    // 6. 프로젝트 뷰어
    const categoryContainer = document.querySelector('.work-categories');
    const projectDisplayArea = document.querySelector('.project-display-area');

    if (projectDisplayArea && categoryContainer) {
        const titleEl = document.getElementById('project-title');
        const subtitleEl = document.getElementById('project-subtitle');
        const descriptionEl = document.getElementById('project-description');
        const imageEl = document.getElementById('project-image-tag');
        const buttonsEl = document.getElementById('project-buttons-container');

        function updateProjectView(filter) {
            const allProjects = document.querySelectorAll('.project-data-item');

            let projectsToShow = (filter === '*' || !filter)
                ? Array.from(allProjects)
                : Array.from(allProjects).filter(p => p.dataset.type === filter);

            let projectToShow = projectsToShow[0];

            if (!projectToShow) {
                projectDisplayArea.style.opacity = '0';
                return;
            }

            projectDisplayArea.style.opacity = '0';
            projectDisplayArea.style.transform = 'translateY(20px)';
            
            // ===== [수정된 부분] =====
            // 버튼에 링크를 연결하도록 수정했습니다.
            setTimeout(() => {
                titleEl.textContent = projectToShow.dataset.title;
                subtitleEl.textContent = projectToShow.dataset.subtitle;
                descriptionEl.textContent = projectToShow.dataset.description;
                imageEl.src = projectToShow.dataset.imgSrc;
                imageEl.alt = `${projectToShow.dataset.title} project image`;
                
                // data- 속성에서 URL 가져오기 (없으면 '#'
                const redesignUrl = projectToShow.dataset.redesignUrl || '#';
                const originalUrl = projectToShow.dataset.originalUrl || '#';
                
                // 버튼 HTML에 onclick 이벤트를 추가하여 새 탭에서 링크 열기
                // 이미지에 나온대로 "View Details", "Visit Site"로 텍스트 수정
                buttonsEl.innerHTML = `
                    <button onclick="window.open('${redesignUrl}', '_blank')">View Details</button>
                    <button class="btn-secondary" onclick="window.open('${originalUrl}', '_blank')">Visit Site</button>
                `;
                projectDisplayArea.style.opacity = '1';
                projectDisplayArea.style.transform = 'translateY(0)';
            }, 300);
            // ===== [수정 끝] =====
        }

        categoryContainer.addEventListener('click', (event) => {
            const filterBtn = event.target.closest('.category-btn');
            if (!filterBtn) return;
            
            document.querySelector('.category-btn.active').classList.remove('active');
            filterBtn.classList.add('active');
            updateProjectView(filterBtn.dataset.filter);
        });

        updateProjectView('*'); 
    }

   // 7. Templates 섹션 모던 캐러셀 기능
    const templatesCarousel = document.getElementById('recommendation-list');
    const paginationContainer = document.getElementById('templates-pagination');
    const prevBtn = document.getElementById('prev-template-btn');
    const nextBtn = document.getElementById('next-template-btn');

    if (templatesCarousel && paginationContainer && prevBtn && nextBtn) {
        const carouselItems = Array.from(templatesCarousel.children);

        carouselItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('data-index', index);
            paginationContainer.appendChild(dot);
        });

        const dots = Array.from(paginationContainer.children);

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                const targetItem = carouselItems[index];
                const scrollLeft = targetItem.offsetLeft - (templatesCarousel.offsetWidth / 2) + (targetItem.offsetWidth / 2);
                
                templatesCarousel.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemIndex = carouselItems.indexOf(entry.target);
                    dots.forEach(dot => dot.classList.remove('active'));
                    dots[itemIndex]?.classList.add('active');
                }
            });
        }, { root: templatesCarousel, threshold: 0.5 });

        carouselItems.forEach(item => observer.observe(item));

        nextBtn.addEventListener('click', () => {
            const scrollAmount = templatesCarousel.clientWidth * 0.8; 
            templatesCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            const scrollAmount = templatesCarousel.clientWidth * 0.8;
            templatesCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    // 8. 커서 트레일 효과
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);

    window.addEventListener('mousemove', e => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: 'forwards' });
    });

    // 클릭 효과
    document.addEventListener('mousedown', () => {
        cursorDot.classList.add('clicking');
        cursorOutline.classList.add('clicking');
    });

    document.addEventListener('mouseup', () => {
        cursorDot.classList.remove('clicking');
        cursorOutline.classList.remove('clicking');
    });

    // 9. 스킬 카드 3D 틸트 효과
    const skillCards = document.querySelectorAll('.skill-card-new');
    skillCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = e.clientX - left - width / 2;
            const y = e.clientY - top - height / 2;
            const rotateX = (y / height) * -10;
            const rotateY = (x / width) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // 10. About 섹션 이미지 패럴랙스 (제거됨)
    /*
    const aboutImages = document.querySelectorAll('.about-section-image');
    function handleAboutImageParallax() {
        if (!aboutImages.length) return;

        aboutImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const speed = -0.1;
            const move = (rect.top - windowHeight / 2) * speed;
            
            img.style.transform = `translateY(${move}px)`;
        });
    }
    */

    // 11. 헤더 스크롤 효과
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 12. Scroll to Top 버튼
    const scrollTopBtn = document.querySelector('.scroll-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 13. 부드러운 스크롤 네비게이션
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 초기 실행
    updateScrollProgress();
    updateProgressBar();
});

// [수정] 파일 끝에 잘못 붙여넣기된 코드를 제거했습니다.