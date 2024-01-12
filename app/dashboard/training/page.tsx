import { Metadata } from 'next';
import { CreateTraining } from '@/app/ui/invoices/buttons';
import { fetchSportActivity } from '@/app/lib/data';
import { Sport } from '@/app/lib/definitions';
import { lusitana } from '@/app/ui/fonts';
import SportCard from '@/app/ui/training/sport-card';
 
export const metadata: Metadata = {
    title: 'Training',
  };

export default async function Page() {
  const sportActivity = await fetchSportActivity()
    return (
      <>
        <h1 className={`${lusitana.className} text-2xl`}>Training</h1>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <div />
          <CreateTraining />
        </div>
        <div className="mt-4 gap-2 md:mt-8">
          {sportActivity ? (
            sportActivity.map((sport, index) => 
            <SportCard sport={sport} index={index} key={index} />
            )
          ) : (
            <p>No items available.</p>
          )}
        </div>
      </>
    
    );
  }