import { Feather, MaterialCommunityIcons } from '@expo/vector-icons/';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
const _Layout = () => {
    const router = useRouter();
    const pathname = usePathname();
  const showFab = ['/', '/account', '/TransactionList'].includes(pathname);
    return (
        <View style={{ flex: 1 }}>
            <Tabs>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />
                    }}
                />
                <Tabs.Screen
                    name="stat"
                    options={{
                        title: "Stats",
                        headerShown: false,
                        tabBarIcon: ({ color }) => <Feather name="pie-chart" size={24} color={color} />
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Accounts",
                        headerShown: false,
                        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bank-outline" size={24} color={color} />
                    }}
                />
                <Tabs.Screen
                    name="more"
                    options={{
                        title: "More",
                        headerShown: false,
                        tabBarIcon: ({ color }) => <Feather name="more-horizontal" size={24} color={color} />
                    }}
                />
            </Tabs>

          {showFab && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/AddTransaction')}
                    activeOpacity={0.85}
                >
                    <Feather name="plus" size={26} color="white" />
                </TouchableOpacity>
            )}
        </View>
    )
}



const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1a56db',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default _Layout;

