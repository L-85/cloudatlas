(() => {
  const DATA = window.CLOUD_DATA;
  DATA.photos = DATA.photos.concat(DATA.datasetSamples || []);
  DATA.photos.forEach(p => { if (!p.sourceName && String(p.source || '').includes('pexels.com')) p.sourceName = 'Pexels'; });
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const memoryStore = new Map();
  const state = {
    page: 'home', query: '', searchComposing: false, filter: '全部', favorites: load('cloud-favorites', []),
    journals: load('cloud-journals', []), selectedMood: '晴朗', quizIndex: 0, quizAnswers: [],
    colorPhoto: DATA.photos[0].id, palette: DATA.photos[0].palette, modalPhoto: null,
    exploreLimit: 24, dailyPhoto: null, datasetOffset: (DATA.datasetSamples || []).length,
    datasetLoading: false, datasetError: '', postcardTemplate: 'cloud', postcardPickerOffset: 0,
    userPhotos: [], uploadDrafts: [], uploadFilter: '全部', userDB: null, userStorageError: ''
  };
  const moods = ['晴朗','温柔','想念','平静','惊喜','低落','自由'];
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  function load(key, fallback){ try { const raw=window.localStorage.getItem(key); return raw===null?(memoryStore.has(key)?memoryStore.get(key):fallback):JSON.parse(raw); } catch { return memoryStore.has(key)?memoryStore.get(key):fallback; } }
  function save(key, value){ memoryStore.set(key, value); try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* 本地文件或隐私模式禁止存储时，当前页面仍可正常使用 */ } }
  function photo(id){ return DATA.photos.find(p => p.id === id) || DATA.photos[0]; }
  function postcardPhoto(entry){
    const live=DATA.photos.find(p=>String(p.id)===String(entry?.photoId));
    if(live)return live;
    if(entry?.photoSnapshot?.image)return entry.photoSnapshot;
    return photo(entry?.photoId);
  }
  const USER_DB_NAME = 'cloud-atlas-local-library';
  const USER_STORE = 'user-cloud-photos';
  function openUserDatabase(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){reject(new Error('照片暂时无法保存'));return;}
      const request=indexedDB.open(USER_DB_NAME,1);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(USER_STORE))db.createObjectStore(USER_STORE,{keyPath:'id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('无法打开本地图片库'));
    });
  }
  function idbRequest(mode, action){
    return new Promise((resolve,reject)=>{
      if(!state.userDB){reject(new Error('本地图片库尚未准备好'));return;}
      const tx=state.userDB.transaction(USER_STORE,mode); const store=tx.objectStore(USER_STORE); let req,result;
      try{req=action(store);}catch(error){reject(error);return;}
      req.onsuccess=()=>{result=req.result;};
      req.onerror=()=>reject(req.error||new Error('本地图片存储失败'));
      tx.oncomplete=()=>resolve(result);
      tx.onerror=()=>reject(tx.error||new Error('本地图片事务失败'));
      tx.onabort=()=>reject(tx.error||new Error('本地图片事务已取消'));
    });
  }
  function idbGetAll(){return idbRequest('readonly',store=>store.getAll());}
  function idbPut(record){return idbRequest('readwrite',store=>store.put(record));}
  function idbDelete(id){return idbRequest('readwrite',store=>store.delete(id));}
  function typeInfo(latin){return DATA.types.find(t=>t.latin===latin)||null;}
  function userRecordToPhoto(record){
    const image=URL.createObjectURL(record.blob);
    return {...record,image,source:image,sourceName:'个人上传',photographer:'你',license:'个人拍摄',isUserUpload:true,
      tags:['个人上传',record.typeZh||'待分类',record.mood||'日常'].filter(Boolean),
      palette:record.palette||['#dceaf4','#a9c5da','#7f9db5','#f5eee9']};
  }
  async function initUserLibrary(){
    try{
      state.userDB=await openUserDatabase();
      const records=await idbGetAll();
      state.userPhotos=records.map(userRecordToPhoto);
      DATA.photos.push(...state.userPhotos);
    }catch(error){state.userStorageError=error.message||'本地图片库暂不可用';}
    render();
  }
  function queueUploadFiles(fileList){
    const files=[...fileList]; if(!files.length)return;
    const accepted=[]; const rejected=[];
    files.forEach(file=>{
      if(!file.type.startsWith('image/')){rejected.push(file.name+'（不是图片）');return;}
      if(file.size>20*1024*1024){rejected.push(file.name+'（超过20MB）');return;}
      accepted.push({id:'draft-'+Date.now()+'-'+Math.random().toString(16).slice(2),file,preview:URL.createObjectURL(file),
        title:file.name.replace(/\.[^.]+$/,''),type:'Unclassified',typeZh:'待分类',mood:'日常',date:new Date().toISOString().slice(0,10),place:'',note:''});
    });
    state.uploadDrafts.push(...accepted);
    if(rejected.length)toast('部分图片未加入：'+rejected.slice(0,2).join('、'));
    if(accepted.length)toast(`已添加 ${accepted.length} 张照片，请为它们选择云型分类`);
    renderMyClouds();
  }
  async function saveUploadDrafts(){
    if(!state.uploadDrafts.length){toast('请先选择要上传的云朵照片');return;}
    if(!state.userDB){try{state.userDB=await openUserDatabase();}catch(error){toast('照片暂时无法保存，请稍后重试。');return;}}
    const saved=[];
    try{
      for(const draft of state.uploadDrafts){
        const info=typeInfo(draft.type); const typeZh=info?info.zh:'待分类';
        const record={id:'my-cloud-'+Date.now()+'-'+Math.random().toString(16).slice(2),title:draft.title.trim()||'我的天空',english:'MY SKY PHOTO',
          type:info?info.latin:'Unclassified',typeZh,mood:draft.mood||'日常',color:'待提取',time:'个人记录',date:draft.date||new Date().toISOString().slice(0,10),
          place:draft.place.trim(),note:draft.note.trim()||'这是一张由我亲自拍摄并收藏的天空照片。',tags:['个人上传',typeZh,draft.mood||'日常'].filter(Boolean),
          palette:['#dceaf4','#a9c5da','#7f9db5','#f5eee9'],fileName:draft.file.name,createdAt:Date.now(),blob:draft.file};
        await idbPut(record); saved.push(userRecordToPhoto(record));
      }
      state.userPhotos.unshift(...saved); DATA.photos.unshift(...saved);
      state.uploadDrafts.forEach(d=>URL.revokeObjectURL(d.preview)); state.uploadDrafts=[];
      toast(`已把 ${saved.length} 张云朵收进你的天空 ☁`); renderMyClouds();
    }catch(error){toast('保存没有完成，请稍后重试。');}
  }
  async function updateUserPhotoType(id,latin){
    const p=state.userPhotos.find(x=>x.id===id); if(!p)return;
    const info=typeInfo(latin); p.type=info?info.latin:'Unclassified'; p.typeZh=info?info.zh:'待分类';
    p.tags=['个人上传',p.typeZh,p.mood||'日常'];
    try{await idbPut({id:p.id,title:p.title,english:p.english,type:p.type,typeZh:p.typeZh,mood:p.mood,color:p.color,time:p.time,date:p.date,place:p.place,note:p.note,tags:p.tags,palette:p.palette,fileName:p.fileName,createdAt:p.createdAt,blob:p.blob});toast('云图分类已更新');renderMyClouds();}
    catch(error){toast('分类更新失败，请稍后重试');}
  }
  async function deleteUserPhoto(id){
    const p=state.userPhotos.find(x=>x.id===id); if(!p)return;
    if(!window.confirm('确定从「我的云图」中删除这张照片吗？'))return;
    try{await idbDelete(id);URL.revokeObjectURL(p.image);state.userPhotos=state.userPhotos.filter(x=>x.id!==id);DATA.photos=DATA.photos.filter(x=>x.id!==id);state.favorites=state.favorites.filter(x=>x!==id);save('cloud-favorites',state.favorites);toast('这张云图已从本地图库移除');renderMyClouds();}
    catch(error){toast('删除失败，请稍后重试');}
  }
  function downloadUserPhoto(id){
    const p=state.userPhotos.find(x=>x.id===id);if(!p?.blob)return;
    const url=URL.createObjectURL(p.blob);const a=document.createElement('a');a.href=url;a.download=p.fileName||`${p.title||'my-cloud'}.jpg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('原图已下载');
  }
  function cloudSlug(type='Cumulus'){ const map={Cirrus:'cirrus',Cirrocumulus:'cirrocumulus',Cirrostratus:'cirrostratus',Altocumulus:'altocumulus',Altostratus:'altostratus',Nimbostratus:'nimbostratus',Stratocumulus:'stratocumulus',Stratus:'stratus',Cumulus:'cumulus',Cumulonimbus:'cumulonimbus','Evening glow':'postcard-dusk','Mixed sky':'altocumulus'}; return map[type] || 'cumulus'; }
  // 补齐十种云属的挑战题。题目依据图鉴知识编写，图片仅用于观察练习。
  const extraQuizTypes = [
    {type:'Cirrostratus', q:'哪一种高云常呈透明薄幕，有时会让太阳或月亮周围出现光环？', options:['卷层云','卷积云','高积云','层云'], answer:'卷层云', explain:'卷层云常呈透明或乳白色薄幕，冰晶可能使日月光线形成晕。'},
    {type:'Altostratus', q:'哪一种中云常形成广阔的灰色或蓝灰色云幕，太阳透过时轮廓较模糊？', options:['高层云','高积云','卷云','积云'], answer:'高层云', explain:'高层云通常覆盖较大范围，呈灰色或蓝灰色层状云幕。'},
    {type:'Nimbostratus', q:'哪一种云通常厚而暗、范围广，常与持续性降水有关？', options:['雨层云','卷层云','卷云','积云'], answer:'雨层云', explain:'雨层云是厚实的降水云层，常带来较持续的降水。'},
    {type:'Stratocumulus', q:'哪一种低云常由较大的云块或云团组成，呈层状铺展并带有明暗变化？', options:['层积云','层云','高积云','卷积云'], answer:'层积云', explain:'层积云由较大的云块、云团或云层组成，常呈波状或片状。'},
    {type:'Stratus', q:'哪一种低云常呈均匀灰色云幕，云底较低，有时看起来像抬升的雾？', options:['层云','雨层云','积云','卷层云'], answer:'层云', explain:'层云通常是低而均匀的云层，外观接近雾，但位于地面之上。'}
  ];
  const extraQuiz = extraQuizTypes.map((q, index) => {
    const sample = DATA.datasetSamples.find(p => p.type === q.type) || DATA.photos.find(p => p.type === q.type) || DATA.photos[0];
    return { photo: sample.id, ...q };
  });
  DATA.quiz = [...DATA.quiz, ...extraQuiz];

  document.addEventListener('error', e => {
    const img=e.target;
    if(img && img.tagName==='IMG' && !img.dataset.fallbackApplied){
      img.dataset.fallbackApplied='1';
      const p=photo(img.dataset.cloudId);
      const slug=cloudSlug(img.dataset.cloudType || p?.type);
      // 远程照片不可用时，使用项目内置的对应云型插画，避免空白或破图。
      img.src=`assets/cloud-types/${slug}.svg`;
      img.classList.add('illustration-fallback');
      const host=img.closest('.card-image,.hero-photo-frame,.today-image-v2,.genera-image,.atlas-photo,.postcard-photo,.saved-postcard-image,.color-preview,.quiz-image,.modal-detail-image,.journal-thumb,.sample-image');
      if(host && !host.querySelector('.image-fallback-note')){
        const note=document.createElement('span'); note.className='image-fallback-note'; note.textContent='云型示意插画'; host.appendChild(note);
      }
    }
  }, true);
  function esc(s=''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function toast(message){ let el=$('.toast'); if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)} el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2200); }
  function setPage(page){ state.page=page; state.query=''; state.filter='全部'; state.modalPhoto=null; modalRoot.innerHTML=''; render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function syncHeader(){ $$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page)); $('#favorite-count').textContent=state.favorites.length; }
  function favoriteButton(p){ const saved=state.favorites.includes(p.id); return `<button class="favorite-btn ${saved?'saved':''}" data-fav="${p.id}" aria-label="${saved?'取消收藏':'收藏'}">${saved?'♥':'♡'}</button>`; }
  function card(p){ const source=p.isUserUpload?'我的云图':p.sourceName==='CCAiM-CloudsDataset'?'公开数据集':'摄影精选'; return `<article class="cloud-card" data-open="${p.id}"><div class="card-image"><img data-cloud-id="${p.id}" src="${p.image}" alt="${esc(p.title)}" loading="lazy" referrerpolicy="no-referrer"><span class="card-label">${esc(p.typeZh)} · ${esc(source)}</span>${favoriteButton(p)}</div><div class="card-body"><div class="card-title-row"><div><h3>${esc(p.title)}</h3><div class="english">${esc(p.english)}</div></div><span class="pill">${esc(p.time)}</span></div><div class="mini-tags">${p.tags.slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="card-footer"><span class="type">${esc(p.typeZh)}</span><span>查看云朵档案</span></div></div></article>`; }
  function sectionHead(kicker,title,desc,link=''){ return `<div class="section-head"><div><div class="eyebrow">${kicker}</div><h2>${title}</h2><p>${desc}</p></div>${link?`<button class="text-link" data-page="${link}">查看全部</button>`:''}</div>`; }
  function renderHome(){
    const editorial = DATA.photos.filter(p => p.sourceName === 'Pexels');
    const hero = photo(state.dailyPhoto || 'cumulus-02');
    const daily = photo(state.dailyPhoto || editorial[(new Date().getDate()+new Date().getMonth())%Math.max(1,editorial.length)].id);
    const featured = ['cirrus-02','altocumulus-02','sunset-02','cumulonimbus-02'].map(id=>photo(id));
    const journeys = [
      {page:'explore',title:'漫游天空',en:'EXPLORE THE SKY',desc:'从光线、时刻与形态出发，遇见天空不同的表情。',icon:'✧',tone:'blue',action:'开始浏览'},
      {page:'atlas',title:'读懂云朵',en:'LEARN THE CLOUDS',desc:'认识 WMO 十种云属，让每一次抬头都有名字。',icon:'☁',tone:'lav',action:'打开图鉴'},
      {page:'journal',title:'留下这一刻',en:'KEEP THE MOMENT',desc:'选一片天空、写一句话，制作属于今天的明信片。',icon:'✉',tone:'pink',action:'制作明信片'}
    ];
    const typeTiles = DATA.types.map(t=>{
      const p=DATA.photos.find(x=>x.type===t.latin) || DATA.photos.find(x=>x.typeZh===t.zh) || DATA.photos[0];
      return `<button class="genera-tile" data-page="atlas"><span class="genera-image"><img data-cloud-id="${p.id}" src="${p.image}" alt="${t.zh}" loading="lazy"></span><span class="genera-copy"><small>${t.id} · ${t.level}</small><strong>${t.zh}</strong><em>${t.latin}</em></span></button>`;
    }).join('');
    app.innerHTML=`
      <section class="hero-v2 hero-v3">
        <div class="hero-copy-v2">
          <div class="hero-kicker-v2"><span></span> A LITTLE MUSEUM OF THE SKY</div>
          <h1>把天空<br><em>收藏起来</em></h1>
          <p class="hero-subtitle-v2">云迹 CLOUD ATLAS</p>
          <p class="hero-desc-v2">有些云像棉花，有些云像海浪；有些只在日落时，悄悄染上粉色。来这里认识云朵、收藏天空，也为平凡的日子留下一张明信片。</p>
          <div class="hero-actions-v2"><button class="btn" data-page="explore">开始探索</button><button class="btn ghost" data-page="myclouds">收藏我的天空</button></div>
        </div>
        <div class="hero-visual-v2">
          <div class="hero-photo-frame"><img data-cloud-id="${hero.id}" src="${hero.image}" alt="云迹精选天空摄影" fetchpriority="high"><div class="hero-photo-shade"></div><div class="hero-photo-caption"><div><small>THE SKY, TODAY</small><strong>${esc(hero.title)}</strong><em>${esc(hero.typeZh)} · ${esc(hero.english)}</em></div><span>LOOK UP ✧</span></div></div>
        </div>
      </section>
      <section class="home-manifesto"><span>✧</span><p>天空从不重复。<strong>云迹</strong>把稍纵即逝的形状、颜色与心情，变成可以再次打开的收藏。</p><small>LOOK UP · NOTICE · REMEMBER</small></section>
      <section class="section home-journeys">${sectionHead('BEGIN YOUR JOURNEY','选择一种与天空相遇的方式','浏览、认识或记录——从此刻最想做的事开始。')}<div class="journey-grid">${journeys.map((m,i)=>`<button class="journey-card ${m.tone}" data-page="${m.page}"><span class="journey-number">0${i+1} / 03</span><span class="journey-icon">${m.icon}</span><span class="journey-copy"><small>${m.en}</small><strong>${m.title}</strong><p>${m.desc}</p><em>${m.action}</em></span></button>`).join('')}</div></section>
      <section class="section today-section">${sectionHead('A CLOUD FOR TODAY','今日云朵','每天遇见一片不同的天空，让今天有一个轻轻的开始。')}<div class="today-card-v2"><div class="today-image-v2"><img data-cloud-id="${daily.id}" src="${daily.image}" alt="${esc(daily.title)}" loading="lazy"><span class="today-image-label">CLOUD OF THE DAY</span></div><div class="today-copy-v2"><div class="eyebrow">${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric'})} · TODAY'S FIND</div><h3>${esc(daily.title)}</h3><div class="latin">${esc(daily.typeZh)} / ${esc(daily.english)}</div><p>${esc(daily.note)}</p><div class="daily-meta"><span class="pill">${esc(daily.mood)}</span><span class="pill">${esc(daily.color)}</span><span class="pill">${esc(daily.time)}</span></div><div class="hero-actions"><button class="btn small" data-open="${daily.id}">查看云朵档案</button><button class="btn ghost small" data-daily>换一朵云</button></div></div></div></section>
      <section class="section home-gallery-section">${sectionHead('CURATED SKIES','天空的不同表情','从纤细的卷云到壮阔的积雨云，收藏几种截然不同的天空。','explore')}<div class="cloud-grid cloud-grid-v2 home-gallery">${featured.map(card).join('')}</div></section>
      <section class="section personal-cloud-invite">
        <div class="personal-cloud-invite-copy">
          <div class="eyebrow">YOUR OWN SKY · PERSONAL CLOUD ALBUM</div>
          <h2>把你拍下的天空，<br><em>也收进云迹。</em></h2>
          <p>不只有远方的云，也有你生活里抬头遇见的那一片。上传照片、选择云型、写下拍摄时的心情，慢慢建立自己的天空档案。</p>
          <div class="personal-cloud-points"><span>多张照片一起上传</span><span>十种云属手动归类</span><span>为每片天空留下名字</span></div>
          <button class="btn personal-cloud-cta" data-page="myclouds"><span>☁</span> 打开我的云图</button>
        </div>
        <div class="personal-cloud-invite-art">
          <img data-cloud-id="${hero.id}" src="${hero.image}" alt="属于自己的天空照片" loading="lazy">
          <div class="personal-cloud-art-note"><small>MY SKY COLLECTION</small><strong>每一片天空，<br>都有属于你的记忆。</strong><span>ADD YOUR MOMENT ✧</span></div>
          <div class="personal-cloud-art-stamp">☁<small>KEEP<br>THIS SKY</small></div>
        </div>
      </section>
      <section class="section genera-section-v2">${sectionHead('THE CLOUD GENERA','十种云属，十种天空语言','以世界气象组织 WMO 的云属体系为基础，建立一份可以慢慢翻阅的云朵图鉴。','atlas')}<div class="genera-grid-v2">${typeTiles}</div><div class="atlas-footnote">云朵摄影用于形态观察与视觉欣赏；正式云型识别仍需结合完整观测条件。</div></section>
      <section class="section home-studio">${sectionHead('A SMALL SKY STUDIO','继续收藏天空','把观察延伸成一张明信片、一组颜色，或一次轻松的云朵挑战。')}<div class="studio-grid"><article class="studio-card postcard-studio-card"><div><div class="eyebrow">SKY POSTCARDS</div><h3>寄一张天空明信片</h3><p>选一片天空，写下一句话，把今天寄给未来的自己。</p><button class="text-link" data-page="journal">开始制作</button></div><img data-cloud-id="${photo('sunset-02').id}" src="${photo('sunset-02').image}" alt="粉橙色晚霞" loading="lazy"></article><article class="studio-card color-studio-card"><div class="eyebrow">COLLECT THE LIGHT</div><h3>收藏天空的颜色</h3><p>从云图中提取主色，生成属于这一刻的天空色卡。</p><div class="mini-palette"><i></i><i></i><i></i><i></i><i></i></div><button class="text-link" data-page="colors">打开色彩实验室</button></article><article class="studio-card quiz-studio-card"><div class="eyebrow">CLOUD SPOTTER CLUB</div><h3>练习辨认云朵</h3><p>用轻松的小挑战，慢慢练出一双会观察天空的眼睛。</p><div class="quiz-deco">☁ ✧ ☁</div><button class="text-link" data-page="quiz">开始挑战</button></article></div></section>
      <section class="home-bottom-note"><span>☁</span><p>愿你每次抬头，都能遇见一点温柔。</p><small>KEEP LOOKING UP.</small></section>`;
  }
  async function loadDatasetBatch(){
    if(state.datasetLoading || state.datasetOffset >= DATA.dataset.total) return;
    state.datasetLoading = true;
    state.datasetError = '';
    renderExplore();
    const offset = state.datasetOffset;
    const length = Math.min(100, DATA.dataset.total - offset);
    const api = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent('serbekun/CCAiM-CloudsDataset')}&config=default&split=train&offset=${offset}&length=${length}`;
    const zhMap = {Cirrus:'卷云',Cirrocumulus:'卷积云',Cirrostratus:'卷层云',Altocumulus:'高积云',Altostratus:'高层云',Nimbostratus:'雨层云',Stratocumulus:'层积云',Stratus:'层云',Cumulus:'积云',Cumulonimbus:'积雨云'};
    try {
      const response = await fetch(api, {headers:{'Accept':'application/json'}, cache:'no-store'});
      if(!response.ok) throw new Error(`数据服务返回 ${response.status}`);
      const payload = await response.json();
      const labelFeature = (payload.features || []).find(f => f.name === 'label');
      const labelNames = labelFeature?.type?.names || [];
      const rows = payload.rows || [];
      if(!rows.length) throw new Error('本批次没有返回可用样本');
      // clouds_1 目录中的文件按数字文件名排序；与 Viewer 的 row_idx 顺序对应。
      // 文件名是数字编号（0.jpg、1.jpg、2.jpg…），不能按字符串排序，否则 10.jpg 会排到 2.jpg 前面。
      const added = [];
      rows.forEach(item => {
        const row = item.row || {};
        const index = Number(item.row_idx ?? offset + added.length);
        const rawLabel = row.label;
        const numericLabel = Number(rawLabel);
        const type = Number.isInteger(numericLabel) && labelNames.length ? (labelNames[numericLabel] || '') : String(rawLabel || '');
        const typeZh = zhMap[type] || '待核验';
        const filename = `${index}.jpg`;
        const image = `https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset/resolve/main/clouds_1/${filename}`;
        if(!image) return;
        const id = `ccaim-${String(index + 1).padStart(3,'0')}`;
        if(DATA.photos.some(p => p.id === id)) return;
        const p = {
          id, title:`云图样本 ${String(index + 1).padStart(3,'0')}`, english:`CCAiM SAMPLE ${String(index + 1).padStart(3,'0')}`,
          type: type || 'Unverified', typeZh, mood:'科学样本', color:'自然色', time:'数据集',
          image, source:image, sourceName:'CCAiM-CloudsDataset', photographer:'数据集贡献者',
          license:'MIT（数据集页面标注）', datasetIndex:index, verifiedLabel:Boolean(type),
          note:type ? `来自 CCAiM-CloudsDataset 的公开地面云图样本。数据集 Viewer 标签为「${type}（${typeZh}）」。` : '来自 CCAiM-CloudsDataset 的公开地面云图样本；当前页面未取得可核验的类别标签。',
          tags:['公开数据集','地面云图',typeZh,'CCAiM'], palette:['#dceaf4','#a9c5da','#7f9db5','#f5eee9']
        };
        added.push(p);
      });
      DATA.datasetSamples.push(...added);
      DATA.photos.push(...added);
      DATA.dataset.total = Number(payload.num_rows_total || DATA.dataset.total);
      state.datasetOffset = rows.length ? Number(rows[rows.length-1].row_idx) + 1 : offset + length;
      state.exploreLimit += 24;
      state.datasetError = added.length ? '' : '已读取数据，但本批次没有新增图片记录。';
      if(state.datasetOffset >= DATA.dataset.total) state.datasetError = '';
      toast(`又载入 ${added.length} 张云图样本 ☁`);
    } catch(error) {
      state.datasetError = '暂时无法连接 Hugging Face 数据服务。已载入的云图仍可正常浏览；稍后可以重试，或直接打开原始数据集。';
    } finally {
      state.datasetLoading = false;
      renderExplore();
    }
  }
  function exploreResultsMarkup(){
    const q=state.query.trim().toLocaleLowerCase();
    const items=DATA.photos.filter(p=>{
      const matchQ=!q||[p.title,p.english,p.type,p.typeZh,p.note,...(p.tags||[])].join(' ').toLocaleLowerCase().includes(q);
      const level=DATA.types.find(t=>t.zh===p.typeZh)?.level;
      const matchF=state.filter==='全部'||(p.tags||[]).includes(state.filter)||p.color===state.filter||p.time===state.filter||p.mood===state.filter||level===state.filter||p.typeZh===state.filter||(state.filter==='公开数据集'&&p.sourceName==='CCAiM-CloudsDataset')||(state.filter==='摄影精选'&&p.sourceName==='Pexels')||(state.filter==='我的云图'&&p.isUserUpload)||(state.filter==='待分类'&&p.isUserUpload&&p.typeZh==='待分类');
      return matchQ&&matchF;
    });
    const visible=items.slice(0,state.exploreLimit);
    const canLoadDataset=state.datasetOffset<DATA.dataset.total&&!['摄影精选','我的云图','待分类'].includes(state.filter);
    return `${items.length?`<div class="gallery-heading-v2"><div><div class="eyebrow">THE CLOUD ARCHIVE</div><h2>云迹图集</h2><p>当前找到 <strong>${items.length}</strong> 张影像 · 点击图片查看详细档案与来源</p></div><div class="gallery-heading-actions"><div class="gallery-count">${String(visible.length).padStart(2,'0')} <small>/ ${String(items.length).padStart(2,'0')} 已展示</small></div><button class="btn small" data-page="myclouds">＋ 上传我的云图</button></div></div><div class="cloud-grid cloud-grid-v2">${visible.map(card).join('')}</div>${visible.length<items.length?`<div class="center-action load-more-wrap"><button class="btn ghost" data-load-more>再看一些云朵 <span>＋</span></button><small>每次展开 24 张 · 图片按需加载</small></div>`:`<div class="end-of-gallery">— 已经看到当前已载入的天空 —</div>`}`:`<div class="empty-state"><div class="empty-icon">☁</div><h3>没有找到这片天空</h3><p>试试更换关键词，或清除筛选条件。</p><button class="btn soft small" data-filter="全部">清除筛选</button></div>`}${state.datasetError?`<div class="dataset-load-error">${esc(state.datasetError)} <a href="${DATA.dataset.url}" target="_blank" rel="noreferrer">打开原始数据集 ↗</a></div>`:''}${canLoadDataset?`<div class="dataset-more-panel"><div><strong>还可以继续探索 ${DATA.dataset.total-state.datasetOffset} 张公开云图</strong><small>通过 Hugging Face Dataset Viewer 按批次读取真实图片与类别标签，不需要下载完整数据集。</small></div><button class="btn ${state.datasetLoading?'soft':'ghost'}" data-load-dataset ${state.datasetLoading?'disabled':''}>${state.datasetLoading?'正在载入…':'加载下一批 100 张云图 ↗'}</button></div>`:state.datasetOffset>=DATA.dataset.total?`<div class="dataset-more-panel complete"><strong>已载入全部公开数据集样本</strong><small>当前数据集样本已全部加入云迹图集。</small></div>`:state.filter==='摄影精选'?`<div class="dataset-more-panel complete"><strong>当前正在浏览摄影精选</strong><small>切换到「全部」或「公开数据集」，即可继续加载科研数据集样本。</small></div>`:''}<div class="dataset-note-v2"><span>ⓘ</span><p>图库同时包含 CCAiM 公开数据集样本与 Pexels 免费摄影作品。数据集标签来自数据集 Viewer；摄影作品用于视觉欣赏，不被擅自标注为严格气象分类。</p><button class="text-link" data-page="sources">查看数据来源 ↗</button></div>`;
  }
  function refreshExploreResults(){
    const results=$('#explore-results');
    if(results)results.innerHTML=exploreResultsMarkup();
  }
  function renderExplore(){
    const filters=['全部','高云','中云','低云','公开数据集','摄影精选','我的云图','待分类',...DATA.types.map(t=>t.zh)];
    app.innerHTML=`<div class="page-intro page-intro-v2"><div class="eyebrow">EXPLORE THE SKY · 01</div><h1>云朵探索</h1><p>把天空当作一座没有边界的画廊。按云型、光线或心情筛选，慢慢遇见你喜欢的那一片。</p><div class="intro-statline"><span><strong>${DATA.photos.length}</strong> 张当前已载入影像</span><i></i><span><strong>${DATA.datasetSamples.length}/${DATA.dataset.total}</strong> 张公开数据集样本</span><i></i><span><strong>10</strong> 种云属</span></div></div><div class="toolbar toolbar-v2"><label class="search-box"><span>⌕</span><input id="explore-search" type="text" inputmode="text" lang="zh-CN" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="搜索云朵名称、云型或关键词…" value="${esc(state.query)}"></label><div class="filter-caption">按来源与云型探索</div><div class="filter-row filter-row-v2">${filters.map(f=>`<button class="chip ${state.filter===f?'active':''}" data-filter="${f}">${f}</button>`).join('')}</div></div><div id="explore-results">${exploreResultsMarkup()}</div>`;
  }
  function renderAtlas(){
    const typeTiles=DATA.types.map(t=>{
      const p=DATA.photos.find(x=>x.type===t.latin) || DATA.photos.find(x=>x.typeZh===t.zh) || DATA.photos[0];
      return `<article class="atlas-card atlas-card-v2"><button class="atlas-photo" data-open="${p.id}"><img data-cloud-id="${p.id}" src="${p.image}" alt="${t.zh}视觉参考" loading="lazy"><span>查看样本 ↗</span></button><div class="atlas-card-copy"><div class="latin">${t.id} · ${t.latin.toUpperCase()}</div><h3>${t.zh}</h3><p>${t.desc}</p><div class="atlas-meta"><span>${t.level}</span><span>${t.shape}</span></div><div class="atlas-card-bottom"><small>数据集样本 ${t.count} 张</small><button class="text-link" data-filter="${t.zh}" data-page="explore">浏览此类云图 ↗</button></div></div></article>`;
    }).join('');
    app.innerHTML=`<div class="page-intro page-intro-v2"><div class="eyebrow">WMO CLOUD CLASSIFICATION · 02</div><h1>云朵图鉴</h1><p>云有自己的名字，也有自己的形状。以世界气象组织的十种云属为线索，认识高空、中空与低空的天空语言。</p></div><div class="atlas-level-legend"><div><span class="level-dot high"></span><strong>高云</strong><small>纤细、轻盈，多由冰晶组成</small></div><div><span class="level-dot middle"></span><strong>中云</strong><small>片状、团块状，形态丰富</small></div><div><span class="level-dot low"></span><strong>低云</strong><small>云底较低，常呈层状或蓬松状</small></div></div><div class="atlas-grid atlas-grid-v2">${typeTiles}</div><div class="soft-panel atlas-note-v2"><div class="eyebrow">A NOTE ABOUT IDENTIFICATION</div><h3>关于云型识别</h3><p>图鉴中的云属名称、基本形态与高度层级依据 WMO 国际云图集整理。CCAiM 数据集样本保留数据集提供的类别标签；Pexels 摄影作品仅作视觉参考。单张照片可能同时呈现多种云形，不能仅凭图片作正式气象判定。</p><a href="https://cloudatlas.wmo.int/en/clouds-genera.html" target="_blank" rel="noreferrer">阅读 WMO 国际云图集 ↗</a></div>`;
  }
  function renderMyClouds(){
    const types=[{latin:'Unclassified',zh:'待分类'},...DATA.types.map(t=>({latin:t.latin,zh:t.zh}))];
    const photos=state.userPhotos.filter(p=>state.uploadFilter==='全部'||(state.uploadFilter==='待分类'?p.typeZh==='待分类':p.typeZh===state.uploadFilter));
    const drafts=state.uploadDrafts;
    app.innerHTML=`<div class="myclouds-page">
      <section class="myclouds-intro"><div class="eyebrow">我的云图 · YOUR OWN SKY · PERSONAL CLOUD ALBUM</div><h1>把你遇见的天空，<em>也收进云迹。</em></h1><p>上传日常拍下的云朵照片，为它们选择云型、记录时间与地点。让每一片天空，都有自己的名字。</p><div class="myclouds-stats"><span><strong>${state.userPhotos.length}</strong><small>张私人云图</small></span><i></i><span><strong>${state.userPhotos.filter(p=>p.typeZh==='待分类').length}</strong><small>张待分类</small></span><i></i><span><strong>${new Set(state.userPhotos.filter(p=>p.typeZh!=='待分类').map(p=>p.typeZh)).size}</strong><small>种已记录云型</small></span></div></section>
      <section class="upload-workspace"><div class="upload-dropzone" id="cloud-dropzone"><div class="upload-cloud-icon">☁</div><div class="eyebrow">ADD A MOMENT TO YOUR SKY</div><h2>上传你拍下的云</h2><p>把相册里的天空带进来。支持一次选择多张图片，建议使用 JPG、PNG 或 WebP，单张不超过 20MB。</p><input id="cloud-upload-input" type="file" accept="image/*" multiple hidden><button class="btn" id="choose-cloud-files" type="button">选择照片 <span>↗</span></button><small>也可以把照片直接拖到这里</small></div>
      <div class="upload-draft-area"><div class="upload-draft-heading"><div><div class="eyebrow">READY TO BE CATALOGUED</div><h3>待整理的照片 <span>${drafts.length}</span></h3><p>每张照片都可以单独归类；不确定云型时，先保留为「待分类」。</p></div>${drafts.length?`<div class="draft-actions"><button class="text-link" id="clear-cloud-drafts">清空待上传</button><button class="btn small" id="save-cloud-drafts">保存到我的云图 ↗</button></div>`:''}</div>${drafts.length?`<div class="upload-draft-grid">${drafts.map(d=>`<article class="upload-draft-card"><div class="draft-photo"><img src="${d.preview}" alt="待上传云图"><span>待保存</span></div><div class="draft-fields"><label>照片名称<input data-draft-field="title" data-draft-id="${d.id}" value="${esc(d.title)}" maxlength="36"></label><label>云型分类<select data-draft-field="type" data-draft-id="${d.id}">${types.map(t=>`<option value="${esc(t.latin)}" ${d.type===t.latin?'selected':''}>${t.zh}${t.latin==='Unclassified'?' · 暂不确定':''}</option>`).join('')}</select></label><div class="draft-field-row"><label>拍摄心情<select data-draft-field="mood" data-draft-id="${d.id}">${['日常','晴朗','温柔','浪漫','安静','壮阔','雨前','惊喜'].map(m=>`<option ${d.mood===m?'selected':''}>${m}</option>`).join('')}</select></label><label>记录日期<input type="date" data-draft-field="date" data-draft-id="${d.id}" value="${d.date}"></label></div><label>拍摄地点 <span>（选填）</span><input data-draft-field="place" data-draft-id="${d.id}" value="${esc(d.place)}" maxlength="40" placeholder="例如：学校操场、回家路上"></label><label>给这片天空留句话 <span>（选填）</span><input data-draft-field="note" data-draft-id="${d.id}" value="${esc(d.note)}" maxlength="100" placeholder="今天的云像一座柔软的小山"></label></div></article>`).join('')}</div>`:`<div class="draft-empty"><span>✧</span><strong>还没有待整理的照片</strong><small>选择一张你拍下的云，我们就能开始建立你的私人天空档案。</small></div>`}</div></section>
      <section class="section mycloud-library"><div class="section-head"><div><div class="eyebrow">MY CLOUD ARCHIVE</div><h2>我的云图收藏</h2><p>已保存的照片可以随时重新分类，也可以用于制作天空明信片和提取天空色彩。</p></div><span class="mycloud-total">${state.userPhotos.length} <small>PHOTOS</small></span></div><div class="mycloud-filter-row">${['全部','待分类',...DATA.types.map(t=>t.zh)].map(f=>`<button class="chip ${state.uploadFilter===f?'active':''}" data-upload-filter="${f}">${f}</button>`).join('')}</div>${photos.length?`<div class="mycloud-card-grid">${photos.map(p=>`<article class="mycloud-card"><div class="mycloud-card-photo"><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"><span class="mycloud-date">${esc(p.date||'个人记录')}</span></div><div class="mycloud-card-body"><div class="mycloud-card-title"><h3>${esc(p.title)}</h3><div class="mycloud-card-actions"><button class="text-link download-cloud" data-download-user-photo="${p.id}" title="下载原图">下载 ↓</button><button class="text-link delete-cloud" data-delete-user-photo="${p.id}" title="删除照片">删除 ×</button></div></div><p>${esc(p.place||'未填写地点')} · ${esc(p.mood||'日常')}</p><label>重新归类<select data-edit-user-type="${p.id}">${types.map(t=>`<option value="${esc(t.latin)}" ${(p.type||'Unclassified')===t.latin?'selected':''}>${t.zh}</option>`).join('')}</select></label><small>${esc(p.fileName||'个人拍摄')}</small></div></article>`).join('')}</div>`:`<div class="empty-state mycloud-empty"><div class="empty-icon">☁</div><h3>${state.uploadFilter==='全部'?'你的私人天空还空着':'这个分类还没有照片'}</h3><p>上传日常遇见的云朵，慢慢建立属于自己的天空图鉴。</p><button class="btn small" data-upload-filter="全部">查看全部</button></div>`}</section>
      ${state.userStorageError?`<div class="dataset-load-error">照片暂时无法载入，请刷新页面后重试。</div>`:''}
    </div>`;
  }
  function renderCollection(){
    const items=DATA.photos.filter(p=>state.favorites.includes(p.id));
    app.innerHTML=`<div class="page-intro"><div class="eyebrow">MY PRIVATE SKY</div><h1>我的天空收藏馆</h1><p>把喜欢的云留在这里。它们不会因为天气变化而消失。</p></div><div class="section-head"><div><div class="eyebrow">MY COLLECTION</div><h2>已收藏 ${items.length} 朵云</h2><p>把喜欢的云留在这里，随时回来看看。</p></div><button class="btn ghost small" data-page="explore">继续探索 ↗</button></div>${items.length?`<div class="cloud-grid">${items.map(card).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">♡</div><h3>收藏馆还空着</h3><p>遇见喜欢的云，点亮卡片右上角的爱心，把它留在这里。</p><button class="btn" data-page="explore">去探索云朵</button></div>`}`;
  }
  function postcardMarkup(entry,p,mode='preview'){
    const isLive=mode==='preview';
    const isSaved=mode==='saved';
    const isModal=mode==='modal';
    const template=['cloud','dusk','archive'].includes(entry.template)?entry.template:'cloud';
    const date=String(entry.date||'').replaceAll('-','.');
    const title=entry.title||'寄给今天的天空';
    const note=entry.note||'今天的云像一封没有寄出的信。';
    const place=entry.place||'FROM MY WINDOW';
    const mood=entry.mood||'晴朗';
    return `<article class="postcard-paper template-${template} ${isSaved?'saved-postcard':''} ${isModal?'modal-postcard':''}" ${isLive?'id="postcard-preview"':''} ${isSaved?`data-saved-postcard="${esc(entry.id)}"`:''}>
      <div class="postcard-photo"><img ${isLive?'id="postcard-image"':''} data-cloud-id="${esc(p.id)}" data-cloud-type="${esc(p.type||'Cumulus')}" src="${esc(p.image)}" alt="${esc(p.title)}" ${isSaved?'loading="lazy"':''}><span class="photo-ribbon">A MOMENT OF SKY</span></div>
      <div class="postcard-writing">
        <div class="postcard-topline"><span class="postcard-brand"><b>☁</b> CLOUD ATLAS <i>·</i> SKY MAIL</span></div>
        <div class="postcard-postmark" aria-hidden="true"><span class="postmark-cloud">☁</span><b>云迹</b><small>SKY POST</small></div>
        <time class="postcard-date" ${isLive?'id="postcard-date"':''}>${esc(date)}</time>
        <div class="postcard-message">
          <span class="postcard-message-kicker">A LITTLE NOTE TO THE SKY</span>
          <h3 ${isLive?'id="postcard-title-preview"':''}>${esc(title)}</h3>
          <p ${isLive?'id="postcard-note-preview"':''}>${esc(note)}</p>
        </div>
        <div class="postcard-signature">
          <div class="postcard-signature-copy"><small>WITH LOVE,</small><span class="postcard-place" ${isLive?'id="postcard-place-preview"':''}>${esc(place)}</span></div>
          <span class="postcard-mood" ${isLive?'id="postcard-mood-preview"':''}>☁ ${esc(mood)}</span>
        </div>
      </div>
    </article>`;
  }
  function renderJournal(){
    const entries=[...state.journals].sort((a,b)=>(b.createdAt||b.id)-(a.createdAt||a.id));
    const today=new Date(); const todayValue=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
    const imageOptions=getPostcardImageOptions();
    const personalOptions=imageOptions.filter(p=>p.isUserUpload);
    const datasetOptions=imageOptions.filter(p=>p.sourceName==='CCAiM-CloudsDataset');
    const curatedOptions=imageOptions.filter(p=>!p.isUserUpload&&p.sourceName!=='CCAiM-CloudsDataset');
    const initial=photo(state.userPhotos[0]?.id||imageOptions[0]?.id||DATA.photos[0].id);
    const optionMarkup=items=>items.map(p=>`<option value="${esc(p.id)}" ${String(p.id)===String(initial.id)?'selected':''}>${esc(p.title)} · ${esc(p.typeZh)}</option>`).join('');
    const cloudPickerMarkup=`<div class="field postcard-cloud-field"><div class="postcard-picker-head"><label for="journal-cloud">挑选一片天空</label><button type="button" class="postcard-next-set" data-postcard-next>换一组 ↻</button></div><div class="postcard-cloud-choices" id="postcard-cloud-choices" aria-label="可选云图"></div><select id="journal-cloud" aria-label="浏览全部云图">${personalOptions.length?`<optgroup label="我的云图">${optionMarkup(personalOptions)}</optgroup>`:''}${curatedOptions.length?`<optgroup label="摄影精选">${optionMarkup(curatedOptions)}</optgroup>`:''}${datasetOptions.length?`<optgroup label="公开云图样本">${optionMarkup(datasetOptions)}</optgroup>`:''}</select></div>`;
    const moodPickerMarkup=`<div class="field postcard-mood-form-field"><label>此刻的心情</label><div class="mood-row mood-row-v2">${moods.map(m=>`<button type="button" class="mood-choice ${state.selectedMood===m?'active':''}" data-mood="${m}">${m}</button>`).join('')}</div></div>`;
    const previewEntry={id:'preview',date:todayValue,mood:state.selectedMood,photoId:initial.id,title:'寄给今天的天空',place:'FROM MY WINDOW',note:'今天的云像一封没有寄出的信。',template:state.postcardTemplate};
    app.innerHTML=`<div class="page-intro page-intro-v2"><div class="eyebrow">SKY POSTCARDS · 03</div><h1>天空明信片</h1><p>有些心情不必写成长篇。选一片天空，留下一句话，把这一刻寄给未来的自己。</p></div>
      <section class="postcard-studio-v2">
        <div class="postcard-form-v2"><div class="eyebrow">WRITE A LITTLE LETTER</div><h2>制作一张天空明信片</h2><p class="form-intro">写下日期、标题与此刻的心情，让这片天空替你保存一段日常。</p>
          <form id="journal-form">
            <div class="field"><label for="journal-title">明信片标题</label><input id="journal-title" type="text" maxlength="28" placeholder="给今天的天空" value="寄给今天的天空"></div>
            <div class="field"><label for="journal-date">日期</label><input id="journal-date" type="date" value="${todayValue}" required></div>
            ${moodPickerMarkup}
            <div class="field"><label for="journal-note">写下一句话</label><textarea id="journal-note" placeholder="今天的云像一封没有寄出的信……" maxlength="120" required></textarea><small class="field-hint">不必写很多，一句话就很好。</small></div>
            <div class="field"><label for="journal-place">寄出地点 <span>（选填）</span></label><input id="journal-place" type="text" maxlength="24" placeholder="例如：窗边、回家的路上"></div>
            <div class="postcard-form-note"><span>✧</span><p>给未来的自己留一句话。某天重新打开时，也许会想起当时抬头看见的那片天空。</p></div>
            <button class="btn postcard-submit" type="submit">把这张明信片收藏起来 ↗</button>
          </form>
        </div>
        <div class="postcard-preview-panel"><div class="preview-panel-top"><div><div class="eyebrow">LIVE PREVIEW</div><h3>你的天空明信片</h3></div><span class="preview-live">即时预览</span></div>
          ${cloudPickerMarkup}
          <div class="postcard-control-stack"><div class="postcard-template-controls"><span>明信片风格</span><div>${[{id:'cloud',label:'云朵原色'},{id:'dusk',label:'晚霞来信'},{id:'archive',label:'天空档案'}].map(t=>`<button type="button" class="template-chip ${state.postcardTemplate===t.id?'active':''}" data-postcard-template="${t.id}">${t.label}</button>`).join('')}</div></div>
</div>
          ${postcardMarkup(previewEntry,initial,'preview')}
          <div class="postcard-export-row"><span>把这一刻，留作一张小小的收藏。</span><button type="button" class="btn small" id="download-postcard">下载明信片 PNG ↓</button></div>
        </div>
      </section>
      <section class="section postcard-wall-section">${sectionHead('YOUR SKY MAILBOX','我的天空邮局','每一张明信片，都是某一天的天气与心情。')}<div class="postcard-wall-count">已收藏 <strong>${entries.length}</strong> 张天空明信片</div>${entries.length?`<div class="postcard-wall-v2">${entries.map(e=>{const p=postcardPhoto(e);return `<div class="saved-postcard-item">${postcardMarkup(e,p,'saved')}<div class="saved-postcard-actions"><button type="button" class="postcard-action-preview" data-preview-journal="${esc(e.id)}">预览明信片 ↗</button><button type="button" class="postcard-action-download" data-download-journal="${esc(e.id)}">下载 PNG ↓</button><button type="button" class="postcard-action-delete" data-delete-journal="${esc(e.id)}">移除 ×</button></div></div>`;}).join('')}</div>`:`<div class="postcard-empty"><div class="empty-postmark">✉</div><h3>邮筒还空着</h3><p>制作第一张天空明信片，把今天的心情寄存在这里。</p></div>`}</section>`;
    state.postcardPickerOffset=Math.max(0,imageOptions.findIndex(p=>String(p.id)===String(initial.id)));
    updatePostcardPreview();renderPostcardCloudChoices();
  }
  function openSavedPostcard(id){
    const entry=state.journals.find(item=>String(item.id)===String(id));
    if(!entry)return;
    const p=postcardPhoto(entry);
    modalRoot.innerHTML=`<div class="postcard-modal-backdrop" data-close-modal><section class="postcard-modal-dialog" role="dialog" aria-modal="true" aria-label="天空明信片预览"><button type="button" class="postcard-modal-close" data-close-modal aria-label="关闭预览">×</button><div class="eyebrow">A POSTCARD FROM YOUR SKY</div><h2>这一天，值得再次打开。</h2>${postcardMarkup(entry,p,'modal')}<div class="postcard-modal-actions"><button type="button" class="btn" data-download-journal="${esc(entry.id)}">下载这张明信片 PNG ↓</button><button type="button" class="btn ghost postcard-modal-back-button" data-close-modal>返回天空邮局</button></div></section></div>`;
  }
  function getPostcardImageOptions(){
    const seen=new Set();
    return DATA.photos.filter(p=>{
      if(!p.image || seen.has(p.id))return false;
      seen.add(p.id);
      return true;
    });
  }
  function renderPostcardCloudChoices(){
    const holder=$('#postcard-cloud-choices');
    const select=$('#journal-cloud');
    if(!holder||!select)return;
    const options=getPostcardImageOptions();
    if(!options.length){holder.innerHTML='';return;}
    const selectedId=select.value || options[0].id;
    const start=state.postcardPickerOffset%options.length;
    const visible=Array.from({length:Math.min(4,options.length)},(_,i)=>options[(start+i)%options.length]);
    holder.innerHTML=visible.map(p=>`<button type="button" class="postcard-cloud-choice ${p.id===selectedId?'active':''}" data-postcard-cloud="${esc(p.id)}" aria-pressed="${p.id===selectedId}" title="${esc(p.title)}"><img data-cloud-id="${esc(p.id)}" src="${esc(p.image)}" alt=""><span><strong>${esc(p.title)}</strong><small>${esc(p.typeZh||'天空')}</small></span></button>`).join('');
  }
  function updatePostcardPreview(){
    const image=$('#postcard-image'); if(!image)return;
    const paper=$('#postcard-preview'); if(paper) paper.className=`postcard-paper template-${state.postcardTemplate}`;
    $$('[data-postcard-template]').forEach(b=>b.classList.toggle('active',b.dataset.postcardTemplate===state.postcardTemplate));
    const p=photo($('#journal-cloud')?.value || DATA.photos[0].id);
    image.dataset.cloudId=p.id; image.dataset.cloudType=p.type||'Cumulus'; image.dataset.fallbackApplied=''; image.src=p.image;
    $('#postcard-title-preview').textContent=$('#journal-title')?.value.trim() || '寄给今天的天空';
    $('#postcard-note-preview').textContent=$('#journal-note')?.value.trim() || '今天的云像一封没有寄出的信。';
    $('#postcard-date').textContent=($('#journal-date')?.value || '').replaceAll('-','.');
    $('#postcard-place-preview').textContent=$('#journal-place')?.value.trim() || 'FROM MY WINDOW';
    $('#postcard-mood-preview').textContent='☁ '+state.selectedMood;
  }
  async function downloadPostcard(savedEntry=null,imageOverride=''){
    const entry=savedEntry||{
      date:$('#journal-date')?.value||'',mood:state.selectedMood,photoId:$('#journal-cloud')?.value||DATA.photos[0].id,
      title:$('#journal-title')?.value.trim()||'寄给今天的天空',note:$('#journal-note')?.value.trim()||'今天的云像一封没有寄出的信。',
      place:$('#journal-place')?.value.trim()||'FROM MY WINDOW',template:state.postcardTemplate
    };
    const p=postcardPhoto(entry);
    const title=entry.title||'寄给今天的天空';
    const note=entry.note||'今天的云像一封没有寄出的信。';
    const date=String(entry.date||'').replaceAll('-','.');
    const place=entry.place||'FROM MY WINDOW';
    const mood=entry.mood||'晴朗';
    const template=['cloud','dusk','archive'].includes(entry.template)?entry.template:'cloud';
    const previewImage=savedEntry?null:$('#postcard-image');
    const imageSrc=imageOverride||(previewImage?.dataset.fallbackApplied==='1'?previewImage.currentSrc:'')||p.image;
    const theme=template==='dusk'
      ?{outer:'#f7eef0',paper:'#fff9f7',line:'#ecd9dc',accent:'#bd8799',ink:'#8d6b83',note:'#9a8794',chip:'#f8e9ec',chipText:'#a97889'}
      :template==='archive'
      ?{outer:'#eef3f1',paper:'#fbfcf8',line:'#d9e3dd',accent:'#7895a8',ink:'#526f83',note:'#8497a4',chip:'#edf3ee',chipText:'#6e8b7c'}
      :{outer:'#f6f3ee',paper:'#fffefa',line:'#e8e3de',accent:'#c69eaa',ink:'#55738a',note:'#899ba7',chip:'#edf3f6',chipText:'#7896a9'};
    if(document.fonts?.ready){try{await document.fonts.ready;}catch(_){}}
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=930;
    const ctx=canvas.getContext('2d');if(!ctx){toast('当前浏览器无法生成明信片图片');return;}
    ctx.textBaseline='alphabetic';
    ctx.fillStyle=theme.outer;ctx.fillRect(0,0,1600,970);
    ctx.fillStyle=theme.paper;ctx.fillRect(34,22,1532,886);
    ctx.strokeStyle=theme.line;ctx.lineWidth=2;ctx.strokeRect(34,22,1532,926);

    // Match the on-screen 54:46 image-to-letter composition.
    const ix=56,iy=44,iw=800,ih=842,writeX=856,textX=916,rightX=1490;
    try{
      const img=new Image();
      if(!/^(blob:|data:|file:)/i.test(imageSrc))img.crossOrigin='anonymous';
      await new Promise((resolve,reject)=>{
        let settled=false;
        const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(timer);fn(value);};
        const timer=setTimeout(()=>finish(reject,new Error('image load timeout')),10000);
        img.onload=()=>finish(resolve);
        img.onerror=()=>finish(reject,new Error('image load failed'));
        img.src=imageSrc;
        if(img.complete&&img.naturalWidth)finish(resolve);
      });
      const scale=Math.max(iw/img.naturalWidth,ih/img.naturalHeight);
      const sw=iw/scale,sh=ih/scale,sx=(img.naturalWidth-sw)/2,sy=(img.naturalHeight-sh)/2;
      ctx.save();ctx.beginPath();ctx.rect(ix,iy,iw,ih);ctx.clip();
      ctx.drawImage(img,sx,sy,sw,sh,ix,iy,iw,ih);ctx.restore();
    }catch(_){
      toast('这张云图暂时无法导出 PNG。若为网络图片，请换一张支持跨域导出的云图；个人上传照片可直接导出。');
      return;
    }

    // Quiet paper panel, fine divider and a single, clear information hierarchy.
    ctx.fillStyle=theme.paper;ctx.fillRect(writeX,iy,688,ih);
    ctx.strokeStyle=theme.line;ctx.lineWidth=2;
    ctx.strokeRect(ix,iy,iw,ih);
    ctx.beginPath();ctx.moveTo(writeX,iy+16);ctx.lineTo(writeX,iy+ih-16);ctx.stroke();

    ctx.fillStyle='#9b9290';
    ctx.font='600 18px "DM Sans",Arial,sans-serif';
    ctx.letterSpacing='3px';
    ctx.textAlign='left';
    ctx.fillText('CLOUD ATLAS  ·  SKY MAIL',textX,112);
    ctx.fillStyle='#96a7b2';
    ctx.font='500 21px "DM Sans",Arial,sans-serif';
    ctx.letterSpacing='2px';
    ctx.fillText(date,textX,166);
    // A restrained postage stamp in the upper-right corner of the writing panel.
    const sx=1378,sy=78,sw=112,sh=132;
    ctx.save();ctx.translate(sx+sw/2,sy+sh/2);ctx.rotate(.045);
    ctx.fillStyle='#fffdfa';ctx.strokeStyle=theme.accent;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(-sw/2,-sh/2,sw,sh);
    ctx.setLineDash([]);ctx.strokeStyle=theme.line;ctx.lineWidth=1.5;ctx.strokeRect(-sw/2+8,-sh/2+8,sw-16,sh-16);
    ctx.fillStyle=theme.accent;ctx.textAlign='center';ctx.font='500 42px serif';ctx.fillText('☁',0,-8);
    ctx.font='500 23px "Noto Serif SC",serif';ctx.fillText('云迹',0,25);
    ctx.font='600 12px "DM Sans",Arial,sans-serif';ctx.letterSpacing='2px';ctx.fillText('SKY POST',0,47);
    ctx.restore();ctx.textAlign='left';

    const wrap=(value,maxWidth,font,maxLines)=>{
      ctx.font=font;
      const lines=[];let line='';
      for(const ch of String(value||'')){
        if(ctx.measureText(line+ch).width>maxWidth&&line){lines.push(line);line=ch;}
        else line+=ch;
      }
      if(line)lines.push(line);
      if(lines.length>maxLines){
        lines.length=maxLines;let last=lines[maxLines-1];
        while(last&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);
        lines[maxLines-1]=last+'…';
      }
      return lines;
    };
    const titleFont='500 58px "Noto Serif SC","Songti SC","SimSun",serif';
    const noteFont='400 32px "Noto Sans SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
    ctx.fillStyle=theme.ink;
    const titleLines=wrap(title,620,titleFont,2);
    ctx.fillStyle=theme.accent;
    ctx.font='600 15px "DM Sans",Arial,sans-serif';
    ctx.letterSpacing='3px';
    ctx.fillText('A LITTLE NOTE TO THE SKY',textX,326);
    const titleY=420;
    titleLines.forEach((line,index)=>{ctx.font=titleFont;ctx.fillText(line,textX,titleY+index*84);});
    ctx.fillStyle=theme.note;
    const noteLines=wrap(note,620,noteFont,4);
    let noteY=titleY+(titleLines.length-1)*84+81;
    noteLines.forEach(line=>{ctx.font=noteFont;ctx.fillText(line,textX,noteY);noteY+=67;});

    // Keep the photograph free of extra labels; the writing panel carries the card details.
    const footerY=780;
    ctx.strokeStyle=theme.line;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(textX,footerY);ctx.lineTo(rightX,footerY);ctx.stroke();
    ctx.fillStyle='#9aa9b1';
    ctx.font='500 22px "Noto Sans SC","Microsoft YaHei",sans-serif';
    ctx.letterSpacing='1px';
    ctx.textAlign='left';
    ctx.font='600 15px "DM Sans",Arial,sans-serif';
    ctx.fillStyle='#a79a96';
    ctx.fillText('WITH LOVE,',textX,826);
    ctx.font='500 22px "Noto Sans SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle='#9aa9b1';
    ctx.fillText(String(place).slice(0,28),textX,870);

    ctx.font='500 22px "Noto Sans SC","Microsoft YaHei",sans-serif';
    const moodText=`☁ ${mood}`;
    const moodWidth=Math.min(250,ctx.measureText(moodText).width+34);
    const moodX=rightX-moodWidth;
    ctx.fillStyle=theme.chip;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(moodX,815,moodWidth,64,32);
    else ctx.rect(moodX,815,moodWidth,64);
    ctx.fill();
    ctx.fillStyle=theme.chipText;
    ctx.textAlign='center';
    ctx.fillText(moodText,moodX+moodWidth/2,858);
    ctx.textAlign='left';

    let blob;
    try{blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}
    catch(_){toast('明信片图片生成失败，请稍后重试');return;}
    if(!blob){toast('明信片图片生成失败，请稍后重试');return;}
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`云迹天空明信片-${date.replaceAll('.','-')||'sky'}.png`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast('明信片 PNG 已生成，内容与预览一致 ♡');
  }
  function renderColors(){
    const p=photo(state.colorPhoto);
    app.innerHTML=`<div class="page-intro"><div class="eyebrow">COLORS OF THE SKY</div><h1>天空色彩实验室</h1><p>云的颜色不止是白色。光线经过天空，留下蓝、灰、粉、紫与金色的层次。</p></div><div class="color-layout"><div class="color-preview"><img id="color-image" data-cloud-id="${p.id}" crossorigin="anonymous" src="${p.image}" alt="${p.title}"><div class="preview-caption"><div class="eyebrow" style="color:#fff">SELECTED SKY</div><strong class="serif">${esc(p.title)}</strong></div></div><div class="soft-panel"><div class="eyebrow">PALETTE EXTRACTOR</div><h3>提取这片天空的颜色</h3><p class="muted tiny" style="line-height:1.8">选择一张云图，提取它的主色调，收藏这片天空独有的颜色。</p><div class="field"><label for="color-select">选择云朵影像</label><select id="color-select">${DATA.photos.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${x.title}</option>`).join('')}</select></div><div class="palette-row" id="palette-row">${state.palette.map(c=>`<div class="swatch" style="background:${c}"><span>${c}</span></div>`).join('')}</div><button class="btn" id="extract-colors">提取图片主色 ↗</button><button class="btn ghost small" id="copy-palette" style="margin-left:8px">复制色卡 HEX</button><div class="muted tiny" id="color-status" style="margin-top:14px">当前显示：素材参考色卡</div></div></div><section class="section">${sectionHead('SKY COLOR NOTES','天空的颜色笔记','颜色来自光线、云层与天气条件的共同作用。')}<div class="type-strip"><div class="type-tile"><span class="type-symbol">◌</span><strong>晨雾蓝</strong><small>#B9D0DF</small></div><div class="type-tile"><span class="type-symbol">◒</span><strong>晴空蓝</strong><small>#83B3D3</small></div><div class="type-tile"><span class="type-symbol">◍</span><strong>云灰</strong><small>#AAB7C0</small></div><div class="type-tile"><span class="type-symbol">◐</span><strong>晚霞粉</strong><small>#D7A3A5</small></div><div class="type-tile"><span class="type-symbol">◑</span><strong>暮色紫</strong><small>#82738E</small></div></div></section>`;
  }
  function renderQuiz(){
    const quiz=Array.isArray(DATA.quiz)?DATA.quiz:[];
    if(!quiz.length){app.innerHTML=`<div class="page-intro"><div class="eyebrow">CLOUD QUIZ</div><h1>云朵挑战</h1><p>题库暂时没有准备好，稍后再来看看吧。</p></div>`;return;}
    if(!Number.isFinite(state.quizIndex)||state.quizIndex<0)state.quizIndex=0;
    const i=state.quizIndex;
    const score=state.quizAnswers.filter((answer,index)=>quiz[index]&&answer===quiz[index].answer).length;
    if(i>=quiz.length){app.innerHTML=`<div class="page-intro"><div class="eyebrow">CLOUD QUIZ COMPLETED</div><h1>天空观察员</h1><p>你完成了本轮云朵挑战。</p></div><div class="soft-panel" style="max-width:600px;margin:0 auto;text-align:center;padding:46px"><div style="font-size:54px">☁</div><div class="eyebrow" style="margin-top:16px">YOUR RESULT</div><h2 class="serif" style="font-size:42px;color:#527b98;margin:10px">${score} / ${quiz.length}</h2><p class="muted">${score===quiz.length?'太棒了，你已经拥有一双善于观察天空的眼睛。':score>=Math.ceil(quiz.length*0.6)?'不错！再多观察几次天空，你会认识更多云。':'每一次抬头，都是新的开始。继续探索云朵图鉴吧。'}</p><button class="btn" id="restart-quiz">再挑战一次</button><button class="btn ghost" data-page="atlas" style="margin-left:8px">去看云朵图鉴</button></div>`;return;}
    const q=quiz[i];
    if(!q){state.quizIndex=0;state.quizAnswers=[];renderQuiz();return;}
    const p=photo(q.photo); const answered=state.quizAnswers[i]!==undefined; const chosen=state.quizAnswers[i];
    app.innerHTML=`<div class="page-intro"><div class="eyebrow">A LITTLE CLOUD QUIZ</div><h1>云朵挑战</h1><p>看一看、猜一猜，认识天空里的不同形状。</p></div><div class="quiz-card"><div class="quiz-image"><img data-cloud-id="${p.id}" src="${p.image}" alt="云朵识别题"></div><div class="quiz-content"><div class="eyebrow">QUESTION ${String(i+1).padStart(2,'0')} / ${quiz.length}</div><div class="quiz-progress"><span style="width:${(i/quiz.length)*100}%"></span></div><h3>${q.q}</h3><div class="quiz-options">${q.options.map(o=>`<button class="quiz-option ${answered?(o===q.answer?'correct':o===chosen?'wrong':''):''} ${chosen===o?'selected':''}" data-quiz-answer="${o}" ${answered?'disabled':''}>${o}</button>`).join('')}</div>${answered?`<div class="quiz-feedback"><strong>${chosen===q.answer?'回答正确 ✓':'再记住这个知识点吧'}</strong><br>${q.explain}</div><div style="margin-top:20px"><button class="btn" id="quiz-next">${i===quiz.length-1?'查看结果':'下一题'} ↗</button></div>`:''}</div></div>`;
  }
  function renderStats(){
    const favs=DATA.photos.filter(p=>state.favorites.includes(p.id)); const counts=DATA.types.map(t=>({name:t.zh,count:favs.filter(p=>p.typeZh===t.zh).length})); const max=Math.max(1,...counts.map(x=>x.count));
    app.innerHTML=`<div class="page-intro"><div class="eyebrow">YOUR SKY PROFILE</div><h1>我的天空档案</h1><p>看看你收藏了多少片天空，又最偏爱哪一种云。</p></div><div class="stats-grid"><div class="stat-card"><strong>${state.favorites.length}</strong><small>收藏云朵</small></div><div class="stat-card"><strong>${state.journals.length}</strong><small>天空日记</small></div><div class="stat-card"><strong>${new Set(favs.map(p=>p.typeZh)).size}</strong><small>收藏云型</small></div><div class="stat-card"><strong>${new Set(state.journals.map(j=>j.date)).size}</strong><small>记录日期</small></div><div class="stat-card"><strong>${state.userPhotos.length}</strong><small>自己拍摄的云图</small></div></div><div class="stats-layout"><section class="soft-panel"><div class="eyebrow">YOUR COLLECTION</div><h3>收藏云型分布</h3>${counts.map(c=>`<div class="bar-row"><span>${c.name}</span><div class="bar-track"><span style="width:${(c.count/max)*100}%"></span></div><strong>${c.count}</strong></div>`).join('')}</section><section class="soft-panel"><div class="eyebrow">YOUR SKY MOMENTS</div><h3>收藏小结</h3><p class="muted" style="font-size:12px;line-height:2">${state.favorites.length?`你已经把 ${state.favorites.length} 片天空留在收藏馆里。继续探索，也许下一片最喜欢的云就在下一次抬头时出现。`:'你的天空收藏馆还在等待第一朵云。去探索页面收藏一张喜欢的云吧。'}</p><div class="daily-meta"><span class="pill">轻盈 ${favs.filter(p=>p.mood==='轻盈').length}</span><span class="pill">治愈 ${favs.filter(p=>p.mood==='治愈').length}</span><span class="pill">浪漫 ${favs.filter(p=>p.mood==='浪漫').length}</span></div><button class="btn small" data-page="collection">打开我的收藏</button></section></div><div class="section"><div class="section-head"><div><div class="eyebrow">RECENT JOURNAL</div><h2>最近的天空日记</h2></div><button class="text-link" data-page="journal">写一页日记 ↗</button></div>${state.journals.length?`<div class="journal-list">${state.journals.slice(-3).reverse().map(e=>`<div class="journal-entry"><div class="journal-thumb"><img data-cloud-id="${photo(e.photoId).id}" src="${photo(e.photoId).image}" alt=""></div><div><small>${esc(e.date)} · ${esc(e.mood)}</small><h4>${esc(photo(e.photoId).title)}</h4><p>${esc(e.note)}</p></div></div>`).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">✧</div><h3>还没有日记</h3><p>去天空日记，留下一点今天的心情。</p><button class="btn" data-page="journal">开始记录</button></div>`}</div>`;
  }
  function renderSources(){
    const ds=DATA.dataset; const max=Math.max(...DATA.types.map(t=>t.count));
    app.innerHTML=`<div class="page-intro page-intro-v2"><div class="eyebrow">OPEN DATA & CREDITS · 06</div><h1>数据与素材来源</h1><p>让每一张云图都有出处，让每一条分类知识都有依据。云迹将科研数据集样本、摄影作品与分类知识分开标注。</p></div><div class="source-grid source-grid-v2"><article class="source-card"><div class="eyebrow">PRIMARY IMAGE DATASET</div><h3>${ds.name}</h3><p>${ds.note}</p><div class="source-meta"><span>${ds.total} 张图片</span><span>10 种云属</span><span>${ds.license}</span><span>${ds.size}</span></div><p class="source-extra">当前已预载 ${DATA.datasetSamples.length} / ${ds.total} 张样本。可在云朵探索页通过 Dataset Viewer 按需继续读取后续批次，不必下载完整数据集。</p><a href="${ds.url}" target="_blank" rel="noreferrer">打开 Hugging Face 数据集 ↗</a></article><article class="source-card"><div class="eyebrow">SECONDARY DATASET</div><h3>Cloud-ImVN 1.0</h3><p>包含 2,100 张 150 × 150 彩色天空图像，划分为 6 类，可用于云图分类、聚类与分割研究。该版本页面标注 CC BY 4.0。</p><div class="source-meta"><span>2,100 张</span><span>6 类</span><span>CC BY 4.0</span></div><a href="https://data.mendeley.com/datasets/vwdd9grvdp/2" target="_blank" rel="noreferrer">打开 Mendeley Data ↗</a></article><article class="source-card"><div class="eyebrow">SCIENTIFIC REFERENCE</div><h3>WMO International Cloud Atlas</h3><p>云迹图鉴中的十种云属名称、基本形态和云层级说明以世界气象组织国际云图集为分类依据。</p><div class="source-meta"><span>10 种云属</span><span>官方分类</span><span>气象知识参考</span></div><a href="https://cloudatlas.wmo.int/en/clouds-genera.html" target="_blank" rel="noreferrer">打开 WMO 国际云图集 ↗</a></article><article class="source-card"><div class="eyebrow">VISUAL PHOTOGRAPHY</div><h3>Pexels 摄影作品</h3><p>精选摄影作品用于首页主视觉、主题欣赏与明信片制作。摄影师与原作品页面已写入素材清单，按 Pexels License 使用。</p><div class="source-meta"><span>免费摄影作品</span><span>逐张保留来源</span></div><a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">查看 Pexels License ↗</a></article></div><section class="section soft-panel source-stats-panel"><div class="eyebrow">CCAiM DATASET DISTRIBUTION</div><h3>971 张云图的类别分布</h3><p class="muted tiny">以下数量来自数据集页面公布的类别统计。数据存在类别不平衡，不能直接解释为自然界云型出现频率。</p><div class="dataset-bars">${DATA.types.map(t=>`<div class="dataset-bar-row"><span>${t.zh}</span><div class="bar-track"><span style="width:${(t.count/max)*100}%"></span></div><strong>${t.count}</strong></div>`).join('')}</div></section><section class="section soft-panel"><div class="eyebrow">SAMPLE ACCESS</div><h3>公开数据集样本入口</h3><p class="muted tiny">网页预载首批 100 张样本，并支持通过 Hugging Face Dataset Viewer 分批读取其余样本；完整数据集约 3.09 GB，不直接打包进课程项目。</p><div class="dataset-sample-grid">${DATA.datasetSamples.slice(0,6).map(p=>`<a class="sample-image" href="${p.source}" target="_blank" rel="noreferrer"><img data-cloud-id="${p.id}" src="${p.image}" alt="${p.title}" loading="lazy"><small>${p.title} · ${p.typeZh} ↗</small></a>`).join('')}</div></section><section class="section soft-panel"><div class="eyebrow">ON-DEMAND DATA ACCESS</div><h3>按需读取完整数据集</h3><p class="muted tiny" style="line-height:1.9">云迹通过 Hugging Face Dataset Viewer 的 /rows 接口按批次获取图像 URL 与类别标签。接口每次最多返回 100 条记录，图片地址为有时效的签名 URL，因此页面在用户主动加载时再请求，不把临时地址写死在项目文件中。</p><a href="https://huggingface.co/docs/dataset-viewer/rows" target="_blank" rel="noreferrer">查看 Dataset Viewer 分页接口说明 ↗</a></section><section class="section soft-panel"><div class="eyebrow">ATTRIBUTION & LICENSE</div><h3>素材使用说明</h3><p class="muted tiny" style="line-height:2">CCAiM 数据集页面标注 MIT 许可；Cloud-ImVN 1.0 页面标注 CC BY 4.0。Pexels 摄影作品依照各自页面和 Pexels License 使用。WMO 页面用于云属知识参考，不将其图集图片打包再分发。数据集许可与其中单张图片的原始权利可能不同，若公开部署或用于商业用途，应再次核对原始来源和授权。</p></section>`;
  }
  function render(){ syncHeader(); const pages={home:renderHome,explore:renderExplore,atlas:renderAtlas,myclouds:renderMyClouds,collection:renderCollection,journal:renderJournal,colors:renderColors,quiz:renderQuiz,stats:renderStats,sources:renderSources}; (pages[state.page]||renderHome)(); }
  function toggleFavorite(id){ if(state.favorites.includes(id)){state.favorites=state.favorites.filter(x=>x!==id);toast('已从收藏中移除')}else{state.favorites.push(id);toast('已收藏这片天空 ♡')} save('cloud-favorites',state.favorites);render(); }
  function openDetail(id){ const p=photo(id); state.modalPhoto=id; modalRoot.innerHTML=`<div class="modal-backdrop" data-close-modal><section class="modal-card" role="dialog" aria-modal="true" aria-label="云朵详情"><button class="modal-close" data-close-modal aria-label="关闭">×</button><div class="modal-detail"><div class="modal-detail-image"><img data-cloud-id="${p.id}" src="${p.image}" alt="${esc(p.title)}"></div><div class="modal-detail-copy"><div class="eyebrow">CLOUD ARCHIVE · ${esc(p.time)}</div><h2>${esc(p.title)}</h2><div class="latin">${esc(p.english.toUpperCase())}</div><div class="daily-meta" style="margin-top:18px"><span class="pill">${esc(p.typeZh)}</span><span class="pill">${esc(p.mood)}</span><span class="pill">${esc(p.color)}</span></div><p>${esc(p.note)}</p><div class="source-meta"><span>来源：${esc(p.sourceName||'Pexels')}</span><span>${esc(p.photographer||'数据集贡献者')}</span>${p.license?`<span>${esc(p.license)}</span>`:''}</div><div class="modal-actions"><button class="btn" data-modal-fav="${p.id}">${state.favorites.includes(p.id)?'♥ 已收藏':'♡ 收藏这朵云'}</button>${p.isUserUpload?'<span class="personal-photo-note">这是你上传的私人云图</span>':`<a class="btn ghost small" href="${p.source}" target="_blank" rel="noreferrer">查看原图来源 ↗</a>`}</div></div></div></section></div>`; }
  function extractColors(){ const p=photo(state.colorPhoto); const img=$('#color-image'); const status=$('#color-status'); if(!img||!status)return; status.textContent='正在读取图片颜色…'; try{const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=48;canvas.height=48;ctx.drawImage(img,0,0,48,48);const data=ctx.getImageData(0,0,48,48).data;const bins={};for(let i=0;i<data.length;i+=16){const r=Math.round(data[i]/32)*32,g=Math.round(data[i+1]/32)*32,b=Math.round(data[i+2]/32)*32;if(data[i+3]<180)continue;const key=[r,g,b].map(v=>Math.min(255,v)).join(',');bins[key]=(bins[key]||0)+1;}const sorted=Object.entries(bins).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>'#'+k.split(',').map(v=>Math.min(255,+v).toString(16).padStart(2,'0')).join(''));state.palette=sorted.length?sorted:p.palette;$('#palette-row').innerHTML=state.palette.map(c=>`<div class="swatch" style="background:${c}"><span>${c}</span></div>`).join('');status.textContent='已从图片像素提取主色。';}catch(e){state.palette=p.palette;$('#palette-row').innerHTML=state.palette.map(c=>`<div class="swatch" style="background:${c}"><span>${c}</span></div>`).join('');status.textContent='这张云图暂时无法直接提取颜色，已为你显示参考色卡。';} }
  document.addEventListener('click', e=>{
    const filter=e.target.closest('[data-filter]'); if(filter){state.filter=filter.dataset.filter;state.exploreLimit=24;if(filter.dataset.page){setPage(filter.dataset.page);state.filter=filter.dataset.filter;renderExplore();}else renderExplore();return;}
    const page=e.target.closest('[data-page]'); if(page){e.preventDefault();setPage(page.dataset.page);$('.main-nav').classList.remove('open');return;}
    const fav=e.target.closest('[data-fav]'); if(fav){e.stopPropagation();toggleFavorite(fav.dataset.fav);return;}
    const open=e.target.closest('[data-open]'); if(open){openDetail(open.dataset.open);return;}
    if(e.target.closest('[data-load-more]')){state.exploreLimit+=24;renderExplore();return;}
    if(e.target.closest('[data-load-dataset]')){loadDatasetBatch();return;}
    const postcardCloudChoice=e.target.closest('[data-postcard-cloud]');
    if(postcardCloudChoice){
      const select=$('#journal-cloud');
      if(select){select.value=postcardCloudChoice.dataset.postcardCloud;state.postcardPickerOffset=Math.max(0,getPostcardImageOptions().findIndex(p=>p.id===select.value));updatePostcardPreview();renderPostcardCloudChoices();}
      return;
    }
    if(e.target.closest('[data-postcard-next]')){
      const options=getPostcardImageOptions();
      if(options.length){state.postcardPickerOffset=(state.postcardPickerOffset+4)%options.length;renderPostcardCloudChoices();}
      return;
    }
    if(e.target.closest('#choose-cloud-files')){$('#cloud-upload-input')?.click();return;}
    if(e.target.closest('#save-cloud-drafts')){saveUploadDrafts();return;}
    if(e.target.closest('#clear-cloud-drafts')){state.uploadDrafts.forEach(d=>URL.revokeObjectURL(d.preview));state.uploadDrafts=[];renderMyClouds();return;}
    const downloadCloud=e.target.closest('[data-download-user-photo]');if(downloadCloud){downloadUserPhoto(downloadCloud.dataset.downloadUserPhoto);return;}
    const deleteCloud=e.target.closest('[data-delete-user-photo]');if(deleteCloud){deleteUserPhoto(deleteCloud.dataset.deleteUserPhoto);return;}
    const uploadFilter=e.target.closest('[data-upload-filter]');if(uploadFilter){state.uploadFilter=uploadFilter.dataset.uploadFilter;renderMyClouds();return;}
    const mood=e.target.closest('[data-mood]'); if(mood){state.selectedMood=mood.dataset.mood;$$('[data-mood]').forEach(b=>b.classList.toggle('active',b.dataset.mood===state.selectedMood));updatePostcardPreview();return;}
    const template=e.target.closest('[data-postcard-template]'); if(template){state.postcardTemplate=template.dataset.postcardTemplate;updatePostcardPreview();return;}
    const savedPreview=e.target.closest('[data-preview-journal]');if(savedPreview){openSavedPostcard(savedPreview.dataset.previewJournal);return;}
    const savedDownload=e.target.closest('[data-download-journal]');if(savedDownload){const entry=state.journals.find(j=>String(j.id)===String(savedDownload.dataset.downloadJournal));const savedImage=savedDownload.closest('.saved-postcard-item')?.querySelector('.postcard-photo img')||savedDownload.closest('.postcard-modal-dialog')?.querySelector('.postcard-photo img');if(entry)downloadPostcard(entry,savedImage?.currentSrc||savedImage?.src||'');return;}
    const del=e.target.closest('[data-delete-journal]'); if(del){state.journals=state.journals.filter(j=>String(j.id)!==String(del.dataset.deleteJournal));save('cloud-journals',state.journals);renderJournal();toast('已从天空邮局移除这张明信片');return;}
    const close=e.target.closest('[data-close-modal]'); if(close && (e.target===close || e.target.closest('.modal-close') || e.target.closest('.postcard-modal-close') || e.target.closest('.postcard-modal-back-button'))){modalRoot.innerHTML='';return;}
    const modalFav=e.target.closest('[data-modal-fav]'); if(modalFav){toggleFavorite(modalFav.dataset.modalFav);openDetail(modalFav.dataset.modalFav);return;}
    if(e.target.closest('#download-postcard')){downloadPostcard();return;}
    if(e.target.closest('[data-daily]')){const pool=DATA.photos.filter(p=>p.sourceName!=='CCAiM-CloudsDataset');const p=pool[Math.floor(Math.random()*pool.length)];state.dailyPhoto=p.id;renderHome();toast('今天又遇见了一朵新云 ☁');return;}
    const qa=e.target.closest('[data-quiz-answer]'); if(qa&&state.quizAnswers[state.quizIndex]===undefined){state.quizAnswers[state.quizIndex]=qa.dataset.quizAnswer;renderQuiz();return;}
    if(e.target.closest('#quiz-next')){state.quizIndex=Math.min(state.quizIndex+1,DATA.quiz.length);renderQuiz();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(e.target.closest('#restart-quiz')){state.quizIndex=0;state.quizAnswers=[];renderQuiz();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(e.target.id==='extract-colors'){extractColors();return;}
    if(e.target.id==='copy-palette'){const text=state.palette.join(', ');if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>toast('色卡 HEX 已复制')).catch(()=>toast('复制失败，请手动选择色值'));}else{window.prompt('复制色卡 HEX：',text);}return;}
  });
  document.addEventListener('compositionstart',e=>{if(e.target.id==='explore-search')state.searchComposing=true;});
  document.addEventListener('compositionend',e=>{if(e.target.id==='explore-search'){state.searchComposing=false;const input=e.target;requestAnimationFrame(()=>{state.query=input.value;state.exploreLimit=24;refreshExploreResults();});}});
  document.addEventListener('input',e=>{if(e.target.id==='explore-search'){state.query=e.target.value;state.exploreLimit=24;if(!e.isComposing&&!state.searchComposing)refreshExploreResults();} if(['journal-title','journal-note','journal-date','journal-place'].includes(e.target.id)) updatePostcardPreview();const draftField=e.target.dataset.draftField;if(draftField){const draft=state.uploadDrafts.find(d=>d.id===e.target.dataset.draftId);if(draft)draft[draftField]=e.target.value;}});
  document.addEventListener('change',e=>{if(e.target.id==='color-select'){state.colorPhoto=e.target.value;state.palette=photo(state.colorPhoto).palette;renderColors();} if(e.target.id==='journal-cloud'){state.postcardPickerOffset=Math.max(0,getPostcardImageOptions().findIndex(p=>p.id===e.target.value));updatePostcardPreview();renderPostcardCloudChoices();}if(e.target.id==='cloud-upload-input'){queueUploadFiles(e.target.files);e.target.value='';}const draftField=e.target.dataset.draftField;if(draftField){const draft=state.uploadDrafts.find(d=>d.id===e.target.dataset.draftId);if(draft)draft[draftField]=e.target.value;}if(e.target.dataset.editUserType){updateUserPhotoType(e.target.dataset.editUserType,e.target.value);}});
  document.addEventListener('submit',e=>{if(e.target.id==='journal-form'){e.preventDefault();const selectedPhoto=photo($('#journal-cloud').value);const entry={id:Date.now(),date:$('#journal-date').value,mood:state.selectedMood,photoId:selectedPhoto.id,photoSnapshot:{id:selectedPhoto.id,title:selectedPhoto.title,image:selectedPhoto.image,typeZh:selectedPhoto.typeZh,english:selectedPhoto.english,type:selectedPhoto.type},title:$('#journal-title').value.trim(),place:$('#journal-place').value.trim(),note:$('#journal-note').value.trim(),template:state.postcardTemplate,createdAt:Date.now()};if(!entry.note){toast('先写下一句话吧');return;}state.journals.push(entry);save('cloud-journals',state.journals);renderJournal();toast('这张天空明信片已寄存在你的邮筒里 ✧');}});
  document.addEventListener('dragover',e=>{if(e.target.closest('#cloud-dropzone')){e.preventDefault();$('#cloud-dropzone')?.classList.add('drag-over');}});
  document.addEventListener('dragleave',e=>{if(e.target.closest('#cloud-dropzone'))$('#cloud-dropzone')?.classList.remove('drag-over');});
  document.addEventListener('drop',e=>{if(e.target.closest('#cloud-dropzone')){e.preventDefault();$('#cloud-dropzone')?.classList.remove('drag-over');queueUploadFiles(e.dataTransfer.files);}});
  $('#mobile-menu').addEventListener('click',()=>$('.main-nav').classList.toggle('open'));
  initUserLibrary();
})();
