/* 六壬金口诀数据：底本《六壬神课金口诀古本》三卷，殆知阁文本；参校《六壬大全》。 */
window.JK_DATA = (function () {
  var stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var stemElem = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  var branchElem = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
  var stemYY = { 甲: '阳', 乙: '阴', 丙: '阳', 丁: '阴', 戊: '阳', 己: '阴', 庚: '阳', 辛: '阴', 壬: '阳', 癸: '阴' };
  var branchYY = { 子: '阳', 丑: '阴', 寅: '阳', 卯: '阴', 辰: '阳', 巳: '阴', 午: '阳', 未: '阴', 申: '阳', 酉: '阴', 戌: '阳', 亥: '阴' };
  var elemGen = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  var elemKe = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

  /* 十二将神：亥登明起正月，逆周十二位。 */
  var generals = [
    { name: '登明', branch: '亥', elem: '水', yy: '阴', month: '正月', sui: '诹訾', note: '阴私、妇女、文书；亥为天门。' },
    { name: '河魁', branch: '戌', elem: '土', yy: '阳', month: '二月', sui: '降娄', note: '狱讼、骸骨、坟墓；戌为天牢。' },
    { name: '从魁', branch: '酉', elem: '金', yy: '阴', month: '三月', sui: '大梁', note: '门户、阴私、金银；酉为门户。' },
    { name: '传送', branch: '申', elem: '金', yy: '阳', month: '四月', sui: '实沈', note: '道路、行人、军人；申为传递。' },
    { name: '小吉', branch: '未', elem: '土', yy: '阴', month: '五月', sui: '鹑首', note: '田宅、婚姻、妇女；未为小吉。' },
    { name: '胜光', branch: '午', elem: '火', yy: '阳', month: '六月', sui: '鹑火', note: '财帛、文书、官讼；午为离火。' },
    { name: '太乙', branch: '巳', elem: '火', yy: '阴', month: '七月', sui: '鹑尾', note: '怪梦、疾病、阴私；巳为蛇。' },
    { name: '天罡', branch: '辰', elem: '土', yy: '阳', month: '八月', sui: '寿星', note: '争斗、官事、刑狱；辰为地网。' },
    { name: '太冲', branch: '卯', elem: '木', yy: '阴', month: '九月', sui: '大火', note: '门户、车船、盗贼；卯为门户。' },
    { name: '功曹', branch: '寅', elem: '木', yy: '阳', month: '十月', sui: '析木', note: '官吏、文书、道人；寅为功曹。' },
    { name: '大吉', branch: '丑', elem: '土', yy: '阴', month: '十一月', sui: '星纪', note: '田宅、六畜、田蚕；丑为大吉。' },
    { name: '神后', branch: '子', elem: '水', yy: '阳', month: '十二月', sui: '玄枵', note: '妇女、阴私、江湖；子为神后。' }
  ];

  /* 十二贵神：序依“贵螣朱六勾青，空白常玄阴后”，顺行；所属干支见底本。 */
  var nobles = [
    { name: '天乙', stem: '己', branch: '丑', elem: '土', yy: '阴', order: 1, note: '尊神，主官禄、庆贺、接引。' },
    { name: '螣蛇', stem: '丁', branch: '巳', elem: '火', yy: '阴', order: 2, note: '惊恐、怪异、阴私、妇女。' },
    { name: '朱雀', stem: '丙', branch: '午', elem: '火', yy: '阳', order: 3, note: '文书、口舌、官讼、飞鸟。' },
    { name: '六合', stem: '乙', branch: '卯', elem: '木', yy: '阴', order: 4, note: '婚姻、成合、交易、公吏。' },
    { name: '勾陈', stem: '戊', branch: '辰', elem: '土', yy: '阳', order: 5, note: '田土、争斗、勾连、官事。' },
    { name: '青龙', stem: '甲', branch: '寅', elem: '木', yy: '阳', order: 6, note: '财帛、喜庆、迁官、人口。' },
    { name: '天空', stem: '戊', branch: '戌', elem: '土', yy: '阳', order: 7, note: '虚诈、惊恐、孤独、空亡。' },
    { name: '白虎', stem: '庚', branch: '申', elem: '金', yy: '阳', order: 8, note: '死丧、道路、血光、争讼。' },
    { name: '太常', stem: '己', branch: '未', elem: '土', yy: '阴', order: 9, note: '财帛、酒食、婚姻、阴人。' },
    { name: '玄武', stem: '壬', branch: '子', elem: '水', yy: '阳', order: 10, note: '盗贼、逃亡、阴谋、水厄。' },
    { name: '太阴', stem: '辛', branch: '酉', elem: '金', yy: '阴', order: 11, note: '阴人、暗昧、婚姻、隐私。' },
    { name: '天后', stem: '癸', branch: '亥', elem: '水', yy: '阴', order: 12, note: '妇女、婚姻、财帛、恩泽。' }
  ];

  var nobleOrder = nobles.map(function (n) { return n.name; });
  var monthGenerals = generals.map(function (g) { return { month: g.month, name: g.name, branch: g.branch }; });

  /* 贵神治旦暮：日贵与夜贵所临，及顺逆。 */
  var nobleStart = {
    甲: { day: '丑', night: '未', dayDir: 1, nightDir: -1 },
    戊: { day: '丑', night: '未', dayDir: 1, nightDir: -1 },
    庚: { day: '丑', night: '未', dayDir: 1, nightDir: -1 },
    乙: { day: '子', night: '申', dayDir: 1, nightDir: -1 },
    己: { day: '子', night: '申', dayDir: 1, nightDir: -1 },
    丙: { day: '亥', night: '酉', dayDir: 1, nightDir: -1 },
    丁: { day: '亥', night: '酉', dayDir: 1, nightDir: -1 },
    壬: { day: '卯', night: '巳', dayDir: 1, nightDir: -1 },
    癸: { day: '卯', night: '巳', dayDir: 1, nightDir: -1 },
    辛: { day: '午', night: '寅', dayDir: -1, nightDir: 1 }
  };

  /* 五子元遁：日干起时干。 */
  var wuzi = { 甲: '甲', 己: '甲', 乙: '丙', 庚: '丙', 丙: '戊', 辛: '戊', 丁: '庚', 壬: '庚', 戊: '壬', 癸: '壬' };

  var sanhe = [
    { branches: ['寅', '午', '戌'], name: '炎上课', elem: '火' },
    { branches: ['亥', '卯', '未'], name: '曲直课', elem: '木' },
    { branches: ['申', '子', '辰'], name: '润下课', elem: '水' },
    { branches: ['巳', '酉', '丑'], name: '从革课', elem: '金' }
  ];
  var liuhe = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
  var wuhe = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
  var sanqi = [['甲', '戊', '庚'], ['乙', '丙', '丁'], ['壬', '癸', '辛']];

  var wudong = [
    { name: '妻动', cond: '干克方', text: '主妻妾、财帛、外来索取；求财防损，卑下有口舌。' },
    { name: '官动', cond: '神克干', text: '利求官、公府事；常人公事，求财难。' },
    { name: '贼动', cond: '神克将', text: '内贼、损财、卑幼病；谋望多不成。' },
    { name: '财动', cond: '将克神', text: '利求财，占官不谐；家中人出外。' },
    { name: '鬼动', cond: '方克干', text: '灾怪、争讼、口舌；病在头目。' }
  ];
  var sandong = [
    { name: '父母动', cond: '方生干', text: '印绶之事，小干尊，大吉。' },
    { name: '子孙动', cond: '干生方', text: '子孙之事，小吉。' },
    { name: '兄弟动', cond: '干方同', text: '比肩朋友之事，小凶。' }
  ];

  return {
    stems: stems, branches: branches,
    stemElem: stemElem, branchElem: branchElem,
    stemYY: stemYY, branchYY: branchYY,
    elemGen: elemGen, elemKe: elemKe,
    generals: generals, nobles: nobles, nobleOrder: nobleOrder,
    nobleStart: nobleStart, wuzi: wuzi,
    monthGenerals: monthGenerals,
    sanhe: sanhe, liuhe: liuhe, wuhe: wuhe, sanqi: sanqi,
    wudong: wudong, sandong: sandong
  };
})();
