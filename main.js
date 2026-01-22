// 모바일 메뉴 토글 기능
function toggleMenu() {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
}

// 페이지 전환 기능 (홈, 히트맵, 차트)
function showPage(pageId) {
    // 1. 모든 페이지 섹션을 숨깁니다.
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // 2. 선택된 페이지만 보여줍니다.
    const selectedPage = document.getElementById('page-' + pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // (모바일용) 메뉴 클릭 시 네비게이션 닫기
    const navbar = document.getElementById('navbar');
    if (window.innerWidth <= 768) {
        navbar.classList.remove('active');
    }
}