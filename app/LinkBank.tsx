import { PlaidService } from '@/lib/PlaidService';
import { supabase } from '@/lib/supabase';

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-ignore
import { create, dismissLink, LinkExit, LinkIOSPresentationStyle, LinkLogLevel, LinkSuccess, open } from 'react-native-plaid-link-sdk';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../context/AccountContext';

export default function LinkBank() {
    const { refreshData } = useAccounts();
    const { reconnectItemId } = useLocalSearchParams<{ reconnectItemId?: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [showIntro, setShowIntro] = useState(!reconnectItemId); // skip intro for reconnect flow
    const [user_id, setUserId] = useState<string | null>(null);

    const handleLinkBank = async (user_id: string | null) => {
        if (!user_id) {
            console.warn("User ID is not loaded yet.");
            return;
        }

        setShowIntro(false);
        setIsLoading(true);
        try {
            let token: string | null = null;

            if (reconnectItemId) {
                const { data, error } = await supabase.functions.invoke('create-update-link-token', {
                    body: { item_id: reconnectItemId }
                });
                if (error || !data?.link_token) {
                    throw new Error(error?.message || "Failed to fetch update link token.");
                }
                token = data.link_token;
            } else {
                token = await PlaidService.getLinkToken(user_id);
            }
            console.log("Plaid Link Token:", token);

            if (!token) {
                throw new Error("Failed to fetch Plaid link token.");
            }

            create({ token });

            setTimeout(() => {
                open({
                    onSuccess: async (success: LinkSuccess) => {
                        console.log('Success', success);
                        if (reconnectItemId) {
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
                            setIsLoading(false);
                        } else {
                            console.log('Exchange success:', data);
                            await refreshData();
                            router.back();
                        }
                    },
                    onExit: (linkExit: LinkExit) => {
                        console.log('Exit: ', linkExit);
                        dismissLink();
                        setIsLoading(false);
                        router.back();
                    },
                    iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
                    logLevel: LinkLogLevel.ERROR,
                });
            }, 100);

        } catch (error) {
            console.error("Error during Plaid Link process:", error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const initUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.id) {
                    setUserId(user.id);
                    if (reconnectItemId) {
                        // Reconnect flow: skip the intro screen, go straight to Plaid
                        await handleLinkBank(user.id);
                    }
                    // Normal flow: wait for the user to tap "Continue" on the intro screen
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
        <SafeAreaView style={{ flex: 1 }}>
            {showIntro ? (
                <View style={styles.introContainer}>
                    <Text style={styles.introTitle}>🏦 Demo Bank Connection</Text>
                    <Text style={styles.introSubtitle}>
                        This app uses Plaid's sandbox environment — no real bank login required.
                        On the next screen, search for "First Platypus Bank"
                        and use these sandbox credentials:
                    </Text>

                    <View style={styles.credentialsCard}>
                        <View style={styles.credentialRow}>
                            <Text style={styles.credentialLabel}>Username</Text>
                            <Text style={styles.credentialValue}>user_good</Text>
                        </View>
                        <View style={styles.credentialRow}>
                            <Text style={styles.credentialLabel}>Password</Text>
                            <Text style={styles.credentialValue}>pass_good</Text>
                        </View>
                        <View style={styles.credentialRow}>
                            <Text style={styles.credentialLabel}>2FA (if asked)</Text>
                            <Text style={styles.credentialValue}>1234</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => handleLinkBank(user_id)}
                        disabled={!user_id}
                    >
                        <Text style={styles.continueButtonText}>Continue to Plaid</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                        <Text style={{ color: '#FF3B30', fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center' }}>
                        {isLoading ? (
                            <>
                                <ActivityIndicator size="large" color="#007AFF" />
                                <Text style={{ marginTop: 12, color: '#8E8E93', fontSize: 16 }}>
                                    {reconnectItemId ? "Reconnecting your bank..." : "Opening secure bank connection..."}
                                </Text>
                            </>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleLinkBank(user_id)}
                                style={{ backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
                            >
                                <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry Bank Connection</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 40, alignSelf: 'center' }}>
                        <Text style={{ color: '#FF3B30', fontSize: 16 }}>Cancel and Go Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    introContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    introTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    introSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    credentialsCard: {
        backgroundColor: '#f2f3f7',
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
    },
    credentialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    credentialLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    credentialValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111',
    },
    continueButton: {
        backgroundColor: '#1a56db',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
