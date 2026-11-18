import { Link } from "react-router-dom";

export function HeroSection() {
    return (
        <section
            className="hero"
            aria-labelledby="hero-title"
        >
            <div className="hero__content">
                <p className="hero__eyebrow">
                    <span
                        className="hero__eyebrow-dot"
                        aria-hidden="true"
                    />
                    DELIRIUM
                </p>

                <h1
                    id="hero-title"
                    className="hero__title"
                >
                    TASTE THE
                    <br />
                    DISORIENTATION
                </h1>

                <p className="hero__description">
                    Waffles, drinks, fries, ice cream
                    and everything in between.
                </p>

                <Link
                    to="/menu"
                    className="hero__cta"
                >
                    <span>Explore Menu</span>

                    <span
                        className="hero__cta-arrow"
                        aria-hidden="true"
                    >
                        ↗
                    </span>
                </Link>

                <p className="hero__note">
                    YOUR NEXT CRAVING STARTS HERE
                </p>
            </div>

            <div className="hero__visual">
                <div className="hero__image-wrap">
                    <img
                        src="/hero-waffle.png"
                        alt="A decadent waffle from Delirium"
                        className="hero__image"
                        fetchPriority="high"
                        decoding="async"
                    />
                </div>

                <div
                    className="hero__visual-label"
                    aria-label="The Waffle Paradox"
                >
                    <span>THE</span>

                    <strong>
                        WAFFLE
                        <br />
                        PARADOX
                    </strong>

                    <span className="hero__label-line" />
                </div>

                <span
                    className="hero__orbit"
                    aria-hidden="true"
                />
            </div>
        </section>
    );
}