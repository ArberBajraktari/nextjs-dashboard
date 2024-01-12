'use client'
import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  BoltIcon, 
  WalletIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createInvoice, createSport } from '@/app/lib/actions';
import { useFormState } from 'react-dom';

interface SportCardProps {
    sport: {
      name: string;
      desc: string;
    };
    index: number;
  }

export default function SportCard({ sport, index }: SportCardProps) {
  return (
    <>
        <div className="rounded-xl bg-gray-50 p-2 shadow-sm w-full my-6" key={index}>
            <div className="flex p-4">
                <h3 className="ml-2 text-sm font-medium">{sport.name}</h3>
            </div>
            <p className={`truncate rounded-xl bg-white px-4 py-6 text-base italic`}>
                {sport.desc}
            </p>
        </div>
    </>
  );
}
