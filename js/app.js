// ===== RGB MIXER =====
const rSlider = document.getElementById('rSlider');
const gSlider = document.getElementById('gSlider');
const bSlider = document.getElementById('bSlider');
const rgbPreview = document.getElementById('rgbPreview');
const rgbHex = document.getElementById('rgbHex');

function toHex(n) { return parseInt(n).toString(16).padStart(2, '0').toUpperCase(); }

function copyHex(text, el, restore) {
  function show(ok) {
    el.textContent = ok ? '已复制!' : '复制失败';
    setTimeout(function () { el.textContent = restore; }, 1500);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { show(true); }).catch(function () { show(false); });
  } else {
    show(false);
  }
}

function updateRGB() {
  const r = +rSlider.value, g = +gSlider.value, b = +bSlider.value;
  document.getElementById('rVal').textContent = r;
  document.getElementById('gVal').textContent = g;
  document.getElementById('bVal').textContent = b;
  const hex = '#' + toHex(r) + toHex(g) + toHex(b);
  rgbPreview.style.background = hex;
  rgbHex.textContent = hex;
  // Auto text color based on luminance
  const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
  rgbHex.style.color = lum > 0.5 ? '#1a1a1a' : '#fff';
  rgbHex.style.background = lum > 0.5 ? '#ffffff80' : '#00000040';
}
[rSlider, gSlider, bSlider].forEach(s => s.addEventListener('input', updateRGB));
updateRGB();

// ===== CMY SUBTRACTIVE =====
const cSlider = document.getElementById('cSlider');
const mSlider = document.getElementById('mSlider');
const ySlider = document.getElementById('ySlider');
const cmyPreview = document.getElementById('cmyPreview');
const cmyHex = document.getElementById('cmyHex');

function updateCMY() {
  const c = +cSlider.value, m = +mSlider.value, y = +ySlider.value;
  document.getElementById('cVal').textContent = c;
  document.getElementById('mVal').textContent = m;
  document.getElementById('yVal').textContent = y;
  const r = 255 - c, g = 255 - m, b = 255 - y;
  const hex = '#' + toHex(r) + toHex(g) + toHex(b);
  cmyPreview.style.background = hex;
  cmyHex.textContent = hex;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  cmyHex.style.color = lum > 0.5 ? '#1a1a1a' : '#fff';
  cmyHex.style.background = lum > 0.5 ? '#ffffff80' : '#00000040';
}
[cSlider, mSlider, ySlider].forEach(s => s.addEventListener('input', updateCMY));
updateCMY();

// ===== HSL PALETTE =====
const hSlider = document.getElementById('hSlider');
const sSlider = document.getElementById('sSlider');
const lSlider = document.getElementById('lSlider');
const hslPreview = document.getElementById('hslPreview');

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)];
}

function updateHSL() {
  const h = +hSlider.value, s = +sSlider.value, l = +lSlider.value;
  document.getElementById('hVal').textContent = h + '°';
  document.getElementById('sVal').textContent = s + '%';
  document.getElementById('lVal').textContent = l + '%';
  const [r, g, b] = hslToRgb(h, s, l);
  const hex = '#' + toHex(r) + toHex(g) + toHex(b);
  hslPreview.style.background = hex;
  document.getElementById('hslHex').textContent = hex;
  document.getElementById('hslRgb').textContent = r + ',' + g + ',' + b;
  document.getElementById('hslHsl').textContent = h + ',' + s + '%,' + l + '%';
}
[hSlider, sSlider, lSlider].forEach(s => s.addEventListener('input', updateHSL));
updateHSL();

// ===== COLOR WHEEL =====
const canvas = document.getElementById('colorWheel');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const cx = W/2, cy = H/2, radius = W/2 - 10;
let baseHue = 210;
let currentHarmony = 'complementary';

function drawWheel() {
  ctx.clearRect(0, 0, W, H);
  // Draw color wheel
  for (let angle = 0; angle < 360; angle++) {
    const startAngle = (angle - 1) * Math.PI / 180;
    const endAngle = (angle + 1) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `hsl(${angle}, 75%, 55%)`;
    ctx.fill();
  }
  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#f5f3ee';
  ctx.fill();
  // Base hue indicator
  const rad = baseHue * Math.PI / 180;
  const ix = cx + Math.cos(rad) * radius * 0.68;
  const iy = cy + Math.sin(rad) * radius * 0.68;
  ctx.beginPath();
  ctx.arc(ix, iy, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function getHarmonyColors(hue) {
  switch(currentHarmony) {
    case 'complementary': return [hue, (hue + 180) % 360];
    case 'analogous': return [(hue - 30 + 360) % 360, hue, (hue + 30) % 360];
    case 'triadic': return [hue, (hue + 120) % 360, (hue + 240) % 360];
    case 'split': return [hue, (hue + 150) % 360, (hue + 210) % 360];
    case 'tetradic': return [hue, (hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360];
    default: return [hue];
  }
}

function renderHarmony() {
  const colors = getHarmonyColors(baseHue);
  const container = document.getElementById('harmonyResult');
  container.innerHTML = '';
  colors.forEach(h => {
    const hex = hslToHex(h, 75, 55);
    const swatch = document.createElement('div');
    swatch.className = 'harmony-swatch';
    swatch.style.background = hex;
    swatch.innerHTML = '<span class="hex">' + hex + '</span>';
    swatch.addEventListener('click', () => {
      copyHex(hex, swatch.querySelector('.hex'), hex);
    });
    container.appendChild(swatch);
  });
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (W / rect.width) - cx;
  const y = (e.clientY - rect.top) * (H / rect.height) - cy;
  const dist = Math.sqrt(x*x + y*y);
  if (dist > radius * 0.35 && dist < radius) {
    baseHue = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
    drawWheel();
    renderHarmony();
  }
});

document.querySelectorAll('.harmony-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.harmony-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentHarmony = tab.dataset.harmony;
    renderHarmony();
  });
});

drawWheel();
renderHarmony();

// ===== EMOTION =====
const emotions = [
  { name: '红色', en: 'RED', color: '#e63946',
    desc: '红色是可见光中波长最长的颜色，能直接刺激神经系统，使心跳加速、血压升高。它是火焰和血液的颜色，象征生命、热情和力量。',
    cn: '吉祥、喜庆、繁荣、驱邪', west: '危险、激情、爱情、警告' },
  { name: '橙色', en: 'ORANGE', color: '#f4a261',
    desc: '橙色介于红与黄之间，兼具红色的热情和黄色的温暖。它是夕阳和秋叶的颜色，让人联想到丰收、活力和社交。橙色是最能刺激食欲的颜色。',
    cn: '温暖、活力、丰收、快乐', west: '活力、友好、创意、廉价' },
  { name: '黄色', en: 'YELLOW', color: '#e9c46a',
    desc: '黄色是可见光中最明亮的颜色，在远处也能被轻易识别。它是阳光和金子的颜色，象征光明、智慧和财富。但过多的黄色会让人焦虑。',
    cn: '尊贵、皇权、光明、财富', west: '快乐、乐观、警告、怯懦' },
  { name: '绿色', en: 'GREEN', color: '#2a9d8f',
    desc: '绿色是自然界中最常见的颜色，人眼对绿色最敏感，看绿色时眼睛最放松。它是植物和生命的颜色，象征成长、健康和希望。',
    cn: '生命、春天、和平、环保', west: '自然、健康、嫉妒、金钱' },
  { name: '蓝色', en: 'BLUE', color: '#264653',
    desc: '蓝色是天空和海洋的颜色，能降低心率和血压，让人感到平静和信任。它是世界上最受欢迎的颜色，也是企业品牌最常用的颜色。',
    cn: '沉静、深邃、永恒、科技', west: '信任、忠诚、冷静、忧郁' },
  { name: '紫色', en: 'PURPLE', color: '#7b2cbf',
    desc: '紫色在自然界中极为稀有，古代提取紫色染料成本极高，因此紫色长期与贵族和神秘联系在一起。它是红色的热情和蓝色的冷静的矛盾结合。',
    cn: '尊贵、祥瑞、道家、神秘', west: '奢华、神秘、创造力、哀悼' },
  { name: '黑色', en: 'BLACK', color: '#1a1a1a',
    desc: '黑色不是一种颜色，而是所有光被吸收后的状态。它是最强大的中性色，能让任何颜色在它面前变得鲜艳。黑色象征权力、优雅和未知。',
    cn: '庄重、神秘、权力、哀悼', west: '优雅、权力、正式、死亡' },
  { name: '白色', en: 'WHITE', color: '#f5f3ee',
    desc: '白色是所有光的混合，是最明亮的颜色。它象征纯净、空白和无限可能。在设计中，白色是最好的背景——它让内容呼吸，让焦点清晰。',
    cn: '纯洁、哀悼、虚无、空灵', west: '纯洁、婚礼、和平、医疗' },
];

const emotionGrid = document.getElementById('emotionGrid');
emotions.forEach((em, i) => {
  const card = document.createElement('div');
  card.className = 'emotion-card';
  card.style.background = em.color;
  card.innerHTML = '<div class="em-name">' + em.name + '</div><div class="em-en">' + em.en + '</div>';
  card.addEventListener('click', () => {
    document.getElementById('emDetailName').textContent = em.name + ' · ' + em.en;
    document.getElementById('emDetailDesc').textContent = em.desc;
    document.getElementById('emCn').textContent = em.cn;
    document.getElementById('emWest').textContent = em.west;
    document.body.style.background = em.color + '15';
    document.documentElement.style.setProperty('--accent', em.color);
  });
  emotionGrid.appendChild(card);
});

// ===== TRADITIONAL COLORS =====
const traditionalColors = [
  { name: '朱砂', pinyin: 'ZHŪ SHĀ', hex: '#FF461F', rgb: '255,70,31', meaning: '硫化汞矿物颜料，千年不褪色。故宫红墙、印章印泥的正色。' },
  { name: '石青', pinyin: 'SHÍ QĪNG', hex: '#1685A7', rgb: '22,133,167', meaning: '蓝铜矿研磨而成，敦煌壁画中飞天的飘带多用此色。' },
  { name: '藤黄', pinyin: 'TÉNG HUÁNG', hex: '#FFB61E', rgb: '255,182,30', meaning: '海藤树树脂制成，有毒但色正。国画中常用的透明黄色。' },
  { name: '月白', pinyin: 'YUÈ BÁI', hex: '#D6ECF0', rgb: '214,236,240', meaning: '月光的颜色，不是纯白而是极淡的蓝。宋代文人最爱的服色。' },
  { name: '黛蓝', pinyin: 'DÀI LÁN', hex: '#3E4149', rgb: '62,65,73', meaning: '古代女子画眉的黛石之色，深青近黑。远山如黛，说的就是这个颜色。' },
  { name: '胭脂', pinyin: 'YĀN ZHI', hex: '#9D2933', rgb: '157,41,51', meaning: '红蓝花汁制成，古代女子面妆的核心色。比朱砂更柔，比粉红更沉。' },
  { name: '藕荷', pinyin: 'ǑU HÉ', hex: '#E4C6D0', rgb: '228,198,208', meaning: '莲藕断面的颜色，淡紫中透着粉。清代旗人服饰的流行色。' },
  { name: '秋香', pinyin: 'QIŪ XIĀNG', hex: '#D9B611', rgb: '217,182,17', meaning: '秋日桂花的颜色，黄中带绿。《红楼梦》中宝钗的服色。' },
  { name: '蟹壳青', pinyin: 'XIÈ KÉ QĪNG', hex: '#4A5E5C', rgb: '74,94,92', meaning: '螃蟹壳的青灰色，沉稳内敛。明式家具和瓷器常见的釉色。' },
  { name: '鹅黄', pinyin: 'É HUÁNG', hex: '#FFF143', rgb: '255,241,67', meaning: '小鹅绒毛的颜色，极嫩极亮。早春柳芽也叫鹅黄，是生命的颜色。' },
  { name: '紫檀', pinyin: 'ZǏ TÁN', hex: '#4B2E2A', rgb: '75,46,42', meaning: '紫檀木的心材色，深紫近黑。明清皇家家具的顶级用材，寸檀寸金。' },
  { name: '苍绿', pinyin: 'CĀNG LǙ', hex: '#7BA27A', rgb: '123,162,122', meaning: '苍老的绿色，不是嫩绿而是饱经风霜的深绿。古松、老苔的颜色。' },
  { name: '琥珀', pinyin: 'HǓ PÒ', hex: '#CA6924', rgb: '202,105,36', meaning: '树脂化石的颜色，暖橙中透着金。古代视为吉祥之物，可入药。' },
  { name: '缃色', pinyin: 'XIĀNG SÈ', hex: '#F0C239', rgb: '240,194,57', meaning: '浅黄色的书卷气，古代书卷包裹用缃色绫。"缃帙"就是书卷的代称。' },
  { name: '玄青', pinyin: 'XUÁN QĪNG', hex: '#3D3B4F', rgb: '61,59,79', meaning: '深黑中透出深蓝，是天空将亮未亮时的颜色。古代帝王祭天所穿。' },
  { name: '绾色', pinyin: 'WǍN SÈ', hex: '#A98175', rgb: '169,129,117', meaning: '浅绛色，如女子发髻上丝带的颜色。温柔、含蓄，是中式审美的代表。' },
];

const tradGrid = document.getElementById('traditionalGrid');
traditionalColors.forEach(c => {
  const card = document.createElement('div');
  card.className = 'trad-card';
  card.innerHTML =
    '<div class="trad-swatch" style="background:' + c.hex + '"></div>' +
    '<div class="trad-info">' +
      '<div class="trad-name">' + c.name + '</div>' +
      '<div class="trad-pinyin">' + c.pinyin + '</div>' +
      '<div class="trad-hex">' + c.hex + ' · ' + c.rgb + '</div>' +
      '<div class="trad-meaning">' + c.meaning + '</div>' +
    '</div>';
  card.addEventListener('click', () => {
    copyHex(c.hex, card.querySelector('.trad-hex'), c.hex + ' · ' + c.rgb);
  });
  tradGrid.appendChild(card);
});

// ===== SCROLL REVEAL & NAV =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Nav active state
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.nav === current);
  });
});
// ===== CASE STUDIES =====
const cases = [
  {
    category: "油画 · Oil Painting",
    title: "星月夜", image: 'images/starry-night.jpg',
    artist: "文森特·梵高 · 1889",
    palette: ["#0D2B45", "#1B4F72", "#2E86C1", "#F4D03F", "#F39C12", "#E74C3C"],
    principles: ["互补色", "高饱和", "冷暖对比"],
    analysis: "梵高用<strong>深蓝与亮黄的互补色对撞</strong>制造漩涡般的能量。蓝色占据画面的70%以上，奠定夜空的沉静基调；而月亮和星星用极高饱和度的黄色，在深蓝背景中像火焰一样燃烧。这种<strong>大面积冷色+小面积暖色</strong>的配比，既保持了整体统一，又让焦点不可忽视。旋转的笔触让色彩不是静止的色块，而是流动的情绪。",
    source: "作品：文森特·梵高，1889，已进入公有领域。本页是教学用低清对照，不是美术馆官方扫描。"
  },
  {
    category: "油画 · Oil Painting",
    title: "睡莲", image: 'images/water-lilies.jpg',
    artist: "克劳德·莫奈 · 1906",
    palette: ["#8FA8B8", "#A8C0B0", "#C5D5C5", "#D4C5A9", "#B8A088", "#6B8E7F"],
    principles: ["邻近色", "低饱和", "柔和过渡"],
    analysis: "莫奈几乎不用纯色，所有颜色都<strong>混入了灰色调</strong>，让画面像蒙了一层水雾。蓝、绿、黄三个色相在色轮上相邻（邻近色），本身就和谐；再加上低饱和度，色彩之间的边界变得模糊。这就是印象派的核心——<strong>不是画物体，而是画光在物体上的感觉</strong>。你盯着看久了，会觉得水面真的在动。",
    source: "作品：克劳德·莫奈，约 1906，已进入公有领域。图片文件没有馆藏扫描编号。"
  },
  {
    category: "油画 · Oil Painting",
    title: "戴珍珠耳环的少女", image: 'images/pearl-earring.jpg',
    artist: "约翰内斯·维米尔 · 1665",
    palette: ["#1A1A2E", "#2C3E50", "#8B4513", "#D4A574", "#F5DEB3", "#E8D5B7"],
    principles: ["互补色", "明暗法", "有限色域"],
    analysis: "维米尔用了<strong>最克制的配色</strong>：蓝色头巾、黄色外套、深色背景，仅此而已。蓝和黄是互补色，但两者都降低了饱和度——蓝色偏灰、黄色偏暖，所以对比不刺眼反而柔和。最精妙的是<strong>明暗法（Chiaroscuro）</strong>：一束侧光打在脸上，从亮部的米白到暗部的深棕，中间过渡了至少5个色阶。珍珠耳环上那一点高光，是整幅画的呼吸。",
    source: "作品：约翰内斯·维米尔，约 1665，已进入公有领域。原作藏于海牙莫瑞泰斯皇家美术馆。"
  },
  {
    category: "中国画 · Chinese Painting",
    title: "千里江山图", image: 'images/thousand-miles.jpg',
    artist: "王希孟 · 北宋 · 1113",
    palette: ["#1A3C5E", "#2E5E4E", "#4A8B7A", "#7AB8A0", "#C9A86C", "#8B4513"],
    principles: ["青绿主导", "赭石点缀", "随类赋彩"],
    analysis: "这是中国画<strong>青绿山水</strong>的巅峰。石青和石绿是矿物颜料，覆盖力极强，千年不褪色。画面以冷色（青、绿）为主调，占据80%以上，营造江山的辽阔与清冷；只在屋顶、桥梁、人物处用<strong>赭石（暖棕）和泥金</strong>点缀。这种<strong>大冷小暖</strong>的配比，让千里江山有了人的温度。中国画论叫「随类赋彩」——不是写实，是给每一类事物赋予它该有的颜色气质。",
    source: "作品：王希孟，北宋，已进入公有领域。画心藏于故宫博物院。本页不是故宫官方图像。"
  },
  {
    category: "示意图 · Diagram",
    title: "几何色块", image: 'images/geometric-blocks.svg',
    artist: "色彩志绘制 · 不是任何游戏的画面",
    palette: ["#F5E6D3", "#E8B4B8", "#A8C0D0", "#7B9EB0", "#D4A574", "#2C3E50"],
    principles: ["低饱和", "马卡龙色", "几何色块"],
    analysis: "有些空间游戏会把粉、蓝、黄都调得很淡，让几何体自己说话。下面这张图是本书画的示意：<strong>每个块只用一个纯色</strong>，块与块之间靠明暗和色相区分。色相其实隔得不近，但因为都降了饱和，对比变得温柔。色彩不抢结构的戏。",
    source: "图像为本杂志绘制的示意图，可以随杂志一起阅读。它不引用游戏画面。"
  },
  {
    category: "建筑色 · Architecture",
    title: "宫墙与琉璃", image: 'images/palace-colors.svg',
    artist: "色彩志绘制 · 取材于中国传统色",
    palette: ["#8B0000", "#C41E3A", "#D4A017", "#2C5F4E", "#1A3A5C", "#F5E6D3"],
    principles: ["中国传统色", "暖冷对比", "高识别度"],
    analysis: "宫墙和琉璃常用一套看得很远的颜色：<strong>朱砂红、藤黄、石青、黛蓝</strong>。暖的红和黄占住近处，冷的青和蓝把屋顶和天空推远。这张图只把这套关系画成色块，方便对照上一章的传统色名字。",
    source: "图像为本杂志绘制的示意图。颜色名字对应本章传统色：朱砂、藤黄、石青、黛蓝。"
  }
];

const caseGrid = document.getElementById('caseGrid');
cases.forEach((c, i) => {
  const card = document.createElement('div');
  card.className = 'case-card';
  let paletteHtml = '';
  c.palette.forEach(hex => {
    paletteHtml += '<div class="case-swatch" style="background:' + hex + '" data-hex="' + hex + '">' +
      '<span class="hex-label">' + hex + '</span></div>';
  });
  let principlesHtml = '';
  c.principles.forEach(p => {
    principlesHtml += '<span class="case-principle">' + p + '</span>';
  });
  card.innerHTML =
    '<img class="case-image" src="' + c.image + '" alt="' + c.title + '">' +
    '<div class="case-header">' +
      '<div class="case-category">' + c.category + '</div>' +
      '<div class="case-title">' + c.title + '</div>' +
      '<div class="case-artist">' + c.artist + '</div>' +
    '</div>' +
    '<div class="case-palette">' + paletteHtml + '</div>' +
    '<div class="case-principles">' + principlesHtml + '</div>' +
    '<div class="case-analysis">' + c.analysis + '</div>' +
    '<p class="case-source">' + c.source + '</p>';
  // Click swatch to copy
  card.querySelectorAll('.case-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      const hex = sw.dataset.hex;
      copyHex(hex, sw.querySelector('.hex-label'), hex);
    });
  });
  caseGrid.appendChild(card);
});

const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    const open = navLinksEl.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.textContent = open ? '关闭' : '章节';
  });
  navLinksEl.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      navLinksEl.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '章节';
    }
  });
}
