import type { Ref } from 'react';

type Props = {
    isOpen: boolean;
    onClick: (isOpen: boolean) => void;
    label?: string;
    controlsId?: string;
    buttonRef?: Ref<HTMLButtonElement>;
};

const BurgerButton = (props: Props) => {
    const { isOpen, onClick, label = 'Menu', controlsId, buttonRef } = props;

    return (
        <button
            ref={buttonRef}
            type="button"
            aria-label={label}
            aria-expanded={isOpen}
            aria-controls={controlsId}
            className="relative flex items-center justify-center size-12 cursor-pointer focus-visible:outline-2"
            onClick={() => {
                onClick(!isOpen);
            }}
        >
            <span
                className={`absolute left-1/2 w-8 h-0.5 bg-fg-base transition-[translate,rotate] duration-200 motion-reduce:transition-none -translate-x-1/2 ${
                    isOpen ? 'rotate-45' : '-translate-y-[9px]'
                }`}
            />
            <span
                className={`absolute left-1/2 w-8 h-0.5 bg-fg-base transition-opacity duration-200 motion-reduce:transition-none -translate-x-1/2 ${
                    isOpen ? 'opacity-0' : 'opacity-100'
                }`}
            />
            <span
                className={`absolute left-1/2 w-8 h-0.5 bg-fg-base transition-[translate,rotate] duration-200 motion-reduce:transition-none -translate-x-1/2 ${
                    isOpen ? '-rotate-45' : 'translate-y-[9px]'
                }`}
            />
        </button>
    );
};

export default BurgerButton;
