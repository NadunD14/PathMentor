// 'use client';

// import { useState, useEffect } from 'react';
// import { getSession } from '@/lib/auth';
// import { Session } from '@supabase/supabase-js';

// export function useSession() {
//     const [session, setSession] = useState<Session | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<Error | null>(null);

//     useEffect(() => {
//         async function loadSession() {
//             try {
//                 const sessionData = await getSession();
//                 setSession(sessionData);
//             } catch (err) {
//                 console.error('Error loading session:', err);
//                 setError(err instanceof Error ? err : new Error('Failed to load session'));
//             } finally {
//                 setLoading(false);
//             }
//         }

//         loadSession();
//     }, []);

//     return { session, loading, error };
// }
