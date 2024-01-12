import Form from '@/app/ui/training/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
    title: 'Create Invoice',
  };
  
export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Training', href: '/dashboard/training' },
          {
            label: 'Create Training',
            href: '/dashboard/training/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}