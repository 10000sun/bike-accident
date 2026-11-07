# bike-accident
자전거를 자주 타는 친구를 계기로 만들어본 자전거 사고 다발 지역 찾는 사이트 입니다.
공공데이터 포탈 api를 이용하여 자전거 사고 다발 지역을 긁어모으고,
자바스크립트 함수를 이용해 지역별로 나타냈습니다.

링크를 클릭하면 사이트로 바로 이동됩니다.
https://10000sun.github.io/bike-accident

This is a site that I created with a friend who was hospitalized due to a bicycle accident. 
We used the public data portal api to rake together bicycle accident-prone areas and use the JavaScript function to represent them by region.

## 데이터 갱신 (개발용)
사이트는 API를 직접 부르지 않고 `data/<연도>.json`을 읽습니다. 인증키가 저장소에 들어가지 않습니다.
```bash
DATA_GO_KR_KEY='공공데이터포털_인증키' node scripts/fetch-data.js   # 2012년 ~ 작년 (Node 18+)
node scripts/fetch-data.js 2024 2025                                  # 연도 범위 지정
```
이미 받은 지역은 건너뛰므로 일일 호출 한도에 걸리면 다음 날 다시 실행하면 이어서 받습니다. 테스트: `node test/data.test.js && node test/fetch-data.test.js`
