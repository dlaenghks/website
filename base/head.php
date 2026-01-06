<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>연세우리아동발달클리닉</title>

    <link rel="icon" type="image/png" href="http://woorikidsclinic.co.kr/img/favicon.png"/>
    
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./base/style2.css">

    <style>
        /* 1. 전체 화면 메뉴 오버레이 */
        .all-menu-wrap {
            position: fixed; top: 0; right: -100%; width: 100%; height: 100%;
            background: #fff; z-index: 9999; transition: right 0.4s ease-in-out;
            box-shadow: none; padding: 0; display: flex; flex-direction: column;
        }
        .all-menu-wrap.active { right: 0; } 

        /* 2. 메뉴 내부 상단 헤더 (로고 + 닫기버튼) */
        .all-menu-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid #eee;
            background: #fff;
            flex-shrink: 0; /* 스크롤 시 고정 */
        }
        .all-menu-logo img { height: 40px; width: auto; display: block; }
        
        /* X 닫기 버튼 스타일 */
        .btn-menu-close {
            width: 30px; height: 30px; position: relative; cursor: pointer;
            background: none; border: none; padding: 0;
        }
        .btn-menu-close::before, .btn-menu-close::after {
            content: ''; position: absolute; top: 50%; left: 0;
            width: 100%; height: 2px; background: #333;
            transition: all 0.3s;
        }
        .btn-menu-close::before { transform: rotate(45deg); }
        .btn-menu-close::after { transform: rotate(-45deg); }

        /* 3. 메뉴 리스트 영역 (스크롤 가능) */
        .all-gnb-scroll {
            flex: 1; overflow-y: auto; padding: 20px 0;
        }
        
        .all-gnb > li { border-bottom: 1px solid #f1f1f1; }
        
        /* 대메뉴 스타일 */
        .all-gnb > li > a { 
            display: flex; justify-content: space-between; align-items: center;
            padding: 20px 25px; 
            font-family: 'Playfair Display', serif; /* 요청 폰트 */
            font-size: 22px; 
            font-weight: 700; 
            color: #333; 
            text-decoration: none;
            transition: color 0.3s;
        }
        /* 대메뉴 호버 효과 */
        .all-gnb > li > a:hover, 
        .all-gnb > li.on > a { color: #1b97a1; }

        /* 아코디언 아이콘 (+ / -) */
        .icon-plus {
            position: relative; width: 16px; height: 16px;
            display: block;
        }
        .icon-plus::before, .icon-plus::after {
            content: ''; position: absolute; background: #333;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            transition: all 0.3s;
        }
        .icon-plus::before { width: 100%; height: 2px; } /* 가로선 */
        .icon-plus::after { width: 2px; height: 100%; } /* 세로선 */

        /* 활성화(펼침) 상태일 때 -모양 만들기 */
        .all-gnb > li.on .icon-plus::after { transform: translate(-50%, -50%) rotate(90deg); opacity: 0; }
        .all-gnb > li.on .icon-plus::before { background: #1b97a1; } /* 활성 색상 */

        /* 4. 소메뉴 (2차 메뉴) - 초기엔 숨김 */
        .all-sub { 
            display: none; 
            background: #f9f9f9; 
            padding: 0;
            border-top: 1px solid #eee;
        }
        .all-sub li a { 
            display: block; padding: 15px 30px; 
            font-size: 15px; color: #666; 
            font-family: 'Noto Sans KR', sans-serif;
            text-decoration: none;
            transition: all 0.2s;
        }
        /* 소메뉴 호버 효과 */
        .all-sub li a:hover { 
            background: #1b97a1; 
            color: #fff; 
            font-weight: 500; 
        }

        /* 5. 활성화 시 소메뉴 보임 */
        .all-gnb > li.on .all-sub { display: block; }

        /* 배경 딤 처리 (PC용) */
        .all-menu-bg {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 9998;
        }
        .all-menu-bg.active { display: block; }
    </style>
</head>

<body>

<div id='LIM_quick'>
    <dl>
        <dd><img src='./base/quick_img1.jpg' /></dd>
        <dd><a href="tel:010-3605-9637"><img src='./base/quick_img2.jpg' /></a></dd>
        <dd><a href="https://m.search.naver.com/search.naver?where=m&query=빠른길찾기&nso_path=placeType%5Eplace%3Bname%5E%3Baddress%5E%3Blatitude%5E%3Blongitude%5E%3Bcode%5E%7Ctype%5Eplace%3Bname%5E연세우리아동발달클리닉%3Baddress%5E%3Bcode%5E1263800380%3Blongitude%5E126.6570549%3Blatitude%5E37.3808813%7Cobjtype%5Epath%3Bby%5Epubtrans" target="_blank"><img src='./base/quick_img3.jpg' /></a></dd>
        <dd><a href="https://naver.me/x8DWlTzS" target="_blank"><img src='./base/quick_img4.jpg' /></a></dd>
        <dd><a href="https://blog.naver.com/woorikidsclinic" target="_blank"><img src='./base/quick_img5.jpg' /></a></dd>
    </dl>
</div>

    <header id="smartHeader" class="site-header">
        <div class="header-inner">
            <div class="logo-area">
                <a href="http://bareunent.co.kr/2.html" class="logo-link">
                    <img src="./base/hd_logo.png" alt="로고">
                </a>
            </div>

            <div class="header-right">
                <nav class="gnb-pc">
                    <ul class="gnb-ul">
                        <?php
                        $sql = " select * from {$g5['menu_table']} where me_use = '1' and length(me_code) = '2' order by me_order, me_id ";
                        $result = sql_query($sql, false);
                        
                        for ($i=0; $row=sql_fetch_array($result); $i++) {
                            // 대메뉴 이름 결정
                            $me_name = $row['me_name'];
                            if (preg_match("/bo_table=([^&]+)/", $row['me_link'], $matches)) {
                                $tmp_board = get_board_db($matches[1]);
                                if ($tmp_board['bo_subject']) $me_name = $tmp_board['bo_subject'];
                            }

                            // 소메뉴 쿼리
                            $sql2 = " select * from {$g5['menu_table']} where me_use = '1' and length(me_code) = '4' and substring(me_code, 1, 2) = '{$row['me_code']}' order by me_order, me_id ";
                            $result2 = sql_query($sql2);
                        ?>
                        <li class="gnb-li <?php echo $row['me_code'] == $me_code ? 'active' : ''; ?>">
                            <a href="<?php echo $row['me_link']; ?>" target="_<?php echo $row['me_target']; ?>" class="gnb-a"><?php echo $me_name; ?></a>
                            
                            <?php
                            $k = 0;
                            while ($row2 = sql_fetch_array($result2)) {
                                if($k == 0) echo '<ul class="gnb-sub">'.PHP_EOL;
                                
                                $sub_name = $row2['me_name'];
                                if (preg_match("/bo_table=([^&]+)/", $row2['me_link'], $matches)) {
                                    $tmp_board = get_board_db($matches[1]);
                                    if ($tmp_board['bo_subject']) $sub_name = $tmp_board['bo_subject'];
                                }
                            ?>
                                <li><a href="<?php echo $row2['me_link']; ?>" target="_<?php echo $row2['me_target']; ?>"><?php echo $sub_name; ?></a></li>
                            <?php
                                $k++;
                            }
                            if($k > 0) echo '</ul>'.PHP_EOL;
                            ?>
                        </li>
                        <?php } ?>
                    </ul>
                </nav>

                <div class="hamburger-menu" id="btn_hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </header>

    <div class="all-menu-bg" id="all_menu_bg"></div>
    <div class="all-menu-wrap" id="all_menu_wrap">
        
        <div class="all-menu-header">
            <a href="/" class="all-menu-logo">
                <img src="http://bareunent.co.kr./base/hd_logo.png" alt="로고">
            </a>
            <button type="button" class="btn-menu-close" id="btn_menu_close"></button>
        </div>

        <div class="all-gnb-scroll">
            <ul class="all-gnb">
                <?php
                // 메뉴 다시 불러오기 (동일 로직)
                $result = sql_query($sql, false);
                for ($i=0; $row=sql_fetch_array($result); $i++) {
                    $me_name = $row['me_name'];
                    if (preg_match("/bo_table=([^&]+)/", $row['me_link'], $matches)) {
                        $tmp_board = get_board_db($matches[1]);
                        if ($tmp_board['bo_subject']) $me_name = $tmp_board['bo_subject'];
                    }

                    $sql2 = " select * from {$g5['menu_table']} where me_use = '1' and length(me_code) = '4' and substring(me_code, 1, 2) = '{$row['me_code']}' order by me_order, me_id ";
                    $result2 = sql_query($sql2);
                    $sub_count = sql_num_rows($result2); // 하위 메뉴 개수 확인
                ?>
                <li class="<?php echo $sub_count > 0 ? 'has-sub' : ''; ?>">
                    <a href="<?php echo $row['me_link']; ?>" target="_<?php echo $row['me_target']; ?>">
                        <?php echo $me_name; ?>
                        <?php if($sub_count > 0) { ?><span class="icon-plus"></span><?php } ?>
                    </a>
                    
                    <?php
                    if($sub_count > 0) {
                        echo '<ul class="all-sub">'.PHP_EOL;
                        while ($row2 = sql_fetch_array($result2)) {
                            $sub_name = $row2['me_name'];
                            if (preg_match("/bo_table=([^&]+)/", $row2['me_link'], $matches)) {
                                $tmp_board = get_board_db($matches[1]);
                                if ($tmp_board['bo_subject']) $sub_name = $tmp_board['bo_subject'];
                            }
                            echo '<li><a href="'.$row2['me_link'].'" target="_'.$row2['me_target'].'">'.$sub_name.'</a></li>';
                        }
                        echo '</ul>'.PHP_EOL;
                    }
                    ?>
                </li>
                <?php } ?>
            </ul>
        </div>
    </div>

    <script>
    document.addEventListener("DOMContentLoaded", function() {
        var btnHam = document.getElementById("btn_hamburger");
        var btnClose = document.getElementById("btn_menu_close"); // 닫기 버튼
        var menuWrap = document.getElementById("all_menu_wrap");
        var menuBg = document.getElementById("all_menu_bg");
        
        // 1. 메뉴 열기
        btnHam.addEventListener("click", function() {
            menuWrap.classList.add("active");
            menuBg.classList.add("active");
        });

        // 2. 메뉴 닫기 (X버튼 또는 배경 클릭)
        function closeMenu() {
            menuWrap.classList.remove("active");
            menuBg.classList.remove("active");
        }
        btnClose.addEventListener("click", closeMenu);
        menuBg.addEventListener("click", closeMenu);

        // 3. 아코디언 메뉴 (하위 메뉴 열기/닫기)
        var hasSubLinks = document.querySelectorAll(".all-gnb > li.has-sub > a");
        hasSubLinks.forEach(function(item) {
            item.addEventListener("click", function(e) {
                // 링크 이동 막고 펼치기/접기만 수행 (메뉴 링크가 #이거나 하위메뉴 확인용일 때)
                e.preventDefault(); 
                
                var parentLi = this.parentNode;
                
                // 기존에 열린 다른 메뉴 닫기 (선택사항: 원하면 주석 해제)
                /*
                var siblings = parentLi.parentNode.children;
                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i] !== parentLi) siblings[i].classList.remove("on");
                }
                */

                // 토글 (클래스 on을 넣었다 뺐다 함)
                parentLi.classList.toggle("on");
            });
        });
    });

    </script>
