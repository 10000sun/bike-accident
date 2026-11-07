// 뉴스 검색 링크: 동 단위/지점 단위 검색어와 연도 기간 필터 확인
const assert = require('assert');
const vm = require('vm');
const src = require('fs').readFileSync(__dirname + '/../js/js.js', 'utf8');
const ctx = vm.createContext({ document: { getElementById: () => ({ add() {} }) }, Option: class {} });
vm.runInContext(src, ctx);

const [dong, spot] = ctx.newsLinks({ spot_nm: '서울특별시 동대문구 용두동(마장동사거리 부근)' }, 2019);
assert.strictEqual(dong.q, '동대문구 용두동 자전거 사고');
assert.strictEqual(spot.q, '동대문구 용두동 마장동사거리 자전거 사고');
assert.ok(dong.naver.includes(`query=${encodeURIComponent(dong.q)}&`) && dong.naver.endsWith('nso=so:r,p:from20190101to20191231'));
assert.ok(decodeURIComponent(dong.google).endsWith('cdr:1,cd_min:1/1/2019,cd_max:12/31/2019'));

assert.strictEqual(ctx.newsLinks({ spot_nm: '세종특별자치시 한솔동' }, 2020).length, 1, '괄호 없으면 동 단위만');
assert.strictEqual(ctx.newsLinks({ spot_nm: '세종특별자치시 한솔동' }, 2020)[0].q, '세종특별자치시 한솔동 자전거 사고');
console.log('ok');
