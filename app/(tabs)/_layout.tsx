import { Feather, MaterialCommunityIcons } from '@expo/vector-icons/';
import { Tabs } from 'expo-router';
import React from 'react';

const _Layout = () => {
    return (
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
    )
}



export default _Layout;

