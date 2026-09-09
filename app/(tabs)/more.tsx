import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'expo-router';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ButtonCard } from '../../components/ui/ButtonCard';
import { useAccounts } from '../../context/AccountContext';

export default function more() {
  const router = useRouter()
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const [connectedBanks, setConnectedBanks] = useState<any[]>([])
  const { user } = useAuth();
  const [localSyncing, setLocalSyncing] = useState(false);
  const { refreshData, isSyncing, getAccountById, accounts } = useAccounts();
  const showSyncing = isSyncing || localSyncing;


  const handleSync = useCallback(async (silent = false) => {

    if (isSyncing || localSyncing) return; // Don't run if already syncing!

    try {
      setLocalSyncing(true);
      const { data, error } = await supabase.functions
        .invoke('sync-transactions', { body: { user_id: user?.id } })
      console.log('Sync response:', data, error)
      if (error) throw error;
      // Refresh the shared global context so the UI graphs & balances update
      await refreshData();
      if (!silent) {
        alert("Sync Successful!");
      }
    } catch (e: any) {
      if (!silent) {
        alert("Sync Failed: " + e.message);
      } else {
        console.error("Automated background sync failed:", e.message);
      }
    } finally {
      setLocalSyncing(false); // 2. Turn off when done
    }
  }, [user?.id, isSyncing, localSyncing, refreshData]);

  // Fetch banks on load
  useEffect(() => {
    if (!user?.id) return;
    const fetchBanks = async () => {
      const { data, error } = await supabase
        .from('plaid_items')
        .select('id, item_id, institution_name, status')
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
        async (payload) => {
          console.log("Bank table mutation caught:", payload.eventType);

          if (payload.eventType === 'INSERT') {
            setConnectedBanks(prev => [...prev, payload.new]);
            setTimeout(() => {
              handleSync(true);
            }, 1000);
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
  }, [user?.id, handleSync]);

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
  const handleReconnect = (itemId: string) => {
    router.push({ pathname: '/LinkBank', params: { reconnectItemId: itemId } });
  }
  const confirmDisconnect = (itemId: string) => {
    Alert.alert(
      "Disconnect Bank?",
      "Are you sure you want to disconnect this bank account? You can reconnect it later.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled disconnect"),
          style: "cancel"
        },
        {
          text: "Disconnect",
          onPress: () => handleDisconnect(itemId),
          style: "destructive"
        }
      ]
    )
  }

  const confirmSignOut = () => {
    Alert.alert(
      "Sign Out?",
      "Are you sure you want to sign out? You'll need to log in again to access your account.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled sign out"),
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: () => handleSignOut(),
          style: "destructive"
        }
      ]
    )
  }

  return (
    <SafeAreaView style={{ padding: 10 }}>

        <View >
          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
            Account Settings
          </Text>
        </View>
              <ScrollView>
        <View style={styles.cardContainer}>
          <Text style={styles.headerText} >BANK CONNECTIONS</Text>
          <ButtonCard
            iconSet={"feather"}
            icon={"link-2"}
            iconColor={"#1a56db"}
            text1={"Link Bank Account"}
            text2={"Connect a new bank or institution"}
            text3={'⟩'}
            onSelect={() => router.push('/LinkBank')}

          />
          <ButtonCard
            iconSet={"ionicons"}
            icon={"sync-outline"}
            iconColor={"#40b5b3"}
            text1={showSyncing ? "Syncing..." : "Sync Transactions"}
            text2={showSyncing ? "Syncing now…" : "Pull latest transactions from all accounts"}
            text3={'⟩'}
            onSelect={() => handleSync(false)} disabled={showSyncing}
          />
        </View>

        {/* Connected Banks Section */}


        <View style={styles.cardContainer}>
          <Text style={styles.headerText} >CONNECTED BANKS</Text>
          {connectedBanks.length === 0 ? (
            <Text style={{ color: '#999' }}>No banks connected yet</Text>
          ) : (
            <View>
              {connectedBanks.map(bank => {
                const accountsUnderBank = accounts.filter(acc => acc.plaid_item_id === bank.id);
                return (
                  <View key={bank.item_id || bank.id}>
                    {bank.status === 'login_required' && (
                      <TouchableOpacity
                        onPress={() => handleReconnect(bank.item_id)}
                        style={{ padding: 8, backgroundColor: '#fff3cd', borderRadius: 4, marginBottom: 8 }}
                      >
                        <Text style={{ color: '#856404' }}>⚠️ Reconnect Required</Text>
                      </TouchableOpacity>
                    )}


                    <ButtonCard
                      iconSet={"entypo"}
                      icon={"link"}
                      iconColor={"#10b981"}
                      text1={bank.institution_name}
                      text2={`${accountsUnderBank.length} account${accountsUnderBank.length !== 1 ? 's' : ''} connected`}
                      text3={'⟩'}
                      insideButton={() => confirmDisconnect(bank.item_id)}
                      insideButtonText={"Disconnect"}
                      insideIconSet={"antDesign"}
                      insideIcon={"disconnect"}
                    />
                  </View>
                )
              })}
            </View>
          )}
        </View>



        <View style={styles.cardContainer}>
          <Text style={styles.headerText} >PREFERENCES</Text>
          <ButtonCard
            iconSet={"ionicons"}
            icon={"notifications-outline"}
            iconColor={"#8d2de0"}
            text1={"Notifications"}
            text2={"Budget alerts and weekly summaries"}
            text3={'⟩'}
            onSelect={() => router.push('/LinkBank')}

          />
          <ButtonCard
            iconSet={"materialIcons"}
            icon={"currency-exchange"}
            iconColor={"#ecbb18"}
            text1={"Currency"}
            text2={"CAD — Canadian Dollar"}
            text3={'⟩'}
            onSelect={() => router.push('/LinkBank')}
          />

          <ButtonCard
            iconSet={"materialIcons"}
            icon={"privacy-tip"}
            iconColor={"#109db9"}
            text1={"Privacy & Security"}
            text2={"Biometrics, PIN, data export"}
            text3={'⟩'}
            onSelect={() => router.push('/LinkBank')}
          />

        </View>



        {/* Spacer - Pushes buttons to bottom */}
        <View style={{ flex: 1 }} />

        {/* Bottom Section - Dangerous Actions */}
        <View style={{ paddingTop: 16 }}>
          <TouchableOpacity
            onPress={() => confirmSignOut()}
            style={styles.insideButtonStyle}
          >
            <Text style={{ color: '#cc0000' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    flexDirection: 'column',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20
  },
  card: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 7,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'


  },
  headerText: {
    color: '#5a5959',
    padding: 10,
    paddingLeft: 15,
    fontSize: 13
  },

  iconStyle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',

  },
  insideButtonStyle: {
    padding: 10,
    backgroundColor: "#ef444412",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ef444430",
    alignItems: 'center',
    margin: 18,
    marginTop: 5


  }
})