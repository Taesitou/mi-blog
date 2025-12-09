'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      setIsAdmin(auth === 'true');
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const baseLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Artículos' },
  ];

  const links = isAdmin 
    ? [...baseLinks, { href: '/admin', label: 'Admin' }]
    : baseLinks;

  return (
    <nav className="bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-serif text-2xl font-bold">
            Tomas Espinosa
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
