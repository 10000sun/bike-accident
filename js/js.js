const API_KEY = `vDX%2FUI2gzJeT6CJM1otu39l%2Byx0prw9aeTusQVSZCK9QkcGOX9oViiRL8uZLh7ftTKTxfEjlAKtdRpbG%2BSk3WA%3D%3D`;

async function getData() {

  // 각각 시도, 구군, 년도 값 변수에 할당
  const sel_sido = document.getElementById('Sido').options[document.getElementById('Sido').selectedIndex].value;
  const sel_gugun = document.getElementById('Gugun').options[document.getElementById('Gugun').selectedIndex].value;
  const sel_year = document.getElementById('SearchYear').options[document.getElementById('SearchYear').selectedIndex].value;

  if(sel_sido == ""){
    alert("지역을 선택하세요.");
    return;
  } else if(sel_gugun == ""){
    alert("지역을 선택하세요.");
    return;
  } else if(sel_year == ""){
    alert("년도를 선택하세요.");
    return;
  }

  // api 불러올때 위 변수 집어넣어서 부르기
  const url = `https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle?ServiceKey=${API_KEY}&SearchYearCd=${sel_year}&siDo=${sel_sido}&guGun=${sel_gugun}&type=json&numOfRows=10&pageNo=1`;

  const response = await fetch(url);
  const data = await response.json();
  const locations = data.items.item.map((spot) => [
    spot.spot_nm,
    spot.la_crd,
    spot.lo_crd,
  ]);

  // 데이터에 값이 없을때 경고문
  if(data.items.item.length == 0){
    alert("찾으시는 결과가 없습니다. 다른 지역이나 년도를 선택해주세요.");
    return;
  }

  drawMap(locations);
}

function drawMap(locations) {

  // 매개변수 형태
  // location = [ ["지역이름", 위도, 경도],
  //              ["지역이름", 위도, 경도]
  //            ]
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: new google.maps.LatLng(locations[0][1], locations[0][2]),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  });

  const infowindow = new google.maps.InfoWindow();

  let marker, i;

  // 위치별 마크 생성
  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map,
    });

    // 핀 클릭했을 때 보여주는 정보
    google.maps.event.addListener(
      marker,
      "click",
      (function (marker, i) {
        return function () {
          infowindow.setContent(locations[i][0]);
          infowindow.open(map, marker);
        };
      })(marker, i)
    );
  }
}



// 지역선택 변수 *수정필요
var Sido_num = new Array(11, 26, 27, 28, 29, 30, 31, 36, 41, 42, 43, 44, 45, 46, 47, 48, 50);
var Sido_name = new Array('서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도');

var Gugun_num = new Array();
var Gugun_name = new Array();

Gugun_num[11] = new Array(680, 740, 305, 500, 620, 215, 530, 545, 350, 320, 230, 590, 440, 410, 650, 200, 290, 710, 470, 560, 170, 380, 110, 140, 260);
Gugun_name[11] = new Array('강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구');

Gugun_num[26] = new Array(440, 410, 710, 290, 170, 260, 230, 320, 530, 380, 140, 500, 470, 200, 110, 350);
Gugun_name[26] = new Array('강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구');

Gugun_num[27] = new Array(200, 290, 710, 140, 230, 170, 260, 110);
Gugun_name[27] = new Array('남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구');

Gugun_num[28] = new Array(710, 245, 170, 200, 140, 237, 260, 185, 720, 110);
Gugun_name[28] = new Array('강화군', '계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '옹진군', '중구');

Gugun_num[29] = new Array(200, 155, 110, 170, 140);
Gugun_name[29] = new Array('광산구', '남구', '동구', '북구', '서구');

Gugun_num[30] = new Array(230, 110, 170, 200, 140);
Gugun_name[30] = new Array('대덕구', '동구', '서구', '유성구', '중구');

Gugun_num[31] = new Array(140, 170, 200, 710, 110);
Gugun_name[31] = new Array('남구', '동구', '북구', '울주군', '중구');

Gugun_num[36] = new Array(110);
Gugun_name[36] = new Array('세종특별자치시');

Gugun_num[41] = new Array(820, 281, 283, 285, 287, 290, 210, 610, 310, 410, 570, 360, 250, 197, 199, 195, 135, 131, 133, 113, 117, 111, 115, 390, 270, 273, 271, 550, 173, 171, 630, 830, 730, 670, 800, 370, 460, 463, 465, 461, 430, 150, 500, 480, 220, 810, 650, 450, 590);
Gugun_name[41] = new Array('가평군', '고양시덕양구', '고양시일산구', '고양시일산동구', '고양시일산서구', '과천시', '광명시', '광주시', '군포시', '김포시', '남양주시', '동두천시', '부천시소사구', '부천시오정구', '부천시원미구', '성남시분당구', '성남시수정구', '성남시중원구', '수원시권선구', '수원시영통구', '수원시장안구', '수원시팔달구', '시흥시', '안산시', '안산시단원구', '안산시상록구', '안성시', '안양시동안구', '안양시만안구', '양주시', '양평군', '여주군', '여주시', '연천군', '오산시', '용인시', '용인시기흥구', '용인시수지구', '용인시처인구', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천군', '포천시', '하남시', '화성시');

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

Gugun_num[48] = new Array(310, 880, 820, 250, 840, 160, 270, 240, 860, 332, 330, 720, 170, 190, 740, 110, 125, 127, 123, 121, 129, 220, 850, 730, 870, 890);
Gugun_name[48] = new Array('거제시', '거창군', '고성군', '김해시', '남해군', '마산시', '밀양시', '사천시', '산청군', '양산시', '양산시', '의령군', '진주시', '진해시', '창녕군', '창원시', '창원시마산합포구', '창원시마산회원구', '창원시성산구', '창원시의창구', '창원시진해구', '통영시', '하동군', '함안군', '함양군', '합천군');

Gugun_num[50] = new Array(130, 110);
Gugun_name[50] = new Array('서귀포시', '제주시');

// 지역선택 함수

function Sido_change(key, sel) {
  if (key == '') return;
  var name = Gugun_name[key];
  var val = Gugun_num[key];

  for (i = sel.length - 1; i >= 0; i--)
    sel.options[i] = null;
  sel.options[0] = new Option('구군 선택 (예:강남구)', '', '', 'true');
  for (i = 0; i < name.length; i++) {
    sel.options[i + 1] = new Option(name[i], val[i]);
  }
}

function explain(){
  Swal.fire({
    title: '개요',
    text: '최근 자전거 및 킥보드 사고가 증가하여 사고 예방과 경각심을 위해 제작했습니다. 지역과 연도를 선택하면 지역별로 자전거 사고가 많이난 구역에 핀이 찍힙니다. HTML 및 자바스크립트로 제작되었습니다.',
    icon: 'info',
    confirmButtonText: '확인'
  })
}

function whoiam(){
  Swal.fire({
    title: '제작자',
    text: '제작자의 깃허브, 블로그는 최하단 링크에서 확인하실 수 있습니다.',
    icon: 'info',
    confirmButtonText: '확인'
  })
}
