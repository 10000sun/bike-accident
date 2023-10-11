const API_KEY = `vDX%2FUI2gzJeT6CJM1otu39l%2Byx0prw9aeTusQVSZCK9QkcGOX9oViiRL8uZLh7ftTKTxfEjlAKtdRpbG%2BSk3WA%3D%3D`;

//const siDo=whatsido(); //나중에 지역 고를때 쓸 함수
//const guGun=whatguGun(); //나중에 지역 고를때 쓸 함수

async function getData() {
  const url = `https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle?ServiceKey=${API_KEY}&searchYearCd=2015&siDo=11&guGun=680&type=json&numOfRows=10&pageNo=1`;
  //const url= 'https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle?ServiceKey=${API_KEY}&searchYearCd=2015&siDo=${siDo}&guGun=${guGun}&type=json&numOfRow=10&pageNo=1'
  const response = await fetch(url);
  const data = await response.json();
  console.log("data", data);
  const locations = data.items.item.map((spot) => [
    spot.spot_nm,
    spot.la_crd,
    spot.lo_crd,
  ]);

  console.log("locations", locations);

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

getData();

// 지역선택 변수
var Sido_num = new Array(11,26,27,28,29,30,31,36,41,42,43,44,45,46,47,48,50);
 var Sido_name = new Array('서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도','전라북도','전라남도','경상북도','경상남도','제주특별자치도');

 var Gugun_num = new Array();
 var Gugun_name = new Array();

 Gugun_num[11] = new Array(680,740,305,500,620,215,530,545,350,320,230,590,440,410,650,200,290,710,470,560,170,380,110,140,260);
 Gugun_name[11] = new Array('강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구');

 Gugun_num[26] = new Array(42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57);
 Gugun_name[26] = new Array('강서구','금정구','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구','기장군');

 Gugun_num[3] = new Array(58,59,60,61,62,63,64,65);
 Gugun_name[3] = new Array('남구','달서구','동구','북구','서구','수성구','중구','달성군');

 Gugun_num[4] = new Array(66,67,68,69,70,71,72,73,74,75);
 Gugun_name[4] = new Array('계양구','남구','남동구','동구','부평구','서구','연수구','중구','강화군','옹진군');

 Gugun_num[5] = new Array(76,77,78,79,80);
 Gugun_name[5] = new Array('광산구','남구','동구','북구','서구');

 Gugun_num[6] = new Array(81,82,83,84,85);
 Gugun_name[6] = new Array('대덕구','동구','서구','유성구','중구');

 Gugun_num[7] = new Array(86,87,88,89,90);
 Gugun_name[7] = new Array('남구','동구','북구','중구','울주군');

 Gugun_num[8] = new Array(91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108);
 Gugun_name[8] = new Array('강릉시','동해시','삼척시','속초시','원주시','춘천시','태백시','고성군','양구군','양양군','영월군','인제군','정선군','철원군','평창군','홍천군','화천군','횡성군');

 Gugun_num[9] = new Array(109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148);
 Gugun_name[9] = new Array('고양시 덕양구','고양시 일산구','과천시','광명시','광주시','구리시','군포시','김포시','남양주시','동두천시','부천시 소사구','부천시 오정구','부천시 원미구','성남시 분당구','성남시 수정구','성남시 중원구','수원시 권선구','수원시 장안구','수원시 팔달구','시흥시','안산시 단원구','안산시 상록구','안성시','안양시 동안구','안양시 만안구','오산시','용인시','의왕시','의정부시','이천시','파주시','평택시','하남시','화성시','가평군','양주군','양평군','여주군','연천군','포천군');

 Gugun_num[10] = new Array(149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168);
 Gugun_name[10] = new Array('거제시','김해시','마산시','밀양시','사천시','양산시','진주시','진해시','창원시','통영시','거창군','고성군','남해군','산청군','의령군','창녕군','하동군','함안군','함양군','합천군');

 Gugun_num[50] = new Array(169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192);
 Gugun_name[50] = new Array('경산시','경주시','구미시','김천시','문경시','상주시','안동시','영주시','영천시','포항시 남구','포항시 북구','고령군','군위군','봉화군','성주군','영덕군','영양군','예천군','울릉군','울진군','의성군','청도군','청송군','칠곡군');

 Gugun_num[12] = new Array(193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214);
 Gugun_name[12] = new Array('광양시','나주시','목포시','순천시','여수시','강진군','고흥군','곡성군','구례군','담양군','무안군','보성군','신안군','영광군','영암군','완도군','장성군','장흥군','진도군','함평군','해남군','화순군');

 Gugun_num[13] = new Array(215,216,217,218,219,220,221,222,223,224,225,226,227,228,229);
 Gugun_name[13] = new Array('군산시','김제시','남원시','익산시','전주시 덕진구','전주시 완산구','정읍시','고창군','무주군','부안군','순창군','완주군','임실군','장수군','진안군');

 Gugun_num[14] = new Array(230,231,232,233);
 Gugun_name[14] = new Array('서귀포시','제주시','남제주군','북제주군');

 Gugun_num[15] = new Array(234,235,236,237,238,239,240,241,242,243,244,245,246,247,248);
 Gugun_name[15] = new Array('공주시','논산시','보령시','서산시','아산시','천안시','금산군','당진군','부여군','서천군','연기군','예산군','청양군','태안군','홍성군');


// 지역선택 함수

function Sido_change(key,sel){
  if(key == '') return;
  var name = Gugun_name[key];
  var val = Gugun_num[key];
 
  for(i=sel.length-1; i>=0; i--)
   sel.options[i] = null;
  sel.options[0] = new Option('-선택-','', '', 'true');
  for(i=0; i<name.length; i++){
   sel.options[i+1] = new Option(name[i],val[i]);
  }
}