import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg"
        className="max-h-8 dark:invert"
        alt="ইসলামিক প্রশ্নোত্তর"
      />
      <span className="text-lg font-semibold tracking-tighter">
        ইসলামিক প্রশ্নোত্তর
      </span>
    </div>
  )
}

export default Logo
