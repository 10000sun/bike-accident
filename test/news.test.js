// 뉴스 검색 링크: 지점명 정리와 연도 기간 필터 확인
const assert = require('assert');
const vm = require('vm');
const src = require('fs').readFileSync(__dirname + '/../js/js.js', 'utf8');
const ctx = vm.createContext({ document: { getElementById: () => ({ add() {} }) }, Option: class {} });
vm.runInContext(src, ctx);
const { naver, google } = ctx.newsLinks({ spot_nm: '서울특별시 동대문구 용두동(마장동사거리 부근)' }, 2019);
const q = encodeURIComponent('서울특별시 동대문구 용두동 마장동사거리 자전거 사고');
assert.ok(naver.includes(`query=${q}&`) && naver.endsWith('nso=so:r,p:from20190101to20191231'), naver);
assert.ok(google.includes(`q=${q}&tbm=nws`) && decodeURIComponent(google).endsWith('cdr:1,cd_min:1/1/2019,cd_max:12/31/2019'), google);
console.log('ok');
