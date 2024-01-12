'use server';

import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const bcrypt = require("bcrypt") 
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.' ,
  }),
  amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater that 0$.'}) ,
  status: z.enum(['pending', 'paid'] , {
    invalid_type_error: 'Please select an invoic status' ,
  }),
  date: z.string(),
});

const RegisterFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

const InsertSportSchema = z.object({
  id: z.number(),
  name: z.string().min(3, {message: "Name should be longer than 3 character"}),
  description: z.string().min(6, { message: "Description should be longer than 3 character" }),
});


const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateUser = RegisterFormSchema.omit({ id: true, date: true });
const CreateSport = InsertSportSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type SportState = {
  errors?: {
    name?: string[];
    description?: string[];
  };
  message?: string | null;
};
 
export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function createSport(prevState: SportState, formData: FormData) {
  const validatedFields = CreateSport.safeParse({
    name: formData.get('sport'),
    description: formData.get('sport_description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  const { name, description } = validatedFields.data;

  // Insert data into the database
  try {
    await sql`
      INSERT INTO sports ("name", "desc")
      VALUES ( ${name}, ${description})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/training');
  redirect('/dashboard/training');
}


  export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
  ) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }
   
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    try {
      await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Invoice.' };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }

  const hashPassword = async (password: string) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  };

  export async function registerUser(
    formData: FormData,
  ) {
      // Validate form using Zod
    const validatedFields = CreateUser.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    });
  
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
  
    // Prepare data for insertion into the database
    const { name, email, password } = validatedFields.data;
    const hashedPassword = hashPassword(password)

    // Insert data into the database
    try {
      await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${await hashedPassword})
      `;
    } catch (error) {
      // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create User.',
      };
    }
 
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/login');
    redirect('/login');
  }

  export async function deleteInvoice(id: string) {
    try{
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return{
        message: 'Deleted Invoice.',
      }
    }catch (error){
        return{
          message: 'Database error: Failed to Delete Invoice',
        }
    };
   
    
  }