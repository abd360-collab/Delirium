export function AboutSection() {
    return (
        <section
            id="about"
            className="about-section"
            aria-labelledby="about-section-title"
        >
            <div className="about-section__intro">
                <p className="about-section__eyebrow">
                    <span
                        className="about-section__eyebrow-line"
                        aria-hidden="true"
                    />
                    THE IDEA BEHIND DELIRIUM
                </p>

                <h2
                    id="about-section-title"
                    className="about-section__title"
                >
                    NOT JUST FOOD.
                    <br />
                    A LITTLE DELICIOUS
                    <br />
                    <span>DISORIENTATION.</span>
                </h2>
            </div>

            <div className="about-section__content">
                <p className="about-section__description">
                    Delirium is a place for cravings that don't
                    follow the rules. Sweet, savoury, cold, crispy,
                    creamy — every bite is meant to take you
                    somewhere unexpected.
                </p>

                <p className="about-section__closing">
                    Come hungry.
                    <br />
                    Leave slightly disoriented.
                </p>

                <span
                    className="about-section__asterisk"
                    aria-hidden="true"
                >
                    *
                </span>
            </div>
        </section>
    );
}
