import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Account, useAccounts } from '../../context/AccountContext';

export default function AccountScreen() {

  const { accounts, deleteAccount, refreshData } = useAccounts();
  const router = useRouter();
  useFocusEffect(
  useCallback(() => {
    refreshData();
  }, [])
);

  // groupBytype is a object
  const groupBytype = accounts.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }

    acc[item.type].push(item);
    return acc
  }, {} as Record<string, Account[]>
    // telling typescript that im create piles where label is
    // a string and the contents are arrays of strings
  )
  const displayOrder = Object.keys(groupBytype);

  const balanceSummary = useMemo(() => {
    return accounts.reduce((accumulator, account) => {
      const bal = account.balance || 0;
      if (bal > 0) {
        accumulator.assets += bal;
      }
      else {
        accumulator.liabilities += Math.abs(bal)
      }
      accumulator.total += bal;

      return accumulator

    }, { assets: 0, liabilities: 0, total: 0 })
  }, [accounts])

  return (
    <SafeAreaView style={styles.content_container} >
      <View style={styles.header}>
        <Text style={styles.header_text}>Accounts</Text>
        <TouchableOpacity style={styles.button_container} onPress={() => router.push('/AddAccount')}>
          <Text >+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.header_text}>Assets</Text>
        <Text style={styles.header_text}>Liabilities</Text>
        <Text style={styles.header_text}>Total</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.header_text}>${balanceSummary.assets.toLocaleString()}</Text>
        <Text style={styles.header_text}>${balanceSummary.liabilities.toLocaleString()}</Text>
        <Text style={styles.header_text}>${balanceSummary.total.toLocaleString()}</Text>
      </View>

      <ScrollView style={styles.listAccount} >

        {displayOrder.map((type) => {
          const typeAccounts = groupBytype[type]
          if (!typeAccounts || typeAccounts.length === 0)
            return null
          return (
            <View key={type} >
              <Text style={styles.sectionHeader}>{type}</Text>

              {typeAccounts.map((item) => (

                <View style={styles.listContainer} key={item.id}>

                  <TouchableOpacity onPress={() => router.push({ pathname: '/TransactionList', params: { accountId: item.id } })}>
                    {/* when you tap a specific item, it passes that specific string to the handler */}
                    <Text style={styles.textStyle}>  {`${item.name} • ${item.balance}`}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delete_button} onPress={() => deleteAccount(item.id)}>
                    <Text >Delete</Text>
                  </TouchableOpacity>

                </View>

              ))}
            </View>
          )
        })}
        <TouchableOpacity style={styles.button_container} onPress={() => router.push('/AddTransaction')}>
          <Text >+</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  content_container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5, // 4. Space out the text and the "+" button from the edges.
    borderBottomWidth: 1,
    borderBottomColor: '#eee',

  },
  header_text: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    flex: 1,
  },

  listAccount: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  button_container: {
    fontSize: 16,

    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'right',
    padding: 10

  },

  delete_button: {
    textAlign: 'right',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    color: 'red'


  },
  sectionHeader: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },

  textStyle: {
    fontWeight: 'bold',
  }

});
