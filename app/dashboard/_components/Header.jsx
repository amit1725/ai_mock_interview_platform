"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
 
function Header() {
  
  const path = usePathname();
  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
        <Image src={'/logo.svg'} width={35} height={20} alt='logo'/>
        <ul className='hidden md:flex gap-6'>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer
                ${path === '/dashboard' && 'text-primary font-bold'}
            `}>
                <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer
                ${path === '/dashboard/questions' && 'text-primary font-bold'}
            `}>
                <Link href="/dashboard/questions">FAQ's</Link>
            </li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer
                ${path === '/dashboard/upgrade' && 'text-primary font-bold'}
            `}>
                <Link href="/dashboard/upgrade">Upgrade</Link>
            </li>
            <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer
                ${path === '/dashboard/how' && 'text-primary font-bold'}
            `}>
                <Link href="/dashboard/how">How it Works?</Link>
            </li>
        </ul>
        <UserButton/>
    </div>
  )
}

export default Header
