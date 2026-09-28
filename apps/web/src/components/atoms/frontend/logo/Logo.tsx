import Image from 'next/image';
import { cn } from '@/lib/utilities/ui';

type Props = {
    variant?: 'full' | 'icon';
    className?: string;
};

const Logo = ({ variant = 'icon', className }: Props) => (
    <Image
        src={variant === 'full' ? '/images/svgs/logo-big.svg' : '/images/svgs/logo-small.svg'}
        alt=""
        width={variant === 'full' ? 1620 : 78}
        height={variant === 'full' ? 272 : 61}
        className={cn(className)}
        priority
        unoptimized
    />
);

export default Logo;
