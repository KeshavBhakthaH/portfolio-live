document.addEventListener('DOMContentLoaded', () => {
    // 0. Initial State
    document.body.classList.add('preloader-active');

    // 1. Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (cursorDot) {
                cursorDot.style.left = e.clientX + 'px';
                cursorDot.style.top = e.clientY + 'px';
            }
        });
        const hoverables = document.querySelectorAll('a, button, .video-card, .nav-arrow, .category-tab, .contact-submit, .service-pill, .minimal-mute-btn');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                if (cursorDot) cursorDot.classList.add('hover');
                if (el.classList.contains('video-card')) cursor.classList.add('cursor-more');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover', 'cursor-more');
                if (cursorDot) cursorDot.classList.remove('hover');
            });
        });
    }

    // 2. Text Scrubbing Utility
    const headlines = document.querySelectorAll('.scrub-text, .about-headline');
    headlines.forEach(headline => {
        const wrapWords = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim().length > 0) {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.className = 'type-word';
                        span.style.color = '#D9D9D9';
                        span.style.display = 'inline-block';
                        span.style.transition = 'color 0.1s ease';
                        fragment.appendChild(span);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                return fragment;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const childNodes = Array.from(node.childNodes);
                node.innerHTML = '';
                childNodes.forEach(child => node.appendChild(wrapWords(child)));
                return node;
            }
            return node;
        };
        wrapWords(headline);
    });

    const wrapTestimonialWords = (element) => {
        if (!element) return;
        const html = element.innerHTML;
        const temp = document.createElement('div');
        temp.innerHTML = html;
        let finalHtml = '';
        temp.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                words.forEach(word => {
                    if (word.trim().length > 0) finalHtml += `<span class="testi-word">${word}</span>`;
                    else finalHtml += word;
                });
            } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('highlight-red')) {
                const words = node.textContent.split(/(\s+)/);
                words.forEach(word => {
                    if (word.trim().length > 0) finalHtml += `<span class="testi-word highlight-red" data-original-color="red">${word}</span>`;
                    else finalHtml += word;
                });
            } else {
                finalHtml += node.outerHTML;
            }
        });
        element.innerHTML = finalHtml;
    };

    const handleScrollEffects = () => {
        const triggerBottom = window.innerHeight * 0.85;
        const triggerTop = window.innerHeight * 0.25;

        // Scrub Text
        headlines.forEach(headline => {
            const words = headline.querySelectorAll('.type-word');
            const rect = headline.getBoundingClientRect();
            let progress = (triggerBottom - rect.top) / (triggerBottom - triggerTop);
            progress = Math.max(0, Math.min(1, progress));
            const wordsToFill = Math.floor(progress * words.length);
            words.forEach((word, index) => {
                word.style.color = index < wordsToFill ? '#000000' : '#D9D9D9';
            });
        });

        // Testimonial Scrub
        const activeTestiQuote = document.querySelector('#testimonial-new-quote');
        if (activeTestiQuote && activeTestiQuote.style.display !== 'none') {
            const testiWords = activeTestiQuote.querySelectorAll('.testi-word');
            const rect = activeTestiQuote.getBoundingClientRect();
            let progress = (triggerBottom - rect.top) / (triggerBottom - (window.innerHeight * 0.40));
            progress = Math.max(0, Math.min(1, progress));
            const filledWords = progress * testiWords.length;
            testiWords.forEach((word, index) => {
                if (index < filledWords) {
                    word.style.color = (word.dataset.originalColor === 'red') ? '#FF0000' : '#000000';
                } else {
                    word.style.color = '#D9D9D9';
                }
            });
        }
        
        // Section Reveal
        document.querySelectorAll('.section').forEach(section => {
            if (section.id === 'hero' || section.classList.contains('services-section') || section.classList.contains('portfolio-section') || section.classList.contains('testimonial-new-section')) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                return;
            }
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < triggerBottom) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            } else {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
            }
        });
    };
    window.addEventListener('scroll', handleScrollEffects);
    handleScrollEffects();

    // 3. Vimeo & Preloader Logic
    const vimeoPlayers = new Map();
    window.videoProgressMap = new Map();
    const videoCards = document.querySelectorAll('.video-card');

    videoCards.forEach(card => {
        const iframe = card.querySelector('.video-preview');
        if (iframe && iframe.tagName === 'IFRAME') {
            const player = new Vimeo.Player(iframe);
            vimeoPlayers.set(iframe, player);
            player.isReady = false;
            
            const loaderOverlay = document.createElement('div');
            loaderOverlay.classList.add('video-loader-overlay');
            loaderOverlay.textContent = '0%';
            card.appendChild(loaderOverlay);

            window.videoProgressMap.set(iframe, 0);

            player.ready().then(() => {
                player.isReady = true;
                player.setQuality('360p');
                player.setMuted(true);
            });

            player.on('progress', (data) => {
                const p = data.percent;
                window.videoProgressMap.set(iframe, p);
                loaderOverlay.textContent = `${Math.round(p * 100)}%`;
                if (p >= 0.95) {
                    loaderOverlay.style.opacity = '0';
                    setTimeout(() => loaderOverlay.remove(), 500);
                }
                if (window.updateGlobalPreloader) window.updateGlobalPreloader();
            });

            player.on('loaded', () => {
                window.videoProgressMap.set(iframe, Math.max(window.videoProgressMap.get(iframe) || 0, 0.1));
                if (window.updateGlobalPreloader) window.updateGlobalPreloader();
            });
        }
    });

    // Intersection Observer for autoplay
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const player = vimeoPlayers.get(entry.target.querySelector('.video-preview'));
            if (player) {
                if (entry.isIntersecting) {
                    if (player.isReady) player.play().catch(() => {});
                } else {
                    player.pause().catch(() => {});
                }
            }
        });
    }, { threshold: 0.15 });
    videoCards.forEach(card => videoObserver.observe(card));

    // 4. Testimonial Logic
    const testimonialArray = [
        {
            index: '01',
            quote: '',
            videoBody: 'https://player.vimeo.com/video/1183999550?badge=0&autopause=0&player_id=0&app_id=58479&background=1',
            name: 'Biprojit Biswas',
            company: 'Founder & CEO BipMinds_Tech',
            image: 'testimonial/Biprojit.jpg'
        },
        {
            index: '02',
            quote: 'I usually send him a chaotic folder of raw footage and a vague \'make this look cool\' text ( not recommended), and he somehow translates my brain-scrambles into actual art. <span class=\"highlight-red\">He’s not just a video editor, he’s a literal idea catcher with a great value of timelines.</span> If you value your sanity and want your content to actually pop, Keshav is your human.',
            name: 'Nafisa Rahaman',
            company: 'Brand Strategist | GTM, D2C, Digital + Delivery Tech |',
            image: 'testimonial/Nafisa.jpg'
        },
        {
            index: '03',
            quote: 'I found Keshav on Instagram when I was looking for an editor. He reached out via DM, and after reviewing some of his samples, I decided to work with him on one of my YouTube videos. <span class=\"highlight-red\">The experience was great he communicates clearly, understands requirements well, and delivers exactly what’s needed.</span> The final video turned out really good. Definitely recommend working with him.',
            name: 'Sudhanshu Kundu',
            company: 'YouTuber | Creative Strategist',
            image: 'testimonial/Sudhanshu.jpg'
        },
        {
            index: '04',
            quote: 'Hey keshav, I wanted to tell you something that you\'re working with me since very long time and <span class=\"highlight-red\">the edits you do are far beyond good</span> 🔥. Also the delivery time, ideation, motion graphics everything is really good.',
            name: 'Rumit Dihora',
            company: 'Video Editor | Visual Storyteller | Crafting Engaging Narratives',
            image: 'testimonial/Rumit.jpg'
        }
    ];

    let currentTestimonial = 0;
    const tQuoteEl = document.querySelector('#testimonial-new-quote');
    const tIndexEl = document.querySelector('#testimonial-new-index');
    const tClientEl = document.querySelector('#client-name');
    const tCompanyEl = document.querySelector('#company-name');
    const profileSlots = document.querySelectorAll('.profile-stack .profile-placeholder');

    if (tQuoteEl) {
        profileSlots.forEach(slot => {
            const idx = parseInt(slot.getAttribute('data-index'));
            if (testimonialArray[idx]?.image) slot.style.backgroundImage = `url('${testimonialArray[idx].image}')`;
        });

        const updateTestimonial = (index, dir = 'next') => {
            const data = testimonialArray[index];
            const total = testimonialArray.length;
            const prevIndex = (index - 1 + total) % total;
            const nextIndex = (index + 1) % total;

            tQuoteEl.style.opacity = '0';
            tQuoteEl.style.transform = 'translateY(10px)';

            profileSlots.forEach(slot => {
                const slotIdx = parseInt(slot.getAttribute('data-index'));
                slot.className = 'profile-placeholder';
                if (slotIdx === index) slot.classList.add('slot-center');
                else if (slotIdx === prevIndex) slot.classList.add('slot-top');
                else if (slotIdx === nextIndex) slot.classList.add('slot-bottom');
                else slot.classList.add(dir === 'next' ? 'slot-hidden-top' : 'slot-hidden-bottom');
            });

            setTimeout(() => {
                tIndexEl.innerHTML = `${data.index}<span class="index-total">/${String(total).padStart(2, '0')}</span>`;
                tClientEl.textContent = data.name;
                tCompanyEl.textContent = data.company;

                const videoContainer = document.getElementById('video-testimonial-container');
                const videoIframe = document.getElementById('testimonial-video-player');

                if (data.videoBody && videoIframe) {
                    tQuoteEl.style.display = 'none';
                    videoContainer.style.display = 'flex';
                    videoIframe.src = data.videoBody;
                    const player = new Vimeo.Player(videoIframe);
                    vimeoPlayers.set(videoIframe, player);
                    player.isReady = false;
                    player.ready().then(() => {
                        player.isReady = true;
                        player.setQuality('360p');
                        player.setMuted(true);
                        player.play();
                    });
                    window.videoProgressMap.set(videoIframe, 0);
                    player.on('progress', (d) => {
                        window.videoProgressMap.set(videoIframe, d.percent);
                        if (window.updateGlobalPreloader) window.updateGlobalPreloader();
                    });
                } else {
                    if (videoContainer) videoContainer.style.display = 'none';
                    tQuoteEl.style.display = 'block';
                    tQuoteEl.innerHTML = data.quote;
                    wrapTestimonialWords(tQuoteEl);
                }
                tQuoteEl.style.opacity = '1';
                tQuoteEl.style.transform = 'translateY(0)';
            }, 300);
        };

        updateTestimonial(0, 'init');
        document.querySelector('#prev-testimonial')?.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonialArray.length) % testimonialArray.length;
            updateTestimonial(currentTestimonial, 'prev');
        });
        document.querySelector('#next-testimonial')?.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonialArray.length;
            updateTestimonial(currentTestimonial, 'next');
        });
    }

    // 5. Global Preloader (Sync with Vimeo Buffer)
    const sitePreloader = document.querySelector('#site-preloader');
    const preloaderNum = document.querySelector('#preloader-counter');
    let isFinished = false;

    window.updateGlobalPreloader = () => {
        if (isFinished) return;
        const map = window.videoProgressMap;
        if (!map || map.size === 0) {
            // If no videos are registered yet or found, we might want a timeout or a minimum wait
            return;
        }

        let totalBufferedScale = 0;
        const targetPerVideo = 0.5; // Load 50% of each to satisfy the "load half" requirement
        
        map.forEach(p => {
            totalBufferedScale += Math.min(p, targetPerVideo);
        });

        const maxScale = map.size * targetPerVideo;
        let displayPercent = Math.floor((totalBufferedScale / maxScale) * 100);
        
        if (displayPercent > 100) displayPercent = 100;
        if (preloaderNum) preloaderNum.textContent = displayPercent;

        if (displayPercent >= 100) {
            finishPreloader();
        }
    };

    const finishPreloader = () => {
        if (isFinished) return;
        isFinished = true;
        
        setTimeout(() => {
            if (sitePreloader) sitePreloader.classList.add('hidden');
            document.body.classList.remove('preloader-active');
            // Trigger hero animations if they exist
            document.querySelector('.hero-content')?.classList.add('reveal');
        }, 500);
    };

    // Safety Timeout: Force open after 15 seconds regardless of buffering
    setTimeout(() => { 
        if (!isFinished) { 
            if (preloaderNum) preloaderNum.textContent = "100"; 
            finishPreloader(); 
        } 
    }, 15000);

    // 6. Utility Logic
    document.querySelector('#back-to-top-btn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    
    const connectImage = document.querySelector('.connect-image');
    if (connectImage) {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) connectImage.classList.add('animate-in'); });
        }, { threshold: 0.2 }).observe(connectImage);
    }
    
    // Minimal Mute Buttons
    document.querySelectorAll('.minimal-mute-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const player = vimeoPlayers.get(btn.closest('.video-card')?.querySelector('.video-preview'));
            if (player) {
                player.getMuted().then(muted => {
                    player.setMuted(!muted);
                    btn.querySelector('.mute-text').textContent = !muted ? 'Unmute' : 'Mute';
                });
            }
        });
    });
});
