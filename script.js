document.addEventListener('DOMContentLoaded', () => {
    // 0. Initial State
    document.body.classList.add('preloader-active');

    // 1. Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    if (cursor) {
        // Light-background sections where cursor should turn black
        const lightSections = document.querySelectorAll('.about-section, .services-section, .testimonial-new-section, .portfolio-section');

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (cursorDot) {
                cursorDot.style.left = e.clientX + 'px';
                cursorDot.style.top = e.clientY + 'px';
            }

            // Detect if cursor is over a light-background section
            let overLight = false;
            lightSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
                    e.clientX >= rect.left && e.clientX <= rect.right) {
                    overLight = true;
                }
            });

            if (overLight) {
                cursor.classList.add('cursor-black');
            } else {
                cursor.classList.remove('cursor-black');
            }
        });

        const hoverables = document.querySelectorAll('a, button, .video-card, .nav-arrow, .category-tab, .contact-submit, .service-pill, .minimal-mute-btn');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
                if (cursorDot) cursorDot.classList.add('cursor-hover');
                if (el.classList.contains('video-card')) cursor.classList.add('cursor-more');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover', 'cursor-more');
                if (cursorDot) cursorDot.classList.remove('cursor-hover');
            });
        });
    }

    // 2. Text Scrubbing Utility
    const headlines = document.querySelectorAll('.scrub-text, .about-headline');
    headlines.forEach(headline => {
        const wrapWords = (node, isRed = false) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim().length > 0) {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.className = 'type-word';
                        if (isRed) span.dataset.originalColor = 'red';
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
                const childIsRed = isRed || node.classList.contains('highlight-red');
                const childNodes = Array.from(node.childNodes);
                node.innerHTML = '';
                childNodes.forEach(child => node.appendChild(wrapWords(child, childIsRed)));
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
                if (index < wordsToFill) {
                    word.style.color = (word.dataset.originalColor === 'red') ? '#FF0000' : '#000000';
                } else {
                    word.style.color = '#D9D9D9';
                }
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

    // Helper: initialize a single Vimeo player — silent retries, spinner-only buffering UX
    const initVimeoPlayer = (card, iframe) => {
        const originalSrc = iframe.getAttribute('data-original-src') || iframe.src;
        iframe.setAttribute('data-original-src', originalSrc);

        const player = new Vimeo.Player(iframe);
        vimeoPlayers.set(iframe, player);
        player.isReady = false;

        // Get or create spinner overlay (no text, no background block)
        let loaderOverlay = card.querySelector('.video-loader-overlay');
        if (!loaderOverlay) {
            loaderOverlay = document.createElement('div');
            loaderOverlay.classList.add('video-loader-overlay');
            const spinner = document.createElement('div');
            spinner.classList.add('video-buffer-spinner');
            loaderOverlay.appendChild(spinner);
            card.appendChild(loaderOverlay);
        }
        // Start hidden — never block the video
        loaderOverlay.classList.remove('buffering');

        window.videoProgressMap.set(iframe, 0);

        let bufferTimer = null;
        let isPlaying = false;

        const showSpinner = () => loaderOverlay.classList.add('buffering');
        const hideSpinner = () => {
            clearTimeout(bufferTimer);
            loaderOverlay.classList.remove('buffering');
        };

        player.ready().then(() => {
            player.isReady = true;
            player.setQuality('360p').catch(() => {});
            player.setMuted(true).catch(() => {});
        }).catch(() => {
            // Silent background retry after 3s — no UI change
            setTimeout(() => {
                const newPlayer = new Vimeo.Player(iframe);
                newPlayer.ready().then(() => {
                    newPlayer.isReady = true;
                    newPlayer.setQuality('360p').catch(() => {});
                    newPlayer.setMuted(true).catch(() => {});
                    vimeoPlayers.set(iframe, newPlayer);
                }).catch(() => {});
            }, 3000);
        });

        player.on('play', () => {
            isPlaying = true;
            hideSpinner();
            // Fade out the number placeholder
            const placeholder = card.querySelector('.video-placeholder');
            if (placeholder) placeholder.style.opacity = '0';
        });

        player.on('pause', () => {
            isPlaying = false;
        });

        // Buffering: show spinner after a 600ms stall so brief pauses don't flash
        player.on('bufferstart', () => {
            bufferTimer = setTimeout(() => {
                showSpinner();
            }, 600);
        });

        player.on('bufferend', () => {
            hideSpinner();
        });

        // When timeupdate fires, playback is live — clear spinner
        player.on('timeupdate', () => {
            if (loaderOverlay.classList.contains('buffering')) {
                hideSpinner();
            }
        });

        player.on('progress', (data) => {
            window.videoProgressMap.set(iframe, data.percent);
            if (window.updateGlobalPreloader) window.updateGlobalPreloader();
        });

        player.on('loaded', () => {
            window.videoProgressMap.set(iframe, Math.max(window.videoProgressMap.get(iframe) || 0, 0.1));
            if (window.updateGlobalPreloader) window.updateGlobalPreloader();
        });

        // Error: silent — do NOT refresh iframe or show UI. Just log.
        player.on('error', (err) => {
            console.warn('Vimeo player error (silent):', err);
            hideSpinner();
        });
    };

    // Intersection Observer for lazy-initialization and autoplay
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const iframe = entry.target.querySelector('.video-preview');
            if (!iframe) return;

            // 1. Lazy Initialization: only start Vimeo player when card is near viewport
            if (entry.isIntersecting && !vimeoPlayers.has(iframe)) {
                initVimeoPlayer(entry.target, iframe);
            }

            // 2. Autoplay Control: play when in view, pause when not
            const player = vimeoPlayers.get(iframe);
            if (player) {
                if (entry.isIntersecting) {
                    if (player.isReady) player.play().catch(() => {});
                } else {
                    player.pause().catch(() => {});
                }
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: '200px' // Start loading slightly before it hits the screen
    });
    videoCards.forEach(card => videoObserver.observe(card));

    // 4. Testimonial Logic
    const testimonialArray = [
        {
            index: '01',
            quote: '',
            videoBody: 'https://player.vimeo.com/video/1183999550?badge=0&autopause=0&player_id=0&app_id=58479&background=1',
            name: 'Biprojit Biswas',
            company: 'Founder & CEO BipMinds_Tech',
            image: '/testimonial/Biprojit.jpg'
        },
        {
            index: '02',
            quote: 'I usually send him a chaotic folder of raw footage and a vague \'make this look cool\' text ( not recommended), and he somehow translates my brain-scrambles into actual art. <span class=\"highlight-red\">He’s not just a video editor, he’s a literal idea catcher with a great value of timelines.</span> If you value your sanity and want your content to actually pop, Keshav is your human.',
            name: 'Nafisa Rahaman',
            company: 'Brand Strategist | GTM, D2C, Digital + Delivery Tech |',
            image: '/testimonial/Nafisa.jpg'
        },
        {
            index: '03',
            quote: 'I found Keshav on Instagram when I was looking for an editor. He reached out via DM, and after reviewing some of his samples, I decided to work with him on one of my YouTube videos. <span class=\"highlight-red\">The experience was great he communicates clearly, understands requirements well, and delivers exactly what’s needed.</span> The final video turned out really good. Definitely recommend working with him.',
            name: 'Sudhanshu Kundu',
            company: 'YouTuber | Creative Strategist',
            image: '/testimonial/Sudhanshu.jpg'
        },
        {
            index: '04',
            quote: 'Hey keshav, I wanted to tell you something that you\'re working with me since very long time and <span class=\"highlight-red\">the edits you do are far beyond good</span> 🔥. Also the delivery time, ideation, motion graphics everything is really good.',
            name: 'Rumit Dihora',
            company: 'Video Editor | Visual Storyteller | Crafting Engaging Narratives',
            image: '/testimonial/Rumit.jpg'
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
                    // Only update src if it has changed
                    if (videoIframe.src !== data.videoBody) {
                        videoIframe.src = data.videoBody;
                    }
                    // Use the shared initVimeoPlayer for consistent spinner-only UX
                    const testiCard = videoIframe.closest('.video-card');
                    if (testiCard) initVimeoPlayer(testiCard, videoIframe);
                    const player = vimeoPlayers.get(videoIframe);
                    if (player) {
                        player.ready().then(() => {
                            player.setMuted(true).catch(() => {});
                            player.play().catch(() => {});
                        }).catch(() => {});
                    }
                } else {
                    if (videoContainer) videoContainer.style.display = 'none';
                    tQuoteEl.style.display = 'block';
                    tQuoteEl.innerHTML = data.quote;
                    wrapTestimonialWords(tQuoteEl);
                }
                tQuoteEl.style.opacity = '1';
                tQuoteEl.style.transform = 'translateY(0)';
                // Sync color immediately after content change
                handleScrollEffects();
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
        const targetPerVideo = 0.1; // Reduced to 10% (initial load) to drastically speed up preloader
        
        map.forEach(p => {
            totalBufferedScale += Math.min(p, targetPerVideo);
        });

        const maxScale = map.size * targetPerVideo;
        let displayPercent = Math.floor((totalBufferedScale / maxScale) * 100);
        
        if (displayPercent > 100) displayPercent = 100;
        if (preloaderNum) preloaderNum.textContent = displayPercent + ' %';
        
        // Sync progress bar width
        const barFill = document.getElementById('preloader-bar');
        if (barFill) barFill.style.width = displayPercent + '%';

        if (displayPercent >= 100) {
            finishPreloader();
        }
    };

    const finishPreloader = () => {
        if (isFinished) return;
        isFinished = true;
        
        // Animate bar to 100% and counter, then wipe up
        if (preloaderNum) preloaderNum.textContent = '100 %';
        const barFill = document.getElementById('preloader-bar');
        if (barFill) barFill.style.width = '100%';
        
        setTimeout(() => {
            if (sitePreloader) sitePreloader.classList.add('hidden');
            document.body.classList.remove('preloader-active');
            document.querySelector('.hero-content')?.classList.add('reveal');
        }, 500);
    };

    // Fast Safety Timeout: Max 8 seconds waiting
    setTimeout(() => { 
        if (!isFinished) { 
            if (preloaderNum) preloaderNum.textContent = "100 %"; 
            finishPreloader(); 
        } 
    }, 8000);

    // 6. Service Overlay Logic
    const serviceData = {
        'content-planning-pill': {
            index: '01',
            title: 'Content Planning',
            description: 'Engineering viral content from your existing library and build a multi-platform distribution system that converts.',
            items: ['Brand Strategy', 'Visual Identity', 'Content Planning', 'Personalized content building']
        },
        'video-scripting-pill': {
            index: '02',
            title: 'Video Scripting',
            description: 'Crafting compelling narratives and tight retention-focused hooks to capture and hold audience attention up to the last second.',
            items: ['Concept Development', 'Hook Writing', 'Storyboarding', 'Retention-Focused Scripting']
        },
        'video-editing-pill': {
            index: '03',
            title: 'Video Editing',
            description: 'Premium editing that hooks viewers — transforming long-form content into high-performing shorts and reels',
            items: ['Video Editing', 'Long Form Content Repurposing', 'Podcast repurposing', 'High Retention Editing']
        }
    };

    const servicePills = document.querySelectorAll('.service-pill');
    const serviceOverlay = document.getElementById('service-detail-overlay');
    const closeOverlayBtn = document.querySelector('.close-overlay');
    const overlayTitle = document.getElementById('overlay-title-text');
    const overlayContainer = document.getElementById('overlay-items-container');

    // Make sure we have a description paragraph, if not create one
    let overlayDesc = document.querySelector('.overlay-description');
    if (!overlayDesc && overlayTitle) {
        overlayDesc = document.createElement('p');
        overlayDesc.className = 'overlay-description';
        overlayTitle.parentNode.insertBefore(overlayDesc, overlayTitle.nextSibling);
    }

    servicePills.forEach(pill => {
        pill.addEventListener('click', () => {
            const data = serviceData[pill.id];
            if (!data) return;

            // Populate text
            overlayTitle.innerHTML = `<span style="color: #666; font-size: 0.7em;">${data.index}</span> ${data.title}`;
            overlayDesc.textContent = data.description;
            
            // Populate items
            overlayContainer.innerHTML = '';
            data.items.forEach((itemText, i) => {
                const numStr = String(i + 1).padStart(2, '0');
                const itemDiv = document.createElement('div');
                itemDiv.className = 'detail-item';
                itemDiv.innerHTML = `
                    <span class="detail-number">${numStr}</span>
                    <span class="detail-text">${itemText}</span>
                `;
                overlayContainer.appendChild(itemDiv);
            });

            // Show overlay
            serviceOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent background scrolling
        });
    });

    if (closeOverlayBtn && serviceOverlay) {
        closeOverlayBtn.addEventListener('click', () => {
            serviceOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // 7. Utility Logic
    document.querySelector('#back-to-top-btn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    
    const connectImage = document.querySelector('.connect-image');
    if (connectImage) {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) connectImage.classList.add('animate-in'); });
        }, { threshold: 0.2 }).observe(connectImage);
    }

    // Trigger service pill entrance animations
    const servicePillsAnim = document.querySelectorAll('.service-pill');
    if (servicePillsAnim.length > 0) {
        const serviceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => { 
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in'); 
                }
            });
        }, { threshold: 0.2 });
        servicePillsAnim.forEach(pill => serviceObserver.observe(pill));
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
