// Wait for DOM layout to fully load
document.addEventListener('DOMContentLoaded', () => {

    // Navbar scroll effect
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');

    if (cursor) {
        window.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        // Toggle black cursor for light sections
        const lightSections = document.querySelectorAll('.about-section, .services-section, .portfolio-section, .testimonial-new-section');
        lightSections.forEach(section => {
            section.addEventListener('mouseenter', () => cursor.classList.add('cursor-black'));
            section.addEventListener('mouseleave', () => cursor.classList.remove('cursor-black'));
        });

        // Hover effect for interactive elements
        const hoverables = document.querySelectorAll('a, button, .service-pill, .social-icon, .logo-link, .video-card, .minimal-mute-btn');

        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (el.classList.contains('video-card')) {
                    cursor.classList.add('cursor-more');
                } else {
                    cursor.classList.add('cursor-hover');
                }

                // Inherit color for border in hover state
                cursor.style.color = cursor.classList.contains('cursor-black') ? '#000000' : '#ffffff';
            });

            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover', 'cursor-more');
                const cursorText = cursor.querySelector('.cursor-text');
                if (cursorText) {
                    cursorText.textContent = '';
                    cursorText.style.color = ''; // Reset to inherit
                }
            });
        });
    }


    // Grid spotlight mouse-tracking effect (for Hero and Contact sections)
    const spotlightSections = document.querySelectorAll('.hero-section, .connect-section');

    spotlightSections.forEach(section => {
        const spotlight = section.querySelector('.grid-spotlight');
        if (spotlight) {
            section.addEventListener('mousemove', (e) => {
                const rect = section.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Move the spotlight: smaller intense center, wider soft spread
                const mask = `radial-gradient(circle 200px at ${x}px ${y}px, black 0%, rgba(0,0,0,0.15) 30%, transparent 100%)`;
                spotlight.style.maskImage = mask;
                spotlight.style.webkitMaskImage = mask;
                // Fisheye magnification center
                spotlight.style.transformOrigin = `${x}px ${y}px`;
            });

            section.addEventListener('mouseleave', () => {
                // Hide spotlight when cursor leaves
                const mask = 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)';
                spotlight.style.maskImage = mask;
                spotlight.style.webkitMaskImage = mask;
            });
        }
    });

    // Logo Text Wavy Hover Effect
    const logoTexts = document.querySelectorAll('.keshav, .media');
    logoTexts.forEach(el => {
        const text = el.textContent;
        el.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'wavy-char';
            el.appendChild(span);
        });
    });

    // Typwriter effect word-wrapper
    const headlinesToType = document.querySelectorAll('.about-headline');
    headlinesToType.forEach(headline => {
        let wordIndex = 0;
        const wrapWords = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (!text.trim()) return document.createTextNode(text);

                const words = text.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim()) {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.className = 'type-word';
                        span.style.color = '#D9D9D9';
                        span.style.display = 'inline-block';
                        span.style.transition = 'color 0.1s ease'; // Fast transition for a silky-smooth scroll scrub effect
                        wordIndex++;
                        fragment.appendChild(span);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                return fragment;
            } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('indent-space')) {
                const childNodes = Array.from(node.childNodes);
                node.innerHTML = '';
                childNodes.forEach(child => {
                    node.appendChild(wrapWords(child));
                });
                return node;
            }
            return node;
        };

        const childNodes = Array.from(headline.childNodes);
        headline.innerHTML = '';
        childNodes.forEach(child => {
            headline.appendChild(wrapWords(child));
        });
    });

    // Reveal animation for sections and video cards on scroll
    const sections = document.querySelectorAll('.section');
    const videoCards = document.querySelectorAll('.video-card');

    // Create a map to store Vimeo player instances
    const vimeoPlayers = new Map();

    // Initialize Vimeo players for all iframes in video cards
    videoCards.forEach(card => {
        const iframe = card.querySelector('.video-preview');
        if (iframe && iframe.tagName === 'IFRAME') {
            const player = new Vimeo.Player(iframe);
            vimeoPlayers.set(iframe, player);
            
            // Default: Muted
            player.setMuted(true);
        }
    });

    const revealElements = () => {
        const triggerBottom = window.innerHeight * 0.85;

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;

            if (sectionTop < triggerBottom) {
                // Portfolio, Services, and Testimonial sections are light and should show their background immediately for context
                if (section.id !== 'hero' && !section.classList.contains('services-section') && !section.classList.contains('portfolio-section') && !section.classList.contains('testimonial-new-section')) {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }
            } else {
                // Reset section container when scrolled back up
                if (section.id !== 'hero' && !section.classList.contains('services-section') && !section.classList.contains('portfolio-section') && !section.classList.contains('testimonial-new-section')) {
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(30px)';
                }
            }
        });

        // Interactive Scrub for About Section Text
        const headline = document.querySelector('.about-headline');
        if (headline) {
            const rect = headline.getBoundingClientRect();
            // Define active scrub area inside the viewport
            const startY = window.innerHeight * 0.65;
            const endY = window.innerHeight * 0.25;

            let progress = (startY - rect.top) / (startY - endY);
            progress = Math.max(0, Math.min(1, progress));

            const allTypeWords = headline.querySelectorAll('.type-word');
            const wordsToFill = progress * allTypeWords.length;

            allTypeWords.forEach((word, index) => {
                if (index < wordsToFill) {
                    word.style.color = ''; // Filled
                } else {
                    word.style.color = '#D9D9D9'; // Unfilled grey
                }
            });
        }

        // Interactive Scrub for Testimonial Section Text
        const testimonialQuote = document.querySelector('#testimonial-new-quote');
        const applyTestimonialScrub = (quoteEl) => {
            if (!quoteEl) return;
            const rect = quoteEl.getBoundingClientRect();
            // Define active scrub area inside the viewport
            const startY = window.innerHeight * 0.85;
            const endY = window.innerHeight * 0.40;

            let progress = (startY - rect.top) / (startY - endY);
            progress = Math.max(0, Math.min(1, progress));

            const allTestiWords = quoteEl.querySelectorAll('.testi-word');
            const wordsToFill = progress * allTestiWords.length;

            allTestiWords.forEach((word, index) => {
                if (index < wordsToFill) {
                    if (word.dataset.originalColor === 'red') {
                        word.style.color = '#FF0000';
                    } else {
                        word.style.color = '#000000';
                    }
                } else {
                    word.style.color = '#D9D9D9';
                }
            });
        };

        if (testimonialQuote) {
            applyTestimonialScrub(testimonialQuote);
        }
    };

    // Function to wrap testimonial text into spans for scrubbing
    const wrapTestimonialWords = (element) => {
        if (!element) return;
        const html = element.innerHTML;
        // Temporary div to parse the existing HTML (preserving the <span class="highlight-red"> tags)
        const temp = document.createElement('div');
        temp.innerHTML = html;

        let finalHtml = '';
        temp.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                words.forEach(word => {
                    if (word.trim().length > 0) {
                        finalHtml += `<span class="testi-word">${word}</span>`;
                    } else {
                        finalHtml += word;
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('highlight-red')) {
                const words = node.textContent.split(/(\s+)/);
                words.forEach(word => {
                    if (word.trim().length > 0) {
                        finalHtml += `<span class="testi-word highlight-red" data-original-color="red">${word}</span>`;
                    } else {
                        finalHtml += word;
                    }
                });
            } else {
                finalHtml += node.outerHTML;
            }
        });
        element.innerHTML = finalHtml;
    };

    // Initial wrap for the first testimonial
    const initialTestiQuote = document.querySelector('#testimonial-new-quote');
    if (initialTestiQuote) wrapTestimonialWords(initialTestiQuote);

    // Video autoplay and visibility logic - optimized with per-card Intersection Observer
    if (videoCards.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                const video = card.querySelector('.video-preview');
                const placeholder = card.querySelector('.video-placeholder');

                if (video) {
                    const player = vimeoPlayers.get(video);
                    
                    if (entry.isIntersecting) {
                        // Play video when card enters viewport
                        if (player) {
                            player.play().then(() => {
                                if (placeholder) placeholder.style.opacity = '0';
                                video.style.opacity = '1';
                            }).catch(err => {
                                console.log("Autoplay failed for Vimeo video:", err);
                            });
                        } else if (video.tagName === 'VIDEO') {
                            video.play().then(() => {
                                if (placeholder) placeholder.style.opacity = '0';
                                video.style.opacity = '1';
                            });
                        }
                    }
                }
            });
        }, {
            threshold: 0.15, // Trigger when 15% of the card is visible
            rootMargin: '0px 0px -50px 0px' // Slight offset to ensure it's comfortably in view
        });

        videoCards.forEach(card => videoObserver.observe(card));
    }

    // Minimal Mute Button Logic
    const minimalMuteBtns = document.querySelectorAll('.minimal-mute-btn');
    minimalMuteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            const video = btn.closest('.video-card').querySelector('.video-preview');
            if (!video) return;

            const player = vimeoPlayers.get(video);
            
            if (player) {
                player.getMuted().then(isMuted => {
                    const newMuted = !isMuted;
                    player.setMuted(newMuted);
                    updateMuteUI(btn, newMuted);
                });
            } else if (video.tagName === 'VIDEO') {
                video.muted = !video.muted;
                updateMuteUI(btn, video.muted);
            }
        });
    });

    const updateMuteUI = (btn, isMuted) => {
        if (isMuted) {
            btn.innerHTML = `
                <svg class="mute-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
                <span class="mute-text">Unmute</span>
            `;
        } else {
            btn.innerHTML = `
                <svg class="mute-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <span class="mute-text">Mute</span>
            `;
        }
    };

    // Initially hide sections with JS, setting up the transition
    sections.forEach(section => {
        // Let hero, services, portfolio, and testimonial show immediately (they handle internal reveals)
        if (section.id !== 'hero' && !section.classList.contains('services-section') && !section.classList.contains('portfolio-section') && !section.classList.contains('testimonial-new-section')) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
        } else if (section.classList.contains('portfolio-section') || section.classList.contains('services-section') || section.classList.contains('testimonial-new-section')) {
            // Ensure they are visible
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });


    window.addEventListener('scroll', revealElements);
    // Trigger once on load
    revealElements();


    // IntersectionObserver for Service Pills Animation
    const servicesSection = document.querySelector('#services');
    const servicePills = document.querySelectorAll('.service-pill');

    if (servicesSection && servicePills.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.2 // Trigger when 20% of the section is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    servicePills.forEach(pill => {
                        pill.classList.add('animate-in');
                    });
                } else {
                    // Reverse animation: remove class when scrolling out of view
                    servicePills.forEach(pill => {
                        pill.classList.remove('animate-in');
                    });
                }
            });
        }, observerOptions);

        observer.observe(servicesSection);
    }

    // Service Detail Overlay Logic (Dynamic & Synchronized)
    const mainWrapper = document.querySelector('#main-content-wrapper');
    const serviceOverlay = document.querySelector('#service-detail-overlay');
    const closeOverlayBtn = document.querySelector('.close-overlay');
    const overlayTitle = document.querySelector('#overlay-title-text');
    const overlayItemsContainer = document.querySelector('#overlay-items-container');

    const serviceData = {
        'content-planning-pill': {
            title: '01 Content Planning',
            description: 'From trend research and content calendars to deciding exactly what to create and when ,  we handle the full content strategy so you stay consistent, relevant, and always ahead of the curve.',
            items: [
                'Following the Trends over SOCIAL MEDIA',
                'Deep Research on HOT Topics',
                'Content Scheduling',
                'Content Calendars',
                'Brand Identity Building',
                'Content Design/Template'
            ]
        },
        'video-scripting-pill': {
            title: '02 Video Scripting',
            description: 'Translating concepts into compelling narratives that resonate. We craft every line to hook attention, maintain engagement, and drive meaningful action.',
            items: [
                'Captivating Hooks Creation',
                'Audience-Centric Storytelling',
                'Script Doctoring & Polishing',
                'Tone & Voice Consistency',
                'Call-to-Action Optimization',
                'Viral Format Structuring'
            ]
        },
        'video-editing-pill': {
            title: '03 Video Editing',
            description: 'Bringing raw footage to life with rhythmic precision and visual flair. From dynamic motion graphics to cinematic color grading, we ensure every frame serves the story.',
            items: [
                'High-Energy Narrative Cutting',
                'Cinematic Color Grading',
                'Sound Design & Audio Mixing',
                'Dynamic Motion Graphics',
                'Pacing & Rhythm Optimization',
                'Multi-Platform Aspect Ratios'
            ]
        }
    };

    if (servicePills.length > 0 && serviceOverlay && mainWrapper) {
        servicePills.forEach(pill => {
            pill.addEventListener('click', () => {
                const data = serviceData[pill.id];
                if (!data) return;

                // Inject Content
                overlayTitle.textContent = data.title;
                overlayItemsContainer.innerHTML = '';

                // Add Description
                if (data.description) {
                    const descDiv = document.createElement('p');
                    descDiv.className = 'overlay-description';
                    descDiv.textContent = data.description;
                    overlayItemsContainer.appendChild(descDiv);
                }

                data.items.forEach((item, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'detail-item';
                    itemDiv.innerHTML = `
                        <span class="detail-number">0${index + 1}</span>
                        <span class="detail-text">${item}</span>
                    `;
                    overlayItemsContainer.appendChild(itemDiv);
                });

                // Synchronized "Page Moves Left" Transition
                mainWrapper.classList.add('page-out');
                serviceOverlay.classList.add('active');

                // Disable scroll
                document.body.style.overflow = 'hidden';

                // Only the close button should react in the overlay
                if (closeOverlayBtn) {
                    closeOverlayBtn.addEventListener('mouseenter', () => {
                        if (cursor) cursor.classList.add('cursor-hover');
                    });
                    closeOverlayBtn.addEventListener('mouseleave', () => {
                        if (cursor) cursor.classList.remove('cursor-hover');
                    });
                }
            });
        });

        const closeServiceOverlay = () => {
            mainWrapper.classList.remove('page-out');
            serviceOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeOverlayBtn) {
            closeOverlayBtn.addEventListener('click', closeServiceOverlay);
        }

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && serviceOverlay.classList.contains('active')) {
                closeServiceOverlay();
            }
        });
    }

    // Testimonial (New White Theme) Interactivity
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
    const prevBtn = document.querySelector('#prev-testimonial');
    const nextBtn = document.querySelector('#next-testimonial');
    const newQuoteEl = document.querySelector('#testimonial-new-quote');
    const newIndexEl = document.querySelector('#testimonial-new-index');
    const newClientNameEl = document.querySelector('#client-name');
    const newCompanyNameEl = document.querySelector('#company-name');

    if (newQuoteEl && prevBtn && nextBtn) {
        const profileSlots = document.querySelectorAll('.profile-stack .profile-placeholder');

        // Initialize background images for all profile slots
        profileSlots.forEach(slot => {
            const idx = parseInt(slot.getAttribute('data-index'));
            if (testimonialArray[idx] && testimonialArray[idx].image) {
                slot.style.backgroundImage = `url('${testimonialArray[idx].image}')`;
            }
        });

        const updateTestimonial = (index, dir = 'next') => {
            const data = testimonialArray[index];

            // Fade effect for text only
            newQuoteEl.style.opacity = '0';
            newQuoteEl.style.transform = 'translateY(10px)';

            const total = testimonialArray.length;
            const prevIndex = (index - 1 + total) % total;
            const nextIndex = (index + 1) % total;

            // Step 1: Teleport the incoming hidden element without transition
            // This prevents it from "ghosting" or sliding completely across the screen!
            profileSlots.forEach(slot => {
                const slotIdx = parseInt(slot.getAttribute('data-index'));
                if (dir === 'next' && slotIdx === nextIndex) {
                    slot.style.transition = 'none';
                    slot.className = 'profile-placeholder slot-hidden-bottom';
                    void slot.offsetWidth; // Force reflow
                    slot.style.transition = '';
                } else if (dir === 'prev' && slotIdx === prevIndex) {
                    slot.style.transition = 'none';
                    slot.className = 'profile-placeholder slot-hidden-top';
                    void slot.offsetWidth; // Force reflow
                    slot.style.transition = '';
                }
            });

            // Step 2: Apply the layout animation IMMEDIATELY (no setTimeout)
            profileSlots.forEach(slot => {
                const slotIdx = parseInt(slot.getAttribute('data-index'));
                // Clear existing slot classes
                slot.className = 'profile-placeholder';

                if (slotIdx === index) {
                    slot.classList.add('slot-center');
                } else if (slotIdx === prevIndex) {
                    slot.classList.add('slot-top');
                } else if (slotIdx === nextIndex) {
                    slot.classList.add('slot-bottom');
                } else {
                    // Send the outgoing element to the correct off-screen side organically
                    if (dir === 'next') {
                        slot.classList.add('slot-hidden-top');
                    } else {
                        slot.classList.add('slot-hidden-bottom');
                    }
                }
            });

            setTimeout(() => {
                newIndexEl.innerHTML = `${data.index}<span class="index-total">/04</span>`;

                const videoBodyContainer = document.getElementById('video-testimonial-container');
                const videoEl = document.getElementById('testimonial-video-player');

                if (data.videoBody) {
                    newQuoteEl.style.display = 'none';
                    if (videoBodyContainer && videoEl) {
                        videoBodyContainer.style.display = 'flex';
                        
                        // Handle iframe vs video element
                        if (videoEl.tagName === 'IFRAME') {
                            videoEl.src = data.videoBody;
                            // Re-initialize player for the new SRC
                            const player = new Vimeo.Player(videoEl);
                            vimeoPlayers.set(videoEl, player);
                            player.play();
                        } else {
                            videoEl.src = data.videoBody;
                            videoEl.play();
                        }
                    }
                } else {
                    if (videoBodyContainer && videoEl) {
                        videoBodyContainer.style.display = 'none';
                        if (videoEl.tagName === 'IFRAME') {
                            const player = vimeoPlayers.get(videoEl);
                            if (player) player.pause();
                        } else {
                            videoEl.pause();
                        }
                    }
                    newQuoteEl.style.display = 'block';
                    newQuoteEl.innerHTML = data.quote;
                    wrapTestimonialWords(newQuoteEl); // Wrap new quote for scrub effect

                    // Manually trigger the scrub calculation so it's not all grey when switched
                    // but only if we are already deep in the page
                    const voicesSection = document.querySelector('#voices');
                    if (voicesSection) {
                        const rect = voicesSection.getBoundingClientRect();
                        if (rect.top < window.innerHeight) {
                            // We are in or past the section, so apply current scroll progress immediately
                            const startY = window.innerHeight * 0.85;
                            const endY = window.innerHeight * 0.40;
                            const quoteRect = newQuoteEl.getBoundingClientRect();
                            let progress = (startY - quoteRect.top) / (startY - endY);
                            progress = Math.max(0, Math.min(1, progress));

                            const allTestiWords = newQuoteEl.querySelectorAll('.testi-word');
                            const wordsToFill = progress * allTestiWords.length;

                            allTestiWords.forEach((word, index) => {
                                if (index < wordsToFill) {
                                    word.style.color = (word.dataset.originalColor === 'red') ? '#FF0000' : '#000000';
                                } else {
                                    word.style.color = '#D9D9D9';
                                }
                            });
                        }
                    }
                } // Close else block

                newClientNameEl.textContent = data.name;
                newCompanyNameEl.textContent = data.company;

                newQuoteEl.style.opacity = '1';
                newQuoteEl.style.transform = 'translateY(0)';
            }, 300);
        };

        prevBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonialArray.length) % testimonialArray.length;
            updateTestimonial(currentTestimonial, 'prev');
        });

        nextBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonialArray.length;
            updateTestimonial(currentTestimonial, 'next');
        });

        // Add soft transitions for elements
        newQuoteEl.style.transition = 'all 0.4s ease';
        [newIndexEl, newClientNameEl, newCompanyNameEl].forEach(el => {
            if (el) el.style.transition = 'all 0.4s ease';
        });
    }

    // Back to Top Button Logic
    const backToTopBtn = document.querySelector('#back-to-top-btn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // IntersectionObserver for Connect Portrait Fade-up
    const connectImage = document.querySelector('.connect-image');
    if (connectImage) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    connectImage.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2 });
        observer.observe(connectImage);
    }
});


