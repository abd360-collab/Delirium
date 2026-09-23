interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({
    isOpen,
    onClose,
}: CartDrawerProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <aside>
            <button
                type="button"
                onClick={onClose}
            >
                Close
            </button>

            <h2>Your Cart</h2>
        </aside>
    );
}