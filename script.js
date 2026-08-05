const CHANNEL_ID = 'UCNsvUK4vvGbnF2kj30J1sXw';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

/* ============ Floating Minecraft blocks ============ */
const BLOCK_COLORS = [
    '#5b8731', '#22c55e', '#a3d11c', '#7a9e3a',
    '#6b8e2a', '#8fbf3f', '#4ade80', '#5b8731'
];

function createFloatingBlocks() {
    const field = document.getElementById('blockField');
    if (!field) return;

    const count = window.innerWidth < 768 ? 12 : 22;

    for (let i = 0; i < count; i++) {
        const block = document.createElement('div');
        block.className = 'mc-block';

        const size = Math.floor(Math.random() * 20) + 12;
        const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 18;
        const delay = -Math.random() * duration;
        const opacity = (Math.random() * 0.2 + 0.08).toFixed(2);

        block.style.cssText = `
            --size: ${size}px;
            --o: ${opacity};
            left: ${left}%;
            background: ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            box-shadow: inset 2px 2px 0 rgba(255,255,255,0.15), inset -2px -2px 0 rgba(0,0,0,0.3);
        `;

        field.appendChild(block);
    }
}

/* ============ Videos from RSS feed ============ */
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
                if (videoId) {
                    thumbnail = thumbnail.replace(/\/hqdefault\.jpg$/, '/mqdefault.jpg');
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
        <div class="video-card scroll-reveal" data-delay="${i}">
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

/* ============ Scroll reveal observer ============ */
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

/* ============ Navbar scroll effect ============ */
const navbar = document.getElementById('navbar');
const backTop = document.getElementById('backTop');

function onScroll() {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
        backTop.classList.add('show');
    } else {
        backTop.classList.remove('show');
    }

    highlightActiveNav();
}

window.addEventListener('scroll', onScroll);
onScroll();

backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============ Active nav link highlighting ============ */
function highlightActiveNav() {
    const sections = ['rolam', 'video', 'discord'];
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    let current = '';

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 200) {
            current = id;
        }
    });

    links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

/* ============ Mobile menu ============ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

/* ============ Smooth scroll for anchor links ============ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

/* ============ Init ============ */
createFloatingBlocks();
fetchLatestVideos();
