'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase-client';

export default function ConnectionTest() {
    const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function testConnection() {
            try {
                // Test connection by making a simple query
                const { data, error } = await supabase
                    .from('community_post')
                    .select('*')
                    .limit(1);

                if (error) {
                    throw error;
                }

                // Alternative test: get system time from Supabase
                // const { data: timeData, error: timeError } = await supabase.rpc('get_current_timestamp');

                // if (timeError) {
                //     throw timeError;
                // }

                // setData({
                //     tables: data,
                //     serverTime: timeData
                // });
                setConnectionStatus('success');
            } catch (err: any) {
                console.error('Supabase connection error:', err);
                setError(err.message || 'Unknown connection error');
                setConnectionStatus('error');
            }
        }

        testConnection();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>

            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <div className="flex items-center justify-center mb-6">
                    {connectionStatus === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-700">Testing connection to Supabase...</p>
                        </div>
                    )}

                    {connectionStatus === 'success' && (
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mt-4 text-green-600">Connection Successful!</h2>
                            <p className="mt-2 text-gray-700">Your application is properly connected to Supabase.</p>

                            {data && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full text-left">
                                    <h3 className="font-medium text-gray-900 mb-2">Server Information:</h3>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Server Time:</span> {data.serverTime ? new Date(data.serverTime).toLocaleString() : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Available Tables:</span> {data.tables ? data.tables.length : 0}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {connectionStatus === 'error' && (
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mt-4 text-red-600">Connection Failed</h2>
                            <p className="mt-2 text-gray-700">Unable to connect to Supabase.</p>

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 rounded-lg w-full">
                                    <h3 className="font-medium text-gray-900 mb-2">Error Details:</h3>
                                    <p className="text-sm text-red-700 break-words">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Troubleshooting Tips:</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Verify that your Supabase URL and Anon Key are correctly set in your environment variables</li>
                        <li>Check that your Supabase project is active and running</li>
                        <li>Ensure your IP is allowed in Supabase's access controls</li>
                        <li>Check for any network issues or firewall restrictions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
