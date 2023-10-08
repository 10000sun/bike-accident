const API_KEY=`vDX%2FUI2gzJeT6CJM1otu39l%2Byx0prw9aeTusQVSZCK9QkcGOX9oViiRL8uZLh7ftTKTxfEjlAKtdRpbG%2BSk3WA%3D%3D`;

//const siDo=whatsido(); //나중에 지역 고를때 쓸 함수
//const guGun=whatguGun(); //나중에 지역 고를때 쓸 함수

async function getData(){
    const url = `https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle?ServiceKey=${API_KEY}&searchYearCd=2015&siDo=11&guGun=680&type=json&numOfRows=10&pageNo=1`;
    //const url= 'https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle?ServiceKey=${API_KEY}&searchYearCd=2015&siDo=${siDo}&guGun=${guGun}&type=json&numOfRow=10&pageNo=1'
    const response = await fetch(url);
    const data = await response.json();
    console.log("data", data);
    const locations = data.items.item.map((spot) =>[spot.spot_nm, spot.la_crd, spot.lo_crd,]);

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