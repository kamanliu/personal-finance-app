import { Tabs } from 'expo-router';
import React from 'react';

const _Layout = () => {
  return (
    <Tabs>
        <Tabs.Screen
            name = "index"
            options = {{
                title : "Home",
                headerShown:false
            }}
        />   
        <Tabs.Screen
            name = "stat"
            options = {{
                title : "Stats",
                headerShown:false
            }}
        
        />  
        <Tabs.Screen
            name = "account"
            options = {{
                title : "Accounts",
                headerShown:false
            }}
        
        />  
        <Tabs.Screen
            name = "more"
            options = {{
                title : "More",
                headerShown:false
            }}
        
        />  
        
        
        
    </Tabs> 
  )
}

export default _Layout;
