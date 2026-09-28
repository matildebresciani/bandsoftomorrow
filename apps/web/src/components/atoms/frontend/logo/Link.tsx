import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utilities/ui';
import Logo from './Logo';

type Props = {
    variant?: 'full' | 'icon' | 'responsive';
    className?: string;
    label?: string;
};

const LogoLink = ({ variant = 'icon', className, label = 'Bands of Tomorrow — home' }: Props) => (
    <Link href="/" aria-label={label} className={cn('inline-flex focus-visible:outline-2', className)}>
        {variant === 'responsive' ? (
            <>
                <Logo variant="full" className="site-header__logo--full" />
                <Logo variant="icon" className="site-header__logo--compact" />
            </>
        ) : (
            <Logo variant={variant} />
        )}
    </Link>
);

export default LogoLink;
