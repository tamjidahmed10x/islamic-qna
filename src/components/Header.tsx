import { Book, Menu, Shield, Sunset, Trees, Zap } from 'lucide-react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: Array<MenuItem>
}

interface NavbarProps {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  menu?: Array<MenuItem>
  auth?: {
    login: {
      title: string
      url: string
    }
    signup: {
      title: string
      url: string
    }
  }
}

const Header = ({
  logo = {
    url: '/',
    src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
    alt: 'ইসলামিক প্রশ্নোত্তর',
    title: 'ইসলামিক প্রশ্নোত্তর',
  },
  menu = [
    { title: 'হোম', url: '/' },
    { title: 'সকল প্রশ্নোত্তর', url: '/questions' },
    { title: 'প্রশ্ন করুন', url: '/questions' },
    { title: 'প্রোফাইল', url: '/profile' },
    {
      title: 'শিক্ষা',
      url: '#',
      items: [
        {
          title: 'কুরআন',
          description: 'পবিত্র কুরআন এবং এর শিক্ষা সম্পর্কে জানুন',
          icon: <Book className="size-5 shrink-0" />,
          url: '/questions?category=কুরআন',
        },
        {
          title: 'হাদিস',
          description: 'নবী মুহাম্মদ (সা.) এর বাণী এবং কর্ম সম্পর্কে জানুন',
          icon: <Trees className="size-5 shrink-0" />,
          url: '/questions?category=হাদিস',
        },
        {
          title: 'নামাজ',
          description: 'নামাজ এবং এর নিয়ম সম্পর্কে জানুন',
          icon: <Sunset className="size-5 shrink-0" />,
          url: '/questions?category=নামাজ',
        },
        {
          title: 'রোজা',
          description: 'রোজা এবং রমজান সম্পর্কে জানুন',
          icon: <Zap className="size-5 shrink-0" />,
          url: '/questions?category=রোজা',
        },
      ],
    },
  ],
  auth = {
    login: { title: 'লগইন', url: '#' },
    signup: { title: 'সাইন আপ', url: '#' },
  },
}: NavbarProps) => {
  const user = useQuery(api.users.getCurrentUser)
  return (
    <section className="py-4 shadow-xs border-b ">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                  {user?.role === 'admin' && (
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        href="/admin"
                        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <Shield className="size-4 mr-2" />
                        অ্যাডমিন
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  {auth.login.title}
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">{auth.signup.title}</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
            </SignedIn>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img
                        src={logo.src}
                        className="max-h-8 dark:invert"
                        alt={logo.alt}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                    {user?.role === 'admin' && (
                      <a
                        href="/admin"
                        className="text-md font-semibold flex items-center gap-2"
                      >
                        <Shield className="size-4" />
                        অ্যাডমিন প্যানেল
                      </a>
                    )}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button variant="outline">{auth.login.title}</Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button>{auth.signup.title}</Button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex justify-center">
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox: 'w-10 h-10',
                            },
                          }}
                        />
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  )
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </a>
  )
}

export default Header
