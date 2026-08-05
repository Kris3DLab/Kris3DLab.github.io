const CHANNEL_ID = 'UCNsvUK4vvGbnF2kj30J1sXw';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

async function fetchLatestVideos() {
    const container = document.getElementById('videos-container');
    if (!container) return;

    for (const proxy of PROXIES) {
        try {
            const response = await fetch(proxy(RSS_URL));
            if (!response.ok) continue;
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');
            const entries = Array.from(xml.querySelectorAll('entry'));

            if (entries.length === 0) continue;

            const latest = entries.slice(0, 2).map(entry => {
                const media = entry.querySelector('media\\:group, group');
                const titleEl = entry.querySelector('title');
                const idEl = entry.querySelector('yt\\:videoId, videoId');
                const publishedEl = entry.querySelector('published');

                const title = titleEl ? titleEl.textContent : 'Kris3DLab videó';
                const videoId = idEl ? idEl.textContent.trim() : '';
                const published = publishedEl ? new Date(publishedEl.textContent) : new Date();

                let thumbnail = '';
                if (media) {
                    const thumb = media.querySelector('media\\:thumbnail, thumbnail');
                    if (thumb) {
                        thumbnail = thumb.getAttribute('url') || '';
                    }
                }
                if (!thumbnail && videoId) {
                    thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                }

                return { title, videoId, published, thumbnail };
            });

            renderVideos(container, latest);
            return;
        } catch (e) {
            continue;
        }
    }

    container.innerHTML = `
        <div class="video-error">
            Nem sikerült betölteni a videókat. Nézd meg a legújabb tartalmakat a
            <a href="https://www.youtube.com/@Kris3DLab" target="_blank" rel="noopener">YouTube csatornán!</a>
        </div>
    `;
}

function renderVideos(container, videos) {
    container.innerHTML = videos.map((video, i) => `
        <div class="video-card scroll-reveal">
            <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener" style="text-decoration: none; color: inherit;">
                <div class="video-thumb">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="play-btn"><i class="fa-solid fa-play"></i></div>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <div class="video-meta">
                        <span><i class="fa-solid fa-film"></i> Legújabb</span>
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(video.published)}</span>
                    </div>
                </div>
            </a>
        </div>
    `).join('');

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Ma';
    if (days === 1) return 'Tegnap';
    if (days < 7) return `${days} napja`;
    if (days < 30) return `${Math.floor(days / 7)} hete`;
    return `${Math.floor(days / 30)} hónapja`;
}

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

fetchLatestVideos();
