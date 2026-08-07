/**
 * B3: Operator dashboard placeholder — redirects to /operator/dashboard
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OperatorIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/operator/dashboard'); }, []);
  return null;
}
