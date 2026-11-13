/* 推拿按跷手法与取穴数据：十六法、九部位、三十六症、七十二穴推拿取法、十二禁忌、六介质、十六部典籍。
 * 穴位定位、主治、代码一律读 jingluo-data.js，本件只存手法与症状到穴名的映射，不复制穴位属性。
 * 手法着力部位、方向与力度取《推拿学》通行本与《厘正按摩要术》所述；未得可核底本者标待核，不进正文依据。
 * 本件只覆盖成人在体保健推拿；小儿推拿另是一系，只在页面资料区作体系介绍，不列穴位与操作，故不入本件。
 * 本件为站内数据整理产物，来源与整理口径见算法数据页登记。 */
(function (global) {
  'use strict';
  var TN = global.TN = global.TN || {};

  /* 十六法：着力部位、方向、力度、时长、适用、禁忌、出处、核证状态 */
  TN.METHODS = [
    { id: 'an', name: '按法', alias: '指按、掌按', part: '指腹或掌根', dir: '垂直向下，由轻至重，稳而持续，得气后稍停再缓放', force: '轻中重', dur: '每穴三至五秒，重复五至八次', useOn: '全身穴位，肌肉丰厚处宜掌按', avoid: '脊柱棘突、骨突、颈前、孕期腰腹', src: '《推拿学》通行本', status: '已核' },
    { id: 'rou', name: '揉法', alias: '指揉、掌揉', part: '指腹或掌根吸定不移', dir: '带动皮下组织做环旋，幅度由小渐大', force: '轻中', dur: '每穴一至二分钟，每分钟一百二十至一百六十次', useOn: '全身，面部与腹部宜轻', avoid: '皮肤破损、急性红肿、骨折处', src: '《推拿学》通行本', status: '已核' },
    { id: 'tui', name: '推法', alias: '直推、分推', part: '指腹或掌面', dir: '单向直线推进，压力均匀，不跳不滞', force: '中', dur: '每条线五至十遍，每分钟四十至六十次', useOn: '四肢、背腰、头面', avoid: '骨突处轻推，皮肤破损禁', src: '《推拿学》通行本', status: '已核' },
    { id: 'na', name: '拿法', alias: '拿捏', part: '拇指与余指相对', dir: '提捏肌腹后放松，一紧一松有节律', force: '中', dur: '每处三至五次，每次提捏约一秒', useOn: '颈项、肩井、四肢肌腹', avoid: '颈前三角、腋下、腹股沟', src: '《推拿学》通行本', status: '已核' },
    { id: 'dian', name: '点法', alias: '指点、肘点', part: '拇指端或屈指骨突', dir: '垂直点压，由轻渐重，得气即止', force: '中重', dur: '每穴三至五秒，重复三至五次', useOn: '肌肉丰厚处与穴位', avoid: '面部、骨突、大血管与神经干处', src: '《推拿学》通行本', status: '已核' },
    { id: 'mo', name: '摩法', alias: '指摩、掌摩', part: '掌面或指面轻贴', dir: '环形抚摩，只在皮肤表面，不带动皮下', force: '轻', dur: '每处二至三分钟，每分钟八十至一百次', useOn: '腹部、胸胁、面部', avoid: '不明原因急腹痛、腹部肿块', src: '《推拿学》通行本', status: '已核' },
    { id: 'ca', name: '擦法', alias: '掌擦、鱼际擦', part: '掌面或大鱼际', dir: '直线往返摩擦，压力适中，以透热为度', force: '中', dur: '每处三十至六十次至温热', useOn: '背腰、四肢', avoid: '皮肤破损、发热、出血倾向', src: '《推拿学》通行本', status: '已核' },
    { id: 'qia', name: '掐法', alias: '切掐', part: '拇指甲缘', dir: '垂直重刺激，取穴准而快，掐后即揉', force: '重', dur: '每穴三至五次，每次约一秒', useOn: '人中、十宣等急救取穴', avoid: '常规保健不用，面部与小儿禁', src: '《推拿学》通行本', status: '已核' },
    { id: 'nie', name: '捏法', alias: '捏脊', part: '拇指与食指相对', dir: '捏提皮肤后交替前移', force: '轻中', dur: '每处三至五遍', useOn: '背脊、四肢', avoid: '脊柱骨折、皮肤病、发热', src: '《推拿学》通行本', status: '已核' },
    { id: 'gun', name: '㨰法', alias: '滚法', part: '手背近小指侧', dir: '吸附体表做连续滚动，压力均匀', force: '中', dur: '每处二至三分钟，每分钟一百二十至一百六十次', useOn: '肩背腰臀与四肢肌肉丰厚处', avoid: '骨突、脊柱棘突', src: '《推拿学》通行本', status: '已核' },
    { id: 'dou', name: '抖法', alias: '抖上肢、抖下肢', part: '握肢体远端', dir: '小幅度上下抖动，频率快而幅度小', force: '轻', dur: '每处一至二分钟', useOn: '上肢、下肢', avoid: '关节不稳、骨折、习惯性脱位', src: '《推拿学》通行本', status: '已核' },
    { id: 'yao', name: '摇法', alias: '摇肩、摇髋', part: '握肢体远端', dir: '做环转被动运动，幅度由小渐大', force: '轻中', dur: '每处三至五圈', useOn: '肩、肘、腕、髋、踝', avoid: '颈椎不做摇法，关节粘连重者禁', src: '《推拿学》通行本', status: '已核' },
    { id: 'bo', name: '拨法', alias: '弹拨', part: '拇指端', dir: '沿筋腱走行垂直方向来回拨动', force: '中重', dur: '每处三至五次', useOn: '筋腱条索、压痛点', avoid: '神经干、大血管、颈前', src: '《推拿学》通行本', status: '已核' },
    { id: 'nian', name: '捻法', alias: '捻指', part: '拇指与食指', dir: '相对捻转，如捻线状', force: '轻', dur: '每处一至二分钟', useOn: '手指、足趾', avoid: '关节肿胀、骨折', src: '《推拿学》通行本', status: '已核' },
    { id: 'pai', name: '拍法', alias: '拍打', part: '虚掌', dir: '腕部放松，虚掌拍击，声脆不痛', force: '轻中', dur: '每处一至二分钟', useOn: '肩背腰臀与下肢', avoid: '肾区、脊柱、心前区、骨质疏松', src: '《推拿学》通行本', status: '已核' },
    { id: 'cuo', name: '搓法', alias: '搓上肢', part: '双掌相对', dir: '相对搓动并上下移动', force: '轻', dur: '每处一至二分钟', useOn: '上肢、下肢', avoid: '皮肤破损', src: '《推拿学》通行本', status: '已核' }
  ];

  /* 九部位：所涉经脉、常用穴、推法路线、常用手法、参考时长 */
  TN.REGIONS = [
    { id: 'tou', name: '头面', meridians: ['du', 'gallbladder', 'stomach', 'bladder'], points: ['百会', '太阳', '印堂', '攒竹', '四白', '迎香', '风池'], route: '自印堂沿眉弓分推至太阳，再由前额向上推至百会，绕耳后至风池', methods: ['mo', 'rou', 'tui', 'an'], dur: '五至八分钟', note: '面部手法宜轻，指甲须短' },
    { id: 'jingxiang', name: '颈项', meridians: ['du', 'gallbladder', 'small-intestine', 'bladder'], points: ['风府', '风池', '天柱', '大椎', '肩井', '完骨'], route: '自风府沿颈两侧向下推至大椎，再拿肩井收', methods: ['rou', 'na', 'tui', 'an'], dur: '五至八分钟', note: '颈前与颈动脉窦不做手法，不做颈椎摇法与扳法' },
    { id: 'jianbei', name: '肩背', meridians: ['small-intestine', 'gallbladder', 'bladder', 'du'], points: ['肩井', '肩髃', '天宗', '秉风', '膏肓', '大杼', '风门', '身柱'], route: '自肩井向肩髃推，沿肩胛内缘拨揉，膀胱经自上而下推', methods: ['gun', 'rou', 'an', 'bo', 'tui'], dur: '八至十二分钟', note: '肩胛内缘筋结处宜拨，脊柱棘突只揉不按' },
    { id: 'yaodi', name: '腰骶', meridians: ['du', 'bladder', 'gallbladder'], points: ['肾俞', '大肠俞', '命门', '腰阳关', '次髎', '志室', '委中'], route: '膀胱经自肾俞向下推至骶部，横擦腰骶至透热', methods: ['an', 'rou', 'ca', 'gun'], dur: '八至十二分钟', note: '孕期与经期不做腰骶重手法' },
    { id: 'xiongfu', name: '胸腹', meridians: ['ren', 'stomach', 'spleen', 'liver'], points: ['中脘', '天枢', '气海', '关元', '章门', '期门'], route: '顺时针摩腹，自中脘向下推至关元', methods: ['mo', 'rou', 'an'], dur: '八至十分钟', note: '饭后一小时内不做腹部重手法，孕期禁腹部' },
    { id: 'shangzhi', name: '上肢', meridians: ['lung', 'large-intestine', 'heart', 'small-intestine', 'pericardium', 'triple-burner'], points: ['曲池', '手三里', '合谷', '内关', '外关', '神门', '后溪', '劳宫'], route: '自肩向下沿经推至腕，揉按诸穴，末以搓抖收', methods: ['tui', 'na', 'rou', 'cuo', 'dou'], dur: '五至八分钟', note: '孕期合谷只轻揉不重按' },
    { id: 'xiazhi', name: '下肢', meridians: ['stomach', 'spleen', 'gallbladder', 'bladder', 'kidney', 'liver'], points: ['足三里', '阳陵泉', '阴陵泉', '三阴交', '血海', '委中', '承山', '太冲', '涌泉'], route: '自髀关沿胃经推至足背，沿膀胱经自臀推至跟腱', methods: ['tui', 'na', 'an', 'rou', 'gun'], dur: '八至十二分钟', note: '孕期三阴交与太冲不做重手法，静脉曲张处禁按揉' },
    { id: 'shouzu', name: '手足', meridians: ['lung', 'heart', 'pericardium', 'spleen', 'kidney', 'liver'], points: ['合谷', '劳宫', '后溪', '太冲', '涌泉', '太白', '公孙', '内庭'], route: '掌心与足心环形揉摩，指趾逐节捻转', methods: ['mo', 'rou', 'nian', 'qia'], dur: '五至八分钟', note: '掐法只用于急救取穴，常规保健以揉摩为主' },
    { id: 'quanshen', name: '全身', meridians: ['du', 'ren'], points: ['百会', '大椎', '命门', '中脘', '气海', '足三里', '三阴交', '涌泉'], route: '自头面始，经颈肩背腰，再上肢下肢，末以手足收', methods: ['tui', 'na', 'an', 'rou', 'gun', 'cuo'], dur: '二十至三十分钟', note: '全身推拿先轻后重，收势以轻手法与擦法透热为度' }
  ];

  /* 三十六症：八组，只列体感与生活场景，不列病名诊断 */
  TN.SYMPTOMS = [
    { id: 'toutong', name: '头痛', group: '头面', points: ['百会', '太阳', '风池', '合谷'], methods: ['mo', 'rou', 'an'], note: '前额痛加印堂与攒竹，后头胀加风府', src: '《推拿学》通行本' },
    { id: 'touyun', name: '头晕', group: '头面', points: ['百会', '风池', '印堂', '太冲'], methods: ['mo', 'rou', 'an'], note: '头晕伴血压高者不做头低位与重手法', src: '《推拿学》通行本' },
    { id: 'shimian', name: '失眠', group: '头面', points: ['百会', '印堂', '神门', '三阴交', '涌泉'], methods: ['mo', 'rou', 'an'], note: '睡前操作，手法宜轻，以摩与揉为主', src: '《推拿学》通行本' },
    { id: 'muzhang', name: '目胀', group: '头面', points: ['攒竹', '睛明', '太阳', '风池'], methods: ['rou', 'mo', 'an'], note: '眼周只揉不按，睛明轻揉，不压眼球', src: '《推拿学》通行本' },
    { id: 'bisai', name: '鼻塞', group: '头面', points: ['迎香', '印堂', '合谷', '风池'], methods: ['rou', 'tui', 'an'], note: '自迎香向鼻根方向推，两侧各三十次', src: '《推拿学》通行本' },
    { id: 'mianjin', name: '面紧', group: '头面', points: ['颊车', '下关', '地仓', '四白'], methods: ['rou', 'mo', 'an'], note: '咬肌紧者自下关向颊车揉，张口受限先就医', src: '《推拿学》通行本' },
    { id: 'jingjianjin', name: '颈肩紧', group: '颈项', points: ['风池', '天柱', '肩井', '大椎', '肩中俞'], methods: ['na', 'rou', 'bo', 'an'], note: '久坐者自风池向下拿至肩井，肩胛内缘拨筋', src: '《推拿学》通行本' },
    { id: 'luozhen', name: '落枕', group: '颈项', points: ['风池', '天柱', '肩井', '后溪'], methods: ['rou', 'na', 'an'], note: '先远端取穴后局部，不做颈椎旋转扳法', src: '《推拿学》通行本' },
    { id: 'xiangqiang', name: '项强', group: '颈项', points: ['风府', '大椎', '天柱', '完骨'], methods: ['rou', 'tui', 'an'], note: '项强伴发热与呕吐先就医，不做推拿', src: '《推拿学》通行本' },
    { id: 'yanbujin', name: '咽部紧', group: '颈项', points: ['廉泉', '合谷', '风池'], methods: ['rou', 'an'], note: '颈前只轻揉，不压迫气管与颈动脉窦', src: '《推拿学》通行本' },
    { id: 'jiansuan', name: '肩酸', group: '肩背', points: ['肩井', '肩髃', '肩髎', '天宗'], methods: ['gun', 'rou', 'an', 'bo'], note: '肩髃与肩髎处可拨，肩前痛加云门轻揉', src: '《推拿学》通行本' },
    { id: 'jianjiatong', name: '肩胛痛', group: '肩背', points: ['天宗', '秉风', '曲垣', '膏肓'], methods: ['bo', 'an', 'rou'], note: '肩胛内缘条索处弹拨，力度以能忍为度', src: '《推拿学》通行本' },
    { id: 'beichen', name: '背沉', group: '肩背', points: ['身柱', '大杼', '风门', '膏肓'], methods: ['gun', 'rou', 'ca'], note: '膀胱经自上而下滚揉，末以横擦透热', src: '《推拿学》通行本' },
    { id: 'jiuzuo', name: '久坐劳损', group: '肩背', points: ['肩井', '天宗', '肾俞', '委中', '承山'], methods: ['gun', 'rou', 'an', 'bo'], note: '每坐一小时起身活动，推拿只作缓解', src: '《推拿学》通行本' },
    { id: 'shangzhima', name: '上肢麻', group: '肩背', points: ['极泉', '曲池', '手三里', '合谷'], methods: ['rou', 'na', 'an'], note: '麻木持续或肌力下降先就医，不单靠推拿', src: '《推拿学》通行本' },
    { id: 'yaosuan', name: '腰酸', group: '腰骶', points: ['肾俞', '大肠俞', '命门', '委中'], methods: ['an', 'rou', 'ca', 'gun'], note: '腰酸伴下肢放射痛先就医，不做重手法', src: '《推拿学》通行本' },
    { id: 'yaoleng', name: '腰冷', group: '腰骶', points: ['命门', '腰阳关', '肾俞', '志室'], methods: ['ca', 'rou', 'an'], note: '横擦腰骶至透热，介质可用葱姜水', src: '《推拿学》通行本' },
    { id: 'dibusuan', name: '骶部酸', group: '腰骶', points: ['次髎', '腰俞', '膀胱俞', '委中'], methods: ['an', 'rou', 'ca'], note: '骶部手法宜缓和，孕期与经期禁', src: '《推拿学》通行本' },
    { id: 'jiuzhan', name: '久站腰困', group: '腰骶', points: ['肾俞', '大肠俞', '承山', '足三里'], methods: ['rou', 'an', 'tui'], note: '久站者重点在小腿与腰骶，收势抬腿', src: '《推拿学》通行本' },
    { id: 'jingqianyao', name: '经前腰酸', group: '腰骶', points: ['肾俞', '次髎', '三阴交', '太冲'], methods: ['rou', 'an', 'mo'], note: '经前以轻手法为主，经期不做腰骶重手法', src: '《推拿学》通行本' },
    { id: 'wansuan', name: '腕酸', group: '上肢', points: ['阳溪', '阳池', '外关', '合谷'], methods: ['rou', 'nian', 'an'], note: '腕部先捻后揉，肿痛明显先就医', src: '《推拿学》通行本' },
    { id: 'zhousuan', name: '肘酸', group: '上肢', points: ['曲池', '手三里', '尺泽', '少海'], methods: ['rou', 'an', 'bo'], note: '肱骨外上髁处只揉不重拨', src: '《推拿学》通行本' },
    { id: 'shouzhima', name: '手指麻', group: '上肢', points: ['曲池', '手三里', '合谷', '后溪'], methods: ['rou', 'nian', 'an'], note: '夜间麻醒者先排查腕管，不单靠推拿', src: '《推拿学》通行本' },
    { id: 'shoubifali', name: '手臂乏力', group: '上肢', points: ['曲池', '手三里', '内关', '合谷'], methods: ['na', 'rou', 'cuo'], note: '以拿与搓为主，力度由轻渐重', src: '《推拿学》通行本' },
    { id: 'tuichen', name: '腿沉', group: '下肢', points: ['足三里', '阴陵泉', '承山', '委中'], methods: ['tui', 'na', 'rou'], note: '自下向上推回，静脉曲张处禁按揉', src: '《推拿学》通行本' },
    { id: 'xiruan', name: '膝软', group: '下肢', points: ['犊鼻', '内膝眼', '鹤顶', '足三里', '血海'], methods: ['rou', 'an', 'mo'], note: '膝部只揉不摇，肿胀积液先就医', src: '《推拿学》通行本' },
    { id: 'xiaotuizhang', name: '小腿胀', group: '下肢', points: ['承山', '委中', '昆仑', '三阴交'], methods: ['rou', 'an', 'tui'], note: '小腿肿胀发热须先排除血栓，不做按揉', src: '《推拿学》通行本' },
    { id: 'zugen', name: '足跟酸', group: '下肢', points: ['昆仑', '太溪', '涌泉', '照海'], methods: ['rou', 'an', 'mo'], note: '足跟痛者以揉摩为主，晨起第一步痛明显者减量', src: '《推拿学》通行本' },
    { id: 'fuzhang', name: '腹胀', group: '腹部', points: ['中脘', '天枢', '气海', '足三里'], methods: ['mo', 'rou', 'an'], note: '顺时针摩腹，饭后一小时内不做', src: '《推拿学》通行本' },
    { id: 'shiyucha', name: '食欲差', group: '腹部', points: ['中脘', '足三里', '脾俞', '胃俞'], methods: ['mo', 'rou', 'an'], note: '背部脾俞胃俞各揉一分钟，腹部顺时针摩', src: '《推拿学》通行本' },
    { id: 'bianmi', name: '便秘', group: '腹部', points: ['天枢', '大横', '支沟', '上巨虚'], methods: ['mo', 'an', 'rou'], note: '沿结肠走向顺时针推按，孕妇禁腹部手法', src: '《推拿学》通行本' },
    { id: 'jingqianfuzhang', name: '经前腹胀', group: '腹部', points: ['气海', '关元', '三阴交', '太冲'], methods: ['mo', 'rou'], note: '经前轻摩小腹，经期不做腹部手法', src: '《推拿学》通行本' },
    { id: 'pilao', name: '疲劳', group: '全身', points: ['百会', '大椎', '足三里', '涌泉'], methods: ['na', 'rou', 'an', 'ca'], note: '以背腰与下肢为主，收势擦涌泉', src: '《推拿学》通行本' },
    { id: 'weihan', name: '畏寒', group: '全身', points: ['命门', '关元', '肾俞', '涌泉'], methods: ['ca', 'mo', 'an'], note: '擦腰骶与擦涌泉至透热，介质可用葱姜水', src: '《推拿学》通行本' },
    { id: 'yixing', name: '易醒', group: '全身', points: ['神门', '内关', '三阴交', '涌泉'], methods: ['rou', 'mo', 'an'], note: '睡前半小时操作，全程轻手法，不做擦法', src: '《推拿学》通行本' },
    { id: 'yundongsuan', name: '运动后酸痛', group: '全身', points: ['大椎', '肾俞', '委中', '承山', '足三里'], methods: ['gun', 'rou', 'an', 'tui'], note: '运动后两小时再做，急性拉伤二十四小时内不做推拿', src: '《推拿学》通行本' }
  ];

  /* 七十二穴推拿取法：穴名与 jingluo-data 逐字一致，代码由该件按名取 */
  TN.POINT_OPS = [
    { point: '百会', m: 'an', dir: '中指端垂直按，得气后缓放', force: '轻中', dur: '三至五秒，五至八次', avoid: '囟门未闭者禁', src: '《推拿学》通行本' },
    { point: '印堂', m: 'rou', dir: '指腹自印堂向上揉至前额', force: '轻', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '太阳', m: 'rou', dir: '指腹环形揉，自眉梢向外上方', force: '轻', dur: '一分钟，两侧同', avoid: '颞部血管明显者轻揉', src: '《推拿学》通行本' },
    { point: '攒竹', m: 'rou', dir: '指腹沿眉弓自内向外揉', force: '轻', dur: '三十秒，两侧同', avoid: '不压眼球', src: '《推拿学》通行本' },
    { point: '四白', m: 'rou', dir: '指腹轻揉眶下孔处', force: '轻', dur: '三十秒', avoid: '不向下压眼球', src: '《推拿学》通行本' },
    { point: '迎香', m: 'tui', dir: '自迎香向鼻根方向推', force: '轻', dur: '三十次，两侧同', avoid: '', src: '《推拿学》通行本' },
    { point: '地仓', m: 'rou', dir: '指腹轻揉口角旁', force: '轻', dur: '三十秒', avoid: '', src: '《推拿学》通行本' },
    { point: '颊车', m: 'rou', dir: '自下关向颊车揉，沿咬肌走行', force: '轻中', dur: '一分钟', avoid: '张口受限先就医', src: '《推拿学》通行本' },
    { point: '下关', m: 'rou', dir: '指腹环形揉颧弓下缘', force: '轻', dur: '一分钟', avoid: '不重按颞下颌关节', src: '《推拿学》通行本' },
    { point: '听宫', m: 'rou', dir: '张口位指腹轻揉耳屏前', force: '轻', dur: '三十秒', avoid: '', src: '《推拿学》通行本' },
    { point: '翳风', m: 'rou', dir: '指腹轻揉耳垂后方凹陷', force: '轻', dur: '三十秒', avoid: '不压迫颈动脉', src: '《推拿学》通行本' },
    { point: '完骨', m: 'rou', dir: '指腹环形揉乳突后下方', force: '轻中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '风府', m: 'rou', dir: '指腹轻揉枕外隆凸下', force: '轻', dur: '三十秒', avoid: '不向前上方深压', src: '《推拿学》通行本' },
    { point: '风池', m: 'an', dir: '拇指向鼻尖方向按，得气即止', force: '中', dur: '三至五秒，五至八次', avoid: '不向内上方深按', src: '《推拿学》通行本' },
    { point: '天柱', m: 'rou', dir: '指腹沿斜方肌外缘揉', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '大椎', m: 'rou', dir: '指腹环形揉第七颈椎棘突下', force: '中', dur: '一分钟', avoid: '棘突本身只揉不按', src: '《推拿学》通行本' },
    { point: '肩井', m: 'na', dir: '提捏斜方肌肌腹后放松', force: '中', dur: '三至五次', avoid: '孕期禁，不向下深压', src: '《推拿学》通行本' },
    { point: '肩中俞', m: 'rou', dir: '指腹揉肩胛内上角内侧', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '肩外俞', m: 'rou', dir: '指腹揉肩胛内上角外侧', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '肩髃', m: 'bo', dir: '拇指端沿三角肌前后束弹拨', force: '中重', dur: '三至五次', avoid: '肩部急性损伤禁', src: '《推拿学》通行本' },
    { point: '肩髎', m: 'rou', dir: '指腹揉肩峰后下方凹陷', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '天宗', m: 'bo', dir: '拇指端在冈下窝条索处弹拨', force: '中重', dur: '三至五次', avoid: '骨质疏松者减力', src: '《推拿学》通行本' },
    { point: '秉风', m: 'rou', dir: '指腹揉冈上窝', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '曲垣', m: 'rou', dir: '指腹揉肩胛内上缘', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '大杼', m: 'rou', dir: '指腹揉第一胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '棘突只揉不按', src: '《推拿学》通行本' },
    { point: '风门', m: 'rou', dir: '指腹揉第二胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '膏肓', m: 'an', dir: '拇指按第四胸椎棘突下旁开，得气即止', force: '中重', dur: '三至五秒，三至五次', avoid: '瘦弱者减力', src: '《推拿学》通行本' },
    { point: '肺俞', m: 'rou', dir: '指腹揉第三胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '心俞', m: 'rou', dir: '指腹揉第五胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '心脏病患者轻手法', src: '《推拿学》通行本' },
    { point: '膈俞', m: 'rou', dir: '指腹揉第七胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '肝俞', m: 'rou', dir: '指腹揉第九胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '脾俞', m: 'rou', dir: '指腹揉第十一胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '胃俞', m: 'rou', dir: '指腹揉第十二胸椎棘突下旁开', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '肾俞', m: 'an', dir: '拇指按第二腰椎棘突下旁开，得气即止', force: '中', dur: '三至五秒，五至八次', avoid: '孕期禁重按', src: '《推拿学》通行本' },
    { point: '大肠俞', m: 'an', dir: '拇指按第四腰椎棘突下旁开', force: '中', dur: '三至五秒，五至八次', avoid: '孕期禁重按', src: '《推拿学》通行本' },
    { point: '志室', m: 'rou', dir: '指腹揉第二腰椎棘突下旁开三寸', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '命门', m: 'ca', dir: '横擦命门至透热', force: '中', dur: '三十至六十次', avoid: '皮肤破损禁', src: '《推拿学》通行本' },
    { point: '腰阳关', m: 'ca', dir: '横擦腰阳关至透热', force: '中', dur: '三十至六十次', avoid: '皮肤破损禁', src: '《推拿学》通行本' },
    { point: '次髎', m: 'an', dir: '拇指按第二骶后孔，得气即止', force: '中重', dur: '三至五秒，三至五次', avoid: '孕期与经期禁', src: '《推拿学》通行本' },
    { point: '中脘', m: 'mo', dir: '掌面顺时针环形摩', force: '轻', dur: '二至三分钟', avoid: '饭后一小时内禁，腹部肿块禁', src: '《推拿学》通行本' },
    { point: '上脘', m: 'mo', dir: '掌面顺时针环形摩', force: '轻', dur: '一分钟', avoid: '饭后一小时内禁', src: '《推拿学》通行本' },
    { point: '下脘', m: 'mo', dir: '掌面顺时针环形摩', force: '轻', dur: '一分钟', avoid: '饭后一小时内禁', src: '《推拿学》通行本' },
    { point: '天枢', m: 'an', dir: '指腹垂直按，得气后缓放', force: '轻中', dur: '三至五秒，五至八次', avoid: '孕期禁', src: '《推拿学》通行本' },
    { point: '气海', m: 'rou', dir: '指腹或掌根环形揉', force: '轻', dur: '一至二分钟', avoid: '孕期禁', src: '《推拿学》通行本' },
    { point: '关元', m: 'rou', dir: '掌根环形揉，以温热为度', force: '轻', dur: '一至二分钟', avoid: '孕期禁，经期禁', src: '《推拿学》通行本' },
    { point: '中极', m: 'rou', dir: '掌根轻揉小腹下部', force: '轻', dur: '一分钟', avoid: '孕期禁，膀胱充盈时禁', src: '《推拿学》通行本' },
    { point: '章门', m: 'rou', dir: '指腹沿肋弓轻揉', force: '轻', dur: '三十秒', avoid: '肝脾肿大者禁', src: '《推拿学》通行本' },
    { point: '期门', m: 'rou', dir: '指腹沿肋间隙轻揉', force: '轻', dur: '三十秒', avoid: '不重压肋弓', src: '《推拿学》通行本' },
    { point: '带脉', m: 'rou', dir: '指腹沿腰侧环形揉', force: '轻中', dur: '一分钟', avoid: '孕期禁', src: '《推拿学》通行本' },
    { point: '大横', m: 'an', dir: '指腹按脐旁，得气后缓放', force: '轻中', dur: '三至五秒，五至八次', avoid: '孕期禁', src: '《推拿学》通行本' },
    { point: '曲池', m: 'an', dir: '拇指端垂直按，得气即止', force: '中重', dur: '三至五秒，五至八次', avoid: '肘部急性肿痛禁', src: '《推拿学》通行本' },
    { point: '手三里', m: 'rou', dir: '指腹沿前臂肌腹揉', force: '中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '合谷', m: 'an', dir: '拇指端向第二掌骨方向按', force: '中', dur: '三至五秒，五至八次', avoid: '孕期只轻揉不重按', src: '《推拿学》通行本' },
    { point: '外关', m: 'an', dir: '拇指端垂直按腕背横纹上', force: '中', dur: '三至五秒，五至八次', avoid: '', src: '《推拿学》通行本' },
    { point: '内关', m: 'an', dir: '拇指端垂直按腕横纹上，得气即止', force: '中', dur: '三至五秒，五至八次', avoid: '不向肘方向深压', src: '《推拿学》通行本' },
    { point: '神门', m: 'rou', dir: '指腹轻揉腕横纹尺侧', force: '轻', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '后溪', m: 'an', dir: '拇指端按第五掌骨小头后方', force: '中', dur: '三至五秒，五至八次', avoid: '', src: '《推拿学》通行本' },
    { point: '劳宫', m: 'rou', dir: '拇指腹环形揉掌心', force: '轻中', dur: '一分钟', avoid: '', src: '《推拿学》通行本' },
    { point: '尺泽', m: 'rou', dir: '指腹揉肘横纹外侧', force: '轻中', dur: '三十秒', avoid: '肘窝血管处不重压', src: '《推拿学》通行本' },
    { point: '少海', m: 'rou', dir: '指腹揉肘横纹内侧', force: '轻', dur: '三十秒', avoid: '不重压尺神经沟', src: '《推拿学》通行本' },
    { point: '足三里', m: 'an', dir: '拇指端垂直按，得气即止', force: '中重', dur: '三至五秒，五至八次', avoid: '', src: '《推拿学》通行本' },
    { point: '阳陵泉', m: 'an', dir: '拇指端按腓骨小头前下方', force: '中', dur: '三至五秒，五至八次', avoid: '不重压腓总神经', src: '《推拿学》通行本' },
    { point: '阴陵泉', m: 'an', dir: '拇指端按胫骨内侧髁下缘', force: '中', dur: '三至五秒，五至八次', avoid: '', src: '《推拿学》通行本' },
    { point: '三阴交', m: 'an', dir: '拇指端垂直按内踝上三寸', force: '中', dur: '三至五秒，五至八次', avoid: '孕期禁按', src: '《推拿学》通行本' },
    { point: '血海', m: 'rou', dir: '指腹揉髌骨内上缘上方', force: '中', dur: '一分钟', avoid: '抗凝治疗者轻手法', src: '《推拿学》通行本' },
    { point: '委中', m: 'an', dir: '拇指端按腘横纹中点', force: '中', dur: '三至五秒，三至五次', avoid: '腘窝血管神经处不深压，静脉曲张禁', src: '《推拿学》通行本' },
    { point: '承山', m: 'an', dir: '拇指端按腓肠肌两肌腹之间', force: '中重', dur: '三至五秒，五至八次', avoid: '小腿肿胀发热禁', src: '《推拿学》通行本' },
    { point: '太冲', m: 'an', dir: '拇指端向足跟方向按', force: '中', dur: '三至五秒，五至八次', avoid: '孕期只轻揉', src: '《推拿学》通行本' },
    { point: '涌泉', m: 'rou', dir: '拇指腹环形揉足心，末以擦法透热', force: '中', dur: '一至二分钟', avoid: '足底破损禁', src: '《推拿学》通行本' },
    { point: '太白', m: 'rou', dir: '指腹揉第一跖骨小头后下方', force: '轻中', dur: '三十秒', avoid: '', src: '《推拿学》通行本' },
    { point: '公孙', m: 'rou', dir: '指腹揉第一跖骨基底前下方', force: '轻中', dur: '三十秒', avoid: '', src: '《推拿学》通行本' },
    { point: '昆仑', m: 'an', dir: '拇指端按外踝与跟腱之间', force: '中', dur: '三至五秒，三至五次', avoid: '孕期禁', src: '《推拿学》通行本' }
  ];

  /* 十二禁忌：情形、不宜、缘由、替代做法、出处 */
  TN.LIMITS = [
    { id: 'preg', name: '孕期', avoid: '腰骶、腹部、合谷、三阴交、肩井、昆仑一律不用；重手法禁', why: '上述部位与穴位有通经活血之性，孕期不宜刺激', alt: '只做四肢轻手法，取穴避开禁忌穴', src: '《推拿学》通行本' },
    { id: 'period', name: '经期', avoid: '腰骶与腹部重手法不做', why: '经期盆腔充血，重手法易致经量增多', alt: '改为四肢与头面轻手法', src: '《推拿学》通行本' },
    { id: 'osteo', name: '骨质疏松', avoid: '禁重按、拍法与任何冲击类手法', why: '骨密度低者受冲击易致骨折', alt: '只用轻摩与轻揉，力度以不痛为度', src: '《推拿学》通行本' },
    { id: 'trauma', name: '急性外伤与骨折', avoid: '损伤局部禁推拿', why: '急性期手法可加重出血与移位', alt: '先固定就医，恢复期再行手法', src: '《推拿学》通行本' },
    { id: 'fever', name: '发热与急性感染', avoid: '不做全身推拿', why: '全身手法增加循环负担，感染期不宜', alt: '退热后再做，或只做手足轻摩', src: '《推拿学》通行本' },
    { id: 'skin', name: '皮肤破损与皮肤病', avoid: '患处禁手法，禁擦法', why: '破损处手法易致感染扩散', alt: '避开患处，其余部位照常', src: '《推拿学》通行本' },
    { id: 'bleed', name: '出血倾向与抗凝治疗', avoid: '禁重手法与擦法', why: '凝血功能低下者易致皮下出血', alt: '只用轻摩，力度以皮肤不变色为度', src: '《推拿学》通行本' },
    { id: 'thrombus', name: '静脉血栓与静脉曲张', avoid: '患肢禁按揉与推法', why: '按压可致血栓脱落', alt: '抬高患肢，就医处理', src: '《推拿学》通行本' },
    { id: 'cardio', name: '严重心脑血管病', avoid: '不做全身推拿，禁颈前与颈动脉窦手法', why: '手法可致血压与心率波动', alt: '只做四肢轻手法，时间不超过十分钟', src: '《推拿学》通行本' },
    { id: 'meal', name: '饭后一小时内', avoid: '腹部禁重手法', why: '饱食后腹部手法影响消化', alt: '改做头面与四肢', src: '《推拿学》通行本' },
    { id: 'drunk', name: '醉酒与空腹', avoid: '不做推拿', why: '此时耐受差，易致晕厥', alt: '进食休息后再做', src: '《推拿学》通行本' },
    { id: 'tumor', name: '恶性肿瘤局部', avoid: '肿瘤部位禁推拿', why: '局部手法有扩散风险', alt: '只做远端轻手法，须经主诊医师同意', src: '《推拿学》通行本' }
  ];

  /* 六介质：用法与注意 */
  TN.MEDIA = [
    { id: 'dry', name: '干推', use: '直接手法，不需介质', note: '适于肌肉丰厚处与需透热者；皮肤干涩者不宜久推', link: '' },
    { id: 'talc', name: '滑石粉', use: '吸汗滑润，减少皮肤摩擦', note: '适于夏季与汗多者；皮肤破损处不用', link: '' },
    { id: 'ginger', name: '葱姜水', use: '温通散寒，蘸取后行擦法与摩法', note: '适于风寒表证与腰背冷；皮肤敏感者先小面积试', link: '' },
    { id: 'oil', name: '按摩油', use: '润滑持久，适于全身与长时间操作', note: '油性皮肤与面部少用；配方与浓度见精油芳疗页', link: 'jingyou.html' },
    { id: 'water', name: '清水', use: '清凉，蘸取后行推法与摩法', note: '适于夏季与发热后；不用油者取此', link: '' },
    { id: 'wine', name: '药酒', use: '活血通络，蘸取后行擦法', note: '适于跌打后期；皮肤破损、孕期与儿童禁，酒精过敏者不用', link: '' }
  ];

  /* 十六部典籍：书名、卷次与要旨、本站取法、评级、出处 */
  TN.BOOKS = [
    { id: 'suwen', book: '《黄帝内经·素问》', part: '异法方宜论述导引按跷，为推拿名源；阴阳应象大论与血气形志论述治则', take: '取导引按跷之名与中央湿病治宜之义，不逐句引原文', grade: '甲', src: 'ctext、维基文库' },
    { id: 'lingshu', book: '《黄帝内经·灵枢》', part: '经脉篇述十二经循行与病候，九针十二原述经气', take: '经脉循行与病候与站内经络数据同源，取穴依经', grade: '甲', src: 'ctext、维基文库' },
    { id: 'jiayi', book: '《针灸甲乙经》', part: '晋皇甫谧撰，现存最早腧穴专书，载三百四十九穴定位与主治', take: '取穴部位与国标对读，定位以现行国标为准', grade: '甲', src: '维基文库、殆知阁' },
    { id: 'jinjian', book: '《医宗金鉴·正骨心法要旨》', part: '清吴谦等撰，正骨八法为摸接端提按摩推拿，推拿之名所自出', take: '只取按、摩、推、拿四法之名与要旨，正骨四法不列', grade: '甲', src: '维基文库' },
    { id: 'lizheng', book: '《厘正按摩要术》', part: '清张振鋆撰，四卷为辨证、立法、取穴、列证，成人推拿系统底本', take: '立法与取穴两卷作手法与取穴的主要依据；卷次篇目待对读', grade: '乙', src: '待查' },
    { id: 'shengji', book: '《圣济总录》', part: '宋官修，治法门载按摩', take: '作按摩治法的旁证，不取具体手法数值', grade: '乙', src: '待查' },
    { id: 'qianjin', book: '《备急千金要方》', part: '唐孙思邈撰，养性篇载按摩法', take: '作按摩法的旁证与源流', grade: '乙', src: '维基文库' },
    { id: 'waitai', book: '《外台秘要》', part: '唐王焘撰，引千金按摩法', take: '作源流转引，不另立手法', grade: '乙', src: '待查' },
    { id: 'binghou', book: '《诸病源候论》', part: '隋巢元方撰，病候后附导引法', take: '作按导源流，取导引与按跷同源之义', grade: '乙', src: '待查' },
    { id: 'zunsheng', book: '《遵生八笺》', part: '明高濂撰，起居安乐笺载按摩导引', take: '作养生按摩的旁证', grade: '乙', src: '待查' },
    { id: 'guangyi', book: '《推拿广意》', part: '清熊应雄撰，小儿推拿专著', take: '只作旁证，不作成人手法依据', grade: '丙', src: '待查' },
    { id: 'mizhi', book: '《小儿推拿秘旨》', part: '明龚廷贤撰，小儿推拿专著', take: '只作旁证，不作成人手法依据', grade: '丙', src: '待查' },
    { id: 'tuina-xue', book: '《推拿学》', part: '全国中医药行业高等教育规划教材，述手法分类、着力部位、方向、力度与时长', take: '十六法的着力部位、方向、力度、时长取此通行表述', grade: '现代', src: '纸本教材' },
    { id: 'gb12346', book: 'GB/T 12346-2021 经穴名称与定位', part: '国家标准，定经穴名称与定位', take: '穴位定位以此为准，与经络数据同源', grade: '标准', src: '标准文本' },
    { id: 'gb40997', book: 'GB/T 40997-2021 经外奇穴名称与定位', part: '国家标准，定经外奇穴名称与定位', take: '奇穴定位以此为准', grade: '标准', src: '标准文本' },
    { id: 'cidian', book: '《中医大辞典》', part: '人民卫生出版社，收中医术语定名', take: '术语定名取此，不取网络释义', grade: '现代', src: '纸本辞书' }
  ];

  /* 力度档：供界面与结果文案取用 */
  TN.FORCES = [
    { id: 'light', name: '轻', note: '以皮肤微热、不痛为度，适于头面、腹部与虚弱者' },
    { id: 'mid', name: '中', note: '以得气而能忍为度，适于四肢与背腰，为常规档' },
    { id: 'heavy', name: '重', note: '以酸胀明显但可忍为度，只用于肌肉丰厚处，时间宜短' }
  ];
})(typeof window !== 'undefined' ? window : this);
