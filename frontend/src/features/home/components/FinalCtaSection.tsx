
import { Link } from "react-router-dom";



export function FinalCtaSection() {
    return (
        <section
            className="final-cta"
            aria-labelledby="final-cta-title"
        >
            <div className="final-cta__content">
                <p className="final-cta__eyebrow">
                    ONE MORE BITE
                </p>

                <h2
                    id="final-cta-title"
                    className="final-cta__title"
                >
                    COME HUNGRY.
                    <br />
                    LEAVE DELIRIOUS.
                </h2>

                <p className="final-cta__description">
                    Waffles, shakes, fries, ice cream and
                    everything in between.
                </p>

                <Link
                    to="/menu"
                    className="final-cta__button"
                >
                    <span>Explore the Menu</span>
                    <span
                        className="final-cta__button-arrow"
                        aria-hidden="true"
                    >
                        ↗
                    </span>
                </Link>
            </div>
        </section>
    );
}
