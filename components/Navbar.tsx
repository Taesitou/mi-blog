'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Artículos' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-serif text-2xl font-bold">
            Mi Blog
          </Link>
          
          <ul className="flex gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`hover:text-neutral-300 transition-colors ${
                    pathname === link.href ? 'text-white font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
