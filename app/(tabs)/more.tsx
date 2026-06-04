import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'expo-router';

import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../../context/AccountContext';


export default function more() {
  const router = useRouter()
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const [connectedBanks, setConnectedBanks] = useState<any[]>([])
  const { user } = useAuth();
  const [localSyncing, setLocalSyncing] = useState(false);
  const { refreshData, isSyncing } = useAccounts();
  const showSyncing = isSyncing || localSyncing;
  const handleSync = async () => {

    if (isSyncing || localSyncing) return; // Don't run if already syncing!

    try {
      setLocalSyncing(true);
      const { data, error } = await supabase.functions
        .invoke('sync-transactions', { body: { user_id: user?.id } })
      console.log('Sync response:', data, error)
      if (error) throw error;
      
      alert("Sync Successful!");

    } catch (e: any) {
      alert("Sync Failed: " + e.message);
    } finally {
      setLocalSyncing(false); // 2. Turn off when done
    }
  }
  // Fetch banks on load
  useEffect(() => {
    if (!user?.id) return;
    const fetchBanks = async () => {
      const { data, error } = await supabase
        .from('plaid_items')
        .select('id, item_id, institution_name')
        .eq('user_id', user.id)
      if (!error) {
        setConnectedBanks(data || [])
      }
    }
    fetchBanks()
  }, [user?.id])

  // Listen for bank connections or disconnects live
  useEffect(() => {
    if (!user?.id) return;

    const banksChannel = supabase
      .channel(`banks-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plaid_items',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Bank table mutation caught:", payload.eventType);

          if (payload.eventType === 'INSERT') {
            setConnectedBanks(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            // SAFE CHECK: Fallback to matching database primary key 'id' 
            // if 'item_id' returns blank on delete events
            setConnectedBanks(prev => prev.filter(b =>
              b.id !== payload.old.id && b.item_id !== payload.old.item_id
            ));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(banksChannel);
    };
  }, [user?.id]);

  const handleDisconnect = async (ItemId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('plaid-disconnect', {
        body: {
          user_id: user?.id,
          item_id: ItemId
        }
      })
      if (error) throw error;
      if (data?.success) {
        await refreshData();
        alert("Bank disconnected successfully!")
        setConnectedBanks(prev => prev.filter(b => b.item_id !== ItemId));
      }
    }

    catch (e: any) {
      alert("Disconnect failed: " + e.message)
    }

  }


return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
    {/* Header */}
    <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1a1a1a' }}>Account Settings</Text>
    </View>

    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      
      {/* Action Buttons Section */}
      <View style={{ gap: 12, marginBottom: 32 }}>
        <TouchableOpacity 
          onPress={() => router.push('/LinkBank')}
          style={{ 
            backgroundColor: '#007AFF', 
            paddingVertical: 14, 
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Link Bank Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => handleSync()} 
          disabled={showSyncing}
          style={{ 
            backgroundColor: showSyncing ? '#ddd' : '#34C759', 
            paddingVertical: 14, 
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: showSyncing ? 0.7 : 1
          }}
        >
          
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {showSyncing ? "Syncing..." : "Sync Transactions"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connected Banks Section */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 }}>
          Connected Banks ({connectedBanks.length})
        </Text>
        
        {connectedBanks.length === 0 ? (
          <View style={{ 
            backgroundColor: '#fff', 
            padding: 16, 
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#8E8E93', fontSize: 14 }}>No banks connected yet</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {connectedBanks.map(bank => (
              <View 
                key={bank.item_id || bank.id}
                style={{ 
                  backgroundColor: '#fff', 
                  padding: 14, 
                  borderRadius: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeftWidth: 4,
                  borderLeftColor: '#007AFF'
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#1a1a1a', flex: 1 }}>
                  {bank.institution_name}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleDisconnect(bank.item_id)}
                  style={{ padding: 8 }}
                >
                  <Text>disconnect</Text>
                  
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

    </View>

    {/* Sign Out Button - Bottom */}
    <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      <TouchableOpacity 
        onPress={() => handleSignOut()}
        style={{ 
          paddingVertical: 14, 
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1.5,
          borderColor: '#FF3B30'
        }}
      >
        
        <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
)
}