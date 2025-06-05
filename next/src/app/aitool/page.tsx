import { redirect } from 'next/navigation';

export default function AiToolIndexPage() {
  redirect('/aitool/search');
  return null;
}
