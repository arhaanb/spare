import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getMerchantsCollection } from '@/lib/db/mongodb';
import { Merchant } from '@/lib/types';

export interface CreateMerchantInput {
  merchant_name: string;
  email: string;
  password: string;
  location: string;
  contact: {
    phone: string;
  };
  menu: any[];
  bag_pricing: {
    regular_bag_price: number;
    large_bag_price: number;
  };
  operating_hours: {
    opening: string;
    closing: string;
  };
}

export async function createMerchant(data: CreateMerchantInput): Promise<Merchant> {
  const collection = await getMerchantsCollection();

  // Check if email already exists
  const existingMerchant = await collection.findOne({ email: data.email });
  if (existingMerchant) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create merchant document
  const merchant: Merchant = {
    merchant_id: uuidv4(),
    merchant_name: data.merchant_name,
    email: data.email,
    password: hashedPassword,
    location: data.location,
    contact: data.contact,
    menu: data.menu,
    bag_pricing: data.bag_pricing,
    operating_hours: data.operating_hours,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await collection.insertOne(merchant);

  // Remove password from response
  const { password, ...merchantWithoutPassword } = merchant;
  return merchantWithoutPassword as Merchant;
}

export async function getMerchantByEmail(email: string): Promise<Merchant | null> {
  const collection = await getMerchantsCollection();
  const merchant = await collection.findOne({ email });

  if (!merchant) {
    return null;
  }

  return merchant as unknown as Merchant;
}

export async function getMerchantById(merchant_id: string): Promise<Merchant | null> {
  const collection = await getMerchantsCollection();
  const merchant = await collection.findOne({ merchant_id });

  if (!merchant) {
    return null;
  }

  // Remove password before returning
  const { password, ...merchantWithoutPassword } = merchant as any;
  return merchantWithoutPassword as Merchant;
}

export async function verifyMerchantPassword(
  email: string,
  password: string
): Promise<Merchant | null> {
  const merchant = await getMerchantByEmail(email);

  if (!merchant || !merchant.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, merchant.password);

  if (!isValid) {
    return null;
  }

  // Remove password before returning
  const { password: _, ...merchantWithoutPassword } = merchant;
  return merchantWithoutPassword as Merchant;
}

export async function updateMerchant(
  merchant_id: string,
  updates: Partial<Merchant>
): Promise<Merchant | null> {
  const collection = await getMerchantsCollection();

  const result = await collection.findOneAndUpdate(
    { merchant_id },
    {
      $set: {
        ...updates,
        updated_at: new Date().toISOString(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    return null;
  }

  const { password, ...merchantWithoutPassword } = result as any;
  return merchantWithoutPassword as Merchant;
}
