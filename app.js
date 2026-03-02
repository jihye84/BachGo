// Global flag: audio is locked until welcome overlay is dismissed
let audioUnlocked = false;

// 1. Map Initialization
// Center on Germany, default view includes all Bach cities
const map = L.map('map', {
    zoomControl: false,
    minZoom: 4,
    maxBounds: [[38, -5], [60, 32]],
    maxBoundsViscosity: 0.8
}).setView([51.5, 11.0], 7);

// Add CartoDB Dark Matter (No Labels) tile layer for a historical, clean look without modern highways
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
}).addTo(map);

// Move zoom control to bottom right to not interfere with timeline overlay
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Highlight Germany Territory with GeoJSON
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/DEU.geo.json')
    .then(response => response.json())
    .then(data => {
        // Germany border (elegant dashed line)
        L.geoJSON(data, {
            style: {
                color: 'transparent',
                weight: 0,
                opacity: 0,
                fillColor: 'transparent',
                fillOpacity: 0,
                className: 'germany-border'
            }
        }).addTo(map);

        // Darken outside Germany (inverted mask)
        const worldBounds = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
        const germanyCoords = data.features[0].geometry.coordinates[0].map(c => [c[1], c[0]]);
        L.polygon([worldBounds, germanyCoords], {
            color: 'none', weight: 0,
            fillColor: '#fff', fillOpacity: 0.15,
            interactive: false, className: 'outside-mask'
        }).addTo(map);
    })
    .catch(err => console.error("Could not load Germany borders", err));

// Historical regional overlays (Bach-era territories)
const regionalColors = {
    THURINGIA: "#eecaca",
    SAXONY: "#caeed1",
    FREE_CITY: "#fcf4a3"
};

// Approximate Thuringia boundary (Landgraviate of Thuringia)
const thuringiaCoords = [
    [51.65, 9.80], [51.60, 10.10], [51.55, 10.50], [51.45, 10.80],
    [51.35, 11.10], [51.30, 11.50], [51.20, 11.65], [51.05, 11.70],
    [50.90, 11.80], [50.75, 11.75], [50.60, 11.65], [50.50, 11.50],
    [50.35, 11.40], [50.25, 11.20], [50.20, 10.90], [50.25, 10.60],
    [50.30, 10.30], [50.40, 10.05], [50.55, 9.85], [50.70, 9.75],
    [50.85, 9.70], [51.00, 9.65], [51.15, 9.65], [51.30, 9.70],
    [51.45, 9.75], [51.65, 9.80]
];

// Approximate Saxony boundary (Electorate of Saxony — Leipzig/Dresden region)
const saxonyCoords = [
    [51.80, 11.70], [51.75, 12.10], [51.70, 12.60], [51.60, 13.00],
    [51.50, 13.40], [51.35, 13.80], [51.20, 14.10], [51.00, 14.20],
    [50.80, 14.15], [50.60, 14.00], [50.45, 13.70], [50.35, 13.30],
    [50.30, 12.90], [50.35, 12.50], [50.40, 12.10], [50.50, 11.80],
    [50.65, 11.68], [50.80, 11.72], [50.95, 11.78], [51.10, 11.72],
    [51.25, 11.68], [51.45, 11.65], [51.60, 11.65], [51.80, 11.70]
];

// Mühlhausen Free Imperial City (small circle-like polygon)
const freeCityCoords = [
    [51.25, 10.38], [51.26, 10.42], [51.26, 10.48], [51.25, 10.52],
    [51.23, 10.54], [51.20, 10.54], [51.18, 10.52], [51.17, 10.48],
    [51.17, 10.42], [51.18, 10.38], [51.20, 10.36], [51.23, 10.36],
    [51.25, 10.38]
];

L.polygon(thuringiaCoords, {
    color: regionalColors.THURINGIA, weight: 0, opacity: 0,
    fillColor: regionalColors.THURINGIA, fillOpacity: 0.08,
    interactive: false, className: 'region-polygon'
}).addTo(map);

L.polygon(saxonyCoords, {
    color: regionalColors.SAXONY, weight: 0, opacity: 0,
    fillColor: regionalColors.SAXONY, fillOpacity: 0.08,
    interactive: false, className: 'region-polygon'
}).addTo(map);

L.polygon(freeCityCoords, {
    color: regionalColors.FREE_CITY, weight: 0, opacity: 0,
    fillColor: regionalColors.FREE_CITY, fillOpacity: 0.12,
    interactive: false, className: 'region-polygon'
}).addTo(map);


// Approximate Prussia/Brandenburg boundary (Kingdom of Prussia — Berlin/Potsdam region)
const prussiaCoords = [
    [53.60, 11.50], [53.55, 12.00], [53.50, 12.60], [53.40, 13.10],
    [53.30, 13.60], [53.10, 14.00], [52.90, 14.30], [52.60, 14.60],
    [52.30, 14.70], [52.00, 14.60], [51.80, 14.40], [51.70, 14.10],
    [51.80, 13.60], [51.85, 13.10], [51.85, 12.60], [51.85, 12.00],
    [51.90, 11.60], [52.00, 11.40], [52.20, 11.30], [52.50, 11.25],
    [52.80, 11.25], [53.10, 11.30], [53.35, 11.40], [53.60, 11.50]
];

L.polygon(prussiaCoords, {
    color: '#3a5a84', weight: 0, opacity: 0,
    fillColor: '#2a4a74', fillOpacity: 0.18,
    interactive: false, className: 'region-polygon'
}).addTo(map);

// Additional HRE territories
const hreRegions = [
    {
        name: '바이에른 선제후국',
        color: '#5b8abf',
        coords: [
            [49.30, 10.50], [49.20, 11.00], [49.00, 11.80], [48.80, 12.50],
            [48.50, 13.00], [48.10, 13.10], [47.60, 13.00], [47.30, 12.50],
            [47.30, 11.80], [47.40, 11.00], [47.50, 10.30], [47.70, 9.90],
            [48.00, 9.80], [48.40, 9.90], [48.70, 10.00], [49.00, 10.20],
            [49.30, 10.50]
        ],
        labelCoords: [47.80, 11.30]
    },
    {
        name: '하노버 선제후국',
        color: '#c4a35a',
        coords: [
            [53.80, 8.80], [53.70, 9.50], [53.50, 10.10], [53.20, 10.30],
            [52.80, 10.40], [52.40, 10.30], [52.10, 10.00], [51.90, 9.60],
            [51.80, 9.10], [51.90, 8.50], [52.10, 8.10], [52.40, 7.90],
            [52.80, 7.80], [53.10, 8.00], [53.40, 8.30], [53.80, 8.80]
        ],
        labelCoords: [52.15, 8.20]
    },
    {
        name: '헤센 방백국',
        color: '#d4856a',
        coords: [
            [51.50, 8.60], [51.40, 9.10], [51.30, 9.60], [51.10, 9.80],
            [50.80, 9.90], [50.50, 9.80], [50.30, 9.50], [50.20, 9.00],
            [50.30, 8.50], [50.50, 8.10], [50.80, 7.90], [51.10, 8.00],
            [51.30, 8.20], [51.50, 8.60]
        ],
        labelCoords: [50.50, 8.80]
    },
    {
        name: '뷔르템베르크 공국',
        color: '#8b6fae',
        coords: [
            [49.30, 8.50], [49.20, 9.00], [49.10, 9.50], [48.90, 9.80],
            [48.60, 10.00], [48.30, 9.90], [48.00, 9.70], [47.80, 9.30],
            [47.80, 8.80], [47.90, 8.30], [48.10, 8.00], [48.40, 7.80],
            [48.70, 7.90], [49.00, 8.10], [49.30, 8.50]
        ],
        labelCoords: [48.20, 8.50]
    },
    {
        name: '안할트-쾨텐 공국',
        color: '#e6c27a',
        coords: [
            [52.00, 11.60], [51.95, 11.90], [51.90, 12.20], [51.80, 12.30],
            [51.65, 12.25], [51.55, 12.10], [51.55, 11.80], [51.60, 11.55],
            [51.70, 11.45], [51.85, 11.45], [52.00, 11.60]
        ],
        labelCoords: [51.62, 11.50]
    },
    {
        name: '브라운슈바이크-<br>뤼네부르크 공국',
        color: '#7aaa8e',
        coords: [
            [53.40, 9.60], [53.30, 10.10], [53.20, 10.50], [53.00, 10.70],
            [52.70, 10.80], [52.40, 10.70], [52.20, 10.40], [52.10, 10.00],
            [52.20, 9.50], [52.40, 9.20], [52.70, 9.10], [53.00, 9.20],
            [53.20, 9.40], [53.40, 9.60]
        ],
        labelCoords: [53.15, 9.30]
    },
    {
        name: '팔츠 선제후국',
        color: '#b57e5a',
        coords: [
            [50.00, 7.80], [49.90, 8.20], [49.70, 8.60], [49.40, 8.80],
            [49.10, 8.70], [48.90, 8.40], [48.90, 8.00], [49.00, 7.60],
            [49.20, 7.30], [49.50, 7.20], [49.80, 7.40], [50.00, 7.80]
        ],
        labelCoords: [49.30, 7.50]
    }
];

hreRegions.forEach(region => {
    L.polygon(region.coords, {
        color: region.color, weight: 0, opacity: 0,
        fillColor: region.color, fillOpacity: 0.06,
        interactive: false, className: 'region-polygon'
    }).addTo(map);
});
// Region labels
const allRegionLabels = [
    { name: '튀링겐 백국', coords: [50.75, 10.15], color: regionalColors.THURINGIA },
    { name: '작센 선제후국', coords: [51.10, 12.80], color: regionalColors.SAXONY },
    { name: '자유도시', coords: [51.27, 10.36], color: regionalColors.FREE_CITY },
    { name: '프로이센 왕국', coords: [52.85, 12.30], color: '#7a9ec4' },
    ...hreRegions.map(r => ({ name: r.name, coords: r.labelCoords, color: r.color }))
];

allRegionLabels.forEach(r => {
    L.marker(r.coords, {
        icon: L.divIcon({
            className: 'region-label',
            html: `<span style="color:${r.color}">${r.name}</span>`,
            iconSize: null, iconAnchor: [0, 0]
        }),
        interactive: false
    }).addTo(map);
});

// Reference city labels (non-interactive)
const referenceCities = [
    { name: '베를린', coords: [52.520, 13.405] },
    { name: '뮌헨', coords: [48.135, 11.582] },
    { name: '프랑크푸르트', coords: [50.110, 8.682] },
    { name: '쾰른', coords: [50.938, 6.960] },
    { name: '드레스덴', coords: [51.051, 13.738] },
    { name: '하노버', coords: [52.376, 9.732] },
    { name: '고타', coords: [50.985, 10.58] },
    { name: '뉘른베르크', coords: [49.454, 11.078] },
    { name: '슈투트가르트', coords: [48.776, 9.183] },
    { name: '브레멘', coords: [53.079, 8.802] },
    { name: '뒤셀도르프', coords: [51.228, 6.773] },
    { name: '로스토크', coords: [54.088, 12.140] },
    { name: '마그데부르크', coords: [52.20, 11.50] },
    { name: '뷔르츠부르크', coords: [49.794, 9.929] },
    { name: '아우크스부르크', coords: [48.371, 10.898] },
    { name: '브란덴부르크', coords: [52.412, 12.532] },
    // 유럽 주요 도시
    { name: '파리', coords: [48.857, 2.352] },
    { name: '빈', coords: [48.208, 16.374] },
    { name: '로마', coords: [41.902, 12.496] },
    { name: '암스테르담', coords: [52.370, 4.895] },
    { name: '프라하', coords: [50.076, 14.438] },
    { name: '바르샤바', coords: [52.230, 21.012] },
    { name: '코펜하겐', coords: [55.676, 12.568] },
    { name: '베네치아', coords: [45.440, 12.315] },
    { name: '브뤼셀', coords: [50.850, 4.352] },
    { name: '스톡홀름', coords: [59.330, 18.069] },
    { name: '취리히', coords: [47.377, 8.540] },
    { name: '부다페스트', coords: [47.498, 19.040] },
    { name: '이스탄불', coords: [41.009, 28.978] }
];

referenceCities.forEach(city => {
    L.marker(city.coords, {
        icon: L.divIcon({
            className: 'ref-city-label',
            html: city.name,
            iconSize: null,
            iconAnchor: [0, 0]
        }),
        interactive: false
    }).addTo(map);
});

// Music Glossary — terms auto-highlighted in descriptions
const musicGlossary = {
    "칸타타": "성악·기악이 함께하는 교회 또는 세속 음악 형식",
    "푸가": "하나의 주제가 여러 성부에서 순차적으로 모방·발전하는 대위법 형식",
    "코랄": "루터교 찬송가. 회중이 함께 부르는 단순한 선율의 교회 노래",
    "토카타": "빠른 음형과 즉흥적 기교를 자유롭게 펼치는 건반 악곡",
    "파사칼리아": "저음부 주제가 반복되는 동안 상성부가 변주를 이어가는 형식",
    "아리아": "오페라·칸타타 등에서 독창자가 부르는 서정적인 노래",
    "대위법": "독립된 여러 선율이 동시에 진행하며 조화를 이루는 작곡 기법",
    "리체르카레": "푸가의 전신으로, 하나의 주제를 엄격하게 모방·발전시키는 형식",
    "카논": "하나의 선율을 시간차를 두고 다른 성부가 정확히 따라가는 형식",
    "파르티타": "여러 춤곡을 모아 구성한 기악 모음곡. 바로크 시대의 모음곡 형식",
    "소나타": "여러 악장으로 구성된 기악곡. 바로크 시대에는 교회 소나타와 실내 소나타로 구분",
    "모음곡": "같은 조성의 여러 춤곡을 순서대로 배열한 기악곡 모음",
    "전주곡": "본곡 앞에 연주하는 도입 악곡. 즉흥적 성격이 강함",
    "변주곡": "하나의 주제를 다양한 방식으로 변형·발전시키는 형식",
    "샤콘느": "반복되는 화성 진행 위에 변주를 쌓아가는 느린 3박자 형식",
    "쿠오들리베트": "여러 익숙한 노래를 동시에 결합해 부르는 유희적 성악곡",
    "미사": "가톨릭 예배의 통상문에 곡을 붙인 합창·기악 작품",
    "수난곡": "예수의 수난 이야기를 음악으로 표현한 대규모 종교 성악곡",
    "협주곡": "독주 악기와 관현악이 대비·협력하며 연주하는 기악곡",
    "쳄발로": "건반을 누르면 현을 뜯어 소리내는 바로크 시대의 건반 악기 (하프시코드)",
    "평균율": "옥타브를 12개의 동일한 반음으로 나누는 조율법",
    "아벤트무지크": "'저녁 음악회'. 뤼벡에서 북스테후데가 주관한 상설 음악 행사",
    "토마스칸토르": "라이프치히 성 토마스 교회의 합창 감독. 바흐가 27년간 맡은 직책",
    "오르가니스트": "오르간 연주자. 바로크 시대 교회의 핵심 음악직",
    "화성": "둘 이상의 음이 동시에 울릴 때 만들어지는 화음의 진행 체계",
    "성가": "기독교 예배에서 부르는 종교적 노래",
    "모테트": "가사를 중심으로 여러 성부가 엮이는 합창곡. 르네상스·바로크 교회 음악의 핵심 장르"
};

// Sort terms by length (longest first) to avoid partial matches
const glossaryTerms = Object.keys(musicGlossary).sort((a, b) => b.length - a.length);
const glossaryRegex = new RegExp(`(${glossaryTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

function applyGlossary(html) {
    if (!html) return html;
    // Split by HTML tags to avoid matching inside tags/attributes
    const parts = html.split(/(<[^>]+>)/);
    for (let i = 0; i < parts.length; i++) {
        // Only process text nodes (odd indices are tags)
        if (i % 2 === 0) {
            parts[i] = parts[i].replace(glossaryRegex, (match) => {
                const def = musicGlossary[match];
                return `<span class="glossary-term" data-def="${def}">${match}</span>`;
            });
        }
    }
    return parts.join('');
}

// Glossary tooltip event delegation
(function () {
    let tooltipEl = null;
    document.addEventListener('mouseover', (e) => {
        const term = e.target.closest('.glossary-term');
        if (!term) return;
        const def = term.dataset.def;
        if (!def) return;
        if (tooltipEl) tooltipEl.remove();
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'glossary-tooltip';
        tooltipEl.textContent = def;
        document.body.appendChild(tooltipEl);
        const rect = term.getBoundingClientRect();
        let top = rect.top - tooltipEl.offsetHeight - 8;
        let left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2);
        // Prevent overflow
        if (top < 4) top = rect.bottom + 8;
        if (left < 4) left = 4;
        if (left + tooltipEl.offsetWidth > window.innerWidth - 4) left = window.innerWidth - tooltipEl.offsetWidth - 4;
        tooltipEl.style.top = top + 'px';
        tooltipEl.style.left = left + 'px';
    });
    document.addEventListener('mouseout', (e) => {
        const term = e.target.closest('.glossary-term');
        if (term && tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
    });
    // Touch support
    document.addEventListener('touchstart', (e) => {
        const term = e.target.closest('.glossary-term');
        if (term) {
            e.preventDefault();
            const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true });
            term.dispatchEvent(mouseOverEvent);
            setTimeout(() => {
                if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
            }, 3000);
        } else if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
    }, { passive: false });
})();

// 2. City Data & Audio
const citiesData = [
    {
        id: "wechmar",
        isBranch: true,
        nameKR: "베히마르",
        nameDE: "Wechmar",
        period: "16세기 ~ (J.S. 바흐 이전 세대)",
        badge: ["바흐 가문의 기원", "튀링겐 음악 왕조"],
        coords: [50.885, 10.714],
        desc: "튀링겐의 도시 고타에 인접한 작은 마을 베히마르는, 바흐 음악 왕조의 발상지입니다. 16세기 헝가리에서 돌아온 시조 파이트 바흐가 이곳에 정착하며, 튀링겐 일대에 음악 가문의 뿌리를 내렸습니다. 그의 손자 요한 암브로지우스를 거쳐 아들 요한 제바스티안까지, 5세대에 걸쳐 이 지역의 궁정 음악가, 오르가니스트, 악사를 배출한 튀링겐 음악의 중심지였습니다. 바흐는 매년 열리는 가문 행사에 이 마을을 찾았다고 전해집니다.",
        img: "Wechmar_Sankt_Viti_Kirche_Lutz_Ebhardt (1).jpg",
        youtubeId: "67KN3EuOBGA",
        youtubeStart: 0,
        youtubeVolume: 50,
        audioTitle: "물레방아 소리 (※ 파이트 바흐는 제분소에서 일하며 치터링겐을 켰다고 전해집니다)",
        audioAttribution: "출처: YouTube",
        influencer: {
            name: "파이트 바흐",
            years: "? – 1619",
            desc: "헝가리에서 돌아온 후 베히마르에 정착한 파이트 바흐는, 제분소 주인이자 아마추어 류트 연주자였습니다. 일하면서도 류트를 손에서 놓지 않았다는 일화만큼, 굳건한 음악 애호심이 타고난 이입니다. 바흐는 이 시조 할아버지를, 바흐 가문 문서에서 음악을 사랑한 사람으로 기록했습니다.",
            img: "veit_bach_portrait.png",
            identity: "바흐 가문의 시조"
        },
        next: [
            { id: "eisenach", label: "<span class='nav-text'>돌아가기: 아이제나흐</span><span class='nav-arrow'>➔</span>" },
            { id: "erfurt", label: "<span class='nav-text'>가문의 도시: 에르푸르트</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "erfurt",
        isBranch: true,
        nameKR: "에르푸르트",
        nameDE: "Erfurt",
        period: "17세기 (J.S. 바흐 이전 세대)",
        badge: ["바흐 가문의 음악 도시", "증조부의 활동지"],
        coords: [50.9787, 11.0328],
        desc: "에르푸르트는 바흐 가문이 가장 깊이 뿌리를 내린 도시입니다. 파이트 바흐의 손자 요한 바흐가, 프레디거 교회의 오르가니스트로 40년 가까이 봉직하며 가문의 음악적 명성을 확립했습니다. 이 도시에서 바흐 가문의 세례, 혼인, 장례 기록이 145건이나 남아 있을 만큼, 바흐라는 이름은 곧 음악가의 대명사였습니다. 바흐의 부모 요한 암브로지우스와 엘리자베트 레머히르트도, 1668년 이곳 상인교회에서 결혼식을 올렸습니다.",
        img: "에르푸르트.png",
        youtubeId: "ItMR7Y5wPT8",
        youtubeStart: 9,
        youtubeVolume: 60,
        audioTitle: "요한 바흐 - 모테트 'Unser Leben ist ein Schatten' ♦ DAS VOKALPROJEKT",
        audioAttribution: "출처: YouTube 채널 'DAS VOKALPROJEKT'",
        influencer: {
            name: "요한 바흐",
            years: "1604 – 1673",
            desc: "바흐의 증조부 요한 바흐는, 에르푸르트 프레디거 교회의 오르가니스트로 약 40년간 봉직한 음악가입니다. 베히마르 출신으로 에르푸르트에 정착한 그는, 바흐 가문이 전문 음악가 집안으로 자리 잡는 데 결정적 역할을 했습니다. 그의 형제 크리스토프 바흐는 에르푸르트의 시 악사, 즉 슈타트프파이퍼로 활동했으며, 이 크리스토프가 바로 바흐의 할아버지입니다.",
            img: "johann_bach_portrait.png",
            identity: "에르푸르트의 오르가니스트 · 증조부"
        },
        next: [
            { id: "wechmar", label: "<span class='nav-text'>돌아가기: 베히마르</span><span class='nav-arrow'>➔</span>" },
            { id: "eisenach", label: "<span class='nav-text'>돌아가기: 아이제나흐</span><span class='nav-arrow'>➔</span>" }
        ]
    },
    {
        id: "eisenach",
        nameKR: "아이제나흐",
        nameDE: "Eisenach",
        period: "1685 - 1695 (0-10세)",
        badge: ["태어남", "유년기"],
        coords: [50.974, 10.325],
        desc: "독일 튀링겐주의 중심지 아이제나흐에서 음악가 가문의 막내로 태어난 바흐는, 마르틴 루터의 종교적 토양 속에서 유년기를 보내며 훗날 선보일 교회 음악의 기초를 다졌습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Eisenach_von_G%C3%B6pelskuppe.jpg/960px-Eisenach_von_G%C3%B6pelskuppe.jpg",
        youtubeId: "mTjmnGTs5fY",
        youtubeStart: 54,
        youtubeVolume: 75,
        audioTitle: "마르틴 루터 - 코랄 <내 주는 강한 성이요> (※ 종교개혁가 루터가 작사·작곡한 찬송가 원곡입니다)",
        audioAttribution: "출처: YouTube 채널 'Jeff Windoloski'",
        influencer: {
            name: "마르틴 루터",
            desc: "아이제나흐에서 태어난 바흐에게 마르틴 루터의 신학은 평생의 음악적 토양이 되었습니다. 종교개혁가의 찬송가는 훗날 바흐가 세울 교회 음악 금자탑의 든든한 기초가 되었습니다.",
            img: "eisenach_influence.jpg",
            identity: "유년기의 정신적 뿌리"
        },
        influencers: [
            {
                name: "마르틴 루터",
                desc: "아이제나흐에서 태어난 바흐에게 마르틴 루터의 신학은 평생의 음악적 토양이 되었습니다. 종교개혁가의 찬송가는 훗날 바흐가 세울 교회 음악 금자탑의 든든한 기초가 되었습니다.",
                img: "eisenach_influence.jpg",
                identity: "유년기의 정신적 뿌리"
            },
            {
                name: "엘리자베트 레머히르트",
                years: "1644 – 1694",
                desc: "바흐의 어머니 엘리자베트 레머히르트는, 에르푸르트 시의회 의원의 딸로 교양 있는 가정에서 성장했습니다. 1694년 세상을 떠났고, 그 이듬해 아버지마저 세상을 떠나면서 10세의 바흐는 고아가 되었습니다. 어머니의 부재는 바흐의 유년을 근본적으로 뒤바꾸었고, 훗날 그의 음악에 서린 깊은 상실감의 원체험이 되었습니다.",
                img: "elisabeth_portrait.png",
                identity: "바흐의 어머니"
            },
            {
                name: "요한 암브로지우스 바흐",
                years: "1645 – 1695",
                desc: "바흐의 아버지 요한 암브로지우스 바흐는 아이제나흐 궁정 트럼펫 주자이자 뛰어난 바이올리니스트였습니다. 어린 바흐에게 바이올린과 비올라 연주법을 직접 가르쳤으며, 음악가 집안의 전통을 물려준 첫 번째 스승이었습니다. 1695년 세상을 떠나면서 10세의 바흐는 형 크리스토프에게 맡겨졌습니다.",
                img: "ambrosius_portrait.png",
                identity: "바흐의 아버지·첫 번째 스승"
            }
        ],
        next: [
            { id: "ohrdruf", label: "<span class='nav-text'>다음: 오르드루프</span><span class='nav-arrow'>➔</span>" },
            { id: "wechmar", label: "<span class='nav-text'>가문의 고향: 베히마르</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "erfurt", label: "<span class='nav-text'>가문의 도시: 에르푸르트</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "ohrdruf",
        nameKR: "오르드루프",
        nameDE: "Ohrdruf",
        period: "1695 - 1700 (10-15세)",
        badge: ["음악 학습", "악보 필사"],
        coords: [50.829, 10.732],
        desc: "10세에 부모를 여읜 바흐는 오르드루프에서 파헬벨의 제자인 큰형 요한 크리스토프에게 의탁했습니다. 이곳에서 형의 악보를 밤몰래 필사하며 건반 음악의 기본기를 익히고 학업을 이어갔습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bahnhof_Ohrdruf.JPG/960px-Bahnhof_Ohrdruf.JPG",
        youtubeId: "_F3SSv0xgus",
        youtubeStart: 3,
        youtubeVolume: 60, // Organ can be piercing, lower volume
        audioTitle: "요한 파헬벨 - 코랄 전주곡 <주 예수 그리스도여, 오직 주님께만> (※ J.S. 바흐의 곡이 아닌, 큰형의 스승이었던 파헬벨의 작품입니다)",
        audioAttribution: "출처: YouTube 채널 'Uwe Böhnisch'",
        influencer: {
            name: "형 요한 크리스토프",
            years: "1671 – 1721",
            desc: "부모를 여읜 소년 바흐를 거둔 큰형 요한 크리스토프는 파헬벨의 제자였습니다. 형의 엄격한 가르침과 몰래 필사하던 악보들은 바흐가 건반 악기의 대가로 성장하는 첫걸음이 되었습니다.",
            img: "portrait_jchristoph.png",
            identity: "첫 음악 스승이자 큰형"
        },
        influencers: [
            {
                name: "형 요한 크리스토프",
                years: "1671 – 1721",
                desc: "부모를 여윍 소년 바흐를 거둔 큰형 요한 크리스토프는 파헬벨의 제자였습니다. 형의 엄격한 가르침과 몰래 필사하던 악보들은 바흐가 건반 악기의 대가로 성장하는 첫걸음이 되었습니다.",
                img: "portrait_jchristoph.png",
                identity: "첫 음악 스승이자 큰형"
            },
            {
                name: "요한 파헬벨",
                years: "1653 – 1706",
                desc: "형 요한 크리스토프의 스승이자 바흐 가문의 절친한 가우였던 파헬벨은, 아이제나흐와 에르푸르트에서 바흐 가문과 깊이 교류했습니다. 파헬벨의 체계적이고 명료한 건반 양식은, 형을 통해 바흐에게 간접적으로 전해졌으며 초기 바흐 건반 음악의 근간이 되었습니다. 특히 코랄 전주곡과 푸가 작곡법에서 파헬벨의 영향은 뛚렷합니다.",
                img: "pachelbel_portrait.png",
                identity: "형의 스승 · 가문의 벗"
            }
        ],
        next: [
            { id: "lueneburg", label: "<span class='nav-text'>다음: 뤼네부르크</span><span class='nav-arrow'>➔</span>" }
        ]
    },
    {
        id: "lueneburg",
        nameKR: "뤼네부르크",
        nameDE: "Lüneburg",
        period: "1700 - 1702 (15-17세)",
        badge: ["합창단 장학생", "청소년기"],
        coords: [53.248, 10.407],
        desc: "15세에 장학생으로 뤼네부르크 성 미카엘 학교에 입학한 바흐는 합창단원으로 활동했습니다. 이 시기 오르가니스트 게오르크 뵘과 교류하며 북독일 오르간 음악 양식을 깊이 연구했습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/2010-06-06-lueneburg-by-RalfR-10.jpg/960px-2010-06-06-lueneburg-by-RalfR-10.jpg",
        youtubeId: "JGus2RYI01k",
        youtubeStart: 7,
        youtubeVolume: 50, // Harpsichord/Organ can be loud, keep it gentle
        audioTitle: "코랄 파르티타 <그리스도여, 당신은 밝은 낮이시니> BWV 766 (※ 뤼네부르크 시절 스승 게오르크 뵘의 영향을 받은 바흐의 초기작입니다)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "게오르크 뵘",
            years: "1661 – 1733",
            desc: "뤼네부르크에서 만난 거장 게오르크 뵘은 소년 합창단원 바흐에게 북독일 오르간 음악의 정수를 전해주었습니다. 스승의 화려한 변주 양식은 초기 바흐 음악의 핵심 자양분이 되었습니다.",
            img: "luneburg_influence.jpg",
            identity: "북독일 양식의 스승"
        },
        next: [
            { id: "weimar1", label: "<span class='nav-text'>다음: 바이마르 (1차)</span><span class='nav-arrow'>➔</span>" },
            { id: "celle", label: "<span class='nav-text'>여행: 셀레</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "hamburg", label: "<span class='nav-text'>여행: 함부르크</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "celle",
        isBranch: true,
        nameKR: "셀레",
        nameDE: "Celle",
        period: "1700 - 1702 (15-17세)",
        badge: ["프랑스 음악 탐구"],
        coords: [52.625, 10.082],
        desc: "프랑스 문화의 영향이 짙었던 궁정 도시 셀레를 방문한 학생 바흐는, 당시 악단이 연주하던 최신 프랑스 기악 무곡을 접하며 다양한 서유럽 음악 스타일을 자신의 작품에 융합하는 계기를 마련했습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Das_Schloss_in_Celle.jpg/960px-Das_Schloss_in_Celle.jpg",
        youtubeId: "lG8v_BA0Hhs",
        youtubeStart: 691,
        youtubeVolume: 65, // Harpsichord, moderate volume
        audioTitle: "프랑스 모음곡 5번 사장조, BWV 816 (Cemb. 프란체스코 코르티, Francesco Corti)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "조르주 빌헬름 공작",
            years: "1624 – 1705",
            desc: "셀레 공국의 마지막 공작 조르주 빌헬름은, 프랑스인 부인 엘레오노르 돌브뢰즈와 함께 셀레 궁정에 화려한 프랑스풍 문화를 꽃피웠습니다. 그가 초빙한 프랑스 출신 음악가들의 궁정 악단은, 최신 프랑스 기악 무곡을 연주했고, 뤼네부르크에서 온 젊은 바흐는 이 궁정을 여러 차례 방문하며 세련된 프랑스 양식을 흡수했습니다.",
            img: "georg_wilhelm_celle.png",
            identity: "프랑스풍 궁정의 후원자"
        },
        next: [
            { id: "weimar1", label: "<span class='nav-text'>다음: 바이마르 (1차)</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "hamburg",
        isBranch: true,
        nameKR: "함부르크",
        nameDE: "Hamburg",
        period: "1700 - 1702 (15-17세)",
        badge: ["청년 바흐의 집념", "거장의 연주"],
        coords: [53.5511, 9.9937],
        desc: "북독일의 항구 도시 함부르크는 당시 음악의 중심지 중 하나였습니다. 젊은 바흐는 당대 최고의 오르가니스트 요한 아담 라인켄의 연주를 듣기 위해 함부르크까지 도보로 여행하며 음악적 영감을 얻었습니다.",
        img: "hamburg.jpg",
        imgAttribution: "사진 출처: <a href='https://hamburg.mofa.go.kr/de-hamburg-ko/wpge/m_23379/contents.do' target='_blank' style='color:#d4af37;'>주함부르크 대한민국 총영사관</a>",
        youtubeId: "27ikjVNPZPg",
        youtubeStart: 8,
        youtubeVolume: 50,
        audioTitle: "J.S. Bach — 코랄 전주곡 <바벨론 강가에서> BWV 653 (An Wasserflüssen Babylon) ♦ Leo van Doeselaar (※ 라인켄의 오르간 연주를 듣고 훗날 바흐가 작곡한 곡입니다)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "요한 아담 라인켄",
            desc: "젊은 바흐는 당대 최고의 오르가니스트 라인켄의 연주를 듣기 위해 함부르크까지 50km를 걸었습니다. 노거장의 완숙한 대위법은 청년 바흐에게 예술적 경외심과 도전 정신을 심어주었습니다.",
            img: "hamburg_influence.jpg",
            identity: "동경하던 오르간 거장"
        },
        next: [
            { id: "weimar1", label: "<span class='nav-text'>다음: 바이마르 (1차)</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "weimar1",
        nameKR: "바이마르 (1차)",
        nameDE: "Weimar",
        period: "1702 - 1703 (18세)",
        badge: ["궁정 악사", "바이올리니스트"],
        coords: [50.982, 11.331],
        desc: "뤼네부르크를 떠난 18세의 바흐는 잠시 작센-바이마르 공작 요한 에른스트 3세의 궁정에서 악사(라카이)이자 바이올리니스트로 봉직했습니다. 비록 약 7개월의 짧은 기간이었지만, 이곳에서 궁정 음악의 분위기와 체계를 처음 경험했습니다. 동시에 아른슈타트 새 교회의 오르간 검수 작업에 참여하며 큰 인상을 남겼고, 이것이 계기가 되어 곧 아른슈타트 수석 오르가니스트로 발탁됩니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Weimar_-_Blick_zu_Herderkirche_%26_Stadtschloss.jpg/960px-Weimar_-_Blick_zu_Herderkirche_%26_Stadtschloss.jpg",
        youtubeId: "4aTmDgfz-8U",
        youtubeStart: 6,
        youtubeVolume: 50,
        audioTitle: "바이올린 소나타 마단조 BWV 1023 ♦ Shunske Sato & Menno van Delft (All of Bach)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "요한 에른스트 3세",
            years: "1664 – 1707",
            desc: "작센-바이마르 공작 요한 에른스트 3세는 바흐를 궁정 악사로 처음 고용한 영주입니다. 비록 짧은 기간이었지만, 궁정 음악의 체계와 격식을 처음 경험하게 해준 첫 후원자였습니다. 이후 바흐는 아른슈타트를 거쳐 5년 뒤 이 바이마르 궁정에 다시 돌아와, 본격적인 궁정 악장으로서의 전성기를 맞게 됩니다.",
            img: "johann_ernst_portrait.png",
            identity: "바흐의 첫 궁정 고용주"
        },
        next: [
            { id: "arnstadt", label: "<span class='nav-text'>다음: 아른슈타트</span><span class='nav-arrow'>➔</span>" }
        ]
    },
    {
        id: "arnstadt",
        nameKR: "아른슈타트",
        nameDE: "Arnstadt",
        period: "1703 - 1707 (18-22세)",
        badge: ["첫 직장", "오르가니스트", "형의 이별"],
        coords: [50.834, 10.947],
        desc: "18세의 바흐는 아른슈타트의 새 교회 수석 오르가니스트로 부임하여 첫 직장 생활을 시작했습니다. 이곳에서 그는 기존 성가에 파격적인 화성과 연주 기법을 시도하며 자신만의 작곡 스타일을 정립해 나갔습니다. 재직 중 형 요한 야콥이 카를 12세의 스웨덴 군대 악단에 입대하며 떠나자, 바흐는 형과의 이별을 아쉬워하며 '사랑하는 형의 출발에 즈음하여' (BWV 992)를 작곡했습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bachkirche_Arnstadt.JPG/960px-Bachkirche_Arnstadt.JPG",
        youtubeId: "3q1E1h9Dzyo",
        youtubeStart: 5,
        youtubeVolume: 80, // Piano, generally softer, can be slightly higher
        audioTitle: "카프리치오 <사랑하는 형의 출발에 즈음하여> 내림나장조, BWV 992 (Pf. 안드라스 쉬프, András Schiff)",
        audioAttribution: "출처: YouTube 채널 'SW'",
        influencer: {
            name: "요한 야콥 바흐",
            years: "1682 – 1722",
            desc: "바흐의 바로 위 형 요한 야콥은 스웨덴 왕 카를 12세의 군악대 오보이스트로 입대하며 아른슈타트를 떠났습니다. 형의 출발은 바흐에게 깊은 이별의 감정을 안겼고, 이를 카프리치오 BWV 992로 남겼습니다.",
            img: "portrait_jjakob.png",
            identity: "군악대에 입대한 형"
        },
        masterworks: [
            {
                title: "토카타와 푸가 라단조",
                bwv: "BWV 565",
                emoji: "🎹",
                desc: "바흐 오르간 음악의 상징. 극적인 단독 페달 선율로 시작해 폭풍 같은 푸가로 이어지는 이 곡은 오르가니스트 바흐의 천재성을 단번에 보여줍니다. 아른슈타트 또는 뮐하우젠 재직 시절에 작곡된 것으로 추정되며, 영화·광고·게임 등 대중문화에서 '공포·장엄함'의 상징으로 가장 많이 인용되는 클래식 음악 중 하나입니다.",
                youtubeId: "Pi0IuyTS_ic",
                youtubeStart: 7,
                youtubeVolume: 50,
                audioTitle: "토카타와 푸가 라단조 BWV 565 ♦ Leo van Doeselaar (All of Bach)"
            },
            {
                title: "카프리치오 <사랑하는 형의 출발에 즈음하여>",
                bwv: "BWV 992",
                emoji: "💌",
                desc: "스웨덴 군악대에 입대하는 형 요한 야콥의 출발에 맞춰 작곡한 표제 음악입니다. 6개 악장이 이별의 서사를 따라갑니다: 친구들의 만류 → 여행길의 위험 경고 → 친구들의 탄식 → 마차꾼의 아리아 → 우편 나팔 소리의 푸가. 감정을 악기로 묘사하는 이 곡은 바흐의 초기 건반 작품 중 가장 서정적이고 이야기를 담은 걸작입니다.",
                youtubeId: "3q1E1h9Dzyo",
                youtubeStart: 0,
                youtubeVolume: 80,
                audioTitle: "카프리치오 <사랑하는 형의 출발에 즈음하여> BWV 992 ♦ András Schiff"
            }
        ],
        next: [
            { id: "muehlhausen", label: "<span class='nav-text'>다음: 뮐하우젠</span><span class='nav-arrow'>➔</span>" },
            { id: "luebeck", label: "<span class='nav-text'>여행: 뤼벡</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "luebeck",
        isBranch: true,
        nameKR: "뤼벡",
        nameDE: "Lübeck",
        period: "1705 (20세)",
        badge: ["음악 순례", "영감"],
        coords: [53.868, 10.686],
        desc: "바흐는 아른슈타트 근무 중 휴가를 내어, 뤼벡으로 400여 킬로미터를 걸어가 디트리히 북스테후데의 상설 음악회인 아벤트무지크를 경험했습니다. 이는 그의 작곡 세계에 큰 전환점이 되었습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Aerial_image_of_St._Mary%27s_Church%2C_L%C3%BCbeck_%28view_from_the_west%29.jpg/960px-Aerial_image_of_St._Mary%27s_Church%2C_L%C3%BCbeck_%28view_from_the_west%29.jpg",
        youtubeId: "V5SZGclVUU0",
        youtubeStart: 1,
        youtubeVolume: 45, // Majestic Organ, needs lowest volume to not startle
        audioTitle: "전주곡과 푸가 다장조, BWV 531 (Org. 자코포 야코포, Jacopo PianOrgan) (※ 뤼벡에서 북스테후데의 연주를 듣고 작곡한 초기 명작입니다)",
        audioAttribution: "출처: YouTube 채널 'Jacopo PianOrgan'",
        influencer: {
            name: "디트리히 북스테후데",
            desc: "북독일 오르간의 전설 북스테후데를 만나기 위해 바흐는 400km의 여정을 떠났습니다. 거장의 압도적인 환상곡 양식은 바흐의 음악에 무한한 상상력과 구조적 치밀함을 더해주었습니다.",
            img: "lubeck_influence.jpg",
            identity: "위대한 오르간의 스승"
        },
        next: [
            { id: "muehlhausen", label: "<span class='nav-text'>다음: 뮐하우젠</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "muehlhausen",
        nameKR: "뮐하우젠",
        nameDE: "Mühlhausen",
        period: "1707 - 1708 (22-23세)",
        badge: ["오르가니스트", "칸타타 작곡"],
        coords: [51.206, 10.456],
        desc: "자유 제국 도시 뮐하우젠의 오르가니스트로 임명된 바흐는, 이곳에서 보다 체계적이고 규모가 큰 초기 성악 칸타타들을 작곡하며 교회 음악가로서의 입지를 본격적으로 다지기 시작했습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Altstadt_M%C3%BChlhausen.JPG/960px-Altstadt_M%C3%BChlhausen.JPG",
        youtubeId: "B93E0DYIMEU",
        youtubeVolume: 60, // Orchestral/Choral, moderate to soft
        audioTitle: "칸타타 <하나님은 예로부터 나의 왕이시다>, BWV 71 (Cond. 톤 코프만, Ton Koopman)",
        audioAttribution: "출처: YouTube 채널 'Edward Murray'",
        influencer: {
            name: "뮐하우젠 시의회",
            desc: "자유 제국 도시 뮐하우젠 시의회의 지원 속에 바흐는 장엄한 초기 칸타타들을 무대에 올렸습니다. 공공 음악가로서의 첫 성공은 그가 더 넓은 세상으로 나아가는 가교가 되었습니다.",
            img: "muehlhausen_influence.jpg",
            identity: "초기 활동의 지지자들"
        },
        influencers: [
            {
                name: "뮤하우젠 시의회",
                desc: "자유 제국 도시 뮤하우젠 시의회의 지원 속에 바흐는 장엄한 초기 칸타타들을 무대에 올렸습니다. 공공 음악가로서의 첫 성공은 그가 더 넓은 세상으로 나아가는 가교가 되었습니다.",
                img: "muehlhausen_influence.jpg",
                identity: "초기 활동의 지지자들"
            },
            {
                name: "에르트만 노이마이스터",
                years: "1671 – 1756",
                desc: "루터교 목사이자 시인인 노이마이스터는, 교회 칸타타에 오페라적 레치타티보와 아리아 형식을 도입한 혁신적 대본 작가입니다. 바흐는 뮤하우젠 시절부터 노이마이스터의 칸타타 대본 양식을 적극 수용했으며, 이는 훇날 바흐 칸타타의 극적인 서사와 음악적 구성이 탄생하는 기반이 되었습니다.",
                img: "neumeister_portrait.png",
                identity: "칸타타 혁신의 선구자"
            }
        ],
        masterworks: [
            {
                title: "칸타타 <하나님은 예로부터 나의 왕이시다>",
                bwv: "BWV 71",
                emoji: "🙏",
                desc: "뮐하우젠 시의회 선거를 축하하기 위해 작곡된 바흐의 초기 걸작 칸타타입니다. 바흐가 직접 인쇄를 감독한 최초의 출판 작품이기도 합니다. 합창·독창·관현악이 화려하게 교차하는 7개 악장 구성으로, 시편 74편을 바탕으로 하나님의 위대한 역사를 노래합니다. 트럼펫과 팀파니가 장엄하게 울리는 도입부는 훗날 바흐 칸타타의 웅장한 스케일을 예고합니다.",
                youtubeId: "B93E0DYIMEU",
                youtubeStart: 0,
                youtubeVolume: 60,
                audioTitle: "칸타타 <하나님은 예로부터 나의 왕이시다> BWV 71 ♦ Ton Koopman"
            }
        ],
        next: [
            { id: "weimar", label: "<span class='nav-text'>다음: 바이마르</span><span class='nav-arrow'>➔</span>" },
            { id: "dornheim", label: "<span class='nav-text'>여행: 도른하임</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "dornheim",
        isBranch: true,
        nameKR: "도른하임",
        nameDE: "Dornheim",
        period: "1707 (22세)",
        badge: ["결혼", "가족"],
        coords: [50.835, 10.985], // A small village very close to Arnstadt
        desc: "바흐는 아른슈타트 인근의 작은 마을인 도른하임 교회에서 육촌인 마리아 바르바라와 첫 결혼식을 올렸습니다. 바흐 가문의 일원들이 모여 전통적인 쿠오들리베트를 부르며 부부의 앞날을 축하했습니다.",
        img: "traukirche-luftbild-1024x682.jpg",
        imgAttribution: "사진 출처: <a href='https://www.bach-in-dornheim.de/' target='_blank' style='color:#d4af37;'>bach-in-dornheim.de</a>",
        youtubeId: "JqqAij9p0YU",
        youtubeStart: 7,
        youtubeVolume: 75,
        audioTitle: "쿠오들리베트 (Quodlibet) BWV 524 (※ 바흐 가문 친척들이 모여 즐겁게 부르던 전통의 방식을 엿볼 수 있는 곡입니다)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "마리아 바르바라",
            desc: "소박한 도른하임의 교회에서 바흐는 마리아 바르바라와 백년가약을 맺었습니다. 가문의 사랑과 안정을 바탕으로, 바흐는 인간으로서 그리고 예술가로서 완숙한 성장을 이룰 수 있었습니다.",
            img: "dornheim_influence.jpg",
            identity: "인생의 동반자이자 첫 아내"
        },
        next: [
            { id: "weimar", label: "<span class='nav-text'>다음: 바이마르</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "weimar",
        nameKR: "바이마르",
        nameDE: "Weimar",
        period: "1708 - 1717 (23-32세)",
        badge: ["궁정 오르가니스트", "악장"],
        coords: [50.980, 11.329],
        desc: "바이마르 궁정의 오르가니스트 겸 악장으로 재직하던 시절, 바흐는 비발디를 비롯한 이탈리아 협주곡 양식을 면밀히 연구했습니다. 이 시기에 수많은 오르간 걸작들이 작곡되며 오르간 음악의 전성기를 맞았습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Weimar_-_Blick_zu_Herderkirche_%26_Stadtschloss.jpg/960px-Weimar_-_Blick_zu_Herderkirche_%26_Stadtschloss.jpg",
        youtubeId: "8gpb4zsXjZA",
        youtubeStart: 7,
        youtubeVolume: 50,
        audioTitle: "오르겔뷔힐라인 BWV 642 '하나님만을 믿는 자' ♦ Dorien Schouten (All of Bach)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "안토니오 비발디",
            years: "1678 – 1741",
            desc: "바이마르 궁정에서 비발디의 협주곡 악보를 연구한 바흐는 이탈리아 특유의 명쾌한 리듬과 구조를 흡수했습니다. 이는 그의 오르간 곡들을 더욱 역동적이고 세련되게 변모시켰습니다.",
            img: "weimar_influence.jpg",
            identity: "이탈리아 양식의 원천"
        },
        influencers: [
            {
                name: "안토니오 비발디",
                years: "1678 – 1741",
                desc: "바이마르 궁정에서 비발디의 협주곡 악보를 연구한 바흐는 이탈리아 특유의 명쾌한 리듬과 구조를 흡수했습니다. 이는 그의 오르간 곡들을 더욱 역동적이고 세련되게 변모시켰습니다.",
                img: "weimar_influence.jpg",
                identity: "이탈리아 양식의 원천"
            },
            {
                name: "요한 게오르크 피젠델",
                years: "1687 – 1755",
                desc: "드레스덴 궁정악단의 수석 바이올리니스트 피젠델은, 베네치아에서 비발디에게 직접 사사한 뛰어난 연주자였습니다. 바이마르 시절 바흐와 교류하며, 이탈리아에서 가져온 최신 협주곡 악보와 연주 양식을 직접 전해주었습니다. 피젠델이 건네준 비발디와 알비노니의 악보는, 바흐가 이탈리아 협주곡 양식을 오르간과 쳄발로 작품으로 편곡하는 결정적 계기가 되었으며, 두 사람의 우정은 평생 지속되었습니다.",
                img: "pisendel_portrait.png",
                identity: "이탈리아 양식의 전달자 · 드레스덴 악장"
            },
            {
                name: "요한 에른스트 공자",
                years: "1696 – 1715",
                desc: "바이마르 궁정의 젊은 공자 요한 에른스트는, 이탈리아 유학에서 돌아와 비발디와 알비노니의 최신 협주곡 악보를 바흐에게 직접 가져다준 인물입니다. 이 악보들이 바흐의 이탈리아 협주곡 편곡(BWV 592–596)의 직접적 계기가 되었습니다. 음악적 재능이 뛰어난 공자였으나, 19세의 나이로 요절하여 바흐를 깊이 애도하게 했습니다.",
                img: "johann_ernst_iv_portrait.png",
                identity: "이탈리아 악보의 전달자 · 요절한 공자"
            }
        ],
        masterworks: [
            {
                title: "오르겔뷔힐라인",
                bwv: "BWV 599–644",
                emoji: "📖",
                desc: "'작은 오르간 책'이라는 뜻으로, 교회 절기에 맞춘 46개의 코랄 전주곡 모음집입니다. 원래 164곡을 채울 계획이었으나 바이마르 투옥 등으로 미완성으로 남았습니다. 짧지만 밀도 높은 각 곡은 오르간 교육용으로 만들어졌으며, '손가락의 기교를 익히고 동시에 페달 기법도 완성하기 위해'라는 바흐 자신의 헌사가 적혀 있습니다.",
                youtubeId: "8gpb4zsXjZA",
                youtubeStart: 7,
                youtubeVolume: 50,
                audioTitle: "오르겔뷔힐라인 BWV 642 '하나님만을 믿는 자' ♦ Dorien Schouten (All of Bach)"
            },
            {
                title: "파사칼리아와 푸가 다단조",
                bwv: "BWV 582",
                emoji: "🎹",
                desc: "저음부에서 8마디 주제가 20번 반복되는 동안 그 위로 변주가 끝없이 펼쳐지는 오르간 대곡. '파사칼리아'는 스페인에서 기원한 변주 형식으로, 바흐는 이를 극한까지 발전시켜 오르간 문헌 최고의 명작 중 하나를 완성했습니다. 후반부 엄격한 2성부 푸가와의 연결이 압권입니다.",
                youtubeId: "zzBXZ__LN_M",
                youtubeStart: 7,
                youtubeVolume: 50,
                audioTitle: "파사칼리아와 푸가 다단조 BWV 582 ♦ Reitze Smits (All of Bach)"
            }
        ],
        next: [
            { id: "koethen", label: "<span class='nav-text'>다음: 쾨텐</span><span class='nav-arrow'>➔</span>" }
        ]
    },
    {
        id: "koethen",
        nameKR: "쾨텐",
        nameDE: "Köthen",
        period: "1717 - 1723 (32-38세)",
        badge: ["궁정 악장", "기악곡의 완성", "두 번째 결혼"],

        coords: [51.752, 11.975],
        desc: "안할트-쾨텐 공국의 영주 레오폴트 공이 다스리던 쾨텐에서 바흐는 궁정 악장으로 일했습니다. 음악을 극진히 사랑한 군주 덕분에 종교 음악의 의무에서 벗어난 바흐는 브란덴부르크 협주곡, 무반주 첼로 모음곡 등 기악 음악의 걸작들을 써냈습니다. 한편 1720년 첫 번째 아내 마리아 바르바라가 갑작스럽게 세상을 떠나는 비극도 이 도시에서 맞이했으며, 이듬해 1721년 궁정 소프라노 안나 막달레나 빌케와 재혼하며 새 출발을 했습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/K%C3%B6then_in_Anhalt_Silhouette_Rathaus_Schloss_Rapsfeld_Aufnahme_und_Copyright_MEH_Bergmann.jpg/960px-K%C3%B6then_in_Anhalt_Silhouette_Rathaus_Schloss_Rapsfeld_Aufnahme_und_Copyright_MEH_Bergmann.jpg",
        youtubeId: "cGnZHIY_hoQ",
        youtubeStart: 9,
        youtubeVolume: 90, // Solo Cello, warm and soft, can be loud
        audioTitle: "무반주 첼로 모음곡 1번 사장조, BWV 1007 (Vc. 루시아 스바르츠, Lucia Swarts)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "레오폴트 공",
            years: "1694 – 1728",
            desc: "안할트 쾨텐 공국의 영주 레오폴트 공은, 직접 첼로와 류트를 연주할 만큼 음악적 조예가 깊었습니다. 악사들을 아끼고 바흐에게 완전한 예술적 자유를 보장해주었으며, 그 배려 속에서 브란덴부르크 협주곡 등 기악 음악의 걸작들이 탄생했습니다.",
            img: "kothen_influence.jpg",
            identity: "음악을 사랑한 진정한 후원자"
        },
        influencers: [
            {
                name: "레오폴트 공",
                years: "1694 – 1728",
                desc: "안할트 췈텐 공국의 영주 레오폴트 공은, 직접 첼로와 류트를 연주할 만큼 음악적 조예가 깊었습니다. 악사들을 아끼고 바흐에게 완전한 예술적 자유를 보장해주었으며, 그 배려 속에서 브란덴부르크 협주곡 등 기악 음악의 걸작들이 탄생했습니다.",
                img: "kothen_influence.jpg",
                identity: "음악을 사랑한 진정한 후원자"
            },
            {
                name: "마리아 바르바라 바흐",
                years: "1684 – 1720",
                desc: "바흐의 첫 부인 마리아 바르바라는 육촌으로, 도른하임에서 결혼한 후 7명의 자녀를 낳았습니다. 1720년 바흐가 칼스바트 온천 여행에서 돌아왔을 때, 아내는 이미 사망하여 매장된 후였습니다. 이 충격적인 상실은 바흐의 삶에 가장 깊은 상처를 남겼으며, 무반주 바이올린 파르티타 2번의 '샤콘느'가 이 비통을 담은 곡이라는 설이 있습니다.",
                img: "maria_barbara_portrait.png",
                identity: "바흐의 첫 부인"
            }
        ],
        masterworks: [
            {
                title: "브란덴부르크 협주곡",
                bwv: "BWV 1046–1051",
                emoji: "🎻",
                desc: "브란덴부르크 변경백 크리스티안 루트비히에게 헌정한 6곡의 협주곡 모음. 곡마다 전혀 다른 독주 악기 조합(트럼펫, 플루트, 오보에, 첼로 등)을 사용하는 실험성이 특징입니다. 당시 기술적으로 거의 연주 불가능한 파트가 포함되어 있어, 변경백의 악단이 실제로 연주했는지조차 의문입니다. 후대에 재발견되며 바로크 협주곡의 정점으로 평가받습니다.",
                youtubeId: "qr0f6t2UbOo",
                youtubeStart: 9,
                youtubeVolume: 70,
                audioTitle: "브란덴부르크 협주곡 3번 사장조 BWV 1048 ♦ Shunske Sato (All of Bach)"
            },
            {
                title: "무반주 첼로 모음곡",
                bwv: "BWV 1007–1012",
                emoji: "🎻",
                desc: "단 하나의 첼로만으로 화음, 선율, 리듬을 동시에 구현하는 6개의 모음곡. 200년 가까이 잊혔다가 1889년 파블로 카살스가 헌책방에서 악보를 발견하며 세상에 알려졌습니다. 전주곡-알르망드-쿠랑트-사라반드-미뉴에트(또는 부레·가보트)-지그의 구성으로, 하나의 악기로 이룰 수 있는 음악적 깊이의 한계에 도전합니다.",
                youtubeId: "mGQLXRTl3Z0",
                youtubeStart: 9,
                youtubeVolume: 90,
                audioTitle: "무반주 첼로 모음곡 1번 사장조 BWV 1007 - 전주곡 ♦ Lucia Swarts (All of Bach)"
            },
            {
                title: "무반주 바이올린 소나타와 파르티타",
                bwv: "BWV 1001–1006",
                emoji: "🎻",
                desc: "바이올린 하나로 교회 소나타와 무곡 모음곡을 완성한 3곡의 소나타와 3곡의 파르티타. 각 소나타는 엄격한 다성 푸가를, 각 파르티타는 춤곡 모음을 담고 있어 대조를 이룹니다. 파르티타 3번 마장조의 프렐류드는 화려한 아르페지오로 시작하여 밝은 에너지가 넘치며, 파르티타 2번의 <a href='#' class='mw-link' onclick=\"event.stopPropagation(); viewCity(citiesData.find(c=>c.id==='carlsbad')); return false;\">샤콘느</a>는 바이올린 독주 문헌 최고봉으로 불립니다. 쾨텐 시기 기악곡 탐구의 정수를 보여주는 걸작입니다.",
                youtubeId: "gYT1JUq0k04",
                youtubeStart: 13,
                youtubeVolume: 70,
                audioTitle: "무반주 바이올린 파르티타 3번 마장조 BWV 1006 - 프렐류드 ♦ Shunske Sato (All of Bach)"
            },
            {
                title: "평균율 클라비어 1권",
                bwv: "BWV 846–869",
                emoji: "🎹",
                desc: "24개의 모든 장조와 단조로 각각 전주곡과 푸가를 작성한 음악적 백과사전입니다. 제목의 평균율이란, 모든 조성에서 연주 가능한 악기 조율법을 가리킵니다. 바흐는 이 곡들로 실용적 교육용 악보이자, 동시에 예술적 극치를 달성했습니다. 훗날 라이프치히에서 2권이 추가됩니다.",
                youtubeId: "IZ2pNhh6D1w",
                youtubeStart: 6.8,
                youtubeVolume: 60,
                audioTitle: "평균율 클라비어 곡집 1권 1번 다장조 BWV 846 ♦ Siebe Henstra (All of Bach)"
            },
            {
                title: "두 대의 바이올린을 위한 협주곡",
                bwv: "BWV 1043",
                emoji: "🎻",
                desc: "두 대의 독주 바이올린이 서로 대화하듯 선율을 주고받는 라단조 협주곡입니다. 1악장에서 두 바이올린이 카논처럼 동일 주제를 추격하며 긴장감을 쌓고, 2악장 라르고에서는 두 선율이 감미롭게 얽히며 바로크 실내악의 가장 아름다운 느린 악장 중 하나를 만들어냅니다. 3악장은 빠른 리듬으로 화려하게 마무리합니다. 쾨텐 궁정 악단의 뛰어난 기량이 있었기에 탄생할 수 있었던 걸작입니다.",
                youtubeId: "ILKJcsET-NM",
                youtubeStart: 9,
                youtubeVolume: 70,
                audioTitle: "두 대의 바이올린을 위한 협주곡 라단조 BWV 1043 ♦ Sato & Deans (All of Bach)"
            }
        ],
        next: [
            { id: "leipzig", label: "<span class='nav-text'>다음: 라이프치히</span><span class='nav-arrow'>➔</span>" },
            { id: "carlsbad", label: "<span class='nav-text'>여행: 칼스바트</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "carlsbad",
        isBranch: true,
        nameKR: "칼스바트",
        nameDE: "Karlovy Vary",
        period: "1720 (35세)",
        badge: ["수행 여행", "사별"],
        coords: [50.231, 12.871],
        desc: "바흐는 주군을 수행하여 온천 휴양지 칼스바트를 방문했을 때, 아내 마리아 바르바라가 갑작스럽게 세상을 떠났다는 소식을 듣게 됩니다. 무반주 바이올린 파르티타 2번의 '샤콘느'는 이 시기의 깊은 상실감을 반영한 곡으로 알려져 있습니다.",
        img: "칼스바트.png",
        youtubeId: "7y4lcQ7BTLw",
        youtubeStart: 7,
        youtubeVolume: 80, // Solo Violin, moderate to loud
        audioTitle: "무반주 바이올린 파르티타 2번 라단조 중 '샤콘느', BWV 1004 (Vn. 슌스케 사토, Shunske Sato)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "마리아 바르바라",
            desc: "주군을 수행해 떠난 칼스바트 여행은 화려했지만, 돌아온 바흐를 기다린 것은 아내와의 사별이었습니다. 깊은 상실감 속에서도 공작의 위로는, 바흐가 다시 음악으로 일어서는 힘이 되었습니다.",
            img: "carlsbad_influence.jpg",
            identity: "고난을 함께한 주군과 가족"
        },
        next: [
            { id: "leipzig", label: "<span class='nav-text'>다음: 라이프치히</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "leipzig",
        nameKR: "라이프치히",
        nameDE: "Leipzig",
        period: "1723 - 1750 (38-65세)",
        badge: ["토마스칸토르", "종교음악의 거장"],
        coords: [51.339, 12.373],
        desc: "출판과 무역의 중심지 라이프치히에서 바흐는 가장 오랜 기간인 27년 동안 토마스칸토르로 봉직했습니다. 매주 새로운 교회 칸타타를 무대에 올리는 강행군 속에서도 '마태 수난곡' 등 서양 음악사의 중요한 종교 음악들을 작곡했습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Blick_vom_City-Hochhaus_Leipzig_05.jpg/960px-Blick_vom_City-Hochhaus_Leipzig_05.jpg",
        youtubeId: "1AtOPiG5jyk",
        youtubeStart: 9,
        youtubeVolume: 65, // Harpsichord
        audioTitle: "골드베르크 변주곡, BWV 988 (Cemb. 장 롱도, Jean Rondeau)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "성 토마스 합창단",
            years: "1212년 창설 – 현재",
            desc: "라이프치히의 토마스 학교 제자들은 바흐의 고단한 일상이자 예술적 도구였습니다. 부족한 환경 속에서도 제자들과 함께 매주 칸타타를 올리며, 바흐는 서양 음악사의 거대한 금자탑을 쌓았습니다.",
            img: "leipzig_influence.jpg",
            identity: "평생을 함께한 제자들"
        },
        influencers: [
            {
                name: "성 토마스 합창단",
                years: "1212년 창설 – 현재",
                desc: "라이프치히의 토마스 학교 제자들은 바흐의 고단한 일상이자 예술적 도구였습니다. 부족한 환경 속에서도 제자들과 함께 매주 칸타타를 올리며, 바흐는 서양 음악사의 거대한 금자탑을 쌓았습니다.",
                img: "leipzig_influence.jpg",
                identity: "평생을 함께한 제자들"
            },
            {
                name: "라이프치히 시 음악대",
                years: "Stadtpfeifer",
                desc: "라이프치히 시 소속 직업 음악가 집단인 슈타트프파이퍼(Stadtpfeifer)는, 교회 칸타타와 수난곡 공연에서 바흐가 지휘하는 오케스트라의 핵심 연주자들이었습니다. 바흐는 이들의 기량에 맞추어 트럼펫, 오보에, 팀파니 등 관악·타악 파트를 작곡했으며, 매주 교회 음악의 수준을 높이기 위해 시 당국과 끊임없이 교섭해야 했습니다.",
                img: "leipzig_stadtpfeifer.png",
                identity: "교회 오케스트라의 주축"
            },
            {
                name: "콜레기움 무지쿰",
                years: "1702년 텔레만 창설",
                desc: "대학생과 시민 음악가들로 구성된 콜레기움 무지쿰(Collegium Musicum)은, 바흐가 1729년부터 약 10년간 이끈 세속 음악 앙상블입니다. 치머만 커피하우스에서 매주 공연하며 바흐의 세속 칸타타, 관현악 모음곡, 협주곡 등이 초연되었고, 이는 바흐 음악의 또 다른 중요한 무대가 되었습니다.",
                img: "collegium_musicum.png",
                identity: "세속 음악의 무대"
            },
            {
                name: "안나 막달레나 바흐",
                years: "1701 – 1760",
                desc: "쾨텐 궁정의 소프라노 가수였던 안나 막달레나는, 1721년 바흐와 재혼한 후 라이프치히에서 20명의 자녀를 낳으며 가정을 꾸렸습니다. 뛰어난 음악적 소양을 지닌 그녀는 바흐의 악보를 정성껏 필사하는 카피스트로서, 또 가정 내 음악 교육의 동반자로서 바흐의 창작 활동을 가장 가까이에서 지원했습니다. '안나 막달레나를 위한 클라비어 소곡집'은 바흐가 아내에게 선물한 음악 교본이자 사랑의 증표입니다.",
                img: "anna_magdalena_portrait.png",
                identity: "바흐의 둘째 부인 · 음악의 동반자"
            },
            {
                name: "피칸더",
                years: "1700 – 1764",
                desc: "본명 크리스티안 프리드리히 헨리치인 피칸더는, 라이프치히의 시인이자 바흐의 핵심 문학 협력자입니다. 마태 수난곡(BWV 244)의 대본을 쓴 장본인으로, 바흐의 가장 위대한 종교 음악에 극적인 서사와 신학적 깊이를 부여했습니다. 수많은 칸타타 대본도 피칸더의 손에서 탄생했습니다.",
                img: "picander_portrait.png",
                identity: "마태 수난곡의 대본 작가"
            },
            {
                name: "게오르크 필립 텔레만",
                years: "1681 – 1767",
                desc: "당대 독일 최고의 작곡가 텔레만은, 라이프치히 콜레기움 무지쿠의 창설자이자 토마스칸토르 직위의 1순위 후보였습니다. 그가 이 직을 고사한 덕분에 바흐가 토마스칸토르가 될 수 있었습니다. 두 사람은 평생 우정을 유지했으며, 텔레만은 바흐의 둘째 아들 C.P.E. 바흐의 대부이기도 합니다.",
                img: "telemann_portrait.png",
                identity: "토마스칸토르 고사자 · 평생의 벗"
            },
            {
                name: "요한 쿠나우",
                years: "1660 – 1722",
                desc: "바흐의 토마스칸토르 전임자 요한 쿠나우는, 라이프치히 음악계를 20년 넘게 이끈 작곡가입니다. 그의 사망 후 바흐가 그 자리를 이어받았습니다. 쿠나우의 건반 소나타와 종교 음악 전통은, 바흐가 라이프치히에서 이어받은 음악적 유산이었습니다.",
                img: "kuhnau_portrait.png",
                identity: "토마스칸토르 전임자"
            },
            {
                name: "존 테일러",
                years: "1703 – 1772",
                desc: "영국인 안과 의사 존 테일러는, 말년에 시력을 잃어가던 바흐의 눈을 수술한 인물입니다. 그러나 수술은 실패하여 바흐의 건강을 오히려 악화시켰고, 바흐는 수술 후 몇 달 만에 세상을 떠났습니다. 테일러는 헨델의 눈도 수술한 악명 높은 돌팔이 의사로, 바흐의 비극적 말년을 상징하는 인물입니다.",
                img: "taylor_portrait.png",
                identity: "악명 높은 돌팔이 의사"
            },
            {
                name: "라이프치히 시의회",
                years: "",
                desc: "라이프치히 시의회는 바흐의 고용주이자 27년간의 끌임없는 갈등 상대였습니다. 급여, 인력, 권한 문제로 매번 충돌했고, 바흐는 이에 대항하기 위해 드레스덴 궁정 작곡가 칭호를 얻는 전략을 취했습니다. 바흐는 시의회에 '이곳의 음악 수준은 부끄러운 수준'이라는 편지를 쓰기도 했습니다.",
                img: "leipzig_council_portrait.png",
                identity: "27년간의 갈등 상대"
            }
        ],
        masterworks: [
            {
                title: "마태 수난곡",
                bwv: "BWV 244",
                emoji: "🙏",
                desc: "베드로의 부인 직후 흐르는 알토 아리아 '에르바메 디히(Erbarme dich, mein Gott·나의 하나님, 불쌍히 여기소서)'. 독주 바이올린의 애절한 선율 위로 알토가 참회와 슬픔을 노래하는 이 곡은 마태 수난곡 전체에서 가장 깊은 감동을 주는 순간으로 꼽힙니다. 바흐 사후 거의 잊혔다가 1829년 멘델스존이 재연하며 바흐 부흥의 불씨를 당겼고, 오늘날 서양 성악 문헌 최고의 아리아 중 하나로 사랑받고 있습니다.",
                youtubeId: "Zry9dpM1_n4",
                youtubeStart: 5,
                youtubeVolume: 60,
                audioTitle: "마태 수난곡 BWV 244 - 에르바메 디히 (Erbarme dich) ♦ All of Bach"
            },
            {
                title: "나단조 미사",
                bwv: "BWV 232",
                emoji: "🙏",
                desc: "바흐 최후의 대규모 합창 작품이자 서양 음악사 최고의 미사곡 중 하나. 가톨릭 미사 전문을 루터교 작곡가가 완성했다는 점도 이채롭습니다. '크리에 엘레이손(Kyrie eleison)'의 5성부 합창으로 시작해 '아뉴스 데이(Agnus Dei)'의 고요한 알토 아리아까지, 전 26곡이 각각 독립된 걸작입니다. 완성 후 바흐는 약 1년 뒤 세상을 떠났습니다.",
                youtubeId: "3FLbiDrn8IE",
                youtubeStart: 6,
                youtubeVolume: 60,
                audioTitle: "나단조 미사 BWV 232 ♦ Jos van Veldhoven (All of Bach)"
            },
            {
                title: "골트베르크 변주곡",
                bwv: "BWV 988",
                emoji: "🎹",
                desc: "러시아 주독일 대사 <span class='person-link' data-person='kaiserling'>카이저링크 백작</span>은 만성 불면증에 시달리며, 긴 밤을 달래줄 음악을 바흐에게 의뢰했습니다. 바흐는 자신의 제자이자 백작의 전속 쳄발리스트였던 14세 소년 <span class='person-link' data-person='goldberg'>요한 고틀리프 골트베르크</span>가 연주할 수 있도록, 우아한 사라반드 아리아 위에 30개의 변주를 정교하게 쌓아 올렸습니다. 매 3번째 변주마다 카논이 등장하며 음정 간격이 1도씩 넓어지는 수학적 구조, 그리고 마지막 변주(쿠오들리베트)에서 민요 두 곡을 유쾌하게 결합한 뒤 다시 처음 아리아로 돌아오는 원환 구조는, '변주곡'이라는 장르가 이토록 심오하고 아름다울 수 있음을 증명합니다. 글렌 굴드의 1955년 데뷔 녹음과 1981년 유작 녹음은, 이 작품을 현대 대중에게 강렬하게 각인시켰습니다.",
                personLinks: {
                    kaiserling: {
                        name: "카이저링크 백작",
                        years: "1696 – 1764",
                        desc: "헤르만 카를 폰 카이저링크 백작은 러시아 제국의 주작센 대사로, 드레스덴과 라이프치히에서 활동한 음악 애호가이자 후원자였습니다. 만성 불면증에 시달리던 그는 밤마다 전속 쳄발리스트 골트베르크에게 연주를 시켰고, 바흐에게 불면의 밤을 달래줄 건반 음악을 의뢰했습니다. 이 요청으로 탄생한 것이 바로 '골트베르크 변주곡'입니다. 백작은 완성된 작품에 크게 감동하여 바흐에게 금잔에 100루이도르를 담아 사례했다고 전해집니다.",
                        img: "kaiserling_portrait.png",
                        identity: "불면의 후원자 · 러시아 대사"
                    },
                    goldberg: {
                        name: "요한 고틀리프 골트베르크",
                        years: "1727 – 1756",
                        desc: "바흐와 빌헬름 프리데만 바흐에게 사사한 천재 쳄발리스트 골트베르크는, 카이저링크 백작의 전속 연주자로서 매일 밤 백작의 불면을 달래는 연주를 맡았습니다. 바흐가 이 소년의 뛰어난 기량을 염두에 두고 작곡한 30개의 변주곡은, 그의 이름을 따 '골트베르크 변주곡'으로 불리게 되었습니다. 29세의 젊은 나이에 요절했지만, 동시대 최고의 건반 연주자 중 하나로 인정받았습니다.",
                        img: "goldberg_portrait.png",
                        identity: "백작의 전속 쳄발리스트 · 바흐의 제자"
                    }
                },
                youtubeId: "1AtOPiG5jyk",
                youtubeStart: 8,
                youtubeVolume: 65,
                audioTitle: "골트베르크 변주곡 BWV 988 ♦ Jean Rondeau (All of Bach)"
            },
            {
                title: "푸가의 기법",
                bwv: "BWV 1080",
                emoji: "🔢",
                desc: "하나의 주제를 14개의 푸가와 4개의 카논으로 변주하는 대위법의 완전한 교과서. 마지막 푸가(Contrapunctus XIV)에는 B-A-C-H(시♭-라-도-시)라는 바흐 자신의 이름이 주제로 삽입됩니다. 그러나 이 마지막 푸가는 미완성으로 남았고, 악보 끝에 '이 푸가에서 BACH 이름이 나타날 때 작곡자가 세상을 투옥 세상을 떠났다'는 아들의 메모가 전합니다.",
                youtubeId: "N6sUlZa-IrU",
                youtubeStart: 9,
                youtubeVolume: 50,
                audioTitle: "푸가의 기법 BWV 1080 (애니메이션 악보) ♦ All of Bach 프로젝트"
            },
            {
                title: "플루트 소나타 나단조",
                bwv: "BWV 1030",
                emoji: "🪈",
                desc: "바흐의 플루트 소나타 중 가장 규모가 크고 깊이 있는 걸작입니다. 플루트와 쳄발로가 대등한 파트너로서 긴밀하게 대화하는 3악장 구조로, 특히 쳄발로가 단순 반주를 넘어 독립적인 선율을 펼치는 점이 혁신적입니다. 우아하면서도 그늘진 나단조의 서정미가 돋보이며, 라이프치히 시기 실내악의 정교함을 대표합니다.",
                youtubeId: "zztgjDfi_gI",
                youtubeStart: 8,
                youtubeVolume: 60,
                audioTitle: "플루트 소나타 나단조 BWV 1030 ♦ Netherlands Bach Society (All of Bach)"
            }
        ],
        next: [
            { id: "potsdam", label: "<span class='nav-text'>여행: 포츠담</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "dresden", label: "<span class='nav-text'>여행: 드레스덴</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "halle", label: "<span class='nav-text'>아들의 도시: 할레</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "milan", label: "<span class='nav-text'>아들의 도시: 밀라노</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "london", label: "<span class='nav-text'>아들의 도시: 런던</span><span class='nav-arrow'>➔</span>", isBranch: true }
        ]
    },
    {
        id: "potsdam",
        isBranch: true,
        nameKR: "포츠담",
        nameDE: "Potsdam",
        period: "1747 (62세)",
        badge: ["초대형 연주", "음악의 헌정", "아들과의 재회"],
        coords: [52.3960, 13.0450],
        desc: "노년의 바흐는, 아들 카를 필리프 에마누엘이 프리드리히 대왕의 궁정 쳄발리스트로 근무하던 포츠담 상수시 궁전에 초대되었습니다. 부자의 재회이자 역사적인 만남이었습니다. 왕이 제시한 복잡한 주제를 바탕으로 대위법적 즉흥 연주를 펼친 후, 이를 악보로 정리하여 음악의 헌정이라는 제목으로 바쳤습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Aerial_image_of_Sanssouci_%28view_from_the_south%29.jpg",
        youtubeId: "Lv5A1gy2oys",
        youtubeStart: 9,
        youtubeVolume: 75, // Chamber music, moderate
        audioTitle: "<음악의 헌정> 중 3성부 리체르카레, BWV 1079 (Fp. 레오 판 두셀라르, Leo van Doeselaar)",
        audioAttribution: "출처: YouTube 채널 'Netherlands Bach Society'",
        influencer: {
            name: "프리드리히 대왕",
            years: "1712 – 1786",
            desc: "포츠담 궁정에서 프로이센의 군주 프리드리히 대왕을 만난 노거장 바흐는 '왕의 테마'로 즉흥 연주를 펼쳤습니다. 대왕은 바흐를 '단 한 명의 거장'이라 칭송하며 최고의 예우를 다했습니다.",
            img: "potsdam_influence.jpg",
            identity: "바흐를 초대한 군주"
        },
        influencers: [
            {
                name: "프리드리히 대왕",
                years: "1712 – 1786",
                desc: "포츠담 궁정에서 프로이센의 군주 프리드리히 대왕을 만난 노거장 바흐는 '왕의 테마'로 즉흥 연주를 펼쳤습니다. 대왕은 바흐를 '단 한 명의 거장'이라 칭송하며 최고의 예우를 다했습니다.",
                img: "potsdam_influence.jpg",
                identity: "바흐를 초대한 군주"
            },
            {
                name: "카를 필리프 에마누엘 바흐",
                years: "1714 – 1788",
                desc: "바흐의 다섯째 아들이자 둘째 아들 중 가장 성공한 음악가인 카를 필리프 에마누엘은, 프리드리히 대왕의 궁정 쳄발리스트로 약 30년간 봉직했습니다. 아버지의 포츠담 방문을 주선한 장본인이며, '감정과다 양식(엠프핀트자머 슈틸)'의 선구자로서 하이든과 모차르트에게 깊은 영향을 끼쳤습니다. 아버지 바흐의 작품을 보존하고 전파하는 데에도 결정적인 역할을 했습니다.",
                img: "cpe_bach_portrait.png",
                identity: "궁정 쳄발리스트 · 둘째 아들"
            }
        ],
        masterworks: [
            {
                title: "음악의 헌정",
                bwv: "BWV 1079",
                emoji: "👑",
                desc: "프리드리히 대왕이 즉흥으로 제시한 복잡한 주제('왕의 테마')를 바탕으로 리체르카레·카논·트리오 소나타를 엮은 모음집. 바흐는 귀국 후 악보를 정교하게 정리해 왕에게 헌정했습니다. '리체르카레(ricercare)'라는 단어를 라틴어 두문자로 풀면 'Regis Iussu Cantio Et Reliqua Canonica Arte Resoluta'(왕의 명으로 노래와 나머지를 카논 기법으로 풀다)가 됩니다—바흐의 유머이자 지적 유희입니다.",
                youtubeId: "Lv5A1gy2oys",
                youtubeStart: 0,
                youtubeVolume: 70,
                audioTitle: "음악의 헌정 BWV 1079 - 3성부 리체르카레 ♦ Leo van Doeselaar (All of Bach)"
            }
        ]
    },
    {
        id: "halle",
        isBranch: true,
        nameKR: "할레",
        nameDE: "Halle",
        period: "1746 (빌헬름 프리데만 바흐 취임)",
        badge: ["첫째 아들의 도시", "빌헬름 프리데만"],
        coords: [51.4828, 11.9700],
        desc: "할레는 바흐의 첫째 아들 빌헬름 프리데만 바흐가 약 18년간 활동한 도시입니다. 라이프치히에서 불과 40km 거리인 이곳에서 프리데만은 성모 마르크트 교회의 오르가니스트이자 음악감독으로 봉직했습니다. 아버지의 천재성을 가장 많이 물려받았다는 평가를 받았으나, 변화하는 시대에 적응하지 못한 채 결국 1764년 이 직위를 사임하고 유랑 음악가의 길을 걷게 됩니다. 아버지 바흐도 생전에 할레를 여러 차례 방문하며 아들의 활동을 지켜보았습니다.",
        img: "할레.png",
        youtubeId: "zoPuLlvTMfU",
        youtubeStart: 13,
        youtubeVolume: 60,
        audioTitle: "W.F. Bach — Sinfonia in D minor F 65 ♦ Jeune Orchestre Atlantique · Stéphanie-Marie Degand",
        audioAttribution: "출처: YouTube",
        influencer: {
            name: "빌헬름 프리데만 바흐",
            years: "1710 – 1784",
            desc: "바흐의 첫째 아들 빌헬름 프리데만은 아버지에게 직접 음악을 배운 가장 총애받은 아들이었습니다. '클라비어 소곡집(빌헬름 프리데만 바흐를 위한 클라비어 소곡집)'은 아버지가 아들의 교육을 위해 직접 편찬한 교본입니다. 뛰어난 즉흥 연주 능력과 독창적인 작곡 스타일을 지녔으나, 아버지의 거대한 그림자와 시대의 변화 사이에서 끝내 안정을 찾지 못한 비운의 천재였습니다.",
            img: "wf_bach_portrait.png",
            identity: "바흐의 첫째 아들"
        },
        next: [
            { id: "leipzig", label: "<span class='nav-text'>돌아가기: 라이프치히</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "dresden",
        isBranch: true,
        nameKR: "드레스덴",
        nameDE: "Dresden",
        period: "1733 - 1736 (궁정 작곡가 칭호 획득)",
        badge: ["궁정 작곡가", "오르간 시연회", "아들의 첫 직장"],
        coords: [51.0504, 13.7373],
        desc: "작센 선제후국의 수도 드레스덴은, 라이프치히 시절 바흐가 가장 자주 방문한 도시입니다. 1733년 바흐는 선제후 프리드리히 아우구스트 2세에게 단성 미사(후날 B단조 미사의 기초)를 헌정하며 '궁정 작곡가' 칭호를 요청했고, 1736년 마침내 '폴란드 국왕 겸 작센 선제후 궁정 작곡가'라는 칭호를 얻어 라이프치히에서의 입지를 공고히 했습니다. 또한 드레스덴에는 당대 유럽 최고의 연주자들이 모여 있었고, 오르간 제작자 실버만의 맅기 오르간들이 있어 바흐는 시연회를 열며 압도적인 연주력을 뿌냈습니다. 장남 빌헬름 프리데만도 이곳 소피아 교회의 오르가니스트로 첫 직장을 잡았고, 아버지는 아들을 보러 수시로 드나들었습니다.",
        img: "드레스덴.png",
        youtubeId: "Zkx1vgl7RbU",
        youtubeStart: 8,
        youtubeVolume: 50,
        audioTitle: "J.S. Bach — Gloria in excelsis Deo BWV 191 ♦ Netherlands Bach Society · Jos van Veldhoven",
        audioAttribution: "",
        influencer: {
            name: "프리드리히 아우구스트 2세",
            years: "1696 – 1763",
            desc: "작센 선제후 겸 폴란드 국왕인 프리드리히 아우구스트 2세는, 바흐가 3년간 간청한 끝에 '궁정 작곡가' 칭호를 수여한 군주입니다. 1733년 바흐가 단성 미사(Missa)를 헌정하며 칭호를 요청했고, 1736년 마침내 수여됩니다. 이 칭호는 라이프치히 시 당국과의 끌임없는 갈등에서 바흐의 입지를 크게 강화해주었습니다.",
            img: "friedrich_august_portrait.png",
            identity: "궁정 작곡가 칭호를 수여한 군주"
        },
        influencers: [
            {
                name: "프리드리히 아우구스트 2세",
                years: "1696 – 1763",
                desc: "작센 선제후 겸 폴란드 국왕인 프리드리히 아우구스트 2세는, 바흐가 3년간 간청한 끝에 '궁정 작곡가' 칭호를 수여한 군주입니다. 1733년 바흐가 단성 미사(Missa)를 헌정하며 칭호를 요청했고, 1736년 마침내 수여됩니다. 이 칭호는 라이프치히 시 당국과의 끌임없는 갈등에서 바흐의 입지를 크게 강화해주었습니다.",
                img: "friedrich_august_portrait.png",
                identity: "궁정 작곡가 칭호를 수여한 군주"
            },
            {
                name: "요한 게오르크 피젠델",
                years: "1687 – 1755",
                desc: "드레스덴 궁정악단의 악장이자 수석 바이올리니스트 피젠델은, 바흐가 드레스덴을 방문하는 가장 큰 이유 중 하나였습니다. 베네치아에서 비발디에게 직접 사사한 그는, 이탈리아 최신 협주곡 악보와 연주 양식을 바흐에게 전해주었으며, 두 사람의 우정은 평생 지속되었습니다.",
                img: "pisendel_portrait.png",
                identity: "드레스덴 악장 · 평생의 벗"
            },
            {
                name: "고틀리프 실버만",
                years: "1683 – 1753",
                desc: "당대 최고의 오르간 제작자 고틀리프 실버만은, 드레스덴의 여러 교회에 명기를 설치했습니다. 바흐는 이 오르간들의 시연회를 열며 자신의 압도적인 연주력을 뿌냈고, 실버만은 바흐의 조언을 받아 피아노포르테 제작을 개량하기도 했습니다. 다만 바흐는 초기 실버만 피아노포르테의 터치감이 무겁다고 비평하여, 두 거장 사이에 긴장이 있었다고도 전해집니다.",
                img: "silbermann_portrait.png",
                identity: "드레스덴의 오르간 제작 거장"
            },
            {
                name: "빌헬름 프리데만 바흐",
                years: "1710 – 1784",
                desc: "바흐의 장남 빌헬름 프리데만은 드레스덴 소피아 교회(Sophienkirche)의 오르가니스트로 첫 직장을 잡았습니다. 아버지 바흐가 가장 아끼던 아들로, 프리데만의 커리어를 지원하기 위해 드레스덴을 수시로 드나들었습니다. 뛰어난 즉흥 연주 능력과 독창적인 작곡 스타일을 지뇈으나, 변화하는 시대에 적응하지 못한 비운의 천재였습니다.",
                img: "wf_bach_portrait.png",
                identity: "드레스덴 첫 직장 · 장남"
            }
        ],
        next: [
            { id: "leipzig", label: "<span class='nav-text'>돌아가기: 라이프치히</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "milan",
        isBranch: true,
        nameKR: "밀라노",
        nameDE: "Milano",
        period: "요한 크리스티안 바흐 활동기",
        badge: ["막내아들의 도시", "요한 크리스티안"],
        coords: [45.464, 9.190],
        desc: "밀라노는 바흐의 막내아들 요한 크리스티안 바흐가 음악적 전환을 이룬 도시입니다. 1755년경 이탈리아로 건너간 크리스티안은 밀라노 대성당의 오르가니스트로 활동하며, 아버지의 루터교 전통에서 벗어나 가톨릭으로 개종하고 이탈리아 오페라 양식을 깊이 흡수했습니다. 이곳에서 쌓은 오페라 작곡 경험은 훗날 런던에서의 화려한 성공의 밑거름이 되었습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Milano_Duomo.jpg/960px-Milano_Duomo.jpg",
        youtubeId: "",
        youtubeStart: 0,
        youtubeVolume: 60,
        audioTitle: "요한 크리스티안 바흐의 음악",
        audioAttribution: "출처: YouTube",
        influencer: {
            name: "요한 크리스티안 바흐",
            years: "1735 – 1782",
            desc: "바흐의 막내아들 요한 크리스티안은 밀라노 대성당의 오르가니스트로 활동하며 이탈리아 오페라 양식을 체득했습니다. 아버지의 엄격한 대위법과는 대조적으로 우아하고 선율적인 '갈랑 양식'을 추구했으며, 이는 훗날 런던에서 어린 모차르트에게 깊은 영감을 주게 됩니다. 바흐 아들들 중 가장 국제적인 명성을 얻은 음악가였습니다.",
            img: "jc_bach_portrait.png",
            identity: "바흐의 막내아들 · 밀라노의 오르가니스트"
        },
        next: [
            { id: "london", label: "<span class='nav-text'>다음: 런던</span><span class='nav-arrow'>➔</span>", isBranch: true },
            { id: "leipzig", label: "<span class='nav-text'>돌아가기: 라이프치히</span><span class='nav-arrow'>↩</span>" }
        ]
    },
    {
        id: "london",
        isBranch: true,
        nameKR: "런던",
        nameDE: "London",
        period: "요한 크리스티안 바흐 활동기",
        badge: ["런던의 바흐", "요한 크리스티안"],
        coords: [51.507, -0.128],
        desc: "런던은 요한 크리스티안 바흐가 '런던의 바흐(London Bach)'라는 별명으로 유럽 최고의 명성을 얻은 도시입니다. 1762년 런던에 정착한 그는 왕실 음악 교사로 활동하며 오페라와 협주곡으로 대중의 사랑을 받았습니다. 특히 1764년 런던을 방문한 8세의 어린 모차르트와 만남은 음악사의 중요한 순간으로, 크리스티안의 우아한 양식은 모차르트의 초기 피아노 협주곡에 직접적인 영향을 끼쳤습니다.",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/St_Paul%27s_Cathedral_Dome_from_One_New_Change_-_Diliff.jpg/960px-St_Paul%27s_Cathedral_Dome_from_One_New_Change_-_Diliff.jpg",
        youtubeId: "",
        youtubeStart: 0,
        youtubeVolume: 60,
        audioTitle: "요한 크리스티안 바흐의 음악",
        audioAttribution: "출처: YouTube",
        influencer: {
            name: "요한 크리스티안 바흐",
            years: "1735 – 1782",
            desc: "'런던의 바흐'로 불린 요한 크리스티안은 영국 왕실의 음악 교사이자 오페라 작곡가로 대성했습니다. 1764년 런던을 방문한 8세 소년 모차르트를 무릎 위에 앉히고 함께 연탄곡을 연주했다는 일화는 유명합니다. 모차르트는 크리스티안의 사후 '음악에 대한 진정한 사랑을 가르쳐 준 사람'이라며 깊은 애도를 표했습니다.",
            img: "jc_bach_portrait.png",
            identity: "런던의 바흐 · 바흐의 막내아들"
        },
        next: [
            { id: "milan", label: "<span class='nav-text'>돌아가기: 밀라노</span><span class='nav-arrow'>↩</span>" },
            { id: "leipzig", label: "<span class='nav-text'>돌아가기: 라이프치히</span><span class='nav-arrow'>↩</span>" }
        ]
    }
];

let ttsEnabled = true;
let ttsSliderValue = 50; // Default at 50 (middle) for 1x volume
const ttsBaseVolume = 0.8; // 80% is the normal base, allowing 25% boost up to 1.0
const ttsAudio = new Audio(); // Pre-generated MP3 narration player
ttsAudio.preload = 'auto';
const ttsVolumeSlider = document.getElementById('tts-volume');

function getActualTtsVolume() {
    // 50 is 1x. Value 100 means 2x. Cap at Native 1.0 max.
    let multiplier = ttsSliderValue / 50;
    return Math.min(1.0, ttsBaseVolume * multiplier);
}

// Play pre-generated MP3 narration for a city
function speakCity(cityId) {
    if (!ttsEnabled || ttsSliderValue === 0 || !audioUnlocked) return;

    ttsAudio.pause();
    ttsAudio.currentTime = 0;
    ttsAudio.src = `tts/${cityId}.mp3`;
    ttsAudio.volume = getActualTtsVolume();
    ttsAudio.play().catch(e => console.error("TTS audio error:", e));
}

// Legacy wrapper
function speakText(text) {
    if (currentCityData) speakCity(currentCityData.id);
}

// Map TTS toggle button
const ttsBtn = document.getElementById('tts-toggle');
ttsBtn.addEventListener('click', () => {
    ttsEnabled = !ttsEnabled;
    updateTtsBtnUI();
    if (!ttsEnabled) {
        ttsAudio.pause();
    } else if (currentCityData && document.getElementById('active-state').classList.contains('hidden') === false) {
        speakCity(currentCityData.id);
    }
});

// TTS Volume Slider
if (ttsVolumeSlider) {
    ttsVolumeSlider.addEventListener('input', (e) => {
        ttsSliderValue = parseInt(e.target.value, 10);

        if (ttsSliderValue > 0 && !ttsEnabled) {
            ttsEnabled = true;
            updateTtsBtnUI();
        } else if (ttsSliderValue === 0 && ttsEnabled) {
            ttsEnabled = false;
            updateTtsBtnUI();
            ttsAudio.pause();
        }

        // Apply volume immediately to currently playing narration
        ttsAudio.volume = getActualTtsVolume();
    });
}

function updateTtsBtnUI() {
    if (ttsEnabled) {
        ttsBtn.classList.remove('muted');
        ttsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>`;
    } else {
        ttsBtn.classList.add('muted');
        ttsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>`;
    }
}

// 4. Music Settings & YouTube API
let musicEnabled = true;
let userMusicSliderValue = 50; // 0 to 100, Master slider value, default 50
const musicVolumeSlider = document.getElementById('music-volume');

const bgAudio = new Audio();
bgAudio.loop = true;  // Keep playing track while looking at city
// Update bgAudio volume based on global slider (scaled down further so it doesn't overpower TTS)
function updateBgAudioVolume() {
    let multiplier = userMusicSliderValue / 50;
    bgAudio.volume = Math.min(1.0, 0.3 * multiplier); // Base is 0.3
}
updateBgAudioVolume();

// YouTube IFrame API Setup
let ytPlayer;
let ytPlayerReady = false;
let currentYoutubeId = '';
let fadeTimeout;
let fadeInterval;

// Load the IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('youtube-player', {
        height: '200',
        width: '300',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    ytPlayerReady = true;

    // 아무 도시도 선택되지 않은 초기 상태에서 인트로 배경음악 자동 재생
    const INTRO_VIDEO_ID = 'x8Rv9ppP6A8';
    const INTRO_START_SEC = 1115;

    if (!currentCityData && musicEnabled && audioUnlocked) {
        currentYoutubeId = INTRO_VIDEO_ID;
        currentVolumeLevel = 60;
        ytPlayer.setVolume(getActualYouTubeVolume());
        ytPlayer.loadVideoById({
            videoId: INTRO_VIDEO_ID,
            startSeconds: INTRO_START_SEC
        });
        // 티커에 곡 정보 표시
        setTickerText('J.S. Bach — 관현악 모음곡 2번 B단조 BWV 1067 제7곡 바디네리 (Badinerie) ♦ Netherlands Bach Society · Shunske Sato');
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startFadeOutTimer();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        clearFadeOutTimers();
    }
}

let currentVolumeLevel = 100; // The track's base volume limit (0-100)

function getActualYouTubeVolume() {
    // 50 is 1x. Value 100 means 2x. Cap at Native 100 max.
    let multiplier = userMusicSliderValue / 50;
    return Math.min(100, currentVolumeLevel * multiplier);
}

function startFadeOutTimer() {
    clearFadeOutTimers();
    // 1분 27초(87000ms) 대기 후 3초 페이드 아웃
    fadeTimeout = setTimeout(() => {
        let actualStartVol = getActualYouTubeVolume();
        let currentVolume = actualStartVol;
        let fadeStep = currentVolume / 20; // Fade out in 20 steps over 3 seconds (150ms interval)
        fadeInterval = setInterval(() => {
            currentVolume -= fadeStep;
            if (currentVolume <= 0) {
                currentVolume = 0;
                if (ytPlayerReady) {
                    ytPlayer.setVolume(0);
                    ytPlayer.pauseVideo();
                }
                clearFadeOutTimers();
            } else {
                if (ytPlayerReady) ytPlayer.setVolume(currentVolume);
            }
        }, 150);
    }, 87000);
}

function clearFadeOutTimers() {
    if (fadeTimeout) clearTimeout(fadeTimeout);
    if (fadeInterval) clearInterval(fadeInterval);
}

const musicBtn = document.getElementById('music-toggle');
musicBtn.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    updateMusicBtnUI();

    const tickerEl = document.getElementById('music-ticker-text');
    const tickerWrap = document.getElementById('music-ticker-wrap');

    if (musicEnabled && audioUnlocked) {
        if (bgAudio.src) {
            bgAudio.play().catch(e => console.error("Audio playback error", e));
        }

        if (currentYoutubeId && ytPlayerReady) {
            ytPlayer.playVideo();
        }

        // 티커 재개 – 현재 도시 제목으로 루프 재시작
        setTickerText((currentCityData && currentCityData.audioTitle) || '재생 중인 배경음악 없음');
        if (tickerWrap) tickerWrap.classList.remove('ticker-paused');
    } else {
        bgAudio.pause();

        if (ytPlayerReady) {
            ytPlayer.pauseVideo();
            clearFadeOutTimers();
        }

        // 티커 일시정지
        if (tickerEl) {
            tickerEl.dataset.savedTitle = tickerEl.textContent;
        }
        setTickerText('⏸ 일시정지', false); // loop 없이 짧은 텍스트로 표시
        if (tickerWrap) tickerWrap.classList.add('ticker-paused');
    }
});

// Music Volume Slider
if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener('input', (e) => {
        userMusicSliderValue = parseInt(e.target.value, 10);

        // Auto-unmute if sliding up from 0 when muted
        if (userMusicSliderValue > 0 && !musicEnabled) {
            musicEnabled = true;
            updateMusicBtnUI();
            if (audioUnlocked && bgAudio.src) bgAudio.play().catch(e => { });
            if (audioUnlocked && currentYoutubeId && ytPlayerReady) ytPlayer.playVideo();
        } else if (userMusicSliderValue === 0 && musicEnabled) {
            musicEnabled = false;
            updateMusicBtnUI();
            bgAudio.pause();
            if (ytPlayerReady) ytPlayer.pauseVideo();
        }

        // Apply volume immediately
        updateBgAudioVolume();
        if (ytPlayerReady && currentYoutubeId) {
            ytPlayer.setVolume(getActualYouTubeVolume());
        }
    });
}

// Utility: Replace city names in text with clickable links
function linkifyCityNames(text) {
    if (!text) return text;
    // Build map of nameKR -> cityId (sort by length descending to match longest first)
    const cityNames = citiesData
        .map(c => ({ name: c.nameKR, id: c.id }))
        .sort((a, b) => b.name.length - a.name.length);
    let result = text;
    cityNames.forEach(({ name, id }) => {
        // Escape regex special chars in name
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'g');
        result = result.replace(regex,
            `<a href="#" class="city-link" onclick="event.preventDefault(); const c = citiesData.find(x=>x.id==='${id}'); if(c) viewCity(c);">${name}</a>`
        );
    });
    return result;
}

// 티커 텍스트를 설정하는 헬퍼: loop=true이면 두 벌 이어붙여 끊김 없는 무한 루프 실현
function setTickerText(text, loop = true) {
    const el = document.getElementById('music-ticker-text');
    if (!el) return;
    const SEP = '　　◆　　'; // 두 사본 사이 구분자
    el.textContent = loop ? (text + SEP + text) : text;
    // 애니메이션 리셋 (텍스트 변경 시 처음부터 다시 시작)
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = '';
    // Update YouTube button visibility
    const ytBtn = document.getElementById('ticker-yt-btn');
    if (ytBtn) {
        ytBtn.style.display = currentYoutubeId ? 'flex' : 'none';
    }
}

// Open the current YouTube video in a new tab and pause in-app music
function openCurrentYouTube() {
    if (!currentYoutubeId) return;
    // Pause in-app audio
    if (bgAudio) bgAudio.pause();
    if (ytPlayerReady && ytPlayer) {
        try { ytPlayer.pauseVideo(); } catch (e) { }
    }
    // Open YouTube in new tab
    window.open('https://www.youtube.com/watch?v=' + currentYoutubeId, '_blank');
}

// Open a specific YouTube video (for masterwork badges)
function openYouTubeLink(youtubeId, e) {
    if (e) e.stopPropagation();
    // Pause in-app audio
    if (bgAudio) bgAudio.pause();
    if (ytPlayerReady && ytPlayer) {
        try { ytPlayer.pauseVideo(); } catch (e) { }
    }
    window.open('https://www.youtube.com/watch?v=' + youtubeId, '_blank');
}

// Toggle the YouTube popup above the ticker
function toggleTickerPopup() {
    if (!currentYoutubeId) return;
    const popup = document.getElementById('ticker-yt-popup');
    if (!popup) return;
    popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
}

function hideTickerPopup() {
    const popup = document.getElementById('ticker-yt-popup');
    if (popup) popup.style.display = 'none';
}

// Close popup when clicking outside
document.addEventListener('click', (e) => {
    const popup = document.getElementById('ticker-yt-popup');
    const tickerWrap = document.getElementById('music-ticker-wrap');
    if (popup && tickerWrap && !tickerWrap.contains(e.target)) {
        popup.style.display = 'none';
    }
});

function updateMusicBtnUI() {
    if (musicEnabled) {
        musicBtn.classList.remove('muted');
        musicBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
            </svg>`;
    } else {
        musicBtn.classList.add('muted');
        musicBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`;
    }
}


// 4. Update UI Function
const placeholderState = document.getElementById('placeholder-state');
const activeState = document.getElementById('active-state');
const cityNameEl = document.getElementById('city-name');
const cityNavButtonsEl = document.getElementById('city-nav-buttons');
const cityGermanNameEl = document.getElementById('city-german-name');
const cityPeriodEl = document.getElementById('city-period');
const cityDescEl = document.getElementById('city-description');
const cityImageEl = document.getElementById('city-image');
const cityAudioTitleEl = document.getElementById('music-ticker-text'); // 이제 콘트롤 바의 티커로 이동
const replayTtsBtn = document.getElementById('replay-tts-btn');

// Timeline Elements
const timelineProgress = document.getElementById('timeline-progress');
const timelineAgeLabel = document.getElementById('timeline-current-age');

// --- 관광지 데이터 (Tourist Attractions) ---
// cat: church(교회), home(집터), museum(박물관/학교), statue(동상), palace(궁전/성), spa(온천/기타)
const touristSpotsData = [
    {
        cityId: "eisenach",
        name: "바흐 하우스 (Bachhaus)",
        cat: "museum",
        desc: "바흐가 태어난 곳 근처의 15세기 고택. 세계 최초의 바흐 박물관으로 당시 악기 연주를 직접 시연함.",
        coords: [50.9715, 10.3235],
        img: "바흐_하우스_(Bachhaus).jpg"
    },
    {
        cityId: "eisenach",
        name: "성 게오르그 교회",
        cat: "church",
        desc: "바흐가 세례를 받은 곳. 루터가 설교하고 바흐 가문 대대로 오르가니스트를 맡았던 유서 깊은 교회.",
        coords: [50.9749, 10.3197],
        img: "성_게오르그_교회.jpg"
    },
    {
        cityId: "eisenach",
        name: "바흐 동상 (Bachdenkmal)",
        cat: "statue",
        desc: "아이제나흐 바흐하우스 앞에 세워져 관광객들을 반겨주는 동상. 악보를 들고 서 있는 늠름한 바흐의 모습을 볼 수 있습니다.",
        coords: [50.9716, 10.3230],
        img: "아이제나흐 바흐 동상.png"
    },
    {
        cityId: "wechmar",
        name: "바흐 시조의 집 (Bach-Stammhaus)",
        cat: "museum",
        desc: "바흐 가문의 시조 베이트 바흐가 정착한 곳으로, 바흐 음악 왕조의 뿌리가 시작된 역사적인 집. 현재 박물관으로 운영되며 바흐 가문의 기원과 튀링겐 음악 전통을 전시하고 있습니다.",
        coords: [50.8855, 10.7155],
        img: "Bach-Stammhaus.png"
    },
    {
        cityId: "erfurt",
        name: "상인교회 · 카우프만 교회 (Kaufmannskirche)",
        cat: "church",
        desc: "바흐의 부모 요한 암브로지우스와 엘리자베트 레머히르트가 1668년 결혼식을 올린 교회입니다. 교회 앞 광장에 바흐의 동상이 서 있으며, 바흐 가문 사람들이 대대로 오르가니스트로 봉사했던 유서 깊은 곳입니다.",
        coords: [50.9780, 11.0340],
        img: "에르푸르트 슈타트 교회.jpg"
    },
    {
        cityId: "erfurt",
        name: "카우프만 교회 (Kaufmannskirche)",
        cat: "church",
        desc: "바흐의 아버지 요한 암브로지우스가 세례받은 곳. 바흐 가문과 에르푸르트 시민 사회의 깊은 유대를 보여주는 교회입니다.",
        coords: [50.9780, 11.0351],
        img: "에르푸르트 카우프만 교회.png"
    },
    {
        cityId: "erfurt",
        name: "프레디거 교회 (Predigerkirche)",
        cat: "church",
        desc: "바흐의 증조부 요한 바흐가 오르가니스트로 약 40년간 봉직한 교회입니다. 훗날 요한 파헬벨도 이곳에서 활동하며 바흐 가문과 깊은 인연을 맺었습니다.",
        coords: [50.9765, 11.0290],
        img: "에르푸르트 프레디거 교회.jpg"
    },
    {
        cityId: "erfurt",
        name: "바흐 가문의 거리 (Junkersand)",
        cat: "home",
        desc: "에르푸르트 곳곳에 바흐 성씨를 가진 음악가들이 살았던 집터가 남아 있어 '바흐 가문의 거리'를 산책하는 재미가 있습니다.",
        coords: [50.9773, 11.0315],
        img: "에르푸르트 바흐가문의 거리.png"
    },
    {
        cityId: "ohrdruf",
        name: "성 미카엘 교회",
        cat: "church",
        desc: "부모를 여읜 소년 바흐가 큰형 밑에서 자라며 오르간과 작곡을 처음으로 깊이 있게 배운 장소.",
        coords: [50.8285, 10.7350],
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Blick_auf_St._Michaelis_Ohrdruf.jpg?width=800"
    },
    {
        cityId: "lueneburg",
        name: "성 미카엘 학교",
        cat: "museum",
        desc: "바흐가 장학생으로 다니며 음악과 라틴어를 수학하고 소년 성가대원으로 활동했던 유서 깊은 학교.",
        coords: [53.2494, 10.4012],
        img: "뤼네부르크 성 미카엘 학교.jpg"
    },
    {
        cityId: "celle",
        name: "셀레 궁전 (Schloss Celle)",
        cat: "palace",
        desc: "바흐가 프랑스 무곡의 세련된 리듬을 배운 핵심 장소입니다. 화려한 르네상스 양식의 궁전 교회(Schlosskapelle)를 간직하고 있습니다.",
        coords: [52.6235, 10.0769],
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Celle_castle_-_Germany_-_01.jpg?width=800"
    },
    {
        cityId: "hamburg",
        name: "성 카타리나 교회 (St. Katharinen)",
        cat: "church",
        desc: "당대 최고의 오르가니스트 요한 아담 라인켄이 연주하던 곳. 소년 바흐가 그의 연주를 듣기 위해 50km를 걸어서 찾아왔던 역사적인 장소입니다.",
        coords: [53.5458, 9.9942],
        img: "함부르크 성 카타리나 교회.jpg"
    },
    {
        cityId: "arnstadt",
        name: "바흐 교회 (성 보니파치우스)",
        cat: "church",
        desc: "바흐의 첫 공식 오르가니스트 부임지. 그가 직접 연주하며 찬사를 받았던 '벤더 오르간'이 있음.",
        coords: [50.8335, 10.9458],
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Arnstadt,_Johann-Sebastian-Bach-Kirche,_Innenansicht,_Bild_2.jpg?width=800"
    },
    {
        cityId: "arnstadt",
        name: "젊은 바흐 동상",
        cat: "statue",
        desc: "엄숙한 모습 대신, 의자에 비스듬히 앉아 있는 천재 청년의 패기를 담은 독특한 동상.",
        coords: [50.8342, 10.9458],
        img: "아른슈타트 젊은 바흐 동상.png"
    },
    {
        cityId: "dornheim",
        name: "성 바르톨로메 교회",
        cat: "church",
        desc: "[첫 번째 결혼식장] 마리아 바르바라와 백년가약을 맺은 '바흐 결혼 교회(Bach-Traukirche)'.",
        coords: [50.8355, 10.9839],
        img: "성 바르톨로메 교회.png"
    },
    {
        cityId: "luebeck",
        name: "성 마리아 교회 (St. Marien-Kirche)",
        cat: "church",
        desc: "북스테후데가 38년간 역임한 곳. 바흐가 아벤트무지크(저녁 음악회)를 참관하며 큰 영감을 받은 장소.",
        coords: [53.86778, 10.68513],
        img: "성_마리아_교회_(St._Marien-Kirche).jpg"
    },
    {
        cityId: "luebeck",
        name: "북스테후데 가옥 터 (Buxtehudehaus)",
        cat: "home",
        desc: "성 마리아 교회 인근(Am Markt)의 북스테후데 집터. 바흐가 거장과 밤늦도록 대화를 나누고 후계 제안을 깊이 고민했을 장소.",
        coords: [53.8665, 10.6855],
        img: "북스테후데_가옥_터_(Buxtehudehaus).jpg"
    },
    {
        cityId: "muehlhausen",
        name: "디비 블라지 교회",
        cat: "church",
        desc: "자유 제국 도시의 위상을 보여주는 웅장한 교회. 바흐의 위대한 칸타타 BWV 71이 울려 퍼진 곳.",
        coords: [51.2065, 10.4578],
        img: "디비_블라지_교회.jpg"
    },
    {
        cityId: "weimar",
        name: "바흐 거주지 터",
        cat: "home",
        desc: "현재 '호텔 엘레판트' 옆자리. 바흐가 궁정 음악가로 황금기를 보내며 가장 많은 오르간 곡을 쓴 집터.",
        coords: [50.9791, 11.3298],
        img: "바흐_거주지_터.jpg"
    },
    {
        cityId: "weimar",
        name: "성 베드로와 바울 교회",
        cat: "church",
        desc: "바흐의 아들들이 세례를 받은 곳. '헤르더 교회'라고도 불리며 바이마르 신앙의 중심지.",
        coords: [50.9808, 11.3304],
        img: "성_베드로와_바울_교회.jpg"
    },
    {
        cityId: "weimar",
        name: "붉은 성 (Rotes Schloss)",
        cat: "palace",
        desc: "궁정 악단 소속이던 바흐가 바이올리니스트로서 활약하며 연주했던 역사적인 장소입니다. 현재는 안나 아말리아 도서관 연구 센터로 쓰입니다.",
        coords: [50.9782, 11.3312],
        img: "바이마르 붉은 성.jpg"
    },
    {
        cityId: "koethen",
        name: "쾨텐 궁전 (Schloss Köthen)",
        cat: "palace",
        desc: "오르간 없는 궁정에서 첼로와 바이올린 독주곡, 브란덴부르크 협주곡 등 기악의 정수를 꽃피운 곳.",
        coords: [51.7523, 11.9765],
        img: "쾨텐_궁전_(Schloss_Köthen).jpg"
    },
    {
        cityId: "koethen",
        name: "성 야콥 교회",
        cat: "church",
        desc: "바흐의 후원자 레오폴트 공의 묘역이 있는 교회. 바흐가 종종 오르간을 점검하러 들렀던 곳.",
        coords: [51.7516, 11.9746],
        img: "성_야콥_교회.jpg"
    },
    {
        cityId: "leipzig",
        name: "성 토마스 교회",
        cat: "church",
        desc: "바흐가 27년간 음악감독으로 일한 곳. 현재 그의 유해가 안치되어 있는 전 세계 바흐 팬들의 성지.",
        coords: [51.3396, 12.3726],
        img: "성_토마스_교회.jpg"
    },
    {
        cityId: "leipzig",
        name: "바흐의 무덤 (성 토마스 교회 내부)",
        cat: "memorial",
        desc: "1750년 7월 28일, 65세의 바흐는 라이프치히에서 눈을 감았습니다. 처음에는 성 요한 교회 묘지에 매장되었으나, 1950년 유해가 성 토마스 교회 제단 앞으로 이장되었습니다. 27년간 음악감독으로 일했던 바로 그 교회에서, 바흐는 지금도 영원한 안식을 취하고 있습니다.",
        coords: [51.3394, 12.3722],
        img: "바흐의 무덤.png"
    },
    {
        cityId: "leipzig",
        name: "바흐 박물관 (보제 하우스)",
        cat: "museum",
        desc: "바흐의 절친했던 이웃 보제 가문의 집. 현재 바흐의 원본 악보와 유물이 가장 많이 보관된 곳.",
        coords: [51.3392, 12.3725],
        img: "바흐_박물관_(보제_하우스).jpg"
    },
    {
        cityId: "leipzig",
        name: "카페 짐머만 터",
        cat: "home",
        desc: "바흐가 '콜레기움 무지쿰'과 함께 세속 음악(커피 칸타타 등)을 연주하며 대중과 호흡했던 장소.",
        coords: [51.3422, 12.3748],
        img: "카페_짐머만_터.jpg"
    },
    {
        cityId: "potsdam",
        name: "상수시 궁전",
        cat: "palace",
        desc: "프리드리히 대왕이 바흐를 초대해 '왕의 테마'를 하사한 장소. 로코코 양식의 화려한 궁전.",
        coords: [52.4042, 13.0385],
        img: "상수시_궁전.jpg"
    },
    {
        cityId: "carlsbad",
        name: "카를로비 바리 온천 콜로네이드 (Mill Colonnade)",
        cat: "spa",
        desc: "바흐가 영주와 온천수를 마시며 교류했던 장소입니다. 화려한 회랑은 훗날 지어졌으나 온기의 터는 그대로 남아있습니다.",
        coords: [50.2255, 12.8817],
        img: "Mlynska-kolonada.jpg",
        imgAttribution: "출처: <a href='https://villabasileia.cz/en/monuments-karlovy-vary/' target='_blank'>Villa Basileia</a>"
    },
    {
        cityId: "carlsbad",
        name: "호텔 펍 (Hotel Pub)",
        cat: "spa",
        desc: "당시 고급 숙박 시설이 밀집했던 곳입니다. 바흐가 레오폴트 공 악단과 머물며 소규모 합주를 선보였을 것으로 추정됩니다.",
        coords: [50.2195, 12.8814],
        img: "칼스바트 호텔 펍.png"
    },
    {
        cityId: "dresden",
        name: "카톨릭 궁정교회 (Katholische Hofkirche)",
        cat: "church",
        desc: "드레스덴의 카톨릭 궁정교회는 작센 선제후가 건립한 대성당으로, 실버만이 제작한 오르간이 설치되어 있습니다. 바흐는 드레스덴 방문 시 실버만의 오르간으로 시연회를 열어 압도적인 연주력을 뿌냈습니다.",
        coords: [51.0536, 13.7369],
        img: "드레스덴 카톨릭 궁정 교회.png"
    },
    {
        cityId: "halle",
        name: "마르크트 교회 (Marktkirche Unser Lieben Frauen)",
        cat: "church",
        desc: "할레 마르크트 광장의 성모 마르크트 교회는, 빌헬름 프리데만 바흐가 오르가니스트이자 음악감독으로 약 18년간 봉직한 바로 그 '성모교회(리프프라우엔키르헤)'입니다. 아버지 바흐도 아들을 보러 이곳을 여러 차례 방문했으며, 바흐 가문의 음악적 유산이 깊이 서린 장소입니다.",
        coords: [51.4808, 11.9696],
        img: "할레 마르크트 교회.png"
    }
];

let currentCityData = null;
let currentActiveTouristSpot = null;

function updateTimeline(city) {
    if (!timelineProgress) return;

    // Clear any previous pre-birth diamond glow
    document.querySelectorAll('.timeline-prebirth-marker.active-diamond').forEach(m => m.classList.remove('active-diamond'));

    // Parse period string, e.g., "1685 - 1695 (0-10세)" or "1705 (20세)"
    const periodStr = city.period;
    const yearMatch = periodStr.match(/\d{4}/g);

    // Pre-birth cities (no 4-digit year in period) — glow diamond instead of progress bar
    if (!yearMatch || yearMatch.length === 0) {
        timelineProgress.style.width = '0%';
        timelineProgress.style.background = '';
        if (timelineAgeLabel) timelineAgeLabel.textContent = '';
        const diamond = document.querySelector(`.timeline-prebirth-marker[data-city-id="${city.id}"]`);
        if (diamond) diamond.classList.add('active-diamond');
        return;
    }

    if (yearMatch.length > 0) {
        const startYear = parseInt(yearMatch[0]);
        // If there's a second year it's a range, else point in time (1 year duration)
        const endYear = yearMatch.length > 1 ? parseInt(yearMatch[1]) : startYear + 1;

        const bachBirth = 1685;
        const bachDeath = 1750;
        const totalLife = bachDeath - bachBirth;

        const leftPercent = ((startYear - bachBirth) / totalLife) * 100;
        const realWidth = ((endYear - startYear) / totalLife) * 100;
        // Ensure minimum width for visibility even for 1-year stays
        const widthPercent = Math.max(1.5, realWidth);

        // For branch cities with short stays, center the progress bar on the diamond marker
        if (city.isBranch && realWidth < 3) {
            timelineProgress.style.left = `${leftPercent - widthPercent / 2}%`;
        } else {
            timelineProgress.style.left = `${leftPercent}%`;
        }
        timelineProgress.style.width = `${widthPercent}%`;

        // Striped progress bar for cities with multiple visits
        if (city.id === 'hamburg' || city.id === 'celle' || city.id === 'dresden') {
            timelineProgress.style.background = 'repeating-linear-gradient(90deg, rgba(212,175,55,1) 0px, rgba(212,175,55,1) 3px, rgba(140,115,30,0.6) 3px, rgba(140,115,30,0.6) 6px)';
        } else {
            timelineProgress.style.background = '';
        }

        // Extract the age part, e.g. "(0-10세)"
        const ageMatch = periodStr.match(/\((.*?)\)/);
        if (ageMatch && timelineAgeLabel) {
            timelineAgeLabel.textContent = `당시 연령: ${ageMatch[1]}`;
        }
    }
}

// 5. Add Markers and Journey Line
const journeyColors = [
    '#ffffff', // 1. Eisenach (White start)
    '#fffacd', // 2. Ohrdruf (Pastel light yellow)
    '#ffeb99', // 3. Lüneburg (Pastel yellow)
    '#d9f0a3', // 4. Celle (Pastel yellow-green)
    '#ccffcc', // 5. Hamburg (Pastel light green)
    '#b8e0b8', // 6. Arnstadt (Pastel light green)
    '#99d6d6', // 7. Lübeck (Pastel mint/blue-green)
    '#80bfff', // 8. Mühlhausen (Pastel light blue)
    '#99ccff', // 9. Dornheim (Pastel medium blue)
    '#a3c2fa', // 10. Weimar (Pastel soft blue)
    '#c2b3ff', // 11. Köthen (Pastel periwinkle/purple-blue)
    '#d699ff', // 12. Carlsbad (Pastel light purple)
    '#e6b3ff', // 13. Leipzig (Pastel soft lavender)
    '#f0c2ff'  // 14. Potsdam (Pastel pale pink/purple)
];

// Global array to store marker references
const cityMarkers = {};

// Tracks all pending map-flight timeouts so a new city click can cancel them
let pendingFlightTimeouts = [];

function _flightTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    pendingFlightTimeouts.push(id);
    return id;
}

function viewCity(city) {
    // Cancel any in-progress map animation and queued flight timeouts
    map.stop();
    pendingFlightTimeouts.forEach(clearTimeout);
    pendingFlightTimeouts = [];

    currentCityData = city;
    currentActiveTouristSpot = null; // Reset tourist spot focus on new city view

    // Hide tourist info panel from previous city
    const touristPanel = document.getElementById('tourist-info-panel');
    if (touristPanel) touristPanel.style.display = 'none';

    // Hide placeholder and intro, show active content
    placeholderState.classList.add('hidden');
    const introSection = document.getElementById('intro-section');
    if (introSection) introSection.classList.add('hidden');

    // Fade out the panel, then swap content after short delay
    if (!activeState.classList.contains('hidden')) {
        // Already visible — fade out first
        activeState.style.opacity = '0';
        activeState.style.transform = 'translateY(6px)';
    } else {
        activeState.classList.add('hidden');
    }

    // Narrate text (Must be synchronous with click event)
    speakCity(city.id);

    // Pause all current audio
    bgAudio.pause();
    bgAudio.src = "";

    clearFadeOutTimers();
    if (ytPlayerReady) {
        ytPlayer.stopVideo();
    }
    currentYoutubeId = '';

    // Auto-adjust master volume for Dornheim to prevent lyrics from clashing with TTS
    if (city.id === 'dornheim') {
        userMusicSliderValue = 30; // Reduce volume for Dornheim (default 50)
    } else {
        userMusicSliderValue = 50; // Reset to medium for other cities
    }

    if (musicVolumeSlider) {
        musicVolumeSlider.value = userMusicSliderValue;
    }
    updateBgAudioVolume();

    // Change and play background music
    if (city.audio) {
        bgAudio.src = city.audio;
        if (musicEnabled && audioUnlocked) {
            bgAudio.play().catch(e => console.error("Could not play audio due to browser policy:", e));
        }
    } else if (city.youtubeId) {
        currentYoutubeId = city.youtubeId;
        currentVolumeLevel = city.youtubeVolume || 100; // Track's base limit

        if (ytPlayerReady) {
            ytPlayer.setVolume(getActualYouTubeVolume());
            if (musicEnabled && audioUnlocked) {
                ytPlayer.loadVideoById({
                    videoId: city.youtubeId,
                    startSeconds: city.youtubeStart || 0
                });
            } else {
                ytPlayer.cueVideoById({
                    videoId: city.youtubeId,
                    startSeconds: city.youtubeStart || 0
                });
            }
        }
    }

    _flightTimeout(() => {

        cityNameEl.textContent = city.nameKR;
        cityGermanNameEl.textContent = city.nameDE;

        if (cityNavButtonsEl) {
            cityNavButtonsEl.innerHTML = '';
            if (city.next && city.next.length > 0) {
                city.next.forEach(navData => {
                    const btn = document.createElement('button');
                    btn.className = 'nav-btn';
                    if (navData.isBranch) btn.classList.add('branch-btn');
                    btn.innerHTML = navData.label;
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const targetCity = citiesData.find(c => c.id === navData.id);
                        if (targetCity) viewCity(targetCity);
                    });
                    cityNavButtonsEl.appendChild(btn);
                });
            }
        }

        const periodWithoutAge = city.period.replace(/\s*\([^)]*\)/, '');
        if (city.badge && Array.isArray(city.badge)) {
            const badgesHtml = city.badge.map(b => `<span class="city-badge">${b}</span>`).join('');
            cityPeriodEl.innerHTML = `${periodWithoutAge} ${badgesHtml}`;
        } else if (city.badge) {
            cityPeriodEl.innerHTML = `${periodWithoutAge} <span class="city-badge">${city.badge}</span>`;
        } else {
            cityPeriodEl.textContent = periodWithoutAge;
        }

        cityDescEl.innerHTML = applyGlossary(linkifyCityNames(city.desc));

        // Mobile: replace intro text with city info header
        const introSection = document.getElementById('intro-section');
        const descHeader = document.querySelector('.description-header');
        if (window.innerWidth <= 900 && introSection) {
            const badgesHtml = (city.badge && Array.isArray(city.badge))
                ? city.badge.map(b => `<span class="city-badge">${b}</span>`).join('')
                : (city.badge ? `<span class="city-badge">${city.badge}</span>` : '');
            const periodWithoutAge = city.period.replace(/\s*\([^)]*\)/, '');
            introSection.querySelector('.intro-title').innerHTML = badgesHtml;
            introSection.querySelector('.intro-subtitle').innerHTML = `${city.nameKR} <span style="color:#999;margin-left:4px;">${city.nameDE}</span><span style="color:#ccc;margin-left:10px;font-weight:500;">${periodWithoutAge}</span>`;
            if (descHeader) descHeader.classList.add('mobile-hidden');
        }
        cityImageEl.src = city.img;
        cityImageEl.alt = `${city.nameKR} 풍경 사진`;

        const imgAttributionEl = document.getElementById('city-image-attribution');
        if (imgAttributionEl) {
            if (city.imgAttribution) {
                imgAttributionEl.innerHTML = city.imgAttribution;
                imgAttributionEl.style.display = 'block';
            } else {
                imgAttributionEl.style.display = 'none';
            }
        }

        setTickerText(city.audioTitle || "재생 중인 배경음악 없음");

        const attributionEl = document.getElementById('city-audio-attribution');
        if (attributionEl) {
            if (city.audioAttribution) {
                attributionEl.textContent = city.audioAttribution;
                attributionEl.style.display = 'block';
            } else {
                attributionEl.style.display = 'none';
            }
        }

        updateTimeline(city);

        // --- Influencer Cards Update (supports multiple) ---
        const infContainer = document.getElementById('influencer-cards-container');
        if (infContainer) {
            infContainer.innerHTML = '';
            // Normalize: support both single 'influencer' and array 'influencers'
            let influencers = [];
            if (city.influencers && city.influencers.length > 0) {
                influencers = city.influencers;
            } else if (city.influencer) {
                influencers = [city.influencer];
            }

            // Compact mode for cities with many influencers
            const isCompact = influencers.length > 5;
            if (isCompact) {
                infContainer.classList.add('compact');
            } else {
                infContainer.classList.remove('compact');
            }
            const cardSpacing = isCompact ? 44 : 80;

            influencers.forEach((inf, idx) => {
                const card = document.createElement('div');
                card.className = 'influencer-card';
                card.style.top = `calc(50% + ${(idx - (influencers.length - 1) / 2) * cardSpacing}px)`;
                if (isCompact) {
                    card.innerHTML = `
                        <div class="inf-card-img-wrap">
                            <img src="${inf.img}" alt="${inf.name}">
                        </div>
                        <div class="inf-card-content">
                            <div class="inf-card-name">${inf.name}</div>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="inf-card-img-wrap">
                            <img src="${inf.img}" alt="${inf.name}">
                        </div>
                        <div class="inf-card-content">
                            <div class="inf-card-badge">${inf.identity}</div>
                            <div class="inf-card-name">${inf.name}</div>
                        </div>
                    `;
                }
                card.addEventListener('click', () => openInfluencerModal(inf));
                infContainer.appendChild(card);
            });
        }

        // --- Masterwork Badges ---
        const mwSection = document.getElementById('masterworks-section');
        if (mwSection) {
            mwSection.innerHTML = '';
            if (city.masterworks && city.masterworks.length > 0) {
                city.masterworks.forEach(mw => {
                    const wrap = document.createElement('div');
                    wrap.className = 'masterwork-badge-wrap';

                    const badge = document.createElement('button');
                    badge.className = 'masterwork-badge';
                    badge.innerHTML = `
                        <span class="mw-emoji">${mw.emoji}</span>
                        <span class="mw-title">${mw.title}</span>
                        <span class="mw-bwv">${mw.bwv}</span>
                        ${mw.youtubeId ? '<span class="mw-music-icon">🎵</span>' : ''}
                        <span class="mw-arrow">▶</span>
                    `;

                    const card = document.createElement('div');
                    card.className = 'masterwork-card';
                    const ytLink = mw.youtubeId ? `<a href="#" class="mw-yt-link" onclick="openYouTubeLink('${mw.youtubeId}', event); return false;" title="YouTube에서 전곡 감상"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21.8 8s-.2-1.4-.8-2c-.7-.7-1.5-.7-1.9-.8C16.5 5 12 5 12 5s-4.5 0-7.1.2c-.4.1-1.2.1-1.9.8-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.7 1.7.7 2.1.8 1.5.1 6.9.2 6.9.2s4.5 0 7.1-.2c.4-.1 1.2-.1 1.9-.8.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM9.9 15.1V8.9l5.1 3.1-5.1 3.1z"/></svg> YouTube에서 전곡 감상</a>` : '';
                    card.innerHTML = `<p class="mw-desc">${applyGlossary(mw.desc)}</p>${ytLink}`;

                    badge.addEventListener('click', () => {
                        // Mobile: open modal overlay
                        if (window.innerWidth <= 900) {
                            openMasterworkModal(mw);
                            return;
                        }
                        // Desktop: accordion toggle
                        const isOpen = badge.classList.contains('open');
                        mwSection.querySelectorAll('.masterwork-badge.open').forEach(b => b.classList.remove('open'));
                        mwSection.querySelectorAll('.masterwork-card.open').forEach(c => c.classList.remove('open'));
                        if (!isOpen) {
                            badge.classList.add('open');
                            card.classList.add('open');
                            if (mw.youtubeId) {
                                playMasterworkMusic(mw);
                            }
                        }
                    });

                    wrap.appendChild(badge);
                    wrap.appendChild(card);
                    mwSection.appendChild(wrap);

                    // Bind person-link click handlers within the masterwork card
                    if (mw.personLinks) {
                        card.querySelectorAll('.person-link').forEach(link => {
                            link.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const personKey = link.dataset.person;
                                const personData = mw.personLinks[personKey];
                                if (personData) {
                                    openInfluencerModal(personData);
                                }
                            });
                        });
                    }
                });
            }
        }

        // Show panel + force animation restart via panel-entering
        activeState.style.opacity = '';
        activeState.style.transform = '';
        activeState.classList.remove('hidden');
        activeState.classList.remove('panel-entering');
        void activeState.offsetWidth; // force reflow to restart CSS animations
        activeState.classList.add('panel-entering');
        setTimeout(() => activeState.classList.remove('panel-entering'), 1000);

        // --- Marker Highlighting ---

        // Remove active class from all markers
        Object.values(cityMarkers).forEach(marker => {
            const iconDiv = marker.getElement()?.querySelector('.bach-marker');
            if (iconDiv) iconDiv.classList.remove('active-marker');

            // Remove from tooltip as well
            const tooltip = marker.getTooltip();
            if (tooltip && tooltip.getElement()) {
                tooltip.getElement().classList.remove('active-tooltip');
            }
        });

        // Add active class to current marker
        if (cityMarkers[city.id]) {
            const currentMarker = cityMarkers[city.id];

            const currentIconDiv = currentMarker.getElement()?.querySelector('.bach-marker');
            if (currentIconDiv) {
                currentIconDiv.classList.add('active-marker');
                // Ensure the active marker is brought to the front
                currentIconDiv.style.zIndex = 1000;
            }

            const currentTooltip = currentMarker.getTooltip();
            if (currentTooltip && currentTooltip.getElement()) {
                currentTooltip.getElement().classList.add('active-tooltip');
            }
        }

        // Calculate the center point, taking the side panel width into account
        const isDesktop = window.innerWidth > 900;

        // ── STEP 1: 독일 전경 줌아웃 – 3초에 걸쳐 천천히 후퇴 ──
        const germanyCenter = [51.5, 11.0];
        map.flyTo(germanyCenter, 6, {
            animate: true,
            duration: 3.0   // 막 1: 3초간 아주 우아하게 줌아웃
        });

        // ── STEP 2: 전경에서 1초 여운 후 도시로 날아가기 ──
        // 3s 줌아웃 + 1s 정박 = 4초 후 출발
        _flightTimeout(() => {
            let targetPoint = map.project(city.coords, 19);

            if (isDesktop) {
                targetPoint.x += 225;
            }

            const offsetLatLng19 = map.unproject(targetPoint, 19);

            // 막 2: 2초에 걸쳐 도시로 시원하게 날아감
            map.flyTo(offsetLatLng19, 19, {
                animate: true,
                duration: 2.0
            });

            // After the first flight, zoom dynamically to fit tourist markers
            _flightTimeout(() => {
                const spotCityId = city.id === 'weimar1' ? 'weimar' : city.id;
                const citySpots = touristSpotsData.filter(s => s.cityId === spotCityId);
                // Timeline bar height offset (px) to avoid markers hiding behind it
                const timelineHeight = document.querySelector('.timeline-container')?.offsetHeight || 70;
                if (citySpots.length > 0) {
                    const bounds = L.latLngBounds([city.coords, city.coords]);
                    citySpots.forEach(spot => bounds.extend(spot.coords));

                    const paddedBounds = bounds.pad(0.15);
                    const center = bounds.getCenter();

                    let targetZoom = map.getBoundsZoom(paddedBounds, false, L.point(isDesktop ? 450 : 0, timelineHeight));
                    if (targetZoom > 18) targetZoom = 18;

                    let targetPoint = map.project(center, targetZoom);
                    if (isDesktop) targetPoint.x += 225;
                    targetPoint.y -= timelineHeight / 2;  // shift center down to clear timeline

                    const offsetCenter = map.unproject(targetPoint, targetZoom);

                    map.flyTo(offsetCenter, targetZoom, {
                        animate: true,
                        duration: 2.0   // 막 3: 우아하게 2초
                    });
                } else {
                    let targetZoom = 17;
                    let targetPoint = map.project(city.coords, targetZoom);
                    if (isDesktop) targetPoint.x += 225;
                    targetPoint.y -= timelineHeight / 2;  // shift center down to clear timeline
                    const offsetLatLng = map.unproject(targetPoint, targetZoom);
                    map.flyTo(offsetLatLng, targetZoom, {
                        animate: true,
                        duration: 2.0
                    });
                }
            }, 6000); // wait for city zoom-in to complete
        }, 8500); // wait for Germany overview animation

    }, 200); // wait for fade-out to complete

}

// Function to generate points for a curved path (quadratic Bezier)
function getBezierCurve(start, end, segments = 50) {
    const points = [];
    const lat1 = start[0], lng1 = start[1];
    const lat2 = end[0], lng2 = end[1];

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // Control point offset for gently curved sweeping arcs
    const offsetFactor = 0.15;
    const ctrlLat = midLat - dLng * offsetFactor;
    const ctrlLng = midLng + dLat * offsetFactor;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const lat = Math.pow(1 - t, 2) * lat1 + 2 * (1 - t) * t * ctrlLat + Math.pow(t, 2) * lat2;
        const lng = Math.pow(1 - t, 2) * lng1 + 2 * (1 - t) * t * ctrlLng + Math.pow(t, 2) * lng2;
        points.push([lat, lng]);
    }
    return points;
}

// Add markers and lines
for (let i = 0; i < citiesData.length; i++) {
    const city = citiesData[i];
    const cityColor = journeyColors[i] || '#d4af37';

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class='bach-marker' style='width:16px; height:16px; border-radius:50%; --marker-color: ${cityColor};'></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const marker = L.marker(city.coords, { icon: customIcon }).addTo(map);

    marker.bindTooltip(city.nameKR, {
        permanent: true,
        interactive: true,
        direction: city.id === 'dornheim' ? 'bottom' : 'top',
        className: 'city-tooltip',
        offset: city.id === 'dornheim' ? [0, 10] : [0, -10]
    });

    marker.on('click', () => {
        viewCity(city);
    });

    // Store marker in global object for active class toggling
    cityMarkers[city.id] = marker;

    if (i > 0) {
        // Skip drawing lines for cities that should have no map connections
        if (city.id === 'milan' || city.id === 'london' || city.id === 'wechmar' || city.id === 'erfurt' || city.id === 'eisenach') {
            // No Bezier curve for these cities
        } else {
            const prevCity = citiesData[i - 1];

            // Ensure branches originate from their correct divergence point, not chronologically previous
            let startCoords = prevCity.coords;
            let isDashed = false;

            // Logical overrides for narrative branching rather than straight chronological line
            if (city.id === 'wechmar') {
                startCoords = citiesData.find(c => c.id === 'eisenach').coords;
                isDashed = true; // Branch
            } else if (city.id === 'erfurt') {
                startCoords = citiesData.find(c => c.id === 'wechmar').coords;
                isDashed = true; // Branch
            } else if (city.id === 'celle') {
                startCoords = citiesData.find(c => c.id === 'lueneburg').coords;
                isDashed = true; // Branch
            } else if (city.id === 'hamburg') {
                startCoords = citiesData.find(c => c.id === 'lueneburg').coords;
                isDashed = true;
            } else if (city.id === 'luebeck') {
                startCoords = citiesData.find(c => c.id === 'arnstadt').coords;
                isDashed = true;
            } else if (city.id === 'dornheim') {
                startCoords = citiesData.find(c => c.id === 'muehlhausen').coords;
                isDashed = true;
            } else if (city.id === 'carlsbad') {
                startCoords = citiesData.find(c => c.id === 'koethen').coords;
                isDashed = true;
            } else if (city.id === 'potsdam') {
                startCoords = citiesData.find(c => c.id === 'leipzig').coords;
                isDashed = true;
            } else if (city.id === 'halle') {
                startCoords = citiesData.find(c => c.id === 'leipzig').coords;
                isDashed = true;
            } else if (city.id === 'dresden') {
                startCoords = citiesData.find(c => c.id === 'leipzig').coords;
                isDashed = true;
            }

            // Only draw from previous if it's the main timeline resuming from a branch
            // For example, Arnstadt (5) should come from Lüneburg (3), not Celle (4)
            if (city.id === 'ohrdruf') startCoords = citiesData.find(c => c.id === 'eisenach').coords;
            if (city.id === 'weimar1') startCoords = citiesData.find(c => c.id === 'lueneburg').coords;
            if (city.id === 'arnstadt') startCoords = citiesData.find(c => c.id === 'weimar1').coords;
            if (city.id === 'muehlhausen') startCoords = citiesData.find(c => c.id === 'arnstadt').coords;
            if (city.id === 'weimar') startCoords = citiesData.find(c => c.id === 'muehlhausen').coords;
            if (city.id === 'leipzig') startCoords = citiesData.find(c => c.id === 'koethen').coords;

            // Draw curved line using generated Bezier points
            const curvePoints = getBezierCurve(startCoords, city.coords);

            // Map the gradient using colors
            const lineOptions = {
                color: cityColor,
                weight: isDashed ? 2 : 3,
                opacity: isDashed ? 0.6 : 0.8,
                dashArray: isDashed ? '5, 10' : null,
                lineCap: 'round',
                lineJoin: 'round'
            };

            L.polyline(curvePoints, lineOptions).addTo(map);


        } // end else (not milan/london)
    } // end if (i > 0)
} // end for loop

// Add Tourist Spot Markers
const touristLayerGroup = L.layerGroup();

touristSpotsData.forEach((spot) => {
    // Category-specific icon designs
    const catConfig = {
        church: { color: '#d4af37', symbol: '<path d="M12 3v2M10.5 5h3M12 5v3L9 11v7h6v-7L12 8z" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.15)"/><path d="M6 14l3-3v7H6zM18 14l-3-3v7h3z" stroke="#fff" stroke-width="1" fill="rgba(255,255,255,0.1)"/><line x1="5" y1="18" x2="19" y2="18" stroke="#fff" stroke-width="1.2"/>' },
        home: { color: '#c97b84', symbol: '<path d="M12 4L5 10v8h4v-4h6v4h4v-8L12 4z" stroke="#fff" stroke-width="1.2" fill="rgba(255,255,255,0.15)"/>' },
        museum: { color: '#6ba3be', symbol: '<path d="M12 4L5 8v1h14V8L12 4zM6 10v6M10 10v6M14 10v6M18 10v6M5 17h14" stroke="#fff" stroke-width="1.2" stroke-linecap="round" fill="none"/>' },
        statue: { color: '#6dab7f', symbol: '<circle cx="12" cy="6" r="2" stroke="#fff" stroke-width="1.2" fill="rgba(255,255,255,0.2)"/><path d="M12 8v5M9 19l3-6 3 6M8 13h8" stroke="#fff" stroke-width="1.2" stroke-linecap="round" fill="none"/>' },
        palace: { color: '#9b7cc4', symbol: '<path d="M6 14h12v4H6zM8 10h8v4H8zM10 7h4v3h-4z" stroke="#fff" stroke-width="1.2" fill="rgba(255,255,255,0.12)"/><path d="M12 4l-2 3h4l-2-3z" fill="#fff" opacity="0.8"/>' },
        spa: { color: '#5ea8a0', symbol: '<path d="M12 4c-2 3-5 5-5 8a5 5 0 0010 0c0-3-3-5-5-8z" stroke="#fff" stroke-width="1.2" fill="rgba(255,255,255,0.15)"/><circle cx="12" cy="13" r="1.2" fill="#fff" opacity="0.7"/>' }
    };
    const cat = catConfig[spot.cat] || catConfig.church;

    const svgIcon = `
        <svg viewBox="0 0 28 28" width="22" height="22" class="tourist-icon-svg">
            <circle cx="14" cy="14" r="12" fill="${cat.color}" opacity="0.85" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
            <g transform="translate(2,2)">${cat.symbol}</g>
        </svg>
    `;

    const touristIcon = L.divIcon({
        className: 'custom-div-icon tourist-div-icon tourist-cat-' + (spot.cat || 'church'),
        html: svgIcon,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const marker = L.marker(spot.coords, { icon: touristIcon });
    touristLayerGroup.addLayer(marker);

    // Format the tooltip to show only the Korean name (strip German in parentheses)
    const displayName = spot.name.split(' (')[0];
    const tooltipContent = `
        <div class="tourist-tooltip-content">
            <div class="tourist-name">${displayName}</div>
        </div>
    `;

    marker.bindTooltip(tooltipContent, {
        permanent: true, // Show permanently when city is selected
        interactive: true, // Allow clicks on the tooltip itself
        direction: 'top',
        className: 'tourist-tooltip',
        offset: [0, -10],
        pane: 'popupPane' // Render in popupPane (z-index 700) to overlay city tooltips (pane: tooltipPane z-index 650)
    });

    // Make sure tooltip is fully visible, pan map if necessary when opened
    marker.on('tooltipopen', function (e) {
        const tooltipEl = e.tooltip.getElement();
        if (!tooltipEl || !map) return;

        const tooltipRect = tooltipEl.getBoundingClientRect();
        const mapRect = map.getContainer().getBoundingClientRect();

        const padding = 15; // safe padding

        let xOffset = 0;
        let yOffset = 0;

        if (tooltipRect.right > mapRect.right - padding) {
            xOffset = tooltipRect.right - (mapRect.right - padding);
        } else if (tooltipRect.left < mapRect.left + padding) {
            xOffset = tooltipRect.left - (mapRect.left + padding);
        }

        if (tooltipRect.top < mapRect.top + padding) {
            yOffset = tooltipRect.top - (mapRect.top + padding);
        } else if (tooltipRect.bottom > mapRect.bottom - padding) {
            yOffset = tooltipRect.bottom - (mapRect.bottom - padding);
        }

        if (xOffset !== 0 || yOffset !== 0) {
            map.panBy([xOffset, yOffset], { animate: true, duration: 0.3 });
        }
    });

    // Center map on the spot without zooming out, and highlight it
    marker.on('click', () => {
        currentActiveTouristSpot = spot; // Track the currently clicked tourist spot

        // Remove active class from all tourist markers
        document.querySelectorAll('.tourist-div-icon').forEach(icon => {
            icon.classList.remove('active-tourist');
        });

        // Add active class to this marker
        const iconElement = marker.getElement();
        if (iconElement) {
            iconElement.classList.add('active-tourist');
        }

        // Show tourist info in the side panel
        const touristPanel = document.getElementById('tourist-info-panel');
        const touristPanelName = document.getElementById('tourist-panel-name');
        const touristPanelDesc = document.getElementById('tourist-panel-desc');

        // Mobile: open modal overlay instead
        if (window.innerWidth <= 900) {
            openTouristModal(spot);
        } else if (touristPanel && touristPanelName && touristPanelDesc) {
            // Desktop: inline panel
            // Collapse any open masterwork cards so tourist description is visible
            const mwSection = document.getElementById('masterworks-section');
            if (mwSection) {
                mwSection.querySelectorAll('.masterwork-badge.open').forEach(b => b.classList.remove('open'));
                mwSection.querySelectorAll('.masterwork-card.open').forEach(c => c.classList.remove('open'));
            }
            touristPanelName.textContent = spot.name;
            touristPanelDesc.innerHTML = spot.desc;
            touristPanel.style.display = 'block';

            // Re-trigger animation by re-appending
            touristPanel.style.animation = 'none';
            touristPanel.offsetHeight; /* trigger reflow */
            touristPanel.style.animation = null;
        }

        // Center calculation with offsets
        const currentZoom = map.getZoom();
        const targetZoom = Math.max(currentZoom, 15); // Don't zoom out if already zoomed in further

        const isDesktop = window.innerWidth > 900;
        let targetPoint = map.project(spot.coords, targetZoom);

        if (isDesktop) {
            targetPoint.x += 225; // Shift map right to push marker left
        }

        const offsetCenter = map.unproject(targetPoint, targetZoom);

        map.flyTo(offsetCenter, targetZoom, { animate: true, duration: 1.0 });

        // Smooth image transition if the tourist spot has an image
        if (spot.img) {
            const cityImage = document.getElementById('city-image');
            if (cityImage) {
                const newImgUrl = new URL(spot.img, document.baseURI).href;
                if (cityImage.src !== newImgUrl) {
                    cityImage.style.transition = 'opacity 0.5s ease';
                    cityImage.style.opacity = '0';

                    setTimeout(() => {
                        cityImage.src = spot.img;
                        cityImage.style.opacity = '1';
                    }, 500);
                }
            }
        }
    });
});


// Update visibility based on zoom level (visible when zoomed in closely)
function updateTouristMarkersVisibility() {
    const currentZoom = map.getZoom();
    const visibilityThreshold = 12; // Zoom level at which city details/roads become visible

    if (currentZoom >= visibilityThreshold) {
        if (!map.hasLayer(touristLayerGroup)) {
            map.addLayer(touristLayerGroup);
        }
    } else {
        if (map.hasLayer(touristLayerGroup)) {
            map.removeLayer(touristLayerGroup);
        }
    }
}

// Listen to zoom changes
map.on('zoomend', updateTouristMarkersVisibility);

// Initial visibility check
updateTouristMarkersVisibility();

// --- Influencer Card Interaction ---
window.handleInfluencerCardClick = function () {
    const infCard = document.getElementById('influencer-card');
    if (infCard && infCard.dataset.currentInfluencer) {
        const influencerData = JSON.parse(infCard.dataset.currentInfluencer);
        openInfluencerModal(influencerData);
    }
};

// --- Modal Functions ---
window.openInfluencerModal = function (inf) {
    const overlay = document.getElementById('influencer-overlay');
    const nameEl = document.getElementById('influencer-name');
    const badgeEl = document.getElementById('influencer-badge');
    const yearsEl = document.getElementById('influencer-years');
    const descEl = document.getElementById('influencer-desc');
    const imgEl = document.getElementById('influencer-img');

    if (overlay && nameEl && badgeEl && descEl && imgEl) {
        nameEl.textContent = inf.name;
        badgeEl.textContent = inf.identity;
        if (yearsEl) {
            yearsEl.textContent = inf.years || '';
            yearsEl.style.display = inf.years ? 'block' : 'none';
        }
        descEl.innerHTML = applyGlossary(linkifyCityNames(inf.desc));
        imgEl.src = inf.img;

        overlay.classList.add('show');
    }
};

window.closeInfluencerModal = function () {
    const overlay = document.getElementById('influencer-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
};

// --- Masterwork Modal Functions ---
window.openMasterworkModal = function (mw) {
    const overlay = document.getElementById('masterwork-overlay');
    const emojiEl = document.getElementById('mw-modal-emoji');
    const titleEl = document.getElementById('mw-modal-title');
    const bwvEl = document.getElementById('mw-modal-bwv');
    const descEl = document.getElementById('mw-modal-desc');
    const ytEl = document.getElementById('mw-modal-yt');

    if (overlay && titleEl && descEl) {
        emojiEl.textContent = mw.emoji;
        titleEl.textContent = mw.title;
        bwvEl.textContent = mw.bwv;
        descEl.innerHTML = `<p style="margin:0">${applyGlossary(mw.desc)}</p>`;

        if (mw.youtubeId) {
            ytEl.innerHTML = `<a href="#" onclick="openYouTubeLink('${mw.youtubeId}', event); return false;" title="YouTube에서 전곡 감상"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21.8 8s-.2-1.4-.8-2c-.7-.7-1.5-.7-1.9-.8C16.5 5 12 5 12 5s-4.5 0-7.1.2c-.4.1-1.2.1-1.9.8-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.7 1.7.7 2.1.8 1.5.1 6.9.2 6.9.2s4.5 0 7.1-.2c.4-.1 1.2-.1 1.9-.8.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM9.9 15.1V8.9l5.1 3.1-5.1 3.1z"/></svg> YouTube에서 전곡 감상</a>`;
            ytEl.style.display = 'block';
            playMasterworkMusic(mw);
        } else {
            ytEl.innerHTML = '';
            ytEl.style.display = 'none';
        }

        // Bind person-link click handlers
        if (mw.personLinks) {
            setTimeout(() => {
                descEl.querySelectorAll('.person-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const personKey = link.dataset.person;
                        const personData = mw.personLinks[personKey];
                        if (personData) {
                            closeMasterworkModal();
                            openInfluencerModal(personData);
                        }
                    });
                });
            }, 50);
        }

        overlay.classList.add('active');

        // Click overlay backdrop to close
        overlay.onclick = function (e) {
            if (e.target === overlay) closeMasterworkModal();
        };
    }
};

window.closeMasterworkModal = function () {
    const overlay = document.getElementById('masterwork-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

// --- Tourist Spot Modal Functions ---
window.openTouristModal = function (spot) {
    const overlay = document.getElementById('tourist-overlay');
    const imgWrap = document.getElementById('tourist-modal-img-wrap');
    const imgEl = document.getElementById('tourist-modal-img');
    const nameEl = document.getElementById('tourist-modal-name');
    const descEl = document.getElementById('tourist-modal-desc');

    if (overlay && nameEl && descEl) {
        nameEl.textContent = spot.name;
        descEl.innerHTML = spot.desc;

        if (spot.img && imgWrap && imgEl) {
            imgEl.src = spot.img;
            imgEl.alt = spot.name;
            imgWrap.style.display = 'block';
        } else if (imgWrap) {
            imgWrap.style.display = 'none';
        }

        overlay.classList.add('active');

        overlay.onclick = function (e) {
            if (e.target === overlay) closeTouristModal();
        };
    }
};

window.closeTouristModal = function () {
    const overlay = document.getElementById('tourist-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

function moveNext() {
    if (currentIndex < citiesData.length - 1) {
        currentIndex++;
        const targetCity = citiesData[currentIndex];
        viewCity(targetCity);
    }
}

// Replay TTS button
if (replayTtsBtn) {
    replayTtsBtn.addEventListener('click', () => {
        if (currentCityData) {
            speakCity(currentCityData.id);
        }
    });
}

// Duplicate loops removed to fix double tooltips

// Center map on Weimar initially (heart of Bach's German cities)
const WEIMAR_COORDS = [50.980, 11.329];
const INITIAL_ZOOM = 7;

// Helper: center map on coords accounting for panel overlap
function centerMapOnVisible(coords, zoom) {
    const isMobile = window.innerWidth <= 900;
    map.setView(coords, zoom, { animate: false });
    if (isMobile) {
        // Mobile: panel covers bottom 60vh, map is top 40vh — map container is already sized, no offset needed
    } else {
        // Desktop: info panel covers 450px on the right
        const panelWidth = 450;
        map.panBy([panelWidth / 2, 0], { animate: false });
    }
}

centerMapOnVisible(WEIMAR_COORDS, INITIAL_ZOOM);

// Re-center map on resize
window.addEventListener('resize', () => {
    map.invalidateSize();
    if (currentCityData) {
        centerMapOnVisible(currentCityData.coords, map.getZoom());
    } else {
        centerMapOnVisible(WEIMAR_COORDS, INITIAL_ZOOM);
    }
});

// Initialize City Selection Grid
const initCityGrid = document.getElementById('init-city-grid');
if (initCityGrid) {
    citiesData.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'init-city-btn';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'init-city-btn-name';
        nameSpan.textContent = city.nameKR;

        btn.appendChild(nameSpan);

        btn.addEventListener('click', () => {
            viewCity(city);
        });

        initCityGrid.appendChild(btn);
    });
}

// Load voices initially
loadVoices();

// Helper to update the music ticker text
function setTickerText(text) {
    const tickerEl = document.getElementById('music-ticker-text');
    if (tickerEl) {
        tickerEl.textContent = text;
    }
}

// 6. Masterwork Music Player
function playMasterworkMusic(mw) {
    if (!mw.youtubeId) return;

    // Stop current background music (HTML5 Audio)
    if (bgAudio) {
        bgAudio.pause();
        bgAudio.src = "";
    }

    // Update YouTube player with masterwork music
    currentYoutubeId = mw.youtubeId;
    currentVolumeLevel = mw.youtubeVolume || 100;

    if (ytPlayerReady && ytPlayer) {
        ytPlayer.setVolume(getActualYouTubeVolume());
        if (musicEnabled && audioUnlocked) {
            ytPlayer.loadVideoById({
                videoId: mw.youtubeId,
                startSeconds: mw.youtubeStart || 0
            });
        } else {
            ytPlayer.cueVideoById({
                videoId: mw.youtubeId,
                startSeconds: mw.youtubeStart || 0
            });
        }
    }

    // Update ticker text
    setTickerText(mw.audioTitle || "재생 중인 곡 정보 없음");
}

// Handle Window Resize to keep the map centered correctly
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentActiveTouristSpot) {
            // Re-center on the active tourist spot
            const currentZoom = map.getZoom();
            const targetZoom = Math.max(currentZoom, 15);

            const isDesktop = window.innerWidth > 900;
            let targetPoint = map.project(currentActiveTouristSpot.coords, targetZoom);

            if (isDesktop) {
                targetPoint.x += 225;
            }

            const offsetCenter = map.unproject(targetPoint, targetZoom);
            map.setView(offsetCenter, targetZoom, { animate: false }); // Immediate centering
        } else if (currentCityData && !document.getElementById('active-state').classList.contains('hidden')) {
            // Re-center on the active city and its spots
            const citySpots = touristSpotsData.filter(s => s.cityId === currentCityData.id);
            if (citySpots.length > 0) {
                const bounds = L.latLngBounds([currentCityData.coords, currentCityData.coords]);
                citySpots.forEach(s => bounds.extend(s.coords));

                const paddedBounds = bounds.pad(0.15);
                const center = bounds.getCenter();

                const isDesktop = window.innerWidth > 900;
                let targetZoom = map.getBoundsZoom(paddedBounds, false, L.point(isDesktop ? 450 : 0, 0));
                if (targetZoom > 18) targetZoom = 18;

                let targetPoint = map.project(center, targetZoom);

                if (isDesktop) {
                    targetPoint.x += 225;
                }

                const offsetCenter = map.unproject(targetPoint, targetZoom);
                map.setView(offsetCenter, targetZoom, { animate: false });
            } else {
                const isDesktop = window.innerWidth > 900;
                let targetZoom = 17;
                let targetPoint = map.project(currentCityData.coords, targetZoom);

                if (isDesktop) {
                    targetPoint.x += 225;
                }

                const offsetCenter = map.unproject(targetPoint, targetZoom);
                map.setView(offsetCenter, targetZoom, { animate: false });
            }
        }
    }, 200); // 200ms debounce
});

// Initialize interactive timeline segments
function initTimelineMarkers() {
    const track = document.querySelector('.timeline-track');
    if (!track) return;

    const bachBirth = 1685;
    const bachDeath = 1750;
    const totalLife = bachDeath - bachBirth;

    citiesData.forEach(city => {
        if (!city.period || city.isBranch) return; // Skip cities with no period or branch cities
        const yearMatch = city.period.match(/\d{4}/g);

        if (yearMatch && yearMatch.length > 0) {
            const startYear = parseInt(yearMatch[0]);
            const endYear = yearMatch.length > 1 ? parseInt(yearMatch[1]) : startYear + 1;

            const leftPercent = ((startYear - bachBirth) / totalLife) * 100;
            const widthPercent = Math.max(1.5, ((endYear - startYear) / totalLife) * 100);

            const segment = document.createElement('div');
            segment.classList.add('timeline-segment');
            segment.style.left = `${leftPercent}%`;
            segment.style.width = `${widthPercent}%`;
            segment.title = `${city.nameKR} (${city.period})`; // Tooltip on hover

            segment.addEventListener('click', (e) => {
                e.stopPropagation();
                viewCity(city);
            });

            track.appendChild(segment);
        }
    });

    // 곁가지 도시 – 다이아몬드 마커를 타임라인 바 위에 표시
    citiesData.forEach(city => {
        if (!city.period || !city.isBranch) return;
        const yearMatch = city.period.match(/\d{4}/g);
        if (!yearMatch) return;

        const startYear = parseInt(yearMatch[0]);
        const endYear = yearMatch.length > 1 ? parseInt(yearMatch[1]) : startYear;
        const midYear = (startYear + endYear) / 2;
        const leftPercent = ((midYear - bachBirth) / totalLife) * 100;

        const marker = document.createElement('div');
        marker.classList.add('timeline-branch-marker');
        // Hamburg goes above the track to avoid overlap with Celle
        if (city.id === 'hamburg') {
            marker.classList.add('timeline-marker-top');
        }
        marker.style.left = `${leftPercent}%`;
        marker.title = `[곁가지 여행] ${city.nameKR} (${city.period})`;

        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            viewCity(city);
        });

        track.appendChild(marker);
    });

    // 바흐 탄생 이전 도시 — 타임라인 시작점 왼쪽 다이아몬드 마커
    const preBirthCities = [
        { id: 'wechmar', label: '베히마르' },
        { id: 'erfurt', label: '에르푸르트' }
    ];
    preBirthCities.forEach((pb, idx) => {
        const city = citiesData.find(c => c.id === pb.id);
        if (!city) return;

        const marker = document.createElement('div');
        marker.classList.add('timeline-branch-marker', 'timeline-prebirth-marker');
        marker.dataset.cityId = pb.id;
        // Position: -5% for first, -3% for second (close together, leaving left space)
        marker.style.left = `${-5 + idx * 2}%`;
        marker.title = `[바흐 이전] ${pb.label} (${city.period})`;

        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            viewCity(city);
        });

        track.appendChild(marker);
    });
}
initTimelineMarkers();

// Navigate to the next city in chronological order
function goToNextCity() {
    if (!currentCityData) {
        // No city selected yet — start from the first city
        viewCity(citiesData[0]);
        return;
    }
    const currentIdx = citiesData.findIndex(c => c.id === currentCityData.id);
    const nextIdx = (currentIdx + 1) % citiesData.length;
    viewCity(citiesData[nextIdx]);
}

// ============================
// Family Tree Panel
// ============================

function toggleFamilyTree() {
    const panel = document.getElementById('family-tree-panel');
    if (!panel) return;
    panel.classList.toggle('hidden');
}

// Family tree member data for modal display
const familyTreeData = {
    '파이트 바흐': {
        name: '파이트 바흐',
        years: '? – 1619',
        identity: '바흐 가문의 고조할아버지',
        desc: '16세기 헝가리에서 종교적 박해를 피해 튀링겐 베히마르(Wechmar)로 돌아온 제분업자입니다. 방앗간을 돌리면서도 치터(Cythringen)를 연주했다고 전해지며, J.S. 바흐는 이 시조를 \"음악을 사랑한 사람\"이라 기록했습니다. 바흐 음악 왕조 5세대의 출발점입니다.',
        img: 'veit_bach_portrait.png'
    },
    '요하네스 바흐': {
        name: '요하네스 바흐',
        years: '1604 – 1673',
        identity: '에르푸르트의 오르가니스트 · 증조할아버지',
        desc: '파이트 바흐의 손자로, 베히마르(Wechmar)에서 에르푸르트로 이주하여 프레디거 교회 오르가니스트로 약 40년간 봉직했습니다. 바흐 가문이 아마추어 음악가에서 전문 음악가 집안으로 도약하는 데 결정적 역할을 한 인물입니다.',
        img: 'portrait_johannes.png'
    },
    '크리스토프 바흐': {
        name: '크리스토프 바흐',
        years: '1613 – 1661',
        identity: '에르푸르트 시 악사 · 할아버지',
        desc: '요하네스 바흐의 형제로, 에르푸르트에서 시 악사(Stadtpfeifer)로 활동했습니다. 그의 쌍둥이 아들 요한 암브로지우스와 요한 크리스토프는 외모가 너무 닮아 아내들조차 구별하기 어려웠다는 일화가 전해집니다. J.S. 바흐의 친할아버지입니다.',
        img: 'portrait_christoph.png'
    },
    '요한 암브로지우스 바흐': {
        name: '요한 암브로지우스 바흐',
        years: '1645 – 1695',
        identity: '아이제나흐 궁정 음악가 · 아버지',
        desc: '에르푸르트에서 태어나 아이제나흐로 이주한 바이올린 명수입니다. 아이제나흐 궁정과 시의 음악을 총괄했으며, 아들 요한 제바스티안에게 바이올린과 비올라를 가르쳤습니다. 1694년 아내 엘리자베트 사후 재혼했으나 이듬해 세상을 떠났습니다.',
        img: 'portrait_ambrosius.jpg'
    },
    '요한 크리스토프': {
        name: '요한 크리스토프 바흐',
        years: '1671 – 1721',
        identity: '오르드루프 오르가니스트 · 큰형',
        desc: '파헬벨에게 건반 음악을 배운 뛰어난 오르가니스트로, 오르드루프 성 미카엘 교회에서 활동했습니다. 부모를 잃은 10살 제바스티안을 5년간 돌보며 클라비어와 작곡 기초를 가르친 보호자입니다. 바흐의 음악 인생에 결정적 영향을 미쳤습니다.',
        img: 'portrait_jchristoph.png'
    },
    '요한 제바스티안 바흐': {
        name: '요한 제바스티안 바흐',
        years: '1685 – 1750',
        identity: '★ 서양 음악의 아버지',
        desc: '아이제나흐에서 태어나 뤼네부르크, 아른슈타트, 뮐하우젠, 바이마르, 쾨텐, 라이프치히로 이어지는 여정을 통해 1000곡 이상의 걸작을 남겼습니다. 바로크 음악의 정점이자 서양 음악사 최고의 작곡가로 불리는 영원한 마에스트로입니다.',
        img: 'portrait_jsbach.jpg'
    },
    '요한 야콥 바흐': {
        name: '요한 야콥 바흐',
        years: '1682 – 1722',
        identity: '오보이스트 · 형',
        desc: '제바스티안의 형으로, 스웨덴 칼 12세의 군악대에 오보이스트로 입대하여 이스탄불까지 원정했습니다. 그의 출정에 즈음하여 동생 제바스티안이 작곡한 〈사랑하는 형의 출발에 부쳐〉(BWV 992, 일명 \"카프리치오\")는 초기 바흐의 진귀한 표제음악입니다.',
        img: 'portrait_jjakob.png'
    },
    '마리아 바르바라': {
        name: '마리아 바르바라 바흐',
        years: '1684 – 1720',
        identity: '첫째 아내',
        desc: '바흐의 먼 친척으로, 1707년 도른하임에서 결혼했습니다. 7명의 자녀를 낳았으며 빌헬름 프리데만과 C.P.E. 바흐가 그녀의 소생입니다. 1720년 바흐가 칼스바트 여행으로 자리를 비운 사이 갑작스럽게 세상을 떠나, 바흐에게 깊은 슬픔을 안겼습니다.',
        img: 'portrait_mariabarbara.png'
    },
    '안나 막달레나': {
        name: '안나 막달레나 빌케 바흐',
        years: '1701 – 1760',
        identity: '둘째 아내 · 음악 동반자',
        desc: '쾨텐 궁정 소프라노 가수 출신으로, 1721년 바흐와 재혼했습니다. 뛰어난 음악적 소양으로 바흐의 악보를 필사하고 가정 음악회에 참여한 평생의 음악 동반자입니다. 〈안나 막달레나를 위한 클라비어 소곡집〉은 그녀를 위해 편찬되었습니다.',
        img: 'portrait_annamagdalena.jpg'
    },
    '빌헬름 프리데만': {
        name: '빌헬름 프리데만 바흐',
        years: '1710 – 1784',
        identity: '장남 · "할레 바흐"',
        desc: '아버지에게 직접 교육받은 장남으로, 즉흥 연주와 오르간에서 천재적 재능을 보였습니다. 드레스덴과 할레에서 오르가니스트로 활동했으나, 자유분방한 성격과 시대 변화 속에서 말년을 불우하게 보냈습니다. "할레 바흐"라 불립니다.',
        img: 'portrait_wfbach.jpg'
    },
    'C.P.E. 바흐': {
        name: '카를 필립 에마누엘 바흐',
        years: '1714 – 1788',
        identity: '차남 · 감정양식의 선구자',
        desc: '프리드리히 대왕의 궁정 건반주자로 28년간 봉직하며, 아버지의 바로크 양식과 고전주의를 잇는 \"감정양식(Empfindsamer Stil)\"을 개척했습니다. 하이든, 모차르트, 베토벤 모두 그의 영향을 받았으며, 당대에는 아버지보다 유명했습니다.',
        img: 'portrait_cpebach.jpg'
    },
    '요한 크리스티안': {
        name: '요한 크리스티안 바흐',
        years: '1735 – 1782',
        identity: '막내아들 · "런던 바흐"',
        desc: '바흐의 막내아들로, 이탈리아에서 오페라를 공부한 뒤 런던에 정착하여 큰 성공을 거뒀습니다. 밝고 경쾌한 갈랑 양식의 대가로, 어린 모차르트에게 결정적 영향을 미쳤습니다. "런던 바흐" 또는 "밀라노 바흐"로 불립니다.',
        img: 'portrait_jcbach.jpg'
    }
};

// Show family tree member info in the influencer modal
document.querySelectorAll('.ft-node').forEach(node => {
    const nameEl = node.querySelector('.ft-name');
    if (!nameEl) return;
    const name = nameEl.textContent.trim();
    node.addEventListener('click', () => {
        const memberData = familyTreeData[name];
        if (memberData) {
            openInfluencerModal(memberData);
        }
    });
});

// --- Welcome Splash Overlay ---
document.getElementById('welcome-enter-btn')?.addEventListener('click', () => {
    // Unlock the global audio flag
    audioUnlocked = true;

    // Unlock browser audio autoplay by creating user-gesture-triggered AudioContext
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const silent = ctx.createBufferSource();
        silent.buffer = ctx.createBuffer(1, 1, 22050);
        silent.connect(ctx.destination);
        silent.start(0);
    } catch (e) { /* ignore */ }

    // Fade out the overlay
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 1000);
    }

    // Now trigger music playback
    if (musicEnabled && ytPlayerReady) {
        if (currentCityData && currentCityData.youtubeId) {
            // A city is already loaded — play its music
            ytPlayer.setVolume(getActualYouTubeVolume());
            ytPlayer.loadVideoById({
                videoId: currentCityData.youtubeId,
                startSeconds: currentCityData.youtubeStart || 0
            });
        } else if (!currentCityData) {
            // Home screen — play intro music
            const INTRO_VIDEO_ID = 'x8Rv9ppP6A8';
            const INTRO_START_SEC = 1115;
            currentYoutubeId = INTRO_VIDEO_ID;
            currentVolumeLevel = 60;
            ytPlayer.setVolume(getActualYouTubeVolume());
            ytPlayer.loadVideoById({
                videoId: INTRO_VIDEO_ID,
                startSeconds: INTRO_START_SEC
            });
            setTickerText('J.S. Bach — 관현악 모음곡 2번 B단조 BWV 1067 제7곡 바디네리 (Badinerie) ♦ Netherlands Bach Society · Shunske Sato');
        }
    }
});
