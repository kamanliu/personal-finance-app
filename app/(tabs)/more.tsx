import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../../context/AccountContext';

export default function more() {
  const router = useRouter()
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
  const [isSyncing, setIsSyncing] = useState(false)
  const [connectedBanks, setConnectedBanks] = useState<any[]>([])
  const { user } = useAuth();
  const { refreshData } = useAccounts();

  const handleSync = async () => {
    if (isSyncing) return; // Don't run if already syncing!
    setIsSyncing(true)
    console.log('Sync started for user:', user?.id)
    try {
      const { data, error } = await supabase.functions
        .invoke('sync-transactions', { body: { user_id: user?.id } })
      console.log('Sync response:', data, error)
      if (error) throw error;

      alert("Sync Successful!");
    } catch (e: any) {
      alert("Sync Failed: " + e.message);
    } finally {
      setIsSyncing(false);
    }

  }
  // Fetch banks on load
  useFocusEffect(
    useCallback(() => {
      const fetchBanks = async () => {
        if (!user?.id)
          return;
        const { data, error } = await supabase
          .from('plaid_items')
          .select('item_id, institution_name')
          .eq('user_id', user.id)
        if (!error) {
          setConnectedBanks(data || [])
        }
      }
      fetchBanks()
    }, [user?.id]))
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
    <SafeAreaView>
      <Text>more</Text>


      <TouchableOpacity onPress={() => router.push('/LinkBank')}><Text>Link Bank</Text></TouchableOpacity>

      <TouchableOpacity onPress={() => handleSync()} disabled={isSyncing}><Text>{isSyncing ? "Syncing..." : "Sync Transactions"}</Text></TouchableOpacity>

      {connectedBanks.map(bank => (
        <View key={bank.item_id}>
          <Text>{bank.institution_name}</Text>
          <TouchableOpacity onPress={() => handleDisconnect(bank.item_id)}>
            <Text>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => handleSignOut()}><Text>Sign Out</Text></TouchableOpacity>

    </SafeAreaView>
  )
}