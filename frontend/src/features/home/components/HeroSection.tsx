export function HeroSection() {
    return (
        <section className="hero">
            <div className="hero__content">
                <p className="hero__eyebrow">
                    DELIRIUM
                </p>

                <h1 className="hero__title">
                    TASTE THE
                    <br />
                    DISORIENTATION
                </h1>

                <p className="hero__description">
                    Waffles, drinks, fries, ice cream
                    and everything in between.
                </p>

                <a
                    href="/menu"
                    className="hero__cta"
                >
                    Explore Menu
                </a>
            </div>

            <div className="hero__visual">
    <div className="hero__image-wrap">
        <img
            src="YOUR_WORKING_MENU_IMAGE_URL"
            alt="Delirium signature waffle"
            className="hero__image"
        />
    </div>

    <div className="hero__visual-label">
        <span>THE</span>
        <strong>
            WAFFLE
            <br />
            PARADOX
        </strong>
    </div>
</div>
        </section>
    );
}