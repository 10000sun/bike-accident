// 사용법: DATA_GO_KR_KEY='공공데이터포털 인증키' node scripts/fetch-data.js [시작연도] [끝연도]
// 연도별 자전거 사고 다발지역을 받아 data/<연도>.json 으로 저장한다. 이미 받은 지역은 건너뛰므로
// 중간에 멈추거나 일일 호출 한도에 걸려도 다시 실행하면 이어서 받는다.
const fs = require('fs');
const path = require('path');

const BASE = process.env.API_BASE || 'https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle';
const DATA = process.env.DATA_DIR || path.join(__dirname, '../data');
const RAW_KEY = process.env.DATA_GO_KR_KEY;
if (!RAW_KEY) {
  console.error('환경변수 DATA_GO_KR_KEY 가 필요합니다.');
  process.exit(1);
}
const KEY = encodeURIComponent(decodeURIComponent(RAW_KEY)); // 인코딩/디코딩 키 둘 다 허용

// 지역 코드표는 사이트(js/js.js)와 같은 것을 쓴다
const src = fs.readFileSync(path.join(__dirname, '../js/js.js'), 'utf8');
const regions = new Function(
  src.slice(src.indexOf('var Gugun_num'), src.indexOf('// 지역선택 함수')) + ';return Gugun_num'
)();

const [from = 2012, to = new Date().getFullYear() - 1] = process.argv.slice(2).map(Number);
const PAGE = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 2023년부터 강원(42→51), 전북(45→52) 시도 코드가 바뀜 (공식 코드표 3.2)
const apiSido = (sido, year) => (year >= 2023 ? ({ 42: 51, 45: 52 }[sido] ?? sido) : sido);

async function call(year, sido, gugun, page) {
  const url = `${BASE}?ServiceKey=${KEY}&SearchYearCd=${year}&siDo=${apiSido(sido, year)}&guGun=${gugun}&type=json&numOfRows=${PAGE}&pageNo=${page}`;
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const text = await (await fetch(url)).text();
      if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(text)) throw new Error('일일 호출 한도 초과: 내일 다시 실행하면 이어서 받습니다.');
      if (/SERVICE_KEY_IS_NOT_REGISTERED|SERVICE_ACCESS_DENIED/.test(text)) throw new Error('인증키 오류: 키가 등록/승인되었는지 확인하세요.');
      const data = JSON.parse(text);
      if (data.resultCode && !['00', '0000', '03'].includes(String(data.resultCode))) throw new Error(`API 오류 ${data.resultCode} ${data.resultMsg}`);
      return data;
    } catch (e) {
      if (/한도|인증키/.test(e.message)) throw e;
      last = e;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error(`${year} ${sido}-${gugun} 요청 실패: ${last.message}`);
}

const pick = (s) => ({
  spot_cd: s.spot_cd, spot_nm: s.spot_nm, la_crd: s.la_crd, lo_crd: s.lo_crd,
  occrrnc_cnt: s.occrrnc_cnt, caslt_cnt: s.caslt_cnt,
  dth_dnv_cnt: s.dth_dnv_cnt, se_dnv_cnt: s.se_dnv_cnt, sl_dnv_cnt: s.sl_dnv_cnt, wnd_dnv_cnt: s.wnd_dnv_cnt,
});

async function fetchAll(year, sido, gugun) {
  const spots = [];
  for (let page = 1; ; page++) {
    const data = await call(year, sido, gugun, page);
    spots.push(...[].concat(data?.items?.item ?? []).map(pick)); // 결과 없음이면 item 없음, 1건이면 객체
    if (page * PAGE >= (data.totalCount ?? 0)) return spots;
  }
}

async function main() {
  fs.mkdirSync(DATA, { recursive: true });
  for (let year = to; year >= from; year--) {
    const file = path.join(DATA, `${year}.json`);
    const out = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const save = () => fs.writeFileSync(file, JSON.stringify(out));
    const jobs = [];
    for (const sido in regions) for (const gugun of regions[sido]) if (!(`${sido}-${gugun}` in out)) jobs.push([sido, gugun]);

    let next = 0, done = 0, failed;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (!failed && next < jobs.length) {
        const [sido, gugun] = jobs[next++];
        try {
          out[`${sido}-${gugun}`] = await fetchAll(year, sido, gugun); // 빈 배열도 "받음"으로 기록
          if (++done % 50 === 0) save();
        } catch (e) { failed = e; }
      }
    }));
    save();
    if (failed) throw failed;
    console.log(`${year}: 새로 ${jobs.length}곳 받음 (지점 ${Object.values(out).flat().length}개)`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
