/*
 * 云迹初始数据
 * 视觉摄影素材：Pexels 免费照片页面，具体摄影师与来源见 DATA_SOURCES.md。
 * 科学分类：WMO International Cloud Atlas 的十种云属。
 * CCAiM 数据集统计：Hugging Face 数据集卡片（971 张、10 类）。
 */
window.CLOUD_DATA = {
  photos: [
    {
      id: 'cirrus-01', title: '风写下的痕迹', english: 'Whispers in the wind', type: 'Cirrus', typeZh: '卷云', mood: '轻盈', color: '蓝白', time: '午后',
      image: 'https://images.pexels.com/photos/40401134/pexels-photo-40401134.jpeg?cs=srgb&dl=pexels-thetaahirlone-40401134.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/wispy-cirrus-clouds-in-a-clear-blue-sky-40401134/', photographer: 'Taahir Lone',
      note: '像被风轻轻拉长的丝线，卷云常呈纤维状、羽毛状，属于高云。它们由冰晶组成，在高空留下细腻而轻盈的纹理。', tags: ['高云','纤维状','晴朗','轻盈'], palette: ['#dceaf1','#9fb9cb','#6688a3','#f4f6f4']
    },
    {
      id: 'cirrocumulus-01', title: '天空里的鱼鳞', english: 'A sky of tiny waves', type: 'Cirrocumulus', typeZh: '卷积云', mood: '细碎', color: '蓝白', time: '清晨',
      image: 'https://images.pexels.com/photos/6137902/pexels-photo-6137902.jpeg?cs=srgb&dl=pexels-enginakyurt-6137902.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/cirrocumulus-clouds-in-the-sky-6137902/', photographer: 'Engin Akyurt',
      note: '细小的云块排列成波纹，像一片被风吹皱的海。卷积云通常由细小的云块或云片组成，常见于高空。', tags: ['高云','鱼鳞状','纹理','清晨'], palette: ['#182d4c','#61758d','#b9c9d8','#edf0ed']
    },
    {
      id: 'altocumulus-01', title: '柔软的云丘', english: 'Little hills above', type: 'Altocumulus', typeZh: '高积云', mood: '温柔', color: '晴蓝', time: '上午',
      image: 'https://images.pexels.com/photos/15393006/pexels-photo-15393006.jpeg?cs=srgb&dl=pexels-adriana-de-oliveira-163346715-15393006.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/altocumulus-clouds-on-a-blue-sky-15393006/', photographer: 'Adriana De Oliveira',
      note: '一团团柔软的云块散落在蓝色背景上。高积云属于中云，常呈片状、层状或团块状。', tags: ['中云','云块','柔软','晴朗'], palette: ['#3d6c9c','#8fb0cb','#dce6ec','#faf8f3']
    },
    {
      id: 'cumulus-01', title: '棉花糖山丘', english: 'Clouds like cotton', type: 'Cumulus', typeZh: '积云', mood: '治愈', color: '晴蓝', time: '午后',
      image: 'https://images.pexels.com/photos/12135522/pexels-photo-12135522.jpeg?cs=srgb&dl=pexels-pouyalucky-12135522.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/white-cumulus-clouds-in-a-blue-sky-12135522/', photographer: 'Pouya Lucky',
      note: '圆润饱满的云顶像棉花一样蓬松，常有较平坦的底部。积云常在日间受热后发展，给人轻松明亮的印象。', tags: ['低云','垂直发展','棉花糖','晴朗'], palette: ['#5d8fb9','#a8c5da','#edf3f4','#fffdf8']
    },
    {
      id: 'stratocumulus-01', title: '云层的褶皱', english: 'Folded layers', type: 'Stratocumulus', typeZh: '层积云', mood: '安静', color: '深蓝', time: '傍晚',
      image: 'https://images.pexels.com/photos/4978423/pexels-photo-4978423.jpeg?cs=srgb&dl=pexels-lucaspezeta-4978423.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/cloudy-sky-in-sunny-day-4978423/', photographer: 'Lucas Pezeta',
      note: '云块连成片，天空像铺开一层层柔软的褶皱。层积云通常由较大的云块、云团或云层组成。', tags: ['低云','层状','云块','傍晚'], palette: ['#102c40','#36586d','#8497a1','#d9d9d1']
    },
    {
      id: 'cumulonimbus-01', title: '云端的山脉', english: 'Mountains in the sky', type: 'Cumulonimbus', typeZh: '积雨云', mood: '壮阔', color: '蓝灰', time: '午后',
      image: 'https://images.pexels.com/photos/40908950/pexels-photo-40908950.jpeg?cs=srgb&dl=pexels-jan-van-der-wolf-11680885-40908950.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/dramatic-cumulonimbus-clouds-against-clear-sky-40908950/', photographer: 'Jan van der Wolf',
      note: '高耸发展的云体像一座悬浮的山。积雨云具有强烈的垂直发展，常与阵雨、雷暴等天气现象有关。', tags: ['低云','垂直发展','雷暴','壮阔'], palette: ['#163b59','#66829a','#d2d6d5','#f4e4cd']
    },
    {
      id: 'sunset-01', title: '晚霞把云染成粉色', english: 'A little blush at dusk', type: 'Evening glow', typeZh: '晚霞云景', mood: '浪漫', color: '粉紫', time: '日落',
      image: 'https://images.pexels.com/photos/9303386/pexels-photo-9303386.jpeg?cs=srgb&dl=pexels-vera-silkina-85579813-9303386.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/pink-sunset-clouds-9303386/', photographer: 'Vera Silkina',
      note: '日落时分，低角度阳光穿过大气，云层被染上粉紫与暖橙。这里记录的是天空色彩与光线氛围，不作为独立云属分类。', tags: ['日落','粉紫','晚霞','浪漫'], palette: ['#b68a91','#d7a3a5','#f1c8bb','#66536c']
    },
    {
      id: 'storm-01', title: '雨来之前', english: 'Before the rain', type: 'Cumulonimbus', typeZh: '积雨云景', mood: '静谧', color: '蓝灰', time: '阴天',
      image: 'https://images.pexels.com/photos/1642660/pexels-photo-1642660.jpeg?cs=srgb&dl=pexels-ezz7-1642660.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/cumulonimbus-clouds-1642660/', photographer: 'Mustafa ezz',
      note: '明暗交错的云体带来安静而厚重的氛围。照片标题将其标为积雨云景，具体云属仍应结合完整观测信息判断。', tags: ['阴天','厚重','蓝灰','天气变化'], palette: ['#142f4a','#52697c','#9ba6ad','#e2ded7']
    },
    {
      id: 'stratus-01', title: '低低的灰色天幕', english: 'A quiet grey veil', type: 'Stratus', typeZh: '层云', mood: '安静', color: '雾灰', time: '阴天',
      image: 'https://images.pexels.com/photos/5020997/pexels-photo-5020997.jpeg?cs=srgb&dl=pexels-didsss-5020997.jpg&fm=jpg',
      source: 'https://www.pexels.com/photo/small-houses-in-village-in-cloudy-day-5020997/', photographer: 'Diana',
      note: '层云通常呈均匀的灰色或灰白色层状云幕，云底较低。它像一张安静铺开的薄毯，让天空显得柔和而克制。', tags: ['低云','层状','阴天','雾灰'], palette: ['#5b6b79','#8c9ba7','#c6cdd0','#e8e8e3']
    }
    ,
    {
      id: 'cirrus-02', title: '风把云写成诗', english: 'A poem written by wind', type: 'Cirrus', typeZh: '卷云', mood: '轻盈', color: '晴蓝', time: '白日',
      image: 'https://images.pexels.com/photos/34953157/pexels-photo-34953157/free-photo-of-dramatic-sky-with-cirrus-clouds-at-daytime.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/dramatic-sky-with-cirrus-clouds-at-daytime-34953157/', photographer: 'Mahmoud Zakariya', sourceName: 'Pexels',
      note: '细长的云丝在蓝色天幕上舒展开来。此图来自 Pexels 摄影作品，作为卷云形态的视觉参考。', tags: ['高云','纤维状','晴朗','轻盈'], palette: ['#357ebd','#8caccc','#e9e5de','#f7f7f4']
    },
    {
      id: 'cumulus-02', title: '云朵的蓬松边缘', english: 'Soft edges of the sky', type: 'Cumulus', typeZh: '积云', mood: '治愈', color: '晴蓝', time: '午后',
      image: 'https://images.pexels.com/photos/37144017/pexels-photo-37144017/free-photo-of-cumulus-clouds-in-a-clear-blue-sky.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/cumulus-clouds-in-a-clear-blue-sky-37144017/', photographer: 'Mahmoud Zakariya', sourceName: 'Pexels',
      note: '明亮的蓝天衬托出圆润的积云轮廓，适合观察云顶的蓬松结构。', tags: ['低云','垂直发展','晴朗','棉花糖'], palette: ['#2f61a6','#6b8fb3','#b4b9be','#f5f7f8']
    },
    {
      id: 'cumulus-03', title: '蓝天里的白色岛屿', english: 'White islands in blue', type: 'Cumulus', typeZh: '积云', mood: '明亮', color: '晴蓝', time: '上午',
      image: 'https://images.pexels.com/photos/36355691/pexels-photo-36355691/free-photo-of-blue-sky-with-fluffy-white-cumulus-clouds.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/blue-sky-with-fluffy-white-cumulus-clouds-36355691/', photographer: 'Mahmoud Zakariya', sourceName: 'Pexels',
      note: '蓬松的白色云团漂浮在蓝色背景中，呈现出清晰、舒展的积云形态。', tags: ['低云','云块','晴朗','明亮'], palette: ['#2b5796','#828997','#c4c4c2','#f8f9f8']
    },
    {
      id: 'cumulus-04', title: '夏日云丘', english: 'Summer cloud hills', type: 'Cumulus', typeZh: '积云', mood: '自由', color: '深蓝', time: '午后',
      image: 'https://images.pexels.com/photos/37651581/pexels-photo-37651581/free-photo-of-cumulus-clouds-against-clear-blue-sky.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/cumulus-clouds-against-clear-blue-sky-37651581/', photographer: 'İremnur ÖZTÜRK', sourceName: 'Pexels',
      note: '高耸的云丘在深蓝天空中层层展开，记录夏日天空的开阔感。', tags: ['低云','垂直发展','夏日','自由'], palette: ['#003274','#9296a0','#d5d4d2','#f7f8f8']
    },
    {
      id: 'altocumulus-02', title: '天空铺开的细浪', english: 'Ripples across the sky', type: 'Altocumulus', typeZh: '高积云', mood: '细碎', color: '晴蓝', time: '清晨',
      image: 'https://images.pexels.com/photos/14644830/pexels-photo-14644830.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/altocumulus-clouds-in-the-sky-14644830/', photographer: 'Dom Sch-veg-man', sourceName: 'Pexels',
      note: '大小相近的云块在天空中形成纹理，呈现高积云常见的片状与波状观感。', tags: ['中云','云块','纹理','清晨'], palette: ['#4682b4','#b0c4de','#e5edf2','#f7f7f4']
    },
    {
      id: 'cirrostratus-02', title: '薄云轻覆晴空', english: 'A veil over blue', type: 'Cirrostratus', typeZh: '卷层云', mood: '轻柔', color: '蓝白', time: '白日',
      image: 'https://images.pexels.com/photos/19203208/pexels-photo-19203208/free-photo-of-cirrostratus-cloud-in-the-blue-sky.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/cirrostratus-cloud-in-the-blue-sky-19203208/', photographer: 'Diana', sourceName: 'Pexels',
      note: '薄而舒展的云幕为天空增加一层柔和质感。照片用于卷层云的视觉参考，实际识别仍需结合观测条件。', tags: ['高云','薄幕','蓝白','轻柔'], palette: ['#4682b4','#b0c4de','#e8eef3','#faf9f6']
    },
    {
      id: 'stratus-02', title: '暮色中的云幕', english: 'Layers at dusk', type: 'Stratus', typeZh: '层云', mood: '静谧', color: '暖橙', time: '日落',
      image: 'https://images.pexels.com/photos/25252453/pexels-photo-25252453/free-photo-of-stratus-clouds-at-sunset.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/stratus-clouds-at-sunset-25252453/', photographer: 'Diogo Miranda', sourceName: 'Pexels',
      note: '夕阳把云层染成温暖的橙色与棕灰色，呈现暮色天空的层次。', tags: ['低云','层状','日落','暖色'], palette: ['#2f4f4f','#708090','#a0522d','#f0a36b']
    },
    {
      id: 'mixed-01', title: '云层交叠的纹理', english: 'Layers in motion', type: 'Mixed sky', typeZh: '混合云景', mood: '壮阔', color: '雾灰', time: '白日',
      image: 'https://images.pexels.com/photos/20568677/pexels-photo-20568677/free-photo-of-altocummulus-and-stratocumulus-clouds.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/altocummulus-and-stratocumulus-clouds-20568677/', photographer: 'Victor Cayke', sourceName: 'Pexels',
      note: '画面呈现多层云块交叠的纹理。原作品描述涉及高积云与层积云，此处作为混合云景欣赏，不将其强行归为单一云属。', tags: ['混合云景','云层','纹理','观测'], palette: ['#708090','#9ca8b2','#d5d8d8','#f4f4f1']
    },
    {
      id: 'sunset-02', title: '晚霞写给天空的信', english: 'A letter in sunset colors', type: 'Evening glow', typeZh: '晚霞云景', mood: '浪漫', color: '粉橙', time: '日落',
      image: 'https://images.pexels.com/photos/28921646/pexels-photo-28921646/free-photo-of-vibrant-orange-and-pink-sunset-clouds.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/vibrant-orange-and-pink-sunset-clouds-28921646/', photographer: 'TD Caldarello', sourceName: 'Pexels',
      note: '橙粉色的晚霞将云层染亮。这里记录的是光线与色彩氛围，不作为独立云属分类。', tags: ['日落','粉橙','晚霞','浪漫'], palette: ['#a0522d','#d2b48c','#ff7f50','#ffb28d']
    },
    {
      id: 'mixed-02', title: '云海与晴空之间', english: 'Between clouds and blue', type: 'Mixed sky', typeZh: '混合云景', mood: '开阔', color: '晴蓝', time: '白日',
      image: 'https://images.pexels.com/photos/6635906/pexels-photo-6635906.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/fluffy-cumulus-and-cirrus-clouds-in-blue-sky-6635906/', photographer: 'Brett Sayles', sourceName: 'Pexels',
      note: '画面同时呈现较厚实的积云与高空云丝，适合观察不同云形在同一片天空中的层次。', tags: ['混合云景','积云','卷云','晴朗'], palette: ['#778899','#9fb6c8','#d8e2e8','#f7f8f5']
    },
    {
      id: 'cumulonimbus-02', title: '风暴正在远处酝酿', english: 'A storm gathering afar', type: 'Cumulonimbus', typeZh: '积雨云', mood: '壮阔', color: '蓝灰', time: '阴天',
      image: 'https://images.pexels.com/photos/20363859/pexels-photo-20363859/free-photo-of-storm-clouds-in-sky.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/storm-clouds-in-sky-20363859/', photographer: 'Kássia Melo', sourceName: 'Pexels',
      note: '厚重的深色云体带来强烈的空间感。原作品描述为积雨云景，可用于观察强对流云体的外观。', tags: ['低云','垂直发展','风暴','蓝灰'], palette: ['#2f4f4f','#778899','#a9a9a9','#d7d9d9']
    },
    {
      id: 'cumulonimbus-03', title: '高耸的云之塔', english: 'A tower in the sky', type: 'Cumulonimbus', typeZh: '积雨云', mood: '壮阔', color: '晴蓝', time: '午后',
      image: 'https://images.pexels.com/photos/36316282/pexels-photo-36316282/free-photo-of-dramatic-cumulonimbus-cloud-in-blue-sky.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/dramatic-cumulonimbus-cloud-in-blue-sky-36316282/', photographer: 'Md Rahidur Rahman', sourceName: 'Pexels',
      note: '高耸的云体在蓝天中显得格外醒目，展现积雨云强烈的垂直发展特征。', tags: ['低云','垂直发展','高耸','天气变化'], palette: ['#0c1719','#1d4d6e','#5587a8','#98b7d4']
    },
    {
      id: 'cirrocumulus-02', title: '天空的颗粒与微光', english: 'Tiny clouds, soft light', type: 'Cirrocumulus', typeZh: '卷积云', mood: '细碎', color: '柔灰', time: '清晨',
      image: 'https://images.pexels.com/photos/12494015/pexels-photo-12494015.jpeg?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/photo-of-the-sky-12494015/', photographer: 'Suzy Hazelwood', sourceName: 'Pexels',
      note: '细小云块铺展在天空中，呈现颗粒状、波纹状的视觉节奏。', tags: ['高云','鱼鳞状','纹理','柔和'], palette: ['#696969','#708090','#a9b5c2','#e8e7e1']
    },
    {
      id: 'mixed-03', title: '云朵的明暗交响', english: 'A quiet cloud symphony', type: 'Mixed sky', typeZh: '混合云景', mood: '静谧', color: '雾灰', time: '白日',
      image: 'https://images.pexels.com/photos/11318607/pexels-photo-11318607.png?auto=compress&dpr=1&h=750&w=1260',
      source: 'https://www.pexels.com/photo/close-up-of-clouds-in-sky-11318607/', photographer: 'Amanda Moore', sourceName: 'Pexels',
      note: '画面包含厚实的积云与积雨云形态，适合观察云体的明暗与层叠结构。', tags: ['混合云景','云层','明暗','观察'], palette: ['#696969','#8e9aa5','#c3cbd0','#f0f0ec']
    }
  ],
  types: [
    {id:'Ci',latin:'Cirrus',zh:'卷云',level:'高云',shape:'纤维状、羽毛状',desc:'由冰晶组成，常呈白色纤维状或羽毛状，边缘细薄。',imageId:'cirrus-01',count:118},
    {id:'Cc',latin:'Cirrocumulus',zh:'卷积云',level:'高云',shape:'细小云块、鱼鳞状',desc:'由细小云块、云片或云层组成，常呈规则排列的纹理。',imageId:'cirrocumulus-01',count:33},
    {id:'Cs',latin:'Cirrostratus',zh:'卷层云',level:'高云',shape:'透明或乳白色薄幕',desc:'通常呈透明、乳白色纤维状或平滑的云幕，有时可见日晕或月晕。',imageId:null,count:48},
    {id:'Ac',latin:'Altocumulus',zh:'高积云',level:'中云',shape:'片状、层状或团块状',desc:'由较大的云块或云团组成，可呈片状、层状或波状排列。',imageId:'altocumulus-01',count:124},
    {id:'As',latin:'Altostratus',zh:'高层云',level:'中云',shape:'均匀灰色或蓝灰色云幕',desc:'常呈广阔的灰色或蓝灰色云幕，太阳透过时轮廓较模糊。',imageId:null,count:63},
    {id:'Ns',latin:'Nimbostratus',zh:'雨层云',level:'中云',shape:'厚而暗的连续云层',desc:'通常呈暗灰色、厚实且范围广的云层，常伴随较持续的降水。',imageId:null,count:17},
    {id:'Sc',latin:'Stratocumulus',zh:'层积云',level:'低云',shape:'大块状或团状云层',desc:'由较大的云块、云团或云层组成，常有明暗变化和波状结构。',imageId:'stratocumulus-01',count:99},
    {id:'St',latin:'Stratus',zh:'层云',level:'低云',shape:'均匀的灰色云幕',desc:'通常呈均匀的灰色云层，底部较低，有时像雾一样覆盖天空。',imageId:'stratus-01',count:38},
    {id:'Cu',latin:'Cumulus',zh:'积云',level:'低云',shape:'分离、蓬松、垂直发展',desc:'常有清晰轮廓、平坦底部和圆顶状顶部，像棉花团一样。',imageId:'cumulus-01',count:398},
    {id:'Cb',latin:'Cumulonimbus',zh:'积雨云',level:'低云（可高耸发展）',shape:'高耸、浓厚、垂直发展',desc:'云体高大浓厚，常呈山峰状或铁砧状，可伴随雷暴、强降水等。',imageId:'cumulonimbus-01',count:33}
  ],
  dataset: {
    name:'CCAiM-CloudsDataset', total:971, size:'约 3.09 GB', license:'MIT', url:'https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset',
    note:'数据集页面列出 971 张地面云图，覆盖 WMO 十种云属。类别分布不均衡，积云样本占比较高。网站展示用的精选照片与科研数据集样本分开标注。'
  },
  quiz: [
    {photo:'cirrus-01', q:'哪一种云常呈现细长、羽毛状的纤维结构？', options:['卷云','积云','层云','积雨云'], answer:'卷云', explain:'卷云通常由冰晶组成，常呈细丝、羽毛或马尾状。'},
    {photo:'cumulus-01', q:'像棉花团一样，顶部蓬松、底部较平的云通常是？', options:['雨层云','积云','卷层云','层云'], answer:'积云', explain:'积云常有清晰轮廓和圆顶状顶部，是常见的低云。'},
    {photo:'cirrocumulus-01', q:'细小云块排列成鱼鳞状纹理，最可能是哪一种？', options:['卷积云','高层云','层积云','积雨云'], answer:'卷积云', explain:'卷积云由细小云块或云片组成，常形成鱼鳞状纹理。'},
    {photo:'cumulonimbus-01', q:'具有强烈垂直发展、可能伴随雷暴的云是？', options:['卷云','层云','积雨云','高积云'], answer:'积雨云', explain:'积雨云是强对流天气的重要云体，常伴随雷暴和强降水。'},
    {photo:'altocumulus-01', q:'由较大云块或云团组成，常见于中云层的是？', options:['高积云','卷云','雨层云','层云'], answer:'高积云', explain:'高积云属于中云，常呈片状、层状或团块状。'}
  ]
};

/*
 * 首批 100 张 CCAiM 公开数据集样本。
 * 文件名按 Hugging Face clouds_1 目录的字典序对应 Dataset Viewer 前 100 行；
 * 标签来自数据集 Viewer 的 class label 字段。原始文件保留在数据集仓库中，
 * 本项目使用远程原图链接并逐张保留数据集来源。
 */
window.CLOUD_DATA.datasetSamples = (() => {
  const labelMap = {
    0: ['Altocumulus', '高积云'], 1: ['Altostratus', '高层云'],
    2: ['Cirrocumulus', '卷积云'], 3: ['Cirrostratus', '卷层云'],
    4: ['Cirrus', '卷云'], 5: ['Cumulonimbus', '积雨云'],
    6: ['Cumulus', '积云'], 7: ['Nimbostratus', '雨层云'],
    8: ['Stratocumulus', '层积云'], 9: ['Stratus', '层云']
  };
  const labels = [9,1,6,0,0,4,4,6,5,5,4,6,6,0,9,6,6,9,9,9,3,9,3,9,6,9,6,6,6,6,8,6,8,4,4,6,8,8,4,6,9,4,4,4,4,8,9,8,8,8,8,4,8,4,4,1,9,0,0,2,9,9,4,6,6,1,4,4,2,2,0,9,0,0,0,2,6,6,3,3,4,2,4,4,6,6,6,9,3,7,0,2,4,3,4,1,0,9,8,8];
  const files = Array.from({length: 971}, (_, i) => `${i}.jpg`).sort();
  const counts = {};
  return labels.map((label, index) => {
    const [type, typeZh] = labelMap[label];
    counts[typeZh] = (counts[typeZh] || 0) + 1;
    const no = String(index + 1).padStart(3, '0');
    const filename = files[index];
    const source = `https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset/resolve/main/clouds_1/${filename}`;
    return {
      id: `ccaim-${no}`, title: `云图样本 ${no}`, english: `CCAiM SAMPLE ${no}`,
      type, typeZh, mood: '科学样本', color: '自然色', time: '数据集',
      image: source, source, sourceName: 'CCAiM-CloudsDataset', photographer: '数据集贡献者', license: 'MIT（数据集页面标注）',
      note: `来自 CCAiM-CloudsDataset 的公开地面云图样本。数据集 Viewer 标签为「${type}（${typeZh}）」。当前条目用于云型图鉴与视觉探索，不补写未提供的拍摄地点或时间，也不将其解释为实时天气信息。`,
      tags: ['公开数据集', '地面云图', typeZh, 'CCAiM'],
      palette: ['#dceaf4', '#a9c5da', '#7f9db5', '#f5eee9'], datasetIndex: index
    };
  });
})();

