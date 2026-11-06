// 구군 이름 배열과 코드 배열의 길이가 어긋나면(=조회 지역이 밀림) 실패
const assert = require('assert');
const src = require('fs').readFileSync(__dirname + '/../js/js.js', 'utf8');
const data = src.slice(src.indexOf('var Gugun_num'), src.indexOf('// 지역선택 함수'));
const { num, name } = new Function(data + ';return {num:Gugun_num,name:Gugun_name}')();
for (const k in num) assert.strictEqual(num[k].length, name[k].length, `시도 ${k}: 코드/이름 개수 불일치`);
console.log('ok');
