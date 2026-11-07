let map, infowindow, markers = [];

// 구글 지도 스크립트가 로드되면 호출됨 (index.html의 callback=initMap)
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 36.3, lng: 127.8 },
    zoom: 7,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });
  infowindow = new google.maps.InfoWindow();
}

const el = (tag, cls, text = "") => {
  const e = document.createElement(tag);
  e.className = cls;
  e.textContent = text;
  return e;
};

const detail = (s) =>
  `사고 ${s.occrrnc_cnt}건 (사상자 ${s.caslt_cnt}명)\n사망 ${s.dth_dnv_cnt} · 중상 ${s.se_dnv_cnt} · 경상 ${s.sl_dnv_cnt} · 부상신고 ${s.wnd_dnv_cnt}`;

// 뉴스 검색 링크. 검색어가 길수록 결과가 없어서 "동 단위"(넓게)와 "지점 단위"(좁게) 두 가지를 만들고,
// 선택한 연도는 기간 필터로 붙인다. 지점명 형식: "서울특별시 동대문구 용두동(마장동사거리 부근)"
function newsLinks(spot, year) {
  const [area, rest = ""] = spot.spot_nm.split("(");
  const dong = area.trim().split(/\s+/).slice(-2).join(" ");
  const place = rest.replace(/[()]|부근/g, " ").replace(/\s+/g, " ").trim();
  const link = (label, q) => {
    const enc = encodeURIComponent(`${q} 자전거 사고`);
    return {
      label, q: `${q} 자전거 사고`,
      naver: `https://search.naver.com/search.naver?where=news&query=${enc}&nso=so:r,p:from${year}0101to${year}1231`,
      google: `https://www.google.com/search?q=${enc}&tbm=nws&tbs=${encodeURIComponent(`cdr:1,cd_min:1/1/${year},cd_max:12/31/${year}`)}`,
    };
  };
  return place ? [link("동 단위", dong), link("지점 단위", `${dong} ${place}`)] : [link("동 단위", dong)];
}

async function getData() {
  const sido = document.getElementById('Sido');
  const gugun = document.getElementById('Gugun');
  const year = document.getElementById('SearchYear');
  const sel_sido = sido.value, sel_gugun = gugun.value, sel_year = year.value;

  if (sel_sido == "" || sel_gugun == "") {
    alert("지역을 선택해 주세요.");
    return;
  }
  if (sel_year == "") {
    alert("연도를 선택해 주세요.");
    return;
  }
  if (!map) {
    alert("지도를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
    return;
  }

  // data/<연도>.json 은 scripts/fetch-data.js 로 미리 받아 둔 파일 (키: "시도값-구군값")
  let list;
  try {
    const response = await fetch(`data/${sel_year}.json`);
    if (!response.ok) throw new Error(response.status);
    list = (await response.json())[`${sel_sido}-${sel_gugun}`] ?? [];
  } catch (e) {
    alert("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return;
  }

  // 세종처럼 시도와 구군 이름이 같으면 한 번만 표시
  const area = [...new Set([sido.selectedOptions[0].text, gugun.selectedOptions[0].text])].join(" ");
  const name = `${area} ${sel_year}년`;
  drawMap(list, list.length ? `${name} · ${list.length}곳` : name, area + " ", sel_year);
}

// spots = data/<연도>.json 의 지점 배열 (사고 많은 순으로 목록과 핀을 그림), prefix = 목록에서 생략할 지역명, year = 뉴스 검색 기간
function drawMap(spots, title, prefix = "", year) {
  const ol = document.getElementById("spots");
  ol.replaceChildren();
  markers.forEach((m) => m.setMap(null));
  markers = [];
  infowindow.close();

  document.getElementById("panel-title").textContent = title;
  const hint = document.getElementById("panel-hint");
  hint.textContent = "결과가 없습니다. 다른 지역이나 연도를 선택해 주세요.";
  hint.hidden = spots.length > 0;

  const bounds = new google.maps.LatLngBounds();
  [...spots].sort((a, b) => b.occrrnc_cnt - a.occrrnc_cnt).forEach((spot, i) => {
    const position = new google.maps.LatLng(spot.la_crd, spot.lo_crd);
    const marker = new google.maps.Marker({ position, map });
    bounds.extend(position);
    markers.push(marker);

    // 텍스트로만 넣어 HTML 해석 방지
    const show = () => {
      const div = el("div", "", `${spot.spot_nm}\n${detail(spot)}`);
      div.style.whiteSpace = "pre-line";
      infowindow.setContent(div);
      infowindow.open(map, marker);
    };
    marker.addListener("click", show);

    const btn = el("button", "spot");
    btn.type = "button";
    btn.append(el("span", "rank", i + 1), el("span", "name", spot.spot_nm.startsWith(prefix) ? spot.spot_nm.slice(prefix.length) : spot.spot_nm), el("span", "meta", detail(spot)));
    btn.onclick = () => {
      map.panTo(position);
      map.setZoom(16);
      show();
    };
    const li = document.createElement("li");
    const news = el("details", "news");
    news.append(el("summary", "", `관련 뉴스 · ${year}년`));
    newsLinks(spot, year).forEach(({ label, naver, google }) => {
      const row = el("div", "news-row");
      row.append(el("span", "", label));
      [["네이버", naver], ["구글", google]].forEach(([text, href]) => {
        const a = el("a", "", text);
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener";
        row.append(a);
      });
      news.append(row);
    });
    li.append(btn, news);
    ol.append(li);
  });

  // 모든 핀이 보이게 맞추되, 핀이 1개일 때 너무 확대되지 않게 제한
  if (spots.length) {
    map.fitBounds(bounds);
    google.maps.event.addListenerOnce(map, "idle", () => {
      if (map.getZoom() > 16) map.setZoom(16);
    });
  }
}

// 연도 목록: 작년부터 2012년까지 (데이터가 없으면 "결과 없음" 안내가 뜸)
const yearSelect = document.getElementById('SearchYear');
for (let y = new Date().getFullYear() - 1; y >= 2012; y--) yearSelect.add(new Option(`${y}년`, y));

var Gugun_num = new Array();
var Gugun_name = new Array();

Gugun_num[11] = new Array(680, 740, 305, 500, 620, 215, 530, 545, 350, 320, 230, 590, 440, 410, 650, 200, 290, 710, 470, 560, 170, 380, 110, 140, 260);
Gugun_name[11] = new Array('강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구');

Gugun_num[26] = new Array(440, 410, 710, 290, 170, 260, 230, 320, 530, 380, 140, 500, 470, 200, 110, 350);
Gugun_name[26] = new Array('강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구');

Gugun_num[27] = new Array(720, 200, 290, 710, 140, 230, 170, 260, 110);
Gugun_name[27] = new Array('군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구');

Gugun_num[28] = new Array(710, 245, 177, 170, 200, 140, 237, 260, 185, 720, 110);
Gugun_name[28] = new Array('강화군', '계양구', '미추홀구', '남구(구)', '남동구', '동구', '부평구', '서구', '연수구', '옹진군', '중구');

Gugun_num[29] = new Array(200, 155, 110, 170, 140);
Gugun_name[29] = new Array('광산구', '남구', '동구', '북구', '서구');

Gugun_num[30] = new Array(230, 110, 170, 200, 140);
Gugun_name[30] = new Array('대덕구', '동구', '서구', '유성구', '중구');

Gugun_num[31] = new Array(140, 170, 200, 710, 110);
Gugun_name[31] = new Array('남구', '동구', '북구', '울주군', '중구');

Gugun_num[36] = [110];
Gugun_name[36] = new Array('세종특별자치시');

Gugun_num[41] = new Array(820, 281, 283, 285, 287, 290, 210, 610, 310, 410, 570, 360, 250, 190, 192, 194, 196, 197, 199, 195, 135, 131, 133, 113, 117, 111, 115, 390, 270, 273, 271, 550, 173, 171, 630, 830, 730, 670, 800, 370, 460, 463, 465, 461, 430, 150, 500, 480, 220, 810, 650, 450, 590);
Gugun_name[41] = new Array('가평군', '고양시덕양구', '고양시일산구', '고양시일산동구', '고양시일산서구', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시(2018~2023)', '부천시원미구(2024~)', '부천시소사구(2024~)', '부천시오정구(2024~)', '부천시소사구(~2017)', '부천시오정구(~2017)', '부천시원미구(~2017)', '성남시분당구', '성남시수정구', '성남시중원구', '수원시권선구', '수원시영통구', '수원시장안구', '수원시팔달구', '시흥시', '안산시', '안산시단원구', '안산시상록구', '안성시', '안양시동안구', '안양시만안구', '양주시', '양평군', '여주군', '여주시', '연천군', '오산시', '용인시', '용인시기흥구', '용인시수지구', '용인시처인구', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천군', '포천시', '하남시', '화성시');

Gugun_num[42] = new Array(150, 820, 170, 230, 210, 800, 830, 750, 130, 810, 770, 780, 110, 190, 760, 720, 790, 730);
Gugun_name[42] = new Array('강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군');

Gugun_num[43] = new Array(760, 800, 720, 740, 730, 770, 150, 745, 750, 710, 111, 112, 114, 113, 130);
Gugun_name[43] = new Array('괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청원군', '청주시상당구', '청주시서원구', '청주시청원구', '청주시흥덕구', '충주시');

Gugun_num[44] = new Array(250, 150, 710, 230, 830, 270, 180, 760, 210, 770, 200, 730, 810, 130, 131, 133, 790, 825, 800);
Gugun_name[44] = new Array('계룡시', '공주시', '금산군', '논산시', '당진군', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '연기군', '예산군', '천안시', '천안시동남구', '천안시서북구', '청양군', '태안군', '홍성군');

Gugun_num[45] = new Array(790, 130, 210, 190, 730, 800, 770, 710, 140, 750, 740, 113, 111, 180, 720);
Gugun_name[45] = new Array('고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시덕진구', '전주시완산구', '정읍시', '진안군');

Gugun_num[46] = new Array(810, 770, 720, 230, 730, 170, 710, 110, 840, 780, 150, 910, 130, 870, 830, 890, 880, 800, 900, 860, 820, 790);
Gugun_name[46] = new Array('강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군');

Gugun_num[47] = new Array(290, 130, 830, 190, 720, 150, 280, 920, 250, 840, 170, 770, 760, 210, 230, 900, 940, 930, 730, 820, 750, 850, 111, 113);
Gugun_name[47] = new Array('경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시남구', '포항시북구');

Gugun_num[48] = new Array(310, 880, 820, 250, 840, 160, 270, 240, 860, 330, 720, 170, 190, 740, 125, 127, 123, 121, 129, 220, 850, 730, 870, 890);
Gugun_name[48] = new Array('거제시', '거창군', '고성군', '김해시', '남해군', '마산시', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '진해시', '창녕군', '창원시마산합포구', '창원시마산회원구', '창원시성산구', '창원시의창구', '창원시진해구', '통영시', '하동군', '함안군', '함양군', '합천군');

Gugun_num[50] = new Array(130, 110);
Gugun_name[50] = new Array('서귀포시', '제주시');

// 지역선택 함수
function Sido_change(key, sel) {
  sel.length = 1; // 첫 번째 "구군 선택" 옵션만 남김
  sel.selectedIndex = 0;
  if (key == '') return;
  Gugun_name[key].forEach((name, i) => sel.add(new Option(name, Gugun_num[key][i])));
}

function explain(){
  document.getElementById('about').showModal();
}
