// scripts/fetch-data.js 를 가짜 API 서버에 돌려 보는 테스트 (실제 API/키 불필요)
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const spot = (n) => ({ spot_cd: `s${n}`, spot_nm: `지점${n}`, la_crd: '37.5', lo_crd: '127.0', occrrnc_cnt: 4, caslt_cnt: 4, dth_dnv_cnt: 0, se_dnv_cnt: 0, sl_dnv_cnt: 4, wnd_dnv_cnt: 0, geom_json: 'x' });
let hits = [], limitAfter = Infinity;
const server = http.createServer((req, res) => {
  const q = new URL(req.url, 'http://x').searchParams;
  hits.push(`${q.get('SearchYearCd')}/${q.get('siDo')}-${q.get('guGun')}/${q.get('pageNo')}`);
  if (hits.length > limitAfter) return res.end('<OpenAPI_ServiceResponse>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</OpenAPI_ServiceResponse>');
  const at = `${q.get('siDo')}-${q.get('guGun')}`;
  let body = { resultCode: '00', items: '', totalCount: 0 }; // 결과 없음
  if (at === '11-230') { // 150건: 2페이지
    const n = q.get('pageNo') === '1' ? 100 : 50;
    body = { resultCode: '00', items: { item: Array.from({ length: n }, (_, i) => spot(i)) }, totalCount: 150 };
  } else if (at === '11-110') body = { resultCode: '00', items: { item: spot(1) }, totalCount: 1 }; // 1건은 객체
  res.end(JSON.stringify(body));
});

const run = (dir, ...years) => new Promise((resolve) => {
  execFile('node', [path.join(__dirname, '../scripts/fetch-data.js'), ...years], {
    env: { ...process.env, DATA_GO_KR_KEY: 'k', API_BASE: `http://localhost:${server.address().port}/`, DATA_DIR: dir },
  }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }));
});

server.listen(0, async () => {
  try {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fd-'));
    assert.strictEqual((await run(dir, '2019', '2019')).code, 0);
    const y19 = JSON.parse(fs.readFileSync(`${dir}/2019.json`, 'utf8'));
    assert.strictEqual(y19['11-230'].length, 150, '페이지 넘김');
    assert.strictEqual(y19['11-110'].length, 1, '1건(객체) 응답');
    assert.deepStrictEqual(y19['11-140'], [], '결과 없음은 빈 배열로 기록');
    assert.ok(!('geom_json' in y19['11-110'][0]), '폴리곤은 저장하지 않음');

    hits = [];
    await run(dir, '2019', '2019');
    assert.strictEqual(hits.length, 0, '이미 받은 지역은 다시 요청하지 않음(이어받기)');

    hits = [];
    await run(dir, '2023', '2023');
    assert.ok(hits.some((h) => h.includes('/51-')) && !hits.some((h) => h.includes('/42-')), '2023년부터 강원은 51');

    hits = []; limitAfter = 20;
    const r = await run(dir, '2022', '2022');
    assert.notStrictEqual(r.code, 0);
    assert.match(r.stderr, /한도/, '한도 초과 안내');
    assert.ok(fs.existsSync(`${dir}/2022.json`), '한도에 걸려도 받은 만큼 저장');
    console.log('ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  server.close();
});
