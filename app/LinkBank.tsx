import { PlaidService } from '@/lib/PlaidService';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { create, dismissLink, LinkExit, LinkIOSPresentationStyle, LinkLogLevel, LinkSuccess, open } from 'react-native-plaid-link-sdk';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../context/AccountContext';

export default function LinkBank() {
    const { accounts, refreshData } = useAccounts();
    const [link_token, setLinkToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user_id, setUserId] = useState<string | null>(null);



    useEffect(() => {
        const initUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.id) {
                    setUserId(user.id);
                }
            } catch (error) {
                console.error("Error getting user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initUser();
    }, []);

    const handleLinkBank = async () => {
        if (!user_id) {
            console.warn("User ID is not loaded yet.");
            return;
        }
        
        setIsLoading(true);
        try {
            // 1. Fetch token on-demand
            const token = await PlaidService.getLinkToken(user_id);
            console.log("2. Plaid Link Token:", token);
            
            if (!token) {
                throw new Error("Failed to fetch Plaid link token.");
            }

            // 2. Configure and initialize the Plaid SDK
            create({ token });

            // 3. Open the link interface with a tiny delay to allow the SDK to initialize
            const timer = setTimeout(() => {
                open({
                    onSuccess: async (success: LinkSuccess) => {
                        console.log('Success', success);
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
                        } else {
                            console.log('Exchange success:', data);
                            await refreshData();
                        }
                    },
                    onExit: (linkExit: LinkExit) => {
                        console.log('Exit: ', linkExit);
                        dismissLink();
                    },
                    iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
                    logLevel: LinkLogLevel.ERROR,
                });
            }, 100);

            return () => clearTimeout(timer);
        } catch (error) {
            console.error("Error during Plaid Link process:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView>
            <View>
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
            />
            
            <View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}