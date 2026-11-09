/* 食疗数据（assets/shiliao-data.js）
 * 字段与口径：食材性味归经、食疗方、药食同源目录、体质季节地区人群与膳食结构。
 * 性味归经以《中华本草》《中国药典》为主，食疗方以《饮膳正要》《食疗本草》《随息居饮食谱》等谱录为主。
 * 待核条目不进配膳。 */
window.SL_DATA = {
 "foods": [
  {
   "id": "jingmi",
   "name": "粳米",
   "alias": [
    "大米",
    "白米"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "补中益气",
    "健脾和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少倦怠、口干烦渴。",
   "foodUse": "煮粥、蒸饭，常用 50 至 150 克。",
   "caution": [
    "湿热内盛者不宜过量。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河南、山东、江苏、黑龙江",
   "originGeo": "",
   "originNote": "不同产地粳米黏性与香气有别。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 粳米",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "jingmi",
   "trad": "粳米"
  },
  {
   "id": "nuomi",
   "name": "糯米",
   "alias": [
    "江米",
    "酒米"
   ],
   "cat": "谷薯",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "补中益气",
    "健脾暖胃"
   ],
   "use": "传统食养用于脾胃虚寒、食欲不振、倦怠乏力。",
   "foodUse": "煮粥、包粽子、做年糕，常用 30 至 100 克。",
   "caution": [
    "黏滞难化，脾胃虚弱者不宜多食。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "",
   "originNote": "粳糯更软糯，籼糯黏性稍弱。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 糯米",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "nuomi",
   "trad": "糯米"
  },
  {
   "id": "heimi",
   "name": "黑米",
   "alias": [
    "紫米",
    "墨米"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "养血",
    "滋阴"
   ],
   "use": "传统食养用于脾虚食少、气血不足、须发早白。",
   "foodUse": "煮粥、蒸饭，宜提前浸泡，常用 30 至 100 克。",
   "caution": [
    "外皮较硬，宜提前浸泡。",
    "消化功能弱者一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "陕西、贵州、云南、广西",
   "originGeo": "陕西洋县黑米",
   "originNote": "粒形与色泽深浅不一，煮前宜浸泡。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，篇目未核。",
   "cost": "中等",
   "py": "heimi",
   "trad": "黑米"
  },
  {
   "id": "xiaomi",
   "name": "小米",
   "alias": [
    "粟米",
    "谷子",
    "粟谷"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肾",
    "脾",
    "胃"
   ],
   "effect": [
    "健脾和胃",
    "益气",
    "生津"
   ],
   "use": "传统食养用于脾胃虚弱、食少倦怠、心烦口渴。",
   "foodUse": "煮粥、蒸饭，常用 30 至 100 克。",
   "caution": [
    "素体虚寒者不宜长期单食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河北、山西、内蒙古、山东",
   "originGeo": "",
   "originNote": "新米香气足，陈米味淡。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 粟米",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiaomi",
   "trad": "小米"
  },
  {
   "id": "xiaomai",
   "name": "小麦",
   "alias": [
    "麦子",
    "麦仁"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "脾",
    "肾"
   ],
   "effect": [
    "养心安神",
    "健脾",
    "益气"
   ],
   "use": "传统食养用于心神不宁、烦躁不眠、口干。",
   "foodUse": "磨面做面食，常用 50 至 150 克。",
   "caution": [
    "麸质过敏者忌食。",
    "湿热内盛者不宜过量。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "河南、山东、河北、安徽",
   "originGeo": "",
   "originNote": "硬质小麦筋力强，软质小麦口感松软。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 小麦",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiaomai",
   "trad": "小麥"
  },
  {
   "id": "damai",
   "name": "大麦",
   "alias": [
    "牟麦",
    "饭麦",
    "赤膊麦"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾和胃",
    "消食",
    "利水"
   ],
   "use": "传统食养用于饮食过量、脘腹胀满、小便不利。",
   "foodUse": "煮粥、做麦饭，常用 30 至 100 克。",
   "caution": [
    "麸质过敏者忌食。",
    "哺乳期不宜大量食用。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、云南、甘肃",
   "originGeo": "",
   "originNote": "二棱大麦粒大，六棱大麦味厚。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 大麦",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "damai",
   "trad": "大麥"
  },
  {
   "id": "yanmai",
   "name": "燕麦",
   "alias": [
    "雀麦",
    "油麦",
    "莜麦"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肝"
   ],
   "effect": [
    "健脾益气",
    "润肠"
   ],
   "use": "传统食养用于脾虚食少、倦怠乏力、大便干结。",
   "foodUse": "煮粥、冲泡麦片，常用 30 至 80 克。",
   "caution": [
    "对麸质敏感者宜选标注无麸质产品。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、河北、山西、甘肃",
   "originGeo": "",
   "originNote": "莜麦粒饱满，燕麦片厚薄影响口感。",
   "sourceBook": "中华本草",
   "sourceChapter": "燕麦",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "中等",
   "py": "yanmai",
   "trad": "燕麥"
  },
  {
   "id": "qiaomai",
   "name": "荞麦",
   "alias": [
    "三角麦",
    "乌麦",
    "花荞"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾消食",
    "宽肠",
    "清热"
   ],
   "use": "传统食养用于饮食过量、脘腹胀满、大便不畅。",
   "foodUse": "磨面做面条、饸饹，常用 30 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、陕西、山西、云南",
   "originGeo": "",
   "originNote": "甜荞味淡，苦荞味苦。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 荞麦",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "qiaomai",
   "trad": "蕎麥"
  },
  {
   "id": "yumi",
   "name": "玉米",
   "alias": [
    "玉蜀黍",
    "包谷",
    "苞米",
    "棒子",
    "苞谷",
    "玉茭"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾开胃",
    "利水",
    "祛湿"
   ],
   "use": "传统食养用于胃纳不佳、饮食减少、小便不利。",
   "foodUse": "煮食、磨粉做饼，常用 100 至 200 克。",
   "caution": [
    "霉变玉米不可食。",
    "粗粮一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "吉林、黑龙江、河南、山东",
   "originGeo": "",
   "originNote": "甜玉米汁多，糯玉米黏软。",
   "sourceBook": "中华本草",
   "sourceChapter": "玉蜀黍",
   "grade": "甲",
   "status": "已核",
   "uncertain": "明清本草始见，篇目未核。",
   "cost": "平价",
   "py": "yumi",
   "trad": "玉米"
  },
  {
   "id": "gaoliang",
   "name": "高粱",
   "alias": [
    "蜀黍",
    "红粮",
    "秫米"
   ],
   "cat": "谷薯",
   "nature": "温",
   "flavor": [
    "甘",
    "涩"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "温中",
    "收敛"
   ],
   "use": "传统食养用于脾虚食少、大便稀溏、倦怠。",
   "foodUse": "磨面做饼、煮粥，常用 30 至 80 克。",
   "caution": [
    "大便干结者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "辽宁、吉林、内蒙古、山西",
   "originGeo": "",
   "originNote": "红高粱单宁重，白高粱口感较淡。",
   "sourceBook": "中华本草",
   "sourceChapter": "高粱",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "平价",
   "py": "gaoliang",
   "trad": "高粱"
  },
  {
   "id": "shumi",
   "name": "黍米",
   "alias": [
    "黄米",
    "黍子",
    "黏米",
    "大黄米"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠",
    "肺"
   ],
   "effect": [
    "益气补中",
    "健脾"
   ],
   "use": "传统食养用于脾胃虚弱、食欲不振、烦渴。",
   "foodUse": "煮粥、做糕，常用 30 至 80 克。",
   "caution": [
    "黏滞，湿热内盛者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山西、陕西、内蒙古、河北",
   "originGeo": "",
   "originNote": "黏性大，宜少量搭配。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 黍米",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "shumi",
   "trad": "黍米"
  },
  {
   "id": "jimi",
   "name": "稷米",
   "alias": [
    "粢米",
    "稷谷"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气补中",
    "健脾和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少乏力、口干。",
   "foodUse": "煮粥、蒸饭，常用 30 至 100 克。",
   "caution": [
    "一次不宜过量。",
    "湿热内盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山西、陕西、甘肃、河北",
   "originGeo": "",
   "originNote": "粒小色淡，口感介于小米与黍米之间。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 稷米",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "jimi",
   "trad": "稷米"
  },
  {
   "id": "yiyiren",
   "name": "薏苡仁",
   "alias": [
    "薏米",
    "苡仁",
    "六谷米",
    "菩提珠",
    "薏仁米",
    "薏苡米"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘",
    "淡"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "利水",
    "清热"
   ],
   "use": "传统食养用于脾虚湿重、食少便溏、肢体困重。",
   "foodUse": "煮粥、煲汤，常用 20 至 60 克。",
   "caution": [
    "孕期慎用。",
    "津液不足者不宜大量长期食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "贵州、福建、河北、云南",
   "originGeo": "贵州兴仁薏苡仁",
   "originNote": "粒小饱满者糯性强。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 薏苡仁",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "yiyiren",
   "trad": "薏苡仁"
  },
  {
   "id": "malingshu",
   "name": "马铃薯",
   "alias": [
    "土豆",
    "洋芋",
    "山药蛋",
    "薯仔",
    "地蛋"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾和胃",
    "益气"
   ],
   "use": "传统食养用于脾胃虚弱、食欲不振、倦怠乏力。",
   "foodUse": "蒸、煮、炒食，常用 100 至 200 克。",
   "caution": [
    "发芽或表皮变绿者不可食。",
    "需充分加热后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "甘肃、内蒙古、云南、四川",
   "originGeo": "",
   "originNote": "黄肉品种口感粉糯，白肉品种偏脆。",
   "sourceBook": "中华本草",
   "sourceChapter": "马铃薯",
   "grade": "甲",
   "status": "已核",
   "uncertain": "明清以后传入，古本草未收，篇目未核。",
   "cost": "平价",
   "py": "malingshu",
   "trad": "馬鈴薯"
  },
  {
   "id": "ganshu",
   "name": "甘薯",
   "alias": [
    "红薯",
    "番薯",
    "地瓜",
    "山芋",
    "红苕",
    "白薯",
    "番芋"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肾"
   ],
   "effect": [
    "补中益气",
    "健脾",
    "润肠"
   ],
   "use": "传统食养用于脾虚食少、大便干结、口干。",
   "foodUse": "蒸、煮、烤食，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量，以免腹胀。",
    "胃酸偏多者不宜空腹大量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河南、山东、四川、福建",
   "originGeo": "",
   "originNote": "红心品种甜润，白心品种粉质。",
   "sourceBook": "中华本草",
   "sourceChapter": "甘薯",
   "grade": "甲",
   "status": "已核",
   "uncertain": "明清以后传入，古本草未收，篇目未核。",
   "cost": "平价",
   "py": "ganshu",
   "trad": "甘薯"
  },
  {
   "id": "shanyao",
   "name": "山药",
   "alias": [
    "怀山药",
    "淮山",
    "薯蓣",
    "山薯",
    "淮山药"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肺",
    "肾"
   ],
   "effect": [
    "健脾",
    "益气",
    "养肺",
    "固肾"
   ],
   "use": "传统食养用于脾虚食少、倦怠乏力、腰膝酸软。",
   "foodUse": "蒸食、煮粥、煲汤，常用 100 至 200 克。",
   "caution": [
    "湿盛中满者不宜大量单食。",
    "削皮时宜戴手套，以免手痒。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "河南、山东、河北、江西",
   "originGeo": "河南焦作温县、武陟，怀山药传统产区",
   "originNote": "怀山药粉性足，口感绵密。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 山药",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "shanyao",
   "trad": "山藥"
  },
  {
   "id": "yutou",
   "name": "芋头",
   "alias": [
    "芋艿",
    "毛芋",
    "芋子"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "消食",
    "散结"
   ],
   "use": "传统食养用于脾胃虚弱、食少乏力、脘腹胀满。",
   "foodUse": "蒸、煮、炖食，常用 100 至 200 克。",
   "caution": [
    "生芋不可食，须熟透。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广西、福建、江西、浙江",
   "originGeo": "广西荔浦芋",
   "originNote": "荔浦芋个大粉糯，小芋仔滑嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 芋",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "yutou",
   "trad": "芋頭"
  },
  {
   "id": "qingke",
   "name": "青稞",
   "alias": [
    "裸大麦",
    "元麦",
    "米大麦"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少倦怠、乏力。",
   "foodUse": "磨粉做糌粑、煮粥，常用 50 至 100 克。",
   "caution": [
    "麸质过敏者忌食。",
    "一次不宜过量。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "西藏、青海、四川、甘肃",
   "originGeo": "",
   "originNote": "白青稞味淡，黑青稞香气重。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "中等",
   "py": "qingke",
   "trad": "青稞"
  },
  {
   "id": "huangdou",
   "name": "黄豆",
   "alias": [
    "大豆",
    "黄大豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "益气",
    "润燥"
   ],
   "use": "传统食养用于脾虚食少、倦怠乏力、口干。",
   "foodUse": "打豆浆、煮食、发豆芽，常用 20 至 60 克。",
   "caution": [
    "须充分煮熟后食用。",
    "大豆过敏者忌食。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "黑龙江、吉林、辽宁、内蒙古",
   "originGeo": "",
   "originNote": "东北大豆粒圆饱满，豆香浓。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 大豆",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "huangdou",
   "trad": "黃豆"
  },
  {
   "id": "heidou",
   "name": "黑豆",
   "alias": [
    "乌豆",
    "黑大豆",
    "冬豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肾"
   ],
   "effect": [
    "补肾",
    "健脾",
    "祛湿",
    "养血"
   ],
   "use": "传统食养用于脾虚食少、腰膝酸软、须发早白。",
   "foodUse": "打豆浆、煮粥、醋泡，常用 20 至 60 克。",
   "caution": [
    "须充分煮熟后食用。",
    "大豆过敏者忌食。",
    "一次不宜过量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "黑龙江、吉林、辽宁、河北",
   "originGeo": "",
   "originNote": "绿心黑豆口感较糯，黄心黑豆偏硬。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "谷食类 黑大豆",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "heidou",
   "trad": "黑豆"
  },
  {
   "id": "lvdou",
   "name": "绿豆",
   "alias": [
    "青小豆",
    "植豆",
    "吉豆"
   ],
   "cat": "豆类",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "胃",
    "肝"
   ],
   "effect": [
    "清热",
    "解暑",
    "利水"
   ],
   "use": "传统食养用于暑热烦渴、口干、小便短赤。",
   "foodUse": "煮汤、煮粥、发豆芽，常用 30 至 80 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、吉林、安徽、河南",
   "originGeo": "",
   "originNote": "明绿豆色亮粒小，毛绿豆皮厚。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 绿豆",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "lvdou",
   "trad": "綠豆"
  },
  {
   "id": "chixiaodou",
   "name": "赤小豆",
   "alias": [
    "红豆",
    "赤豆",
    "红小豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "心",
    "小肠"
   ],
   "effect": [
    "利水",
    "祛湿",
    "健脾",
    "消肿"
   ],
   "use": "传统食养用于水湿内停、肢体困重、小便不利。",
   "foodUse": "煮汤、煮粥，常用 30 至 80 克。",
   "caution": [
    "津液不足者不宜久食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "广东、广西、湖南、江西",
   "originGeo": "",
   "originNote": "粒小而长，煮后沙糯。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 赤小豆",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "chixiaodou",
   "trad": "赤小豆"
  },
  {
   "id": "baibiandou",
   "name": "白扁豆",
   "alias": [
    "扁豆",
    "蛾眉豆",
    "眉豆"
   ],
   "cat": "豆类",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "和中"
   ],
   "use": "传统食养用于脾虚湿重、食少便溏、肢体困重。",
   "foodUse": "煮粥、煲汤，常用 20 至 60 克。",
   "caution": [
    "须煮熟透，生食不宜。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖南",
   "originGeo": "",
   "originNote": "粒大色白者易煮。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 白扁豆",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "baibiandou",
   "trad": "白扁豆"
  },
  {
   "id": "daodou",
   "name": "刀豆",
   "alias": [
    "挟剑豆",
    "大刀豆",
    "关刀豆"
   ],
   "cat": "豆类",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "温中",
    "理气",
    "益肾"
   ],
   "use": "传统食养用于脾胃虚寒、脘腹胀满、食少。",
   "foodUse": "炒食、煮食，常用 30 至 100 克。",
   "caution": [
    "须煮熟透后食用。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "广东、广西、海南、福建",
   "originGeo": "",
   "originNote": "荚厚者肉质紧实。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 刀豆",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "daodou",
   "trad": "刀豆"
  },
  {
   "id": "wandou",
   "name": "豌豆",
   "alias": [
    "青豆",
    "寒豆",
    "雪豆",
    "荷兰豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "理气",
    "利水"
   ],
   "use": "传统食养用于脾胃不和、脘腹胀满、小便不利。",
   "foodUse": "煮食、炒食、磨粉，常用 30 至 100 克。",
   "caution": [
    "一次不宜过量，以免腹胀。",
    "须煮熟后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "四川、云南、甘肃、湖北",
   "originGeo": "",
   "originNote": "圆粒豌豆粉糯，皱粒豌豆清甜。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 米谷 豌豆",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "wandou",
   "trad": "豌豆"
  },
  {
   "id": "candou",
   "name": "蚕豆",
   "alias": [
    "胡豆",
    "佛豆",
    "罗汉豆",
    "兰花豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "祛湿"
   ],
   "use": "传统食养用于脾虚食少、肢体困重、倦怠。",
   "foodUse": "煮食、炒食，常用 30 至 80 克。",
   "caution": [
    "须煮熟后食用。",
    "葡萄糖-6-磷酸脱氢酶缺乏者不宜食用。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、四川、江苏、浙江",
   "originGeo": "",
   "originNote": "大粒蚕豆粉糯，小粒蚕豆香脆。",
   "sourceBook": "中华本草",
   "sourceChapter": "蚕豆",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "平价",
   "py": "candou",
   "trad": "蠶豆"
  },
  {
   "id": "jiangdou",
   "name": "豇豆",
   "alias": [
    "角豆",
    "长豆",
    "饭豆",
    "裙带豆",
    "长豆角"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "理气",
    "祛湿"
   ],
   "use": "传统食养用于脾虚食少、脘腹胀满、倦怠。",
   "foodUse": "煮粥、炖食，常用 30 至 80 克。",
   "caution": [
    "须煮熟透后食用。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河南、湖北、湖南、广西",
   "originGeo": "",
   "originNote": "粒长色深者煮后绵软。",
   "sourceBook": "中华本草",
   "sourceChapter": "豇豆",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "平价",
   "py": "jiangdou",
   "trad": "豇豆"
  },
  {
   "id": "yingzuidou",
   "name": "鹰嘴豆",
   "alias": [
    "桃尔豆",
    "鸡豆",
    "回回豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气"
   ],
   "use": "传统食养用于脾虚食少、倦怠乏力、大便干结。",
   "foodUse": "煮食、打泥、烤制，常用 30 至 80 克。",
   "caution": [
    "宜提前浸泡并充分煮熟。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "新疆、甘肃、内蒙古、云南",
   "originGeo": "",
   "originNote": "粒大饱满者粉糯。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "中等",
   "py": "yingzuidou",
   "trad": "鷹嘴豆"
  },
  {
   "id": "yundou",
   "name": "芸豆",
   "alias": [
    "四季豆",
    "菜豆",
    "架豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "祛湿"
   ],
   "use": "传统食养用于脾虚食少、肢体困重、倦怠。",
   "foodUse": "煮粥、炖食，常用 30 至 80 克。",
   "caution": [
    "必须充分煮熟，生芸豆不宜食用。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "黑龙江、内蒙古、云南、贵州",
   "originGeo": "",
   "originNote": "白芸豆粉糯，红芸豆皮厚。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "平价",
   "py": "yundou",
   "trad": "芸豆"
  },
  {
   "id": "doufu",
   "name": "豆腐",
   "alias": [
    "水豆腐",
    "白豆腐"
   ],
   "cat": "豆类",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "益气",
    "和中",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干烦渴、食少、大便干结。",
   "foodUse": "煮汤、炒食、凉拌，常用 100 至 200 克。",
   "caution": [
    "大豆过敏者忌食。",
    "一次不宜过量。",
    "高尿酸人群控制总量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "各地均有生产",
   "originGeo": "",
   "originNote": "南豆腐嫩滑，北豆腐紧实。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "谷食类",
   "grade": "乙",
   "status": "已核",
   "uncertain": "随息居饮食谱谷食类有豆腐，篇目待核。",
   "cost": "平价",
   "py": "doufu",
   "trad": "豆腐"
  },
  {
   "id": "baicai",
   "name": "大白菜",
   "alias": [
    "白菜",
    "菘菜",
    "黄芽菜",
    "结球白菜",
    "黄芽白"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "生津",
    "润肠"
   ],
   "use": "传统食养用于口干烦渴、大便干结、小便不利。",
   "foodUse": "炒食、煮汤、腌渍，常用 100 至 300 克。",
   "caution": [
    "脾胃虚寒者不宜大量生食。",
    "腌制白菜含盐高，宜少食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、河南、辽宁",
   "originGeo": "",
   "originNote": "黄心白菜甜嫩，青帮白菜耐煮。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 菘菜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "dabaicai",
   "trad": "大白菜"
  },
  {
   "id": "luobo",
   "name": "白萝卜",
   "alias": [
    "萝卜",
    "莱菔",
    "菜头"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺",
    "大肠"
   ],
   "effect": [
    "消食",
    "理气",
    "化痰",
    "生津"
   ],
   "use": "传统食养用于饮食过量、脘腹胀满、痰多、口干。",
   "foodUse": "生食、炒食、煮汤，常用 100 至 300 克。",
   "caution": [
    "脾胃虚寒者不宜多食生萝卜。",
    "传统认为服补气类药材期间少食生萝卜。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、河南、湖北",
   "originGeo": "",
   "originNote": "青头萝卜辣味轻，白皮萝卜水分足。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 莱菔",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "bailuobo",
   "trad": "白蘿蔔"
  },
  {
   "id": "huhuobo",
   "name": "胡萝卜",
   "alias": [
    "红萝卜",
    "金笋",
    "甘荀"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肝",
    "肺"
   ],
   "effect": [
    "健脾",
    "消食",
    "养肝",
    "明目"
   ],
   "use": "传统食养用于脾虚食少、视物昏花、皮肤干燥。",
   "foodUse": "炒食、煮汤、榨汁，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "生食吸收较差，宜熟食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、河北、内蒙古",
   "originGeo": "",
   "originNote": "橙红色深者味甜，芯小者质地细。",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷第三 菜品 胡萝卜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "huluobo",
   "trad": "胡蘿蔔"
  },
  {
   "id": "bocai",
   "name": "菠菜",
   "alias": [
    "菠薐菜",
    "赤根菜",
    "鹦鹉菜",
    "红根菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "胃",
    "大肠",
    "小肠"
   ],
   "effect": [
    "养血",
    "润燥",
    "清热"
   ],
   "use": "传统食养用于口干、大便干结、面色少华。",
   "foodUse": "焯水后炒食、煮汤，常用 100 至 200 克。",
   "caution": [
    "含草酸，宜焯水后食用。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、河南、江苏",
   "originGeo": "",
   "originNote": "圆叶菠菜涩味轻，尖叶菠菜味浓。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 菠薐",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "bocai",
   "trad": "菠菜"
  },
  {
   "id": "qincai",
   "name": "芹菜",
   "alias": [
    "旱芹",
    "药芹",
    "本芹",
    "香芹",
    "西芹"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "肝",
    "胃",
    "肺"
   ],
   "effect": [
    "清热",
    "平肝",
    "祛湿"
   ],
   "use": "传统食养用于面红目赤、口干、小便短赤。",
   "foodUse": "炒食、凉拌、榨汁，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、河南、江苏",
   "originGeo": "",
   "originNote": "本芹香浓纤维多，西芹脆嫩水分足。",
   "sourceBook": "中华本草",
   "sourceChapter": "芹菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "食疗本草有水芹记载，旱芹篇目待核。",
   "cost": "平价",
   "py": "qincai",
   "trad": "芹菜"
  },
  {
   "id": "jiucai",
   "name": "韭菜",
   "alias": [
    "起阳草",
    "懒人菜",
    "长生韭",
    "扁菜"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肝",
    "胃",
    "肾"
   ],
   "effect": [
    "温阳",
    "理气",
    "散瘀"
   ],
   "use": "传统食养用于脘腹冷痛、食欲不振、腰膝酸软。",
   "foodUse": "炒食、做馅，常用 50 至 150 克。",
   "caution": [
    "阴虚火旺者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河北、山东、河南、广东",
   "originGeo": "",
   "originNote": "窄叶韭菜香浓，宽叶韭菜柔嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 韭",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "jiucai",
   "trad": "韭菜"
  },
  {
   "id": "cong",
   "name": "葱",
   "alias": [
    "大葱",
    "青葱",
    "火葱",
    "葱白",
    "香葱",
    "小葱"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "温中",
    "理气",
    "散寒"
   ],
   "use": "传统食养用于脘腹冷痛、食欲不振。",
   "foodUse": "调味、生食、炒食，常用 10 至 30 克。",
   "caution": [
    "表虚多汗者不宜多食。",
    "一次不宜过量。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、河南、辽宁",
   "originGeo": "山东章丘大葱",
   "originNote": "章丘大葱葱白长，辛香浓。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 葱",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "cong",
   "trad": "蔥"
  },
  {
   "id": "shengjiang",
   "name": "生姜",
   "alias": [
    "姜",
    "鲜姜",
    "老姜",
    "姜根"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "散寒",
    "理气"
   ],
   "use": "传统食养用于脘腹冷痛、食欲不振、痰多。",
   "foodUse": "调味、煮汤、泡水，常用 5 至 15 克。",
   "caution": [
    "阴虚内热者不宜多食。",
    "烂姜不可食。",
    "一次不宜过量。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "山东、四川、贵州、云南",
   "originGeo": "山东莱芜、四川犍为",
   "originNote": "莱芜姜块大味浓，犍为姜香辣突出。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 生姜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "shengjiang",
   "trad": "生薑"
  },
  {
   "id": "dasuan",
   "name": "大蒜",
   "alias": [
    "蒜",
    "蒜头",
    "胡蒜",
    "独头蒜"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "温中",
    "消食",
    "理气"
   ],
   "use": "传统食养用于饮食过量、脘腹胀满、食欲不振。",
   "foodUse": "调味、生食、炒食，常用 5 至 15 克。",
   "caution": [
    "空腹不宜多食。",
    "阴虚火旺者不宜多食。",
    "内热偏盛者不宜多食，空腹不宜生食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、云南",
   "originGeo": "山东金乡大蒜",
   "originNote": "金乡蒜瓣大辛辣，紫皮蒜香浓。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 蒜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "dasuan",
   "trad": "大蒜"
  },
  {
   "id": "yangcong",
   "name": "洋葱",
   "alias": [
    "圆葱",
    "球葱",
    "玉葱",
    "葱头",
    "皮牙子",
    "洋葱头"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "理气",
    "温中",
    "消食"
   ],
   "use": "传统食养用于食欲不振、脘腹胀满、倦怠。",
   "foodUse": "炒食、凉拌、煮汤，常用 50 至 150 克。",
   "caution": [
    "一次不宜过量。",
    "切时气味刺激眼睛，可先冷藏。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "甘肃、内蒙古、云南、山东",
   "originGeo": "",
   "originNote": "紫皮洋葱辛辣，黄皮洋葱偏甜。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅见中华本草书名，条目归属与篇目未核。",
   "cost": "平价",
   "py": "yangcong",
   "trad": "洋蔥"
  },
  {
   "id": "qiezi",
   "name": "茄子",
   "alias": [
    "落苏",
    "矮瓜",
    "昆仑瓜",
    "紫茄",
    "茄瓜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "消肿"
   ],
   "use": "传统食养用于口干、大便干结、小便不利。",
   "foodUse": "炒食、蒸食、烤食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "宜选嫩茄，老熟者口感差。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、河北、辽宁",
   "originGeo": "",
   "originNote": "长茄皮薄肉嫩，圆茄肉质紧实。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 茄子",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "qiezi",
   "trad": "茄子"
  },
  {
   "id": "fanqie",
   "name": "番茄",
   "alias": [
    "西红柿",
    "洋柿子",
    "火柿子"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "胃",
    "肝"
   ],
   "effect": [
    "生津",
    "清热",
    "健胃",
    "消食"
   ],
   "use": "传统食养用于口干烦渴、食欲不振、大便干结。",
   "foodUse": "生食、炒食、煮汤，常用 100 至 200 克。",
   "caution": [
    "未成熟青番茄不宜食。",
    "胃酸偏多者不宜空腹大量生食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、新疆、河北、辽宁",
   "originGeo": "",
   "originNote": "沙瓤番茄汁多味甜，硬粉番茄耐运。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "明清以后传入，古本草未收，篇目未核。",
   "cost": "平价",
   "py": "fanqie",
   "trad": "番茄"
  },
  {
   "id": "huanggua",
   "name": "黄瓜",
   "alias": [
    "胡瓜",
    "青瓜",
    "刺瓜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "利水"
   ],
   "use": "传统食养用于口干烦渴、小便不利、暑热。",
   "foodUse": "生食、凉拌、炒食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生黄瓜。",
    "腌制黄瓜含盐高，宜少食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、辽宁、河南",
   "originGeo": "",
   "originNote": "刺黄瓜脆嫩，水果黄瓜皮薄。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 胡瓜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "huanggua",
   "trad": "黃瓜"
  },
  {
   "id": "donggua",
   "name": "冬瓜",
   "alias": [
    "白瓜",
    "枕瓜",
    "水芝",
    "东瓜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "淡"
   ],
   "meridians": [
    "肺",
    "大肠",
    "小肠",
    "膀胱"
   ],
   "effect": [
    "清热",
    "利水",
    "生津",
    "祛湿"
   ],
   "use": "传统食养用于暑热烦渴、小便不利、肢体困重。",
   "foodUse": "煮汤、炒食、蒸食，常用 100 至 300 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、湖南、湖北",
   "originGeo": "",
   "originNote": "黑皮冬瓜肉厚，白皮冬瓜质嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 冬瓜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "donggua",
   "trad": "冬瓜"
  },
  {
   "id": "nangua",
   "name": "南瓜",
   "alias": [
    "倭瓜",
    "番瓜",
    "金瓜",
    "饭瓜"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "补中益气",
    "健脾",
    "温中"
   ],
   "use": "传统食养用于脾虚食少、倦怠乏力、大便稀溏。",
   "foodUse": "蒸食、煮粥、煮汤，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量，以免腹胀。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "湖南、湖北、江西、山东",
   "originGeo": "",
   "originNote": "老南瓜粉甜，嫩南瓜脆嫩。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类",
   "grade": "乙",
   "status": "已核",
   "uncertain": "随息居饮食谱蔬食类有南瓜，篇目待核。",
   "cost": "平价",
   "py": "nangua",
   "trad": "南瓜"
  },
  {
   "id": "sigua",
   "name": "丝瓜",
   "alias": [
    "水瓜",
    "天罗",
    "布瓜",
    "蛮瓜",
    "胜瓜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "肝",
    "胃"
   ],
   "effect": [
    "清热",
    "化痰",
    "通络"
   ],
   "use": "传统食养用于口干、痰多、小便不利。",
   "foodUse": "炒食、煮汤，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "老丝瓜纤维粗，宜选嫩瓜。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、湖南、江西",
   "originGeo": "",
   "originNote": "棱丝瓜纤维少，肉丝瓜水分足。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类",
   "grade": "乙",
   "status": "已核",
   "uncertain": "随息居饮食谱蔬食类有丝瓜，篇目待核。",
   "cost": "平价",
   "py": "sigua",
   "trad": "絲瓜"
  },
  {
   "id": "kugua",
   "name": "苦瓜",
   "alias": [
    "凉瓜",
    "癞葡萄",
    "锦荔枝"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "苦"
   ],
   "meridians": [
    "心",
    "脾",
    "肺"
   ],
   "effect": [
    "清热",
    "解暑",
    "明目"
   ],
   "use": "传统食养用于暑热烦渴、口干、食欲不振。",
   "foodUse": "炒食、凉拌、煮汤，常用 50 至 150 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、海南、湖南",
   "originGeo": "",
   "originNote": "大顶苦瓜苦味轻，长身苦瓜味浓。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类 苦瓜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "kugua",
   "trad": "苦瓜"
  },
  {
   "id": "wosun",
   "name": "莴笋",
   "alias": [
    "莴苣",
    "青笋",
    "莴菜",
    "千金菜",
    "莴苣笋"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "利水",
    "理气"
   ],
   "use": "传统食养用于小便不利、食欲不振、口干。",
   "foodUse": "炒食、凉拌，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、江苏、四川",
   "originGeo": "",
   "originNote": "茎粗皮薄者脆嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 莴苣",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "wosun",
   "trad": "萵筍"
  },
  {
   "id": "xiancai",
   "name": "苋菜",
   "alias": [
    "红苋菜",
    "青香苋",
    "人旱菜",
    "雁来红",
    "米苋",
    "汉菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "大肠",
    "小肠"
   ],
   "effect": [
    "清热",
    "利湿",
    "润肠"
   ],
   "use": "传统食养用于口干、大便干结、小便短赤。",
   "foodUse": "焯水后炒食、煮汤，常用 100 至 200 克。",
   "caution": [
    "含草酸，宜焯水后食用。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、湖北、湖南",
   "originGeo": "",
   "originNote": "红苋菜色艳味甜，青苋菜口感嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 苋",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiancai",
   "trad": "莧菜"
  },
  {
   "id": "jicai",
   "name": "荠菜",
   "alias": [
    "护生草",
    "地菜",
    "枕头草",
    "菱角菜",
    "荠荠菜",
    "地米菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "淡"
   ],
   "meridians": [
    "肝",
    "脾",
    "膀胱"
   ],
   "effect": [
    "清热",
    "利水",
    "明目"
   ],
   "use": "传统食养用于口干、小便不利、目赤。",
   "foodUse": "做馅、煮汤、炒食，常用 50 至 150 克。",
   "caution": [
    "一次不宜过量。",
    "采食野生者须辨认清楚。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "",
   "originNote": "野生荠菜香气浓，栽培荠菜叶嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 荠",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "jicai",
   "trad": "薺菜"
  },
  {
   "id": "machixian",
   "name": "马齿苋",
   "alias": [
    "长命菜",
    "安乐菜",
    "马齿菜",
    "瓜子菜",
    "五行草",
    "长寿菜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "酸"
   ],
   "meridians": [
    "肝",
    "大肠"
   ],
   "effect": [
    "清热",
    "祛湿"
   ],
   "use": "传统食养用于暑热、口干、大便不畅。",
   "foodUse": "焯水后凉拌、炒食，常用 30 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "孕期慎用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "河南、河北、山东、江苏",
   "originGeo": "",
   "originNote": "茎叶肥厚者酸味重。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 马齿苋",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "machixian",
   "trad": "馬齒莧"
  },
  {
   "id": "kongxincai",
   "name": "空心菜",
   "alias": [
    "蕹菜",
    "通菜",
    "竹叶菜",
    "藤藤菜",
    "通心菜",
    "空筒菜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "大肠",
    "胃"
   ],
   "effect": [
    "清热",
    "利水",
    "润肠"
   ],
   "use": "传统食养用于口干、大便干结、小便短赤。",
   "foodUse": "炒食、煮汤，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、湖南、福建",
   "originGeo": "",
   "originNote": "水蕹茎粗脆嫩，旱蕹叶多味浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "蕹菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "食疗本草有蕹菜记载，篇目待核。",
   "cost": "平价",
   "py": "kongxincai",
   "trad": "空心菜"
  },
  {
   "id": "zhusun",
   "name": "竹笋",
   "alias": [
    "笋",
    "毛笋",
    "春笋",
    "冬笋",
    "笋子"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "化痰",
    "消食",
    "润肠"
   ],
   "use": "传统食养用于饮食过量、脘腹胀满、痰多、大便不畅。",
   "foodUse": "焯水后炒食、煮汤，常用 50 至 150 克。",
   "caution": [
    "含草酸，宜焯水后食用。",
    "脾胃虚弱者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、福建、江西、湖南",
   "originGeo": "",
   "originNote": "春笋鲜嫩，冬笋紧实。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 竹笋",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "zhusun",
   "trad": "竹筍"
  },
  {
   "id": "jiaobai",
   "name": "茭白",
   "alias": [
    "菰笋",
    "茭笋",
    "高笋",
    "菰菜",
    "茭瓜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肝"
   ],
   "effect": [
    "清热",
    "利水",
    "生津"
   ],
   "use": "传统食养用于口干、小便不利、食欲不振。",
   "foodUse": "炒食、煮汤，常用 50 至 150 克。",
   "caution": [
    "含草酸，宜焯水后食用。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、江苏、安徽、江西",
   "originGeo": "",
   "originNote": "肉质洁白者嫩。",
   "sourceBook": "中华本草",
   "sourceChapter": "茭白",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "jiaobai",
   "trad": "茭白"
  },
  {
   "id": "lianou",
   "name": "莲藕",
   "alias": [
    "藕",
    "莲菜",
    "玉节"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于口干烦渴、食少、大便干结。",
   "foodUse": "生食、凉拌、煮汤，常用 100 至 200 克。",
   "caution": [
    "生藕性寒，脾胃虚寒者不宜生食。",
    "熟藕性温，可适量常食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "湖北、湖南、江苏、浙江",
   "originGeo": "湖北洪湖莲藕",
   "originNote": "七孔藕粉糯，九孔藕脆嫩。",
   "sourceBook": "食疗本草",
   "sourceChapter": "卷上 菜类 藕",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "lianou",
   "trad": "蓮藕"
  },
  {
   "id": "baihe",
   "name": "百合",
   "alias": [
    "百合蒜",
    "蒜脑薯",
    "强瞿",
    "中庭"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺"
   ],
   "effect": [
    "润肺",
    "安神",
    "清热",
    "生津"
   ],
   "use": "传统食养用于口干咽燥、心烦不眠、痰少。",
   "foodUse": "煮粥、蒸食、炒食，常用 30 至 60 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "甘肃、湖南、江西、江苏",
   "originGeo": "甘肃兰州百合",
   "originNote": "兰州百合瓣大味甜，湖南龙山百合偏苦。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 百合",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "baihe",
   "trad": "百合"
  },
  {
   "id": "xiebai",
   "name": "薤白",
   "alias": [
    "藠头",
    "薤",
    "野蒜",
    "小蒜",
    "荞头"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛",
    "苦"
   ],
   "meridians": [
    "心",
    "肺",
    "胃",
    "大肠"
   ],
   "effect": [
    "理气",
    "温中",
    "通阳"
   ],
   "use": "传统食养用于脘腹冷痛、胸闷、食欲不振。",
   "foodUse": "炒食、腌渍，常用 30 至 60 克。",
   "caution": [
    "阴虚发热者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "江西、湖南、湖北、四川",
   "originGeo": "",
   "originNote": "鳞茎洁白者脆嫩。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 薤白",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "xiebai",
   "trad": "薤白"
  },
  {
   "id": "yuxingcao",
   "name": "鱼腥草",
   "alias": [
    "折耳根",
    "猪鼻孔",
    "臭菜",
    "侧耳根",
    "狗贴耳"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺"
   ],
   "effect": [
    "清热",
    "祛湿"
   ],
   "use": "传统食养用于口干、小便短赤、暑热。",
   "foodUse": "鲜品凉拌、煮水，常用 30 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "鲜品气味特殊，宜少量凉拌。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "四川、云南、贵州、湖北",
   "originGeo": "",
   "originNote": "嫩茎气味浓，老茎纤维粗。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 鱼腥草",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "yuxingcao",
   "trad": "魚腥草"
  },
  {
   "id": "pugongying",
   "name": "蒲公英",
   "alias": [
    "婆婆丁",
    "黄花地丁",
    "蒲公英菜",
    "奶汁草",
    "黄花苗"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "肝",
    "胃"
   ],
   "effect": [
    "清热",
    "利湿"
   ],
   "use": "传统食养用于口干、目赤、小便短赤。",
   "foodUse": "鲜嫩叶焯水凉拌，常用 30 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "河北、河南、山东、江苏",
   "originGeo": "",
   "originNote": "嫩叶苦味轻，老叶味浓。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 蒲公英",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "pugongying",
   "trad": "蒲公英"
  },
  {
   "id": "juju",
   "name": "菊苣",
   "alias": [
    "苦苣",
    "咖啡草",
    "洋苦菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "苦",
    "咸"
   ],
   "meridians": [
    "肝",
    "胆",
    "胃"
   ],
   "effect": [
    "清热",
    "消食",
    "利水"
   ],
   "use": "传统食养用于食欲不振、脘腹胀满、小便不利。",
   "foodUse": "凉拌、炒食，常用 50 至 150 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "河北、山东、云南、江苏",
   "originGeo": "",
   "originNote": "叶球脆嫩，苦味清爽。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 菊苣",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "juju",
   "trad": "菊苣"
  },
  {
   "id": "pingguo",
   "name": "苹果",
   "alias": [
    "频婆果",
    "平安果"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "肺"
   ],
   "effect": [
    "生津",
    "润肺",
    "健脾"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生冷。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、陕西、河南、河北。",
   "originGeo": "烟台苹果",
   "originNote": "不同产地苹果酸甜与脆度有别。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 苹果",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "pingguo",
   "trad": "蘋果"
  },
  {
   "id": "li",
   "name": "梨",
   "alias": [
    "快果",
    "玉乳",
    "蜜父",
    "梨子"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "润肺",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干咽干、秋燥不适。",
   "foodUse": "鲜食或蒸食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生梨。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河北、山东、辽宁、安徽。",
   "originGeo": "砀山酥梨",
   "originNote": "梨肉脆嫩多汁，蒸熟后转软。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 梨",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "li",
   "trad": "梨"
  },
  {
   "id": "tao",
   "name": "桃",
   "alias": [
    "毛桃",
    "桃子"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "生津",
    "润肠",
    "养血"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "多食易助热，内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、河北、河南、江苏。",
   "originGeo": "阳山水蜜桃",
   "originNote": "果肉软嫩多汁，熟透后香气更浓。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 桃",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "tao",
   "trad": "桃"
  },
  {
   "id": "xing",
   "name": "杏",
   "alias": [
    "杏子",
    "甜梅"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "润肺",
    "生津",
    "润肠"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "鲜食，常用 50 至 100 克。",
   "caution": [
    "不宜多食，内热偏盛者慎食。",
    "杏仁须经炮制后使用，不宜生食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河北、山东、山西、陕西。",
   "originGeo": "",
   "originNote": "果肉酸甜，软而多汁。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 杏",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xing",
   "trad": "杏"
  },
  {
   "id": "lizi",
   "name": "李",
   "alias": [
    "李子",
    "嘉庆子"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肝",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "消食"
   ],
   "use": "传统食养用于口干、食少腹胀。",
   "foodUse": "鲜食，常用 50 至 100 克。",
   "caution": [
    "脾胃虚弱者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、福建、浙江、四川。",
   "originGeo": "",
   "originNote": "果肉或脆或软，酸甜依品种而异。",
   "sourceBook": "中华本草",
   "sourceChapter": "蔷薇科 李",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "li",
   "trad": "李"
  },
  {
   "id": "wumei",
   "name": "乌梅",
   "alias": [
    "梅实",
    "酸梅"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "酸",
    "涩"
   ],
   "meridians": [
    "肝",
    "脾",
    "肺",
    "大肠"
   ],
   "effect": [
    "生津",
    "消食"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "煮水或制酱，常用 6 至 12 克。",
   "caution": [
    "胃酸过多者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区福建、浙江、四川、云南。",
   "originGeo": "",
   "originNote": "酸味浓，煮水后酸香转柔。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 乌梅",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "wumei",
   "trad": "烏梅"
  },
  {
   "id": "dazao",
   "name": "大枣",
   "alias": [
    "红枣",
    "干枣",
    "枣子"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "心"
   ],
   "effect": [
    "益气",
    "养血",
    "安神",
    "健脾"
   ],
   "use": "传统食养用于体倦乏力、食少、睡眠不安。",
   "foodUse": "煮粥或泡水，常用 6 至 15 克。",
   "caution": [
    "湿盛腹胀者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区新疆、河北、山东、山西。",
   "originGeo": "若羌红枣",
   "originNote": "干枣肉厚味甜，鲜枣脆而多汁。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 大枣",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "dazao",
   "trad": "大棗"
  },
  {
   "id": "shanzha",
   "name": "山楂",
   "alias": [
    "山里红",
    "红果",
    "山楂果"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "酸",
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肝"
   ],
   "effect": [
    "消食",
    "理气",
    "健脾"
   ],
   "use": "传统食养用于食少腹胀、肉食不化。",
   "foodUse": "煮水或制糕，常用 6 至 12 克。",
   "caution": [
    "空腹不宜多食，胃酸过多者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区山东、河北、河南、辽宁。",
   "originGeo": "",
   "originNote": "果肉酸中带甜，煮后酸味转柔。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 山楂",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "shanzha",
   "trad": "山楂"
  },
  {
   "id": "putao",
   "name": "葡萄",
   "alias": [
    "蒲桃",
    "草龙珠",
    "提子"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "脾",
    "肾"
   ],
   "effect": [
    "益气",
    "养血",
    "生津"
   ],
   "use": "传统食养用于口干、体倦。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "含糖较多，不宜过量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、河北、山东、云南。",
   "originGeo": "吐鲁番葡萄",
   "originNote": "果肉多汁，甜度依品种差别较大。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 葡萄",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "putao",
   "trad": "葡萄"
  },
  {
   "id": "shizi",
   "name": "柿子",
   "alias": [
    "柿",
    "朱果"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "涩"
   ],
   "meridians": [
    "肺",
    "胃",
    "大肠"
   ],
   "effect": [
    "润肺",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "空腹不宜多食，脾胃虚寒者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区陕西、山西、河北、广西。",
   "originGeo": "富平柿饼",
   "originNote": "熟柿软糯多汁，涩味随成熟而减。",
   "sourceBook": "中华本草",
   "sourceChapter": "柿科 柿",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "shizi",
   "trad": "柿子"
  },
  {
   "id": "shiliu",
   "name": "石榴",
   "alias": [
    "安石榴",
    "丹若"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘",
    "酸",
    "涩"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "生津",
    "健脾",
    "益气"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "鲜食或榨汁，常用 100 至 150 克。",
   "caution": [
    "多食易伤齿，不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区陕西、河南、山东、云南。",
   "originGeo": "临潼石榴",
   "originNote": "籽粒汁多，酸甜依品种而异。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 石榴",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "shiliu",
   "trad": "石榴"
  },
  {
   "id": "yingtao",
   "name": "樱桃",
   "alias": [
    "含桃",
    "朱樱"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于体倦、面色少华。",
   "foodUse": "鲜食，常用 50 至 100 克。",
   "caution": [
    "多食易助热，内热者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、辽宁、陕西、四川。",
   "originGeo": "烟台大樱桃",
   "originNote": "果肉细软多汁，甜中带微酸。",
   "sourceBook": "中华本草",
   "sourceChapter": "蔷薇科 樱桃",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yingtao",
   "trad": "櫻桃"
  },
  {
   "id": "ju",
   "name": "橘",
   "alias": [
    "橘子",
    "蜜橘",
    "桔子",
    "桔"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "理气",
    "润肺"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "多食易生痰热，不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区湖南、湖北、浙江、四川。",
   "originGeo": "南丰蜜橘",
   "originNote": "果肉多汁，酸甜依成熟度而异。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 橘",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "ju",
   "trad": "橘"
  },
  {
   "id": "cheng",
   "name": "橙",
   "alias": [
    "甜橙",
    "黄果",
    "橙子"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "理气"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "鲜食或榨汁，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生冷。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区江西、湖南、四川、重庆。",
   "originGeo": "赣南脐橙",
   "originNote": "果肉脆嫩多汁，香气清甜。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 橙",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "cheng",
   "trad": "橙"
  },
  {
   "id": "you",
   "name": "柚",
   "alias": [
    "柚子",
    "文旦"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "消食"
   ],
   "use": "传统食养用于口干、食少腹胀。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、广西、广东、浙江。",
   "originGeo": "琯溪蜜柚",
   "originNote": "果肉汁多，甜中带微酸或微苦。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 柚",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "you",
   "trad": "柚"
  },
  {
   "id": "pipa",
   "name": "枇杷",
   "alias": [
    "芦橘",
    "金丸",
    "枇杷果"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "润肺",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干、咽部不适。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、浙江、江苏、四川。",
   "originGeo": "塘栖枇杷",
   "originNote": "果肉柔软多汁，甜酸适口。",
   "sourceBook": "中华本草",
   "sourceChapter": "蔷薇科 枇杷",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "pipa",
   "trad": "枇杷"
  },
  {
   "id": "yangmei",
   "name": "杨梅",
   "alias": [
    "龙睛",
    "珠红"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "消食",
    "健脾"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "鲜食或盐渍，常用 50 至 100 克。",
   "caution": [
    "多食易伤齿，不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区浙江、福建、江苏、云南。",
   "originGeo": "仙居杨梅",
   "originNote": "果肉汁多，酸甜浓郁。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 杨梅",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yangmei",
   "trad": "楊梅"
  },
  {
   "id": "lizhi",
   "name": "荔枝",
   "alias": [
    "离枝",
    "丹荔"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "肝"
   ],
   "effect": [
    "养血",
    "益气",
    "生津"
   ],
   "use": "传统食养用于体倦、面色少华。",
   "foodUse": "鲜食，常用 50 至 100 克。",
   "caution": [
    "不宜空腹多食，多食易助热。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、广西、福建、海南。",
   "originGeo": "增城荔枝",
   "originNote": "果肉晶莹多汁，甜香浓郁。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 荔枝",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "lizhi",
   "trad": "荔枝"
  },
  {
   "id": "longyan",
   "name": "龙眼",
   "alias": [
    "桂圆",
    "龙目",
    "圆眼",
    "元肉"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "脾"
   ],
   "effect": [
    "养血",
    "安神",
    "益气",
    "健脾"
   ],
   "use": "传统食养用于睡眠不安、体倦乏力。",
   "foodUse": "干品煮汤或泡水，常用 9 至 15 克。",
   "caution": [
    "湿盛腹胀者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区广东、广西、福建、海南。",
   "originGeo": "",
   "originNote": "果肉透明多汁，干品甜香更浓。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 龙眼肉",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "longyan",
   "trad": "龍眼"
  },
  {
   "id": "ganzhe",
   "name": "甘蔗",
   "alias": [
    "糖蔗",
    "竿蔗"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "润肺"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "榨汁，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多饮生蔗汁。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广西、云南、广东、海南。",
   "originGeo": "",
   "originNote": "汁多味甜，老蔗纤维较粗。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 甘蔗",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "ganzhe",
   "trad": "甘蔗"
  },
  {
   "id": "xigua",
   "name": "西瓜",
   "alias": [
    "寒瓜",
    "夏瓜"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "胃",
    "膀胱"
   ],
   "effect": [
    "清热",
    "生津",
    "祛湿"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "鲜食，常用 200 至 300 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河南、山东、河北、新疆。",
   "originGeo": "",
   "originNote": "果肉多汁，沙瓤与脆瓤口感不同。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 西瓜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xigua",
   "trad": "西瓜"
  },
  {
   "id": "tiangua",
   "name": "甜瓜",
   "alias": [
    "香瓜",
    "甘瓜",
    "梨瓜"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "祛湿"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、甘肃、山东、河北。",
   "originGeo": "哈密瓜",
   "originNote": "果肉脆或软，香气依品种而异。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 甜瓜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "tiangua",
   "trad": "甜瓜"
  },
  {
   "id": "sangshen",
   "name": "桑椹",
   "alias": [
    "桑葚",
    "桑果",
    "桑枣",
    "桑椹子"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "心",
    "肝",
    "肾"
   ],
   "effect": [
    "养血",
    "生津",
    "润肠"
   ],
   "use": "传统食养用于口干、睡眠不安、排便不畅。",
   "foodUse": "鲜食或干品泡水，常用 9 至 15 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区江苏、浙江、四川、新疆。",
   "originGeo": "",
   "originNote": "鲜果酸甜多汁，干品味浓。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 桑椹",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "sangshen",
   "trad": "桑椹"
  },
  {
   "id": "wuhuaguo",
   "name": "无花果",
   "alias": [
    "映日果",
    "蜜果",
    "文仙果",
    "奶浆果"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "润肠",
    "清热"
   ],
   "use": "传统食养用于食欲不振、排便不畅。",
   "foodUse": "鲜食或干用，常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、山东、江苏、四川。",
   "originGeo": "",
   "originNote": "果肉软糯，甜味浓郁。",
   "sourceBook": "中华本草",
   "sourceChapter": "桑科 无花果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "wuhuaguo",
   "trad": "無花果"
  },
  {
   "id": "zhurou",
   "name": "猪肉",
   "alias": [
    "豕肉"
   ],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "益气",
    "养血",
    "生津"
   ],
   "use": "传统食养用于体倦乏力、面色少华。",
   "foodUse": "炖煮或炒食，常用 50 至 100 克。",
   "caution": [
    "肥肉不宜多食，湿热偏盛者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、河南、山东、湖南。",
   "originGeo": "",
   "originNote": "肉质细嫩，肥瘦比例依部位而异。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 猪肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "zhurou",
   "trad": "豬肉"
  },
  {
   "id": "niurou",
   "name": "牛肉",
   "alias": [
    "黄牛肉"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于体倦乏力、食少。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、河南、山东、新疆。",
   "originGeo": "",
   "originNote": "肉质紧实，炖煮后味厚。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 牛肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "niurou",
   "trad": "牛肉"
  },
  {
   "id": "yangrou",
   "name": "羊肉",
   "alias": [
    "羖肉",
    "羯肉"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "温阳",
    "益气",
    "养血"
   ],
   "use": "传统食养用于畏寒、手足不温、体倦。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、新疆、宁夏、甘肃。",
   "originGeo": "盐池滩羊",
   "originNote": "肉质细嫩，膻味依产地与部位而异。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛科 羊肉",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yangrou",
   "trad": "羊肉"
  },
  {
   "id": "lvrou",
   "name": "驴肉",
   "alias": [
    "毛驴肉"
   ],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "心",
    "肝"
   ],
   "effect": [
    "益气",
    "养血",
    "安神"
   ],
   "use": "传统食养用于体倦乏力、睡眠不安。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河北、山东、河南、陕西。",
   "originGeo": "",
   "originNote": "肉质细密，瘦而不柴。",
   "sourceBook": "中华本草",
   "sourceChapter": "马科 驴肉",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "lvrou",
   "trad": "驢肉"
  },
  {
   "id": "turou",
   "name": "兔肉",
   "alias": [
    "家兔肉",
    "菜兔肉"
   ],
   "cat": "畜肉",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "益气",
    "清热",
    "健脾"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、山东、河南、江苏。",
   "originGeo": "",
   "originNote": "肉质细嫩，脂肪较少。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 兔肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "turou",
   "trad": "兔肉"
  },
  {
   "id": "zhugan",
   "name": "猪肝",
   "alias": [
    "猪肝脏"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘",
    "苦"
   ],
   "meridians": [
    "肝"
   ],
   "effect": [
    "养血",
    "益气"
   ],
   "use": "传统食养用于面色少华、视物易疲。",
   "foodUse": "煮食或炒食，常用 30 至 50 克。",
   "caution": [
    "胆固醇含量较高，不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、河南、山东、湖南。",
   "originGeo": "",
   "originNote": "质地细嫩，久煮易老。",
   "sourceBook": "中华本草",
   "sourceChapter": "猪科 猪肝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "zhugan",
   "trad": "豬肝"
  },
  {
   "id": "zhuti",
   "name": "猪蹄",
   "alias": [
    "猪脚",
    "猪手",
    "猪爪"
   ],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "养血",
    "益气"
   ],
   "use": "传统食养用于皮肤干燥、体倦。",
   "foodUse": "炖煮，常用 100 至 200 克。",
   "caution": [
    "油脂较多，不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、河南、山东、湖南。",
   "originGeo": "",
   "originNote": "胶质丰富，久炖软糯。",
   "sourceBook": "中华本草",
   "sourceChapter": "猪科 猪蹄",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "zhuti",
   "trad": "豬蹄"
  },
  {
   "id": "zhudu",
   "name": "猪肚",
   "alias": [
    "猪胃",
    "猪肚子"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "消食"
   ],
   "use": "传统食养用于食少、体倦。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、河南、山东、湖南。",
   "originGeo": "",
   "originNote": "口感韧脆，久炖转软。",
   "sourceBook": "中华本草",
   "sourceChapter": "猪科 猪肚",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "zhudu",
   "trad": "豬肚"
  },
  {
   "id": "jirou",
   "name": "鸡肉",
   "alias": [
    "家鸡肉"
   ],
   "cat": "禽蛋",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "温阳",
    "健脾"
   ],
   "use": "传统食养用于体倦乏力、畏寒。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、河南、广东、江苏。",
   "originGeo": "清远麻鸡",
   "originNote": "肉质细嫩，炖汤味鲜。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鸡",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "jirou",
   "trad": "雞肉"
  },
  {
   "id": "yarou",
   "name": "鸭肉",
   "alias": [
    "家鸭肉",
    "鹜肉"
   ],
   "cat": "禽蛋",
   "nature": "凉",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肺",
    "胃",
    "肾"
   ],
   "effect": [
    "养血",
    "清热",
    "生津"
   ],
   "use": "传统食养用于口干、体倦。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区江苏、浙江、福建、广东。",
   "originGeo": "",
   "originNote": "肉质紧实，炖汤清鲜。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鸭",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "yarou",
   "trad": "鴨肉"
  },
  {
   "id": "erou",
   "name": "鹅肉",
   "alias": [
    "家鹅肉",
    "舒雁肉"
   ],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肺"
   ],
   "effect": [
    "益气",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于体倦、食少。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "湿热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、江苏、安徽、黑龙江。",
   "originGeo": "",
   "originNote": "肉质较粗，炖煮后味厚。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鹅",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "erou",
   "trad": "鵝肉"
  },
  {
   "id": "gerou",
   "name": "鸽肉",
   "alias": [
    "白鸽肉",
    "家鸽肉",
    "乳鸽"
   ],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "益气",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于体倦、面色少华。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、江苏、山东、河南。",
   "originGeo": "",
   "originNote": "肉质细嫩，炖汤清甜。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鸽",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "gerou",
   "trad": "鴿肉"
  },
  {
   "id": "jidan",
   "name": "鸡蛋",
   "alias": [
    "鸡子",
    "鸡卵"
   ],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "脾",
    "胃"
   ],
   "effect": [
    "养血",
    "益气",
    "安神"
   ],
   "use": "传统食养用于体倦、睡眠不安。",
   "foodUse": "煮食或蒸食，常用 50 至 100 克。",
   "caution": [
    "蛋类过敏者不宜食。"
   ],
   "allergens": [
    "蛋"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区河南、山东、河北、辽宁。",
   "originGeo": "",
   "originNote": "蛋清细嫩，蛋黄绵密。",
   "sourceBook": "中华本草",
   "sourceChapter": "雉科 鸡卵",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "jidan",
   "trad": "雞蛋"
  },
  {
   "id": "yadan",
   "name": "鸭蛋",
   "alias": [
    "鸭卵",
    "青皮蛋"
   ],
   "cat": "禽蛋",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "养血",
    "清热",
    "润肺"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "煮食，常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [
    "蛋"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区江苏、浙江、福建、湖南。",
   "originGeo": "高邮咸鸭蛋",
   "originNote": "蛋黄油润，腌制后咸香。",
   "sourceBook": "中华本草",
   "sourceChapter": "鸭科 鸭卵",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "yadan",
   "trad": "鴨蛋"
  },
  {
   "id": "liyu",
   "name": "鲤鱼",
   "alias": [
    "鲤拐子",
    "红鲤",
    "鲤子"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肾"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "益气"
   ],
   "use": "传统食养用于食少、体倦、小便偏少。",
   "foodUse": "炖煮，常用 100 至 200 克。",
   "caution": [
    "鱼虾过敏者不宜食。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区湖北、湖南、江苏、山东。",
   "originGeo": "",
   "originNote": "肉质细嫩，刺较多。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 鲤鱼",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "liyu",
   "trad": "鯉魚"
  },
  {
   "id": "jiyu",
   "name": "鲫鱼",
   "alias": [
    "鲋鱼",
    "喜头鱼",
    "鲫瓜子",
    "鲫壳鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "益气",
    "祛湿"
   ],
   "use": "传统食养用于食少、体倦、小便偏少。",
   "foodUse": "炖汤，常用 100 至 200 克。",
   "caution": [
    "鱼虾过敏者不宜食。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区湖北、江苏、安徽、山东。",
   "originGeo": "",
   "originNote": "肉质细嫩，炖汤乳白。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 鲫鱼",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "jiyu",
   "trad": "鯽魚"
  },
  {
   "id": "luyu",
   "name": "鲈鱼",
   "alias": [
    "花鲈",
    "寨花",
    "海鲈"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肝"
   ],
   "effect": [
    "益气",
    "健脾",
    "养血"
   ],
   "use": "传统食养用于体倦、食少。",
   "foodUse": "蒸食或炖汤，常用 100 至 200 克。",
   "caution": [
    "鱼虾过敏者不宜食。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区广东、福建、浙江、江苏。",
   "originGeo": "",
   "originNote": "肉质细白，蒸后鲜嫩。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 鲈鱼",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "luyu",
   "trad": "鱸魚"
  },
  {
   "id": "shanyu",
   "name": "鳝鱼",
   "alias": [
    "黄鳝",
    "长鱼"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "脾",
    "肾"
   ],
   "effect": [
    "养血",
    "益气",
    "祛湿"
   ],
   "use": "传统食养用于体倦、畏寒、手足不温。",
   "foodUse": "煮食或炒食，常用 100 至 200 克。",
   "caution": [
    "内热偏盛者不宜多食，须熟透后食用。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区湖北、江苏、安徽、江西。",
   "originGeo": "",
   "originNote": "肉质细滑，宜熟透后食用。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 鳝鱼",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "shanyu",
   "trad": "鱔魚"
  },
  {
   "id": "niqiu",
   "name": "泥鳅",
   "alias": [
    "鳅鱼",
    "河鳅",
    "泥鳅鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "祛湿"
   ],
   "use": "传统食养用于体倦、食少。",
   "foodUse": "炖煮，常用 100 至 200 克。",
   "caution": [
    "鱼虾过敏者不宜食，须熟透后食用。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区江苏、安徽、湖北、湖南。",
   "originGeo": "",
   "originNote": "肉质细嫩，须熟透后食用。",
   "sourceBook": "中华本草",
   "sourceChapter": "鳅科 泥鳅",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "niqiu",
   "trad": "泥鰍"
  },
  {
   "id": "daiyu",
   "name": "带鱼",
   "alias": [
    "裙带鱼",
    "牙带鱼",
    "白带鱼"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "养血",
    "益气",
    "健脾"
   ],
   "use": "传统食养用于体倦、面色少华。",
   "foodUse": "煎食或炖煮，常用 100 至 200 克。",
   "caution": [
    "鱼虾过敏者不宜食，内热者不宜多食。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区浙江、山东、福建、辽宁。",
   "originGeo": "舟山带鱼",
   "originNote": "肉质细嫩，银鳞易脱落。",
   "sourceBook": "中华本草",
   "sourceChapter": "带鱼科 带鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "daiyu",
   "trad": "帶魚"
  },
  {
   "id": "xia",
   "name": "虾",
   "alias": [
    "河虾",
    "青虾",
    "海虾"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "温阳",
    "益气",
    "养血"
   ],
   "use": "传统食养用于畏寒、手足不温、体倦。",
   "foodUse": "煮食或炒食，常用 50 至 100 克。",
   "caution": [
    "甲壳类过敏者不宜食，内热者不宜多食。"
   ],
   "allergens": [
    "甲壳类"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区广东、江苏、浙江、山东。",
   "originGeo": "",
   "originNote": "肉质紧实弹嫩，鲜味浓。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 虾",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "xia",
   "trad": "蝦"
  },
  {
   "id": "xie",
   "name": "蟹",
   "alias": [
    "河蟹",
    "螃蟹",
    "大闸蟹",
    "毛蟹"
   ],
   "cat": "水产",
   "nature": "寒",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "肝",
    "胃"
   ],
   "effect": [
    "清热",
    "养血",
    "祛湿"
   ],
   "use": "传统食养用于口干、烦热不适。",
   "foodUse": "蒸食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食，甲壳类过敏者不宜食。"
   ],
   "allergens": [
    "甲壳类"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区江苏、湖北、安徽、辽宁。",
   "originGeo": "阳澄湖大闸蟹",
   "originNote": "蟹肉细嫩，蟹黄丰腴。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 蟹",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "xie",
   "trad": "蟹"
  },
  {
   "id": "geli",
   "name": "蛤蜊",
   "alias": [
    "花甲",
    "蛤蛎",
    "文蛤"
   ],
   "cat": "水产",
   "nature": "寒",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "胃",
    "肝"
   ],
   "effect": [
    "清热",
    "生津",
    "祛湿"
   ],
   "use": "传统食养用于口干、小便偏少。",
   "foodUse": "煮汤，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食，须熟透后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、江苏、福建、辽宁。",
   "originGeo": "",
   "originNote": "肉质鲜嫩，煮后汤汁鲜。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 蛤蜊",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "geli",
   "trad": "蛤蜊"
  },
  {
   "id": "muli",
   "name": "牡蛎",
   "alias": [
    "生蚝",
    "蛎黄",
    "海蛎子",
    "蚝"
   ],
   "cat": "水产",
   "nature": "凉",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "养血",
    "安神",
    "生津"
   ],
   "use": "传统食养用于睡眠不安、口干。",
   "foodUse": "蒸食或煮汤，常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食，须熟透后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区广东、福建、山东、辽宁。",
   "originGeo": "",
   "originNote": "肉质滑嫩，鲜味浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "牡蛎科 牡蛎",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "muli",
   "trad": "牡蠣"
  },
  {
   "id": "haishen",
   "name": "海参",
   "alias": [
    "刺参",
    "海鼠",
    "辽参"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "心",
    "肾"
   ],
   "effect": [
    "养血",
    "益气",
    "温阳"
   ],
   "use": "传统食养用于体倦、畏寒、面色少华。",
   "foodUse": "泡发后炖煮，常用 30 至 50 克。",
   "caution": [
    "湿热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区辽宁、山东、福建、广东。",
   "originGeo": "大连海参",
   "originNote": "口感软糯，泡发后体积增大。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 海参",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "haishen",
   "trad": "海參"
  },
  {
   "id": "tianluo",
   "name": "田螺",
   "alias": [
    "田中螺",
    "黄螺"
   ],
   "cat": "水产",
   "nature": "寒",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "胃",
    "膀胱"
   ],
   "effect": [
    "清热",
    "生津",
    "祛湿"
   ],
   "use": "传统食养用于口干、小便偏少。",
   "foodUse": "煮食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食，须熟透后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区江苏、浙江、湖北、湖南。",
   "originGeo": "",
   "originNote": "肉质紧实，须充分加热。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "鳞介类 田螺",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "tianluo",
   "trad": "田螺"
  },
  {
   "id": "niuru",
   "name": "牛乳",
   "alias": [
    "牛奶"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺",
    "胃"
   ],
   "effect": [
    "养血",
    "生津",
    "润肺"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "煮饮，常用 200 至 300 毫升。",
   "caution": [
    "饮乳后易腹胀者不宜多饮。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、黑龙江、河北、新疆。",
   "originGeo": "",
   "originNote": "奶香清淡，煮沸后味更浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛科 牛乳",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "niuru",
   "trad": "牛乳"
  },
  {
   "id": "yangru",
   "name": "羊乳",
   "alias": [
    "羊奶"
   ],
   "cat": "乳品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺"
   ],
   "effect": [
    "养血",
    "润肺",
    "益气"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "煮饮，常用 200 至 300 毫升。",
   "caution": [
    "内热偏盛者不宜多饮。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区陕西、内蒙古、山东、河北。",
   "originGeo": "",
   "originNote": "奶香较浓，膻味依产地而异。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛科 羊乳",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yangru",
   "trad": "羊乳"
  },
  {
   "id": "maru",
   "name": "马乳",
   "alias": [
    "马奶"
   ],
   "cat": "乳品",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "脾"
   ],
   "effect": [
    "养血",
    "清热",
    "生津"
   ],
   "use": "传统食养用于口干、体倦。",
   "foodUse": "煮饮，常用 200 至 300 毫升。",
   "caution": [
    "脾胃虚寒者不宜多饮。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、新疆、青海、甘肃。",
   "originGeo": "",
   "originNote": "奶味清淡，酸马奶风味独特。",
   "sourceBook": "中华本草",
   "sourceChapter": "马乳",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅知《饮膳正要》卷三兽品收马类，未核到马乳专条。",
   "cost": "较高",
   "py": "maru",
   "trad": "馬乳"
  },
  {
   "id": "suannai",
   "name": "酸奶",
   "alias": [
    "酸牛奶",
    "发酵乳",
    "优酪乳"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "生津",
    "健脾",
    "润肠"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "直接食用，常用 100 至 200 克。",
   "caution": [
    "乳制品过敏者不宜食。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、河北、山东、河南。",
   "originGeo": "",
   "originNote": "质地稠滑，酸甜依发酵程度而异。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品列有酸奶成分，性味归经无古籍专条，性味依牛乳推定，待核。",
   "cost": "中等",
   "py": "suannai",
   "trad": "酸奶"
  },
  {
   "id": "nailao",
   "name": "奶酪",
   "alias": [
    "干酪",
    "芝士",
    "起司",
    "乳酪"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "生津"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "佐食，常用 20 至 40 克。",
   "caution": [
    "乳制品过敏者不宜食，含盐较高不宜多食。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、新疆、河北、山东。",
   "originGeo": "",
   "originNote": "质地紧实，风味依发酵与陈化而异。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品列有奶酪成分，性味归经无古籍专条，性味依牛乳推定，待核。",
   "cost": "较高",
   "py": "nailao",
   "trad": "奶酪"
  },
  {
   "id": "heimuer",
   "name": "黑木耳",
   "alias": [
    "木耳",
    "云耳"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃",
    "大肠"
   ],
   "effect": [
    "养血",
    "润肺",
    "润肠"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "泡发后煮食，干品常用 10 至 15 克。",
   "caution": [
    "不宜久泡，须煮熟后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区黑龙江、吉林、辽宁、四川。",
   "originGeo": "东宁黑木耳",
   "originNote": "口感脆嫩，泡发后体积增大。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类 木耳",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "heimuer",
   "trad": "黑木耳"
  },
  {
   "id": "yiner",
   "name": "银耳",
   "alias": [
    "白木耳",
    "雪耳"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘",
    "淡"
   ],
   "meridians": [
    "肺",
    "胃",
    "肾"
   ],
   "effect": [
    "润肺",
    "生津",
    "养血"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "炖煮，干品常用 10 至 15 克。",
   "caution": [
    "痰湿偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、四川、贵州、浙江。",
   "originGeo": "古田银耳",
   "originNote": "炖后软糯，汤汁稠滑。",
   "sourceBook": "中华本草",
   "sourceChapter": "银耳科 银耳",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "yiner",
   "trad": "銀耳"
  },
  {
   "id": "xianggu",
   "name": "香菇",
   "alias": [
    "香蕈",
    "冬菇"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "消食"
   ],
   "use": "传统食养用于食少、体倦。",
   "foodUse": "煮食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "脾胃虚弱者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、浙江、河南、湖北。",
   "originGeo": "庆元香菇",
   "originNote": "香气浓，干品味更厚。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类 香蕈",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "xianggu",
   "trad": "香菇"
  },
  {
   "id": "houtougu",
   "name": "猴头菇",
   "alias": [
    "猴头菌",
    "刺猬菌",
    "猴头蘑",
    "猴头"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "消食"
   ],
   "use": "传统食养用于食少、腹胀。",
   "foodUse": "炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区黑龙江、吉林、福建、浙江。",
   "originGeo": "",
   "originNote": "肉质厚实，炖后绵软。",
   "sourceBook": "中华本草",
   "sourceChapter": "猴头菌科 猴头菌",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "houtougu",
   "trad": "猴頭菇"
  },
  {
   "id": "zhusun-2",
   "name": "竹荪",
   "alias": [
    "竹笙",
    "竹菌",
    "竹参"
   ],
   "cat": "菌藻",
   "nature": "凉",
   "flavor": [
    "甘",
    "苦"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "润肺",
    "益气",
    "清热"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "炖汤，干品常用 5 至 10 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、贵州、云南、福建。",
   "originGeo": "长宁竹荪",
   "originNote": "口感脆嫩，吸汤力强。",
   "sourceBook": "中华本草",
   "sourceChapter": "竹荪",
   "grade": "甲",
   "status": "已核",
   "uncertain": "仅知《中华本草》收竹荪类菌，未核到科属与专条。",
   "cost": "较高",
   "py": "zhusun",
   "trad": "竹蓀"
  },
  {
   "id": "zicai",
   "name": "紫菜",
   "alias": [
    "索菜",
    "海苔"
   ],
   "cat": "菌藻",
   "nature": "寒",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肺",
    "脾",
    "膀胱"
   ],
   "effect": [
    "清热",
    "祛湿",
    "生津"
   ],
   "use": "传统食养用于口干、小便偏少。",
   "foodUse": "煮汤，干品常用 5 至 15 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、浙江、江苏、山东。",
   "originGeo": "",
   "originNote": "干品遇水舒展，汤味鲜。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类 紫菜",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "zicai",
   "trad": "紫菜"
  },
  {
   "id": "haidai",
   "name": "海带",
   "alias": [
    "昆布",
    "江白菜"
   ],
   "cat": "菌藻",
   "nature": "寒",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "肝",
    "胃",
    "肾"
   ],
   "effect": [
    "清热",
    "祛湿",
    "消食"
   ],
   "use": "传统食养用于咽部不适、小便偏少。",
   "foodUse": "煮食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区山东、辽宁、福建、浙江。",
   "originGeo": "荣成海带",
   "originNote": "肉质厚实，久煮转软。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 昆布",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "haidai",
   "trad": "海帶"
  },
  {
   "id": "lingzhi",
   "name": "灵芝",
   "alias": [
    "赤芝",
    "紫芝",
    "灵芝草"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺",
    "肝",
    "肾"
   ],
   "effect": [
    "安神",
    "益气",
    "养血"
   ],
   "use": "传统食养用于睡眠不安、体倦。",
   "foodUse": "煮水或炖汤，常用 6 至 12 克。",
   "caution": [
    "不宜过量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区福建、浙江、安徽、吉林。",
   "originGeo": "",
   "originNote": "味微苦，煮水有菌香。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 灵芝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "lingzhi",
   "trad": "靈芝"
  },
  {
   "id": "hetaoren",
   "name": "核桃仁",
   "alias": [
    "胡桃仁",
    "核桃",
    "核桃肉"
   ],
   "cat": "坚果种子",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肾",
    "肺",
    "大肠"
   ],
   "effect": [
    "温阳",
    "润肺",
    "润肠"
   ],
   "use": "传统食养用于畏寒、排便不畅。",
   "foodUse": "生食或煮粥，常用 10 至 30 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区云南、新疆、四川、陕西。",
   "originGeo": "漾濞核桃",
   "originNote": "仁肉油润，香气浓。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 核桃仁",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "hetaoren",
   "trad": "核桃仁"
  },
  {
   "id": "heizhima",
   "name": "黑芝麻",
   "alias": [
    "胡麻",
    "乌麻",
    "黑脂麻",
    "油麻"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "肾",
    "大肠"
   ],
   "effect": [
    "养血",
    "润肠",
    "益气"
   ],
   "use": "传统食养用于排便不畅、面色少华。",
   "foodUse": "炒食或研粉，常用 9 至 15 克。",
   "caution": [
    "脾虚便溏者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区河南、安徽、湖北、江西。",
   "originGeo": "",
   "originNote": "炒后香气浓，研粉易吸收。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 黑芝麻",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "heizhima",
   "trad": "黑芝麻"
  },
  {
   "id": "huasheng",
   "name": "花生",
   "alias": [
    "落花生",
    "长生果",
    "花生米"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肺"
   ],
   "effect": [
    "健脾",
    "润肺",
    "养血",
    "益气"
   ],
   "use": "传统食养用于食少、体倦。",
   "foodUse": "煮食或炒食，常用 15 至 30 克。",
   "caution": [
    "花生过敏者不宜食，霉变者不可食。"
   ],
   "allergens": [
    "花生"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区河南、山东、河北、辽宁。",
   "originGeo": "",
   "originNote": "炒后香脆，煮后绵软。",
   "sourceBook": "中华本草",
   "sourceChapter": "豆科 落花生",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "huasheng",
   "trad": "花生"
  },
  {
   "id": "baiguo",
   "name": "白果",
   "alias": [
    "银杏",
    "公孙树子",
    "银杏果"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘",
    "苦",
    "涩"
   ],
   "meridians": [
    "肺",
    "肾"
   ],
   "effect": [
    "润肺",
    "益气",
    "健脾"
   ],
   "use": "传统食养用于秋燥口干、咽部不适。",
   "foodUse": "煮食或炖汤，常用 5 至 10 克。",
   "caution": [
    "生白果有毒，不可生食，不宜过量。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录内",
   "originMain": "主产区江苏、山东、广西、浙江。",
   "originGeo": "泰兴白果",
   "originNote": "果仁微苦，煮后软糯。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 白果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "baiguo",
   "trad": "白果"
  },
  {
   "id": "lianzi",
   "name": "莲子",
   "alias": [
    "莲肉",
    "藕实",
    "莲子米"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘",
    "涩"
   ],
   "meridians": [
    "脾",
    "肾",
    "心"
   ],
   "effect": [
    "健脾",
    "安神",
    "益气"
   ],
   "use": "传统食养用于睡眠不安、食少。",
   "foodUse": "煮粥或炖汤，常用 6 至 15 克。",
   "caution": [
    "大便干结者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区湖南、福建、江西、湖北。",
   "originGeo": "湘潭湘莲",
   "originNote": "煮后粉糯，干品耐存。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 莲子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "lianzi",
   "trad": "蓮子"
  },
  {
   "id": "qianshi",
   "name": "芡实",
   "alias": [
    "鸡头米",
    "鸡头实",
    "鸡头果"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘",
    "涩"
   ],
   "meridians": [
    "脾",
    "肾"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "益气"
   ],
   "use": "传统食养用于食少、排便偏稀。",
   "foodUse": "煮粥或炖汤，常用 9 至 15 克。",
   "caution": [
    "大便干结者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区江苏、湖南、湖北、山东。",
   "originGeo": "",
   "originNote": "煮后软糯，干品坚实。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 芡实",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "qianshi",
   "trad": "芡實"
  },
  {
   "id": "feizi",
   "name": "榧子",
   "alias": [
    "香榧",
    "榧实"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘",
    "涩"
   ],
   "meridians": [
    "肺",
    "胃",
    "大肠"
   ],
   "effect": [
    "润肠",
    "消食",
    "健脾"
   ],
   "use": "传统食养用于食欲不振、排便不畅。",
   "foodUse": "炒食，常用 10 至 30 克。",
   "caution": [
    "不宜过量，脾虚便溏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录内",
   "originMain": "主产区浙江、安徽、江西、福建。",
   "originGeo": "诸暨香榧",
   "originNote": "仁肉香脆，微带甘香。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 榧",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "feizi",
   "trad": "榧子"
  },
  {
   "id": "huajiao",
   "name": "花椒",
   "alias": [
    "川椒",
    "蜀椒"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "温阳",
    "祛湿",
    "理气",
    "消食"
   ],
   "use": "传统食养用于食欲不振、脘腹发凉。",
   "foodUse": "调味，常用 2 至 5 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区四川、陕西、甘肃、山东。",
   "originGeo": "汉源花椒",
   "originNote": "麻香浓，炒后香气更显。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 花椒",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "huajiao",
   "trad": "花椒"
  },
  {
   "id": "bajiaohuixiang",
   "name": "八角茴香",
   "alias": [
    "大料",
    "八角",
    "大茴香"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肝",
    "肾",
    "脾",
    "胃"
   ],
   "effect": [
    "温阳",
    "理气",
    "祛湿",
    "消食"
   ],
   "use": "传统食养用于食欲不振、脘腹发凉。",
   "foodUse": "调味，常用 3 至 6 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区广西、云南、广东、福建。",
   "originGeo": "",
   "originNote": "香气浓烈，炖煮后回甘。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 八角茴香",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "bajiaohuixiang",
   "trad": "八角茴香"
  },
  {
   "id": "xiaohuixiang",
   "name": "小茴香",
   "alias": [
    "茴香",
    "香丝菜",
    "茴香子"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肝",
    "肾",
    "脾",
    "胃"
   ],
   "effect": [
    "温阳",
    "理气",
    "消食",
    "祛湿"
   ],
   "use": "传统食养用于食欲不振、脘腹发凉。",
   "foodUse": "调味，常用 3 至 6 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区山西、内蒙古、甘肃、辽宁。",
   "originGeo": "",
   "originNote": "香气清甜，炒后更浓。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 小茴香",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiaohuixiang",
   "trad": "小茴香"
  },
  {
   "id": "rougui",
   "name": "肉桂",
   "alias": [
    "桂皮",
    "玉桂",
    "肉桂皮"
   ],
   "cat": "调味",
   "nature": "热",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "肾",
    "脾",
    "心",
    "肝"
   ],
   "effect": [
    "温阳",
    "理气",
    "祛湿"
   ],
   "use": "传统食养用于畏寒、手足不温。",
   "foodUse": "调味，常用 1 至 5 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区广西、广东、云南、福建。",
   "originGeo": "",
   "originNote": "香气甜辛，久煮味厚。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 肉桂",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "rougui",
   "trad": "肉桂"
  },
  {
   "id": "hujiao",
   "name": "胡椒",
   "alias": [
    "黑胡椒",
    "白胡椒"
   ],
   "cat": "调味",
   "nature": "热",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "温阳",
    "消食",
    "理气",
    "祛湿"
   ],
   "use": "传统食养用于畏寒、食欲不振。",
   "foodUse": "调味，常用 1 至 3 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区海南、广东、广西、云南。",
   "originGeo": "",
   "originNote": "黑胡椒辛香浓，白胡椒味较纯。",
   "sourceBook": "中华本草",
   "sourceChapter": "胡椒科 胡椒",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "hujiao",
   "trad": "胡椒"
  },
  {
   "id": "chenpi",
   "name": "陈皮",
   "alias": [
    "橘皮",
    "广陈皮",
    "陈橘皮"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "苦",
    "辛"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "理气",
    "健脾",
    "祛湿",
    "消食"
   ],
   "use": "传统食养用于食欲不振、腹胀。",
   "foodUse": "煮水或调味，常用 3 至 10 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区广东、福建、四川、浙江。",
   "originGeo": "新会陈皮",
   "originNote": "陈久者香气醇，新皮辛味较重。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 陈皮",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "chenpi",
   "trad": "陳皮"
  },
  {
   "id": "fengmi",
   "name": "蜂蜜",
   "alias": [
    "蜜",
    "白蜜",
    "蜜糖",
    "蜂糖"
   ],
   "cat": "调味",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "脾",
    "大肠"
   ],
   "effect": [
    "益气",
    "健脾",
    "润肺",
    "润肠"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "冲服或调味，常用 15 至 30 克。",
   "caution": [
    "一岁以内婴儿不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区浙江、河南、湖北、云南。",
   "originGeo": "",
   "originNote": "蜜香依蜜源而异，结晶属正常现象。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 蜂蜜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "fengmi",
   "trad": "蜂蜜"
  },
  {
   "id": "xianmi",
   "name": "籼米",
   "alias": [
    "长粒米",
    "丝苗米"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少倦怠、口干烦渴。",
   "foodUse": "煮饭、熬粥、制米粉，常用 50 至 150 克。",
   "caution": [
    "精白籼米膳食纤维较少，宜与杂粮、豆类搭配。",
    "需控糖人群控制单餐总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "湖南、江西、广东、广西",
   "originGeo": "",
   "originNote": "籼米黏性小、胀性大，南方籼稻区多作主食。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "谷食类 籼米",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xianmi",
   "trad": "秈米"
  },
  {
   "id": "caomi",
   "name": "糙米",
   "alias": [
    "玄米"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "润肠"
   ],
   "use": "传统食养用于脾胃虚弱、食少、肠燥。",
   "foodUse": "煮饭、熬粥，提前浸泡 1 至 2 小时更易煮软，常用 50 至 150 克。",
   "caution": [
    "糠层较粗，初食者少量起步，以免腹胀。",
    "质地紧实，需延长烹煮时间。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "黑龙江、江苏、湖南、江西",
   "originGeo": "",
   "originNote": "糙米仅去壳而保留糠层与胚芽，口感较粗。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收糙米，性味归经本草未单列条目。",
   "cost": "中等",
   "py": "caomi",
   "trad": "糙米"
  },
  {
   "id": "heimai",
   "name": "黑麦",
   "alias": [
    "裸麦"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "润肠"
   ],
   "use": "传统食养用于脾胃虚弱、食少、肠燥便干。",
   "foodUse": "磨粉制面包、馒头，或煮粥，常用 30 至 100 克。",
   "caution": [
    "含麸质，麸质不耐受者不宜。",
    "质地较粗，胃肠虚弱者少量起步。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "新疆、甘肃、内蒙古",
   "originGeo": "",
   "originNote": "黑麦耐寒耐瘠，国内西北有小规模种植。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收黑麦，性味归经本草未收本地条目。",
   "cost": "中等",
   "py": "heimai",
   "trad": "黑麥"
  },
  {
   "id": "limai",
   "name": "藜麦",
   "alias": [
    "南美藜"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "淘洗后煮饭、煮粥或拌菜，常用 30 至 80 克。",
   "caution": [
    "表层皂苷带苦味，烹前需反复淘洗。",
    "籽粒外膜可能残留，敏感人群少量试食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "青海、甘肃、山西、内蒙古",
   "originGeo": "",
   "originNote": "藜麦原产南美安第斯山区，国内高寒地区已规模种植。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收藜麦，本草未立条目。",
   "cost": "中等",
   "py": "limai",
   "trad": "藜麥"
  },
  {
   "id": "mushu",
   "name": "木薯",
   "alias": [
    "树薯",
    "木番薯"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "生津"
   ],
   "use": "传统食养用于脾胃虚弱、口干、体倦。",
   "foodUse": "去皮浸泡后蒸煮或制粉，常用 50 至 150 克。",
   "caution": [
    "生木薯含氰苷，须去皮、浸泡并彻底煮熟后食用。",
    "不宜生食，也不宜长期以木薯为主食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广西、广东、海南、云南",
   "originGeo": "",
   "originNote": "木薯块根富含淀粉，南方热区栽培。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收木薯，条目归属与篇目未核。",
   "cost": "平价",
   "py": "mushu",
   "trad": "木薯"
  },
  {
   "id": "lingjiao",
   "name": "菱角",
   "alias": [
    "水栗",
    "菱实",
    "菱米"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "清热"
   ],
   "use": "传统食养用于脾虚食少、暑热口干。",
   "foodUse": "煮食、蒸食或取菱米入粥，常用 100 至 200 克。",
   "caution": [
    "水生果实可能附着寄生虫，建议煮熟后食用。",
    "性凉，脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "",
   "originNote": "菱角为水生果实，嫩者可生食，老者可取粉。",
   "sourceBook": "中华本草",
   "sourceChapter": "菱",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收菱，条目归属与篇目未核。",
   "cost": "中等",
   "py": "lingjiao",
   "trad": "菱角"
  },
  {
   "id": "dandouchi",
   "name": "淡豆豉",
   "alias": [
    "香豉"
   ],
   "cat": "豆类",
   "nature": "凉",
   "flavor": [
    "苦",
    "辛"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "除烦",
    "和胃"
   ],
   "use": "传统食养用于烦热不眠、胸闷、食少。",
   "foodUse": "入汤、蒸制或炒菜佐味，常用 6 至 12 克。",
   "caution": [
    "性凉味苦，脾胃虚寒者不宜多食。",
    "发酵制品含盐，需控盐人群控制用量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录内",
   "originMain": "江西、湖南、四川、安徽",
   "originGeo": "",
   "originNote": "淡豆豉以黑大豆发酵制得，与食用咸豆豉不同。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 淡豆豉",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "dandouchi",
   "trad": "淡豆豉"
  },
  {
   "id": "fuzhu",
   "name": "腐竹",
   "alias": [
    "支竹"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "润燥"
   ],
   "use": "传统食养用于脾胃虚弱、口干、体倦。",
   "foodUse": "泡发后烧、炒、炖，常用 20 至 50 克干品。",
   "caution": [
    "蛋白质与脂肪含量较高，需控脂人群控制用量。",
    "泡发后易变质，须冷藏并及时烹制。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "江西、广西、河南、云南",
   "originGeo": "",
   "originNote": "腐竹为豆浆结膜后挑出干燥而成的条状制品。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收腐竹，本草未单列条目。",
   "cost": "平价",
   "py": "fuzhu",
   "trad": "腐竹"
  },
  {
   "id": "doufupi",
   "name": "豆腐皮",
   "alias": [
    "千张",
    "干豆腐"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "生津"
   ],
   "use": "传统食养用于脾胃虚弱、食少、口干。",
   "foodUse": "凉拌、炒食、卷食，常用 50 至 100 克。",
   "caution": [
    "加工多经盐卤或石膏点制，需控盐人群注意。",
    "蛋白质含量高，一次不宜过量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "江苏、安徽、山东、河北",
   "originGeo": "",
   "originNote": "豆腐皮为豆浆结膜压成的薄片，与卷条状的腐竹形态不同。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收豆腐皮，本草未单列条目。",
   "cost": "平价",
   "py": "doufupi",
   "trad": "豆腐皮"
  },
  {
   "id": "lvdouya",
   "name": "绿豆芽",
   "alias": [
    "银芽"
   ],
   "cat": "豆类",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "利水",
    "生津"
   ],
   "use": "传统食养用于暑热烦渴、口干、小便短少。",
   "foodUse": "快炒、凉拌、煮汤，常用 100 至 200 克。",
   "caution": [
    "芽体含水多易变质，须洗净并彻底加热。",
    "性偏凉，脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "各地均可生产",
   "originGeo": "",
   "originNote": "绿豆浸水避光发芽而成，芽体细长洁白。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收绿豆芽，本草未单列条目。",
   "cost": "平价",
   "py": "lvdouya",
   "trad": "綠豆芽"
  },
  {
   "id": "huangdouya",
   "name": "黄豆芽",
   "alias": [
    "大豆芽"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "利湿",
    "健脾"
   ],
   "use": "传统食养用于湿盛、口干、食少。",
   "foodUse": "炒食、煮汤，须彻底加热，常用 100 至 200 克。",
   "caution": [
    "须炒熟煮透，不宜生食。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "各地均可生产",
   "originGeo": "",
   "originNote": "黄豆浸水发芽而成，芽体粗壮、豆瓣淡黄。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收黄豆芽，本草未单列条目。",
   "cost": "平价",
   "py": "huangdouya",
   "trad": "黃豆芽"
  },
  {
   "id": "mudou",
   "name": "木豆",
   "alias": [
    "鸽豆",
    "柳豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "祛湿"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "煮粥、炖汤或制豆泥，常用 30 至 80 克。",
   "caution": [
    "豆粒需充分浸泡煮透，生豆含抗营养因子。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、广西、海南、贵州",
   "originGeo": "",
   "originNote": "木豆为多年生灌木豆类，南方干热河谷常见。",
   "sourceBook": "中华本草",
   "sourceChapter": "木豆",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "mudou",
   "trad": "木豆"
  },
  {
   "id": "moyu",
   "name": "魔芋",
   "alias": [
    "磨芋",
    "蒟蒻"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "消食",
    "化痰",
    "祛湿"
   ],
   "use": "传统食养用于食积、痰湿、脘腹痞满。",
   "foodUse": "须用魔芋豆腐、魔芋丝等制品，焯水后烧炒，常用 100 至 200 克。",
   "caution": [
    "生魔芋块茎有毒，不可直接食用，须经碱水加工制成制品。",
    "制品膳食纤维多，一次多食易腹胀，须配足量饮水。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "四川、云南、贵州、陕西",
   "originGeo": "",
   "originNote": "魔芋块茎富含葡甘聚糖，产区多以碱制凝胶后食用。",
   "sourceBook": "中华本草",
   "sourceChapter": "磨芋",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收磨芋，条目归属与篇目未核。",
   "cost": "平价",
   "py": "moyu",
   "trad": "魔芋"
  },
  {
   "id": "biji",
   "name": "荸荠",
   "alias": [
    "马蹄",
    "地栗"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "化痰",
    "消食"
   ],
   "use": "传统食养用于口干、咽干、食积。",
   "foodUse": "去皮生食或煮食、入馅，常用 100 至 200 克。",
   "caution": [
    "水生作物表皮易附着寄生虫，生食须洗净去皮。",
    "性寒，脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广西、湖南、江苏、浙江",
   "originGeo": "",
   "originNote": "荸荠为水生块茎，冬季采收，皮色紫黑。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类 荸荠",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "biqi",
   "trad": "荸薺"
  },
  {
   "id": "cigu",
   "name": "慈姑",
   "alias": [
    "茨菰",
    "白地栗"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "心",
    "肝"
   ],
   "effect": [
    "清热",
    "化痰",
    "消食"
   ],
   "use": "传统食养用于痰热、口干、食少。",
   "foodUse": "煮食、蒸食或切片炒食，常用 100 至 200 克。",
   "caution": [
    "须煮熟后食用，不宜生食。",
    "性凉，脾胃虚寒者少食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、湖北、湖南",
   "originGeo": "",
   "originNote": "慈姑为水生草本球茎，霜降后采收。",
   "sourceBook": "中华本草",
   "sourceChapter": "慈姑",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "cigu",
   "trad": "慈姑"
  },
  {
   "id": "tonghao",
   "name": "茼蒿",
   "alias": [
    "蓬蒿",
    "蒿菜"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "心",
    "脾",
    "胃"
   ],
   "effect": [
    "理气",
    "消食",
    "和中"
   ],
   "use": "传统食养用于胸膈满闷、食少、痰多。",
   "foodUse": "涮食、清炒、凉拌，常用 100 至 200 克。",
   "caution": [
    "气味辛香，多食易口干。",
    "硝酸盐含量相对高，隔夜熟菜不宜再食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河北、山东、江苏、安徽",
   "originGeo": "",
   "originNote": "茼蒿分大叶与小叶两类，秋至春季为常季。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "蔬食类 茼蒿",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "tonghao",
   "trad": "茼蒿"
  },
  {
   "id": "jiecai",
   "name": "芥菜",
   "alias": [
    "盖菜",
    "雪菜"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "温中",
    "理气",
    "化痰"
   ],
   "use": "传统食养用于寒痰、胸膈满闷、食少。",
   "foodUse": "炒食、腌渍、煮汤，常用 100 至 200 克。",
   "caution": [
    "辛温偏散，阴虚火旺者不宜多食。",
    "腌渍制品含盐高，需控盐人群少食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "四川、湖南、浙江、江苏",
   "originGeo": "",
   "originNote": "芥菜有叶用、茎用、根用多类，雪里蕻为叶用变种。",
   "sourceBook": "中华本草",
   "sourceChapter": "芥菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "食疗本草有芥的记载，菜用芥与芥子分条，篇目待核。",
   "cost": "平价",
   "py": "jiecai",
   "trad": "芥菜"
  },
  {
   "id": "lajiao",
   "name": "辣椒",
   "alias": [
    "番椒",
    "海椒",
    "辣子"
   ],
   "cat": "蔬菜",
   "nature": "热",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "散寒",
    "消食"
   ],
   "use": "传统食养用于寒湿内盛、脘腹冷痛、食少。",
   "foodUse": "作调味或炒食，常用 10 至 30 克鲜品。",
   "caution": [
    "辛热走散，阴虚火旺、口腔溃疡、痔疮者不宜多食。",
    "接触辣椒后勿揉眼，处理时可戴手套。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "湖南、贵州、四川、云南",
   "originGeo": "",
   "originNote": "辣椒明末传入，现为西南地区重要调味蔬菜。",
   "sourceBook": "中华本草",
   "sourceChapter": "辣椒",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收辣椒，条目归属与篇目未核。",
   "cost": "平价",
   "py": "lajiao",
   "trad": "辣椒"
  },
  {
   "id": "lusun",
   "name": "芦笋",
   "alias": [
    "石刁柏",
    "芦尖"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "利水"
   ],
   "use": "传统食养用于口干、热盛、小便短少。",
   "foodUse": "焯水后清炒、凉拌，常用 100 至 200 克。",
   "caution": [
    "含嘌呤较高，尿酸偏高者控制用量。",
    "嫩茎易老，烹前削去基部老皮。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、江苏、福建",
   "originGeo": "",
   "originNote": "芦笋为石刁柏嫩茎，白芦笋与绿芦笋栽培方式不同。",
   "sourceBook": "中华本草",
   "sourceChapter": "石刁柏",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收石刁柏，条目归属与篇目未核。",
   "cost": "较高",
   "py": "lusun",
   "trad": "蘆筍"
  },
  {
   "id": "xiangchun",
   "name": "香椿",
   "alias": [
    "椿芽",
    "香椿芽"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "化湿",
    "消食"
   ],
   "use": "传统食养用于湿热、口苦、食少。",
   "foodUse": "焯水后凉拌、炒蛋或腌渍，常用 50 至 100 克。",
   "caution": [
    "含亚硝酸盐，食前需沸水焯烫，不宜久放。",
    "传统视为发物，皮肤敏感者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、河北、安徽",
   "originGeo": "",
   "originNote": "香椿取春季嫩芽，谷雨前品质较佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "椿叶",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收椿与香椿叶，条目归属与篇目未核。",
   "cost": "较高",
   "py": "xiangchun",
   "trad": "香椿"
  },
  {
   "id": "foshou",
   "name": "佛手",
   "alias": [
    "佛手柑",
    "五指柑"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "辛",
    "苦",
    "酸"
   ],
   "meridians": [
    "肝",
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "理气",
    "健脾",
    "祛湿"
   ],
   "use": "传统食养用于气机不畅、胸胁胀闷、食欲欠佳的日常调理。",
   "foodUse": "鲜果切片泡水或煮粥，干品常用 3 至 6 克，鲜品 10 至 15 克。",
   "caution": [
    "气虚者不宜多食。",
    "阴虚津少者少量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "广东、四川、浙江、云南",
   "originGeo": "",
   "originNote": "鲜果香气清雅，果皮厚薄因产地而异。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 佛手",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "foshou",
   "trad": "佛手"
  },
  {
   "id": "xiangyuan",
   "name": "香橼",
   "alias": [
    "枸橼",
    "香圆"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "辛",
    "苦",
    "酸"
   ],
   "meridians": [
    "肝",
    "脾",
    "肺"
   ],
   "effect": [
    "理气",
    "消食",
    "祛湿"
   ],
   "use": "传统食养用于气滞胀闷、饮食不香、胸胁不舒的日常调理。",
   "foodUse": "鲜果切片泡水或制蜜饯，干品常用 3 至 6 克。",
   "caution": [
    "气虚者不宜多食。",
    "鲜果酸涩，胃部不适者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "四川、云南、广东、福建",
   "originGeo": "",
   "originNote": "果皮厚、香气浓，果肉汁少味酸。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 香橼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "xiangyuan",
   "trad": "香櫞"
  },
  {
   "id": "shaji",
   "name": "沙棘",
   "alias": [
    "醋柳果",
    "酸刺"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "酸",
    "涩"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺",
    "心"
   ],
   "effect": [
    "健脾",
    "消食",
    "生津"
   ],
   "use": "传统食养用于食少倦怠、口干津少、胸腹胀闷的日常调理。",
   "foodUse": "鲜果榨汁、制果酱或泡水，常用鲜果 30 至 60 克。",
   "caution": [
    "酸涩味重，胃酸偏多者少量。",
    "果汁含糖，控糖人群注意总量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "内蒙古、新疆、山西、陕西、甘肃",
   "originGeo": "",
   "originNote": "果实酸涩，野生与栽培果粒大小有别。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 沙棘",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "shaji",
   "trad": "沙棘"
  },
  {
   "id": "luohanguo",
   "name": "罗汉果",
   "alias": [
    "拉汉果",
    "光果木鳖",
    "假苦瓜"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "润肺",
    "生津",
    "润肠",
    "清热"
   ],
   "use": "传统食养用于咽干口渴、肠燥不畅的日常调理。",
   "foodUse": "取果掰碎冲泡代茶，每次 5 至 10 克。",
   "caution": [
    "性凉，脾胃虚寒者少量。",
    "冲泡不宜过浓，甜味成分适量即可。",
    "脾胃虚寒者不宜多饮。",
    "甜味较浓，控糖人群酌量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "广西、广东、湖南、贵州",
   "originGeo": "",
   "originNote": "果形圆整、外壳脆薄，冲泡甜味来自罗汉果苷。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 罗汉果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "luohanguo",
   "trad": "羅漢果"
  },
  {
   "id": "qingguo",
   "name": "青果",
   "alias": [
    "橄榄",
    "青榄"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "利咽"
   ],
   "use": "传统食养用于咽干口燥、津少口渴的日常调理。",
   "foodUse": "鲜果嚼食、腌渍或煮水，常用 5 至 10 枚。",
   "caution": [
    "初食涩口，宜少量慢嚼。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "广东、福建、广西、云南",
   "originGeo": "",
   "originNote": "初入口涩，回味转甘，果核坚硬。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 青果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "qingguo",
   "trad": "青果"
  },
  {
   "id": "yuganzi",
   "name": "余甘子",
   "alias": [
    "油甘子",
    "滇橄榄"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸",
    "涩"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "消食",
    "健脾"
   ],
   "use": "传统食养用于食积不化、口干津少的日常调理。",
   "foodUse": "鲜果嚼食或煮水，常用 5 至 10 枚。",
   "caution": [
    "酸涩明显，空腹不宜多食。",
    "脾胃虚寒者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "云南、广西、福建、广东",
   "originGeo": "",
   "originNote": "入口酸涩，回味生津，果粒大小因产地而异。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 余甘子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "yuganzi",
   "trad": "餘甘子"
  },
  {
   "id": "xiangjiao",
   "name": "香蕉",
   "alias": [
    "甘蕉",
    "蕉子"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "清热",
    "润肠",
    "生津"
   ],
   "use": "传统食养用于津伤口渴、肠燥不畅的日常调理。",
   "foodUse": "剥皮鲜食，每日 1 至 2 根。",
   "caution": [
    "未熟香蕉涩口，宜熟透后食用。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、海南、云南、福建",
   "originGeo": "",
   "originNote": "熟透后果肉软糯香甜，表皮出现褐点风味更足。",
   "sourceBook": "中华本草",
   "sourceChapter": "甘蕉",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有香蕉条，科属与篇目未核。",
   "cost": "平价",
   "py": "xiangjiao",
   "trad": "香蕉"
  },
  {
   "id": "mihoutao",
   "name": "猕猴桃",
   "alias": [
    "奇异果",
    "藤梨"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "胃",
    "肝",
    "肾"
   ],
   "effect": [
    "清热",
    "生津",
    "健脾",
    "润肠"
   ],
   "use": "传统食养用于口干津少、食欲欠佳、肠燥不畅的日常调理。",
   "foodUse": "去皮鲜食或制果泥，每日 1 至 2 个。",
   "caution": [
    "果酸与蛋白酶较多，口腔易刺痒者少量。",
    "对猕猴桃过敏者避免食用。"
   ],
   "allergens": [
    "猕猴桃"
   ],
   "yaoshi": "目录外",
   "originMain": "陕西、四川、贵州、河南、湖南",
   "originGeo": "",
   "originNote": "果肉翠绿或金黄，软熟后酸甜适口。",
   "sourceBook": "中华本草",
   "sourceChapter": "猕猴桃",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有猕猴桃条，科属与篇目未核。",
   "cost": "中等",
   "py": "mihoutao",
   "trad": "獼猴桃"
  },
  {
   "id": "zhuxin",
   "name": "猪心",
   "alias": [],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "心"
   ],
   "effect": [
    "养血",
    "安神",
    "益气"
   ],
   "use": "传统食养用于心神不宁、睡眠欠安、气血不足的日常调理。",
   "foodUse": "剖开洗净，炖汤或卤制，每次 50 至 100 克。",
   "caution": [
    "内脏含胆固醇较高，适量食用。",
    "需充分煮熟。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "全国普遍养殖",
   "originGeo": "",
   "originNote": "肉质紧实，色泽鲜红，宜当日烹制。",
   "sourceBook": "中华本草",
   "sourceChapter": "猪心",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有猪心条，科属与篇目未核。",
   "cost": "中等",
   "py": "zhuxin",
   "trad": "豬心"
  },
  {
   "id": "zhufei",
   "name": "猪肺",
   "alias": [],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺"
   ],
   "effect": [
    "润肺",
    "益气"
   ],
   "use": "传统食养用于秋燥咽干、肺燥少津的日常调理。",
   "foodUse": "反复灌洗至水清，煮汤或炖食，每次 50 至 100 克。",
   "caution": [
    "结构疏松，须反复灌洗并充分煮熟。",
    "内脏含胆固醇较高，适量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "全国普遍养殖",
   "originGeo": "",
   "originNote": "组织疏松，需反复灌洗。",
   "sourceBook": "中华本草",
   "sourceChapter": "猪肺",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有猪肺条，科属与篇目未核。",
   "cost": "平价",
   "py": "zhufei",
   "trad": "豬肺"
  },
  {
   "id": "niudu",
   "name": "牛肚",
   "alias": [
    "牛百叶",
    "毛肚"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "消食"
   ],
   "use": "传统食养用于脾胃虚弱、食少乏力、脘腹不舒的日常调理。",
   "foodUse": "反复搓洗后焯水，炖煮或凉拌，每次 50 至 100 克。",
   "caution": [
    "须反复搓洗并煮透。",
    "内脏含胆固醇较高，适量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、河南、山东、河北",
   "originGeo": "",
   "originNote": "质地韧弹，久煮软糯。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛肚",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有牛肚条，科属与篇目未核。",
   "cost": "较高",
   "py": "niudu",
   "trad": "牛肚"
  },
  {
   "id": "yanggan",
   "name": "羊肝",
   "alias": [],
   "cat": "畜肉",
   "nature": "凉",
   "flavor": [
    "甘",
    "苦"
   ],
   "meridians": [
    "肝"
   ],
   "effect": [
    "养血",
    "益气",
    "明目"
   ],
   "use": "传统食养用于血虚萎黄、视物昏花、眼干少津的日常调理。",
   "foodUse": "切片焯水后快炒或煮汤，每次 30 至 50 克。",
   "caution": [
    "维生素 A 含量高，不宜频繁大量食用。",
    "内脏含胆固醇较高，适量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、甘肃、宁夏",
   "originGeo": "",
   "originNote": "色泽红褐，质地细密，宜快火短烹。",
   "sourceBook": "中华本草",
   "sourceChapter": "羊肝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有羊肝条，科属与篇目未核。",
   "cost": "较高",
   "py": "yanggan",
   "trad": "羊肝"
  },
  {
   "id": "anchunrou",
   "name": "鹌鹑肉",
   "alias": [],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾"
   ],
   "use": "传统食养用于脾胃虚弱、气短乏力、食少倦怠的日常调理。",
   "foodUse": "炖汤、红烧或烤制，每次 1 至 2 只。",
   "caution": [
    "需彻底加热后食用。",
    "嘌呤含量中等偏高，相关饮食限制者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河北、山东、河南、江苏",
   "originGeo": "",
   "originNote": "肉质细嫩，个体小，易熟。",
   "sourceBook": "中华本草",
   "sourceChapter": "鹌鹑",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鹌鹑条，科属与篇目未核。",
   "cost": "中等",
   "py": "anchunrou",
   "trad": "鵪鶉肉"
  },
  {
   "id": "anchundan",
   "name": "鹌鹑蛋",
   "alias": [
    "鹑蛋"
   ],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于气血不足、食少倦怠的日常调理。",
   "foodUse": "水煮、卤制或入汤，每日 3 至 5 枚。",
   "caution": [
    "蛋黄胆固醇较高，适量食用。",
    "蛋类过敏者避免食用。"
   ],
   "allergens": [
    "蛋"
   ],
   "yaoshi": "目录外",
   "originMain": "河北、山东、河南、江苏",
   "originGeo": "",
   "originNote": "蛋壳花斑，个体小巧，蛋白细嫩。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蛋类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "anchundan",
   "trad": "鵪鶉蛋"
  },
  {
   "id": "wuguji",
   "name": "乌骨鸡",
   "alias": [
    "乌鸡",
    "竹丝鸡"
   ],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "肾",
    "脾"
   ],
   "effect": [
    "养血",
    "益气",
    "健脾"
   ],
   "use": "传统食养用于气血不足、面色少华、倦怠乏力的日常调理。",
   "foodUse": "切块炖汤或蒸煮，每次 100 至 150 克。",
   "caution": [
    "脂肪较多，炖煮后可撇去浮油。",
    "体胖痰湿者少量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江西、福建、广东、广西",
   "originGeo": "",
   "originNote": "皮、肉、骨多呈乌色，肉质细嫩。",
   "sourceBook": "中华本草",
   "sourceChapter": "乌骨鸡",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有乌骨鸡条，科属与篇目未核。",
   "cost": "较高",
   "py": "wuguji",
   "trad": "烏骨雞"
  },
  {
   "id": "edan",
   "name": "鹅蛋",
   "alias": [
    "鹅卵"
   ],
   "cat": "禽蛋",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "健脾"
   ],
   "use": "传统食养用于气血不足、食少乏力的日常调理。",
   "foodUse": "水煮、蒸蛋或炒食，每次 1 个。",
   "caution": [
    "蛋黄胆固醇较高，适量食用。",
    "蛋类过敏者避免食用。"
   ],
   "allergens": [
    "蛋"
   ],
   "yaoshi": "目录外",
   "originMain": "江苏、安徽、山东、黑龙江",
   "originGeo": "",
   "originNote": "蛋个体大，蛋黄比例高，质地紧实。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蛋类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "edan",
   "trad": "鵝蛋"
  },
  {
   "id": "caoyu",
   "name": "草鱼",
   "alias": [
    "鲩鱼",
    "草鲩"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "温中"
   ],
   "use": "传统食养用于脾胃虚寒、食少乏力、脘腹不舒的日常调理。",
   "foodUse": "切块清蒸、炖汤或红烧，每次 100 至 150 克。",
   "caution": [
    "细刺较多，老人与儿童食用时注意。",
    "水产过敏者避免食用。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "湖北、湖南、江西、广东",
   "originGeo": "",
   "originNote": "肉厚味鲜，细刺较多。",
   "sourceBook": "中华本草",
   "sourceChapter": "鲩鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有草鱼条，科属与篇目未核。",
   "cost": "平价",
   "py": "caoyu",
   "trad": "草魚"
  },
  {
   "id": "guiyu",
   "name": "鳜鱼",
   "alias": [
    "桂鱼",
    "季花鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "养血"
   ],
   "use": "传统食养用于气血不足、脾胃虚弱、食少倦怠的日常调理。",
   "foodUse": "清蒸或炖汤，每次 100 至 150 克。",
   "caution": [
    "背鳍硬刺，处理时注意。",
    "水产过敏者避免食用。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "",
   "originNote": "肉呈蒜瓣状，细嫩少刺。",
   "sourceBook": "中华本草",
   "sourceChapter": "鳜鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鳜鱼条，科属与篇目未核。",
   "cost": "较高",
   "py": "guiyu",
   "trad": "鱖魚"
  },
  {
   "id": "dahuangyu",
   "name": "大黄鱼",
   "alias": [
    "黄鱼",
    "黄花鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "养血"
   ],
   "use": "传统食养用于气血不足、食欲欠佳、倦怠乏力的日常调理。",
   "foodUse": "清蒸、红烧或炖汤，每次 100 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "腌制品含盐较高，控制用量。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "浙江、福建、山东、广东",
   "originGeo": "",
   "originNote": "肉质细嫩呈蒜瓣状，鲜品与腌制品风味不同。",
   "sourceBook": "中华本草",
   "sourceChapter": "石首鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有大黄鱼条，科属与篇目未核。",
   "cost": "中等",
   "py": "dahuangyu",
   "trad": "大黃魚"
  },
  {
   "id": "haizhe",
   "name": "海蜇",
   "alias": [],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "肺",
    "肝",
    "肾"
   ],
   "effect": [
    "清热",
    "润肠",
    "消食"
   ],
   "use": "传统食养用于燥热口渴、肠燥不畅的日常调理。",
   "foodUse": "充分浸泡后凉拌或煮汤，每次 50 至 100 克。",
   "caution": [
    "市售海蜇多经盐与明矾加工，食用前充分浸泡。",
    "水产过敏者避免食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "辽宁、山东、浙江、福建",
   "originGeo": "",
   "originNote": "伞部脆嫩，口腕部韧，市售多为盐矾加工品。",
   "sourceBook": "中华本草",
   "sourceChapter": "海蜇",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有海蜇条，科属与篇目未核。",
   "cost": "中等",
   "py": "haizhe",
   "trad": "海蜇"
  },
  {
   "id": "naifen",
   "name": "奶粉",
   "alias": [
    "乳粉"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "生津"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "温水冲调，常用 20 至 30 克。",
   "caution": [
    "乳制品过敏者不宜食。",
    "冲调浓度按包装说明。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、黑龙江、河北、新疆。",
   "originGeo": "",
   "originNote": "复原后奶香清淡，便于存放。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品列有奶粉成分，性味归经无古籍专条，性味依牛乳推定，待核。",
   "cost": "中等",
   "py": "naifen",
   "trad": "奶粉"
  },
  {
   "id": "lianru",
   "name": "炼乳",
   "alias": [
    "炼奶",
    "甜炼乳"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "生津",
    "健脾"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "冲调或佐食，常用 10 至 20 克。",
   "caution": [
    "乳制品过敏者不宜食。",
    "含糖较高，控糖人群酌量。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、黑龙江、河北、山东。",
   "originGeo": "",
   "originNote": "质地浓稠，甜味明显。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品列有炼乳成分，性味归经无古籍专条，性味依牛乳推定，待核。",
   "cost": "中等",
   "py": "lianru",
   "trad": "煉乳"
  },
  {
   "id": "huangyou",
   "name": "黄油",
   "alias": [
    "牛油",
    "白脱"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "润燥"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "烘焙、煎制或佐食，常用 5 至 10 克。",
   "caution": [
    "乳制品过敏者不宜食。",
    "含脂肪较高，不宜多食。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、黑龙江、河北、山东。",
   "originGeo": "",
   "originNote": "奶香浓郁，受热易融。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品列有黄油成分，性味归经无古籍专条，性味依酥油类古说推定，待核。",
   "cost": "较高",
   "py": "huangyou",
   "trad": "黃油"
  },
  {
   "id": "naiyou",
   "name": "奶油",
   "alias": [
    "稀奶油",
    "淡奶油"
   ],
   "cat": "乳品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "生津",
    "润燥"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "打发或入汤，常用 10 至 20 克。",
   "caution": [
    "乳制品过敏者不宜食。",
    "含脂肪较高，不宜多食。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、黑龙江、河北、山东。",
   "originGeo": "",
   "originNote": "乳香清淡，打发后蓬松。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品列有奶油成分，性味归经无古籍专条，性味依牛乳推定，待核。",
   "cost": "较高",
   "py": "naiyou",
   "trad": "奶油"
  },
  {
   "id": "pinggu",
   "name": "平菇",
   "alias": [
    "侧耳"
   ],
   "cat": "菌藻",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气"
   ],
   "use": "传统食养用于食欲不振、体倦。",
   "foodUse": "炒食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、河北、河南、江苏。",
   "originGeo": "",
   "originNote": "肉质肥厚，煮后柔滑。",
   "sourceBook": "中华本草",
   "sourceChapter": "侧耳",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有平菇成分，性味归经无古籍专条，性味依菌类通行说推定，待核。",
   "cost": "平价",
   "py": "pinggu",
   "trad": "平菇"
  },
  {
   "id": "jinzhengu",
   "name": "金针菇",
   "alias": [
    "金菇",
    "构菌"
   ],
   "cat": "菌藻",
   "nature": "凉",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "润肠",
    "清热"
   ],
   "use": "传统食养用于食欲不振、排便不畅。",
   "foodUse": "焯煮、炒食或涮食，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "含膳食纤维较多，脾胃虚弱者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河北、福建、山东、江苏。",
   "originGeo": "",
   "originNote": "菌柄细长，煮后爽滑。",
   "sourceBook": "中华本草",
   "sourceChapter": "冬菇",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有金针菇成分，性味归经无古籍专条，性味依菌类通行说推定，待核。",
   "cost": "平价",
   "py": "jinzhengu",
   "trad": "金針菇"
  },
  {
   "id": "caogu",
   "name": "草菇",
   "alias": [
    "兰花菇",
    "秆菇"
   ],
   "cat": "菌藻",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "生津"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "炒食或煮汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、福建、广西、江西。",
   "originGeo": "",
   "originNote": "肉质脆嫩，煮后汤味鲜。",
   "sourceBook": "中华本草",
   "sourceChapter": "草菇",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有草菇成分，性味归经无古籍专条，性味依菌类通行说推定，待核。",
   "cost": "中等",
   "py": "caogu",
   "trad": "草菇"
  },
  {
   "id": "qundaocai",
   "name": "裙带菜",
   "alias": [
    "海芥菜",
    "裙带"
   ],
   "cat": "菌藻",
   "nature": "凉",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "肝",
    "胃",
    "肾"
   ],
   "effect": [
    "清热",
    "利水",
    "化痰"
   ],
   "use": "传统食养用于咽部不适、小便偏少。",
   "foodUse": "煮汤或凉拌，干品常用 5 至 10 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "含碘较高，甲状腺功能异常者遵医嘱。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区辽宁、山东、浙江、福建。",
   "originGeo": "",
   "originNote": "干品复水后柔韧，汤味鲜。",
   "sourceBook": "中华本草",
   "sourceChapter": "昆布",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有裙带菜成分，性味归经无古籍专条，性味依昆布类古说推定，待核。",
   "cost": "中等",
   "py": "qundaicai",
   "trad": "裙帶菜"
  },
  {
   "id": "banli",
   "name": "栗子",
   "alias": [
    "板栗",
    "大栗"
   ],
   "cat": "坚果种子",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "健脾",
    "益气",
    "补肾"
   ],
   "use": "传统食养用于食欲不振、体倦、腰膝无力。",
   "foodUse": "蒸煮、炖汤或入饭，常用 30 至 60 克。",
   "caution": [
    "含淀粉较多，控糖人群控制总量。",
    "一次不宜过量，易腹胀。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区河北、山东、湖北、安徽。",
   "originGeo": "迁西板栗",
   "originNote": "果肉粉糯，甜味依品种而异。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 栗",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "lizi",
   "trad": "栗子"
  },
  {
   "id": "songzi",
   "name": "松子",
   "alias": [
    "松子仁",
    "海松子"
   ],
   "cat": "坚果种子",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "润肺",
    "润肠",
    "养血"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "炒食或入菜，常用 10 至 20 克。",
   "caution": [
    "含油脂较多，便溏者不宜多食。",
    "宜密封避光保存，防油脂氧化。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区黑龙江、吉林、辽宁、云南。",
   "originGeo": "",
   "originNote": "仁肉香脆，含油较高。",
   "sourceBook": "中华本草",
   "sourceChapter": "海松子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有松子成分，性味归经无古籍专条，性味依松子仁通行说推定，待核。",
   "cost": "较高",
   "py": "songzi",
   "trad": "松子"
  },
  {
   "id": "nanguazi",
   "name": "南瓜子",
   "alias": [
    "南瓜仁",
    "白瓜子"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "益气"
   ],
   "use": "传统食养用于体倦、食少。",
   "foodUse": "炒食或入面点，常用 10 至 20 克。",
   "caution": [
    "含油脂较多，一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区黑龙江、吉林、内蒙古、云南。",
   "originGeo": "",
   "originNote": "仁肉饱满，炒后香脆。",
   "sourceBook": "中华本草",
   "sourceChapter": "南瓜子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有南瓜子成分，性味归经无古籍专条，性味依南瓜类通行说推定，待核。",
   "cost": "中等",
   "py": "nanguazi",
   "trad": "南瓜子"
  },
  {
   "id": "kuihuazi",
   "name": "葵花子",
   "alias": [
    "向日葵子",
    "瓜子"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "养血",
    "润肠"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "炒食，常用 10 至 20 克。",
   "caution": [
    "含油脂较多，一次不宜过量。",
    "宜选原味，少食过咸者。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、新疆、黑龙江、甘肃。",
   "originGeo": "",
   "originNote": "仁肉香脆，原味更宜。",
   "sourceBook": "中华本草",
   "sourceChapter": "向日葵子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有葵花子成分，性味归经无古籍专条，性味依种子类通行说推定，待核。",
   "cost": "中等",
   "py": "kuihuazi",
   "trad": "葵花子"
  },
  {
   "id": "dingxiang",
   "name": "丁香",
   "alias": [
    "公丁香",
    "丁子香"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺",
    "肾"
   ],
   "effect": [
    "温中",
    "理气"
   ],
   "use": "传统食养用于畏寒、食欲不振。",
   "foodUse": "炖煮、卤味调味，常用 1 至 3 克。",
   "caution": [
    "辛温香燥，内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区坦桑尼亚、印度尼西亚、马达加斯加。",
   "originGeo": "",
   "originNote": "香气浓烈，含油较高。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 丁香",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "dingxiang",
   "trad": "丁香"
  },
  {
   "id": "roudoukou",
   "name": "肉豆蔻",
   "alias": [
    "肉果",
    "玉果"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "温中",
    "理气",
    "祛湿"
   ],
   "use": "传统食养用于畏寒、食欲不振。",
   "foodUse": "炖煮、卤味调味，常用 1 至 3 克。",
   "caution": [
    "辛温，内热偏盛者不宜多食。",
    "气味浓烈，不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区印度尼西亚、马来西亚、斯里兰卡，国内云南、广东有引种。",
   "originGeo": "",
   "originNote": "香气甜辛，磨粉后味更浓。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 肉豆蔻",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "roudoukou",
   "trad": "肉豆蔻"
  },
  {
   "id": "caoguo",
   "name": "草果",
   "alias": [
    "草果仁",
    "草果子"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "祛湿",
    "消食"
   ],
   "use": "传统食养用于畏寒、食欲不振。",
   "foodUse": "炖肉、卤味调味，常用 1 至 3 克。",
   "caution": [
    "辛温香燥，阴虚者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区云南、广西、贵州、四川。",
   "originGeo": "",
   "originNote": "香气特异，炖煮后味厚。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 草果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "caoguo",
   "trad": "草果"
  },
  {
   "id": "sharen",
   "name": "砂仁",
   "alias": [
    "阳春砂",
    "缩砂仁"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "祛湿",
    "消食",
    "理气",
    "温中"
   ],
   "use": "传统食养用于食欲不振、腹部胀满。",
   "foodUse": "炖汤、煮粥后下，常用 3 至 6 克。",
   "caution": [
    "气味芳香，不宜久煎。",
    "阴虚者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区广东、广西、云南、海南。",
   "originGeo": "阳春砂仁",
   "originNote": "香气浓郁，壳薄仁饱满。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 砂仁",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "sharen",
   "trad": "砂仁"
  },
  {
   "id": "gouqizi",
   "name": "枸杞子",
   "alias": [
    "枸杞",
    "杞子"
   ],
   "cat": "药食同源",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "养血",
    "益气",
    "生津",
    "明目"
   ],
   "use": "传统食养用于体倦、口干、目涩。",
   "foodUse": "泡水、煮粥、炖汤，常用 6 至 12 克。",
   "caution": [
    "外感发热者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区宁夏、甘肃、青海、新疆。",
   "originGeo": "中宁枸杞",
   "originNote": "粒大色红，嚼之微甜。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 枸杞子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "gouqizi",
   "trad": "枸杞子"
  },
  {
   "id": "fuling",
   "name": "茯苓",
   "alias": [
    "云苓",
    "白茯苓"
   ],
   "cat": "药食同源",
   "nature": "平",
   "flavor": [
    "甘",
    "淡"
   ],
   "meridians": [
    "心",
    "肺",
    "脾",
    "肾"
   ],
   "effect": [
    "祛湿",
    "健脾",
    "安神"
   ],
   "use": "传统食养用于食欲不振、肢体困重、睡眠不安。",
   "foodUse": "煮粥、炖汤、制饼，常用 10 至 15 克。",
   "caution": [
    "阴虚津少者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区云南、安徽、湖北、湖南。",
   "originGeo": "",
   "originNote": "质坚色白，煮后味淡。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 茯苓",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "fuling",
   "trad": "茯苓"
  },
  {
   "id": "juhua",
   "name": "菊花",
   "alias": [
    "甘菊",
    "杭菊"
   ],
   "cat": "药食同源",
   "nature": "凉",
   "flavor": [
    "甘",
    "苦"
   ],
   "meridians": [
    "肺",
    "肝"
   ],
   "effect": [
    "清热",
    "平肝",
    "明目"
   ],
   "use": "传统食养用于口干、目涩。",
   "foodUse": "泡水代茶，常用 3 至 6 克。",
   "caution": [
    "脾胃虚寒者不宜多饮。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区浙江、安徽、河南、江苏。",
   "originGeo": "杭白菊",
   "originNote": "花朵完整，香气清雅。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 菊花",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "juhua",
   "trad": "菊花"
  },
  {
   "id": "yanggu",
   "name": "羊骨",
   "alias": [
    "羊骨头"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肾"
   ],
   "effect": [
    "温阳",
    "益肾",
    "益气"
   ],
   "use": "传统食养用于畏寒、腰膝乏力、体倦。",
   "foodUse": "熬汤、煮粥，常用 1 副或 200 至 500 克。",
   "caution": [
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、宁夏、甘肃",
   "originGeo": "",
   "originNote": "骨汤味厚，宜先焯水去腥。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛科 羊骨",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yanggu",
   "trad": "羊骨"
  },
  {
   "id": "yangshen",
   "name": "羊肾",
   "alias": [
    "羊腰子",
    "羊腰",
    "羊肾子"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肾"
   ],
   "effect": [
    "补肾",
    "温阳",
    "益气"
   ],
   "use": "传统食养用于腰膝酸软、畏寒、体倦。",
   "foodUse": "煮汤、炒食，常用 1 至 2 只。",
   "caution": [
    "胆固醇含量较高，不宜多食。",
    "高尿酸人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、宁夏、甘肃",
   "originGeo": "",
   "originNote": "宜去筋膜，急火快炒或煮汤。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛科 羊肾",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yangshen",
   "trad": "羊腎"
  },
  {
   "id": "yangdu",
   "name": "羊肚",
   "alias": [
    "羊胃"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "消食"
   ],
   "use": "传统食养用于食少、体倦、脘腹不舒。",
   "foodUse": "炖煮，常用 50 至 100 克。",
   "caution": [
    "内热者不宜多食。",
    "须洗净煮透后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、宁夏、甘肃",
   "originGeo": "",
   "originNote": "须翻洗干净，煮至软熟。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛科 羊肚",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yangdu",
   "trad": "羊肚"
  },
  {
   "id": "mianfen",
   "name": "面粉",
   "alias": [
    "小麦粉",
    "白面"
   ],
   "cat": "谷薯",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "和胃"
   ],
   "use": "传统食养用于体倦、食少。",
   "foodUse": "做面食、煮糊，常用 50 至 150 克。",
   "caution": [
    "麸质过敏者忌食。",
    "控糖人群控制总量。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "河南、山东、河北、安徽",
   "originGeo": "",
   "originNote": "硬质小麦磨面筋力强，软质小麦磨面口感松软。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "谷食类 面",
   "grade": "乙",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "mianfen",
   "trad": "麵粉"
  },
  {
   "id": "douchi",
   "name": "豆豉",
   "alias": [
    "香豉"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和胃",
    "消食",
    "理气"
   ],
   "use": "传统食养用于食欲不振、脘腹不舒。",
   "foodUse": "调味、蒸食，常用 5 至 15 克。",
   "caution": [
    "含盐较高，控盐人群少量使用。",
    "一次不宜过量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "广东、湖南、四川、江西",
   "originGeo": "广东阳江豆豉、湖南浏阳豆豉",
   "originNote": "黑豆或黄豆发酵制成，咸香回甘。",
   "sourceBook": "中华本草",
   "sourceChapter": "淡豆豉",
   "grade": "甲",
   "status": "已核",
   "uncertain": "目录所列为淡豆豉，食用豆豉含盐，二者用法有别，专条待核。",
   "cost": "平价",
   "py": "douchi",
   "trad": "豆豉"
  },
  {
   "id": "juecai",
   "name": "蕨菜",
   "alias": [
    "蕨",
    "蕨儿菜",
    "拳头菜",
    "龙头菜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "胃"
   ],
   "effect": [
    "清热",
    "利湿",
    "消食"
   ],
   "use": "传统食养用于口干、饮食过量、小便偏少。",
   "foodUse": "焯水后炒食、煮汤，常用 50 至 150 克。",
   "caution": [
    "含原蕨苷，须焯水煮熟后食用，不宜长期大量食用。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、安徽、江西、湖南",
   "originGeo": "",
   "originNote": "春季嫩芽入馔，焯水后口感滑嫩。",
   "sourceBook": "中华本草",
   "sourceChapter": "蕨科 蕨",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "juecai",
   "trad": "蕨菜"
  },
  {
   "id": "yurou",
   "name": "鱼肉",
   "alias": [
    "鱼净肉",
    "鲜鱼肉"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "养血"
   ],
   "use": "传统食养用于体倦、食少。",
   "foodUse": "蒸食、煮汤，常用 100 至 200 克。",
   "caution": [
    "鱼过敏者不宜食。",
    "鱼刺须剔净后食用。"
   ],
   "allergens": [
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "各地淡水与海水水域均有",
   "originGeo": "",
   "originNote": "泛指常见食用鱼净肉，具体鱼种随方与当令而定。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "鱼类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "泛指鱼类净肉，具体鱼种随方而定，古籍无专条，性味依常见食用鱼推定，待核。",
   "cost": "平价",
   "py": "yurou",
   "trad": "魚肉"
  },
  {
   "id": "lvdoufenpi",
   "name": "绿豆粉皮",
   "alias": [
    "粉皮",
    "小粉皮"
   ],
   "cat": "豆类",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "和胃",
    "生津"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "煮汤、凉拌、炒食，常用 50 至 100 克。",
   "caution": [
    "控糖人群控制总量。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、河北、安徽",
   "originGeo": "",
   "originNote": "绿豆淀粉制薄片，煮熟后柔滑透明。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "绿豆粉皮为淀粉制品，古籍无专条，性味依绿豆推定，待核。",
   "cost": "平价",
   "py": "lvdoufenpi",
   "trad": "綠豆粉皮"
  },
  {
   "id": "chuncai",
   "name": "莼菜",
   "alias": [
    "蒪菜",
    "水葵",
    "湖菜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "脾"
   ],
   "effect": [
    "清热",
    "利水",
    "和中"
   ],
   "use": "传统食养用于口干、烦热、小便偏少。",
   "foodUse": "煮汤、烩食，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、江苏、江西、云南",
   "originGeo": "浙江西湖莼菜、江苏太湖莼菜",
   "originNote": "嫩芽入汤，口感滑润。",
   "sourceBook": "中华本草",
   "sourceChapter": "睡莲科 莼菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "chuncai",
   "trad": "蓴菜"
  },
  {
   "id": "zisuye",
   "name": "紫苏叶",
   "alias": [
    "紫苏",
    "苏叶",
    "赤苏"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "散寒",
    "理气",
    "和胃"
   ],
   "use": "传统食养用于脘腹不舒、食欲不振、畏寒。",
   "foodUse": "调味、煮汤、泡水，常用 3 至 10 克。",
   "caution": [
    "内热偏盛者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "湖北、湖南、安徽、江苏",
   "originGeo": "",
   "originNote": "叶面绿紫两型，香气依品种而异。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 紫苏叶",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "zisuye",
   "trad": "紫蘇葉"
  },
  {
   "id": "gouqiye",
   "name": "枸杞叶",
   "alias": [
    "枸杞芽",
    "地仙苗",
    "天精草"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "肝",
    "脾"
   ],
   "effect": [
    "清热",
    "生津",
    "明目"
   ],
   "use": "传统食养用于口干、目涩、内热。",
   "foodUse": "焯水凉拌、煮汤、泡茶，常用 30 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "宁夏、甘肃、青海、河北",
   "originGeo": "",
   "originNote": "春采嫩叶与嫩芽，味微苦回甘。",
   "sourceBook": "中华本草",
   "sourceChapter": "茄科 枸杞叶",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "gouqiye",
   "trad": "枸杞葉"
  },
  {
   "id": "xiangcai",
   "name": "香菜",
   "alias": [
    "香荽",
    "胡荽",
    "芜茜"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "醒脾",
    "和胃",
    "透疹"
   ],
   "use": "用于菜肴调味与凉拌佐食。",
   "foodUse": "做汤、凉拌或撒面，常用 10 至 30 克。",
   "caution": [
    "气虚者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "全国大部",
   "originGeo": "",
   "originNote": "以茎叶鲜嫩、香气浓者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "芫荽",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiangcai",
   "trad": "香菜"
  },
  {
   "id": "shengcai",
   "name": "生菜",
   "alias": [
    "叶用莴苣",
    "鹅仔菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "生津",
    "和中"
   ],
   "use": "传统食养用于口干、食欲不振、大便偏干。",
   "foodUse": "生食、凉拌、包肉或涮食，常用 50 至 150 克。",
   "caution": [
    "生食须洗净。",
    "脾胃虚寒者不宜多食生冷。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、山东、河北、云南",
   "originGeo": "",
   "originNote": "叶片青绿、脆嫩者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "生菜为莴苣变种，古本草多附于莴苣条，性味依莴苣推定，待核。",
   "cost": "平价",
   "py": "shengcai",
   "trad": "生菜"
  },
  {
   "id": "xiaobaicai",
   "name": "小白菜",
   "alias": [
    "青菜",
    "鸡毛菜",
    "青梗菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "和中",
    "润肠"
   ],
   "use": "传统食养用于口干、食少、大便干结。",
   "foodUse": "清炒、煮汤、做馅，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "烹前宜逐叶洗净泥沙。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、上海、广东",
   "originGeo": "",
   "originNote": "叶柄青绿、叶片挺括者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "小白菜为白菜类变种，古籍多并入菘菜条，性味依菘菜推定，待核。",
   "cost": "平价",
   "py": "xiaobaicai",
   "trad": "小白菜"
  },
  {
   "id": "youcai",
   "name": "油菜",
   "alias": [
    "芸苔",
    "芸薹",
    "小油菜",
    "油白菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "脾"
   ],
   "effect": [
    "清热",
    "散瘀",
    "利水"
   ],
   "use": "传统食养用于口干、食少、小便不利。",
   "foodUse": "清炒、煮汤，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖南",
   "originGeo": "",
   "originNote": "菜梗青绿、叶片鲜嫩者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "油菜古称芸苔，古本草多以芸苔子入药，叶用条未单列，性味依芸苔推定，待核。",
   "cost": "平价",
   "py": "youcai",
   "trad": "油菜"
  },
  {
   "id": "juanxincai",
   "name": "卷心菜",
   "alias": [
    "甘蓝",
    "包心菜",
    "圆白菜",
    "椰菜"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "清热"
   ],
   "use": "传统食养用于食少、脘腹不舒、口干。",
   "foodUse": "炒食、凉拌、做馅，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生冷。",
    "烹煮过久易失脆嫩。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、江苏、云南",
   "originGeo": "",
   "originNote": "叶球紧实、外叶青绿者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "甘蓝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收甘蓝，条目归属与篇目未核。",
   "cost": "平价",
   "py": "juanxincai",
   "trad": "卷心菜"
  },
  {
   "id": "xilanhua",
   "name": "西兰花",
   "alias": [
    "绿花菜",
    "青花菜",
    "西蓝花"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "消食",
    "益气"
   ],
   "use": "传统食养用于食少、口干、脘腹不舒。",
   "foodUse": "焯水后清炒、凉拌，常用 100 至 200 克。",
   "caution": [
    "焯水时间不宜过长。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、浙江、山东、河北",
   "originGeo": "",
   "originNote": "花球紧实、色深绿者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代传入，古本草未收，性味依甘蓝类推定，待核。",
   "cost": "中等",
   "py": "xilanhua",
   "trad": "西蘭花"
  },
  {
   "id": "huayecai",
   "name": "花椰菜",
   "alias": [
    "菜花",
    "花菜",
    "白花菜"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "清热"
   ],
   "use": "传统食养用于食少、口干、体倦。",
   "foodUse": "焯水后炒食、煮汤，常用 100 至 200 克。",
   "caution": [
    "烹前掰小朵洗净。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "福建、浙江、云南、河北",
   "originGeo": "",
   "originNote": "花球洁白紧实者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代传入，古本草未收，性味依甘蓝类推定，待核。",
   "cost": "中等",
   "py": "huayecai",
   "trad": "花椰菜"
  },
  {
   "id": "ziganlan",
   "name": "紫甘蓝",
   "alias": [
    "紫包菜",
    "红甘蓝",
    "紫洋白菜"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "清热"
   ],
   "use": "传统食养用于食少、口干、大便偏干。",
   "foodUse": "生食凉拌或短时清炒，常用 50 至 150 克。",
   "caution": [
    "生食须洗净。",
    "脾胃虚寒者不宜多食生冷。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、山东、河北、江苏",
   "originGeo": "",
   "originNote": "叶球紧实、色紫红者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代栽培变种，古本草未收，性味依甘蓝推定，待核。",
   "cost": "中等",
   "py": "ziganlan",
   "trad": "紫甘藍"
  },
  {
   "id": "jielan",
   "name": "芥蓝",
   "alias": [
    "芥兰",
    "甘蓝菜",
    "绿叶甘蓝"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "消食",
    "利水"
   ],
   "use": "传统食养用于口干、食少、小便短少。",
   "foodUse": "焯水后白灼、清炒，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、福建、海南",
   "originGeo": "",
   "originNote": "茎粗叶嫩、花薹未开者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "古本草未单列条目，性味依甘蓝类推定，待核。",
   "cost": "平价",
   "py": "jielan",
   "trad": "芥藍"
  },
  {
   "id": "caixin",
   "name": "菜心",
   "alias": [
    "菜薹",
    "菜苔",
    "广东菜心",
    "菜尖"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "和中",
    "利水"
   ],
   "use": "传统食养用于口干、食少、烦热。",
   "foodUse": "白灼、清炒，常用 100 至 200 克。",
   "caution": [
    "烹时不宜过久。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、福建、海南",
   "originGeo": "",
   "originNote": "薹心嫩、叶片小者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "菜心为菜薹嫩梢，古本草未单列条目，性味依芸苔推定，待核。",
   "cost": "平价",
   "py": "caixin",
   "trad": "菜心"
  },
  {
   "id": "youmaicai",
   "name": "油麦菜",
   "alias": [
    "莜麦菜",
    "长叶莴苣"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "生津",
    "润肠"
   ],
   "use": "传统食养用于口干、食欲不振、大便偏干。",
   "foodUse": "清炒、涮食、凉拌，常用 100 至 200 克。",
   "caution": [
    "生食须洗净。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、山东、河北、云南",
   "originGeo": "",
   "originNote": "叶片狭长、脆嫩者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "油麦菜为莴苣变种，古本草未单列条目，性味依莴苣推定，待核。",
   "cost": "平价",
   "py": "youmaicai",
   "trad": "油麥菜"
  },
  {
   "id": "muercai",
   "name": "木耳菜",
   "alias": [
    "落葵",
    "潺菜",
    "胭脂菜",
    "豆腐菜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "心",
    "肝",
    "大肠"
   ],
   "effect": [
    "清热",
    "润燥",
    "润肠"
   ],
   "use": "传统食养用于口干、大便干结、小便短少。",
   "foodUse": "煮汤、清炒，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "大便偏稀者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、福建、四川",
   "originGeo": "",
   "originNote": "叶片肥厚、嫩梢鲜绿者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "落葵",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收落葵，条目归属与篇目未核。",
   "cost": "平价",
   "py": "muercai",
   "trad": "木耳菜"
  },
  {
   "id": "wandoumiao",
   "name": "豌豆苗",
   "alias": [
    "豌豆尖",
    "豆苗"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "清热"
   ],
   "use": "传统食养用于食少、体倦、口干。",
   "foodUse": "清炒、涮食、做汤，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、上海、云南",
   "originGeo": "",
   "originNote": "嫩梢十厘米左右者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "豌豆苗为豌豆嫩苗，古本草未单列条目，性味依豌豆推定，待核。",
   "cost": "中等",
   "py": "wandoumiao",
   "trad": "豌豆苗"
  },
  {
   "id": "suantai",
   "name": "蒜薹",
   "alias": [
    "蒜苔",
    "蒜毫",
    "蒜梗"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "温中",
    "理气",
    "消食"
   ],
   "use": "传统食养用于口淡、食少、脘腹不舒。",
   "foodUse": "炒食、焯水凉拌，常用 50 至 150 克。",
   "caution": [
    "辛温，口舌生疮者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、河北",
   "originGeo": "",
   "originNote": "薹梗脆嫩、花苞未开者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "蒜薹为大蒜花茎，古本草未单列条目，性味依大蒜推定，待核。",
   "cost": "平价",
   "py": "suantai",
   "trad": "蒜薹"
  },
  {
   "id": "suanmiao",
   "name": "蒜苗",
   "alias": [
    "青蒜",
    "蒜叶",
    "大蒜苗"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "温中",
    "理气",
    "消食"
   ],
   "use": "传统食养用于口淡、食少、脘腹不舒。",
   "foodUse": "炒食、作配料，常用 50 至 100 克。",
   "caution": [
    "辛温，内热偏盛者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、河北",
   "originGeo": "",
   "originNote": "叶片鲜绿、假茎白嫩者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "蒜苗为蒜的嫩叶，古本草未单列条目，性味依大蒜推定，待核。",
   "cost": "平价",
   "py": "suanmiao",
   "trad": "蒜苗"
  },
  {
   "id": "xihulu",
   "name": "西葫芦",
   "alias": [
    "夏南瓜",
    "美洲南瓜",
    "角瓜"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "利水",
    "和中"
   ],
   "use": "传统食养用于口干、小便不利、食少。",
   "foodUse": "清炒、做馅、摊饼，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、河南、云南",
   "originGeo": "",
   "originNote": "表皮光滑、瓜体紧实者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代传入，古本草未收，性味依瓜类推定，待核。",
   "cost": "平价",
   "py": "xihulu",
   "trad": "西葫蘆"
  },
  {
   "id": "qiukui",
   "name": "秋葵",
   "alias": [
    "黄秋葵",
    "羊角豆",
    "咖啡黄葵"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "利水",
    "润肠"
   ],
   "use": "传统食养用于口干、大便偏干、小便短少。",
   "foodUse": "焯水后凉拌、清炒，常用 50 至 100 克。",
   "caution": [
    "表面绒毛须洗净。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、海南、云南",
   "originGeo": "",
   "originNote": "果荚嫩绿、以指轻掐易断者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代传入，古本草未收，性味依近人食养之说推定，待核。",
   "cost": "中等",
   "py": "qiukui",
   "trad": "秋葵"
  },
  {
   "id": "sijidou",
   "name": "四季豆",
   "alias": [
    "菜豆",
    "豆角",
    "芸豆角",
    "四月豆"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "消食"
   ],
   "use": "传统食养用于食少、体倦、脘腹不舒。",
   "foodUse": "炒食、焖食，须熟透，常用 100 至 200 克。",
   "caution": [
    "未熟透者不宜食，须充分加热。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、四川、山东、河北",
   "originGeo": "",
   "originNote": "豆荚饱满、折之易断者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "四季豆为菜豆嫩荚，古本草未单列条目，性味依豆类推定，待核。",
   "cost": "平价",
   "py": "sijidou",
   "trad": "四季豆"
  },
  {
   "id": "helandou",
   "name": "荷兰豆",
   "alias": [
    "雪豌豆",
    "甜豆荚"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "清热"
   ],
   "use": "传统食养用于食少、口干、体倦。",
   "foodUse": "清炒、焯水凉拌，常用 100 至 150 克。",
   "caution": [
    "须炒熟后食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、四川、福建、浙江",
   "originGeo": "",
   "originNote": "豆荚扁平、豆粒未鼓者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "荷兰豆为豌豆变种嫩荚，古本草未单列条目，性味依豌豆推定，待核。",
   "cost": "中等",
   "py": "helandou",
   "trad": "荷蘭豆"
  },
  {
   "id": "maodou",
   "name": "毛豆",
   "alias": [
    "枝豆",
    "青豆",
    "大豆嫩荚",
    "菜用大豆"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "和中",
    "清热"
   ],
   "use": "传统食养用于食少、体倦、口干。",
   "foodUse": "盐水煮食、炒食，常用 50 至 100 克。",
   "caution": [
    "须煮熟后食。",
    "一次不宜过量，多食易腹胀。",
    "大豆过敏者忌食。",
    "一次不宜过量，以免腹胀。",
    "高尿酸人群控制总量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "",
   "originNote": "豆荚饱满、色青绿者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "毛豆为大豆嫩荚，古本草未单列条目，性味依大豆推定，待核。",
   "cost": "平价",
   "py": "maodou",
   "trad": "毛豆"
  },
  {
   "id": "tianjiao",
   "name": "甜椒",
   "alias": [
    "菜椒",
    "灯笼椒",
    "青椒"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "消食",
    "和中"
   ],
   "use": "传统食养用于口淡、食少、脘腹不舒。",
   "foodUse": "炒食、生食凉拌，常用 50 至 150 克。",
   "caution": [
    "内热偏盛者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、辽宁、云南",
   "originGeo": "",
   "originNote": "果肉厚、色鲜亮者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "甜椒为辣椒栽培变种，古本草未单列条目，性味依辣椒与近人食养之说推定，待核。",
   "cost": "平价",
   "py": "tianjiao",
   "trad": "甜椒"
  },
  {
   "id": "caijiao",
   "name": "彩椒",
   "alias": [
    "彩色甜椒",
    "水果椒"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "和中",
    "益气",
    "消食"
   ],
   "use": "传统食养用于食少、口干、体倦。",
   "foodUse": "生食凉拌、清炒，常用 50 至 150 克。",
   "caution": [
    "生食须洗净。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、山东、河北、海南",
   "originGeo": "",
   "originNote": "果面光亮、无软斑者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "彩椒为甜椒的彩色栽培类型，古本草未收，成分表是否单列待核。",
   "cost": "中等",
   "py": "caijiao",
   "trad": "彩椒"
  },
  {
   "id": "qingluobo",
   "name": "青萝卜",
   "alias": [
    "青皮萝卜",
    "绿萝卜",
    "卫青萝卜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "理气",
    "消食",
    "生津"
   ],
   "use": "传统食养用于食少、口淡、口干。",
   "foodUse": "生食、凉拌、煮汤，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生冷。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河北、天津、河南",
   "originGeo": "",
   "originNote": "皮青肉脆、掂之沉实者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "青萝卜为萝卜皮色变种，古本草并入莱菔条，性味依莱菔推定，待核。",
   "cost": "平价",
   "py": "qingluobo",
   "trad": "青蘿蔔"
  },
  {
   "id": "yingtaoluobo",
   "name": "樱桃萝卜",
   "alias": [
    "小红萝卜",
    "迷你萝卜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "消食",
    "理气",
    "生津"
   ],
   "use": "传统食养用于食少、口淡、口干。",
   "foodUse": "生食凉拌、蘸酱，常用 50 至 100 克。",
   "caution": [
    "生食须洗净。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、山东、河北、江苏",
   "originGeo": "",
   "originNote": "小球紧实、皮色鲜红者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代选育的小型萝卜，古本草未收，性味依莱菔推定，待核。",
   "cost": "中等",
   "py": "yingtaoluobo",
   "trad": "櫻桃蘿蔔"
  },
  {
   "id": "zhimacai",
   "name": "芝麻菜",
   "alias": [
    "火箭菜",
    "芸芥",
    "紫花芥"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "理气",
    "和中",
    "清热"
   ],
   "use": "传统食养用于食少、脘腹不舒、口干。",
   "foodUse": "生食拌沙拉、佐食，常用 50 至 100 克。",
   "caution": [
    "辛香走散，一次不宜过量。",
    "生食须洗净。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、山东、河北、江苏",
   "originGeo": "",
   "originNote": "叶片鲜嫩、辛香浓者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "芝麻菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代传入，古本草未收，成分表是否单列待核。",
   "cost": "中等",
   "py": "zhimacai",
   "trad": "芝麻菜"
  },
  {
   "id": "kuju",
   "name": "苦苣",
   "alias": [
    "苦菊",
    "苦苣菜"
   ],
   "cat": "蔬菜",
   "nature": "寒",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "肝",
    "胃"
   ],
   "effect": [
    "清热",
    "消食",
    "利水"
   ],
   "use": "传统食养用于口干、食少、小便短少。",
   "foodUse": "生食凉拌、清炒，常用 50 至 150 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "味苦，一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、山东、河北、辽宁",
   "originGeo": "",
   "originNote": "叶片脆嫩、苦味清爽者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "苦苣与菊苣名近，古本草条目归属待核。",
   "cost": "中等",
   "py": "kuju",
   "trad": "苦苣"
  },
  {
   "id": "pielan",
   "name": "苤蓝",
   "alias": [
    "球茎甘蓝",
    "擘蓝",
    "甘蓝球"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "消食",
    "利水",
    "和中"
   ],
   "use": "传统食养用于食少、脘腹不舒、小便不利。",
   "foodUse": "切丝凉拌、清炒、腌渍，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食生冷。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河北、山东、江苏、云南",
   "originGeo": "",
   "originNote": "球茎紧实、皮薄肉脆者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "苤蓝古称擘蓝，古本草条目归属待核。",
   "cost": "平价",
   "py": "pielan",
   "trad": "苤藍"
  },
  {
   "id": "luhao",
   "name": "芦蒿",
   "alias": [
    "蒌蒿",
    "藜蒿",
    "水蒿"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "肝",
    "脾"
   ],
   "effect": [
    "清热",
    "利水",
    "理气"
   ],
   "use": "传统食养用于口干、食少、小便不利。",
   "foodUse": "清炒、炒香干，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、湖北、安徽、江西",
   "originGeo": "江苏南京芦蒿",
   "originNote": "嫩茎青绿、香气浓者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "蒌蒿",
   "grade": "甲",
   "status": "已核",
   "uncertain": "古本草有蒌蒿之名，中华本草条目归属与篇目未核，待核。",
   "cost": "中等",
   "py": "luhao",
   "trad": "蘆蒿"
  },
  {
   "id": "shuiqin",
   "name": "水芹",
   "alias": [
    "水芹菜",
    "楚葵",
    "水英",
    "野芹菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "肺",
    "肝",
    "膀胱"
   ],
   "effect": [
    "清热",
    "利水",
    "平肝"
   ],
   "use": "传统食养用于口干、小便不利、头目不爽。",
   "foodUse": "清炒、焯水凉拌，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "江苏无锡水芹",
   "originNote": "茎嫩色白、香气清者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "水芹",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收水芹，条目归属与篇目未核。",
   "cost": "中等",
   "py": "shuiqin",
   "trad": "水芹"
  },
  {
   "id": "hongshuye",
   "name": "红薯叶",
   "alias": [
    "甘薯叶",
    "番薯叶",
    "地瓜叶"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "益气",
    "和中",
    "润肠"
   ],
   "use": "传统食养用于食少、体倦、大便偏干。",
   "foodUse": "清炒、煮汤，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、福建、四川",
   "originGeo": "",
   "originNote": "嫩梢鲜绿、叶片完整者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "红薯叶为甘薯嫩茎叶，古本草未单列条目，性味依甘薯推定，待核。",
   "cost": "平价",
   "py": "hongshuye",
   "trad": "紅薯葉"
  },
  {
   "id": "foshougua",
   "name": "佛手瓜",
   "alias": [
    "合掌瓜",
    "隼人瓜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "利水",
    "和中"
   ],
   "use": "传统食养用于口干、食少、小便不利。",
   "foodUse": "清炒、煮汤、做馅，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、贵州、福建、广东",
   "originGeo": "",
   "originNote": "瓜皮浅绿、果肉紧实者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代传入，古本草未收，性味依瓜类推定，待核。",
   "cost": "平价",
   "py": "foshougua",
   "trad": "佛手瓜"
  },
  {
   "id": "hugua",
   "name": "瓠瓜",
   "alias": [
    "瓠子",
    "夜开花",
    "扁蒲",
    "葫芦瓜"
   ],
   "cat": "蔬菜",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "利水",
    "除烦"
   ],
   "use": "传统食养用于口干、烦热、小便不利。",
   "foodUse": "清炒、煮汤、做馅，常用 100 至 200 克。",
   "caution": [
    "味苦者不宜食。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、江苏、福建、江西",
   "originGeo": "",
   "originNote": "瓜皮光滑、以指弹之声音脆者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "瓠瓜古称瓠、壶卢，古本草条名不一，性味依瓠类推定，待核。",
   "cost": "平价",
   "py": "hugua",
   "trad": "瓠瓜"
  },
  {
   "id": "malantou",
   "name": "马兰头",
   "alias": [
    "马兰",
    "鸡儿肠",
    "路边菊",
    "田边菊"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "肺",
    "肝"
   ],
   "effect": [
    "清热",
    "利湿",
    "散瘀"
   ],
   "use": "传统食养用于口干、目赤、小便不利。",
   "foodUse": "焯水后凉拌、清炒，常用 50 至 150 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、江西",
   "originGeo": "江苏南京马兰头",
   "originNote": "嫩梢青绿、香气清者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "马兰",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收马兰，条目归属与篇目未核。",
   "cost": "中等",
   "py": "malantou",
   "trad": "馬蘭頭"
  },
  {
   "id": "niubang",
   "name": "牛蒡",
   "alias": [
    "牛蒡根",
    "东洋参"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "苦",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "利咽",
    "润肠"
   ],
   "use": "传统食养用于口干、咽部不爽、大便偏干。",
   "foodUse": "煮汤、清炒、凉拌，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、江苏、河北、河南",
   "originGeo": "",
   "originNote": "根条匀直、皮色淡褐者为佳。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛蒡根",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草收牛蒡根，食用部位同条，篇目未核。",
   "cost": "中等",
   "py": "niubang",
   "trad": "牛蒡"
  },
  {
   "id": "jiuhuang",
   "name": "韭黄",
   "alias": [
    "黄韭",
    "韭芽",
    "黄韭菜"
   ],
   "cat": "蔬菜",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肝",
    "胃",
    "肾"
   ],
   "effect": [
    "温中",
    "理气",
    "消食"
   ],
   "use": "传统食养用于口淡、食少、脘腹不舒。",
   "foodUse": "清炒、做馅、炒蛋，常用 50 至 150 克。",
   "caution": [
    "内热偏盛者不宜多食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、河北",
   "originGeo": "",
   "originNote": "叶色金黄、假茎白嫩者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "韭黄为韭菜软化栽培品，古本草未单列条目，性味依韭菜推定，待核。",
   "cost": "中等",
   "py": "jiuhuang",
   "trad": "韭黃"
  },
  {
   "id": "xiyangcai",
   "name": "西洋菜",
   "alias": [
    "豆瓣菜",
    "水田芥",
    "无心菜"
   ],
   "cat": "蔬菜",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "膀胱"
   ],
   "effect": [
    "清热",
    "润肺",
    "利水"
   ],
   "use": "传统食养用于口干、咽部不爽、小便不利。",
   "foodUse": "煮汤、清炒，常用 100 至 200 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "生食须洗净。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、福建、云南",
   "originGeo": "",
   "originNote": "嫩梢青绿、茎脆者为佳。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "蔬菜类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "西洋菜即豆瓣菜，古本草条目归属待核。",
   "cost": "平价",
   "py": "xiyangcai",
   "trad": "西洋菜"
  },
  {
   "id": "caomei",
   "name": "草莓",
   "alias": [
    "洋莓",
    "地莓"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "生津",
    "健脾",
    "润肺"
   ],
   "use": "传统食养用于口干、食欲欠佳。",
   "foodUse": "鲜食或制果酱，常用 100 至 200 克。",
   "caution": [
    "果面柔嫩易碰伤，食前充分冲洗。",
    "脾胃虚寒者不宜多食生冷。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区辽宁、河北、山东、江苏、浙江。",
   "originGeo": "丹东草莓",
   "originNote": "果面柔嫩，香气随品种而异，宜鲜食。",
   "sourceBook": "中华本草",
   "sourceChapter": "草莓",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有草莓条，科属与篇目未核。",
   "cost": "较高",
   "py": "caomei",
   "trad": "草莓"
  },
  {
   "id": "mangguo",
   "name": "芒果",
   "alias": [
    "杧果",
    "望果",
    "蜜望子",
    "庵罗果"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "胃",
    "脾"
   ],
   "effect": [
    "生津",
    "和胃",
    "润肺"
   ],
   "use": "传统食养用于口渴、食少、咽干。",
   "foodUse": "去皮鲜食，常用 100 至 200 克。",
   "caution": [
    "果皮汁液易致口周不适，宜切块食用。",
    "对芒果过敏者避免食用。"
   ],
   "allergens": [
    "芒果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区海南、广西、云南、广东、四川。",
   "originGeo": "三亚芒果",
   "originNote": "果肉橙黄，香气浓，熟后甜软。",
   "sourceBook": "中华本草",
   "sourceChapter": "杧果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草正条作杧果，科属与篇目未核。",
   "cost": "中等",
   "py": "mangguo",
   "trad": "芒果"
  },
  {
   "id": "boluo",
   "name": "菠萝",
   "alias": [
    "凤梨",
    "黄梨",
    "王梨"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "消食",
    "生津",
    "和胃"
   ],
   "use": "传统食养用于食少、口干。",
   "foodUse": "去皮盐水浸后鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉含蛋白酶，口腔易刺痒者少量。",
    "对菠萝过敏者避免食用。"
   ],
   "allergens": [
    "菠萝"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区广东、海南、广西、福建、云南。",
   "originGeo": "徐闻菠萝",
   "originNote": "果肉带纤维，酸香明显，盐水浸后口感较柔。",
   "sourceBook": "中华本草",
   "sourceChapter": "菠萝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有菠萝条，科属与篇目未核。",
   "cost": "平价",
   "py": "boluo",
   "trad": "菠蘿"
  },
  {
   "id": "mugua",
   "name": "木瓜",
   "alias": [
    "皱皮木瓜",
    "宣木瓜",
    "贴梗海棠"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "酸"
   ],
   "meridians": [
    "肝",
    "脾"
   ],
   "effect": [
    "平肝",
    "和胃",
    "化湿"
   ],
   "use": "传统食养用于食少脘胀、筋脉不舒。",
   "foodUse": "蒸食、炖汤或制蜜饯，常用 100 至 200 克。",
   "caution": [
    "药用木瓜果实质硬味酸涩，宜加工后食用。",
    "胃酸过多者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产区安徽、湖北、四川、云南、浙江。",
   "originGeo": "宣木瓜",
   "originNote": "药用木瓜果实质硬味酸涩，多切片晒干或制蜜饯。",
   "sourceBook": "中华本草",
   "sourceChapter": "木瓜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草木瓜为蔷薇科皱皮木瓜，与番木瓜非同一物。",
   "cost": "中等",
   "py": "mugua",
   "trad": "木瓜"
  },
  {
   "id": "huolongguo",
   "name": "火龙果",
   "alias": [
    "红龙果",
    "青龙果",
    "仙蜜果"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "清热",
    "生津",
    "润肠"
   ],
   "use": "传统食养用于口干、肠燥不畅。",
   "foodUse": "去皮鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉含细小种子，肠易不适者少量。",
    "果皮不食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广西、广东、海南、云南、贵州。",
   "originGeo": "南宁火龙果",
   "originNote": "果肉有白、红两色，种子细小可食。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收火龙果，性味归经本草未单列条目。",
   "cost": "中等",
   "py": "huolongguo",
   "trad": "火龍果"
  },
  {
   "id": "lanmei",
   "name": "蓝莓",
   "alias": [
    "蓝梅",
    "笃斯"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "生津",
    "健脾",
    "润肠"
   ],
   "use": "传统食养用于口干、食欲欠佳。",
   "foodUse": "鲜食或制果酱，常用 100 至 200 克。",
   "caution": [
    "果面白霜为自然果粉，食前冲洗。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、辽宁、云南、贵州、吉林。",
   "originGeo": "长白山蓝莓",
   "originNote": "果粉白霜明显，酸甜依品种而异。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收蓝莓，本草未立条目。",
   "cost": "较高",
   "py": "lanmei",
   "trad": "藍莓"
  },
  {
   "id": "shumei",
   "name": "树莓",
   "alias": [
    "山莓",
    "木莓",
    "红树莓"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "生津",
    "益肾",
    "收敛"
   ],
   "use": "传统食养用于口干、食少。",
   "foodUse": "鲜食或制果酱，常用 100 至 200 克。",
   "caution": [
    "果肉柔嫩易碎，宜轻洗后鲜食。",
    "对莓类过敏者避免食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区辽宁、黑龙江、山东、云南。",
   "originGeo": "尚志树莓",
   "originNote": "果肉柔嫩易碎，熟后酸甜。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收树莓，本草未立条目。",
   "cost": "较高",
   "py": "shumei",
   "trad": "樹莓"
  },
  {
   "id": "heimei",
   "name": "黑莓",
   "alias": [
    "黑刺莓",
    "露莓"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "生津",
    "润肠",
    "收敛"
   ],
   "use": "传统食养用于口干、肠燥。",
   "foodUse": "鲜食或制果酱，常用 100 至 200 克。",
   "caution": [
    "果肉柔嫩易损，宜鲜食。",
    "对莓类过敏者避免食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区江苏、山东、云南、贵州。",
   "originGeo": "溧水黑莓",
   "originNote": "果色深紫近黑，熟后甜酸。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收黑莓，本草未立条目。",
   "cost": "较高",
   "py": "heimei",
   "trad": "黑莓"
  },
  {
   "id": "manyuemei",
   "name": "蔓越莓",
   "alias": [
    "小红莓",
    "蔓越橘"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "酸",
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "生津",
    "利水",
    "和胃"
   ],
   "use": "传统食养用于口干、食欲欠佳。",
   "foodUse": "鲜食或制果干，常用 100 至 200 克。",
   "caution": [
    "酸味重，多制果干或果汁。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区黑龙江、吉林，市场多见进口。",
   "originGeo": "抚远蔓越莓",
   "originNote": "果味酸，鲜果少食，多制果干或果汁。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "中国食物成分表第6版是否单列蔓越莓未核，性味依莓类推定，待核。",
   "cost": "较高",
   "py": "manyuemei",
   "trad": "蔓越莓"
  },
  {
   "id": "liulian",
   "name": "榴莲",
   "alias": [
    "榴梿",
    "麝香猫果"
   ],
   "cat": "果品",
   "nature": "热",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "益气",
    "健脾"
   ],
   "use": "传统食养用于畏寒、食少。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "气味浓烈，一次不宜过量。",
    "与酒同食易不适。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "市场多见泰国、马来西亚进口，海南、广东有栽培。",
   "originGeo": "",
   "originNote": "果肉软糯，气味浓烈，品种间甜度有别。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收榴莲，本草未立条目。",
   "cost": "较高",
   "py": "liulian",
   "trad": "榴槤"
  },
  {
   "id": "shanzhu",
   "name": "山竹",
   "alias": [
    "莽吉柿",
    "倒捻子"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "除烦"
   ],
   "use": "传统食养用于口干、烦热不适。",
   "foodUse": "剥壳鲜食，常用 100 至 200 克。",
   "caution": [
    "性凉，脾胃虚寒者不宜多食。",
    "果壳汁液易染色。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "市场多见泰国、越南进口，海南、广东有引种。",
   "originGeo": "",
   "originNote": "果壳厚，果肉瓣状洁白，甜中带微酸。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收山竹，本草未立条目。",
   "cost": "较高",
   "py": "shanzhu",
   "trad": "山竹"
  },
  {
   "id": "yezi",
   "name": "椰子",
   "alias": [
    "越王头",
    "椰树果"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "脾",
    "肾"
   ],
   "effect": [
    "健脾",
    "益肾",
    "益气"
   ],
   "use": "传统食养用于口干、食少乏力。",
   "foodUse": "饮椰汁、食椰肉，常用 100 至 200 克。",
   "caution": [
    "椰汁性凉，脾胃虚寒者少量。",
    "椰肉含油较多，一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区海南、广东、广西、云南。",
   "originGeo": "文昌椰子",
   "originNote": "椰汁清甜，椰肉厚实，老嫩不同。",
   "sourceBook": "中华本草",
   "sourceChapter": "椰子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草椰子条未列归经，归经依补脾益肾功用推定。",
   "cost": "中等",
   "py": "yezi",
   "trad": "椰子"
  },
  {
   "id": "niuyouguo",
   "name": "牛油果",
   "alias": [
    "鳄梨",
    "油梨",
    "酪梨"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "润燥",
    "健脾",
    "益肾"
   ],
   "use": "传统食养用于口干、肠燥。",
   "foodUse": "鲜食或制沙拉，常用 100 至 200 克。",
   "caution": [
    "含脂较多，一次不宜过量。",
    "未熟果肉硬涩，宜放软后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "市场多见秘鲁、智利、墨西哥进口，云南、广西、海南有引种。",
   "originGeo": "",
   "originNote": "果肉油润，生食味淡，宜配调味。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收牛油果（鳄梨），本草未立条目。",
   "cost": "较高",
   "py": "niuyouguo",
   "trad": "牛油果"
  },
  {
   "id": "ningmeng",
   "name": "柠檬",
   "alias": [
    "黎檬",
    "洋柠檬"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "酸",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "和胃"
   ],
   "use": "传统食养用于口干、食欲欠佳。",
   "foodUse": "切片泡水或调味，常用 100 至 200 克。",
   "caution": [
    "酸味强，胃酸过多者少量。",
    "饮柠檬水后宜漱口。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区四川、云南、广东、广西。",
   "originGeo": "安岳柠檬",
   "originNote": "果皮香气浓，果肉极酸，多作调味。",
   "sourceBook": "中华本草",
   "sourceChapter": "柠檬",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草柠檬条原植物为黎檬或柠檬，篇目未核。",
   "cost": "中等",
   "py": "ningmeng",
   "trad": "檸檬"
  },
  {
   "id": "qingning",
   "name": "青柠",
   "alias": [
    "来檬",
    "绿柠檬",
    "酸柠檬"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "酸",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "和胃"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "切片泡水或调味，常用 100 至 200 克。",
   "caution": [
    "酸味强，胃酸过多者少量。",
    "果皮食前洗净。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区云南、海南、广东，市场多见进口。",
   "originGeo": "",
   "originNote": "果皮青绿，酸香清冽，多作饮品调味。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "青柠与柠檬、来檬名实易混，成分表是否单列未核，待核。",
   "cost": "中等",
   "py": "qingning",
   "trad": "青檸"
  },
  {
   "id": "putaoyou",
   "name": "葡萄柚",
   "alias": [
    "西柚"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "酸",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "消食"
   ],
   "use": "传统食养用于口干、食少。",
   "foodUse": "鲜食或榨汁，常用 100 至 200 克。",
   "caution": [
    "酸味强，胃酸过多者少量。",
    "果肉带苦味，依品种而异。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、广东、广西，市场多见进口。",
   "originGeo": "",
   "originNote": "果肉多汁，甜中带苦酸，有白肉红肉之分。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收葡萄柚，与柚分列。",
   "cost": "中等",
   "py": "putaoyou",
   "trad": "葡萄柚"
  },
  {
   "id": "jinju",
   "name": "金橘",
   "alias": [
    "金桔",
    "金弹",
    "金柑"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "辛",
    "甘"
   ],
   "meridians": [
    "肺"
   ],
   "effect": [
    "理气",
    "化痰",
    "消食"
   ],
   "use": "传统食养用于胸闷、食少。",
   "foodUse": "连皮鲜食或制蜜饯，常用 100 至 200 克。",
   "caution": [
    "多连皮食用，食前洗净。",
    "胃酸过多者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区浙江、江西、福建、湖南、广西。",
   "originGeo": "遂川金橘",
   "originNote": "果小皮薄，多连皮食用，香气浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "金橘",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草金橘条含金橘、金弹、金柑，篇目未核。",
   "cost": "中等",
   "py": "jinju",
   "trad": "金橘"
  },
  {
   "id": "shatangju",
   "name": "砂糖橘",
   "alias": [
    "沙糖橘",
    "十月橘",
    "冰糖橘"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "理气",
    "润肺"
   ],
   "use": "传统食养用于口干、食欲不振。",
   "foodUse": "剥皮鲜食，常用 100 至 200 克。",
   "caution": [
    "一次不宜过量。",
    "果皮汁液易染色。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广西、广东、江西、湖南。",
   "originGeo": "四会砂糖橘",
   "originNote": "果小易剥，甜度高，酸味轻。",
   "sourceBook": "中华本草",
   "sourceChapter": "橘",
   "grade": "甲",
   "status": "已核",
   "uncertain": "砂糖橘为橘的栽培品种，中华本草只列橘条，品种未单列。",
   "cost": "平价",
   "py": "shatangju",
   "trad": "砂糖橘"
  },
  {
   "id": "hamigua",
   "name": "哈密瓜",
   "alias": [
    "新疆甜瓜",
    "蜜瓜"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "解暑"
   ],
   "use": "传统食养用于口干、暑热烦渴。",
   "foodUse": "去皮鲜食，常用 100 至 200 克。",
   "caution": [
    "性寒，脾胃虚寒者不宜多食。",
    "切开后冷藏不宜久放。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、甘肃、内蒙古。",
   "originGeo": "新疆哈密",
   "originNote": "果肉厚实，甜香浓，网纹与光皮品种有别。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收哈密瓜，与甜瓜分列。",
   "cost": "中等",
   "py": "hamigua",
   "trad": "哈密瓜"
  },
  {
   "id": "xianggua",
   "name": "香瓜",
   "alias": [
    "薄皮甜瓜",
    "绿皮香瓜",
    "酥瓜"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "除烦"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "去皮去瓤鲜食，常用 100 至 200 克。",
   "caution": [
    "性寒，脾胃虚寒者不宜多食。",
    "果肉性脆，宜鲜食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、河北、河南、江苏。",
   "originGeo": "阎良甜瓜",
   "originNote": "薄皮甜瓜，果肉脆或软，香气清甜。",
   "sourceBook": "中华本草",
   "sourceChapter": "甜瓜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "香瓜为薄皮甜瓜，已见甜瓜条别名；本表另立条目以便检索，性味依中华本草甜瓜条。",
   "cost": "平价",
   "py": "xianggua",
   "trad": "香瓜"
  },
  {
   "id": "baixiangguo",
   "name": "百香果",
   "alias": [
    "鸡蛋果",
    "西番莲果",
    "热情果"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "心",
    "大肠"
   ],
   "effect": [
    "生津",
    "润肺",
    "安神"
   ],
   "use": "传统食养用于口干、心烦不宁。",
   "foodUse": "取瓤泡水或调味，常用 100 至 200 克。",
   "caution": [
    "酸味强，胃酸过多者少量。",
    "籽可食，嚼碎更佳。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广西、福建、广东、云南、海南。",
   "originGeo": "北流百香果",
   "originNote": "果瓤多汁带籽，酸香浓，多取瓤调味。",
   "sourceBook": "中华本草",
   "sourceChapter": "鸡蛋果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草正条作鸡蛋果，科属与篇目未核。",
   "cost": "中等",
   "py": "baixiangguo",
   "trad": "百香果"
  },
  {
   "id": "fanshiliu",
   "name": "番石榴",
   "alias": [
    "芭乐",
    "鸡矢果",
    "番桃"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "涩"
   ],
   "meridians": [
    "脾",
    "大肠"
   ],
   "effect": [
    "健脾",
    "消食",
    "收敛"
   ],
   "use": "传统食养用于食少、便溏。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉较硬，消化弱者少量。",
    "便秘者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、广西、福建、海南、云南。",
   "originGeo": "",
   "originNote": "果肉脆或软，香气特殊，有白肉红肉之分。",
   "sourceBook": "中华本草",
   "sourceChapter": "番石榴",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草番石榴条未列归经，归经依健脾涩肠功用推定。",
   "cost": "平价",
   "py": "fanshiliu",
   "trad": "番石榴"
  },
  {
   "id": "yangtao",
   "name": "杨桃",
   "alias": [
    "阳桃",
    "五敛子",
    "洋桃"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "酸",
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "利水"
   ],
   "use": "传统食养用于口干、咽干。",
   "foodUse": "鲜食或榨汁，常用 100 至 200 克。",
   "caution": [
    "果棱与果皮需洗净。",
    "肾功能不佳者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、广西、福建、海南、云南。",
   "originGeo": "",
   "originNote": "果有五棱，横切呈星形，酸甜多汁。",
   "sourceBook": "中华本草",
   "sourceChapter": "阳桃",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草正条作阳桃，篇目未核。",
   "cost": "中等",
   "py": "yangtao",
   "trad": "楊桃"
  },
  {
   "id": "lianwu",
   "name": "莲雾",
   "alias": [
    "洋蒲桃",
    "爪哇蒲桃",
    "水蒲桃"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "生津",
    "清热",
    "利水"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉水分多，宜鲜食。",
    "脾胃虚寒者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区台湾、海南、广东、福建。",
   "originGeo": "屏东莲雾",
   "originNote": "果呈钟形，果肉海绵质，水分多。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收莲雾（洋蒲桃），本草未立条目。",
   "cost": "较高",
   "py": "lianwu",
   "trad": "蓮霧"
  },
  {
   "id": "shijia",
   "name": "释迦",
   "alias": [
    "番荔枝",
    "佛头果",
    "释迦果"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "清热",
    "和胃"
   ],
   "use": "传统食养用于食少、口干。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉甜软，一次不宜过量。",
    "种子不可食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区台湾、海南、广东、广西、云南。",
   "originGeo": "台东释迦",
   "originNote": "果肉乳白软甜，种子黑色，宜熟软后食。",
   "sourceBook": "中华本草",
   "sourceChapter": "番荔枝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草正条作番荔枝，科属与篇目未核。",
   "cost": "较高",
   "py": "shijia",
   "trad": "釋迦"
  },
  {
   "id": "huangpi",
   "name": "黄皮",
   "alias": [
    "黄皮果",
    "黄弹子",
    "正气果"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "辛",
    "甘",
    "酸"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "理气",
    "消食",
    "化痰"
   ],
   "use": "传统食养用于食少、脘腹胀满。",
   "foodUse": "连皮鲜食或制蜜饯，常用 100 至 200 克。",
   "caution": [
    "酸味重，胃酸过多者少量。",
    "连皮食前洗净。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区广东、广西、海南、福建。",
   "originGeo": "郁南黄皮",
   "originNote": "果小皮薄，酸甜带特殊香气，多连皮食。",
   "sourceBook": "中华本草",
   "sourceChapter": "黄皮果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草正条作黄皮果；另有黄皮条为长圆叶梾木树皮，非本品。",
   "cost": "中等",
   "py": "huangpi",
   "trad": "黃皮"
  },
  {
   "id": "boluomi",
   "name": "菠萝蜜",
   "alias": [
    "波罗蜜",
    "木波罗",
    "树波罗"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘",
    "酸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "生津",
    "除烦",
    "健脾"
   ],
   "use": "传统食养用于口干、心烦。",
   "foodUse": "取果肉鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉黏手，宜戴手套取食。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区海南、广东、广西、云南、福建。",
   "originGeo": "",
   "originNote": "果大，果肉金黄，香气浓，种子可煮食。",
   "sourceBook": "中华本草",
   "sourceChapter": "菠萝蜜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草正条作菠萝蜜，又名波罗蜜，篇目未核。",
   "cost": "中等",
   "py": "boluomi",
   "trad": "菠蘿蜜"
  },
  {
   "id": "renshenguo",
   "name": "人参果",
   "alias": [
    "香瓜茄",
    "南美香瓜茄",
    "长寿果"
   ],
   "cat": "果品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "生津",
    "健脾",
    "益气"
   ],
   "use": "传统食养用于口干、食少。",
   "foodUse": "鲜食，常用 100 至 200 克。",
   "caution": [
    "果肉清甜，一次不宜过量。",
    "未熟果味淡，宜熟后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区甘肃、云南、四川、山东。",
   "originGeo": "武威人参果",
   "originNote": "果肉清甜多汁，成熟后皮色转黄。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收人参果（香瓜茄）；中华本草人参果条为兰科角盘兰，同名异物。",
   "cost": "中等",
   "py": "renshenguo",
   "trad": "人參果"
  },
  {
   "id": "fanmugua",
   "name": "番木瓜",
   "alias": [
    "乳瓜",
    "万寿果"
   ],
   "cat": "果品",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "消食",
    "化湿",
    "通络"
   ],
   "use": "传统食养用于食少、脘腹胀。",
   "foodUse": "去皮去籽鲜食或炖汤，常用 100 至 200 克。",
   "caution": [
    "未熟果含乳汁，宜熟后食用。",
    "对番木瓜过敏者避免食用。"
   ],
   "allergens": [
    "番木瓜"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区广东、广西、海南、云南、福建。",
   "originGeo": "",
   "originNote": "果肉橙红或橙黄，熟后软甜，未熟可作菜。",
   "sourceBook": "中华本草",
   "sourceChapter": "番木瓜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草番木瓜条未列归经，归经依消食化湿功用推定。",
   "cost": "平价",
   "py": "fanmugua",
   "trad": "番木瓜"
  },
  {
   "id": "cili",
   "name": "刺梨",
   "alias": [
    "缫丝花",
    "送春归"
   ],
   "cat": "果品",
   "nature": "凉",
   "flavor": [
    "甘",
    "酸",
    "涩"
   ],
   "meridians": [
    "脾",
    "肾",
    "胃"
   ],
   "effect": [
    "健脾",
    "消食",
    "解暑"
   ],
   "use": "传统食养用于食少、口干。",
   "foodUse": "鲜食或制果汁，常用 100 至 200 克。",
   "caution": [
    "酸涩，多制汁或果干。",
    "胃酸过多者少量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区贵州、四川、云南、湖南。",
   "originGeo": "贵州刺梨",
   "originNote": "果面有刺，味酸涩，多制汁或果干。",
   "sourceBook": "中华本草",
   "sourceChapter": "刺梨",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有刺梨条，科属与篇目未核。",
   "cost": "中等",
   "py": "cili",
   "trad": "刺梨"
  },
  {
   "id": "bailangua",
   "name": "白兰瓜",
   "alias": [
    "兰州蜜瓜",
    "白兰甜瓜"
   ],
   "cat": "果品",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "胃"
   ],
   "effect": [
    "清热",
    "生津",
    "解暑"
   ],
   "use": "传统食养用于口干、暑热不适。",
   "foodUse": "去皮去瓤鲜食，常用 100 至 200 克。",
   "caution": [
    "性寒，脾胃虚寒者不宜多食。",
    "切开后不宜久放。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区甘肃、内蒙古、新疆。",
   "originGeo": "兰州白兰瓜",
   "originNote": "果皮黄白，果肉清甜多汁。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "水果类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中国食物成分表第6版收白兰瓜，为甜瓜类栽培品种。",
   "cost": "中等",
   "py": "bailangua",
   "trad": "白蘭瓜"
  },
  {
   "id": "zhuxue",
   "name": "猪血",
   "alias": [
    "猪红"
   ],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "心",
    "肝"
   ],
   "effect": [
    "养血",
    "养心",
    "安神"
   ],
   "use": "传统食养用于血虚面色少华、心悸不宁、睡眠不安的日常调理。",
   "foodUse": "煮汤、炒食或涮火锅，常用 50 至 150 克。",
   "caution": [
    "血制品须充分加热熟透后食用。",
    "一次不宜过量，以免腹胀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "四川、河南、山东、江苏",
   "originGeo": "",
   "originNote": "凝固后质地细嫩，多用于煮汤、炒食。",
   "sourceBook": "中华本草",
   "sourceChapter": "猪血",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有猪血条，科属与篇目未核。",
   "cost": "平价",
   "py": "zhuxue",
   "trad": "豬血"
  },
  {
   "id": "yaxue",
   "name": "鸭血",
   "alias": [],
   "cat": "禽蛋",
   "nature": "凉",
   "flavor": [
    "咸"
   ],
   "meridians": [
    "肝",
    "脾"
   ],
   "effect": [
    "养血",
    "清热"
   ],
   "use": "传统食养用于血虚面色少华、内热口干的日常调理。",
   "foodUse": "煮汤、炒食或涮火锅，常用 50 至 150 克。",
   "caution": [
    "血制品须充分加热熟透后食用。",
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、湖北",
   "originGeo": "",
   "originNote": "质地细嫩，常见于鸭血粉丝汤等菜肴。",
   "sourceBook": "中华本草",
   "sourceChapter": "鸭血",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鸭血条，性味咸凉，科属与篇目未核。",
   "cost": "平价",
   "py": "yaxue",
   "trad": "鴨血"
  },
  {
   "id": "jigan",
   "name": "鸡肝",
   "alias": [
    "鸡肝脏"
   ],
   "cat": "禽蛋",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "肝",
    "肾"
   ],
   "effect": [
    "养肝",
    "养血",
    "明目"
   ],
   "use": "传统食养用于肝血不足、眼目干涩、视物易疲的日常调理。",
   "foodUse": "切片焯水后快炒或煮汤，常用 50 至 150 克。",
   "caution": [
    "胆固醇含量较高，不宜多食。",
    "须充分加热熟透后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、四川",
   "originGeo": "",
   "originNote": "质地细嫩，宜快炒或煮汤。",
   "sourceBook": "中华本草",
   "sourceChapter": "鸡肝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鸡肝条，科属与篇目未核。",
   "cost": "平价",
   "py": "jigan",
   "trad": "雞肝"
  },
  {
   "id": "yagan",
   "name": "鸭肝",
   "alias": [
    "鸭肝脏"
   ],
   "cat": "禽蛋",
   "nature": "凉",
   "flavor": [
    "甘",
    "苦"
   ],
   "meridians": [
    "肝"
   ],
   "effect": [
    "养肝",
    "养血",
    "明目"
   ],
   "use": "传统食养用于肝血不足、眼目干涩、面色少华的日常调理。",
   "foodUse": "卤煮、快炒或煮汤，常用 50 至 150 克。",
   "caution": [
    "胆固醇含量较高，不宜多食。",
    "须充分加热熟透后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、湖北、广东",
   "originGeo": "",
   "originNote": "质地肥嫩，宜卤、炒或煮汤。",
   "sourceBook": "中华本草",
   "sourceChapter": "鸭肝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鸭肝条，科属与篇目未核。",
   "cost": "中等",
   "py": "yagan",
   "trad": "鴨肝"
  },
  {
   "id": "jizhen",
   "name": "鸡胗",
   "alias": [
    "鸡肫",
    "鸡胃"
   ],
   "cat": "禽蛋",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "消食",
    "和胃"
   ],
   "use": "传统食养用于食欲不振、食后腹胀的日常调理。",
   "foodUse": "卤煮、爆炒或炖汤，常用 50 至 150 克。",
   "caution": [
    "质地较韧，须充分煮熟。",
    "内脏含胆固醇较高，适量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、四川",
   "originGeo": "",
   "originNote": "肉质紧实，宜卤煮或爆炒。",
   "sourceBook": "中华本草",
   "sourceChapter": "鸡胗",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鸡胗条，科属与篇目未核。",
   "cost": "中等",
   "py": "jizhen",
   "trad": "雞胗"
  },
  {
   "id": "niunan",
   "name": "牛腩",
   "alias": [
    "牛腹肉"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "养血"
   ],
   "use": "传统食养用于脾胃虚弱、气血不足、体倦乏力的日常调理。",
   "foodUse": "切块炖煮或红烧，常用 50 至 150 克。",
   "caution": [
    "脂肪较多，宜久炖并撇去浮油。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、甘肃、河南",
   "originGeo": "",
   "originNote": "筋膜与脂肪相间，宜慢火久炖。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 牛肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "牛腩为牛肉部位，古籍按牛肉条统论。",
   "cost": "较高",
   "py": "niunan",
   "trad": "牛腩"
  },
  {
   "id": "niujian",
   "name": "牛腱",
   "alias": [
    "牛腱子"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "养血"
   ],
   "use": "传统食养用于脾胃虚弱、体倦乏力、筋骨酸软的日常调理。",
   "foodUse": "卤煮后切片或炖汤，常用 50 至 150 克。",
   "caution": [
    "筋膜丰富，宜久炖或卤煮。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、甘肃、山东",
   "originGeo": "",
   "originNote": "筋膜丰富，卤煮后切片，口感紧实。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 牛肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "牛腱为牛肉部位，古籍按牛肉条统论。",
   "cost": "较高",
   "py": "niujian",
   "trad": "牛腱"
  },
  {
   "id": "yangpai",
   "name": "羊排",
   "alias": [
    "羊肋排"
   ],
   "cat": "畜肉",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "温阳",
    "益气",
    "养血"
   ],
   "use": "传统食养用于畏寒、手足不温、体倦乏力的日常调理。",
   "foodUse": "烤制、炖煮或红烧，常用 50 至 150 克。",
   "caution": [
    "脂肪较多，宜烤制或炖煮并撇去浮油。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、新疆、宁夏、甘肃",
   "originGeo": "",
   "originNote": "带骨带脂，宜烤、炖或红烧。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 羊肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "羊排为羊肉部位，古籍按羊肉条统论。",
   "cost": "较高",
   "py": "yangpai",
   "trad": "羊排"
  },
  {
   "id": "zhupaigu",
   "name": "猪排骨",
   "alias": [
    "排骨",
    "猪肋排"
   ],
   "cat": "畜肉",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "益气",
    "养血",
    "生津"
   ],
   "use": "传统食养用于体倦乏力、面色少华、口干少津的日常调理。",
   "foodUse": "炖汤、红烧或蒸制，常用 50 至 150 克。",
   "caution": [
    "骨肉带脂，炖汤宜撇去浮油。",
    "湿热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "四川、河南、山东、湖南",
   "originGeo": "",
   "originNote": "骨肉相连，宜炖汤、红烧或蒸制。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 猪肉",
   "grade": "乙",
   "status": "已核",
   "uncertain": "猪排骨为猪肉带骨部位，古籍按猪肉条统论。",
   "cost": "中等",
   "py": "zhupaigu",
   "trad": "豬排骨"
  },
  {
   "id": "jichi",
   "name": "鸡翅",
   "alias": [
    "鸡翅膀"
   ],
   "cat": "禽蛋",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "温中"
   ],
   "use": "传统食养用于体倦乏力、畏寒、食欲欠佳的日常调理。",
   "foodUse": "烤制、卤煮或炖汤，常用 50 至 150 克。",
   "caution": [
    "皮脂较多，烤制时避免焦糊。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、广东",
   "originGeo": "",
   "originNote": "皮脂较多，宜烤、卤或炖。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鸡",
   "grade": "乙",
   "status": "已核",
   "uncertain": "鸡翅为鸡肉部位，古籍按鸡条统论。",
   "cost": "中等",
   "py": "jichi",
   "trad": "雞翅"
  },
  {
   "id": "jitui",
   "name": "鸡腿",
   "alias": [
    "鸡大腿",
    "琵琶腿"
   ],
   "cat": "禽蛋",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "温中"
   ],
   "use": "传统食养用于体倦乏力、畏寒、食少的日常调理。",
   "foodUse": "烤制、卤煮或炖煮，常用 50 至 150 克。",
   "caution": [
    "肉质较厚，须充分加热熟透。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "山东、河南、江苏、广东",
   "originGeo": "",
   "originNote": "肉厚紧实，宜烤、卤或炖煮。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鸡",
   "grade": "乙",
   "status": "已核",
   "uncertain": "鸡腿为鸡肉部位，古籍按鸡条统论。",
   "cost": "中等",
   "py": "jitui",
   "trad": "雞腿"
  },
  {
   "id": "yatui",
   "name": "鸭腿",
   "alias": [
    "鸭腿肉"
   ],
   "cat": "禽蛋",
   "nature": "凉",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肺",
    "胃",
    "肾"
   ],
   "effect": [
    "养血",
    "清热",
    "生津"
   ],
   "use": "传统食养用于口干、咽干、体倦的日常调理。",
   "foodUse": "炖煮、烤制或卤煮，常用 50 至 150 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "脂肪较多，宜去皮烹制。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、福建、广东",
   "originGeo": "",
   "originNote": "肉质紧实，宜炖、烤或卤。",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "毛羽类 鸭",
   "grade": "乙",
   "status": "已核",
   "uncertain": "鸭腿为鸭肉部位，古籍按鸭条统论。",
   "cost": "中等",
   "py": "yatui",
   "trad": "鴨腿"
  },
  {
   "id": "lianyu",
   "name": "鲢鱼",
   "alias": [
    "白鲢",
    "鲢子"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "益气",
    "利水"
   ],
   "use": "传统食养用于脾胃虚寒、食少乏力、水肿的日常调理。",
   "foodUse": "清蒸、红烧或炖汤，常用 50 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "细刺较多，老人与儿童食用时注意。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "湖北、湖南、江苏、安徽",
   "originGeo": "",
   "originNote": "体侧扁，鳞细，肉味鲜淡。",
   "sourceBook": "中华本草",
   "sourceChapter": "鲢鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鲢鱼条，科属与篇目未核。",
   "cost": "平价",
   "py": "lianyu",
   "trad": "鰱魚"
  },
  {
   "id": "yongyu",
   "name": "鳙鱼",
   "alias": [
    "胖头鱼",
    "花鲢",
    "黑鲢"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "温中",
    "益气",
    "利水"
   ],
   "use": "传统食养用于脾胃虚寒、食少乏力、水肿的日常调理。",
   "foodUse": "清蒸、炖汤或红烧，常用 50 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "细刺较多，老人与儿童食用时注意。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "湖北、湖南、江苏、浙江",
   "originGeo": "",
   "originNote": "头大肉厚，鱼头常用于炖汤。",
   "sourceBook": "中华本草",
   "sourceChapter": "鳙鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鳙鱼条，科属与篇目未核。",
   "cost": "平价",
   "py": "yongyu",
   "trad": "鱅魚"
  },
  {
   "id": "qingyu",
   "name": "青鱼",
   "alias": [
    "青鲩",
    "黑鲩",
    "螺蛳青"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "化湿",
    "养胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少乏力、水湿不化的日常调理。",
   "foodUse": "清蒸、红烧或炖汤，常用 50 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "细刺较多，食用时注意。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "湖北、湖南、江苏、浙江",
   "originGeo": "",
   "originNote": "体色青黑，肉厚刺少。",
   "sourceBook": "中华本草",
   "sourceChapter": "青鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有青鱼条，鱼肉与鱼胆性味有别，本条目取鱼肉说。",
   "cost": "中等",
   "py": "qingyu",
   "trad": "青魚"
  },
  {
   "id": "heiyu",
   "name": "黑鱼",
   "alias": [
    "乌鳢",
    "乌鱼",
    "财鱼"
   ],
   "cat": "水产",
   "nature": "寒",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺",
    "肾"
   ],
   "effect": [
    "健脾",
    "利水",
    "散瘀"
   ],
   "use": "传统食养用于脾胃虚弱、水湿停滞、产后体虚的日常调理。",
   "foodUse": "切片炒食、炖汤或煮粥，常用 50 至 150 克。",
   "caution": [
    "性寒，脾胃虚寒者不宜多食。",
    "水产过敏者避免食用。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "湖北、湖南、江西、安徽",
   "originGeo": "",
   "originNote": "肉质紧实，刺少，宜炖汤或切片。",
   "sourceBook": "中华本草",
   "sourceChapter": "乌鳢",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有乌鳢条，科属与篇目未核。",
   "cost": "中等",
   "py": "heiyu",
   "trad": "黑魚"
  },
  {
   "id": "changyu",
   "name": "鲳鱼",
   "alias": [
    "银鲳",
    "白鲳",
    "平鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "健胃"
   ],
   "use": "传统食养用于气血不足、食欲欠佳、体倦乏力的日常调理。",
   "foodUse": "清蒸、红烧或炖汤，常用 50 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "宜新鲜食用，变质后不宜食用。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "浙江、福建、广东、山东",
   "originGeo": "",
   "originNote": "体扁呈银白色，肉厚刺少。",
   "sourceBook": "中华本草",
   "sourceChapter": "鲳鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鲳鱼条，科属与篇目未核。",
   "cost": "较高",
   "py": "changyu",
   "trad": "鯧魚"
  },
  {
   "id": "sanwenyu",
   "name": "三文鱼",
   "alias": [
    "大西洋鲑",
    "鲑鱼"
   ],
   "cat": "水产",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "温中"
   ],
   "use": "传统食养用于脾胃虚寒、体倦乏力、食欲欠佳的日常调理。",
   "foodUse": "煎烤、清蒸或煮汤，常用 50 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "生食须符合冷链与检疫要求，孕妇与儿童建议熟食。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "挪威、智利、苏格兰；国内青海、山东",
   "originGeo": "挪威、智利",
   "originNote": "近代输入种，市售多为养殖大西洋鲑。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "鱼类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "近代输入种，传统本草无正条，性味依通行食养说推定。",
   "cost": "较高",
   "py": "sanwenyu",
   "trad": "三文魚"
  },
  {
   "id": "xueyu",
   "name": "鳕鱼",
   "alias": [
    "大头鳕",
    "大口鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "大肠"
   ],
   "effect": [
    "活血",
    "止痛",
    "润肠"
   ],
   "use": "传统食养用于血行不畅、肠燥便干的日常调理。",
   "foodUse": "清蒸、煎烤或煮汤，常用 50 至 150 克。",
   "caution": [
    "水产过敏者避免食用。",
    "须充分加热熟透，避免生食。"
   ],
   "allergens": [
    "水产",
    "鱼"
   ],
   "yaoshi": "目录外",
   "originMain": "山东、辽宁、河北；进口以俄罗斯、挪威为主",
   "originGeo": "俄罗斯、挪威",
   "originNote": "肉色洁白，肉质细嫩，刺少。",
   "sourceBook": "中华本草",
   "sourceChapter": "鳕鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鳕鱼条，原文未载归经，归经依功效推定。",
   "cost": "较高",
   "py": "xueyu",
   "trad": "鱈魚"
  },
  {
   "id": "youyu",
   "name": "鱿鱼",
   "alias": [
    "柔鱼",
    "枪乌贼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "滋阴",
    "养胃",
    "养血"
   ],
   "use": "传统食养用于阴血不足、口干咽燥、体倦乏力的日常调理。",
   "foodUse": "白灼、爆炒或烤制，常用 50 至 150 克。",
   "caution": [
    "贝类过敏者避免食用。",
    "须充分加热熟透后食用。",
    "干品含盐较高，泡发后适量食用。"
   ],
   "allergens": [
    "水产",
    "贝类"
   ],
   "yaoshi": "目录外",
   "originMain": "福建、浙江、广东、山东",
   "originGeo": "",
   "originNote": "鲜品脆嫩，干品称鱿鱼干。",
   "sourceBook": "中华本草",
   "sourceChapter": "鱿鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鱿鱼条，科属与篇目未核。",
   "cost": "中等",
   "py": "youyu",
   "trad": "魷魚"
  },
  {
   "id": "zhangyu",
   "name": "章鱼",
   "alias": [
    "八爪鱼"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "养血",
    "益气",
    "收敛"
   ],
   "use": "传统食养用于气血不足、体倦乏力的日常调理。",
   "foodUse": "白灼、炖煮或烤制，常用 50 至 150 克。",
   "caution": [
    "贝类过敏者避免食用。",
    "肉质坚韧，须充分煮软。",
    "有荨麻疹史者不宜食用。"
   ],
   "allergens": [
    "水产",
    "贝类"
   ],
   "yaoshi": "目录外",
   "originMain": "福建、浙江、广东、山东",
   "originGeo": "",
   "originNote": "腕足八条，肉质紧实，宜白灼或炖煮。",
   "sourceBook": "中华本草",
   "sourceChapter": "章鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有章鱼条，性味有平、寒两说，本条目取平性说。",
   "cost": "较高",
   "py": "zhangyu",
   "trad": "章魚"
  },
  {
   "id": "shanbei",
   "name": "扇贝",
   "alias": [
    "海扇",
    "带子"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "滋阴",
    "益肾",
    "和胃"
   ],
   "use": "传统食养用于阴血不足、食欲欠佳、体倦乏力的日常调理。",
   "foodUse": "蒸食、煮汤或炒食，常用 50 至 150 克。",
   "caution": [
    "贝类过敏者避免食用。",
    "嘌呤含量较高，高尿酸人群不宜多食。"
   ],
   "allergens": [
    "水产",
    "贝类"
   ],
   "yaoshi": "目录外",
   "originMain": "山东、辽宁、河北、福建",
   "originGeo": "",
   "originNote": "闭壳肌肥厚，鲜品与干贝风味不同。",
   "sourceBook": "中华本草",
   "sourceChapter": "扇贝",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有扇贝条，科属与篇目未核。",
   "cost": "较高",
   "py": "shanbei",
   "trad": "扇貝"
  },
  {
   "id": "baoyu",
   "name": "鲍鱼",
   "alias": [
    "鳆鱼",
    "九孔鲍"
   ],
   "cat": "水产",
   "nature": "平",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "滋阴",
    "清热",
    "明目"
   ],
   "use": "传统食养用于阴虚内热、口干咽燥、眼目干涩的日常调理。",
   "foodUse": "炖汤、蒸食或红烧，常用 50 至 150 克。",
   "caution": [
    "贝类过敏者避免食用。",
    "干鲍需充分泡发，鲜鲍须熟透后食用。"
   ],
   "allergens": [
    "水产",
    "贝类"
   ],
   "yaoshi": "目录外",
   "originMain": "福建、广东、山东、辽宁",
   "originGeo": "福建连江",
   "originNote": "肉质紧实，鲜品与干鲍制法不同。",
   "sourceBook": "中华本草",
   "sourceChapter": "鲍鱼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "中华本草有鲍鱼条，古称鳆鱼；原文未载归经，归经依功效推定。",
   "cost": "较高",
   "py": "baoyu",
   "trad": "鮑魚"
  },
  {
   "id": "yaoguo",
   "name": "腰果",
   "alias": [
    "鸡腰果",
    "介寿果",
    "槚如树果"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "健脾",
    "益气",
    "补肾"
   ],
   "use": "传统食养用于体倦、腰膝无力。",
   "foodUse": "炒食或入菜，常用 10 至 30 克。",
   "caution": [
    "含油脂较多，便溏者不宜多食。",
    "坚果过敏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区海南、云南、广东、广西。",
   "originGeo": "",
   "originNote": "仁肉香脆，含油较高。",
   "sourceBook": "中华本草",
   "sourceChapter": "腰果",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yaoguo",
   "trad": "腰果"
  },
  {
   "id": "badanmu",
   "name": "巴旦木",
   "alias": [
    "扁桃仁",
    "巴旦杏"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "润肺",
    "润肠"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "炒食或入面点，常用 10 至 30 克。",
   "caution": [
    "与杏仁非同一物，选购与配方时勿混用。",
    "坚果过敏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、甘肃、陕西、山西。",
   "originGeo": "",
   "originNote": "仁肉香脆，含油较高。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "坚果种子类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有扁桃仁成分；性味归经按坚果通行食养说推定。",
   "cost": "较高",
   "py": "badanmu",
   "trad": "巴旦木"
  },
  {
   "id": "kaixinguo",
   "name": "开心果",
   "alias": [
    "阿月浑子",
    "无名子",
    "胡榛子"
   ],
   "cat": "坚果种子",
   "nature": "温",
   "flavor": [
    "辛",
    "涩"
   ],
   "meridians": [
    "脾",
    "胃",
    "肾"
   ],
   "effect": [
    "温中",
    "健脾",
    "益气"
   ],
   "use": "传统食养用于畏寒、食欲不振。",
   "foodUse": "炒食或入面点，常用 10 至 30 克。",
   "caution": [
    "含油脂较多，一次不宜过量。",
    "坚果过敏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、甘肃、内蒙古、陕西。",
   "originGeo": "",
   "originNote": "仁肉香脆，带特有香气。",
   "sourceBook": "中华本草",
   "sourceChapter": "阿月浑子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "kaixinguo",
   "trad": "開心果"
  },
  {
   "id": "xiaweiyiguo",
   "name": "夏威夷果",
   "alias": [
    "澳洲坚果",
    "昆士兰果"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "润肠"
   ],
   "use": "传统食养用于体倦、排便不畅。",
   "foodUse": "生食或烘焙，常用 10 至 30 克。",
   "caution": [
    "含油脂较高，一次不宜过量。",
    "坚果过敏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区云南、广西、广东、海南。",
   "originGeo": "",
   "originNote": "仁肉酥脆，含油较高。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "坚果种子类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有澳洲坚果成分；性味归经按坚果通行食养说推定。",
   "cost": "较高",
   "py": "xiaweiyiguo",
   "trad": "夏威夷果"
  },
  {
   "id": "zhenzi",
   "name": "榛子",
   "alias": [
    "平榛",
    "山板栗",
    "榛仁"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于食欲不振、体倦。",
   "foodUse": "炒食或入面点，常用 10 至 30 克。",
   "caution": [
    "含油脂较多，便溏者不宜多食。",
    "坚果过敏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区黑龙江、吉林、辽宁、内蒙古。",
   "originGeo": "",
   "originNote": "仁肉香脆，炒后香气浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "榛子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "zhenzi",
   "trad": "榛子"
  },
  {
   "id": "yamazi",
   "name": "亚麻籽",
   "alias": [
    "亚麻子",
    "胡麻子",
    "壁虱胡麻"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "肝",
    "大肠"
   ],
   "effect": [
    "润肠",
    "养血",
    "润燥"
   ],
   "use": "传统食养用于排便不畅、皮肤干燥。",
   "foodUse": "研粉或入面点，常用 10 至 30 克。",
   "caution": [
    "须研碎后食用，整粒不易消化。",
    "不宜大量生食，便溏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、甘肃、新疆、宁夏。",
   "originGeo": "",
   "originNote": "籽粒细小，研粉后易吸收。",
   "sourceBook": "中华本草",
   "sourceChapter": "亚麻子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "yamazi",
   "trad": "亞麻籽"
  },
  {
   "id": "qiyazi",
   "name": "奇亚籽",
   "alias": [
    "奇雅子",
    "鼠尾草籽"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾",
    "润肠"
   ],
   "use": "传统食养用于排便不畅、体倦。",
   "foodUse": "泡水或入饮品，常用 10 至 30 克。",
   "caution": [
    "吸水膨胀，食用后宜适量饮水。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区墨西哥、玻利维亚、阿根廷；国内云南、四川有引种。",
   "originGeo": "",
   "originNote": "籽粒细小，吸水后成胶状。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "坚果种子类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有奇亚籽成分；性味归经按坚果通行食养说推定。",
   "cost": "较高",
   "py": "qiyazi",
   "trad": "奇亞籽"
  },
  {
   "id": "xiguazi",
   "name": "西瓜子",
   "alias": [
    "西瓜仁",
    "黑瓜子"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "胃",
    "大肠"
   ],
   "effect": [
    "润肺",
    "润肠",
    "和中"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "炒食，常用 10 至 30 克。",
   "caution": [
    "含油脂较多，一次不宜过量。",
    "便溏者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区新疆、甘肃、内蒙古、宁夏。",
   "originGeo": "",
   "originNote": "仁肉香脆，炒后香气浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "西瓜子",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiguazi",
   "trad": "西瓜子"
  },
  {
   "id": "xingren",
   "name": "杏仁",
   "alias": [
    "甜杏仁",
    "南杏仁",
    "杏核仁"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "大肠"
   ],
   "effect": [
    "润肺",
    "润肠"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "生食或入面点，常用 10 至 30 克。",
   "caution": [
    "苦杏仁含苦杏仁苷，须炮制并按药典用量，不作普通食品。",
    "本品只列甜杏仁食用口径；南杏仁为甜杏仁，北杏仁为苦杏仁，二者须区分。",
    "坚果过敏者慎食。"
   ],
   "allergens": [
    "坚果"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区河北、山西、陕西、甘肃。",
   "originGeo": "",
   "originNote": "甜杏仁味甘，苦杏仁味苦，二者须分。",
   "sourceBook": "中华本草",
   "sourceChapter": "杏仁",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中华本草》杏仁条兼列苦、甜二种，本表只取甜杏仁食用口径。",
   "cost": "中等",
   "py": "xingren",
   "trad": "杏仁"
  },
  {
   "id": "baizhima",
   "name": "白芝麻",
   "alias": [
    "白脂麻",
    "白胡麻",
    "白油麻"
   ],
   "cat": "坚果种子",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肝",
    "肾",
    "大肠"
   ],
   "effect": [
    "养血",
    "润肠",
    "润燥"
   ],
   "use": "传统食养用于面色少华、排便不畅。",
   "foodUse": "炒食或研粉，常用 10 至 30 克。",
   "caution": [
    "脾虚便溏者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河南、安徽、湖北、江西。",
   "originGeo": "",
   "originNote": "炒后香气浓，研粉易吸收。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "坚果种子类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版坚果种子类列有白芝麻成分；性味归经按坚果通行食养说推定。",
   "cost": "平价",
   "py": "baizhima",
   "trad": "白芝麻"
  },
  {
   "id": "koumo",
   "name": "口蘑",
   "alias": [
    "白蘑",
    "蒙古口蘑",
    "口菇"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于食欲不振、体倦。",
   "foodUse": "炒食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区内蒙古、河北、吉林、黑龙江。",
   "originGeo": "",
   "originNote": "菌盖肥厚，汤味鲜美。",
   "sourceBook": "中华本草",
   "sourceChapter": "口蘑",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "koumo",
   "trad": "口蘑"
  },
  {
   "id": "xingbaogu",
   "name": "杏鲍菇",
   "alias": [
    "刺芹侧耳",
    "干贝菇",
    "雪茸"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益胃",
    "消食"
   ],
   "use": "传统食养用于食欲不振、食后腹胀。",
   "foodUse": "炒食、煎烤或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、江苏、山东、河北。",
   "originGeo": "",
   "originNote": "菌柄粗壮，肉质紧实。",
   "sourceBook": "中华本草",
   "sourceChapter": "刺芹侧耳",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中华本草》以刺芹侧耳立条，市售食用名杏鲍菇。",
   "cost": "平价",
   "py": "xingbaogu",
   "trad": "杏鮑菇"
  },
  {
   "id": "chashugu",
   "name": "茶树菇",
   "alias": [
    "茶薪菇",
    "柱状田头菇",
    "油茶菇"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "祛湿"
   ],
   "use": "传统食养用于食欲不振、体倦。",
   "foodUse": "炒食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、江西、湖南、浙江。",
   "originGeo": "",
   "originNote": "菌柄细长，干品香气浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "茶薪菇",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中华本草》以茶薪菇立条，市售食用名茶树菇。",
   "cost": "中等",
   "py": "chashugu",
   "trad": "茶樹菇"
  },
  {
   "id": "jituigu",
   "name": "鸡腿菇",
   "alias": [
    "毛头鬼伞",
    "鸡腿菌"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益胃"
   ],
   "use": "传统食养用于食欲不振、体倦。",
   "foodUse": "炒食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "不宜与酒同食。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区河北、山东、河南、福建。",
   "originGeo": "",
   "originNote": "菌柄粗壮，肉质细嫩。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "菌藻类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有鸡腿菇成分；性味归经按菌类通行食养说推定。",
   "cost": "平价",
   "py": "jituigu",
   "trad": "雞腿菇"
  },
  {
   "id": "xieweigu",
   "name": "蟹味菇",
   "alias": [
    "真姬菇",
    "玉蕈",
    "斑玉蕈"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气"
   ],
   "use": "传统食养用于食欲不振、体倦。",
   "foodUse": "炒食、涮食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、山东、江苏、河北。",
   "originGeo": "",
   "originNote": "菌盖有斑纹，口感脆嫩。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "菌藻类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有真姬菇成分；性味归经按菌类通行食养说推定。",
   "cost": "平价",
   "py": "xieweigu",
   "trad": "蟹味菇"
  },
  {
   "id": "baiyugu",
   "name": "白玉菇",
   "alias": [
    "白色真姬菇",
    "雪菇"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "生津"
   ],
   "use": "传统食养用于食欲不振、口干。",
   "foodUse": "炒食、涮食或炖汤，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、山东、江苏、河北。",
   "originGeo": "",
   "originNote": "菌体洁白，口感爽滑。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "菌藻类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版菌藻类列有真姬菇成分；白玉菇为其白色栽培型。",
   "cost": "平价",
   "py": "baiyugu",
   "trad": "白玉菇"
  },
  {
   "id": "yangdujun",
   "name": "羊肚菌",
   "alias": [
    "羊肚蘑",
    "羊肚菜",
    "编笠菌"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益胃",
    "理气"
   ],
   "use": "传统食养用于食欲不振、食后腹胀。",
   "foodUse": "炖汤或炒食，鲜品常用 50 至 100 克；干品酌减。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区云南、四川、贵州、湖北。",
   "originGeo": "",
   "originNote": "菌盖多皱，香气浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "羊肚菌",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "yangdujun",
   "trad": "羊肚菌"
  },
  {
   "id": "songrong",
   "name": "松茸",
   "alias": [
    "松蕈",
    "松口蘑",
    "松蘑"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于体倦、食欲不振。",
   "foodUse": "煎烤、炖汤或焖饭，鲜品常用 50 至 100 克。",
   "caution": [
    "须煮熟后食用。",
    "菌类过敏者慎食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区云南、四川、西藏、吉林。",
   "originGeo": "",
   "originNote": "菌盖褐色，香气独特。",
   "sourceBook": "中华本草",
   "sourceChapter": "松蕈",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中华本草》以松蕈立条，市售食用名松茸。",
   "cost": "较高",
   "py": "songrong",
   "trad": "松茸"
  },
  {
   "id": "haibaicai",
   "name": "海白菜",
   "alias": [
    "石莼",
    "海菠菜",
    "石被"
   ],
   "cat": "菌藻",
   "nature": "寒",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肺",
    "脾",
    "膀胱"
   ],
   "effect": [
    "清热",
    "利水",
    "软坚"
   ],
   "use": "传统食养用于口干、小便偏少。",
   "foodUse": "凉拌或煮汤，鲜品常用 50 至 100 克。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "须洗净泥沙后食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区福建、浙江、山东、辽宁。",
   "originGeo": "",
   "originNote": "藻体薄而柔嫩，口感滑脆。",
   "sourceBook": "中华本草",
   "sourceChapter": "石莼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中华本草》以石莼立条，市售食用名海白菜。",
   "cost": "平价",
   "py": "haibaicai",
   "trad": "海白菜"
  },
  {
   "id": "shihuacai",
   "name": "石花菜",
   "alias": [
    "海石花",
    "石花",
    "海冻菜"
   ],
   "cat": "菌藻",
   "nature": "寒",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肺",
    "肝",
    "大肠"
   ],
   "effect": [
    "清热",
    "润燥",
    "软坚"
   ],
   "use": "传统食养用于口干、排便不畅。",
   "foodUse": "凉拌或熬制凉粉，鲜品常用 50 至 100 克；干品酌减。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "须充分泡发洗净。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区山东、辽宁、福建、浙江。",
   "originGeo": "",
   "originNote": "藻体坚韧，煮后胶质丰富。",
   "sourceBook": "中华本草",
   "sourceChapter": "石花菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "shihuacai",
   "trad": "石花菜"
  },
  {
   "id": "facai",
   "name": "发菜",
   "alias": [
    "发状念珠藻",
    "地毛",
    "头发菜"
   ],
   "cat": "菌藻",
   "nature": "凉",
   "flavor": [
    "甘",
    "咸"
   ],
   "meridians": [
    "肝",
    "肾"
   ],
   "effect": [
    "清热",
    "利水",
    "软坚"
   ],
   "use": "传统食养用于口干、小便偏少。",
   "foodUse": "泡发后煮汤或烩菜，常用 50 至 100 克（干品酌减）。",
   "caution": [
    "野生发菜采集破坏草原，选购宜认合法来源。",
    "脾胃虚寒者不宜多食。",
    "干品须充分泡发洗净。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区宁夏、甘肃、内蒙古、青海。",
   "originGeo": "",
   "originNote": "干品呈黑色丝状，泡发后柔滑。",
   "sourceBook": "中华本草",
   "sourceChapter": "发菜",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "facai",
   "trad": "髮菜"
  },
  {
   "id": "luoxuanzao",
   "name": "螺旋藻",
   "alias": [
    "钝顶螺旋藻",
    "极大螺旋藻",
    "节旋藻"
   ],
   "cat": "菌藻",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾"
   ],
   "use": "现代作藻类食品，常见于汤羹、面点与饮品。",
   "foodUse": "鲜品常用 50 至 100 克，干粉按产品说明酌减。",
   "caution": [
    "钝顶螺旋藻、极大螺旋藻按原卫生部 2004 年第 17 号公告作普通食品管理，可适量食用。",
    "选购须认正规来源，注意碘与污染物指标。",
    "特殊人群食用前宜咨询医师或药师。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产区云南、海南、内蒙古、广东。",
   "originGeo": "",
   "originNote": "藻粉深绿，味带海藻气。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "菌藻类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "螺旋藻按保健食品原料管理，普通食品份量与性味归经均待核，暂不进配膳。",
   "cost": "较高",
   "py": "luoxuanzao",
   "trad": "螺旋藻"
  },
  {
   "id": "xuenomi",
   "name": "血糯米",
   "alias": [
    "血糯",
    "紫红糯米"
   ],
   "cat": "谷薯",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "补中益气",
    "健脾暖胃",
    "养血"
   ],
   "use": "传统食养用于脾胃虚寒、食少倦怠、面色少华。",
   "foodUse": "煮粥、蒸饭、做甜羹，常用 50 至 100 克。",
   "caution": [
    "黏滞难化，脾胃虚弱者不宜多食。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江苏、浙江、安徽、上海",
   "originGeo": "",
   "originNote": "米粒呈紫红色，煮后黏糯，色泽深浅因品种而异。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版谷薯类收紫红糯米[血糯米]，性味归经无古籍专条，依糯米推定。",
   "cost": "中等",
   "py": "xuenomi",
   "trad": "血糯米"
  },
  {
   "id": "ximi",
   "name": "西米",
   "alias": [
    "西谷米",
    "沙谷米"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食欲不振、口干。",
   "foodUse": "煮羹、做甜品，常用 50 至 100 克。",
   "caution": [
    "控糖人群控制总量。",
    "一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产于东南亚，国内多用木薯淀粉加工",
   "originGeo": "",
   "originNote": "煮后透明弹滑，常配椰浆、水果做甜羹。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "《中国食物成分表》第6版未见单列西米，本草条目未核，性味归经依淀粉类主食推定，待核。",
   "cost": "平价",
   "py": "ximi",
   "trad": "西米"
  },
  {
   "id": "oufen",
   "name": "藕粉",
   "alias": [
    "莲藕粉"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "生津",
    "养血"
   ],
   "use": "传统食养用于食欲不振、口干、体倦。",
   "foodUse": "沸水冲调或入羹，常用 50 至 100 克。",
   "caution": [
    "含淀粉较多，控糖人群控制总量。",
    "冲调须用沸水并搅匀。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、江苏、安徽、湖北",
   "originGeo": "",
   "originNote": "以莲藕淀粉制成，片状或颗粒状，冲调后呈半透明糊状。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "淀粉及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版淀粉及制品收藕粉，性味归经无古籍专条，依莲藕推定。",
   "cost": "中等",
   "py": "oufen",
   "trad": "藕粉"
  },
  {
   "id": "mifen",
   "name": "米粉",
   "alias": [
    "米线",
    "排米粉",
    "籼米粉"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "煮粉、炒粉，常用 50 至 150 克干品。",
   "caution": [
    "控糖人群控制总量。",
    "干品泡发后须煮熟。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "江西、广西、湖南、广东",
   "originGeo": "",
   "originNote": "以大米为原料制成，条状或片状，口感爽滑。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版谷薯类收籼米粉[排米粉]，性味归经无古籍专条，依籼米推定。",
   "cost": "平价",
   "py": "mifen",
   "trad": "米粉"
  },
  {
   "id": "miantiao",
   "name": "面条",
   "alias": [
    "挂面",
    "切面"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "煮食、炒食，常用 50 至 150 克干品。",
   "caution": [
    "麸质过敏者忌食。",
    "控糖人群控制总量。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "河南、山东、河北、江苏",
   "originGeo": "",
   "originNote": "挂面便于存放，宽窄厚薄因制法而异。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版谷薯类收挂面与面条，性味归经无古籍专条，依小麦推定。",
   "cost": "平价",
   "py": "miantiao",
   "trad": "麵條"
  },
  {
   "id": "mantou",
   "name": "馒头",
   "alias": [
    "馍",
    "馍馍"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "蒸热食用，常用 50 至 150 克。",
   "caution": [
    "麸质过敏者忌食。",
    "控糖人群控制总量。"
   ],
   "allergens": [
    "麸质"
   ],
   "yaoshi": "目录外",
   "originMain": "河南、山东、河北、山西",
   "originGeo": "",
   "originNote": "发酵蒸制，质地松软，北方主食之一。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版谷薯类收馒头，性味归经无古籍专条，依小麦推定。",
   "cost": "平价",
   "py": "mantou",
   "trad": "饅頭"
  },
  {
   "id": "mianbao",
   "name": "面包",
   "alias": [
    "吐司"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "烤热或直接食用，常用 50 至 150 克。",
   "caution": [
    "麸质过敏者忌食。",
    "部分配方含乳、蛋，过敏者留意配料表。",
    "含糖含油者控糖控脂人群酌量。"
   ],
   "allergens": [
    "麸质",
    "乳",
    "蛋"
   ],
   "yaoshi": "目录外",
   "originMain": "各地均有烘焙生产",
   "originGeo": "",
   "originNote": "发酵烘烤而成，含糖油者口感更松软。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "速食食品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版速食食品收面包，性味归经无古籍专条，依小麦推定。",
   "cost": "中等",
   "py": "mianbao",
   "trad": "麵包"
  },
  {
   "id": "yumimian",
   "name": "玉米面",
   "alias": [
    "玉米粉",
    "苞米面"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾开胃",
    "和中",
    "利水"
   ],
   "use": "传统食养用于胃纳不佳、饮食减少、小便不利。",
   "foodUse": "做窝头、发糕、煮糊，常用 50 至 150 克。",
   "caution": [
    "霉变玉米制品不可食。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "吉林、黑龙江、河南、山东",
   "originGeo": "",
   "originNote": "粗磨与细磨口感不同，细面做发糕更松软。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版谷薯类收玉米面，性味归经无古籍专条，依玉米推定。",
   "cost": "平价",
   "py": "yumimian",
   "trad": "玉米麵"
  },
  {
   "id": "qiaomaimian",
   "name": "荞麦面",
   "alias": [
    "荞面",
    "苦荞面"
   ],
   "cat": "谷薯",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "健脾消食",
    "宽肠",
    "清热"
   ],
   "use": "传统食养用于饮食过量、脘腹胀满、大便不畅。",
   "foodUse": "煮面、凉拌，常用 50 至 150 克干品。",
   "caution": [
    "脾胃虚寒者不宜多食。",
    "市售荞麦面常混小麦粉，麸质过敏者留意配料表。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "内蒙古、陕西、山西、云南",
   "originGeo": "",
   "originNote": "纯荞麦面易断，市售常与小麦粉配用。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "谷薯类",
   "grade": "乙",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版谷薯类收苦荞麦粉，荞麦面条目对应待核，性味归经依荞麦推定。",
   "cost": "中等",
   "py": "qiaomaimian",
   "trad": "蕎麥麵"
  },
  {
   "id": "hongshufentiao",
   "name": "红薯粉条",
   "alias": [
    "地瓜粉条",
    "红薯粉丝"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "泡发后炖、煮、炒，常用 50 至 100 克干品。",
   "caution": [
    "控糖人群控制总量。",
    "泡发后须充分煮熟。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河南、山东、河北、四川",
   "originGeo": "",
   "originNote": "以红薯淀粉制成，耐煮，口感筋道。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "淀粉及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版淀粉及制品收粉条，性味归经无古籍专条，依甘薯推定。",
   "cost": "平价",
   "py": "hongshufentiao",
   "trad": "紅薯粉條"
  },
  {
   "id": "tudoufen",
   "name": "土豆粉",
   "alias": [
    "马铃薯粉",
    "土豆粉条"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "和胃"
   ],
   "use": "传统食养用于脾胃虚弱、食少、体倦。",
   "foodUse": "煮粉、炒粉，常用 50 至 100 克干品。",
   "caution": [
    "控糖人群控制总量。",
    "煮前须泡软。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "甘肃、陕西、内蒙古、黑龙江",
   "originGeo": "",
   "originNote": "以马铃薯淀粉制成，煮后透明爽滑。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "淀粉及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版淀粉及制品收马铃薯粉，性味归经无古籍专条，依马铃薯推定。",
   "cost": "平价",
   "py": "tudoufen",
   "trad": "土豆粉"
  },
  {
   "id": "niangao",
   "name": "年糕",
   "alias": [
    "粘糕",
    "黏糕"
   ],
   "cat": "谷薯",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "肺"
   ],
   "effect": [
    "补中益气",
    "健脾暖胃"
   ],
   "use": "传统食养用于脾胃虚寒、食少倦怠。",
   "foodUse": "蒸、煮、炒食，常用 50 至 100 克。",
   "caution": [
    "黏滞难化，脾胃虚弱者不宜多食。",
    "控糖人群控制总量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "浙江、江苏、安徽、江西",
   "originGeo": "",
   "originNote": "糯米制品，凉后变硬，宜加热后食用。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "小吃甜饼",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版小吃甜饼收年糕，性味归经无古籍专条，依糯米推定。",
   "cost": "平价",
   "py": "niangao",
   "trad": "年糕"
  },
  {
   "id": "guoba",
   "name": "锅巴",
   "alias": [
    "锅焦",
    "饭焦"
   ],
   "cat": "谷薯",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "和中",
    "消食"
   ],
   "use": "传统食养用于食欲不振、食少。",
   "foodUse": "直接食用或入汤，常用 50 至 100 克。",
   "caution": [
    "油炸锅巴含油较多，控脂人群酌量。",
    "一次不宜过量，以免口干。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "各地均有制作",
   "originGeo": "",
   "originNote": "米饭贴锅结成的焦脆层，也可用小米、玉米制作。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "《中国食物成分表》第6版未见单列锅巴，本草条目未核，性味归经依粳米推定，待核。",
   "cost": "平价",
   "py": "guoba",
   "trad": "鍋巴"
  },
  {
   "id": "doufunao",
   "name": "豆腐脑",
   "alias": [
    "豆花",
    "豆腐花"
   ],
   "cat": "豆类",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "大肠"
   ],
   "effect": [
    "益气",
    "和中",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干、食少、大便干结。",
   "foodUse": "咸甜均可，常用 100 至 200 克。",
   "caution": [
    "大豆过敏者忌食。",
    "一次不宜过量。",
    "高尿酸人群控制总量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "各地均有制作",
   "originGeo": "",
   "originNote": "豆浆点卤后凝结的嫩脑，北咸南甜。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版豆类及制品收豆腐脑[老豆腐]，性味归经无古籍专条，依豆腐推定。",
   "cost": "平价",
   "py": "doufunao",
   "trad": "豆腐腦"
  },
  {
   "id": "dougan",
   "name": "豆干",
   "alias": [
    "豆腐干",
    "香干"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "益气",
    "健脾",
    "生津"
   ],
   "use": "传统食养用于脾胃虚弱、食少、口干。",
   "foodUse": "凉拌、炒食、卤制，常用 50 至 100 克。",
   "caution": [
    "大豆过敏者忌食。",
    "加工多经盐卤点制，需控盐人群注意。",
    "蛋白质含量高，一次不宜过量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "江苏、安徽、山东、四川",
   "originGeo": "",
   "originNote": "豆腐加压脱水制成，质地紧实，香干风味更浓。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版豆类及制品收豆腐干，性味归经无古籍专条，依豆腐制品通行说推定。",
   "cost": "平价",
   "py": "dougan",
   "trad": "豆乾"
  },
  {
   "id": "nadou",
   "name": "纳豆",
   "alias": [
    "发酵大豆"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "消食",
    "和胃"
   ],
   "use": "传统食养用于食少、体倦。",
   "foodUse": "拌食、配饭，常用 30 至 50 克。",
   "caution": [
    "大豆过敏者忌食。",
    "气味与黏液独特，初次少量尝试。",
    "一次不宜过量。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "主产于日本，国内江苏、山东、黑龙江有生产",
   "originGeo": "",
   "originNote": "大豆经纳豆菌发酵而成，表面有黏液，气味独特。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "《中国食物成分表》第6版未见单列纳豆，本草条目未核，性味归经依大豆推定，待核。",
   "cost": "中等",
   "py": "nadou",
   "trad": "納豆"
  },
  {
   "id": "douzha",
   "name": "豆渣",
   "alias": [
    "豆腐渣"
   ],
   "cat": "豆类",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "健脾",
    "益气",
    "润肠"
   ],
   "use": "传统食养用于食少、体倦、大便不畅。",
   "foodUse": "炒食、做饼、入粥，常用 50 至 100 克。",
   "caution": [
    "大豆过敏者忌食。",
    "含膳食纤维较多，一次不宜过量，以免腹胀。"
   ],
   "allergens": [
    "大豆"
   ],
   "yaoshi": "目录外",
   "originMain": "各地豆制品加工均有副产",
   "originGeo": "",
   "originNote": "豆浆滤出的豆渣，质地松散，须及时冷藏。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "豆类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版未见单列豆渣，本草条目未核，性味归经依大豆推定，待核。",
   "cost": "平价",
   "py": "douzha",
   "trad": "豆渣"
  },
  {
   "id": "shuiniunai",
   "name": "水牛奶",
   "alias": [
    "水牛乳"
   ],
   "cat": "乳品",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺",
    "胃"
   ],
   "effect": [
    "养血",
    "生津",
    "润燥"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "煮饮，常用 200 至 300 毫升。",
   "caution": [
    "乳制品过敏者不宜饮。",
    "饮乳后易腹胀者不宜多饮。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区广西、广东、云南、福建。",
   "originGeo": "",
   "originNote": "奶香浓郁，质地较稠，适合煮饮或制甜品。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "《中国食物成分表》第6版乳类及制品未见单列水牛奶，中华本草水牛乳专条未核，性味归经依牛乳与通行说推定，待核。",
   "cost": "较高",
   "py": "shuiniunai",
   "trad": "水牛奶"
  },
  {
   "id": "maoniunai",
   "name": "牦牛奶",
   "alias": [
    "犛牛奶",
    "牦牛乳"
   ],
   "cat": "乳品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "脾",
    "胃",
    "心"
   ],
   "effect": [
    "养血",
    "益气",
    "润燥"
   ],
   "use": "传统食养用于体倦、畏寒、口干。",
   "foodUse": "煮饮，常用 200 至 300 毫升。",
   "caution": [
    "乳制品过敏者不宜饮。",
    "内热偏盛者不宜多饮。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区西藏、青海、四川、甘肃。",
   "originGeo": "",
   "originNote": "奶香浓郁，藏区常制酥油与酸奶。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "《中国食物成分表》第6版乳类及制品未见单列牦牛奶，中华本草犛牛乳专条未核，性味归经依羊乳推定，待核。",
   "cost": "较高",
   "py": "maoniunai",
   "trad": "犛牛奶"
  },
  {
   "id": "yangnaifen",
   "name": "羊奶粉",
   "alias": [
    "羊乳粉",
    "全脂羊乳粉"
   ],
   "cat": "乳品",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肺",
    "胃"
   ],
   "effect": [
    "益气",
    "养血",
    "润肺"
   ],
   "use": "传统食养用于体倦、口干。",
   "foodUse": "温水冲调，常用 200 至 300 毫升。",
   "caution": [
    "乳制品过敏者不宜食。",
    "冲调浓度按包装说明。"
   ],
   "allergens": [
    "乳"
   ],
   "yaoshi": "目录外",
   "originMain": "主产区陕西、内蒙古、山东、河北。",
   "originGeo": "",
   "originNote": "羊乳干燥制成，膻味依工艺与产地而异。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "乳类及制品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "《中国食物成分表》第6版乳类及制品收全脂羊乳粉，性味归经无古籍专条，依羊乳推定。",
   "cost": "较高",
   "py": "yangnaifen",
   "trad": "羊奶粉"
  },
  {
   "id": "bohe",
   "name": "薄荷",
   "alias": [
    "银丹草",
    "野薄荷",
    "仁丹草"
   ],
   "cat": "调味",
   "nature": "凉",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "肝"
   ],
   "effect": [
    "清热",
    "解表",
    "理气",
    "利咽"
   ],
   "use": "传统食养用于口干、咽喉不适、目涩、食欲不振。",
   "foodUse": "泡水、调味、入汤后下，常用 3 至 6 克。",
   "caution": [
    "芳香辛散，不宜久煎。",
    "体虚多汗者不宜多用。",
    "孕期不宜大量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "江苏、安徽、江西、河南",
   "originGeo": "",
   "originNote": "叶背绒毛与品种有关，香气清凉；干品香气较鲜品收敛。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 薄荷",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "bohe",
   "trad": "薄荷"
  },
  {
   "id": "luole",
   "name": "罗勒",
   "alias": [
    "九层塔",
    "金不换",
    "兰香"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "脾",
    "胃"
   ],
   "effect": [
    "散寒",
    "理气",
    "和胃",
    "祛湿"
   ],
   "use": "传统食养用于脘腹不舒、食欲不振、畏寒。",
   "foodUse": "调味、拌菜、入汤，常用 3 至 10 克。",
   "caution": [
    "内热偏盛者不宜多食。",
    "孕期不宜大量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河南、安徽、江苏、浙江",
   "originGeo": "",
   "originNote": "甜罗勒香气柔和，九层塔香气较浓。",
   "sourceBook": "中华本草",
   "sourceChapter": "罗勒",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "luole",
   "trad": "羅勒"
  },
  {
   "id": "midiexiang",
   "name": "迷迭香",
   "alias": [],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "脾",
    "胃"
   ],
   "effect": [
    "散寒",
    "健脾",
    "安神"
   ],
   "use": "传统食养用于食欲不振、精神倦怠、畏寒。",
   "foodUse": "调味、烤肉、煎烤，常用 3 至 10 克。",
   "caution": [
    "香气浓烈，一次不宜过量。",
    "孕期不宜大量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、贵州、广西、四川",
   "originGeo": "",
   "originNote": "针叶香气浓，干品香气更集中。",
   "sourceBook": "中华本草",
   "sourceChapter": "迷迭香",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "midiexiang",
   "trad": "迷迭香"
  },
  {
   "id": "bailixiang",
   "name": "百里香",
   "alias": [
    "麝香草",
    "地椒"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "散寒",
    "理气",
    "化痰"
   ],
   "use": "传统食养用于畏寒、食欲不振、痰多。",
   "foodUse": "调味、炖煮、烤肉，常用 3 至 10 克。",
   "caution": [
    "辛温香燥，内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "河北、山西、陕西、甘肃",
   "originGeo": "",
   "originNote": "叶小香气浓，鲜品与干品风味有别。",
   "sourceBook": "中华本草",
   "sourceChapter": "百里香",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "bailixiang",
   "trad": "百里香"
  },
  {
   "id": "shuweicao",
   "name": "鼠尾草",
   "alias": [
    "洋苏叶"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛",
    "苦"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "理气",
    "化湿",
    "安神"
   ],
   "use": "传统食养用于食欲不振、口腻、精神倦怠。",
   "foodUse": "调味、炖煮、煎烤，常用 3 至 10 克。",
   "caution": [
    "香气浓，一次不宜过量。",
    "孕期不宜大量食用。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "云南、贵州、四川",
   "originGeo": "",
   "originNote": "叶面灰绿，香气浓；干品较鲜品更集中。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "调味品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "shuweicao",
   "trad": "鼠尾草"
  },
  {
   "id": "niuzhi",
   "name": "牛至",
   "alias": [
    "土香薷"
   ],
   "cat": "调味",
   "nature": "凉",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "解表",
    "理气",
    "化湿"
   ],
   "use": "传统食养用于暑湿不舒、食欲不振、口腻。",
   "foodUse": "调味、披萨、烤肉，常用 3 至 10 克。",
   "caution": [
    "脾胃虚寒者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "新疆、甘肃、陕西、山西",
   "originGeo": "",
   "originNote": "叶小香气浓，干品香气较鲜品柔和。",
   "sourceBook": "中华本草",
   "sourceChapter": "牛至",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "niuzhi",
   "trad": "牛至"
  },
  {
   "id": "galiye",
   "name": "咖喱叶",
   "alias": [
    "调料九里香"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛",
    "苦"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "理气",
    "消食",
    "化湿"
   ],
   "use": "传统食养用于食欲不振、口腻。",
   "foodUse": "调味、咖喱、炖煮，常用 3 至 10 克。",
   "caution": [
    "香气浓，一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产印度、斯里兰卡；国内云南、广东有栽培",
   "originGeo": "",
   "originNote": "叶片香气近似咖喱，鲜叶入馔。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "待核",
   "grade": "丙",
   "status": "待核",
   "uncertain": "咖喱叶中文药性记载零散，未核到正条，性味归经依通行食养说拟，待核。",
   "cost": "中等",
   "py": "galiye",
   "trad": "咖喱葉"
  },
  {
   "id": "xiangmao",
   "name": "香茅",
   "alias": [
    "柠檬草",
    "柠檬茅"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "散寒",
    "理气",
    "祛湿"
   ],
   "use": "传统食养用于脘腹发凉、食欲不振、肢体困重。",
   "foodUse": "调味、煮汤、咖喱，常用 3 至 10 克。",
   "caution": [
    "香气浓，内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "广东、广西、云南、海南",
   "originGeo": "",
   "originNote": "柠檬香气明显，茎部香气较叶持久。",
   "sourceBook": "中华本草",
   "sourceChapter": "香茅",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "xiangmao",
   "trad": "香茅"
  },
  {
   "id": "yueguiye",
   "name": "月桂叶",
   "alias": [
    "香叶",
    "月桂"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "脾",
    "胃"
   ],
   "effect": [
    "散寒",
    "理气",
    "和胃"
   ],
   "use": "传统食养用于食欲不振、脘腹发凉。",
   "foodUse": "炖煮、卤味、汤羹调味，常用 3 至 10 克。",
   "caution": [
    "香气浓，一次不宜过量。"
   ],
   "allergens": [],
   "yaoshi": "目录外",
   "originMain": "主产地中海沿岸；国内云南、广西、广东有栽培",
   "originGeo": "",
   "originNote": "干叶香气较鲜叶柔和，久煮香气渐出。",
   "sourceBook": "中华本草",
   "sourceChapter": "月桂叶",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "yueguiye",
   "trad": "月桂葉"
  },
  {
   "id": "jiemo",
   "name": "芥末",
   "alias": [
    "芥辣",
    "芥末酱",
    "黄芥子"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "肺",
    "胃"
   ],
   "effect": [
    "散寒",
    "理气",
    "健脾开胃"
   ],
   "use": "传统食养用于食欲不振、畏寒。",
   "foodUse": "蘸食、调味，常用 3 至 10 克。",
   "caution": [
    "辛辣刺激，胃部不适者不宜多食。",
    "对芥末敏感者避开。",
    "目录以黄芥子列入，芥末按黄芥子项作香辛料使用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "内蒙古、陕西、甘肃、河北",
   "originGeo": "",
   "originNote": "以黄芥子研磨调制，辛味冲鼻，少量即可提味。",
   "sourceBook": "中国食物成分表",
   "sourceChapter": "调味品",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "jiemo",
   "trad": "芥末"
  },
  {
   "id": "shannai",
   "name": "山奈",
   "alias": [
    "沙姜",
    "山柰",
    "三柰",
    "山辣"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "胃"
   ],
   "effect": [
    "温中",
    "理气",
    "消食"
   ],
   "use": "传统食养用于脘腹发凉、食欲不振。",
   "foodUse": "调味、卤味、炖煮，常用 3 至 6 克。",
   "caution": [
    "辛温香燥，内热偏盛者不宜多食。",
    "目录规定仅作香辛料和调味品。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "广东、广西、云南、福建",
   "originGeo": "",
   "originNote": "气香特异，味辛辣；广东习称沙姜。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 山柰",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "shannai",
   "trad": "山奈"
  },
  {
   "id": "jianghuang",
   "name": "姜黄",
   "alias": [
    "黄姜",
    "毛姜黄",
    "宝鼎香"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "辛",
    "苦"
   ],
   "meridians": [
    "脾",
    "肝"
   ],
   "effect": [
    "理气",
    "散瘀",
    "温中"
   ],
   "use": "传统食养用于脘腹发凉、食欲不振。",
   "foodUse": "调味、咖喱、炖煮，常用 3 至 10 克。",
   "caution": [
    "辛温香燥，内热偏盛者不宜多食。",
    "目录规定仅作香辛料和调味品。",
    "孕期不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "四川、福建、广东、广西",
   "originGeo": "",
   "originNote": "断面橙黄，香气辛香；咖喱色泽多源于此。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 姜黄",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "平价",
   "py": "jianghuang",
   "trad": "薑黃"
  },
  {
   "id": "biba",
   "name": "荜茇",
   "alias": [
    "荜拨",
    "毕拨"
   ],
   "cat": "调味",
   "nature": "热",
   "flavor": [
    "辛"
   ],
   "meridians": [
    "胃",
    "大肠"
   ],
   "effect": [
    "温中",
    "散寒",
    "理气"
   ],
   "use": "传统食养用于脘腹发凉、食欲不振。",
   "foodUse": "调味、卤味、炖煮，常用 1 至 3 克。",
   "caution": [
    "辛热，内热偏盛者不宜多食。",
    "目录规定仅作香辛料和调味品。",
    "孕期慎用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产印度尼西亚、菲律宾、越南；国内广东、云南有栽培",
   "originGeo": "",
   "originNote": "穗状果序香气辛烈，黑褐者为佳。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 荜茇",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "biba",
   "trad": "蓽茇"
  },
  {
   "id": "xihonghua",
   "name": "西红花",
   "alias": [
    "藏红花",
    "番红花"
   ],
   "cat": "调味",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "心",
    "肝"
   ],
   "effect": [
    "活血",
    "解郁",
    "安神"
   ],
   "use": "传统食养用于心情郁闷、睡眠不安。",
   "foodUse": "调味、泡水、入饭，常用 1 至 3 克。",
   "caution": [
    "一次不宜过量。",
    "目录规定仅作香辛料和调味品。",
    "孕期不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产伊朗、西班牙、希腊；国内上海、浙江、河南有栽培",
   "originGeo": "",
   "originNote": "柱头三裂，色红油润；少量即可显色添香。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 西红花",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "xihonghua",
   "trad": "西紅花"
  },
  {
   "id": "danggui",
   "name": "当归",
   "alias": [
    "秦归",
    "云归",
    "岷当归"
   ],
   "cat": "调味",
   "nature": "温",
   "flavor": [
    "甘",
    "辛"
   ],
   "meridians": [
    "肝",
    "心",
    "脾"
   ],
   "effect": [
    "养血",
    "活血",
    "润肠"
   ],
   "use": "传统食养用于体倦、面色少华、大便干。",
   "foodUse": "按目录规定仅作香辛料和调味品，炖煮、卤味常用 3 至 6 克。",
   "caution": [
    "目录规定仅作香辛料和调味品，不作普通菜肴主料。",
    "孕期慎用。",
    "内热偏盛者不宜多食。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "甘肃、云南、四川、陕西",
   "originGeo": "岷县当归",
   "originNote": "香气浓郁，味甘微苦；甘肃岷县为传统产区。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 当归",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "danggui",
   "trad": "當歸"
  },
  {
   "id": "huangqi",
   "name": "黄芪",
   "alias": [
    "黄耆",
    "绵黄芪",
    "北芪"
   ],
   "cat": "药食同源",
   "nature": "温",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "脾"
   ],
   "effect": [
    "益气",
    "健脾",
    "利水",
    "养血"
   ],
   "use": "传统食养用于体倦、乏力、食欲不振。",
   "foodUse": "按现行目录规定适量食用；煮汤、炖煮常用 9 至 15 克。",
   "caution": [
    "按现行目录规定适量食用。",
    "外感发热、内热偏盛者不宜多食。",
    "孕期、哺乳期及婴幼儿不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "内蒙古、山西、甘肃、黑龙江",
   "originGeo": "",
   "originNote": "条粗皮黄，粉性足；不同产地片形与甜味有别。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 黄芪",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "中等",
   "py": "huangqi",
   "trad": "黃芪"
  },
  {
   "id": "xiyangshen",
   "name": "西洋参",
   "alias": [
    "花旗参",
    "美国人参",
    "洋参"
   ],
   "cat": "药食同源",
   "nature": "凉",
   "flavor": [
    "甘",
    "苦"
   ],
   "meridians": [
    "心",
    "肺",
    "肾"
   ],
   "effect": [
    "益气",
    "养阴",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干、体倦、烦热。",
   "foodUse": "按现行目录规定适量食用；切片泡水、炖汤常用 3 至 6 克。",
   "caution": [
    "按现行目录规定适量食用。",
    "脾胃虚寒者不宜多食。",
    "孕期、哺乳期及婴幼儿不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "主产美国、加拿大；国内山东、北京、吉林有栽培",
   "originGeo": "",
   "originNote": "切片香气清，味苦回甘；进口与国产片形有别。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 西洋参",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "xiyangshen",
   "trad": "西洋參"
  },
  {
   "id": "ejiao",
   "name": "阿胶",
   "alias": [
    "驴皮胶",
    "传致胶"
   ],
   "cat": "药食同源",
   "nature": "平",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "肺",
    "肝",
    "肾"
   ],
   "effect": [
    "养血",
    "滋阴",
    "润燥"
   ],
   "use": "传统食养用于体倦、口干、面色少华。",
   "foodUse": "按现行目录规定适量使用；打粉后以热粥或热汤冲调，常用 3 至 9 克。",
   "caution": [
    "按现行目录规定适量使用。",
    "脾胃虚弱者不宜多食。",
    "外感期间不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "山东、河南、河北",
   "originGeo": "东阿阿胶",
   "originNote": "色黑质硬，断面光亮；烊化后气味微腥。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 阿胶",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "ejiao",
   "trad": "阿膠"
  },
  {
   "id": "tiepishihu",
   "name": "铁皮石斛",
   "alias": [
    "铁皮兰",
    "黑节草",
    "枫斗"
   ],
   "cat": "药食同源",
   "nature": "凉",
   "flavor": [
    "甘"
   ],
   "meridians": [
    "胃",
    "肾"
   ],
   "effect": [
    "养阴",
    "生津",
    "清热"
   ],
   "use": "传统食养用于口干、咽干、食欲不振。",
   "foodUse": "按现行目录规定适量食用；鲜品榨汁、干品煎煮或炖汤，常用 6 至 12 克。",
   "caution": [
    "按现行目录规定适量食用。",
    "脾胃虚寒者不宜多食。",
    "孕期、哺乳期及婴幼儿不宜食用。"
   ],
   "allergens": [],
   "yaoshi": "目录内",
   "originMain": "浙江、云南、安徽、广东",
   "originGeo": "雁荡山铁皮石斛",
   "originNote": "鲜条黏性足，嚼之微甘；枫斗为加工卷曲品。",
   "sourceBook": "中国药典",
   "sourceChapter": "2020年版一部 铁皮石斛",
   "grade": "甲",
   "status": "已核",
   "uncertain": "",
   "cost": "较高",
   "py": "tiepishihu",
   "trad": "鐵皮石斛"
  }
 ],
 "recipes": [
  {
   "id": "shanyao-zhou",
   "name": "山药粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "山药",
     "amount": "500 克"
    },
    {
     "name": "羊肉",
     "amount": "500 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "山药洗净去皮，煮熟后研成泥。",
    "羊肉去脂膜，煮烂后研成泥。",
    "羊肉汤中下粳米，煮至粥将成，加入山药泥与羊肉泥，搅匀再煮片刻。"
   ],
   "effect": [
    "健脾",
    "益气",
    "温阳"
   ],
   "suitable": "气虚、阳虚，秋冬季节，老人与儿童适量。",
   "caution": "湿盛中满、外感期间少食。",
   "original": "羊肉一斤，去脂膜，烂煮熟，研泥；山药一斤，煮熟，研泥；肉汤内下米三合，煮粥，空腹食之。",
   "modern": "山药 500 克，羊肉 500 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 山药粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "yanggu-zhou",
   "name": "羊骨粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "羊骨",
     "amount": "1 副"
    },
    {
     "name": "陈皮",
     "amount": "6 克"
    },
    {
     "name": "高良姜",
     "amount": "6 克"
    },
    {
     "name": "草果",
     "amount": "2 个"
    },
    {
     "name": "生姜",
     "amount": "30 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    },
    {
     "name": "盐",
     "amount": "少许"
    }
   ],
   "method": [
    "羊骨洗净捶碎，与陈皮、高良姜、草果、生姜同入锅中。",
    "加水适量，慢火熬取骨汤，滤去渣滓。",
    "以骨汤下粳米煮粥，临熟加盐少许调味。"
   ],
   "effect": [
    "温阳",
    "益气",
    "健脾"
   ],
   "suitable": "阳虚畏寒、腰膝乏力者，冬季适量。",
   "caution": "湿热内盛、外感期间少食。",
   "original": "羊骨一副，全者，捶碎；陈皮二钱，去白；良姜二钱；草果二个；生姜一两；盐少许。水三斗，慢火熬成汁，滤出澄清，如常作粥。",
   "modern": "羊骨 1 副，陈皮 6 克，高良姜 6 克，草果 2 个，生姜 30 克，粳米 100 克，盐少许。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 羊骨粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "gouqi-yangshen-zhou",
   "name": "枸杞羊肾粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "枸杞叶",
     "amount": "250 克"
    },
    {
     "name": "羊肾",
     "amount": "2 只"
    },
    {
     "name": "羊肉",
     "amount": "250 克"
    },
    {
     "name": "葱白",
     "amount": "1 根"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "枸杞叶洗净，羊肾去筋膜切细，羊肉切小块，葱白切段。",
    "诸味拌匀，加水煮取汁。",
    "下粳米熬成粥，空腹温食。"
   ],
   "effect": [
    "温阳",
    "益气",
    "养血"
   ],
   "suitable": "阳虚、气血不足，冬季，腰膝乏力者适量。",
   "caution": "外感期间、湿热内盛者少食。",
   "original": "枸杞叶一斤，羊肾一对，细切，葱白一茎，羊肉半斤，炒。右四味拌匀，入五味，煮成汁，下米熬成粥，空腹食之。",
   "modern": "枸杞叶 250 克，羊肾 2 只，羊肉 250 克，葱白 1 根，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 枸杞羊肾粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "liangjiang-zhou",
   "name": "良姜粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "高良姜",
     "amount": "15 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "高良姜研为细末。",
    "水三碗煎高良姜至二碗，去渣。",
    "下粳米煮粥，温食。"
   ],
   "effect": [
    "温中",
    "散寒",
    "理气"
   ],
   "suitable": "脾胃虚寒、脘腹冷痛者，冬季适量。",
   "caution": "胃热、阴虚火旺者少食。",
   "original": "高良姜半两，为末；粳米三合。水三大碗，煎高良姜至二碗，去滓，下米煮粥，食之。",
   "modern": "高良姜 15 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 良姜粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "lianzi-zhou",
   "name": "莲子粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "莲子",
     "amount": "100 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "莲子去心，煮熟后研成泥。",
    "与粳米同入锅中，加水适量。",
    "煮成稀粥，空腹温食。"
   ],
   "effect": [
    "健脾",
    "安神",
    "益气"
   ],
   "suitable": "脾虚、心神不宁，夏秋季节，老人适量。",
   "caution": "大便干结者少食。",
   "original": "莲子一升，去心，煮熟，研如泥，与粳米三合，作粥，空腹食之。",
   "modern": "莲子 100 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 莲子粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "suanzao-zhou",
   "name": "酸枣粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "酸枣仁",
     "amount": "30 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "酸枣仁捣碎，加水绞取汁。",
    "以酸枣仁汁下粳米。",
    "煮成粥，空腹温食。"
   ],
   "effect": [
    "安神",
    "养血",
    "生津"
   ],
   "suitable": "心神不宁、睡眠浅者，秋冬适量。",
   "caution": "嗜睡、痰湿内盛者少食。",
   "original": "酸枣仁一碗，用水绞取汁，下米三合煮粥，空腹食之。",
   "modern": "酸枣仁 30 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 酸枣粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "luobo-zhou",
   "name": "萝卜粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "白萝卜",
     "amount": "500 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "白萝卜洗净，煮熟后绞取汁。",
    "以萝卜汁与粳米同煮。",
    "粥成温食。"
   ],
   "effect": [
    "消食",
    "下气",
    "生津"
   ],
   "suitable": "饮食积滞、口干者，秋冬适量。",
   "caution": "脾胃虚寒、腹泻者少食。",
   "original": "大萝卜五个，煮熟，绞取汁，用粳米三合，同水并汁，煮粥食之。",
   "modern": "白萝卜 500 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 萝卜粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "machixian-zhou",
   "name": "马齿菜粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "马齿苋",
     "amount": "250 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "马齿苋洗净，绞取汁。",
    "以马齿苋汁和粳米同煮。",
    "煮成粥，温食。"
   ],
   "effect": [
    "清热",
    "祛湿",
    "消食"
   ],
   "suitable": "湿热体质，夏季暑湿时节适量。",
   "caution": "脾胃虚寒者少食，孕期慎食。",
   "original": "马齿菜洗净，取汁，和粳米同煮粥，空腹食之。",
   "modern": "马齿苋 250 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 马齿菜粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "jitou-zhou",
   "name": "鸡头粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "芡实",
     "amount": "50 克"
    },
    {
     "name": "粳米",
     "amount": "50 克"
    }
   ],
   "method": [
    "芡实煮熟，研成泥。",
    "与粳米同入锅中，加水适量。",
    "煮成粥，温食。"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "固涩"
   ],
   "suitable": "脾虚、湿盛，夏秋季节适量。",
   "caution": "大便干结、外感期间少食。",
   "original": "鸡头实三合，煮熟，研如泥，与粳米一合，煮粥食之。",
   "modern": "芡实 50 克，粳米 50 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 鸡头粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "biandou-zhou",
   "name": "扁豆粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "白扁豆",
     "amount": "50 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "白扁豆洗净，提前浸泡。",
    "与粳米同入锅中，加水适量。",
    "煮至豆烂粥稠，温食。"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "消食"
   ],
   "suitable": "脾虚、湿盛，夏季长夏时节适量。",
   "caution": "外感期间、腹胀者少食。",
   "original": "入粥去皮，用干者佳，鲜者味少淡。",
   "modern": "白扁豆 50 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 扁豆粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "baihe-zhou",
   "name": "百合粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "百合",
     "amount": "30 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "百合洗净，剥瓣。",
    "与粳米同入锅中，加水适量。",
    "煮成粥，温食。"
   ],
   "effect": [
    "润肺",
    "安神",
    "清热"
   ],
   "suitable": "秋燥时节、心神不宁者适量。",
   "caution": "风寒外感、脾胃虚寒者少食。",
   "original": "《纲目》方：润肺调中。",
   "modern": "百合 30 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 百合粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "yiyi-zhou",
   "name": "薏苡粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "薏苡仁",
     "amount": "50 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "薏苡仁洗净，提前浸泡。",
    "与粳米同入锅中，加水适量。",
    "煮至薏苡仁软烂、粥稠，温食。"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "清热"
   ],
   "suitable": "湿盛体质，长夏梅雨时节适量。",
   "caution": "孕期慎食，脾胃虚寒者适量。",
   "original": "《三福丹书》：补脾益胃。",
   "modern": "薏苡仁 50 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 薏苡粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "dou-zhou",
   "name": "豆粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "赤小豆",
     "amount": "100 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    }
   ],
   "method": [
    "赤小豆洗净，入砂锅烂煮。",
    "待粥少沸，下粳米同煮。",
    "煮至豆烂粥稠，温食。"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "利水"
   ],
   "suitable": "湿盛体质，夏季长夏适量。",
   "caution": "阴虚津少、小便清长者少食。",
   "original": "用砂瓶烂煮赤豆，候粥少沸，投之同煮，既熟而食。",
   "modern": "赤小豆 100 克，粳米 100 克。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 豆粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "xingren-zhou",
   "name": "杏仁粥",
   "cat": "粥",
   "ingredients": [
    {
     "name": "杏仁",
     "amount": "15 克"
    },
    {
     "name": "粳米",
     "amount": "100 克"
    },
    {
     "name": "冰糖",
     "amount": "适量"
    }
   ],
   "method": [
    "杏仁用温水浸泡，去皮尖，研碎。",
    "加水滤取杏仁汁。",
    "以杏仁汁下粳米煮粥，临熟加冰糖少许。"
   ],
   "effect": [
    "润肺",
    "润肠",
    "消食"
   ],
   "suitable": "秋燥时节、肠燥者适量。",
   "caution": "杏仁不宜过量，婴幼儿少食；苦杏仁须充分煮熟。",
   "original": "",
   "modern": "杏仁 15 克，粳米 100 克，冰糖适量。",
   "adaptation": "",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 杏仁粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": "太平圣惠方食治卷次与杏仁粥方名未核到原文。"
  },
  {
   "id": "yangdu-geng",
   "name": "羊肚羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "羊肚",
     "amount": "1 具"
    },
    {
     "name": "粳米",
     "amount": "60 克"
    },
    {
     "name": "葱白",
     "amount": "3 根"
    },
    {
     "name": "豆豉",
     "amount": "15 克"
    },
    {
     "name": "花椒",
     "amount": "3 克"
    },
    {
     "name": "生姜",
     "amount": "10 克"
    }
   ],
   "method": [
    "羊肚洗净；粳米淘净；葱白切段，生姜切细。",
    "诸味拌匀，纳入羊肚内。",
    "煮熟烂，调味后空腹温食。"
   ],
   "effect": [
    "温中",
    "益气",
    "健脾"
   ],
   "suitable": "脾胃虚寒、冬季畏寒者适量。",
   "caution": "湿热内盛、外感期间少食。",
   "original": "羊肚一枚，洗净；粳米二合；葱白数茎；豉半合；蜀椒去目闭口者，炒出汗，三十粒；生姜二钱半，细切。右六味拌匀，入羊肚内烂煮熟，五味调和，空心食之。",
   "modern": "羊肚 1 具，粳米 60 克，葱白 3 根，豆豉 15 克，花椒 3 克，生姜 10 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 羊肚羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "yangrou-geng",
   "name": "羊肉羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "羊肉",
     "amount": "250 克"
    },
    {
     "name": "白萝卜",
     "amount": "1 个"
    },
    {
     "name": "草果",
     "amount": "3 克"
    },
    {
     "name": "陈皮",
     "amount": "3 克"
    },
    {
     "name": "高良姜",
     "amount": "3 克"
    },
    {
     "name": "荜茇",
     "amount": "3 克"
    },
    {
     "name": "胡椒",
     "amount": "3 克"
    },
    {
     "name": "葱白",
     "amount": "3 根"
    }
   ],
   "method": [
    "羊肉切细，白萝卜切片，葱白切段。",
    "诸味同入锅中，加水熬成汤。",
    "加盐、酱调味，煮至羊肉烂熟，温食。"
   ],
   "effect": [
    "温阳",
    "益气",
    "健脾"
   ],
   "suitable": "阳虚畏寒，冬季适量。",
   "caution": "湿热、阴虚火旺者少食。",
   "original": "羊肉半斤，细切；萝卜一个，切作片；草果一钱；陈皮一钱，去白；良姜一钱；荜拨一钱；胡椒一钱；葱白三茎。水熬成汁，入盐、酱熬汤，下面棋子，作羹食之。",
   "modern": "羊肉 250 克，白萝卜 1 个，草果 3 克，陈皮 3 克，高良姜 3 克，荜茇 3 克，胡椒 3 克，葱白 3 根。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 羊肉羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "jiyu-geng",
   "name": "鲫鱼羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "鲫鱼",
     "amount": "500 克"
    },
    {
     "name": "大蒜",
     "amount": "2 瓣"
    },
    {
     "name": "胡椒",
     "amount": "3 克"
    },
    {
     "name": "花椒",
     "amount": "3 克"
    },
    {
     "name": "陈皮",
     "amount": "6 克"
    },
    {
     "name": "砂仁",
     "amount": "6 克"
    },
    {
     "name": "荜茇",
     "amount": "3 克"
    }
   ],
   "method": [
    "鲫鱼去鳞杂，洗净。",
    "诸药研末，与葱、酱、盐、蒜一同纳入鱼腹。",
    "煎熟后加水作羹，调味温食。"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "温中"
   ],
   "suitable": "脾胃虚弱、湿盛者，秋冬适量。",
   "caution": "水产过敏者忌；内热盛者少食。",
   "original": "大鲫鱼二斤，大蒜两块，胡椒二钱，小椒二钱，陈皮二钱，缩砂二钱，荜拨二钱。葱、酱、盐、料物、蒜，入鱼肚内，煎熟作羹，五味调和令匀，空心食之。",
   "modern": "鲫鱼 500 克，大蒜 2 瓣，胡椒 3 克，花椒 3 克，陈皮 6 克，砂仁 6 克，荜茇 3 克。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 鲫鱼羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "liyu-tang",
   "name": "鲤鱼汤",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "鲤鱼",
     "amount": "1 尾"
    },
    {
     "name": "赤小豆",
     "amount": "30 克"
    },
    {
     "name": "陈皮",
     "amount": "6 克"
    },
    {
     "name": "花椒",
     "amount": "3 克"
    },
    {
     "name": "草果",
     "amount": "2 个"
    }
   ],
   "method": [
    "鲤鱼去鳞杂，洗净。",
    "赤小豆洗净，与陈皮、花椒、草果同入锅中。",
    "加水与鲤鱼同煮，调味后温食。"
   ],
   "effect": [
    "健脾",
    "祛湿",
    "利水"
   ],
   "suitable": "湿盛体质，春夏季节适量。",
   "caution": "水产过敏者忌；阴虚津少者少食。",
   "original": "大鲤鱼一头，赤小豆一合，陈皮二钱，去白，小椒二钱，草果二钱。入五味，调和匀，煮熟，空腹食之。",
   "modern": "鲤鱼 1 尾，赤小豆 30 克，陈皮 6 克，花椒 3 克，草果 2 个。",
   "adaptation": "",
   "sourceBook": "饮膳正要",
   "sourceChapter": "卷二 食疗诸病 鲤鱼汤",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "bijian-geng",
   "name": "碧涧羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "芹菜",
     "amount": "250 克"
    },
    {
     "name": "芝麻",
     "amount": "15 克"
    },
    {
     "name": "茴香",
     "amount": "3 克"
    },
    {
     "name": "盐",
     "amount": "少许"
    }
   ],
   "method": [
    "芹菜洗净，入沸水焯过取出。",
    "芝麻研末，与盐、茴香同入醋中调匀。",
    "以焯好的芹菜蘸食，或入汤作羹。"
   ],
   "effect": [
    "清热",
    "理气",
    "润肠"
   ],
   "suitable": "春季、湿热体质适量。",
   "caution": "脾胃虚寒、腹泻者少食。",
   "original": "芹，楚菜也，又名水英……二月三月作羹时采之，洗净，入汤焯过取出，以苦酒研芝麻，入盐少许，与茴香渍之。",
   "modern": "芹菜 250 克，芝麻 15 克，茴香 3 克，盐少许。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 碧涧羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "yusan-geng",
   "name": "玉糁羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "白萝卜",
     "amount": "500 克"
    },
    {
     "name": "白米",
     "amount": "50 克"
    }
   ],
   "method": [
    "白萝卜洗净，捶烂。",
    "白米研为细末。",
    "萝卜与米末同煮成羹，不加他料，温食。"
   ],
   "effect": [
    "消食",
    "下气",
    "生津"
   ],
   "suitable": "饮食积滞，秋冬季节适量。",
   "caution": "脾胃虚寒者少食。",
   "original": "捣芦菔烂煮，不用他料，只研白米为糁食之。",
   "modern": "白萝卜 500 克，白米 50 克。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 玉糁羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "xuexia-geng",
   "name": "雪霞羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "菊花",
     "amount": "15 克"
    },
    {
     "name": "豆腐",
     "amount": "200 克"
    },
    {
     "name": "胡椒",
     "amount": "少许"
    },
    {
     "name": "生姜",
     "amount": "少许"
    }
   ],
   "method": [
    "菊花去心蒂，入沸水焯过。",
    "豆腐切块，与菊花同煮。",
    "加胡椒、生姜、盐调味，煮成羹。"
   ],
   "effect": [
    "清热",
    "润燥",
    "理气"
   ],
   "suitable": "秋季、内热体质适量。",
   "caution": "脾胃虚寒者少食。",
   "original": "采芙蓉花，去心蒂，汤焯之，同豆腐煮，红白交错，恍如雪霁之霞，名雪霞羹，加胡椒、姜亦可也。",
   "modern": "菊花 15 克，豆腐 200 克，胡椒、生姜少许。",
   "adaptation": "原方用芙蓉花，非现行药食同源目录内物质，今改用菊花，保留清润思路。",
   "sourceBook": "山家清供",
   "sourceChapter": "卷下 雪霞羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "shanhai-geng",
   "name": "山海羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "春笋",
     "amount": "150 克"
    },
    {
     "name": "蕨菜",
     "amount": "150 克"
    },
    {
     "name": "鱼肉",
     "amount": "100 克"
    },
    {
     "name": "虾仁",
     "amount": "100 克"
    },
    {
     "name": "绿豆粉皮",
     "amount": "100 克"
    },
    {
     "name": "酱油",
     "amount": "少许"
    },
    {
     "name": "芝麻油",
     "amount": "少许"
    },
    {
     "name": "胡椒",
     "amount": "少许"
    },
    {
     "name": "醋",
     "amount": "少许"
    }
   ],
   "method": [
    "春笋、蕨菜取嫩者，入沸水焯过，切块。",
    "鱼肉、虾仁切块，与笋、蕨同入汤中煮熟。",
    "加酱油、芝麻油、盐、胡椒、醋，与绿豆粉皮拌匀，煮成羹。"
   ],
   "effect": [
    "清热",
    "健脾",
    "消食"
   ],
   "suitable": "春季、湿热体质适量。",
   "caution": "水产过敏者忌；蕨菜不宜长期大量食用。",
   "original": "春采笋蕨之嫩者，以汤瀹之，取鱼虾之鲜者，同切作块子，用汤泡裹蒸熟，入酱油、麻油、盐，研胡椒同绿豆粉皮拌匀加滴醋。",
   "modern": "春笋 150 克，蕨菜 150 克，鱼肉 100 克，虾仁 100 克，绿豆粉皮 100 克，酱油、芝麻油、胡椒、醋各少许。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 山海羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "yudai-geng",
   "name": "玉带羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "莼菜",
     "amount": "150 克"
    },
    {
     "name": "春笋",
     "amount": "150 克"
    },
    {
     "name": "高汤",
     "amount": "适量"
    },
    {
     "name": "盐",
     "amount": "少许"
    }
   ],
   "method": [
    "莼菜洗净，春笋切丝。",
    "高汤煮沸，下笋丝、莼菜。",
    "煮至笋熟，加盐调味，勾薄芡成羹。"
   ],
   "effect": [
    "清热",
    "健脾",
    "生津"
   ],
   "suitable": "春季、内热体质适量。",
   "caution": "脾胃虚寒者少食。",
   "original": "命仆作玉带羹，以笋似玉、莼似带也。",
   "modern": "莼菜 150 克，春笋 150 克，高汤适量，盐少许。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷下 玉带羹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "baiyang-shen-geng",
   "name": "白羊肾羹",
   "cat": "汤羹",
   "ingredients": [
    {
     "name": "白羊肾",
     "amount": "2 只"
    },
    {
     "name": "肉苁蓉",
     "amount": "15 克"
    },
    {
     "name": "葱白",
     "amount": "3 根"
    },
    {
     "name": "盐",
     "amount": "少许"
    },
    {
     "name": "酱油",
     "amount": "少许"
    },
    {
     "name": "花椒",
     "amount": "少许"
    }
   ],
   "method": [
    "白羊肾去脂膜，切片；肉苁蓉酒浸切细。",
    "二味相和，加葱白、盐、酱油、花椒。",
    "煮作羹，空腹温食。"
   ],
   "effect": [
    "温阳",
    "益气",
    "养血"
   ],
   "suitable": "阳虚畏寒，冬季腰膝乏力者适量。",
   "caution": "阴虚火旺、外感期间少食。",
   "original": "白羊肾一对，去脂膜切；肉苁蓉酒浸细切一两。上二味相和，入葱白盐酱椒煮作羹，如常法，空腹食。",
   "modern": "白羊肾 2 只，肉苁蓉 15 克，葱白 3 根，盐、酱油、花椒各少许。",
   "adaptation": "",
   "sourceBook": "圣济总录",
   "sourceChapter": "卷一百八十九 食治门 食治腰痛 白羊肾羹方",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "hangxie-jiang",
   "name": "沆瀣浆",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "甘蔗",
     "amount": "300 克"
    },
    {
     "name": "白萝卜",
     "amount": "300 克"
    }
   ],
   "method": [
    "甘蔗去皮切块，白萝卜洗净切块。",
    "二味同入锅中，加水适量。",
    "烂煮取汁，温饮或凉饮。"
   ],
   "effect": [
    "生津",
    "消食",
    "清热"
   ],
   "suitable": "酒后、食积、口干者适量。",
   "caution": "脾胃虚寒、腹泻者少饮。",
   "original": "止用甘蔗、白萝卜，各切作方块，以水烂煮而已。",
   "modern": "甘蔗 300 克，白萝卜 300 克。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 沆瀣浆",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "maimendong-jian",
   "name": "麦门冬煎",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "麦冬",
     "amount": "100 克"
    },
    {
     "name": "蜂蜜",
     "amount": "100 克"
    }
   ],
   "method": [
    "麦冬去心，捣汁。",
    "与蜂蜜和匀，隔水熬至稠厚。",
    "每次取一匙，温水化开饮用。"
   ],
   "effect": [
    "生津",
    "润肺",
    "滋阴"
   ],
   "suitable": "秋燥、口干者适量。",
   "caution": "脾胃虚寒、痰湿内盛者少饮。",
   "original": "春秋采根去心，捣汁和蜜，以银器重汤煮熬，如饴为度，贮之瓷器，内温酒化，温服。",
   "modern": "麦冬 100 克，蜂蜜 100 克。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷下 麦门冬煎",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "pibaye-yin",
   "name": "枇杷叶饮",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "枇杷叶",
     "amount": "15 克"
    },
    {
     "name": "蜂蜜",
     "amount": "适量"
    }
   ],
   "method": [
    "枇杷叶刷去毛，蜜水涂炙。",
    "加水煎煮，去渣取汁。",
    "代茶温饮。"
   ],
   "effect": [
    "润肺",
    "清热",
    "下气"
   ],
   "suitable": "秋燥时节、咽喉干涩者适量。",
   "caution": "脾胃虚寒、风寒外感者少饮。",
   "original": "以蜜水涂炙，煮粥去叶食。……可代茶饮。",
   "modern": "枇杷叶 15 克，蜂蜜适量。",
   "adaptation": "枇杷叶未列入现行目录，配膳时去枇杷叶，改用桑叶 10 克；本方只作资料留存。原书为枇杷叶粥，今改作代茶饮，去米取汁。",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 枇杷叶粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "gouqiye-cha",
   "name": "枸杞叶茶",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "枸杞叶",
     "amount": "30 克"
    }
   ],
   "method": [
    "枸杞叶洗净，沥干。",
    "沸水冲泡，加盖焖片刻。",
    "代茶温饮，可续水。"
   ],
   "effect": [
    "清热",
    "生津",
    "明目"
   ],
   "suitable": "春季、内热体质适量。",
   "caution": "脾胃虚寒者少饮。",
   "original": "枸杞叶，味甘气凉……摘叶代茶。",
   "modern": "枸杞叶 30 克。",
   "adaptation": "枸杞叶未列入现行目录，配膳时可用枸杞子 10 克替代；原书为枸杞叶粥，今取其叶代茶，去米。",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 枸杞叶粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "juhua-cha",
   "name": "菊花茶",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "菊花",
     "amount": "6 克"
    }
   ],
   "method": [
    "菊花拣净。",
    "沸水冲泡，加盖焖片刻。",
    "代茶温饮。"
   ],
   "effect": [
    "清热",
    "平肝",
    "明目"
   ],
   "suitable": "秋季、内热体质适量。",
   "caution": "脾胃虚寒者少饮。",
   "original": "菊花粥……点茶亦佳。",
   "modern": "菊花 6 克。",
   "adaptation": "原书为菊花粥，今取菊花点茶。",
   "sourceBook": "老老恒言",
   "sourceChapter": "卷五 粥谱 上品 菊花粥",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "zisu-shengjiang-yin",
   "name": "紫苏生姜饮",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "紫苏叶",
     "amount": "6 克"
    },
    {
     "name": "生姜",
     "amount": "3 片"
    }
   ],
   "method": [
    "紫苏叶洗净，生姜切片。",
    "同入杯中，沸水冲泡。",
    "加盖焖片刻，温饮。"
   ],
   "effect": [
    "理气",
    "温中",
    "消食"
   ],
   "suitable": "受凉后、食欲不振者适量。",
   "caution": "内热盛、阴虚者少饮。",
   "original": "",
   "modern": "紫苏叶 6 克，生姜 3 片。",
   "adaptation": "",
   "sourceBook": "食疗本草",
   "sourceChapter": "紫苏条",
   "grade": "乙",
   "status": "待核",
   "uncertain": "食疗本草为辑本，紫苏条仅载性用，无成方与用量，今方为按条目拟配。"
  },
  {
   "id": "chenpi-shengjiang-yin",
   "name": "陈皮生姜饮",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "陈皮",
     "amount": "6 克"
    },
    {
     "name": "生姜",
     "amount": "3 片"
    }
   ],
   "method": [
    "陈皮洗净，生姜切片。",
    "同入杯中，沸水冲泡。",
    "加盖焖片刻，温饮。"
   ],
   "effect": [
    "理气",
    "健脾",
    "温中"
   ],
   "suitable": "饭后腹胀、食欲不振者适量。",
   "caution": "阴虚燥热者少饮。",
   "original": "橘皮四两、生姜一两，水二升，煎一升，徐徐呷之。",
   "modern": "陈皮 6 克，生姜 3 片。",
   "adaptation": "",
   "sourceBook": "本草纲目",
   "sourceChapter": "卷三十 果之二 橘 附方 橘皮汤",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "wumei-yin",
   "name": "乌梅饮",
   "cat": "茶饮",
   "ingredients": [
    {
     "name": "乌梅",
     "amount": "3 颗"
    },
    {
     "name": "冰糖",
     "amount": "适量"
    }
   ],
   "method": [
    "乌梅洗净，加水浸泡。",
    "煮开后转小火煮片刻。",
    "加冰糖调味，温饮或凉饮。"
   ],
   "effect": [
    "生津",
    "消食",
    "安神"
   ],
   "suitable": "夏季出汗多、口干者适量。",
   "caution": "牙齿敏感者少饮；不宜空腹多饮。",
   "original": "",
   "modern": "乌梅 3 颗，冰糖适量。",
   "adaptation": "",
   "sourceBook": "食疗本草",
   "sourceChapter": "梅实条",
   "grade": "乙",
   "status": "待核",
   "uncertain": "食疗本草为辑本，梅实条载乌梅之用，无成方与用量，今方为按条目拟配。"
  },
  {
   "id": "huangjin-ji",
   "name": "黄金鸡",
   "cat": "菜肴",
   "ingredients": [
    {
     "name": "鸡",
     "amount": "1 只"
    },
    {
     "name": "芝麻油",
     "amount": "30 毫升"
    },
    {
     "name": "盐",
     "amount": "适量"
    },
    {
     "name": "葱",
     "amount": "2 根"
    },
    {
     "name": "花椒",
     "amount": "3 克"
    }
   ],
   "method": [
    "鸡宰杀洗净。",
    "用芝麻油、盐水煮鸡，入葱、花椒。",
    "煮熟后取出，斩块，以原汁调味佐食。"
   ],
   "effect": [
    "益气",
    "温中",
    "养血"
   ],
   "suitable": "气虚、阳虚，秋冬适量。",
   "caution": "外感期间、内热盛者少食。",
   "original": "其法燖鸡净洗，用麻油、盐水煮之，入葱、椒，候熟擘钉，以元汁别供。",
   "modern": "鸡 1 只，芝麻油 30 毫升，盐适量，葱 2 根，花椒 3 克。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 黄金鸡",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "shanjia-sancui",
   "name": "山家三脆",
   "cat": "菜肴",
   "ingredients": [
    {
     "name": "春笋",
     "amount": "150 克"
    },
    {
     "name": "茭白",
     "amount": "150 克"
    },
    {
     "name": "枸杞头",
     "amount": "100 克"
    },
    {
     "name": "芝麻油",
     "amount": "10 毫升"
    },
    {
     "name": "胡椒",
     "amount": "少许"
    },
    {
     "name": "盐",
     "amount": "少许"
    },
    {
     "name": "酱油",
     "amount": "少许"
    },
    {
     "name": "醋",
     "amount": "少许"
    }
   ],
   "method": [
    "嫩笋、茭白、枸杞头分别入盐汤焯熟。",
    "捞出沥干，切段。",
    "加芝麻油、胡椒、盐、酱油、醋拌匀，凉食。"
   ],
   "effect": [
    "清热",
    "健脾",
    "消食"
   ],
   "suitable": "春季、内热体质适量。",
   "caution": "脾胃虚寒者少食。",
   "original": "嫩笋、小簟、枸杞头入盐汤焯熟，同香熟油、胡椒、盐、少许酱油、滴醋拌食。",
   "modern": "春笋 150 克，茭白 150 克，枸杞头 100 克，芝麻油 10 毫升，胡椒、盐、酱油、醋各少许。",
   "adaptation": "原方小簟即菰，今用茭白。",
   "sourceBook": "山家清供",
   "sourceChapter": "卷下 山家三脆",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "xieniang-cheng",
   "name": "蟹酿橙",
   "cat": "菜肴",
   "ingredients": [
    {
     "name": "橙",
     "amount": "2 个"
    },
    {
     "name": "蟹肉",
     "amount": "100 克"
    },
    {
     "name": "蟹黄",
     "amount": "30 克"
    },
    {
     "name": "酒",
     "amount": "10 毫升"
    },
    {
     "name": "醋",
     "amount": "10 毫升"
    },
    {
     "name": "盐",
     "amount": "少许"
    }
   ],
   "method": [
    "橙子截顶，剜去瓤，留少许汁。",
    "蟹肉、蟹黄填入橙内，盖上橙顶。",
    "入小甑，加酒、醋、水蒸熟，以醋、盐佐食。"
   ],
   "effect": [
    "理气",
    "开胃",
    "清热"
   ],
   "suitable": "秋季、食欲不振者适量。",
   "caution": "水产过敏者忌；脾胃虚寒者少食。",
   "original": "橙用黄熟大者截顶，剜去穰，留少液，以蟹膏肉实其内，仍以带枝顶覆之，入小甑，用酒、醋、水蒸熟，用醋盐供食。",
   "modern": "橙 2 个，蟹肉 100 克，蟹黄 30 克，酒、醋各 10 毫升，盐少许。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷下 蟹酿橙",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "boxia-gong",
   "name": "拨霞供",
   "cat": "菜肴",
   "ingredients": [
    {
     "name": "兔肉",
     "amount": "300 克"
    },
    {
     "name": "酒",
     "amount": "15 毫升"
    },
    {
     "name": "酱油",
     "amount": "15 毫升"
    },
    {
     "name": "花椒",
     "amount": "3 克"
    },
    {
     "name": "姜",
     "amount": "少许"
    },
    {
     "name": "葱",
     "amount": "少许"
    }
   ],
   "method": [
    "兔肉切薄片。",
    "用酒、酱油、花椒、姜、葱腌渍。",
    "风炉上置水锅，汤响后夹肉入汤涮熟，蘸汁食用。"
   ],
   "effect": [
    "益气",
    "温中",
    "养血"
   ],
   "suitable": "秋冬季节、气虚者适量。",
   "caution": "外感期间少食；肉片须涮熟。",
   "original": "山间只用薄批，酒、酱、椒料沃之，以风炉安座上，用水少半铫，候汤响，一杯后各分以箸，令自夹入汤，摆熟啖之，乃随宜各以汁供。",
   "modern": "兔肉 300 克，酒 15 毫升，酱油 15 毫升，花椒 3 克，姜、葱少许。",
   "adaptation": "原方记猪羊皆可，今用兔肉；亦可换猪里脊或羊肉。",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 拨霞供",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "bojin-zhuyu",
   "name": "煿金煮玉",
   "cat": "菜肴",
   "ingredients": [
    {
     "name": "春笋",
     "amount": "300 克"
    },
    {
     "name": "面粉",
     "amount": "50 克"
    },
    {
     "name": "芝麻油",
     "amount": "适量"
    },
    {
     "name": "盐",
     "amount": "少许"
    }
   ],
   "method": [
    "春笋取鲜嫩者，切条。",
    "以盐、调料和薄面糊，裹笋。",
    "入油锅煎至金黄，佐餐食用。"
   ],
   "effect": [
    "消食",
    "清热",
    "健脾"
   ],
   "suitable": "春季、饮食积滞者适量。",
   "caution": "油炸食品，不宜多食；脾胃虚寒者少食。",
   "original": "笋取鲜嫩者，以料物和薄面，拖油煎煿，如黄金色，甘脆可爱。",
   "modern": "春笋 300 克，面粉 50 克，芝麻油适量，盐少许。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 煿金煮玉",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "baihe-mian",
   "name": "百合面",
   "cat": "糕点",
   "ingredients": [
    {
     "name": "百合根",
     "amount": "200 克"
    },
    {
     "name": "面粉",
     "amount": "200 克"
    }
   ],
   "method": [
    "百合根洗净，曝干后捣筛成粉。",
    "与面粉和匀，加水揉成面团。",
    "擀薄切条，入汤煮熟，调味食用。"
   ],
   "effect": [
    "润肺",
    "安神",
    "清热"
   ],
   "suitable": "秋燥、心神不宁者适量。",
   "caution": "风寒外感、脾胃虚寒者少食。",
   "original": "春秋仲月，采百合根曝干捣筛，和面作汤饼，最益血气。又蒸熟可以佐酒。",
   "modern": "百合根 200 克，面粉 200 克。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 百合面",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "huangjing-bing",
   "name": "黄精果饼茹",
   "cat": "糕点",
   "ingredients": [
    {
     "name": "黄精",
     "amount": "500 克"
    },
    {
     "name": "黑豆",
     "amount": "100 克"
    },
    {
     "name": "蜂蜜",
     "amount": "适量"
    }
   ],
   "method": [
    "黄精洗净，九蒸九曝。",
    "捣如饴状，可作果食。",
    "或加炒黑豆末作饼，蒸熟食用。"
   ],
   "effect": [
    "益气",
    "滋阴",
    "健脾"
   ],
   "suitable": "气虚、阴虚，秋冬适量。",
   "caution": "痰湿内盛、腹胀者少食。",
   "original": "仲春深采根，九蒸九曝，捣如饴，可作果食。又细一石，水二石五升，煮去苦味，漉入绢袋压汁，澄之，再煮如膏，以炒黑豆黄为末作饼，约二寸大，客至可供二枚。",
   "modern": "黄精 500 克，黑豆 100 克，蜂蜜适量。",
   "adaptation": "",
   "sourceBook": "山家清供",
   "sourceChapter": "卷上 黄精果饼茹",
   "grade": "乙",
   "status": "已核",
   "uncertain": ""
  },
  {
   "id": "yuling-gao",
   "name": "玉灵膏",
   "cat": "其他",
   "ingredients": [
    {
     "name": "龙眼肉",
     "amount": "100 克"
    },
    {
     "name": "白糖",
     "amount": "10 克"
    },
    {
     "name": "西洋参",
     "amount": "10 克"
    }
   ],
   "method": [
    "龙眼肉剥好，盛于瓷碗。",
    "每龙眼肉一两，入白糖一钱；素体多火者加西洋参片。",
    "碗口盖丝绵，置饭锅上蒸至稠厚，每次取一匙开水化服。"
   ],
   "effect": [
    "养血",
    "益气",
    "安神"
   ],
   "suitable": "气血不足、老人体弱者适量。",
   "caution": "痰火内盛、大便滑泻者少食；需控制糖分摄入者慎食。",
   "original": "自剥好龙眼，盛竹筒式瓷碗内，每肉一两，入白洋糖一钱，素体多火者，再入西洋参片，如糖之数。碗口幂以丝绵一层，日日于饭锅上蒸之，蒸到百次。",
   "modern": "龙眼肉 100 克，白糖 10 克，西洋参 10 克。",
   "adaptation": "",
   "sourceBook": "随息居饮食谱",
   "sourceChapter": "果食类 龙眼",
   "grade": "乙",
   "status": "已核",
   "uncertain": "随息居饮食谱果食类龙眼条与玉灵膏原文未核到在线底本。"
  }
 ],
 "yaoshi": [
  {
   "name": "丁香",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "八角茴香",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "刀豆",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "小茴香",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "小蓟",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "山药",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "山楂",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "马齿苋",
   "status": "目录内",
   "note": "孕期慎用"
  },
  {
   "name": "乌梢蛇",
   "status": "目录内",
   "note": "按目录规定使用"
  },
  {
   "name": "乌梅",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "木瓜",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "火麻仁",
   "status": "目录内",
   "note": "不宜过量"
  },
  {
   "name": "代代花",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "玉竹",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "甘草",
   "status": "目录内",
   "note": "不宜长期大量食用"
  },
  {
   "name": "白芷",
   "status": "目录内",
   "note": "香辛料用法为主"
  },
  {
   "name": "白果",
   "status": "目录内",
   "note": "不宜生食与过量"
  },
  {
   "name": "白扁豆",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "白扁豆花",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "龙眼肉",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "决明子",
   "status": "目录内",
   "note": "孕期慎用"
  },
  {
   "name": "百合",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "肉豆蔻",
   "status": "目录内",
   "note": "香辛料用法为主"
  },
  {
   "name": "肉桂",
   "status": "目录内",
   "note": "香辛料用法为主"
  },
  {
   "name": "余甘子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "佛手",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "杏仁",
   "status": "目录内",
   "note": "苦杏仁须炮制并控制用量"
  },
  {
   "name": "沙棘",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "牡蛎",
   "status": "目录内",
   "note": "按目录规定使用"
  },
  {
   "name": "芡实",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "花椒",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "赤小豆",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "阿胶",
   "status": "目录内",
   "note": "按目录规定使用"
  },
  {
   "name": "鸡内金",
   "status": "目录内",
   "note": "按目录规定使用"
  },
  {
   "name": "麦芽",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "昆布",
   "status": "目录内",
   "note": "含碘，需控制碘摄入者慎食"
  },
  {
   "name": "大枣",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "罗汉果",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "郁李仁",
   "status": "目录内",
   "note": "不宜过量"
  },
  {
   "name": "金银花",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "青果",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "鱼腥草",
   "status": "目录内",
   "note": "不宜长期大量食用"
  },
  {
   "name": "生姜",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "枳椇子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "枸杞子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "栀子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "砂仁",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "胖大海",
   "status": "目录内",
   "note": "不宜长期大量饮用"
  },
  {
   "name": "茯苓",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "香橼",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "香薷",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "桃仁",
   "status": "目录内",
   "note": "孕期慎用"
  },
  {
   "name": "桑叶",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "桑枝",
   "status": "目录外",
   "note": "未列入现行食药物质目录；桑枝属可用于保健食品的物品，不作普通食品。2002年第一批此处为桑椹、桔红。"
  },
  {
   "name": "桔梗",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "益智仁",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "荷叶",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "莱菔子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "莲子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "高良姜",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "淡竹叶",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "淡豆豉",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "菊花",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "菊苣",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "黄芥子",
   "status": "目录内",
   "note": "香辛料用法为主"
  },
  {
   "name": "黄精",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "紫苏",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "紫苏籽",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "葛根",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "黑芝麻",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "黑胡椒",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "槐米",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "槐花",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "蒲公英",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "蜂蜜",
   "status": "目录内",
   "note": "一岁内婴儿忌食"
  },
  {
   "name": "榧子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "酸枣仁",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "鲜白茅根",
   "status": "目录内",
   "note": "鲜品"
  },
  {
   "name": "鲜芦根",
   "status": "目录内",
   "note": "鲜品"
  },
  {
   "name": "蝮蛇",
   "status": "目录内",
   "note": "按目录规定使用"
  },
  {
   "name": "橘皮",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "薄荷",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "薏苡仁",
   "status": "目录内",
   "note": "孕期慎用"
  },
  {
   "name": "薤白",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "覆盆子",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "藿香",
   "status": "目录内",
   "note": ""
  },
  {
   "name": "人参",
   "status": "目录外",
   "note": "未列入现行食药物质目录；人工种植人参按新资源食品（新食品原料）管理（卫生部2012年第17号公告），限5年及5年以下，每日不超过3克，孕妇、哺乳期妇女及14周岁以下儿童不宜。"
  },
  {
   "name": "山银花",
   "status": "目录外",
   "note": "未列入现行食药物质目录；2014年征求意见稿曾列，未正式发布。"
  },
  {
   "name": "芫荽",
   "status": "目录外",
   "note": "未列入现行食药物质目录；属普通蔬菜。"
  },
  {
   "name": "玫瑰花",
   "status": "目录外",
   "note": "未列入现行食药物质目录；重瓣红玫瑰按新资源食品管理（卫生部2010年第3号公告），可作为普通食品。"
  },
  {
   "name": "松花粉",
   "status": "目录外",
   "note": "未列入现行食药物质目录；2004年已按普通食品管理（卫生部2004年第17号公告）。"
  },
  {
   "name": "粉葛",
   "status": "目录外",
   "note": "未列入现行食药物质目录。"
  },
  {
   "name": "布渣叶",
   "status": "目录外",
   "note": "未列入现行食药物质目录；卫生部2010年第3号公告允许作为凉茶饮料原料。"
  },
  {
   "name": "夏枯草",
   "status": "目录外",
   "note": "未列入现行食药物质目录；卫生部2010年第3号公告允许作为凉茶饮料原料。"
  },
  {
   "name": "当归",
   "status": "目录内",
   "note": "2019年新增（2019年第8号公告），仅作香辛料和调味品；孕期慎用。"
  },
  {
   "name": "山奈",
   "status": "目录内",
   "note": "目录作山柰；2019年新增（2019年第8号公告），仅作香辛料和调味品。"
  },
  {
   "name": "西红花",
   "status": "目录内",
   "note": "2019年新增（2019年第8号公告），仅作香辛料和调味品；孕期慎用。"
  },
  {
   "name": "草果",
   "status": "目录内",
   "note": "2019年新增（2019年第8号公告），仅作香辛料和调味品。"
  },
  {
   "name": "姜黄",
   "status": "目录内",
   "note": "2019年新增（2019年第8号公告），仅作香辛料和调味品。"
  },
  {
   "name": "荜茇",
   "status": "目录内",
   "note": "2019年新增（2019年第8号公告），仅作香辛料和调味品。"
  },
  {
   "name": "党参",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "肉苁蓉",
   "status": "目录内",
   "note": "2023年由试点纳入目录，限荒漠肉苁蓉"
  },
  {
   "name": "铁皮石斛",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "西洋参",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "黄芪",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "灵芝",
   "status": "目录内",
   "note": "2023年由试点纳入目录，限赤芝与紫芝子实体"
  },
  {
   "name": "天麻",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "山茱萸",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "杜仲叶",
   "status": "目录内",
   "note": "2023年由试点纳入目录"
  },
  {
   "name": "地黄",
   "status": "目录内",
   "note": "2024年新增"
  },
  {
   "name": "麦冬",
   "status": "目录内",
   "note": "2024年新增"
  },
  {
   "name": "天冬",
   "status": "目录内",
   "note": "2024年新增"
  },
  {
   "name": "化橘红",
   "status": "目录内",
   "note": "2024年新增"
  },
  {
   "name": "三七",
   "status": "目录外",
   "note": "未列入现行目录，仅作药材，不作食用推荐"
  },
  {
   "name": "丹参",
   "status": "目录外",
   "note": "未列入现行目录，仅作药材"
  },
  {
   "name": "何首乌",
   "status": "目录外",
   "note": "未列入现行目录，生熟异用，不作食用推荐"
  },
  {
   "name": "鹿茸",
   "status": "目录外",
   "note": "未列入现行目录，仅作药材"
  },
  {
   "name": "石斛",
   "status": "目录外",
   "note": "目录内仅列铁皮石斛，其他石斛未列"
  },
  {
   "name": "冬虫夏草",
   "status": "目录外",
   "note": "未列入现行目录，属保健食品原料管理"
  },
  {
   "name": "桑椹",
   "status": "目录内",
   "note": "现行目录（2002年第一批）收录，本表未列，建议补列。"
  },
  {
   "name": "桔红",
   "status": "目录内",
   "note": "现行目录（2002年第一批）收录，本表未列，建议补列；与2024年新增的化橘红非同一项。"
  }
 ],
 "books": [
  {
   "name": "黄帝内经",
   "author": "佚名（托名黄帝）",
   "era": "先秦至西汉",
   "grade": "A",
   "use": "食养总源，五方地域与五味五脏",
   "link": "https://zh.wikisource.org/wiki/黃帝內經"
  },
  {
   "name": "神农本草经",
   "author": "佚名（托名神农）",
   "era": "东汉",
   "grade": "A",
   "use": "药性源流，上中下品",
   "link": "https://zh.wikisource.org/wiki/神農本草經"
  },
  {
   "name": "食疗本草",
   "author": "孟诜",
   "era": "唐",
   "grade": "B",
   "use": "食疗源流，单味条目",
   "link": "https://zh.wikisource.org/wiki/食療本草"
  },
  {
   "name": "备急千金要方",
   "author": "孙思邈",
   "era": "唐",
   "grade": "A",
   "use": "食治总论与食治方",
   "link": "https://zh.wikisource.org/wiki/備急千金要方"
  },
  {
   "name": "千金翼方",
   "author": "孙思邈",
   "era": "唐",
   "grade": "B",
   "use": "养老食疗",
   "link": "https://zh.wikisource.org/wiki/千金翼方"
  },
  {
   "name": "外台秘要",
   "author": "王焘",
   "era": "唐",
   "grade": "A",
   "use": "食治方汇",
   "link": "https://zh.wikisource.org/wiki/外臺秘要"
  },
  {
   "name": "太平圣惠方",
   "author": "王怀隐等",
   "era": "北宋",
   "grade": "A",
   "use": "食治门方",
   "link": "https://zh.wikisource.org/wiki/太平聖惠方"
  },
  {
   "name": "圣济总录",
   "author": "赵佶敕编",
   "era": "北宋",
   "grade": "A",
   "use": "食治门方",
   "link": "https://zh.wikisource.org/wiki/政和聖濟總錄"
  },
  {
   "name": "饮膳正要",
   "author": "忽思慧",
   "era": "元",
   "grade": "B",
   "use": "宫廷食疗与食疗诸病",
   "link": "https://zh.wikisource.org/wiki/飲膳正要"
  },
  {
   "name": "养老奉亲书",
   "author": "陈直",
   "era": "北宋",
   "grade": "B",
   "use": "老年食养",
   "link": "https://zh.wikisource.org/wiki/養老奉親書"
  },
  {
   "name": "本草纲目",
   "author": "李时珍",
   "era": "明",
   "grade": "A",
   "use": "本草集大成，食物条目",
   "link": "https://zh.wikisource.org/wiki/本草綱目"
  },
  {
   "name": "食物本草",
   "author": "卢和（题李时珍）",
   "era": "明",
   "grade": "C",
   "use": "食物条目，传本题李时珍",
   "link": ""
  },
  {
   "name": "日用本草",
   "author": "吴瑞",
   "era": "元",
   "grade": "B",
   "use": "日常食物条目",
   "link": "https://zh.wikisource.org/wiki/日用本草"
  },
  {
   "name": "救荒本草",
   "author": "朱橚",
   "era": "明",
   "grade": "B",
   "use": "救荒可食植物",
   "link": ""
  },
  {
   "name": "山家清供",
   "author": "林洪",
   "era": "南宋",
   "grade": "B",
   "use": "山家食谱与清供",
   "link": "https://zh.wikisource.org/wiki/山家清供"
  },
  {
   "name": "随息居饮食谱",
   "author": "王士雄",
   "era": "清",
   "grade": "B",
   "use": "饮食调养条目",
   "link": ""
  },
  {
   "name": "老老恒言",
   "author": "曹庭栋",
   "era": "清",
   "grade": "B",
   "use": "老年粥谱",
   "link": "https://zh.wikisource.org/wiki/養生隨筆"
  },
  {
   "name": "调疾饮食辨",
   "author": "章穆",
   "era": "清",
   "grade": "B",
   "use": "饮食辨误",
   "link": ""
  },
  {
   "name": "本草求真",
   "author": "黄宫绣",
   "era": "清",
   "grade": "B",
   "use": "药性归类",
   "link": "https://zh.wikisource.org/wiki/本草求真"
  },
  {
   "name": "遵生八笺",
   "author": "高濂",
   "era": "明",
   "grade": "B",
   "use": "饮馔服食",
   "link": "https://zh.wikisource.org/wiki/遵生八牋"
  }
 ],
 "constitutions": [
  {
   "id": "pinghe",
   "name": "平和",
   "traits": "体态匀称，面色红润，精力充沛。",
   "principle": "均衡膳食，寒温适中。",
   "eat": [
    "粳米",
    "山药",
    "莲子"
   ],
   "avoid": [
    "过寒",
    "过热",
    "过饱"
   ],
   "recipes": [
    "山药粥"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "qixu",
   "name": "气虚",
   "traits": "肌肉松软，气短懒言，容易疲乏。",
   "principle": "健脾益气，饮食温和易消化。",
   "eat": [
    "小米",
    "山药",
    "大枣",
    "香菇"
   ],
   "avoid": [
    "生冷",
    "油腻",
    "过饱"
   ],
   "recipes": [
    "小米山药粥"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "yangxu",
   "name": "阳虚",
   "traits": "畏寒怕冷，手足不温，喜热饮食。",
   "principle": "温阳散寒，少食生冷。",
   "eat": [
    "羊肉",
    "生姜",
    "桂圆",
    "韭菜"
   ],
   "avoid": [
    "生冷",
    "冰饮",
    "寒凉"
   ],
   "recipes": [
    "生姜羊肉汤"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "yinxu",
   "name": "阴虚",
   "traits": "口燥咽干，手足心热，喜冷饮。",
   "principle": "滋阴润燥，少食辛辣。",
   "eat": [
    "银耳",
    "百合",
    "梨",
    "鸭肉"
   ],
   "avoid": [
    "辛辣",
    "煎炸",
    "温燥"
   ],
   "recipes": [
    "银耳百合羹"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "tanshi",
   "name": "痰湿",
   "traits": "体形肥胖，腹部肥满，口黏苔腻。",
   "principle": "健脾化湿，清淡少油。",
   "eat": [
    "薏苡仁",
    "赤小豆",
    "冬瓜",
    "白萝卜"
   ],
   "avoid": [
    "肥甘",
    "厚味",
    "过甜"
   ],
   "recipes": [
    "薏苡仁赤小豆粥"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "shire",
   "name": "湿热",
   "traits": "面垢油光，口苦口干，易生痤疮。",
   "principle": "清热利湿，少食辛温。",
   "eat": [
    "绿豆",
    "冬瓜",
    "苦瓜",
    "薏苡仁"
   ],
   "avoid": [
    "辛辣",
    "烧烤",
    "酒"
   ],
   "recipes": [
    "绿豆冬瓜汤"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "xueyu",
   "name": "血瘀",
   "traits": "肤色偏暗，口唇偏暗，易有瘀斑。",
   "principle": "活血化瘀，饮食温和。",
   "eat": [
    "山楂",
    "黑木耳",
    "洋葱",
    "油菜"
   ],
   "avoid": [
    "过咸",
    "生冷",
    "油腻"
   ],
   "recipes": [
    "山楂黑木耳汤"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "qiyu",
   "name": "气郁",
   "traits": "情绪低落，胸胁胀满，喜叹息。",
   "principle": "疏肝理气，饮食清淡芳香。",
   "eat": [
    "柑橘",
    "萝卜",
    "玫瑰花",
    "佛手"
   ],
   "avoid": [
    "油腻",
    "过甜",
    "饮酒"
   ],
   "recipes": [
    "玫瑰花茶"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  },
  {
   "id": "tebing",
   "name": "特禀",
   "traits": "易过敏，常见鼻痒喷嚏或皮肤起疹。",
   "principle": "清淡均衡，回避已知致敏食物。",
   "eat": [
    "粳米",
    "山药",
    "冬瓜",
    "青菜"
   ],
   "avoid": [
    "已知致敏食物",
    "生冷",
    "辛辣"
   ],
   "recipes": [
    "山药冬瓜汤"
   ],
   "source": "中医体质分类与判定 ZYYXH/T157-2009",
   "grade": "甲"
  }
 ],
 "seasons": [
  {
   "id": "spring",
   "name": "春",
   "period": "立春至立夏",
   "principle": "养肝升发，少酸增甘。",
   "eat": [
    "春笋",
    "荠菜",
    "菠菜"
   ],
   "avoid": [
    "过酸",
    "油腻"
   ],
   "recipes": [
    "荠菜粥"
   ],
   "note": "春季宜选新鲜绿叶菜。",
   "source": "《素问》四气调神大论",
   "grade": "乙"
  },
  {
   "id": "summer",
   "name": "夏",
   "period": "立夏至小暑",
   "principle": "清热解暑，足量饮水。",
   "eat": [
    "绿豆",
    "冬瓜",
    "苦瓜",
    "西瓜"
   ],
   "avoid": [
    "过食生冷",
    "冰饮"
   ],
   "recipes": [
    "绿豆汤"
   ],
   "note": "出汗较多时注意补水与电解质。",
   "source": "《素问》四气调神大论",
   "grade": "乙"
  },
  {
   "id": "changxia",
   "name": "长夏",
   "period": "小暑至立秋",
   "principle": "健脾化湿，饮食清淡。",
   "eat": [
    "薏苡仁",
    "赤小豆",
    "冬瓜",
    "扁豆"
   ],
   "avoid": [
    "肥甘厚味",
    "过甜"
   ],
   "recipes": [
    "薏苡仁赤小豆粥"
   ],
   "note": "湿气偏重，注意食物保存与加热。",
   "source": "《素问》藏气法时论",
   "grade": "乙"
  },
  {
   "id": "autumn",
   "name": "秋",
   "period": "立秋至立冬",
   "principle": "养阴润燥，少辛增酸。",
   "eat": [
    "梨",
    "百合",
    "银耳",
    "莲藕"
   ],
   "avoid": [
    "辛辣",
    "煎炸"
   ],
   "recipes": [
    "银耳百合羹"
   ],
   "note": "秋燥明显，注意补水与新鲜蔬果。",
   "source": "《素问》四气调神大论",
   "grade": "乙"
  },
  {
   "id": "winter",
   "name": "冬",
   "period": "立冬至立春",
   "principle": "温补藏精，适量增苦。",
   "eat": [
    "羊肉",
    "萝卜",
    "白菜",
    "核桃"
   ],
   "avoid": [
    "生冷",
    "过咸"
   ],
   "recipes": [
    "萝卜羊肉汤"
   ],
   "note": "进补因人而异，不宜过食肥甘。",
   "source": "《素问》四气调神大论",
   "grade": "乙"
  }
 ],
 "regions": [
  {
   "id": "dongbei",
   "name": "东北",
   "provinces": [
    "黑龙江",
    "吉林",
    "辽宁"
   ],
   "climate": "寒冷期长，无霜期短，炖菜、腌菜、面食与玉米多。",
   "principle": "温补、控盐、增蔬果与奶豆。",
   "prefer": [
    "温补",
    "健脾"
   ],
   "avoid": [
    "高盐",
    "生冷"
   ],
   "seasonal": {
    "spring": [
     "白菜",
     "萝卜",
     "菠菜",
     "豆芽"
    ],
    "summer": [
     "黄瓜",
     "番茄",
     "茄子",
     "豆角"
    ],
    "changxia": [
     "薏苡仁",
     "赤小豆",
     "冬瓜",
     "绿豆"
    ],
    "autumn": [
     "梨",
     "百合",
     "苹果",
     "南瓜"
    ],
    "winter": [
     "羊肉",
     "萝卜",
     "白菜",
     "土豆"
    ]
   },
   "localFoods": [
    "白菜",
    "土豆",
    "玉米",
    "木耳"
   ],
   "notes": "内蒙古东部气候接近东北，按过渡区处理。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "huabei",
   "name": "华北",
   "provinces": [
    "北京",
    "天津",
    "河北",
    "山西",
    "内蒙古"
   ],
   "climate": "四季分明，冬春干燥多风，面食与杂粮多。",
   "principle": "润燥、控盐、粗细搭配。",
   "prefer": [
    "润燥",
    "健脾"
   ],
   "avoid": [
    "高盐",
    "煎炸"
   ],
   "seasonal": {
    "spring": [
     "菠菜",
     "豆芽",
     "韭菜",
     "香椿"
    ],
    "summer": [
     "黄瓜",
     "番茄",
     "西瓜",
     "茄子"
    ],
    "changxia": [
     "薏苡仁",
     "绿豆",
     "冬瓜",
     "赤小豆"
    ],
    "autumn": [
     "梨",
     "银耳",
     "苹果",
     "南瓜"
    ],
    "winter": [
     "羊肉",
     "白菜",
     "萝卜",
     "大枣"
    ]
   },
   "localFoods": [
    "小麦",
    "玉米",
    "山药",
    "大枣"
   ],
   "notes": "内蒙古跨度大，西部偏干旱。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "huadong",
   "name": "华东",
   "provinces": [
    "上海",
    "江苏",
    "浙江",
    "安徽",
    "福建",
    "江西",
    "山东"
   ],
   "climate": "沿海湿润，河网密布，稻米、水产与茶叶多。",
   "principle": "清淡、少油、足量水产与蔬菜。",
   "prefer": [
    "清淡",
    "利湿"
   ],
   "avoid": [
    "高盐",
    "高糖"
   ],
   "seasonal": {
    "spring": [
     "春笋",
     "荠菜",
     "菠菜",
     "莼菜"
    ],
    "summer": [
     "冬瓜",
     "丝瓜",
     "黄瓜",
     "番茄"
    ],
    "changxia": [
     "薏苡仁",
     "赤小豆",
     "冬瓜",
     "绿豆"
    ],
    "autumn": [
     "莲藕",
     "梨",
     "银耳",
     "百合"
    ],
    "winter": [
     "白菜",
     "萝卜",
     "冬笋",
     "菠菜"
    ]
   },
   "localFoods": [
    "稻米",
    "淡水鱼",
    "茶叶",
    "莲藕"
   ],
   "notes": "沿海与内陆差异明显。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "huazhong",
   "name": "华中",
   "provinces": [
    "河南",
    "湖北",
    "湖南"
   ],
   "climate": "南北过渡，湿润多雨，稻米、莲藕与淡水鱼多。",
   "principle": "清淡、控油、足量蔬果。",
   "prefer": [
    "健脾",
    "利湿"
   ],
   "avoid": [
    "高盐",
    "重辣"
   ],
   "seasonal": {
    "spring": [
     "菠菜",
     "莴笋",
     "春笋",
     "荠菜"
    ],
    "summer": [
     "苦瓜",
     "冬瓜",
     "黄瓜",
     "丝瓜"
    ],
    "changxia": [
     "薏苡仁",
     "赤小豆",
     "莲子",
     "冬瓜"
    ],
    "autumn": [
     "莲藕",
     "梨",
     "百合",
     "银耳"
    ],
    "winter": [
     "萝卜",
     "白菜",
     "莲藕",
     "菠菜"
    ]
   },
   "localFoods": [
    "稻米",
    "莲藕",
    "淡水鱼",
    "莲子"
   ],
   "notes": "河南饮食偏北方。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "huanan",
   "name": "华南",
   "provinces": [
    "广东",
    "广西",
    "海南"
   ],
   "climate": "湿热期长，稻米、水产与热带水果多，汤品与粥品常见。",
   "principle": "清淡、少油、足量蔬菜。",
   "prefer": [
    "利湿",
    "健脾"
   ],
   "avoid": [
    "高糖",
    "煎炸"
   ],
   "seasonal": {
    "spring": [
     "菠菜",
     "豆芽",
     "芥菜",
     "春笋"
    ],
    "summer": [
     "冬瓜",
     "苦瓜",
     "黄瓜",
     "丝瓜"
    ],
    "changxia": [
     "薏苡仁",
     "赤小豆",
     "冬瓜",
     "绿豆"
    ],
    "autumn": [
     "梨",
     "百合",
     "银耳",
     "莲藕"
    ],
    "winter": [
     "萝卜",
     "白菜",
     "菠菜",
     "芥菜"
    ]
   },
   "localFoods": [
    "稻米",
    "荔枝",
    "龙眼",
    "海鲜"
   ],
   "notes": "海南热带气候明显。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "xinan",
   "name": "西南",
   "provinces": [
    "重庆",
    "四川",
    "贵州",
    "云南"
   ],
   "climate": "多山湿润，冬无严寒，菌类、腌腊与麻辣调味常见。",
   "principle": "控盐、控油、足量蔬果。",
   "prefer": [
    "健脾",
    "利湿"
   ],
   "avoid": [
    "高盐",
    "重辣"
   ],
   "seasonal": {
    "spring": [
     "春笋",
     "豌豆",
     "菠菜",
     "香椿"
    ],
    "summer": [
     "苦瓜",
     "冬瓜",
     "黄瓜",
     "茄子"
    ],
    "changxia": [
     "薏苡仁",
     "赤小豆",
     "冬瓜",
     "绿豆"
    ],
    "autumn": [
     "梨",
     "银耳",
     "百合",
     "南瓜"
    ],
    "winter": [
     "萝卜",
     "白菜",
     "菠菜",
     "豌豆"
    ]
   },
   "localFoods": [
    "稻米",
    "辣椒",
    "菌菇",
    "竹笋"
   ],
   "notes": "高原地区另按青藏处理。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "xibei",
   "name": "西北",
   "provinces": [
    "陕西",
    "甘肃",
    "宁夏",
    "新疆"
   ],
   "climate": "干旱少雨，日照充足，面食、牛羊肉与瓜果多。",
   "principle": "润燥、控盐、增蔬果。",
   "prefer": [
    "润燥",
    "温补"
   ],
   "avoid": [
    "高盐",
    "煎炸"
   ],
   "seasonal": {
    "spring": [
     "菠菜",
     "豆芽",
     "韭菜",
     "萝卜"
    ],
    "summer": [
     "黄瓜",
     "西瓜",
     "番茄",
     "茄子"
    ],
    "changxia": [
     "绿豆",
     "薏苡仁",
     "冬瓜",
     "赤小豆"
    ],
    "autumn": [
     "梨",
     "百合",
     "苹果",
     "南瓜"
    ],
    "winter": [
     "羊肉",
     "萝卜",
     "白菜",
     "大枣"
    ]
   },
   "localFoods": [
    "小麦",
    "羊肉",
    "哈密瓜",
    "大枣"
   ],
   "notes": "新疆昼夜温差大，瓜果含糖量高。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "qingzang",
   "name": "青藏",
   "provinces": [
    "青海",
    "西藏"
   ],
   "climate": "高原气候，气压低，日照强，青稞、牦牛肉与奶制品多。",
   "principle": "保证能量与水分，食物充分加热。",
   "prefer": [
    "温补",
    "健脾"
   ],
   "avoid": [
    "生冷",
    "高盐"
   ],
   "seasonal": {
    "spring": [
     "萝卜",
     "白菜",
     "菠菜",
     "土豆"
    ],
    "summer": [
     "豌豆",
     "萝卜",
     "菠菜",
     "番茄"
    ],
    "changxia": [
     "山药",
     "薏苡仁",
     "萝卜",
     "白菜"
    ],
    "autumn": [
     "梨",
     "百合",
     "苹果",
     "萝卜"
    ],
    "winter": [
     "羊肉",
     "萝卜",
     "白菜",
     "土豆"
    ]
   },
   "localFoods": [
    "青稞",
    "牦牛肉",
    "奶制品",
    "土豆"
   ],
   "notes": "烹饪以炖煮为主，高原沸点低。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  },
  {
   "id": "gangaotai",
   "name": "港澳台",
   "provinces": [
    "香港",
    "澳门",
    "台湾"
   ],
   "climate": "亚热带海洋性气候，湿热期长，汤品、粥品与海鲜多。",
   "principle": "清淡、少油、足量蔬菜与水产。",
   "prefer": [
    "利湿",
    "健脾"
   ],
   "avoid": [
    "高糖",
    "高盐"
   ],
   "seasonal": {
    "spring": [
     "菠菜",
     "豆芽",
     "芥菜",
     "春笋"
    ],
    "summer": [
     "冬瓜",
     "苦瓜",
     "黄瓜",
     "丝瓜"
    ],
    "changxia": [
     "薏苡仁",
     "赤小豆",
     "冬瓜",
     "绿豆"
    ],
    "autumn": [
     "梨",
     "百合",
     "银耳",
     "莲藕"
    ],
    "winter": [
     "萝卜",
     "白菜",
     "菠菜",
     "芥菜"
    ]
   },
   "localFoods": [
    "稻米",
    "海鲜",
    "热带水果",
    "冬瓜"
   ],
   "notes": "港澳受粤式饮食影响明显。",
   "source": "《素问》异法方宜论与气候物产通行说",
   "grade": "丙"
  }
 ],
 "provinces": [
  {
   "province": "北京",
   "region": "华北",
   "note": ""
  },
  {
   "province": "天津",
   "region": "华北",
   "note": ""
  },
  {
   "province": "河北",
   "region": "华北",
   "note": ""
  },
  {
   "province": "山西",
   "region": "华北",
   "note": ""
  },
  {
   "province": "内蒙古",
   "region": "华北",
   "note": "东部气候接近东北，按过渡区处理。"
  },
  {
   "province": "辽宁",
   "region": "东北",
   "note": ""
  },
  {
   "province": "吉林",
   "region": "东北",
   "note": ""
  },
  {
   "province": "黑龙江",
   "region": "东北",
   "note": ""
  },
  {
   "province": "上海",
   "region": "华东",
   "note": ""
  },
  {
   "province": "江苏",
   "region": "华东",
   "note": ""
  },
  {
   "province": "浙江",
   "region": "华东",
   "note": ""
  },
  {
   "province": "安徽",
   "region": "华东",
   "note": ""
  },
  {
   "province": "福建",
   "region": "华东",
   "note": ""
  },
  {
   "province": "江西",
   "region": "华东",
   "note": ""
  },
  {
   "province": "山东",
   "region": "华东",
   "note": ""
  },
  {
   "province": "河南",
   "region": "华中",
   "note": "饮食偏北方。"
  },
  {
   "province": "湖北",
   "region": "华中",
   "note": ""
  },
  {
   "province": "湖南",
   "region": "华中",
   "note": ""
  },
  {
   "province": "广东",
   "region": "华南",
   "note": ""
  },
  {
   "province": "广西",
   "region": "华南",
   "note": ""
  },
  {
   "province": "海南",
   "region": "华南",
   "note": "热带气候明显。"
  },
  {
   "province": "重庆",
   "region": "西南",
   "note": ""
  },
  {
   "province": "四川",
   "region": "西南",
   "note": ""
  },
  {
   "province": "贵州",
   "region": "西南",
   "note": ""
  },
  {
   "province": "云南",
   "region": "西南",
   "note": "立体气候明显。"
  },
  {
   "province": "西藏",
   "region": "青藏",
   "note": "高原气候，按青藏处理。"
  },
  {
   "province": "陕西",
   "region": "西北",
   "note": "南北跨越明显，陕南接近华中。"
  },
  {
   "province": "甘肃",
   "region": "西北",
   "note": "东西狭长，差异明显。"
  },
  {
   "province": "青海",
   "region": "青藏",
   "note": "高原气候，按青藏处理。"
  },
  {
   "province": "宁夏",
   "region": "西北",
   "note": ""
  },
  {
   "province": "新疆",
   "region": "西北",
   "note": "昼夜温差大，瓜果含糖量高。"
  },
  {
   "province": "香港",
   "region": "港澳台",
   "note": ""
  },
  {
   "province": "澳门",
   "region": "港澳台",
   "note": ""
  },
  {
   "province": "台湾",
   "region": "港澳台",
   "note": "亚热带与热带并存。"
  }
 ],
 "groups": [
  {
   "id": "yingyouer",
   "name": "婴幼儿",
   "age": "0 至 3 岁",
   "principle": "母乳优先，及时添加辅食，少盐少糖。",
   "eat": [
    "母乳",
    "强化铁米粉",
    "蔬菜泥"
   ],
   "avoid": [
    "蜂蜜",
    "整粒坚果",
    "高盐"
   ],
   "amount": "按需喂养，辅食由少到多、由细到粗。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "xuelingqian",
   "name": "学龄前",
   "age": "3 至 6 岁",
   "principle": "食物多样，规律进餐，少油少盐。",
   "eat": [
    "谷薯",
    "蔬菜",
    "水果",
    "蛋奶"
   ],
   "avoid": [
    "高糖零食",
    "含糖饮料"
   ],
   "amount": "每日三餐两点，奶类 350 至 500 克。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "ertongqingshaonian",
   "name": "儿童青少年",
   "age": "6 至 17 岁",
   "principle": "足量谷薯与优质蛋白，控制含糖饮料。",
   "eat": [
    "谷薯",
    "蔬菜",
    "水果",
    "奶类"
   ],
   "avoid": [
    "高糖",
    "高盐",
    "含糖饮料"
   ],
   "amount": "每日奶类 300 克以上，足量饮水。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "chengren",
   "name": "成人",
   "age": "18 至 64 岁",
   "principle": "平衡膳食，吃动平衡。",
   "eat": [
    "谷薯",
    "蔬菜",
    "水果"
   ],
   "avoid": [
    "高盐",
    "高糖"
   ],
   "amount": "按膳食指南成人量。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "laoren",
   "name": "老人",
   "age": "65 岁及以上",
   "principle": "食物细软，足量优质蛋白，主动饮水。",
   "eat": [
    "鱼",
    "蛋",
    "奶",
    "豆制品"
   ],
   "avoid": [
    "过硬",
    "过咸",
    "过油"
   ],
   "amount": "少量多餐，保证优质蛋白与水分。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "yunqi",
   "name": "孕期",
   "age": "孕前至分娩",
   "principle": "均衡多样，补充叶酸与铁，食物充分加热。",
   "eat": [
    "瘦肉",
    "蛋",
    "奶",
    "深色蔬菜"
   ],
   "avoid": [
    "生食",
    "酒精",
    "高汞鱼"
   ],
   "amount": "孕中晚期适量增加能量与优质蛋白。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "buruqi",
   "name": "哺乳期",
   "age": "分娩后哺乳阶段",
   "principle": "足量汤水，优质蛋白，食物多样。",
   "eat": [
    "鱼",
    "蛋",
    "奶",
    "豆制品",
    "蔬菜"
   ],
   "avoid": [
    "酒精",
    "过量咖啡因"
   ],
   "amount": "每日增加优质蛋白与水分。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "sushizhe",
   "name": "素食者",
   "age": "各年龄段",
   "principle": "谷豆搭配，补充维生素 B12 与铁。",
   "eat": [
    "谷类",
    "豆类",
    "坚果",
    "深色蔬菜"
   ],
   "avoid": [
    "长期单一",
    "精制主食"
   ],
   "amount": "按年龄与活动量调整。",
   "source": "中国居民膳食指南 2022",
   "grade": "乙"
  },
  {
   "id": "tili",
   "name": "体力劳动者",
   "age": "18 至 64 岁",
   "principle": "保证能量与水分，主食充足，注意补盐补水。",
   "eat": [
    "谷薯",
    "肉蛋",
    "奶豆",
    "蔬菜"
   ],
   "avoid": [
    "空腹作业",
    "只喝含糖饮料"
   ],
   "amount": "按劳动强度增加主食与水分。",
   "source": "中国居民膳食指南 2022",
   "grade": "乙"
  }
 ],
 "limits": [
  {
   "id": "kangtang",
   "name": "控糖",
   "avoid": [
    "含糖饮料",
    "精制糖"
   ],
   "replace": [
    "白水",
    "淡茶"
   ],
   "note": "按医师或营养师意见。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "kongyan",
   "name": "控盐",
   "avoid": [
    "咸菜",
    "腌制品",
    "高钠调味品"
   ],
   "replace": [
    "香辛料",
    "醋",
    "柠檬汁"
   ],
   "note": "每日食盐不超过 5 克。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "kongzhi",
   "name": "控脂",
   "avoid": [
    "油炸食品",
    "肥肉",
    "动物油"
   ],
   "replace": [
    "蒸煮炖",
    "植物油适量"
   ],
   "note": "每日烹调油 25 至 30 克。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "dipiaoling",
   "name": "低嘌呤",
   "avoid": [
    "动物内脏",
    "浓肉汤",
    "部分海鲜"
   ],
   "replace": [
    "蛋",
    "奶",
    "新鲜蔬菜"
   ],
   "note": "按医师或营养师意见，足量饮水。",
   "source": "中国居民膳食指南 2022",
   "grade": "乙"
  },
  {
   "id": "dijia",
   "name": "低钾",
   "avoid": [
    "香蕉",
    "橙子",
    "土豆",
    "低钠盐"
   ],
   "replace": [
    "苹果",
    "冬瓜",
    "精制米面"
   ],
   "note": "按医师或营养师意见，不自行使用低钠盐。",
   "source": "临床营养通行说",
   "grade": "乙"
  },
  {
   "id": "rutang",
   "name": "乳糖不耐",
   "avoid": [
    "大量鲜奶",
    "含乳饮料"
   ],
   "replace": [
    "酸奶",
    "低乳糖奶",
    "豆制品"
   ],
   "note": "少量多次，按耐受程度调整。",
   "source": "中国居民膳食指南 2022",
   "grade": "甲"
  },
  {
   "id": "fuzhi",
   "name": "麸质过敏",
   "avoid": [
    "小麦",
    "大麦",
    "黑麦制品"
   ],
   "replace": [
    "稻米",
    "玉米",
    "薯类"
   ],
   "note": "注意酱油与加工食品配料。",
   "source": "食品安全国家标准与膳食指南",
   "grade": "甲"
  },
  {
   "id": "jianguo",
   "name": "坚果过敏",
   "avoid": [
    "花生",
    "坚果及其制品"
   ],
   "replace": [
    "其他蛋白来源"
   ],
   "note": "注意交叉污染与配料表。",
   "source": "食品安全国家标准与膳食指南",
   "grade": "甲"
  }
 ],
 "balance": [
  {
   "id": "gushu",
   "cat": "谷薯",
   "amount": "谷类 200 至 300 克，薯类 50 至 100 克",
   "note": "全谷物与杂豆 50 至 150 克。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "shucai",
   "cat": "蔬菜",
   "amount": "300 至 500 克",
   "note": "深色蔬菜占一半。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "shuiguo",
   "cat": "水果",
   "amount": "200 至 350 克",
   "note": "果汁不能替代鲜果。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "xuqinrou",
   "cat": "畜禽肉",
   "amount": "40 至 75 克",
   "note": "少吃肥肉与烟熏制品。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "shuichan",
   "cat": "水产",
   "amount": "40 至 75 克",
   "note": "每周至少 2 次。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "dan",
   "cat": "蛋",
   "amount": "40 至 50 克",
   "note": "每日 1 个鸡蛋，不弃蛋黄。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "nai",
   "cat": "奶",
   "amount": "300 至 500 克",
   "note": "相当于液态奶 300 至 500 毫升。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "dadou",
   "cat": "大豆坚果",
   "amount": "25 至 35 克",
   "note": "大豆与坚果合计，坚果每周 70 克左右。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "you",
   "cat": "油",
   "amount": "25 至 30 克",
   "note": "不同植物油交替使用。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "yan",
   "cat": "盐",
   "amount": "不超过 5 克",
   "note": "包括酱油与腌制品中的钠。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "tang",
   "cat": "添加糖",
   "amount": "不超过 50 克，最好控制在 25 克以下",
   "note": "含糖饮料是主要来源。",
   "source": "中国居民膳食指南 2022"
  },
  {
   "id": "shui",
   "cat": "水",
   "amount": "1500 至 1700 毫升",
   "note": "少量多次，运动与高温时增加。",
   "source": "中国居民膳食指南 2022"
  }
 ],
 "hazards": [
  {
   "id": "shengdoujiang",
   "name": "生豆浆",
   "hazard": "皂苷与胰蛋白酶抑制剂",
   "handling": "煮沸后再小火 5 分钟。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "sijidou",
   "name": "四季豆",
   "hazard": "皂苷与植物血凝素",
   "handling": "充分加热至失去生绿色。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "xianhuanghuacai",
   "name": "鲜黄花菜",
   "hazard": "秋水仙碱",
   "handling": "干制或充分焯水后浸泡。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "fayamatou",
   "name": "发芽土豆",
   "hazard": "龙葵素",
   "handling": "发芽或表皮变绿者不食用。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "meibian",
   "name": "霉变谷物坚果",
   "hazard": "黄曲霉毒素",
   "handling": "霉变即弃，不挑拣后食用。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "yeshengjun",
   "name": "野生菌",
   "hazard": "毒蕈类毒素",
   "handling": "不采不食不认识的野生菌。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "hetun",
   "name": "河豚",
   "hazard": "河豚毒素",
   "handling": "不自行加工，须由有资质单位处理。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "shengyu",
   "name": "生鱼片与生腌",
   "hazard": "寄生虫与致病菌",
   "handling": "充分加热，生食须符合食品安全要求。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "shengdan",
   "name": "生蛋与未熟肉",
   "hazard": "沙门氏菌等致病菌",
   "handling": "蛋肉充分加热，避免生食。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "zizhiyaojiu",
   "name": "自制药酒",
   "hazard": "乌头碱等有毒成分",
   "handling": "不饮用来路不明的药酒。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "kuxingren",
   "name": "苦杏仁与白果",
   "hazard": "苦杏仁苷与白果毒素",
   "handling": "少量并充分加热，儿童不食用。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "yancai",
   "name": "腌菜亚硝酸盐",
   "hazard": "亚硝酸盐",
   "handling": "腌制 20 天后再食用，控制摄入量。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "fanfujiareyou",
   "name": "反复加热油",
   "hazard": "油脂氧化产物",
   "handling": "不反复高温使用，及时更换。",
   "groups": [
    "全部"
   ],
   "source": "食品安全国家标准与膳食指南"
  },
  {
   "id": "fengmi",
   "name": "蜂蜜与一岁内婴儿",
   "hazard": "肉毒杆菌芽孢",
   "handling": "一岁内婴儿不食用蜂蜜。",
   "groups": [
    "婴幼儿"
   ],
   "source": "食品安全国家标准与膳食指南"
  }
 ],
 "interactions": [
  {
   "id": "xiyou",
   "food": "西柚",
   "drug": "部分他汀、钙通道阻滞剂、抗排异药物",
   "effect": "影响药物代谢",
   "advice": "服药者避开或询医师药师。",
   "source": "药品说明书与 FDA 提示"
  },
  {
   "id": "weishengsuk",
   "food": "富含维生素 K 的绿叶菜",
   "drug": "华法林",
   "effect": "影响抗凝效果",
   "advice": "保持摄入稳定，遵医嘱监测。",
   "source": "药品说明书"
  },
  {
   "id": "gaolaoan",
   "food": "陈年奶酪、腌制品、发酵食品",
   "drug": "单胺氧化酶抑制剂",
   "effect": "影响血压调节",
   "advice": "服药期间避免高酪胺食物。",
   "source": "药品说明书"
  },
  {
   "id": "chatie",
   "food": "浓茶",
   "drug": "铁剂",
   "effect": "影响铁吸收",
   "advice": "间隔两小时以上。",
   "source": "药品说明书"
  },
  {
   "id": "niunai",
   "food": "牛奶",
   "drug": "左甲状腺素",
   "effect": "影响吸收",
   "advice": "间隔至少四小时。",
   "source": "药品说明书"
  },
  {
   "id": "jiujing",
   "food": "酒精",
   "drug": "多种药物",
   "effect": "加重肝脏负担与不良反应",
   "advice": "服药期间不饮酒。",
   "source": "药品说明书与膳食指南"
  },
  {
   "id": "kangshengsu",
   "food": "牛奶与乳制品",
   "drug": "部分抗生素",
   "effect": "影响吸收",
   "advice": "间隔两小时并遵医嘱。",
   "source": "药品说明书"
  },
  {
   "id": "tating",
   "food": "酒精",
   "drug": "他汀类",
   "effect": "增加肝脏负担",
   "advice": "服药期间控制饮酒。",
   "source": "药品说明书"
  }
 ],
 "flavors": [
  {
   "flavor": "酸",
   "organ": "肝",
   "like": "酸先入肝",
   "harm": "过酸伤筋"
  },
  {
   "flavor": "苦",
   "organ": "心",
   "like": "苦先入心",
   "harm": "过苦伤肺"
  },
  {
   "flavor": "甘",
   "organ": "脾",
   "like": "甘先入脾",
   "harm": "过甘伤肾"
  },
  {
   "flavor": "辛",
   "organ": "肺",
   "like": "辛先入肺",
   "harm": "过辛伤肝"
  },
  {
   "flavor": "咸",
   "organ": "肾",
   "like": "咸先入肾",
   "harm": "过咸伤心"
  }
 ],
 "natures": [
  {
   "nature": "寒",
   "effect": "清热",
   "note": "偏寒，过量易伤脾胃。"
  },
  {
   "nature": "凉",
   "effect": "清热润燥",
   "note": "偏凉，介于寒与平之间。"
  },
  {
   "nature": "平",
   "effect": "平和",
   "note": "寒温偏性小，日常适用。"
  },
  {
   "nature": "温",
   "effect": "温补",
   "note": "偏温，冬季与寒凉体质常用。"
  },
  {
   "nature": "热",
   "effect": "温中散寒",
   "note": "偏热，过量易上火。"
  }
 ],
 "scenes": [
  {
   "name": "睡不安",
   "tags": [
    "安神",
    "养血",
    "益气"
   ]
  },
  {
   "name": "口干",
   "tags": [
    "生津",
    "清热",
    "润肺",
    "润燥"
   ]
  },
  {
   "name": "食欲差",
   "tags": [
    "健脾",
    "消食",
    "理气",
    "和中"
   ]
  },
  {
   "name": "大便干",
   "tags": [
    "润肠",
    "生津",
    "润燥",
    "养血"
   ]
  },
  {
   "name": "易疲劳",
   "tags": [
    "益气",
    "健脾",
    "养血"
   ]
  },
  {
   "name": "畏寒",
   "tags": [
    "温阳",
    "温中",
    "散寒",
    "益气"
   ]
  },
  {
   "name": "上火",
   "tags": [
    "清热",
    "生津",
    "解暑",
    "利水"
   ]
  },
  {
   "name": "痰多",
   "tags": [
    "化痰",
    "润肺",
    "理气",
    "清热"
   ]
  },
  {
   "name": "眼干",
   "tags": [
    "明目",
    "养血",
    "生津",
    "养肝"
   ]
  },
  {
   "name": "心情郁闷",
   "tags": [
    "理气",
    "平肝",
    "安神",
    "养血"
   ]
  },
  {
   "name": "腹胀",
   "tags": [
    "理气",
    "消食",
    "健脾",
    "祛湿"
   ]
  },
  {
   "name": "水肿",
   "tags": [
    "利水",
    "祛湿",
    "健脾",
    "消肿"
   ]
  }
 ],
 "maps": {},
 "unmapped": [],
 "cities": [
  {
   "name": "全市",
   "province": "北京"
  },
  {
   "name": "全市",
   "province": "天津"
  },
  {
   "name": "石家庄",
   "province": "河北"
  },
  {
   "name": "唐山",
   "province": "河北"
  },
  {
   "name": "秦皇岛",
   "province": "河北"
  },
  {
   "name": "邯郸",
   "province": "河北"
  },
  {
   "name": "邢台",
   "province": "河北"
  },
  {
   "name": "保定",
   "province": "河北"
  },
  {
   "name": "张家口",
   "province": "河北"
  },
  {
   "name": "承德",
   "province": "河北"
  },
  {
   "name": "沧州",
   "province": "河北"
  },
  {
   "name": "廊坊",
   "province": "河北"
  },
  {
   "name": "衡水",
   "province": "河北"
  },
  {
   "name": "太原",
   "province": "山西"
  },
  {
   "name": "大同",
   "province": "山西"
  },
  {
   "name": "阳泉",
   "province": "山西"
  },
  {
   "name": "长治",
   "province": "山西"
  },
  {
   "name": "晋城",
   "province": "山西"
  },
  {
   "name": "朔州",
   "province": "山西"
  },
  {
   "name": "晋中",
   "province": "山西"
  },
  {
   "name": "运城",
   "province": "山西"
  },
  {
   "name": "忻州",
   "province": "山西"
  },
  {
   "name": "临汾",
   "province": "山西"
  },
  {
   "name": "吕梁",
   "province": "山西"
  },
  {
   "name": "呼和浩特",
   "province": "内蒙古"
  },
  {
   "name": "包头",
   "province": "内蒙古"
  },
  {
   "name": "乌海",
   "province": "内蒙古"
  },
  {
   "name": "赤峰",
   "province": "内蒙古"
  },
  {
   "name": "通辽",
   "province": "内蒙古"
  },
  {
   "name": "鄂尔多斯",
   "province": "内蒙古"
  },
  {
   "name": "呼伦贝尔",
   "province": "内蒙古"
  },
  {
   "name": "巴彦淖尔",
   "province": "内蒙古"
  },
  {
   "name": "乌兰察布",
   "province": "内蒙古"
  },
  {
   "name": "兴安",
   "province": "内蒙古"
  },
  {
   "name": "锡林郭勒",
   "province": "内蒙古"
  },
  {
   "name": "阿拉善",
   "province": "内蒙古"
  },
  {
   "name": "沈阳",
   "province": "辽宁"
  },
  {
   "name": "大连",
   "province": "辽宁"
  },
  {
   "name": "鞍山",
   "province": "辽宁"
  },
  {
   "name": "抚顺",
   "province": "辽宁"
  },
  {
   "name": "本溪",
   "province": "辽宁"
  },
  {
   "name": "丹东",
   "province": "辽宁"
  },
  {
   "name": "锦州",
   "province": "辽宁"
  },
  {
   "name": "营口",
   "province": "辽宁"
  },
  {
   "name": "阜新",
   "province": "辽宁"
  },
  {
   "name": "辽阳",
   "province": "辽宁"
  },
  {
   "name": "盘锦",
   "province": "辽宁"
  },
  {
   "name": "铁岭",
   "province": "辽宁"
  },
  {
   "name": "朝阳",
   "province": "辽宁"
  },
  {
   "name": "葫芦岛",
   "province": "辽宁"
  },
  {
   "name": "长春",
   "province": "吉林"
  },
  {
   "name": "吉林",
   "province": "吉林"
  },
  {
   "name": "四平",
   "province": "吉林"
  },
  {
   "name": "辽源",
   "province": "吉林"
  },
  {
   "name": "通化",
   "province": "吉林"
  },
  {
   "name": "白山",
   "province": "吉林"
  },
  {
   "name": "松原",
   "province": "吉林"
  },
  {
   "name": "白城",
   "province": "吉林"
  },
  {
   "name": "延边",
   "province": "吉林"
  },
  {
   "name": "哈尔滨",
   "province": "黑龙江"
  },
  {
   "name": "齐齐哈尔",
   "province": "黑龙江"
  },
  {
   "name": "鸡西",
   "province": "黑龙江"
  },
  {
   "name": "鹤岗",
   "province": "黑龙江"
  },
  {
   "name": "双鸭山",
   "province": "黑龙江"
  },
  {
   "name": "大庆",
   "province": "黑龙江"
  },
  {
   "name": "伊春",
   "province": "黑龙江"
  },
  {
   "name": "佳木斯",
   "province": "黑龙江"
  },
  {
   "name": "七台河",
   "province": "黑龙江"
  },
  {
   "name": "牡丹江",
   "province": "黑龙江"
  },
  {
   "name": "黑河",
   "province": "黑龙江"
  },
  {
   "name": "绥化",
   "province": "黑龙江"
  },
  {
   "name": "大兴安岭",
   "province": "黑龙江"
  },
  {
   "name": "全市",
   "province": "上海"
  },
  {
   "name": "南京",
   "province": "江苏"
  },
  {
   "name": "无锡",
   "province": "江苏"
  },
  {
   "name": "徐州",
   "province": "江苏"
  },
  {
   "name": "常州",
   "province": "江苏"
  },
  {
   "name": "苏州",
   "province": "江苏"
  },
  {
   "name": "南通",
   "province": "江苏"
  },
  {
   "name": "连云港",
   "province": "江苏"
  },
  {
   "name": "淮安",
   "province": "江苏"
  },
  {
   "name": "盐城",
   "province": "江苏"
  },
  {
   "name": "扬州",
   "province": "江苏"
  },
  {
   "name": "镇江",
   "province": "江苏"
  },
  {
   "name": "泰州",
   "province": "江苏"
  },
  {
   "name": "宿迁",
   "province": "江苏"
  },
  {
   "name": "杭州",
   "province": "浙江"
  },
  {
   "name": "宁波",
   "province": "浙江"
  },
  {
   "name": "温州",
   "province": "浙江"
  },
  {
   "name": "嘉兴",
   "province": "浙江"
  },
  {
   "name": "湖州",
   "province": "浙江"
  },
  {
   "name": "绍兴",
   "province": "浙江"
  },
  {
   "name": "金华",
   "province": "浙江"
  },
  {
   "name": "衢州",
   "province": "浙江"
  },
  {
   "name": "舟山",
   "province": "浙江"
  },
  {
   "name": "台州",
   "province": "浙江"
  },
  {
   "name": "丽水",
   "province": "浙江"
  },
  {
   "name": "合肥",
   "province": "安徽"
  },
  {
   "name": "芜湖",
   "province": "安徽"
  },
  {
   "name": "蚌埠",
   "province": "安徽"
  },
  {
   "name": "淮南",
   "province": "安徽"
  },
  {
   "name": "马鞍山",
   "province": "安徽"
  },
  {
   "name": "淮北",
   "province": "安徽"
  },
  {
   "name": "铜陵",
   "province": "安徽"
  },
  {
   "name": "安庆",
   "province": "安徽"
  },
  {
   "name": "黄山",
   "province": "安徽"
  },
  {
   "name": "滁州",
   "province": "安徽"
  },
  {
   "name": "阜阳",
   "province": "安徽"
  },
  {
   "name": "宿州",
   "province": "安徽"
  },
  {
   "name": "六安",
   "province": "安徽"
  },
  {
   "name": "亳州",
   "province": "安徽"
  },
  {
   "name": "池州",
   "province": "安徽"
  },
  {
   "name": "宣城",
   "province": "安徽"
  },
  {
   "name": "福州",
   "province": "福建"
  },
  {
   "name": "厦门",
   "province": "福建"
  },
  {
   "name": "莆田",
   "province": "福建"
  },
  {
   "name": "三明",
   "province": "福建"
  },
  {
   "name": "泉州",
   "province": "福建"
  },
  {
   "name": "漳州",
   "province": "福建"
  },
  {
   "name": "南平",
   "province": "福建"
  },
  {
   "name": "龙岩",
   "province": "福建"
  },
  {
   "name": "宁德",
   "province": "福建"
  },
  {
   "name": "南昌",
   "province": "江西"
  },
  {
   "name": "景德镇",
   "province": "江西"
  },
  {
   "name": "萍乡",
   "province": "江西"
  },
  {
   "name": "九江",
   "province": "江西"
  },
  {
   "name": "新余",
   "province": "江西"
  },
  {
   "name": "鹰潭",
   "province": "江西"
  },
  {
   "name": "赣州",
   "province": "江西"
  },
  {
   "name": "吉安",
   "province": "江西"
  },
  {
   "name": "宜春",
   "province": "江西"
  },
  {
   "name": "抚州",
   "province": "江西"
  },
  {
   "name": "上饶",
   "province": "江西"
  },
  {
   "name": "济南",
   "province": "山东"
  },
  {
   "name": "青岛",
   "province": "山东"
  },
  {
   "name": "淄博",
   "province": "山东"
  },
  {
   "name": "枣庄",
   "province": "山东"
  },
  {
   "name": "东营",
   "province": "山东"
  },
  {
   "name": "烟台",
   "province": "山东"
  },
  {
   "name": "潍坊",
   "province": "山东"
  },
  {
   "name": "济宁",
   "province": "山东"
  },
  {
   "name": "泰安",
   "province": "山东"
  },
  {
   "name": "威海",
   "province": "山东"
  },
  {
   "name": "日照",
   "province": "山东"
  },
  {
   "name": "临沂",
   "province": "山东"
  },
  {
   "name": "德州",
   "province": "山东"
  },
  {
   "name": "聊城",
   "province": "山东"
  },
  {
   "name": "滨州",
   "province": "山东"
  },
  {
   "name": "菏泽",
   "province": "山东"
  },
  {
   "name": "郑州",
   "province": "河南"
  },
  {
   "name": "开封",
   "province": "河南"
  },
  {
   "name": "洛阳",
   "province": "河南"
  },
  {
   "name": "平顶山",
   "province": "河南"
  },
  {
   "name": "安阳",
   "province": "河南"
  },
  {
   "name": "鹤壁",
   "province": "河南"
  },
  {
   "name": "新乡",
   "province": "河南"
  },
  {
   "name": "焦作",
   "province": "河南"
  },
  {
   "name": "濮阳",
   "province": "河南"
  },
  {
   "name": "许昌",
   "province": "河南"
  },
  {
   "name": "漯河",
   "province": "河南"
  },
  {
   "name": "三门峡",
   "province": "河南"
  },
  {
   "name": "南阳",
   "province": "河南"
  },
  {
   "name": "商丘",
   "province": "河南"
  },
  {
   "name": "信阳",
   "province": "河南"
  },
  {
   "name": "周口",
   "province": "河南"
  },
  {
   "name": "驻马店",
   "province": "河南"
  },
  {
   "name": "武汉",
   "province": "湖北"
  },
  {
   "name": "黄石",
   "province": "湖北"
  },
  {
   "name": "十堰",
   "province": "湖北"
  },
  {
   "name": "宜昌",
   "province": "湖北"
  },
  {
   "name": "襄阳",
   "province": "湖北"
  },
  {
   "name": "鄂州",
   "province": "湖北"
  },
  {
   "name": "荆门",
   "province": "湖北"
  },
  {
   "name": "孝感",
   "province": "湖北"
  },
  {
   "name": "荆州",
   "province": "湖北"
  },
  {
   "name": "黄冈",
   "province": "湖北"
  },
  {
   "name": "咸宁",
   "province": "湖北"
  },
  {
   "name": "随州",
   "province": "湖北"
  },
  {
   "name": "恩施",
   "province": "湖北"
  },
  {
   "name": "长沙",
   "province": "湖南"
  },
  {
   "name": "株洲",
   "province": "湖南"
  },
  {
   "name": "湘潭",
   "province": "湖南"
  },
  {
   "name": "衡阳",
   "province": "湖南"
  },
  {
   "name": "邵阳",
   "province": "湖南"
  },
  {
   "name": "岳阳",
   "province": "湖南"
  },
  {
   "name": "常德",
   "province": "湖南"
  },
  {
   "name": "张家界",
   "province": "湖南"
  },
  {
   "name": "益阳",
   "province": "湖南"
  },
  {
   "name": "郴州",
   "province": "湖南"
  },
  {
   "name": "永州",
   "province": "湖南"
  },
  {
   "name": "怀化",
   "province": "湖南"
  },
  {
   "name": "娄底",
   "province": "湖南"
  },
  {
   "name": "湘西",
   "province": "湖南"
  },
  {
   "name": "广州",
   "province": "广东"
  },
  {
   "name": "韶关",
   "province": "广东"
  },
  {
   "name": "深圳",
   "province": "广东"
  },
  {
   "name": "珠海",
   "province": "广东"
  },
  {
   "name": "汕头",
   "province": "广东"
  },
  {
   "name": "佛山",
   "province": "广东"
  },
  {
   "name": "江门",
   "province": "广东"
  },
  {
   "name": "湛江",
   "province": "广东"
  },
  {
   "name": "茂名",
   "province": "广东"
  },
  {
   "name": "肇庆",
   "province": "广东"
  },
  {
   "name": "惠州",
   "province": "广东"
  },
  {
   "name": "梅州",
   "province": "广东"
  },
  {
   "name": "汕尾",
   "province": "广东"
  },
  {
   "name": "河源",
   "province": "广东"
  },
  {
   "name": "阳江",
   "province": "广东"
  },
  {
   "name": "清远",
   "province": "广东"
  },
  {
   "name": "潮州",
   "province": "广东"
  },
  {
   "name": "揭阳",
   "province": "广东"
  },
  {
   "name": "云浮",
   "province": "广东"
  },
  {
   "name": "东莞",
   "province": "广东"
  },
  {
   "name": "中山",
   "province": "广东"
  },
  {
   "name": "南宁",
   "province": "广西"
  },
  {
   "name": "柳州",
   "province": "广西"
  },
  {
   "name": "桂林",
   "province": "广西"
  },
  {
   "name": "梧州",
   "province": "广西"
  },
  {
   "name": "北海",
   "province": "广西"
  },
  {
   "name": "防城港",
   "province": "广西"
  },
  {
   "name": "钦州",
   "province": "广西"
  },
  {
   "name": "贵港",
   "province": "广西"
  },
  {
   "name": "玉林",
   "province": "广西"
  },
  {
   "name": "百色",
   "province": "广西"
  },
  {
   "name": "贺州",
   "province": "广西"
  },
  {
   "name": "河池",
   "province": "广西"
  },
  {
   "name": "来宾",
   "province": "广西"
  },
  {
   "name": "崇左",
   "province": "广西"
  },
  {
   "name": "海口",
   "province": "海南"
  },
  {
   "name": "三亚",
   "province": "海南"
  },
  {
   "name": "三沙",
   "province": "海南"
  },
  {
   "name": "儋州",
   "province": "海南"
  },
  {
   "name": "全市",
   "province": "重庆"
  },
  {
   "name": "成都",
   "province": "四川"
  },
  {
   "name": "自贡",
   "province": "四川"
  },
  {
   "name": "攀枝花",
   "province": "四川"
  },
  {
   "name": "泸州",
   "province": "四川"
  },
  {
   "name": "德阳",
   "province": "四川"
  },
  {
   "name": "绵阳",
   "province": "四川"
  },
  {
   "name": "广元",
   "province": "四川"
  },
  {
   "name": "遂宁",
   "province": "四川"
  },
  {
   "name": "内江",
   "province": "四川"
  },
  {
   "name": "乐山",
   "province": "四川"
  },
  {
   "name": "南充",
   "province": "四川"
  },
  {
   "name": "眉山",
   "province": "四川"
  },
  {
   "name": "宜宾",
   "province": "四川"
  },
  {
   "name": "广安",
   "province": "四川"
  },
  {
   "name": "达州",
   "province": "四川"
  },
  {
   "name": "雅安",
   "province": "四川"
  },
  {
   "name": "巴中",
   "province": "四川"
  },
  {
   "name": "资阳",
   "province": "四川"
  },
  {
   "name": "阿坝",
   "province": "四川"
  },
  {
   "name": "甘孜",
   "province": "四川"
  },
  {
   "name": "凉山",
   "province": "四川"
  },
  {
   "name": "贵阳",
   "province": "贵州"
  },
  {
   "name": "六盘水",
   "province": "贵州"
  },
  {
   "name": "遵义",
   "province": "贵州"
  },
  {
   "name": "安顺",
   "province": "贵州"
  },
  {
   "name": "毕节",
   "province": "贵州"
  },
  {
   "name": "铜仁",
   "province": "贵州"
  },
  {
   "name": "黔西南",
   "province": "贵州"
  },
  {
   "name": "黔东南",
   "province": "贵州"
  },
  {
   "name": "黔南",
   "province": "贵州"
  },
  {
   "name": "昆明",
   "province": "云南"
  },
  {
   "name": "曲靖",
   "province": "云南"
  },
  {
   "name": "玉溪",
   "province": "云南"
  },
  {
   "name": "保山",
   "province": "云南"
  },
  {
   "name": "昭通",
   "province": "云南"
  },
  {
   "name": "丽江",
   "province": "云南"
  },
  {
   "name": "普洱",
   "province": "云南"
  },
  {
   "name": "临沧",
   "province": "云南"
  },
  {
   "name": "楚雄",
   "province": "云南"
  },
  {
   "name": "红河",
   "province": "云南"
  },
  {
   "name": "文山",
   "province": "云南"
  },
  {
   "name": "西双版纳",
   "province": "云南"
  },
  {
   "name": "大理",
   "province": "云南"
  },
  {
   "name": "德宏",
   "province": "云南"
  },
  {
   "name": "怒江",
   "province": "云南"
  },
  {
   "name": "迪庆",
   "province": "云南"
  },
  {
   "name": "拉萨",
   "province": "西藏"
  },
  {
   "name": "日喀则",
   "province": "西藏"
  },
  {
   "name": "昌都",
   "province": "西藏"
  },
  {
   "name": "林芝",
   "province": "西藏"
  },
  {
   "name": "山南",
   "province": "西藏"
  },
  {
   "name": "那曲",
   "province": "西藏"
  },
  {
   "name": "阿里",
   "province": "西藏"
  },
  {
   "name": "西安",
   "province": "陕西"
  },
  {
   "name": "铜川",
   "province": "陕西"
  },
  {
   "name": "宝鸡",
   "province": "陕西"
  },
  {
   "name": "咸阳",
   "province": "陕西"
  },
  {
   "name": "渭南",
   "province": "陕西"
  },
  {
   "name": "延安",
   "province": "陕西"
  },
  {
   "name": "汉中",
   "province": "陕西"
  },
  {
   "name": "榆林",
   "province": "陕西"
  },
  {
   "name": "安康",
   "province": "陕西"
  },
  {
   "name": "商洛",
   "province": "陕西"
  },
  {
   "name": "兰州",
   "province": "甘肃"
  },
  {
   "name": "嘉峪关",
   "province": "甘肃"
  },
  {
   "name": "金昌",
   "province": "甘肃"
  },
  {
   "name": "白银",
   "province": "甘肃"
  },
  {
   "name": "天水",
   "province": "甘肃"
  },
  {
   "name": "武威",
   "province": "甘肃"
  },
  {
   "name": "张掖",
   "province": "甘肃"
  },
  {
   "name": "平凉",
   "province": "甘肃"
  },
  {
   "name": "酒泉",
   "province": "甘肃"
  },
  {
   "name": "庆阳",
   "province": "甘肃"
  },
  {
   "name": "定西",
   "province": "甘肃"
  },
  {
   "name": "陇南",
   "province": "甘肃"
  },
  {
   "name": "临夏",
   "province": "甘肃"
  },
  {
   "name": "甘南",
   "province": "甘肃"
  },
  {
   "name": "西宁",
   "province": "青海"
  },
  {
   "name": "海东",
   "province": "青海"
  },
  {
   "name": "海北",
   "province": "青海"
  },
  {
   "name": "黄南",
   "province": "青海"
  },
  {
   "name": "海南",
   "province": "青海"
  },
  {
   "name": "果洛",
   "province": "青海"
  },
  {
   "name": "玉树",
   "province": "青海"
  },
  {
   "name": "海西",
   "province": "青海"
  },
  {
   "name": "银川",
   "province": "宁夏"
  },
  {
   "name": "石嘴山",
   "province": "宁夏"
  },
  {
   "name": "吴忠",
   "province": "宁夏"
  },
  {
   "name": "固原",
   "province": "宁夏"
  },
  {
   "name": "中卫",
   "province": "宁夏"
  },
  {
   "name": "乌鲁木齐",
   "province": "新疆"
  },
  {
   "name": "克拉玛依",
   "province": "新疆"
  },
  {
   "name": "吐鲁番",
   "province": "新疆"
  },
  {
   "name": "哈密",
   "province": "新疆"
  },
  {
   "name": "昌吉",
   "province": "新疆"
  },
  {
   "name": "博尔塔拉",
   "province": "新疆"
  },
  {
   "name": "巴音郭楞",
   "province": "新疆"
  },
  {
   "name": "阿克苏",
   "province": "新疆"
  },
  {
   "name": "克孜勒苏",
   "province": "新疆"
  },
  {
   "name": "喀什",
   "province": "新疆"
  },
  {
   "name": "和田",
   "province": "新疆"
  },
  {
   "name": "伊犁",
   "province": "新疆"
  },
  {
   "name": "塔城",
   "province": "新疆"
  },
  {
   "name": "阿勒泰",
   "province": "新疆"
  },
  {
   "name": "全境",
   "province": "香港"
  },
  {
   "name": "全境",
   "province": "澳门"
  },
  {
   "name": "全境",
   "province": "台湾"
  }
 ],
 "cityFoods": {
  "石家庄": [
   "梨"
  ],
  "唐山": [
   "栗子"
  ],
  "沧州": [
   "梨",
   "大枣"
  ],
  "张家口": [
   "葡萄"
  ],
  "太原": [
   "葡萄"
  ],
  "长治": [
   "小米"
  ],
  "运城": [
   "苹果"
  ],
  "赤峰": [
   "小米"
  ],
  "通辽": [
   "荞麦",
   "牛肉"
  ],
  "呼伦贝尔": [
   "羊肉"
  ],
  "锡林郭勒": [
   "羊肉"
  ],
  "大连": [
   "樱桃",
   "海参"
  ],
  "鞍山": [
   "梨"
  ],
  "盘锦": [
   "粳米",
   "蟹"
  ],
  "延边": [
   "梨"
  ],
  "哈尔滨": [
   "粳米"
  ],
  "牡丹江": [
   "黑木耳"
  ],
  "无锡": [
   "桃"
  ],
  "苏州": [
   "蟹",
   "枇杷"
  ],
  "扬州": [
   "鸭蛋",
   "莲藕"
  ],
  "杭州": [
   "枇杷",
   "核桃仁"
  ],
  "宁波": [
   "桃",
   "蟹"
  ],
  "温州": [
   "橘",
   "杨梅"
  ],
  "台州": [
   "橘",
   "柚"
  ],
  "舟山": [
   "带鱼",
   "大黄鱼"
  ],
  "宿州": [
   "梨"
  ],
  "蚌埠": [
   "石榴"
  ],
  "福州": [
   "橘",
   "青果"
  ],
  "莆田": [
   "荔枝",
   "龙眼"
  ],
  "漳州": [
   "柚",
   "香蕉"
  ],
  "宁德": [
   "银耳",
   "大黄鱼"
  ],
  "赣州": [
   "橙"
  ],
  "吉安": [
   "乌骨鸡"
  ],
  "济南": [
   "葱"
  ],
  "青岛": [
   "大白菜",
   "蛤蜊"
  ],
  "烟台": [
   "苹果",
   "梨",
   "樱桃"
  ],
  "潍坊": [
   "白萝卜",
   "西瓜"
  ],
  "济宁": [
   "大蒜"
  ],
  "泰安": [
   "桃"
  ],
  "临沂": [
   "桃",
   "大蒜"
  ],
  "滨州": [
   "大枣"
  ],
  "焦作": [
   "山药"
  ],
  "三门峡": [
   "苹果"
  ],
  "南阳": [
   "香菇"
  ],
  "驻马店": [
   "花生",
   "黑芝麻"
  ],
  "武汉": [
   "莲藕"
  ],
  "宜昌": [
   "橙"
  ],
  "随州": [
   "香菇"
  ],
  "湘潭": [
   "莲子"
  ],
  "湘西": [
   "猕猴桃",
   "橘"
  ],
  "怀化": [
   "杨梅",
   "茯苓"
  ],
  "广州": [
   "荔枝"
  ],
  "江门": [
   "陈皮"
  ],
  "梅州": [
   "柚"
  ],
  "茂名": [
   "香蕉",
   "荔枝"
  ],
  "清远": [
   "鸡肉"
  ],
  "桂林": [
   "芋头",
   "罗汉果",
   "柿子"
  ],
  "玉林": [
   "柚"
  ],
  "钦州": [
   "牡蛎"
  ],
  "成都": [
   "桃",
   "猕猴桃"
  ],
  "泸州": [
   "荔枝",
   "龙眼"
  ],
  "广元": [
   "梨",
   "黑木耳"
  ],
  "雅安": [
   "花椒"
  ],
  "凉山": [
   "石榴",
   "苹果"
  ],
  "遵义": [
   "辣椒"
  ],
  "贵阳": [
   "猕猴桃"
  ],
  "毕节": [
   "马铃薯",
   "核桃仁",
   "竹荪"
  ],
  "昭通": [
   "苹果"
  ],
  "大理": [
   "核桃仁"
  ],
  "红河": [
   "石榴"
  ],
  "怒江": [
   "草果"
  ],
  "日喀则": [
   "青稞"
  ],
  "西安": [
   "石榴",
   "猕猴桃"
  ],
  "宝鸡": [
   "猕猴桃",
   "花椒"
  ],
  "渭南": [
   "大枣",
   "苹果",
   "柿子"
  ],
  "延安": [
   "苹果"
  ],
  "榆林": [
   "大枣",
   "小米"
  ],
  "兰州": [
   "百合",
   "甜瓜"
  ],
  "天水": [
   "苹果",
   "樱桃"
  ],
  "平凉": [
   "苹果",
   "牛肉"
  ],
  "陇南": [
   "花椒"
  ],
  "海西": [
   "枸杞子"
  ],
  "银川": [
   "枸杞子",
   "葡萄"
  ],
  "吴忠": [
   "羊肉"
  ],
  "中卫": [
   "枸杞子",
   "西瓜"
  ],
  "吐鲁番": [
   "葡萄"
  ],
  "哈密": [
   "甜瓜",
   "大枣"
  ],
  "巴音郭楞": [
   "梨"
  ],
  "阿克苏": [
   "苹果",
   "大枣",
   "核桃仁"
  ],
  "和田": [
   "大枣",
   "核桃仁"
  ]
 }
};
