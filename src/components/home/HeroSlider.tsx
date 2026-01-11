import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import balenciagaImg from '../../images/Balenciaga.jpeg';
import carolChristianPoelImg from '../../images/Carol Christian Poel.jpeg';
import chromeImg from '../../images/Chrome.jpeg';
import slide2Img from '../../images/slide2.jpeg';

type Slide = {
    imageUrl: string;
    title: string;
    ctaHref?: string;
    ctaLabel?: string;
};

const SLIDE_INTERVAL_MS = 5500;

export const HeroSlider: React.FC = () => {
    const images = useMemo(() => {
        const slides: Slide[] = [
            { imageUrl: chromeImg, title: 'CHROME HEARTS', ctaHref: '/shop', ctaLabel: 'Shop Now' },
            { imageUrl: balenciagaImg, title: 'BALENCIAGA', ctaHref: '/shop', ctaLabel: 'Shop Now' },
            { imageUrl: carolChristianPoelImg, title: 'CAROL CHRISTIAN POELL', ctaHref: '/shop', ctaLabel: 'Shop Now' },
            { imageUrl: slide2Img, title: 'ARCHIVESBYBILLY', ctaHref: '/shop', ctaLabel: 'Shop Now' },
        ];

        return slides;
    }, []);

    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const pausedRef = useRef(false);

    useEffect(() => {
        pausedRef.current = isPaused || isHovering;
    }, [isPaused, isHovering]);

    const goNext = () => {
        setIndex((prev) => (prev + 1) % images.length);
    };

    const goPrev = () => {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        if (images.length <= 1) return;

        const id = setInterval(() => {
            if (pausedRef.current) return;
            setIndex((prev) => (prev + 1) % images.length);
        }, SLIDE_INTERVAL_MS);

        return () => clearInterval(id);
    }, [images.length]);

    const current = images[index];

    return (
        <section
            className="hero-section hero-slider"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onKeyDown={(e) => {
                if (images.length <= 1) return;
                if (e.key === 'ArrowLeft') goPrev();
                if (e.key === 'ArrowRight') goNext();
                if (e.key === ' ') {
                    e.preventDefault();
                    setIsPaused((p) => !p);
                }
            }}
            tabIndex={0}
            aria-label="Homepage hero slider"
        >
            <div
                className="hero-slide"
                style={
                    current.imageUrl
                        ? { backgroundImage: `url(${current.imageUrl})` }
                        : undefined
                }
            />
            <div className="hero-overlay" />

            {images.length > 1 && (
                <div className="hero-controls" aria-label="Hero controls">
                    <div className="hero-controls-center">
                        <button
                            type="button"
                            className="hero-control-btn"
                            aria-label="Previous slide"
                            onClick={goPrev}
                        >
                            <span aria-hidden="true">‹</span>
                        </button>

                        <div className="hero-counter" aria-label="Slide counter">
                            {index + 1}/{images.length}
                        </div>

                        <button
                            type="button"
                            className="hero-control-btn"
                            aria-label="Next slide"
                            onClick={goNext}
                        >
                            <span aria-hidden="true">›</span>
                        </button>

                        <button
                            type="button"
                            className="hero-control-btn hero-control-pause"
                            aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
                            onClick={() => setIsPaused((p) => !p)}
                        >
                            <span aria-hidden="true">{isPaused ? '▶' : '❚❚'}</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="hero-content">
                <h1 className="hero-title">{current.title}</h1>
                <Link to={current.ctaHref || '/shop'} className="hero-cta">
                    {current.ctaLabel || 'Shop Now'}
                </Link>

                {images.length > 1 && (
                    <div className="hero-dots" aria-label="Hero slides">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`hero-dot ${i === index ? 'active' : ''}`}
                                aria-label={`Go to slide ${i + 1}`}
                                onClick={() => setIndex(i)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
