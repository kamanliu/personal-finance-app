import { PlaidService } from '@/lib/PlaidService';
import { supabase } from '@/lib/supabase';

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
// @ts-ignore
import { create, dismissLink, LinkExit, LinkIOSPresentationStyle, LinkLogLevel, LinkSuccess, open } from 'react-native-plaid-link-sdk';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../context/AccountContext';

export default function LinkBank() {
    const { refreshData } = useAccounts();
    const { reconnectItemId } = useLocalSearchParams<{ reconnectItemId?: string }>();
    const [link_token, setLinkToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user_id, setUserId] = useState<string | null>(null);

    const handleLinkBank = async (user_id: string | null) => {
        if (!user_id) {
            console.warn("User ID is not loaded yet.");
            return;
        }

        setIsLoading(true);
        try {
            let token: string | null = null;

            if (reconnectItemId) {
                // RECONNECT FLOW: get an update-mode token for this specific item
                const { data, error } = await supabase.functions.invoke('create-update-link-token', {
                    body: { item_id: reconnectItemId }
                });
                if (error || !data?.link_token) {
                    throw new Error(error?.message || "Failed to fetch update link token.");
                }
                token = data.link_token;
            } else {
                // NORMAL FLOW: brand new bank connection
                token = await PlaidService.getLinkToken(user_id);
            }
            console.log("Plaid Link Token:", token);

            if (!token) {
                throw new Error("Failed to fetch Plaid link token.");
            }

            // 2. Configure and initialize the Plaid SDK
            create({ token });

            // 3. Open the link interface with a tiny delay to allow the SDK to initialize
            setTimeout(() => {
                open({
                    onSuccess: async (success: LinkSuccess) => {
                        console.log('Success', success);
                        if (reconnectItemId) {
                            // Reconnect: just clear the login_required flag, no new token exchange needed
                            const { error } = await supabase
                                .from('plaid_items')
                                .update({ status: 'active' })
                                .eq('item_id', reconnectItemId);

                            if (error) console.error('Failed to clear status:', error);
                            await refreshData();
                            router.back();
                            return;
                        }
                        const publicToken = success.publicToken;
                        const institutionName = success.metadata.institution?.name;

                        const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
                            body: {
                                public_token: publicToken,
                                user_id: user_id,
                                institution_name: institutionName
                            }
                        });

                        if (error) {
                            console.error('Exchange failed:', error);
                            setIsLoading(false); // Turn off loading if exchange fails
                        } else {
                            console.log('Exchange success:', data);
                            await refreshData();
                            router.back(); // Send them back to settings screen
                        }
                    },
                    onExit: (linkExit: LinkExit) => {
                        console.log('Exit: ', linkExit);
                        dismissLink();
                        setIsLoading(false); // Turn off loading here so they can see retry button
                        router.back(); // Go back automatically when they close Plaid
                    },
                    iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
                    logLevel: LinkLogLevel.ERROR,
                });
            }, 100);


        } catch (error) {
            console.error("Error during Plaid Link process:", error);

            setIsLoading(false); // Turn off loading ONLY if configuration explicitly fails

        }
    }
    useEffect(() => {
        const initUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.id) {
                    setUserId(user.id);
                    // Run the function immediately upon getting the ID!
                    await handleLinkBank(user.id);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error getting user:", error);
                setIsLoading(false);
            }
        };
        initUser();
    }, []);



    return (
        <SafeAreaView>
            {/* <View>
                <TouchableOpacity 
                    disabled={isLoading} 
                    onPress={handleLinkBank}
                    style={{ opacity: isLoading ? 0.5 : 1 }}
                >
                    <Text>Link Bank Account</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View>
                        <Text>{`${item.name} $${(item.balance ?? 0).toFixed(2)}`}</Text>
                    </View>
                )}
            /> */}
            <View style={{ alignItems: 'center' }}>
                {isLoading ? (
                    <>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={{ marginTop: 12, color: '#8E8E93', fontSize: 16 }}>
                            {reconnectItemId ? "Reconnecting your bank..." : "Opening secure bank connection..."}
                        </Text>
                    </>
                ) : (
                    // Fallback retry button if their internet drops or an authorization token fails
                    <TouchableOpacity
                        onPress={() => handleLinkBank(user_id)}
                        style={{ backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry Bank Connection</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 40 }}>
                <Text style={{ color: '#FF3B30', fontSize: 16 }}>Cancel and Go Back</Text>
            </TouchableOpacity>

        </SafeAreaView>

    );
}